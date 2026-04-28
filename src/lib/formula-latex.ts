// Convert the ASCII formula strings stored in src/lib/formulas.ts into LaTeX
// suitable for KaTeX rendering. Heuristic — handles the common patterns used
// in our networking formulas: chained subscripts (d_end_to_end), fractions,
// Greek letters, comparison operators, sqrt, and standard math keywords.
// For anything we can't safely transform, we leave the substring untouched
// and rely on `renderError`/`errorColor` on the KaTeX components to degrade
// gracefully instead of crashing the page.

const GREEK: Record<string, string> = {
  alpha: '\\alpha',
  beta: '\\beta',
  gamma: '\\gamma',
  delta: '\\delta',
  epsilon: '\\epsilon',
  theta: '\\theta',
  lambda: '\\lambda',
  mu: '\\mu',
  pi: '\\pi',
  rho: '\\rho',
  sigma: '\\sigma',
  tau: '\\tau',
  phi: '\\phi',
  omega: '\\omega',
  Delta: '\\Delta',
  Sigma: '\\Sigma',
  Omega: '\\Omega',
};

const KEYWORDS: Array<[RegExp, string]> = [
  [/\bsqrt\(([^()]+)\)/g, '\\sqrt{$1}'],
  [/\bln\b/g, '\\ln'],
  [/\blog\b/g, '\\log'],
  [/\bmin\b/g, '\\min'],
  [/\bmax\b/g, '\\max'],
  [/\bsum\b/g, '\\sum'],
  [/\bavg\b/g, '\\operatorname{avg}'],
  [/\binfinity\b|\binf\b|∞/gi, '\\infty'],
];

function transformOperatorsAndKeywords(input: string): string {
  let out = input;
  // Comparison operators (do before * to keep <= intact)
  out = out
    .replace(/<=|=</g, ' \\leq ')
    .replace(/>=|=>/g, ' \\geq ')
    .replace(/!=|<>/g, ' \\neq ');
  // Keywords (sqrt, ln, log, min, max, sum, infinity).
  // \b boundaries do NOT trigger across `_`, so `W_max` is safe — `max` here
  // is preceded by `_` (a word char), so \bmax\b will not match it.
  for (const [re, sub] of KEYWORDS) {
    out = out.replace(re, sub);
  }
  // Multiplication
  out = out.replace(/\*/g, ' \\cdot ');
  return out;
}

// Transform CHAINED subscript identifiers like:
//   d_end_to_end           → d_{\text{end\_to\_end}}
//   RTT_est_prev           → RTT_{\text{est\_prev}}
//   W_max                  → W_{\max}            (special: max is a math op)
//   d_2                    → d_{2}
//   H_2O  (rare)           → H_{2\_O}
// Anchored at a word-start so we don't double-match.
function transformChainedSubscripts(input: string): string {
  return input.replace(
    /([A-Za-z][A-Za-z0-9]*)((?:_[A-Za-z0-9]+)+)/g,
    (_full, base: string, chain: string) => {
      const parts = chain.slice(1).split('_'); // drop leading _
      // If the chain is exactly one part AND that part is a known math
      // keyword (max/min/log/ln/sum/avg), render it as a control sequence
      // inside the subscript so `W_max` becomes `W_{\max}`.
      if (parts.length === 1) {
        const p = parts[0];
        if (/^(min|max|log|ln|sum)$/i.test(p)) {
          return `${base}_{\\${p.toLowerCase()}}`;
        }
        if (/^(inf|infinity)$/i.test(p)) {
          return `${base}_{\\infty}`;
        }
        if (/^avg$/i.test(p)) {
          return `${base}_{\\operatorname{avg}}`;
        }
        if (GREEK[p]) {
          return `${base}_{${GREEK[p]}}`;
        }
        if (/^[A-Za-z]+$/.test(p)) {
          return `${base}_{\\text{${p}}}`;
        }
        // Numeric or mixed — render as-is.
        return `${base}_{${p}}`;
      }
      // Multi-part chain: join with literal underscores inside \text{}.
      const allWords = parts.every((p) => /^[A-Za-z]+$/.test(p));
      if (allWords) {
        const inner = parts.join('\\_');
        return `${base}_{\\text{${inner}}}`;
      }
      // Mixed (some numeric/some alpha) — fall back to literal underscore join.
      return `${base}_{${parts.join('\\_')}}`;
    }
  );
}

// Convert simple `a / b` fractions into \frac{a}{b}. Only applied when both
// operands are single tokens (parens, identifiers, or already-built LaTeX
// subscripts like d_{\text{trans}}). Leaves complex expressions alone.
function transformFractions(input: string): string {
  const TOKEN = String.raw`(?:\([^()]+\)|[A-Za-z0-9]+(?:_\{[^{}]*\})?|\\[A-Za-z]+)`;
  const re = new RegExp(`(${TOKEN})\\s*/\\s*(${TOKEN})`, 'g');
  return input.replace(re, (_full, num: string, den: string) => {
    const cleanNum = num.startsWith('(') && num.endsWith(')') ? num.slice(1, -1) : num;
    const cleanDen = den.startsWith('(') && den.endsWith(')') ? den.slice(1, -1) : den;
    return `\\frac{${cleanNum}}{${cleanDen}}`;
  });
}

function transformStandaloneGreek(input: string): string {
  // Replace standalone Greek words. `\b` doesn't fire across `_` so this
  // won't touch words already inside subscript chains. We also skip anything
  // immediately preceded by `\` so we don't double-transform a control
  // sequence (e.g. \alpha).
  return input.replace(/(^|[^\\A-Za-z])([A-Za-z]+)\b/g, (_full, pre: string, word: string) => {
    if (GREEK[word]) return `${pre}${GREEK[word]}`;
    return _full;
  });
}

function collapseWhitespace(input: string): string {
  return input.replace(/[ \t]+/g, ' ').trim();
}

function transformLine(line: string): string {
  let out = line;
  // Order matters:
  // 1. Operators/keywords first (works on raw ASCII tokens).
  out = transformOperatorsAndKeywords(out);
  // 2. Chained subscripts (consumes underscore patterns).
  out = transformChainedSubscripts(out);
  // 3. Greek letters that survived as standalone words.
  out = transformStandaloneGreek(out);
  // 4. Fractions (operates on already-built LaTeX tokens).
  out = transformFractions(out);
  return collapseWhitespace(out);
}

export function asciiToLatex(formula: string): string {
  if (!formula) return '';
  const lines = formula.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) return transformLine(lines[0] || formula);
  return lines.map(transformLine).join(' \\\\ ');
}

// Inline-friendly version for variable symbols (e.g. "d_proc", "L"). Returns
// just the LaTeX fragment (no surrounding $$).
export function symbolToLatex(symbol: string): string {
  if (!symbol) return '';
  let out = symbol.trim();
  out = transformOperatorsAndKeywords(out);
  out = transformChainedSubscripts(out);
  out = transformStandaloneGreek(out);
  return collapseWhitespace(out);
}
