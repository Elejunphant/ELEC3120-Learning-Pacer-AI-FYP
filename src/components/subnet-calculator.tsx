'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Copy,
  Check,
  Calculator,
  Globe,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface SubnetCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'zh';
}

const COMMON_PREFIXES = [8, 12, 16, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];

function ipToInt(ip: string): number {
  const parts = ip.split('.').map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function intToIp(n: number): string {
  return [
    (n >>> 24) & 255,
    (n >>> 16) & 255,
    (n >>> 8) & 255,
    n & 255,
  ].join('.');
}

function isValidIp(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    const n = Number(p);
    return /^\d+$/.test(p) && n >= 0 && n <= 255;
  });
}

function getIpClass(firstOctet: number): string {
  if (firstOctet >= 1 && firstOctet <= 126) return 'A';
  if (firstOctet >= 128 && firstOctet <= 191) return 'B';
  if (firstOctet >= 192 && firstOctet <= 223) return 'C';
  if (firstOctet >= 224 && firstOctet <= 239) return 'D';
  return 'E';
}

function getIpClassZh(ipClass: string): string {
  const map: Record<string, string> = { A: 'A 類', B: 'B 類', C: 'C 類', D: 'D 類', E: 'E 類' };
  return map[ipClass] || ipClass;
}

function prefixToMask(prefix: number): string {
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  return intToIp(mask);
}

function prefixToBinary(prefix: number): string {
  const full = '1'.repeat(prefix) + '0'.repeat(32 - prefix);
  return `${full.slice(0, 8)}.${full.slice(8, 16)}.${full.slice(16, 24)}.${full.slice(24, 32)}`;
}

function toWildcardMask(subnetMask: string): string {
  const parts = subnetMask.split('.').map(Number);
  return parts.map((p) => 255 - p).join('.');
}

interface SubnetResult {
  networkAddress: string;
  broadcastAddress: string;
  firstUsable: string;
  lastUsable: string;
  totalUsableHosts: number;
  subnetMask: string;
  binaryMask: string;
  wildcardMask: string;
  ipClass: string;
  ipClassZh: string;
}

function calculateSubnet(ip: string, prefix: number): SubnetResult | null {
  if (!isValidIp(ip) || prefix < 0 || prefix > 32) return null;

  const ipInt = ipToInt(ip);
  const maskInt = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | (~maskInt >>> 0)) >>> 0;

  const firstOctet = (networkInt >>> 24) & 255;
  const ipClass = getIpClass(firstOctet);

  // /31 and /32 have special host rules
  const totalHosts = Math.pow(2, 32 - prefix);
  let totalUsableHosts: number;
  let firstUsable: string;
  let lastUsable: string;

  if (prefix >= 31) {
    totalUsableHosts = prefix === 32 ? 1 : 2;
    firstUsable = intToIp(networkInt);
    lastUsable = prefix === 32 ? intToIp(networkInt) : intToIp(broadcastInt);
  } else {
    totalUsableHosts = totalHosts - 2;
    firstUsable = intToIp(networkInt + 1);
    lastUsable = intToIp(broadcastInt - 1);
  }

  const subnetMask = prefixToMask(prefix);

  return {
    networkAddress: intToIp(networkInt),
    broadcastAddress: intToIp(broadcastInt),
    firstUsable,
    lastUsable,
    totalUsableHosts,
    subnetMask,
    binaryMask: prefixToBinary(prefix),
    wildcardMask: toWildcardMask(subnetMask),
    ipClass,
    ipClassZh: getIpClassZh(ipClass),
  };
}

function CopyButton({ value, language }: { value: string; language: 'en' | 'zh' }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      toast({
        description: language === 'en' ? 'Copied!' : '已複製！',
      });
      setTimeout(() => setCopied(false), 1500);
    });
  }, [value, language, toast]);

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 h-7 w-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
      aria-label={language === 'en' ? 'Copy' : '複製'}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

function ResultCard({
  label,
  labelZh,
  value,
  language,
  highlight,
}: {
  label: string;
  labelZh: string;
  value: string | number;
  language: 'en' | 'zh';
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3.5 transition-all duration-200 ${
        highlight
          ? 'border-emerald-200 dark:border-emerald-700/60 bg-emerald-50/50 dark:bg-emerald-950/20'
          : 'border-gray-200 dark:border-gray-700/60 bg-white dark:bg-[#2f2f2f]'
      }`}
    >
      <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">
        {language === 'en' ? label : labelZh}
      </p>
      <div className="flex items-center gap-2">
        <p className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100 flex-1 break-all">
          {value}
        </p>
        <CopyButton value={String(value)} language={language} />
      </div>
    </div>
  );
}

function SubnetVisualMap({ prefix }: { prefix: number }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-[#2f2f2f] p-4">
      <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-3">
        Subnet Map / 子網圖
      </p>
      <div className="flex gap-1 items-center">
        {/* Subnet portion */}
        <div
          className="h-8 rounded-l-md bg-emerald-500 flex items-center justify-center transition-all duration-300"
          style={{ width: `${Math.max((prefix / 32) * 100, 2)}%` }}
        >
          {prefix >= 6 && (
            <span className="text-[10px] font-bold text-white px-1">
              /{prefix}
            </span>
          )}
        </div>
        {/* Host portion */}
        <div
          className="h-8 rounded-r-md bg-gray-200 dark:bg-gray-600 flex items-center justify-center transition-all duration-300"
          style={{ width: `${Math.max(((32 - prefix) / 32) * 100, 2)}%` }}
        >
          {32 - prefix >= 4 && (
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-300 px-1">
              {32 - prefix} bits
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          <span className="text-[10px] text-gray-500 dark:text-gray-400">
            Network ({prefix} bits)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-gray-200 dark:bg-gray-600" />
          <span className="text-[10px] text-gray-500 dark:text-gray-400">
            Host ({32 - prefix} bits)
          </span>
        </div>
      </div>
    </div>
  );
}

export function SubnetCalculator({ isOpen, onClose, language }: SubnetCalculatorProps) {
  const [inputMode, setInputMode] = useState<'separate' | 'cidr'>('cidr');
  const [ipAddress, setIpAddress] = useState('');
  const [prefix, setPrefix] = useState<string>('24');
  const [cidrInput, setCidrInput] = useState('');

  const effectiveIp = inputMode === 'cidr' ? cidrInput.split('/')[0] || '' : ipAddress;
  const effectivePrefix = inputMode === 'cidr'
    ? parseInt(cidrInput.split('/')[1] || '', 10)
    : parseInt(prefix, 10);

  const result = useMemo(() => {
    if (!effectiveIp || isNaN(effectivePrefix)) return null;
    return calculateSubnet(effectiveIp.trim(), effectivePrefix);
  }, [effectiveIp, effectivePrefix]);

  const resultFields = useMemo(() => {
    if (!result) return [];
    return [
      { key: 'network', label: 'Network Address', labelZh: '網絡地址', value: result.networkAddress, highlight: true },
      { key: 'broadcast', label: 'Broadcast Address', labelZh: '廣播地址', value: result.broadcastAddress, highlight: true },
      { key: 'first', label: 'First Usable Host', labelZh: '第一個可用主機', value: result.firstUsable },
      { key: 'last', label: 'Last Usable Host', labelZh: '最後一個可用主機', value: result.lastUsable },
      { key: 'hosts', label: 'Usable Hosts', labelZh: '可用主機數', value: result.totalUsableHosts.toLocaleString(), highlight: true },
      { key: 'mask', label: 'Subnet Mask', labelZh: '子網遮罩', value: result.subnetMask },
      { key: 'binary', label: 'Binary Mask', labelZh: '二進制遮罩', value: result.binaryMask },
      { key: 'wildcard', label: 'Wildcard Mask', labelZh: '通配符遮罩', value: result.wildcardMask },
      { key: 'class', label: 'IP Class', labelZh: 'IP 類別', value: `${result.ipClass} (${result.ipClassZh})` },
    ];
  }, [result]);

  const handleCidrChange = useCallback((val: string) => {
    setCidrInput(val);
    // Auto-parse CIDR to sync separate fields
    if (val.includes('/')) {
      const [ip, pfx] = val.split('/');
      setIpAddress(ip);
      setPrefix(pfx);
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-0 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <Calculator className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {language === 'en' ? 'Subnet Calculator' : '子網計算器'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 px-5 pb-5 overflow-y-auto overscroll-contain custom-scrollbar">
          <div className="space-y-4 pt-4">
            {/* Input mode toggle */}
            <div className="flex gap-1.5">
              <button
                onClick={() => setInputMode('cidr')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 touch-manipulation ${
                  inputMode === 'cidr'
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500 shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {language === 'en' ? 'CIDR Notation' : 'CIDR 表示法'}
              </button>
              <button
                onClick={() => setInputMode('separate')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 touch-manipulation ${
                  inputMode === 'separate'
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500 shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {language === 'en' ? 'IP + Prefix' : 'IP + 前綴'}
              </button>
            </div>

            {/* CIDR input */}
            {inputMode === 'cidr' && (
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1.5 block">
                  {language === 'en' ? 'CIDR Notation' : 'CIDR 表示法'}
                </label>
                <div className="relative">
                  <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={cidrInput}
                    onChange={(e) => handleCidrChange(e.target.value)}
                    placeholder="e.g., 192.168.1.0/24"
                    className="pl-9 h-10 text-sm font-mono bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>
            )}

            {/* Separate inputs */}
            {inputMode === 'separate' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1.5 block">
                    {language === 'en' ? 'IP Address' : 'IP 地址'}
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={ipAddress}
                      onChange={(e) => setIpAddress(e.target.value)}
                      placeholder="e.g., 192.168.1.0"
                      className="pl-9 h-10 text-sm font-mono bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1.5 block">
                    {language === 'en' ? 'Subnet Mask (Prefix Length)' : '子網遮罩（前綴長度）'}
                  </label>
                  <select
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    className="w-full h-10 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  >
                    {COMMON_PREFIXES.map((p) => (
                      <option key={p} value={p}>
                        /{p} ({prefixToMask(p)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Error state */}
            {effectiveIp && !isNaN(effectivePrefix) && !result && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 p-3">
                <p className="text-xs text-red-600 dark:text-red-400">
                  {language === 'en'
                    ? 'Invalid IP address. Please enter a valid IPv4 address (e.g., 192.168.1.0).'
                    : '無效的 IP 地址。請輸入有效的 IPv4 地址（例如 192.168.1.0）。'}
                </p>
              </div>
            )}

            {/* Empty state */}
            {!effectiveIp && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                  <Calculator className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {language === 'en'
                    ? 'Enter an IP address and prefix to calculate subnet details.'
                    : '輸入 IP 地址和前綴以計算子網詳情。'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {language === 'en'
                    ? 'Try: 192.168.1.0/24 or 10.0.0.0/8'
                    : '試試：192.168.1.0/24 或 10.0.0.0/8'}
                </p>
              </div>
            )}

            {/* Results */}
            {result && (
              <>
                {/* Visual Subnet Map */}
                <SubnetVisualMap prefix={effectivePrefix} />

                {/* Results grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {resultFields.map((field) => (
                    <ResultCard
                      key={field.key}
                      label={field.label}
                      labelZh={field.labelZh}
                      value={field.value}
                      language={language}
                      highlight={field.highlight}
                    />
                  ))}
                </div>

                {/* Formula note */}
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/40 p-3">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">
                    {language === 'en' ? 'Formula' : '公式'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                    Usable Hosts = 2<sup>32-{effectivePrefix}</sup> - 2 = 2<sup>{32 - effectivePrefix}</sup> - 2 = <span className="font-bold text-emerald-600 dark:text-emerald-400">{result.totalUsableHosts.toLocaleString()}</span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
