export interface ProtocolCard {
  id: string;
  name: string;
  nameZh: string;
  layer: string;
  layerZh: string;
  port?: number;
  description: string;
  descriptionZh: string;
  keyFacts: { label: string; labelZh: string; value: string; valueZh: string }[];
  color: string;
}

export const protocolCards: ProtocolCard[] = [
  {
    id: 'http',
    name: 'HTTP/HTTPS',
    nameZh: 'HTTP/HTTPS',
    layer: 'Application',
    layerZh: '應用層',
    port: 80,
    description:
      'Hypertext Transfer Protocol — the foundation of the World Wide Web. HTTPS adds TLS encryption for secure communication.',
    descriptionZh:
      '超文本傳輸協定 — 萬維網的基礎。HTTPS添加TLS加密以實現安全通信。',
    keyFacts: [
      {
        label: 'Request-Response',
        labelZh: '請求-響應',
        value: 'Stateless protocol',
        valueZh: '無狀態協定',
      },
      {
        label: 'Methods',
        labelZh: '方法',
        value: 'GET, POST, PUT, DELETE',
        valueZh: 'GET, POST, PUT, DELETE',
      },
      {
        label: 'HTTPS Port',
        labelZh: 'HTTPS端口',
        value: '443 (TLS encrypted)',
        valueZh: '443（TLS加密）',
      },
      {
        label: 'Versions',
        labelZh: '版本',
        value: 'HTTP/1.1, HTTP/2, HTTP/3',
        valueZh: 'HTTP/1.1, HTTP/2, HTTP/3',
      },
    ],
    color: 'emerald',
  },
  {
    id: 'dns',
    name: 'DNS',
    nameZh: 'DNS',
    layer: 'Application',
    layerZh: '應用層',
    port: 53,
    description:
      'Domain Name System — translates human-readable domain names (e.g., google.com) into IP addresses. Uses UDP for queries, TCP for zone transfers.',
    descriptionZh:
      '域名系統 — 將人類可讀的域名（如google.com）轉換為IP地址。查詢使用UDP，區域傳輸使用TCP。',
    keyFacts: [
      {
        label: 'Hierarchy',
        labelZh: '層級結構',
        value: 'Root → TLD → Authoritative',
        valueZh: '根 → TLD → 權威服務器',
      },
      {
        label: 'Record Types',
        labelZh: '紀錄類型',
        value: 'A, AAAA, CNAME, MX, NS',
        valueZh: 'A, AAAA, CNAME, MX, NS',
      },
      {
        label: 'Caching',
        labelZh: '緩存',
        value: 'TTL-based at each level',
        valueZh: '每級基於TTL緩存',
      },
    ],
    color: 'violet',
  },
  {
    id: 'tcp',
    name: 'TCP',
    nameZh: 'TCP',
    layer: 'Transport',
    layerZh: '傳輸層',
    description:
      'Transmission Control Protocol — provides reliable, ordered, error-checked delivery of data. Connection-oriented with full-duplex communication.',
    descriptionZh:
      '傳輸控制協定 — 提供可靠的、有序的、經過錯誤檢查的數據傳輸。面向連接，支援全雙工通信。',
    keyFacts: [
      {
        label: 'Connection',
        labelZh: '連接方式',
        value: 'Connection-oriented',
        valueZh: '面向連接',
      },
      {
        label: 'Reliability',
        labelZh: '可靠性',
        value: 'ACK, retransmission, checksum',
        valueZh: '確認、重傳、校驗和',
      },
      {
        label: 'Flow Control',
        labelZh: '流量控制',
        value: 'Sliding window (rwnd)',
        valueZh: '滑動窗口（rwnd）',
      },
      {
        label: 'Handshake',
        labelZh: '握手',
        value: '3-way handshake (1 RTT)',
        valueZh: '三次握手（1個RTT）',
      },
    ],
    color: 'blue',
  },
  {
    id: 'udp',
    name: 'UDP',
    nameZh: 'UDP',
    layer: 'Transport',
    layerZh: '傳輸層',
    description:
      'User Datagram Protocol — lightweight, connectionless protocol. No reliability guarantees but very low overhead. Ideal for real-time applications.',
    descriptionZh:
      '用户數據報協定 — 輕量級無連接協定。無可靠性保證但開銷極低。適用於實時應用。',
    keyFacts: [
      {
        label: 'Connection',
        labelZh: '連接方式',
        value: 'Connectionless',
        valueZh: '無連接',
      },
      {
        label: 'Header Size',
        labelZh: '頭部大小',
        value: '8 bytes (minimal)',
        valueZh: '8字節（極小）',
      },
      {
        label: 'Use Cases',
        labelZh: '使用場景',
        value: 'DNS, DHCP, VoIP, streaming',
        valueZh: 'DNS, DHCP, VoIP, 串流',
      },
      {
        label: 'Error Check',
        labelZh: '錯誤檢查',
        value: 'Optional checksum',
        valueZh: '可選校驗和',
      },
    ],
    color: 'orange',
  },
  {
    id: 'ip',
    name: 'IP',
    nameZh: 'IP',
    layer: 'Network',
    layerZh: '網絡層',
    description:
      'Internet Protocol — responsible for addressing, routing, and fragmenting packets. IPv4 uses 32-bit addresses; IPv6 uses 128-bit addresses.',
    descriptionZh:
      '互聯網協定 — 負責尋址、路由和數據包分片。IPv4使用32位地址；IPv6使用128位地址。',
    keyFacts: [
      {
        label: 'IPv4 Address',
        labelZh: 'IPv4地址',
        value: '32 bits (e.g., 192.168.1.1)',
        valueZh: '32位（如192.168.1.1）',
      },
      {
        label: 'IPv6 Address',
        labelZh: 'IPv6地址',
        value: '128 bits (e.g., 2001:db8::1)',
        valueZh: '128位（如2001:db8::1）',
      },
      {
        label: 'TTL',
        labelZh: 'TTL',
        value: 'Prevents infinite loops',
        valueZh: '防止無限循環',
      },
      {
        label: 'Fragmentation',
        labelZh: '分片',
        value: 'MTU-based splitting',
        valueZh: '基於MTU的分片',
      },
    ],
    color: 'rose',
  },
  {
    id: 'arp',
    name: 'ARP',
    nameZh: 'ARP',
    layer: 'Network',
    layerZh: '網絡層',
    description:
      'Address Resolution Protocol — maps IP addresses to MAC (hardware) addresses within a local network. Essential for LAN communication.',
    descriptionZh:
      '地址解析協定 — 在局域網中將IP地址映射到MAC（硬件）地址。局域網通信必不可少。',
    keyFacts: [
      {
        label: 'Function',
        labelZh: '功能',
        value: 'IP → MAC mapping',
        valueZh: 'IP → MAC映射',
      },
      {
        label: 'Process',
        labelZh: '過程',
        value: 'Broadcast request, unicast reply',
        valueZh: '廣播請求，單播應答',
      },
      {
        label: 'Cache',
        labelZh: '緩存',
        value: 'ARP table (temp mapping)',
        valueZh: 'ARP表（臨時映射）',
      },
    ],
    color: 'teal',
  },
  {
    id: 'icmp',
    name: 'ICMP',
    nameZh: 'ICMP',
    layer: 'Network',
    layerZh: '網絡層',
    description:
      'Internet Control Message Protocol — used for diagnostics and error reporting. ping and traceroute rely on ICMP. Not for data transport.',
    descriptionZh:
      '互聯網控制訊息協定 — 用於診斷和錯誤報告。ping和traceroute依賴ICMP。不用於數據傳輸。',
    keyFacts: [
      {
        label: 'Purpose',
        labelZh: '用途',
        value: 'Diagnostics & error reporting',
        valueZh: '診斷和錯誤報告',
      },
      {
        label: 'Echo',
        labelZh: '回聲',
        value: 'Type 0 (Reply), Type 8 (Request)',
        valueZh: '類型0（應答），類型8（請求）',
      },
      {
        label: 'Errors',
        labelZh: '錯誤',
        value: 'Dest Unreachable, Time Exceeded',
        valueZh: '目的不可達，逾時',
      },
    ],
    color: 'amber',
  },
  {
    id: 'tls',
    name: 'TLS',
    nameZh: 'TLS',
    layer: 'Presentation',
    layerZh: '表示層',
    description:
      'Transport Layer Security — encrypts data in transit. Used by HTTPS, SMTPS, FTPS. TLS 1.3 reduces handshake to 1 RTT with 0-RTT data support.',
    descriptionZh:
      '傳輸層安全 — 加密傳輸中的數據。被HTTPS、SMTPS、FTPS使用。TLS 1.3將握手減少到1個RTT，支援0-RTT數據。',
    keyFacts: [
      {
        label: 'Encryption',
        labelZh: '加密',
        value: 'Asymmetric + Symmetric',
        valueZh: '非對稱 + 對稱加密',
      },
      {
        label: 'Handshake',
        labelZh: '握手',
        value: 'TLS 1.3: 1 RTT (or 0-RTT)',
        valueZh: 'TLS 1.3: 1 RTT（或0-RTT）',
      },
      {
        label: 'Certificate',
        labelZh: '證書',
        value: 'X.509 for authentication',
        valueZh: 'X.509用於身份驗證',
      },
      {
        label: 'Versions',
        labelZh: '版本',
        value: 'TLS 1.2, TLS 1.3 (latest)',
        valueZh: 'TLS 1.2, TLS 1.3（最新）',
      },
    ],
    color: 'green',
  },
  {
    id: 'websocket',
    name: 'WebSocket',
    nameZh: 'WebSocket',
    layer: 'Application',
    layerZh: '應用層',
    description:
      'Full-duplex communication protocol over a single TCP connection. Upgrades from HTTP via handshake. Enables real-time bidirectional data transfer.',
    descriptionZh:
      '基於單個TCP連接的全雙工通信協定。通過握手從HTTP升級。支援實時雙向數據傳輸。',
    keyFacts: [
      {
        label: 'Communication',
        labelZh: '通信方式',
        value: 'Full-duplex, persistent',
        valueZh: '全雙工，持久連接',
      },
      {
        label: 'Upgrade',
        labelZh: '升級',
        value: 'HTTP → WebSocket (ws://)',
        valueZh: 'HTTP → WebSocket（ws://）',
      },
      {
        label: 'Use Cases',
        labelZh: '使用場景',
        value: 'Chat, live feeds, gaming',
        valueZh: '聊日、實時推送、遊戲',
      },
    ],
    color: 'cyan',
  },
  {
    id: 'ssh',
    name: 'SSH',
    nameZh: 'SSH',
    layer: 'Application',
    layerZh: '應用層',
    port: 22,
    description:
      'Secure Shell — encrypted protocol for remote administration. Uses public-key cryptography for authentication. Supports port forwarding and tunneling.',
    descriptionZh:
      '安全外殼協定 — 用於遠程管理的加密協定。使用公鑰密碼學進行身份驗證。支援端口轉發和隧道。',
    keyFacts: [
      {
        label: 'Port',
        labelZh: '端口',
        value: 'TCP port 22',
        valueZh: 'TCP端口22',
      },
      {
        label: 'Encryption',
        labelZh: '加密',
        value: 'AES, ChaCha20, RSA, Ed25519',
        valueZh: 'AES, ChaCha20, RSA, Ed25519',
      },
      {
        label: 'Auth',
        labelZh: '認證',
        value: 'Public key or password',
        valueZh: '公鑰或密碼',
      },
      {
        label: 'Features',
        labelZh: '特性',
        value: 'Port forwarding, SFTP, tunneling',
        valueZh: '端口轉發、SFTP、隧道',
      },
    ],
    color: 'purple',
  },
];

export const layerFilters = [
  { id: 'all', label: 'All', labelZh: '全部' },
  { id: 'Application', label: 'Application', labelZh: '應用層' },
  { id: 'Transport', label: 'Transport', labelZh: '傳輸層' },
  { id: 'Network', label: 'Network', labelZh: '網絡層' },
  { id: 'Presentation', label: 'Presentation', labelZh: '表示層' },
] as const;
