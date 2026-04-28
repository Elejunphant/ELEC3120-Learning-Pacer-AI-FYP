'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Sparkles, X, ArrowRight, Lightbulb, BookOpen, Brain, Network, Globe, Shield, Wifi, Server, Radio, Route, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message } from '@/components/chat-messages';
import { useFloatingDrag } from '@/hooks/use-floating-drag';

// ── Topic suggestion data (bilingual, client-side) ──────────────────────────

const topicKeywords: Record<string, string[]> = {
  tcp: ['tcp', 'transmission control', 'three-way', 'handshake', 'seq', 'ack', 'reliable', 'retransmit', 'window', 'cwnd', 'ssthresh', 'slow start', 'fast retransmit', 'congestion avoidance', 'mss'],
  udp: ['udp', 'user datagram', 'datagram', ' unreliable', 'dns over udp', 'quic', 'rtp', 'voip'],
  http: ['http', 'web', 'request', 'response', 'get ', 'post ', 'header', 'cookie', 'session', 'rest', 'status code', 'mime', 'content-type', 'cache-control', 'url', 'html', 'browser', 'restful'],
  osi: ['osi', 'layer', 'encapsulation', 'decapsulation', 'physical layer', 'data link', 'network layer', 'transport layer', 'session layer', 'presentation layer', 'application layer', 'tcp/ip model', 'protocol stack'],
  congestion: ['congestion', 'cwnd', 'congestion control', 'congestion avoidance', 'aimd', 'slow start', 'fast recovery', 'tahoe', 'reno', 'cubic', 'bbr', 'bottleneck', 'traffic shaping', 'token bucket', 'leaky bucket'],
  ip: ['ip ', 'ip address', 'ipv4', 'ipv6', 'subnet', 'cidr', 'routing table', 'nat', 'dhcp', 'icmp', 'fragment', 'ttl', 'packet forwarding', 'prefix', 'mask'],
  dns: ['dns', 'domain name', 'resolver', 'nslookup', 'record', 'a record', 'cname', 'mx', 'txt', 'tld', ' authoritative', 'recursive', 'top-level domain'],
  routing: ['routing', 'router', 'bgp', 'ospf', 'rip', 'eigrp', 'path vector', 'link state', 'distance vector', 'autonomous system', 'as ', 'gateway', 'forwarding table', 'shortest path', 'bellman-ford', 'dijkstra'],
  security: ['security', 'encrypt', 'decrypt', 'tls', 'ssl', 'certificate', 'firewall', 'vpn', 'aes', 'rsa', 'diffie-hellman', 'key exchange', 'hash', 'sha', 'md5', 'authentication', 'integrity', 'confidentiality', 'certificate authority', 'public key', 'private key', 'symmetric', 'asymmetric'],
  lan: ['lan', 'ethernet', 'switch', 'vlan', 'mac address', 'arp', 'rarp', 'bridge', 'hub', 'csma/cd', 'collision', 'broadcast domain', 'stp', 'trunk'],
  wireless: ['wifi', 'wireless', '802.11', 'wlan', 'access point', 'ssid', 'wpa', 'wep', 'channel', '頻段', 'wired equivalent', 'handoff', 'roaming'],
  socket: ['socket', 'bind', 'listen', 'accept', 'connect', 'select', 'poll', 'epoll', 'api', 'programming', 'client-server', 'peer-to-peer', 'p2p', 'port'],
  multimedia: ['multimedia', 'streaming', 'rtp', 'sip', 'voip', 'codec', 'bandwidth', 'latency', 'jitter', 'qos', 'quality of service'],
};

const topicSuggestions: Record<string, { en: string; zh: string; icon: string }[]> = {
  tcp: [
    { en: 'How does TCP handle packet loss?', zh: 'TCP 如何處理丟包？', icon: 'Network' },
    { en: 'Explain the TCP three-way handshake in detail', zh: '詳細解釋 TCP 三次握手', icon: 'Network' },
    { en: "What's the difference between flow control and congestion control?", zh: '流量控制和擁塞控制有什麼區別？', icon: 'Brain' },
    { en: 'How does TCP Fast Retransmit work?', zh: 'TCP 快速重傳是如何工作的？', icon: 'Lightbulb' },
  ],
  udp: [
    { en: 'When should I use UDP instead of TCP?', zh: '什麼時候應該用 UDP 而不是 TCP？', icon: 'Radio' },
    { en: 'How does UDP handle reliability at the application layer?', zh: 'UDP 如何在應用層處理可靠性？', icon: 'Server' },
    { en: 'What are real-world applications of UDP?', zh: 'UDP 嘅實際應用有邊啲？', icon: 'Globe' },
  ],
  http: [
    { en: 'Compare HTTP/1.1, HTTP/2, and HTTP/3', zh: '比較 HTTP/1.1、HTTP/2 和 HTTP/3', icon: 'Globe' },
    { en: 'How does HTTP caching work?', zh: 'HTTP 緩存是如何工作的？', icon: 'Server' },
    { en: 'Explain HTTP status codes you should know', zh: '解釋你應該瞭解的 HTTP 狀態碼', icon: 'Lightbulb' },
    { en: 'How do Cookies and Sessions differ?', zh: 'Cookie 和 Session 有什麼區別？', icon: 'Shield' },
  ],
  osi: [
    { en: 'Explain the TCP/IP 4-layer model vs OSI 7-layer model', zh: '解釋 TCP/IP 四層模型與 OSI 七層模型', icon: 'Network' },
    { en: 'What happens at each OSI layer?', zh: '每一層發生了什麼？', icon: 'BookOpen' },
    { en: 'What is encapsulation and decapsulation?', zh: '什麼是封裝和解封裝？', icon: 'Brain' },
  ],
  congestion: [
    { en: 'Explain TCP slow start and congestion avoidance', zh: '解釋 TCP 慢啓動和擁塞避免', icon: 'Brain' },
    { en: 'Compare TCP Tahoe, Reno, and Cubic', zh: '比較 TCP Tahoe、Reno 和 Cubic', icon: 'Lightbulb' },
    { en: 'What is AIMD and why does it work?', zh: '什麼是 AIMD？為什麼有效？', icon: 'BookOpen' },
    { en: 'How does BBR congestion control work?', zh: 'BBR 擁塞控制是如何工作的？', icon: 'Lightbulb' },
  ],
  ip: [
    { en: 'How do I calculate subnet masks?', zh: '如何計算子網遮罩？', icon: 'Network' },
    { en: 'Explain NAT and why it was invented', zh: '解釋 NAT 及其發明原因', icon: 'Globe' },
    { en: 'What is the difference between IPv4 and IPv6?', zh: 'IPv4 和 IPv6 有什麼區別？', icon: 'Route' },
    { en: 'How does DHCP assign IP addresses?', zh: 'DHCP 如何分配 IP 地址？', icon: 'Server' },
  ],
  dns: [
    { en: 'How does DNS resolution work step by step?', zh: 'DNS 解析是如何逐步工作的？', icon: 'Globe' },
    { en: 'What are DNS record types (A, CNAME, MX, TXT)?', zh: 'DNS 紀錄類型有邊啲？', icon: 'BookOpen' },
    { en: 'Explain recursive vs iterative DNS queries', zh: '解釋遞歸查詢和迭代查詢', icon: 'Brain' },
  ],
  routing: [
    { en: 'Compare distance vector and link state routing', zh: '比較距離向量和鏈路狀態路由', icon: 'Route' },
    { en: 'How does BGP work between autonomous systems?', zh: 'BGP 在自治系統之間如何工作？', icon: 'Network' },
    { en: 'Explain OSPF areas and LSA types', zh: '解釋 OSPF 區域和 LSA 類型', icon: 'Lightbulb' },
    { en: 'How does the Bellman-Ford algorithm work in routing?', zh: 'Bellman-Ford 算法在路由中如何工作？', icon: 'Brain' },
  ],
  security: [
    { en: 'How does TLS/SSL handshake work?', zh: 'TLS/SSL 握手是如何工作的？', icon: 'Shield' },
    { en: 'Compare symmetric and asymmetric encryption', zh: '比較對稱加密同非對稱加密', icon: 'Shield' },
    { en: 'How does Diffie-Hellman key exchange work?', zh: 'Diffie-Hellman 密鑰交換如何工作？', icon: 'Lightbulb' },
    { en: 'What is a firewall and how does it filter traffic?', zh: '什麼是防火牆？它如何過濾流量？', icon: 'Shield' },
  ],
  lan: [
    { en: 'How does ARP resolve IP to MAC addresses?', zh: 'ARP 如何將 IP 解析為 MAC 地址？', icon: 'Wifi' },
    { en: 'Explain VLANs and why they are useful', zh: '解釋 VLAN 及其用途', icon: 'Network' },
    { en: 'What is CSMA/CD and when is it used?', zh: '什麼是 CSMA/CD？何時使用？', icon: 'BookOpen' },
    { en: 'How does Spanning Tree Protocol prevent loops?', zh: '生成樹協定如何防止環路？', icon: 'Brain' },
  ],
  wireless: [
    { en: 'How does WiFi handoff/roaming work?', zh: 'WiFi 切換/漫遊是如何工作的？', icon: 'Wifi' },
    { en: 'Compare 802.11a/b/g/n/ac/ax standards', zh: '比較 802.11 各標準', icon: 'Radio' },
    { en: 'Explain WPA2 vs WPA3 security', zh: '解釋 WPA2 和 WPA3 安全性', icon: 'Shield' },
  ],
  socket: [
    { en: 'Explain TCP socket programming (bind, listen, accept)', zh: '解釋 TCP Socket 編程', icon: 'Server' },
    { en: 'What is the difference between select, poll, and epoll?', zh: 'select、poll 和 epoll 有什麼區別？', icon: 'Brain' },
    { en: 'How does a client-server connection establish?', zh: '客户端-服務器連接如何建立？', icon: 'Network' },
  ],
  multimedia: [
    { en: 'How does RTP support real-time streaming?', zh: 'RTP 如何支援實時串流？', icon: 'Radio' },
    { en: 'Explain QoS mechanisms for VoIP', zh: '解釋 VoIP 的 QoS 機制', icon: 'Brain' },
    { en: 'What causes jitter and how can it be reduced?', zh: '什麼導致抖動？如何減少？', icon: 'Lightbulb' },
  ],
};

const generalSuggestions: { en: string; zh: string; icon: string }[] = [
  { en: 'Give me a practice question on this topic', zh: '畀我一條關於呢個主題嘅練習題', icon: 'HelpCircle' },
  { en: 'What are common exam questions about this?', zh: '關於呢個嘅常見考試題有邊啲？', icon: 'BookOpen' },
  { en: 'Explain with a real-world example', zh: '用一個實際例子解釋', icon: 'Lightbulb' },
  { en: 'What should I review before the exam?', zh: '考試前我應該複習什麼？', icon: 'Brain' },
];

// ── Icon mapping ────────────────────────────────────────────────────────────

const iconMap: Record<string, React.ElementType> = {
  Lightbulb,
  BookOpen,
  Brain,
  Network,
  Globe,
  Shield,
  Wifi,
  Server,
  Radio,
  Route,
  HelpCircle,
};

function SuggestionIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] || Lightbulb;
  return <Icon className={className} />;
}

// ── Topic detection from recent messages ───────────────────────────────────

function detectTopics(messages: Message[]): string[] {
  // Take last 5 messages
  const recent = messages.slice(-5);
  const combinedText = recent
    .map((m) => m.content.toLowerCase())
    .join(' ');

  // Score each topic
  const scores: Record<string, number> = {};
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    let score = 0;
    for (const kw of keywords) {
      const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = combinedText.match(regex);
      if (matches) {
        score += matches.length;
      }
    }
    if (score > 0) {
      scores[topic] = score;
    }
  }

  // Sort by score and return top topics
  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([topic]) => topic);
}

function getSuggestionsForTopics(topics: string[]): { en: string; zh: string; icon: string }[] {
  if (topics.length === 0) return generalSuggestions;

  // Collect suggestions from detected topics, avoiding duplicates
  const seen = new Set<string>();
  const result: { en: string; zh: string; icon: string }[] = [];

  for (const topic of topics) {
    const suggestions = topicSuggestions[topic];
    if (!suggestions) continue;
    for (const s of suggestions) {
      const key = s.en;
      if (!seen.has(key) && result.length < 4) {
        seen.add(key);
        result.push(s);
      }
    }
    if (result.length >= 4) break;
  }

  // If we have fewer than 3, fill with general suggestions
  if (result.length < 3) {
    for (const gs of generalSuggestions) {
      if (!seen.has(gs.en) && result.length < 4) {
        result.push(gs);
      }
    }
  }

  return result.slice(0, 4);
}

// ── Component ───────────────────────────────────────────────────────────────

interface AISuggestionsProps {
  messages: Message[];
  language: 'en' | 'zh';
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export function AISuggestions({ messages, language, onSendMessage, isLoading = false }: AISuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // ── Draggable floating widget (framer-motion) ────────────────
  const { x, y, hydrated, isDragging, wasDragged, containerRef, dragProps } = useFloatingDrag({
    storageKey: 'lp-ai-suggestions-position',
    defaultPosition: () => ({ x: 24, y: Math.max(0, window.innerHeight - 200) }),
  });

  // Detect topics from recent messages
  const detectedTopics = useMemo(() => {
    if (messages.length === 0 || isLoading) return [];
    return detectTopics(messages);
  }, [messages, isLoading]);

  const suggestions = useMemo(() => {
    if (messages.length === 0 || isLoading) return [];
    return getSuggestionsForTopics(detectedTopics);
  }, [messages, isLoading, detectedTopics]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (!target.closest('[data-ai-suggestions-toggle]')) {
          setIsOpen(false);
        }
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Don't show if no messages, loading, dismissed, or not hydrated
  const shouldShow = messages.length > 0 && !isLoading && !dismissed && suggestions.length > 0 && hydrated;

  const handleDismiss = () => {
    setDismissed(true);
    setIsOpen(false);
  };

  const handleSuggestionClick = (suggestion: { en: string; zh: string }) => {
    onSendMessage(language === 'en' ? suggestion.en : suggestion.zh);
    setIsOpen(false);
  };

  const detectedTopicLabels = useMemo(() => {
    const labels: Record<string, { en: string; zh: string }> = {
      tcp: { en: 'TCP', zh: 'TCP' },
      udp: { en: 'UDP', zh: 'UDP' },
      http: { en: 'HTTP', zh: 'HTTP' },
      osi: { en: 'OSI Model', zh: 'OSI 模型' },
      congestion: { en: 'Congestion Control', zh: '擁塞控制' },
      ip: { en: 'IP & Subnetting', zh: 'IP 與子網' },
      dns: { en: 'DNS', zh: 'DNS' },
      routing: { en: 'Routing', zh: '路由' },
      security: { en: 'Network Security', zh: '網絡安全' },
      lan: { en: 'LAN & Ethernet', zh: '局域網與以太網' },
      wireless: { en: 'Wireless Networks', zh: '無線網絡' },
      socket: { en: 'Socket Programming', zh: 'Socket 編程' },
      multimedia: { en: 'Multimedia', zh: '多媒體' },
    };
    return detectedTopics.map((t) => labels[t] || { en: t, zh: t });
  }, [detectedTopics]);

  if (!shouldShow) return null;

  return (
    <motion.div
      ref={containerRef}
      {...dragProps}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        x,
        y,
        zIndex: 40,
        touchAction: 'none',
      }}
      className="flex flex-col items-start gap-2"
    >
      {/* Floating button — clicking toggles, dragging the wrapper moves it */}
      <motion.button
        data-ai-suggestions-toggle
        type="button"
        onClick={() => {
          if (wasDragged.current) return;
          setIsOpen((prev) => !prev);
        }}
        className={`relative flex items-center justify-center h-12 w-12 rounded-full shadow-lg transition-all duration-200 select-none ${
          isDragging
            ? 'shadow-2xl cursor-grabbing'
            : isOpen
              ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 cursor-grab'
              : 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 dark:from-emerald-500 dark:to-teal-600 dark:hover:from-emerald-600 dark:hover:to-teal-700 text-white cursor-grab'
        }`}
        aria-label={language === 'en' ? 'AI Study Suggestions' : 'AI 學習建議'}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Sparkles className="h-5 w-5" />
        )}
        {/* Badge showing suggestion count */}
        {suggestions.length > 0 && !isOpen && (
          <motion.span
            className="absolute -top-1 -right-1 flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-amber-500 text-white text-[11px] font-bold leading-none"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            {suggestions.length}
          </motion.span>
        )}
      </motion.button>

      {/* Expandable panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-[340px] max-w-[calc(100vw-3rem)] max-h-[420px] rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden relative"
          >
            {/* Gradient top border */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 rounded-t-xl" />

            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200/60 dark:border-gray-700/60">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {language === 'en' ? 'AI Study Buddy' : 'AI 學習夥伴'}
                  </span>
                  {detectedTopicLabels.length > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      {detectedTopicLabels.slice(0, 3).map((t, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                        >
                          {language === 'en' ? t.en : t.zh}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="flex items-center justify-center h-6 w-6 rounded-md text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
                aria-label={language === 'en' ? 'Dismiss suggestions' : '關閉建議'}
                title={language === 'en' ? 'Dismiss' : '關閉'}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Subtitle */}
            <div className="shrink-0 px-4 pt-3 pb-1">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {language === 'en'
                  ? 'Based on your conversation, try asking:'
                  : '根據你的對話，試試問：'}
              </p>
            </div>

            {/* Suggestion cards */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2">
              <div className="space-y-1.5">
                {suggestions.map((s, i) => (
                  <motion.button
                    key={`${s.en}-${i}`}
                    onClick={() => handleSuggestionClick(s)}
                    className="w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left group/card hover:bg-gray-50 dark:hover:bg-gray-800/60 border border-transparent hover:border-gray-200/80 dark:hover:border-gray-700/50 transition-all duration-200"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: i * 0.04, ease: 'easeOut' }}
                  >
                    <div className="shrink-0 mt-0.5 h-7 w-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover/card:bg-emerald-50 dark:group-hover/card:bg-emerald-900/30 transition-colors duration-200">
                      <SuggestionIcon
                        name={s.icon}
                        className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 group-hover/card:text-emerald-600 dark:group-hover/card:text-emerald-400 transition-colors duration-200"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] leading-relaxed text-gray-700 dark:text-gray-300 group-hover/card:text-gray-900 dark:group-hover/card:text-gray-100 transition-colors duration-200">
                        {language === 'en' ? s.en : s.zh}
                      </p>
                    </div>
                    <ArrowRight className="shrink-0 mt-1.5 h-3.5 w-3.5 text-gray-300 dark:text-gray-600 opacity-0 -translate-x-1 group-hover/card:opacity-100 group-hover/card:translate-x-0 transition-all duration-200 text-emerald-500" />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-4 py-2.5 border-t border-gray-100 dark:border-gray-800/60">
              <p className="text-[10px] text-gray-300 dark:text-gray-600 text-center">
                {language === 'en'
                  ? '✨ Powered by AI context analysis'
                  : '✨ 由 AI 上下文分析驅動'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
