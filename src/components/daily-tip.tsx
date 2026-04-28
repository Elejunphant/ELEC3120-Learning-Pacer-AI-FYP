'use client';

import React, { useState } from 'react';
import { Lightbulb, X, ChevronDown, ChevronUp } from 'lucide-react';

interface DailyTipProps {
  language: 'en' | 'zh';
}

const studyTips = [
  {
    en: 'TCP congestion control uses AIMD: Additive Increase (linear) and Multiplicative Decrease (halving cwnd on loss). Remember: "AIMD" = grow slowly, shrink fast!',
    zh: 'TCP擁塞控制使用AIMD：加性增加（線性增長）和乘性減少（丟包時cwnd減半）。記住："AIMD" = 慢增長，快縮減！',
  },
  {
    en: 'OSI model mnemonic (bottom→top): "Please Do Not Throw Sausage Pizza Away" — Physical, Data Link, Network, Transport, Session, Presentation, Application.',
    zh: 'OSI模型助記口訣（從下到上）："物數網傳會表應" — 物理層、資料鏈結層、網絡層、傳輸層、會話層、表示層、應用層。',
  },
  {
    en: 'Subnetting shortcut: To find the number of usable hosts, use 2^(32 - prefix) - 2. For a /26 subnet: 2^6 - 2 = 62 usable hosts.',
    zh: '子網劃分捷徑：計算可用主機數，使用 2^(32 - 前綴) - 2。對於 /26 子網：2^6 - 2 = 62 個可用主機。',
  },
  {
    en: 'HTTP status code groups: 1xx (Informational), 2xx (Success), 3xx (Redirection), 4xx (Client Error), 5xx (Server Error). Remember "200 OK" and "404 Not Found"!',
    zh: 'HTTP狀態碼分組：1xx（資訊性）、2xx（成功）、3xx（重新導向）、4xx（客户端錯誤）、5xx（伺服器錯誤）。記住"200 OK"和"404 Not Found"！',
  },
  {
    en: 'DNS resolution order: Browser cache → OS cache → Router cache → ISP DNS → Recursive query to Root → TLD → Authoritative server. Typical process: 4+ round trips!',
    zh: 'DNS解析順序：瀏覽器緩存 → OS緩存 → 路由器緩存 → ISP DNS → 遞歸查詢根服務器 → TLD服務器 → 權威服務器。通常需要4+次往返！',
  },
  {
    en: 'TLS 1.2 handshake: ClientHello → ServerHello + Certificate + ServerHelloDone → ClientKeyExchange + ChangeCipherSpec + Finished → ChangeCipherSpec + Finished. 2 RTTs minimum!',
    zh: 'TLS 1.2握手：ClientHello → ServerHello + Certificate + ServerHelloDone → ClientKeyExchange + ChangeCipherSpec + Finished → ChangeCipherSpec + Finished。至少2個RTT！',
  },
  {
    en: 'UDP use cases: DNS (port 53), DHCP, SNMP, VoIP, video streaming, online gaming. Why? Low overhead (8-byte header) and no connection setup delay — perfect for real-time apps!',
    zh: 'UDP應用場景：DNS（端口53）、DHCP、SNMP、VoIP、視頻流、在線遊戲。為什麼？開銷低（8字節頭部）且無需連接建立延遲 — 完美適用於實時應用！',
  },
  {
    en: 'IP address classes: Class A (1-126, /8), Class B (128-191, /16), Class C (192-223, /24). Loopback is 127.0.0.1. Private ranges: 10.x.x.x, 172.16-31.x.x, 192.168.x.x.',
    zh: 'IP地址分類：A類（1-126, /8）、B類（128-191, /16）、C類（192-223, /24）。迴環地址是127.0.0.1。私有範圍：10.x.x.x、172.16-31.x.x、192.168.x.x。',
  },
  {
    en: 'NAT types: Static NAT (1:1 mapping), Dynamic NAT (pool-based), PAT/NAPT (port-based, most common). PAT allows thousands of internal hosts to share one public IP using port numbers!',
    zh: 'NAT類型：靜態NAT（一對一映射）、動態NAT（基於地址池）、PAT/NAPT（基於端口，最常見）。PAT允許數千台內部主機通過端口號共享一個公網IP！',
  },
  {
    en: 'Routing protocols: Distance Vector (RIP — "rumor-based", shares full table) vs Link State (OSPF — "map-based", shares link info). OSPF converges faster and avoids count-to-infinity.',
    zh: '路由協定：距離向量（RIP — "基於謠言"，共享完整路由表）vs 鏈路狀態（OSPF — "基於地圖"，共享鏈路信息）。OSPF收斂更快，避免計數到無窮。',
  },
  {
    en: 'WebSocket vs HTTP: HTTP is request-response (client initiates); WebSocket is full-duplex persistent connection (ws://). Handshake upgrades HTTP to WebSocket. Great for chat, live updates!',
    zh: 'WebSocket vs HTTP：HTTP是請求-響應（客户端發起）；WebSocket是全雙工持久連接（ws://）。握手將HTTP升級為WebSocket。適合聊日、實時更新！',
  },
  {
    en: 'CIDR notation: IP/prefix (e.g., 192.168.1.0/24). Subnet mask = prefix number of 1-bits. /24 = 255.255.255.0. CIDR allows flexible subnet sizes, not limited to class boundaries!',
    zh: 'CIDR表示法：IP/前綴（如192.168.1.0/24）。子網遮罩 = 前綴數量的1位。/24 = 255.255.255.0。CIDR允許靈活的子網大小，不限於類別邊界！',
  },
  {
    en: 'ARP protocol: Maps IP → MAC address. Process: Check ARP cache → ARP broadcast (Who has 192.168.1.1?) → ARP reply (I have, MAC is aa:bb:cc:dd:ee:ff) → Cache update.',
    zh: 'ARP協定：將IP映射到MAC地址。流程：檢查ARP緩存 → ARP廣播（誰有192.168.1.1？）→ ARP應答（我有，MAC是aa:bb:cc:dd:ee:ff）→ 更新緩存。',
  },
  {
    en: 'ICMP message types: Echo Request/Reply (ping, Type 0/8), Destination Unreachable (Type 3), Time Exceeded (Type 11 — used by traceroute). Remember: ICMP is for diagnostics, not data!',
    zh: 'ICMP訊息類型：回聲請求/應答（ping，類型0/8）、目的不可達（類型3）、逾時（類型11 — traceroute使用）。記住：ICMP用於診斷，不傳輸數據！',
  },
  {
    en: 'Flow control (rwnd) vs Congestion control (cwnd): rwnd protects the receiver buffer; cwnd protects the network. Send window = min(rwnd, cwnd). Both are critical for TCP performance!',
    zh: '流量控制（rwnd）vs 擁塞控制（cwnd）：rwnd保護接收方緩衝區；cwnd保護網絡。發送窗口 = min(rwnd, cwnd)。兩者都對TCP性能至關重要！',
  },
  {
    en: 'TCP 3-way handshake: SYN (seq=x) → SYN-ACK (seq=y, ack=x+1) → ACK (ack=y+1). Purpose: exchange ISNs, negotiate parameters, establish full-duplex connection. Total: 1 RTT.',
    zh: 'TCP三次握手：SYN（seq=x）→ SYN-ACK（seq=y, ack=x+1）→ ACK（ack=y+1）。目的：交換初始序號，協商參數，建立全雙工連接。總共1個RTT。',
  },
  {
    en: 'TCP 4-way termination: FIN → ACK → FIN → ACK. Each direction closes independently! TIME_WAIT lasts 2×MSL (typically 60s) to ensure the last ACK reaches the server.',
    zh: 'TCP四次揮手：FIN → ACK → FIN → ACK。每個方向獨立關閉！TIME_WAIT持續2×MSL（通常60秒），確保最後的ACK到達服務器。',
  },
  {
    en: 'Error detection methods: Parity bit (detects odd number of bit errors), Checksum (used in TCP/UDP), CRC (used in Ethernet, more robust). None of these correct errors — that requires retransmission!',
    zh: '錯誤檢測方法：奇偶校驗（檢測奇數個比特錯誤）、校驗和（TCP/UDP使用）、CRC（以太網使用，更健壯）。呢些都不能糾正錯誤 — 需要重傳！',
  },
  {
    en: 'QoS mechanisms: Best-Effort (no guarantee), Integrated Services (IntServ — reservation-based), Differentiated Services (DiffServ — class-based, most practical). DSCP marks packets for priority queuing!',
    zh: 'QoS機制：盡力而為（無保證）、綜合服務（IntServ — 基於預留）、區分服務（DiffServ — 基於類別，最實用）。DSCP標記數據包進行優先級排隊！',
  },
  {
    en: 'IPv6 transition methods: Dual Stack (run both IPv4 and IPv6), Tunneling (encapsulate IPv6 in IPv4), Translation (NAT64/DNS64). Dual stack is the most common approach during transition!',
    zh: 'IPv6過渡方法：雙棧（同時運行IPv4和IPv6）、隧道（將IPv6封裝在IPv4中）、轉換（NAT64/DNS64）。雙棧是過渡期間最常用的方法！',
  },
];

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function DailyTip({ language }: DailyTipProps) {
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const dismissedDate = localStorage.getItem('lp-daily-tip-dismissed');
    const today = getTodayDateString();
    return dismissedDate !== today;
  });
  const [expanded, setExpanded] = useState(false);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem('lp-daily-tip-dismissed', getTodayDateString());
  };

  if (!visible) return null;

  const tipIndex = getDayOfYear() % studyTips.length;
  const tip = studyTips[tipIndex];

  return (
    <div className="animate-slideDown shrink-0">
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 border-l-[3px] border-l-amber-400 dark:border-l-amber-500 text-amber-800 dark:text-amber-200 px-3 py-2.5 flex items-start gap-2.5">
        <Lightbulb className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5 animate-tip-icon" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-0.5">
            {language === 'en' ? '💡 Study Tip' : '💡 學習提示'}
          </p>
          <p className={`text-xs leading-relaxed text-amber-800/80 dark:text-amber-200/80 transition-all duration-300 scrollbar-thin ${expanded ? 'max-h-[300px]' : 'max-h-[100px]'} overflow-y-auto`}>
            {language === 'en' ? tip.en : tip.zh}
          </p>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 mt-1 text-[10px] font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors touch-manipulation"
            aria-label={expanded ? (language === 'en' ? 'Show less' : '收起') : (language === 'en' ? 'Show more' : '顯示更多')}
          >
            {expanded
              ? (language === 'en' ? 'Show less' : '收起')
              : (language === 'en' ? 'Show more' : '顯示更多')}
            {expanded
              ? <ChevronUp className="h-3 w-3" />
              : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 h-6 w-6 flex items-center justify-center rounded-md text-amber-600 dark:text-amber-400 hover:bg-amber-200/50 dark:hover:bg-amber-800/40 transition-colors touch-manipulation"
          aria-label={language === 'en' ? 'Dismiss tip' : '關閉提示'}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
