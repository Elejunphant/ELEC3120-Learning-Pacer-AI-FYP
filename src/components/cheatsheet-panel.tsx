'use client';

import React, { useState, useMemo } from 'react';
import { FileText, Copy, Check, Search, Calculator, Hash, Terminal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface CheatsheetPanelProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'zh';
}

// --- Data ---
interface FormulaItem {
  id: string;
  name: { en: string; zh: string };
  formula: string;
  description: { en: string; zh: string };
}

interface PortItem {
  id: string;
  port: number;
  protocol: string;
  description: { en: string; zh: string };
  transport: string;
}

interface CommandItem {
  id: string;
  command: string;
  description: { en: string; zh: string };
  example: { en: string; zh: string };
}

const FORMULAS: FormulaItem[] = [
  {
    id: 'f1',
    name: { en: 'Throughput', zh: '吞吐量' },
    formula: 'Throughput = File Size / RTT',
    description: { en: 'Basic throughput calculation', zh: '基本吞吐量計算' },
  },
  {
    id: 'f2',
    name: { en: 'End-to-End Delay', zh: '端到端延遲' },
    formula: 'd_end-to-end = N * (L/R)',
    description: { en: 'N packets, L bits each, R bps link rate', zh: 'N個分組，每個L比特，鏈路速率R bps' },
  },
  {
    id: 'f3',
    name: { en: 'Queuing Delay', zh: '排隊延遲' },
    formula: 'd_queue = L * a / R  (where a = packet arrival rate)',
    description: { en: 'Average queuing delay', zh: '平均排隊延遲' },
  },
  {
    id: 'f4',
    name: { en: 'Link Utilization', zh: '鏈路利用率' },
    formula: 'Utilization = (a * L) / R',
    description: { en: 'Link utilization with traffic intensity', zh: '流量強度下的鏈路利用率' },
  },
  {
    id: 'f5',
    name: { en: 'RTT (Round Trip Time)', zh: '往返時間' },
    formula: 'RTT = d_prop + d_trans + d_queue + d_proc',
    description: { en: 'Propagation + Transmission + Queuing + Processing', zh: '傳播+傳輸+排隊+處理' },
  },
  {
    id: 'f6',
    name: { en: 'Propagation Delay', zh: '傳播延遲' },
    formula: 'd_prop = Distance / Propagation Speed',
    description: { en: 'Speed ≈ 3×10⁸ m/s in fiber', zh: '光纖中速度約3×10⁸ m/s' },
  },
  {
    id: 'f7',
    name: { en: 'Transmission Delay', zh: '傳輸延遲' },
    formula: 'd_trans = L / R',
    description: { en: 'L = packet length, R = link rate (bps)', zh: 'L=分組長度，R=鏈路速率(bps)' },
  },
  {
    id: 'f8',
    name: { en: 'TCP cwnd (Slow Start)', zh: 'TCP擁塞窗口(慢啓動)' },
    formula: 'cwnd doubles each RTT',
    description: { en: 'Exponential growth until ssthresh', zh: '指數增長直到慢啓動閾值' },
  },
  {
    id: 'f9',
    name: { en: 'TCP Timeout (RTO)', zh: 'TCP逾時' },
    formula: 'RTO = EstimatedRTT + 4 * DevRTT',
    description: { en: 'Recommended TCP timeout value', zh: '推薦的TCP逾時值' },
  },
  {
    id: 'f10',
    name: { en: 'TCP Window Size', zh: 'TCP窗口大小' },
    formula: 'Bandwidth-Delay Product = BW × RTT',
    description: { en: 'Optimal window for full pipe utilization', zh: '充分利用鏈路的最佳窗口大小' },
  },
  {
    id: 'f11',
    name: { en: 'Subnet Hosts', zh: '子網主機數' },
    formula: 'Hosts = 2^(32-n) - 2',
    description: { en: 'n = prefix length, subtract network & broadcast', zh: 'n=前綴長度，減去網絡地址和廣播地址' },
  },
  {
    id: 'f12',
    name: { en: 'Subnet Count', zh: '子網數量' },
    formula: 'Subnets = 2^s  (s = borrowed bits)',
    description: { en: 'Number of subnets when borrowing s bits', zh: '借s位時可創建的子網數' },
  },
  {
    id: 'f13',
    name: { en: 'Ethernet Efficiency', zh: '以太網效率' },
    formula: 'Efficiency = 1 / (1 + 5 * d_prop / d_trans)',
    description: { en: 'CSMA/CD efficiency formula', zh: 'CSMA/CD效率公式' },
  },
  {
    id: 'f14',
    name: { en: 'HTTP Response Time (Parallel)', zh: 'HTTP響應時間(並行)' },
    formula: 'T = 2RTT + RTT + FileSize/BW',
    description: { en: '2RTT TCP + 1RTT HTTP + transfer', zh: '2RTT TCP + 1RTT HTTP + 傳輸' },
  },
  {
    id: 'f15',
    name: { en: 'Mathis Equation (TCP Throughput)', zh: 'Mathis公式(TCP吞吐量)' },
    formula: 'BW < 1.22 × MSS / (RTT × √p)',
    description: { en: 'Max throughput vs loss prob p', zh: '最大吞吐量 vs 丟包概率p' },
  },
  {
    id: 'f16',
    name: { en: 'CUBIC Window Growth', zh: 'CUBIC窗口增長' },
    formula: 'W(t) = C×(t-K)³ + W_max',
    description: { en: 'C=0.4, K=3·W_max·β/C, β=0.2', zh: 'C=0.4, K=3·W_max·β/C, β=0.2' },
  },
  {
    id: 'f17',
    name: { en: 'TCP Avg Throughput (Sawtooth)', zh: 'TCP平均吞吐量(鋸齒)' },
    formula: 'Avg tput = (3/4) × W / RTT',
    description: { en: 'W = window at loss, avg window = 3W/4', zh: 'W=丟包時窗口, 平均窗口=3W/4' },
  },
  {
    id: 'f18',
    name: { en: "Jain's Fairness Index", zh: 'Jain公平性指數' },
    formula: 'F(x) = (Σxi)² / (n × Σxi²)',
    description: { en: 'F=1 is fair, F→0 is unfair', zh: 'F=1是公平的, F→0是不公平的' },
  },
  {
    id: 'f19',
    name: { en: 'Max-Min Fairness', zh: '最大最小公平性' },
    formula: 'ai = min(f, ri), Σ(ai) = C',
    description: { en: 'Water filling: pour equally until demand met', zh: '注水算法: 等量注入直到需求滿足' },
  },
  {
    id: 'f20',
    name: { en: 'RTT Unfairness Share', zh: 'RTT不公平性份額' },
    formula: 'Shorter RTT → MORE bandwidth (∝ 1/RTT)',
    description: { en: '10ms RTT gets only 1/6 vs 50ms RTT', zh: '10ms RTT僅獲得50ms RTT的1/6' },
  },
  {
    id: 'f21',
    name: { en: 'Fair Queueing (FQ)', zh: '公平隊列(FQ)' },
    formula: 'F_q,i = S_q,i + p_q,i  (serve min F first)',
    description: { en: 'Virtual finish time for packet scheduling', zh: '數據包調度的虛擬完成時間' },
  },
 {
    id: 'f22',
    name: { en: 'WFQ Weighted Fair Queueing', zh: 'WFQ加權公平隊列' },
    formula: 'Fq,i = Sq,i + pq,i × (Σwi / wq)',
    description: { en: 'Higher weight = more bandwidth share', zh: '更高權重 = 更多帶寬份額' },
  },
  {
    id: 'f23',
    name: { en: 'Token Bucket', zh: '令牌桶' },
    formula: 'Avg rate ≤ r bits/sec,  Burst ≤ b bits',
    description: { en: 'Rate r, burst capacity b', zh: '速率r, 突發容量b' },
  },
  {
    id: 'f24',
    name: { en: 'Network Calculus: Queue Drain', zh: '網絡微積分:隊列排空' },
    formula: 't_drain = burst / (service_rate - arrival_rate)',
    description: { en: 'Set A(t)=S(t) to solve for t', zh: '設A(t)=S(t)來求解t' },
  },
];

const PORTS: PortItem[] = [
  { id: 'p1', port: 20, protocol: 'FTP Data', description: { en: 'File Transfer Protocol - Data', zh: '檔案傳輸協定 - 數據' }, transport: 'TCP' },
  { id: 'p2', port: 21, protocol: 'FTP Control', description: { en: 'File Transfer Protocol - Control', zh: '檔案傳輸協定 - 控制' }, transport: 'TCP' },
  { id: 'p3', port: 22, protocol: 'SSH', description: { en: 'Secure Shell', zh: '安全外殼協定' }, transport: 'TCP' },
  { id: 'p4', port: 23, protocol: 'Telnet', description: { en: 'Telnet remote login', zh: '遠程登錄協定' }, transport: 'TCP' },
  { id: 'p5', port: 25, protocol: 'SMTP', description: { en: 'Simple Mail Transfer Protocol', zh: '簡單郵件傳輸協定' }, transport: 'TCP' },
  { id: 'p6', port: 53, protocol: 'DNS', description: { en: 'Domain Name System', zh: '域名系統' }, transport: 'TCP/UDP' },
  { id: 'p7', port: 67, protocol: 'DHCP Server', description: { en: 'Dynamic Host Config (Server)', zh: '動態主機配置(服務端)' }, transport: 'UDP' },
  { id: 'p8', port: 68, protocol: 'DHCP Client', description: { en: 'Dynamic Host Config (Client)', zh: '動態主機配置(客户端)' }, transport: 'UDP' },
  { id: 'p9', port: 69, protocol: 'TFTP', description: { en: 'Trivial File Transfer Protocol', zh: '簡單檔案傳輸協定' }, transport: 'UDP' },
  { id: 'p10', port: 80, protocol: 'HTTP', description: { en: 'Hypertext Transfer Protocol', zh: '超文本傳輸協定' }, transport: 'TCP' },
  { id: 'p11', port: 110, protocol: 'POP3', description: { en: 'Post Office Protocol v3', zh: '郵局協定v3' }, transport: 'TCP' },
  { id: 'p12', port: 143, protocol: 'IMAP', description: { en: 'Internet Message Access Protocol', zh: '網際網路訊息存取協定' }, transport: 'TCP' },
  { id: 'p13', port: 161, protocol: 'SNMP', description: { en: 'Simple Network Management Protocol', zh: '簡單網絡管理協定' }, transport: 'UDP' },
  { id: 'p14', port: 443, protocol: 'HTTPS', description: { en: 'HTTP over TLS/SSL', zh: 'TLS/SSL加密的HTTP' }, transport: 'TCP' },
  { id: 'p15', port: 993, protocol: 'IMAPS', description: { en: 'IMAP over SSL', zh: 'SSL加密的IMAP' }, transport: 'TCP' },
  { id: 'p16', port: 995, protocol: 'POP3S', description: { en: 'POP3 over SSL', zh: 'SSL加密的POP3' }, transport: 'TCP' },
  { id: 'p17', port: 3306, protocol: 'MySQL', description: { en: 'MySQL database', zh: 'MySQL數據庫' }, transport: 'TCP' },
  { id: 'p18', port: 5432, protocol: 'PostgreSQL', description: { en: 'PostgreSQL database', zh: 'PostgreSQL數據庫' }, transport: 'TCP' },
  { id: 'p19', port: 8080, protocol: 'HTTP Alt', description: { en: 'Alternative HTTP', zh: '備用HTTP端口' }, transport: 'TCP' },
  { id: 'p20', port: 8443, protocol: 'HTTPS Alt', description: { en: 'Alternative HTTPS', zh: '備用HTTPS端口' }, transport: 'TCP' },
];

const COMMANDS: CommandItem[] = [
  {
    id: 'c1',
    command: 'ping',
    description: { en: 'Test network connectivity', zh: '測試網絡連通性' },
    example: { en: 'ping 8.8.8.8', zh: 'ping 8.8.8.8' },
  },
  {
    id: 'c2',
    command: 'traceroute',
    description: { en: 'Trace packet route to destination', zh: '跟蹤到目的地的數據包路由' },
    example: { en: 'traceroute google.com', zh: 'traceroute google.com' },
  },
  {
    id: 'c3',
    command: 'ifconfig',
    description: { en: 'View/configure network interfaces', zh: '查看/配置網絡接口' },
    example: { en: 'ifconfig eth0', zh: 'ifconfig eth0' },
  },
  {
    id: 'c4',
    command: 'netstat',
    description: { en: 'Display network connections & stats', zh: '顯示網絡連接和統計' },
    example: { en: 'netstat -tuln', zh: 'netstat -tuln' },
  },
  {
    id: 'c5',
    command: 'ss',
    description: { en: 'Socket statistics (modern netstat)', zh: '套接字統計(現代netstat)' },
    example: { en: 'ss -tuln', zh: 'ss -tuln' },
  },
  {
    id: 'c6',
    command: 'nslookup',
    description: { en: 'Query DNS records', zh: '查詢DNS紀錄' },
    example: { en: 'nslookup example.com', zh: 'nslookup example.com' },
  },
  {
    id: 'c7',
    command: 'dig',
    description: { en: 'DNS lookup tool (detailed)', zh: 'DNS查詢工具(詳細)' },
    example: { en: 'dig example.com A', zh: 'dig example.com A' },
  },
  {
    id: 'c8',
    command: 'curl',
    description: { en: 'Transfer data from/to server', zh: '與服務器傳輸數據' },
    example: { en: 'curl -I https://example.com', zh: 'curl -I https://example.com' },
  },
  {
    id: 'c9',
    command: 'wget',
    description: { en: 'Download files from the web', zh: '從網絡下載檔案' },
    example: { en: 'wget https://example.com/file.zip', zh: 'wget https://example.com/file.zip' },
  },
  {
    id: 'c10',
    command: 'ip',
    description: { en: 'Show/manipulate routing & devices', zh: '顯示/操作路由和設備' },
    example: { en: 'ip addr show', zh: 'ip addr show' },
  },
  {
    id: 'c11',
    command: 'arp',
    description: { en: 'View ARP cache/table', zh: '查看ARP緩存表' },
    example: { en: 'arp -a', zh: 'arp -a' },
  },
  {
    id: 'c12',
    command: 'route',
    description: { en: 'View/modify IP routing table', zh: '查看/修改IP路由表' },
    example: { en: 'route -n', zh: 'route -n' },
  },
  {
    id: 'c13',
    command: 'tcpdump',
    description: { en: 'Capture and analyze packets', zh: '捕獲和分析數據包' },
    example: { en: 'tcpdump -i eth0 port 80', zh: 'tcpdump -i eth0 port 80' },
  },
  {
    id: 'c14',
    command: 'nmap',
    description: { en: 'Network port scanner', zh: '網絡端口掃描' },
    example: { en: 'nmap -sV 192.168.1.1', zh: 'nmap -sV 192.168.1.1' },
  },
];

// --- Copy helper ---
function CopyButton({ text, language }: { text: string; language: 'en' | 'zh' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="h-6 w-6 flex items-center justify-center rounded text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-150 shrink-0"
      aria-label={copied ? (language === 'en' ? 'Copied' : '已複製') : (language === 'en' ? 'Copy' : '複製')}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

export function CheatsheetPanel({ isOpen, onClose, language }: CheatsheetPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const query = searchQuery.toLowerCase().trim();

  const filteredFormulas = useMemo(() => {
    if (!query) return FORMULAS;
    return FORMULAS.filter(
      (f) =>
        f.name.en.toLowerCase().includes(query) ||
        f.name.zh.includes(query) ||
        f.formula.toLowerCase().includes(query) ||
        f.description.en.toLowerCase().includes(query) ||
        f.description.zh.includes(query)
    );
  }, [query]);

  const filteredPorts = useMemo(() => {
    if (!query) return PORTS;
    return PORTS.filter(
      (p) =>
        p.protocol.toLowerCase().includes(query) ||
        String(p.port).includes(query) ||
        p.description.en.toLowerCase().includes(query) ||
        p.description.zh.includes(query)
    );
  }, [query]);

  const filteredCommands = useMemo(() => {
    if (!query) return COMMANDS;
    return COMMANDS.filter(
      (c) =>
        c.command.toLowerCase().includes(query) ||
        c.description.en.toLowerCase().includes(query) ||
        c.description.zh.includes(query) ||
        c.example.en.toLowerCase().includes(query)
    );
  }, [query]);

  const hasResults = filteredFormulas.length > 0 || filteredPorts.length > 0 || filteredCommands.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] flex flex-col p-0 gap-0 bg-white dark:bg-[#1e1e1e]">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-6 pb-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {language === 'en' ? 'Cheat Sheet' : '速查表'}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {language === 'en'
                ? 'Quick reference for networking'
                : '網絡速查參考'}
            </DialogDescription>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 pb-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'en' ? 'Search formulas, ports, commands...' : '搜尋公式、端口、命令...'
              }
              className="h-9 text-sm pl-8 bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="formulas" className="flex-1 min-h-0 flex flex-col">
          <div className="px-6">
            <TabsList className="w-full grid grid-cols-3 h-9 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="formulas" className="text-xs gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                <Calculator className="h-3.5 w-3.5" />
                {language === 'en' ? 'Formulas' : '公式'}
              </TabsTrigger>
              <TabsTrigger value="ports" className="text-xs gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                <Hash className="h-3.5 w-3.5" />
                {language === 'en' ? 'Ports' : '端口'}
              </TabsTrigger>
              <TabsTrigger value="commands" className="text-xs gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                <Terminal className="h-3.5 w-3.5" />
                {language === 'en' ? 'Commands' : '命令'}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="formulas" className="flex-1 min-h-0 mt-0">
            <div className="h-[360px] px-6 overflow-y-auto overscroll-contain custom-scrollbar">
              <div className="space-y-2 pb-4">
                {!hasResults && query ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
                    {language === 'en' ? 'No results found' : '揾唔到結果'}
                  </p>
                ) : (
                  filteredFormulas.map((f) => (
                    <div
                      key={f.id}
                      className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-3 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {language === 'en' ? f.name.en : f.name.zh}
                          </p>
                          <div className="mt-1.5 px-2.5 py-1.5 rounded bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700">
                            <code className="text-xs font-mono text-emerald-700 dark:text-emerald-400 whitespace-pre-wrap break-all">
                              {f.formula}
                            </code>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                            {language === 'en' ? f.description.en : f.description.zh}
                          </p>
                        </div>
                        <CopyButton text={f.formula} language={language} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ports" className="flex-1 min-h-0 mt-0">
            <div className="h-[360px] px-6 overflow-y-auto overscroll-contain custom-scrollbar">
              <div className="space-y-1.5 pb-4">
                {!hasResults && query ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
                    {language === 'en' ? 'No results found' : '揾唔到結果'}
                  </p>
                ) : (
                  filteredPorts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors"
                    >
                      <div className="shrink-0 w-12 text-right">
                        <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {p.port}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {p.protocol}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 h-4 font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-0"
                          >
                            {p.transport}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          {language === 'en' ? p.description.en : p.description.zh}
                        </p>
                      </div>
                      <CopyButton text={`${p.port} - ${p.protocol}`} language={language} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="commands" className="flex-1 min-h-0 mt-0">
            <div className="h-[360px] px-6 overflow-y-auto overscroll-contain custom-scrollbar">
              <div className="space-y-2 pb-4">
                {!hasResults && query ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
                    {language === 'en' ? 'No results found' : '揾唔到結果'}
                  </p>
                ) : (
                  filteredCommands.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-3 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {c.command}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {language === 'en' ? c.description.en : c.description.zh}
                          </p>
                          <div className="mt-1.5 px-2.5 py-1.5 rounded bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700">
                            <code className="text-xs font-mono text-gray-600 dark:text-gray-300">
                              $ {language === 'en' ? c.example.en : c.example.zh}
                            </code>
                          </div>
                        </div>
                        <CopyButton text={c.command} language={language} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
