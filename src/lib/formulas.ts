export interface Formula {
  id: string;
  title: string;
  titleZh: string;
  formula: string;
  description: string;
  descriptionZh: string;
  variables: { symbol: string; meaning: string; meaningZh: string }[];
  topicId: string;
}

export const formulas: Formula[] = [
  // ──────────────────────────────────────────────
  // Network Fundamentals
  // ──────────────────────────────────────────────
  {
    id: 'nf-1',
    title: 'End-to-End Delay',
    titleZh: '端到端延遲',
    formula: 'd_end_to_end = d_proc + d_queue + d_trans + d_prop',
    description:
      'The total time for a packet to travel from source to destination, including all four delay components at each hop.',
    descriptionZh:
      '數據包從源到目的地的總時間，包括每一跳的四個延遲分量。',
    variables: [
      {
        symbol: 'd_proc',
        meaning: 'Processing delay',
        meaningZh: '處理延遲',
      },
      {
        symbol: 'd_queue',
        meaning: 'Queuing delay',
        meaningZh: '排隊延遲',
      },
      {
        symbol: 'd_trans',
        meaning: 'Transmission delay',
        meaningZh: '傳輸延遲',
      },
      {
        symbol: 'd_prop',
        meaning: 'Propagation delay',
        meaningZh: '傳播延遲',
      },
    ],
    topicId: 'network-fundamentals',
  },
  {
    id: 'nf-2',
    title: 'Transmission Delay',
    titleZh: '傳輸延遲',
    formula: 'd_trans = L / R',
    description:
      'Time to push all bits of a packet onto the link. Depends on packet length and link rate.',
    descriptionZh: '將數據包所有比特推送到鏈路上的時間，取決於數據包長度和鏈路速率。',
    variables: [
      { symbol: 'L', meaning: 'Packet length (bits)', meaningZh: '數據包長度（比特）' },
      { symbol: 'R', meaning: 'Link rate / bandwidth (bps)', meaningZh: '鏈路速率/帶寬（bps）' },
    ],
    topicId: 'network-fundamentals',
  },
  {
    id: 'nf-3',
    title: 'Propagation Delay',
    titleZh: '傳播延遲',
    formula: 'd_prop = d / s',
    description:
      'Time for a bit to travel from one end of the link to the other. Depends on physical distance and signal speed.',
    descriptionZh:
      '一個比特從鏈路一端傳播到另一端的時間，取決於物理距離和信號傳播速度。',
    variables: [
      {
        symbol: 'd',
        meaning: 'Distance of the link (m)',
        meaningZh: '鏈路距離（米）',
      },
      {
        symbol: 's',
        meaning: 'Propagation speed (~3×10⁸ m/s)',
        meaningZh: '傳播速度（約3×10⁸ m/s）',
      },
    ],
    topicId: 'network-fundamentals',
  },
  {
    id: 'nf-4',
    title: 'Throughput',
    titleZh: '吞吐量',
    formula: 'Throughput = min(R1, R2, ..., Rn)',
    description:
      'End-to-end throughput in a multi-hop path is bounded by the bottleneck link rate (minimum bandwidth along the path).',
    descriptionZh:
      '多跳路徑的端到端吞吐量受瓶頸鍊路速率（路徑上的最小帶寬）限制。',
    variables: [
      {
        symbol: 'Rn',
        meaning: 'Bandwidth of link n (bps)',
        meaningZh: '第n條鏈路的帶寬（bps）',
      },
    ],
    topicId: 'network-fundamentals',
  },
  {
    id: 'nf-5',
    title: 'Bandwidth-Delay Product',
    titleZh: '帶寬-延遲積',
    formula: 'BDP = R × RTT',
    description:
      'The amount of data that can be "in flight" on the link. Equals the capacity of the pipe in bits.',
    descriptionZh: '鏈路上可以"在途"傳輸的數據量，等於管道容量（比特）。',
    variables: [
      { symbol: 'R', meaning: 'Bandwidth (bps)', meaningZh: '帶寬（bps）' },
      { symbol: 'RTT', meaning: 'Round-trip time (s)', meaningZh: '往返時間（秒）' },
    ],
    topicId: 'network-fundamentals',
  },

  // ──────────────────────────────────────────────
  // Transport Layer
  // ──────────────────────────────────────────────
  {
    id: 'tl-1',
    title: 'UDP Header Size',
    titleZh: 'UDP 報文頭大小',
    formula: 'UDP header = 8 bytes = 64 bits',
    description:
      'UDP has a minimal 8-byte header with 4 fields: Source Port (16b), Destination Port (16b), Length (16b), Checksum (16b).',
    descriptionZh:
      'UDP只有最小的8字節頭部，包含4個字段：源端口（16位）、目的端口（16位）、長度（16位）、校驗和（16位）。',
    variables: [
      {
        symbol: '8 bytes',
        meaning: 'Fixed header overhead',
        meaningZh: '固定頭部開銷',
      },
    ],
    topicId: 'transport-layer',
  },
  {
    id: 'tl-2',
    title: 'TCP Header Size',
    titleZh: 'TCP 報文頭大小',
    formula: 'TCP header = 20 bytes (min) ~ 60 bytes (max)',
    description:
      'TCP header is 20 bytes minimum (without options). Each option field adds 4 bytes, up to 40 bytes of options (60 bytes total).',
    descriptionZh:
      'TCP頭部最小20字節（不含選項），每個選項字段增加4字節，最多40字節選項（總共60字節）。',
    variables: [
      {
        symbol: '20 bytes',
        meaning: 'Minimum header (no options)',
        meaningZh: '最小頭部（無選項）',
      },
      {
        symbol: '60 bytes',
        meaning: 'Maximum header (with options)',
        meaningZh: '最大頭部（含選項）',
      },
    ],
    topicId: 'transport-layer',
  },
  {
    id: 'tl-3',
    title: 'Maximum Segment Size (MSS)',
    titleZh: '最大報文段長度',
    formula: 'MSS = MTU - TCP/IP header overhead',
    description:
      'Maximum amount of application-layer data in a TCP segment. Typical: Ethernet MTU=1500B, IP=20B, TCP=20B, so MSS=1460B.',
    descriptionZh:
      'TCP報文段中應用層數據的最大量。典型值：以太網MTU=1500B，IP=20B，TCP=20B，因呢個MSS=1460B。',
    variables: [
      {
        symbol: 'MTU',
        meaning: 'Maximum Transmission Unit (bytes)',
        meaningZh: '最大傳輸單元（字節）',
      },
      {
        symbol: '1460B',
        meaning: 'Typical MSS for Ethernet',
        meaningZh: '以太網的典型MSS值',
      },
    ],
    topicId: 'transport-layer',
  },
  {
    id: 'tl-4',
    title: 'UDP Checksum Calculation',
    titleZh: 'UDP 校驗和計算',
    formula: 'Checksum = 1\'s complement of 1\'s complement sum of all 16-bit words',
    description:
      'UDP checksum covers a pseudo-header (src IP, dst IP, protocol, UDP length), the UDP header, and the data. If the sum overflows 16 bits, carry is wrapped around.',
    descriptionZh:
      'UDP校驗和覆蓋偽頭部（源IP、目的IP、協定、UDP長度）、UDP頭部和數據。如果16位和溢出，進位回捲。',
    variables: [
      {
        symbol: 'Pseudo-header',
        meaning: 'Source/Dest IP, protocol, length',
        meaningZh: '源/目的IP、協定、長度',
      },
    ],
    topicId: 'transport-layer',
  },

  // ──────────────────────────────────────────────
  // Reliable Transmission
  // ──────────────────────────────────────────────
  {
    id: 'rt-1',
    title: 'Sender Utilization (Pipelining)',
    titleZh: '發送方利用率（流水線）',
    formula: 'U_sender = (W × L / R) / (RTT + W × L / R)',
    description:
      'Fraction of time the sender is busy transmitting. W is the window size in packets, L/R is the transmission time per packet.',
    descriptionZh:
      '發送方忙於傳輸的時間比例。W是以數據包為單位的窗口大小，L/R是每個數據包的傳輸時間。',
    variables: [
      {
        symbol: 'W',
        meaning: 'Window size (in packets)',
        meaningZh: '窗口大小（以數據包為單位）',
      },
      {
        symbol: 'L',
        meaning: 'Packet length (bits)',
        meaningZh: '數據包長度（比特）',
      },
      {
        symbol: 'R',
        meaning: 'Link rate (bps)',
        meaningZh: '鏈路速率（bps）',
      },
      {
        symbol: 'RTT',
        meaning: 'Round-trip time (s)',
        meaningZh: '往返時間（秒）',
      },
    ],
    topicId: 'reliable-transmission',
  },
  {
    id: 'rt-2',
    title: 'Go-Back-N Efficiency',
    titleZh: '回退N幀協定效率',
    formula: 'U_GBN = W / (1 + 2a),  where a = d_prop / d_trans',
    description:
      'For Go-Back-N, efficiency equals window size over (1 + 2a). When W ≥ 1+2a, the sender can be 100% utilized.',
    descriptionZh:
      '對於回退N幀協定，效率等於窗口大小除以(1+2a)。當W ≥ 1+2a時，發送方可100%利用。',
    variables: [
      {
        symbol: 'W',
        meaning: 'Window size',
        meaningZh: '窗口大小',
      },
      {
        symbol: 'a',
        meaning: 'Ratio of propagation to transmission delay',
        meaningZh: '傳播延遲與傳輸延遲之比',
      },
    ],
    topicId: 'reliable-transmission',
  },
  {
    id: 'rt-3',
    title: 'Selective Repeat Efficiency',
    titleZh: '選擇重傳協定效率',
    formula: 'U_SR = W / (1 + 2a),  W ≤ (N+1)/2',
    description:
      'Selective Repeat achieves similar efficiency to GBN but avoids retransmitting correctly received packets. Window constraint: W ≤ (N+1)/2.',
    descriptionZh:
      '選擇重傳協定達到與GBN相似的效率，但避免重傳已正確接收的數據包。窗口約束：W ≤ (N+1)/2。',
    variables: [
      {
        symbol: 'N',
        meaning: 'Sequence number space',
        meaningZh: '序號空間大小',
      },
      {
        symbol: 'W',
        meaning: 'Window size',
        meaningZh: '窗口大小',
      },
    ],
    topicId: 'reliable-transmission',
  },
  {
    id: 'rt-4',
    title: 'Optimal Window Size',
    titleZh: '最優窗口大小',
    formula: 'W_opt = 1 + 2a = 1 + 2 × d_prop / d_trans = 1 + 2 × RTT / (L/R)',
    description:
      'Minimum window size to achieve 100% sender utilization. Also equals the bandwidth-delay product divided by the packet size.',
    descriptionZh:
      '實現100%發送方利用率所需的最小窗口大小，也等於帶寬-延遲積除以數據包大小。',
    variables: [
      {
        symbol: 'W_opt',
        meaning: 'Optimal window size',
        meaningZh: '最優窗口大小',
      },
    ],
    topicId: 'reliable-transmission',
  },

  // ──────────────────────────────────────────────
  // TCP Connection
  // ──────────────────────────────────────────────
  {
    id: 'tc-1',
    title: 'TCP Sequence Number Calculation',
    titleZh: 'TCP 序號計算',
    formula: 'Seq_num = Initial Seq + total_bytes_sent_before',
    description:
      'Each byte in the byte stream is numbered. The sequence number of a segment is the byte-stream number of the first byte in that segment.',
    descriptionZh:
      '字節流中的每個字節都有編號。報文段的序號是該段中第一個字節的字節流編號。',
    variables: [
      {
        symbol: 'Seq_num',
        meaning: 'Sequence number of segment',
        meaningZh: '報文段的序號',
      },
      {
        symbol: 'Initial Seq',
        meaning: 'Initial sequence number (ISN)',
        meaningZh: '初始序號（ISN）',
      },
    ],
    topicId: 'tcp-connection',
  },
  {
    id: 'tc-2',
    title: 'RTT Estimation (EWMA)',
    titleZh: 'RTT 估計（指數加權移動平均）',
    formula: 'RTT_est = (1 - α) × RTT_est_prev + α × RTT_sample',
    description:
      'EstimatedRTT is an exponential weighted moving average of recent RTT samples. Typically α = 0.125 (1/8).',
    descriptionZh:
      '估計RTT是近期RTT樣本的指數加權移動平均值。通常α = 0.125（1/8）。',
    variables: [
      {
        symbol: 'α',
        meaning: 'Smoothing factor (typically 0.125)',
        meaningZh: '平滑因子（通常0.125）',
      },
      {
        symbol: 'RTT_sample',
        meaning: 'Most recent measured RTT',
        meaningZh: '最近測量的RTT',
      },
      {
        symbol: 'RTT_est',
        meaning: 'Estimated RTT',
        meaningZh: '估計RTT',
      },
    ],
    topicId: 'tcp-connection',
  },
  {
    id: 'tc-3',
    title: 'TCP Timeout Interval',
    titleZh: 'TCP 逾時時間',
    formula: 'TimeoutInterval = RTT_est + 4 × RTT_dev',
    description:
      'The retransmission timeout is set to EstimatedRTT plus 4 times the deviation. The RTT_dev uses β = 0.25 (1/4).',
    descriptionZh:
      '重傳逾時時間設為估計RTT加4倍偏差。RTT偏差使用β = 0.25（1/4）。',
    variables: [
      {
        symbol: 'RTT_dev',
        meaning: 'DevRTT = (1-β)×DevRTT_prev + β×|RTT_sample - RTT_est|',
        meaningZh: '偏差RTT',
      },
      {
        symbol: '4×RTT_dev',
        meaning: 'Safety margin',
        meaningZh: '安全餘量',
      },
    ],
    topicId: 'tcp-connection',
  },
  {
    id: 'tc-4',
    title: 'TCP Time to Transfer File',
    titleZh: 'TCP 傳輸檔案時間',
    formula: 'T = (2 × RTT) + O / R + (F / S - 1) × RTT',
    description:
      'Total time to transfer a file of F bits using TCP with MSS=S. Includes handshake, first segment transfer, and slow start latency.',
    descriptionZh:
      '使用MSS=S的TCP傳輸F比特檔案的總時間。包括握手、第一個報文段傳輸和慢啓動延遲。',
    variables: [
      {
        symbol: 'O',
        meaning: 'Object/file size (bits)',
        meaningZh: '對象/檔案大小（比特）',
      },
      {
        symbol: 'R',
        meaning: 'Server bandwidth (bps)',
        meaningZh: '服務器帶寬（bps）',
      },
      {
        symbol: 'S',
        meaning: 'MSS (max segment size in bits)',
        meaningZh: 'MSS（最大報文段長度，比特）',
      },
      {
        symbol: 'F/S',
        meaning: 'Number of segments',
        meaningZh: '報文段數量',
      },
    ],
    topicId: 'tcp-connection',
  },

  // ──────────────────────────────────────────────
  // Flow & Congestion Control
  // ──────────────────────────────────────────────
  {
    id: 'fc-1',
    title: 'Slow Start cwnd Growth',
    titleZh: '慢啓動 cwnd 增長',
    formula: 'cwnd doubles every RTT (exponential growth)',
    description:
      'In slow start, cwnd starts at 1 MSS and increases by 1 MSS for each ACK received. Effectively doubles every RTT.',
    descriptionZh:
      '在慢啓動階段，cwnd從1個MSS開始，每收到一個ACK就增加1個MSS，實際上每個RTT翻一倍。',
    variables: [
      {
        symbol: 'cwnd',
        meaning: 'Congestion window (bytes)',
        meaningZh: '擁塞窗口（字節）',
      },
      {
        symbol: 'MSS',
        meaning: 'Maximum Segment Size',
        meaningZh: '最大報文段長度',
      },
    ],
    topicId: 'flow-congestion-control',
  },
  {
    id: 'fc-2',
    title: 'Congestion Avoidance cwnd Growth',
    titleZh: '擁塞避免 cwnd 增長',
    formula: 'cwnd increases by 1 MSS per RTT (linear growth)',
    description:
      'In congestion avoidance, cwnd increases by approximately 1 MSS for each full window of data ACKed. Linear increase.',
    descriptionZh:
      '在擁塞避免階段，每確認一個完整窗口的數據，cwnd大約增加1個MSS。線性增長。',
    variables: [
      {
        symbol: 'cwnd',
        meaning: 'Congestion window (bytes)',
        meaningZh: '擁塞窗口（字節）',
      },
    ],
    topicId: 'flow-congestion-control',
  },
  {
    id: 'fc-3',
    title: 'AIMD Average cwnd',
    titleZh: 'AIMD 平均 cwnd',
    formula: 'cwnd_avg ≈ (3/4) × W_max',
    description:
      'For TCP Reno with Additive Increase / Multiplicative Decrease, the average cwnd oscillates around 3/4 of the maximum window before loss.',
    descriptionZh:
      '對於TCP Reno的加性增加/乘性減少策略，平均cwnd在丟包前最大窗口的3/4附近振盪。',
    variables: [
      {
        symbol: 'W_max',
        meaning: 'cwnd at the point of loss',
        meaningZh: '丟包時的cwnd值',
      },
    ],
    topicId: 'flow-congestion-control',
  },
  {
    id: 'fc-4',
    title: 'TCP Throughput (simplified)',
    titleZh: 'TCP 吞吐量（簡化）',
    formula: 'Throughput ≈ (1.22 × MSS) / (RTT × √p)',
    description:
      'Average throughput of TCP as a function of MSS, RTT, and loss probability p. Derived from the AIMD sawtooth analysis.',
    descriptionZh:
      'TCP的平均吞吐量與MSS、RTT和丟包概率p的關系，由AIMD鋸齒分析推導得出。',
    variables: [
      {
        symbol: 'MSS',
        meaning: 'Maximum Segment Size (bytes)',
        meaningZh: '最大報文段長度（字節）',
      },
      {
        symbol: 'RTT',
        meaning: 'Round-trip time (seconds)',
        meaningZh: '往返時間（秒）',
      },
      {
        symbol: 'p',
        meaning: 'Loss probability (0 < p < 1)',
        meaningZh: '丟包概率（0 < p < 1）',
      },
    ],
    topicId: 'flow-congestion-control',
  },

  // ──────────────────────────────────────────────
  // Web & HTTP
  // ──────────────────────────────────────────────
  {
    id: 'wh-1',
    title: 'HTTP Non-Persistent Response Time',
    titleZh: 'HTTP 非持久連接響應時間',
    formula: 'T = 2 × RTT + O / R  (per object, serial)',
    description:
      'Time to fetch one object: 1 RTT for TCP handshake, 1 RTT for HTTP request/response, plus file transfer time. For N objects serially: N × (2RTT + O/R).',
    descriptionZh:
      '攞一個對象的時間：1個RTT用於TCP握手，1個RTT用於HTTP請求/響應，加上檔案傳輸時間。串行攞N個對象：N × (2RTT + O/R)。',
    variables: [
      {
        symbol: 'RTT',
        meaning: 'Round-trip time',
        meaningZh: '往返時間',
      },
      {
        symbol: 'O',
        meaning: 'Object size (bits)',
        meaningZh: '對象大小（比特）',
      },
      {
        symbol: 'R',
        meaning: 'Bandwidth (bps)',
        meaningZh: '帶寬（bps）',
      },
    ],
    topicId: 'web-http',
  },
  {
    id: 'wh-2',
    title: 'HTTP Persistent (no pipelining)',
    titleZh: 'HTTP 持久連接（無流水線）',
    formula: 'T = 2 × RTT + O / R + (N-1) × (RTT + O/R)',
    description:
      'One TCP connection, objects fetched one at a time. Only 1 handshake RTT, but still serial request/response for each object.',
    descriptionZh:
      '一個TCP連接，逐個攞對象。只需1次握手RTT，但每個對象仍需串行請求/響應。',
    variables: [
      {
        symbol: 'N',
        meaning: 'Number of objects',
        meaningZh: '對象數量',
      },
    ],
    topicId: 'web-http',
  },
  {
    id: 'wh-3',
    title: 'HTTP Pipelining Response Time',
    titleZh: 'HTTP 流水線響應時間',
    formula: 'T = 2 × RTT + N × O / R',
    description:
      'With pipelining, all N requests can be sent back-to-back after the handshake. Only the aggregate transfer time adds up.',
    descriptionZh:
      '使用流水線，握手後可以連續發送所有N個請求，只有累計傳輸時間相加。',
    variables: [
      {
        symbol: 'N',
        meaning: 'Number of referenced objects',
        meaningZh: '引用對象的數量',
      },
    ],
    topicId: 'web-http',
  },
  {
    id: 'wh-4',
    title: 'DNS Resolution Time',
    titleZh: 'DNS 解析時間',
    formula: 'T_DNS = n_rounds × RTT_DNS + RTT_authoritative',
    description:
      'Total DNS lookup time depends on number of iterative queries. Recursive resolver may need to contact root, TLD, and authoritative servers.',
    descriptionZh:
      'DNS查找總時間取決於迭代查詢次數。遞歸解析器可能需要聯繫根服務器、TLD服務器和權威服務器。',
    variables: [
      {
        symbol: 'n_rounds',
        meaning: 'Number of DNS query rounds',
        meaningZh: 'DNS查詢輪數',
      },
      {
        symbol: 'RTT_DNS',
        meaning: 'RTT to local DNS resolver',
        meaningZh: '到本地DNS解析器的RTT',
      },
    ],
    topicId: 'web-http',
  },

  // ──────────────────────────────────────────────
  // Advanced Congestion Control
  // ──────────────────────────────────────────────
  {
    id: 'acc-1',
    title: 'TCP CUBIC Window Growth',
    titleZh: 'TCP CUBIC 窗口增長',
    formula: 'W_cubic(t) = C × (t - K)³ + W_max',
    description:
      'CUBIC uses a cubic function for window growth instead of TCP Reno\'s linear increase. C is a scaling factor (default 0.4), t is elapsed time since last reduction, K = 3×W_max×β/C where β=0.2. After loss, window is reduced by 20%.',
    descriptionZh:
      'CUBIC使用三次函數進行窗口增長，而不是TCP Reno的線性增長。C是縮放因子（默認0.4），t是上次減少後經過的時間，K = 3×W_max×β/C，其中β=0.2。丟包後窗口減少20%。',
    variables: [
      { symbol: 'C', meaning: 'Scaling factor (default 0.4)', meaningZh: '縮放因子（默認0.4）' },
      { symbol: 't', meaning: 'Time since last window reduction', meaningZh: '上次窗口減少後的時間' },
      { symbol: 'K', meaning: 'Inflection point = 3·W_max·β/C', meaningZh: '拐點 = 3·W_max·β/C' },
      { symbol: 'W_max', meaning: 'Window size before last loss', meaningZh: '上次丟包前的窗口大小' },
      { symbol: 'β', meaning: 'Multiplicative decrease factor (0.2)', meaningZh: '乘性減少因子（0.2）' },
    ],
    topicId: 'advanced-congestion-control',
  },
  {
    id: 'acc-2',
    title: 'TCP Average Throughput (Sawtooth)',
    titleZh: 'TCP 平均吞吐量（鋸齒模型）',
    formula: 'Avg throughput = (3/4) × W / RTT  (bytes/sec)',
    description:
      'The average throughput under TCP Reno\'s sawtooth pattern: window grows linearly from W/2 to W, then drops to W/2. The average window is 3W/4, and throughput = average_window / RTT.',
    descriptionZh:
      'TCP Reno鋸齒模式下的平均吞吐量：窗口從W/2線性增長到W，然後降到W/2。平均窗口為3W/4，吞吐量 = 平均窗口 / RTT。',
    variables: [
      { symbol: 'W', meaning: 'Window size at loss point (bytes)', meaningZh: '丟包時的窗口大小（字節）' },
      { symbol: '3W/4', meaning: 'Average window size', meaningZh: '平均窗口大小' },
      { symbol: 'RTT', meaning: 'Round-trip time (seconds)', meaningZh: '往返時間（秒）' },
    ],
    topicId: 'advanced-congestion-control',
  },
  {
    id: 'acc-3',
    title: 'Jain\'s Fairness Index',
    titleZh: 'Jain 公平性指數',
    formula: 'F(x) = (Σxi)² / (n × Σxi²)',
    description:
      'Measures fairness of bandwidth allocation. F=1 means perfectly fair (equal shares), F→0 means maximally unfair. Used to compare how equally bandwidth is distributed among competing flows.',
    descriptionZh:
      '衡量帶寬分配的公平性。F=1表示完全公平（等分），F→0表示最大不公平。用於比較競爭流之間的帶寬分配均勻程度。',
    variables: [
      { symbol: 'xi', meaning: 'Bandwidth allocated to flow i', meaningZh: '分配畀流i的帶寬' },
      { symbol: 'n', meaning: 'Number of flows', meaningZh: '流數量' },
      { symbol: 'F', meaning: 'Fairness index (0 ≤ F ≤ 1)', meaningZh: '公平性指數（0 ≤ F ≤ 1）' },
    ],
    topicId: 'advanced-congestion-control',
  },
  {
    id: 'acc-4',
    title: 'Max-Min Fairness Allocation',
    titleZh: '最大最小公平分配',
    formula: 'ai = min(f, ri),  where  Σ(ai) = C',
    description:
      'Max-min bandwidth allocation: each flow gets min(f, ri), where f is chosen so the total equals capacity C. The Water Filling Algorithm achieves this by pouring bandwidth equally until demands are met.',
    descriptionZh:
      '最大最小帶寬分配：每個流得到min(f, ri)，其中f的選擇使總和等於容量C。注水算法通過等量注入帶寬直到需求被滿足來實現。',
    variables: [
      { symbol: 'ai', meaning: 'Allocated bandwidth to flow i', meaningZh: '分配畀流i的帶寬' },
      { symbol: 'f', meaning: 'Fair share level', meaningZh: '公平份額水平' },
      { symbol: 'ri', meaning: 'Bandwidth demand of flow i', meaningZh: '流i的帶寬需求' },
      { symbol: 'C', meaning: 'Total link capacity', meaningZh: '鏈路總容量' },
    ],
    topicId: 'advanced-congestion-control',
  },
  {
    id: 'acc-5',
    title: 'RTT Unfairness (Mathis)',
    titleZh: 'RTT 不公平性（Mathis）',
    formula: 'Share ∝ 1/RTT,  so shorter RTT flows get MORE bandwidth',
    description:
      'From Mathis equation, throughput ≈ (MSS/RTT)×(1/√p). A flow with 10ms RTT vs 50ms RTT gets only 1/6 of the bandwidth share, not 1/5. This is RTT unfairness inherent in loss-based congestion control.',
    descriptionZh:
      '根據Mathis公式，吞吐量 ≈ (MSS/RTT)×(1/√p)。10ms RTT的流相對於50ms RTT的流僅獲得1/6的帶寬份額（不是1/5）。呢是基於丟包的擁塞控制固有的RTT不公平性。',
    variables: [
      { symbol: 'RTT', meaning: 'Round-trip time of each flow', meaningZh: '每個流的往返時間' },
      { symbol: 'p', meaning: 'Shared loss probability', meaningZh: '共享的丟包概率' },
    ],
    topicId: 'advanced-congestion-control',
  },

  // ──────────────────────────────────────────────
  // Queue Management
  // ──────────────────────────────────────────────
  {
    id: 'qm-1',
    title: 'Fair Queueing: Virtual Finish Time',
    titleZh: '公平隊列：虛擬完成時間',
    formula: 'F_q,i = S_q,i + p_q,i',
    description:
      'In Fair Queueing, the virtual finish time of packet i in queue q equals its virtual start time plus its packet size. The scheduler transmits the packet with the smallest F_q,i next.',
    descriptionZh:
      '在公平隊列中，隊列q中數據包i的虛擬完成時間等於其虛擬開始時間加上數據包大小。調度器傳輸具有最小F_q,i的數據包。',
    variables: [
      { symbol: 'F_q,i', meaning: 'Virtual finish time for packet i in queue q', meaningZh: '隊列q中數據包i的虛擬完成時間' },
      { symbol: 'S_q,i', meaning: 'Virtual start time for packet i', meaningZh: '數據包i的虛擬開始時間' },
      { symbol: 'p_q,i', meaning: 'Size of packet i (bits)', meaningZh: '數據包i的大小（比特）' },
    ],
    topicId: 'queue-management',
  },
  {
    id: 'qm-2',
    title: 'Weighted Fair Queueing (WFQ)',
    titleZh: '加權公平隊列（WFQ）',
    formula: 'Fq,i = Sq,i + pq,i × (Σwi / wq)',
    description:
      'Weighted extension: F_q,i = S_q,i + p_q,i × (sum of all weights / weight of queue q). Flows with higher weights get proportionally more bandwidth. Used by ISPs for service tier differentiation.',
    descriptionZh:
      '加權擴展：F_q,i = S_q,i + p_q,i × (所有權重之和 / 隊列q的權重)。高權重流按比例獲得更多帶寬。ISP用於服務等級區分。',
    variables: [
      { symbol: 'wq', meaning: 'Weight of queue q', meaningZh: '隊列q的權重' },
      { symbol: 'Σwi', meaning: 'Sum of all queue weights', meaningZh: '所有隊列權重之和' },
      { symbol: 'pq,i', meaning: 'Size of packet i in queue q (bits)', meaningZh: '隊列q中數據包i的大小（比特）' },
    ],
    topicId: 'queue-management',
  },
  {
    id: 'qm-3',
    title: 'Token Bucket: Average Rate Constraint',
    titleZh: '令牌桶：平均速率約束',
    formula: 'Average rate ≤ r bits/sec,  Burst ≤ b bits',
    description:
      'A token bucket with token arrival rate r and bucket depth b ensures: average transmission rate ≤ r bits/sec, and maximum burst size ≤ b bits. Allows short bursts above r as long as tokens are available.',
    descriptionZh:
      '令牌桶的令牌到達速率r和桶深度b確保：平均傳輸速率 ≤ r bits/sec，最大突發大小 ≤ b比特。只要有令牌可用，允許短時間超過r的突發。',
    variables: [
      { symbol: 'r', meaning: 'Token arrival rate (bits/sec)', meaningZh: '令牌到達速率（bits/sec）' },
      { symbol: 'b', meaning: 'Bucket depth / burst capacity (bits)', meaningZh: '桶深度/突發容量（比特）' },
    ],
    topicId: 'queue-management',
  },
  {
    id: 'qm-4',
    title: 'Network Calculus: Arrival Curve',
    titleZh: '網絡微積分：到達曲線',
    formula: 'A(t) = r·t + b  (worst case, bucket starts full)',
    description:
      'The worst-case arrival curve for a token bucket with rate r and burst size b. Starts at b bits (full bucket) and grows at rate r. Represents an upper bound on total data that can arrive by time t.',
    descriptionZh:
      '令牌桶（速率r，突發大小b）的最壞情況到達曲線。從b比特開始（滿桶）並以速率r增長。表示到時間t為止可以到達的數據總量的上限。',
    variables: [
      { symbol: 'r', meaning: 'Token bucket rate (bits/sec)', meaningZh: '令牌桶速率（bits/sec）' },
      { symbol: 'b', meaning: 'Burst size (bits)', meaningZh: '突發大小（比特）' },
      { symbol: 'A(t)', meaning: 'Cumulative arrivals by time t (worst case)', meaningZh: '到時間t的累計到達量（最壞情況）' },
    ],
    topicId: 'queue-management',
  },
  {
    id: 'qm-5',
    title: 'Network Calculus: Queue Drain Time',
    titleZh: '網絡微積分：隊列排空時間',
    formula: 't_drain = b / (r2 - r1)  where A(t) = 2r1·t + 2b, S(t) = r2·t',
    description:
      'Set arrival curve = service curve to find when queue empties. For N identical flows with rate r1 and burst b sharing a link of rate r2: t_drain = 2b / (r2 - 2r1). Worst-case queuing delay equals t_drain.',
    descriptionZh:
      '設到達曲線=服務曲線來求隊列何時排空。N個相同流（速率r1，突發b）共享速率r2的鏈路：t_drain = 2b / (r2 - 2r1)。最壞情況排隊延遲等於t_drain。',
    variables: [
      { symbol: 't_drain', meaning: 'Time for queue to empty', meaningZh: '隊列排空時間' },
      { symbol: 'r2', meaning: 'Link/service rate (bits/sec)', meaningZh: '鏈路/服務速率（bits/sec）' },
      { symbol: 'r1', meaning: 'Per-flow token bucket rate', meaningZh: '每流令牌桶速率' },
      { symbol: 'b', meaning: 'Per-flow burst size', meaningZh: '每流突發大小' },
    ],
    topicId: 'queue-management',
  },

  // ──────────────────────────────────────────────
  // Video Streaming
  // ──────────────────────────────────────────────
  {
    id: 'vs-1',
    title: 'Video Bitrate',
    titleZh: '視頻比特率',
    formula: 'Bitrate = Frame Size × Frame Rate',
    description:
      'The data rate required to stream video. Higher resolution and frame rate require higher bitrate. Typical: 1080p@30fps ≈ 3-5 Mbps.',
    descriptionZh:
      '流式傳輸視頻所需的數據速率。更高的分辨率和幀率需要更高的比特率。典型值：1080p@30fps ≈ 3-5 Mbps。',
    variables: [
      {
        symbol: 'Frame Size',
        meaning: 'Image size per frame (bits)',
        meaningZh: '每幀圖像大小（比特）',
      },
      {
        symbol: 'Frame Rate',
        meaning: 'Frames per second (fps)',
        meaningZh: '每秒幀數（fps）',
      },
    ],
    topicId: 'video-streaming',
  },
  {
    id: 'vs-2',
    title: 'Buffer Occupancy',
    titleZh: '緩衝區佔用',
    formula: 'B(t) = B(t-1) + r(t) - C',
    description:
      'Buffer grows when arrival rate r(t) exceeds playback rate C, and drains when C exceeds r(t). Stalling occurs when B(t) = 0.',
    descriptionZh:
      '當到達速率r(t)超過播放速率C時緩衝區增長，反之緩衝區減少。當B(t)=0時發生卡頓。',
    variables: [
      {
        symbol: 'B(t)',
        meaning: 'Buffer level at time t (seconds)',
        meaningZh: '時刻t的緩衝區水平（秒）',
      },
      {
        symbol: 'r(t)',
        meaning: 'Video download rate at time t',
        meaningZh: '時刻t的視頻下載速率',
      },
      {
        symbol: 'C',
        meaning: 'Video encoding/playback rate',
        meaningZh: '視頻編碼/播放速率',
      },
    ],
    topicId: 'video-streaming',
  },
  {
    id: 'vs-3',
    title: 'Initial Playout Delay',
    titleZh: '初始播放延遲',
    formula: 'T_init = B_target / r_download',
    description:
      'Time before playback starts to fill the initial buffer to a target level B_target. Trade-off: larger buffer → more robust but higher startup delay.',
    descriptionZh:
      '播放前將初始緩衝區填充到目標水平B_target所需的時間。權衡：更大的緩衝區→更穩定但啓動延遲更高。',
    variables: [
      {
        symbol: 'B_target',
        meaning: 'Target buffer level (seconds)',
        meaningZh: '目標緩衝區水平（秒）',
      },
      {
        symbol: 'r_download',
        meaning: 'Download rate',
        meaningZh: '下載速率',
      },
    ],
    topicId: 'video-streaming',
  },
  {
    id: 'vs-4',
    title: 'DASH Adaptation Logic',
    titleZh: 'DASH 自適應邏輯',
    formula: 'Select max version k where: R_k < r(t) × (1 - safety_margin)',
    description:
      'Dynamic Adaptive Streaming over HTTP selects the highest quality version whose bitrate is below the current throughput with a safety margin.',
    descriptionZh:
      'HTTP動態自適應串流選擇比特率低於當前吞吐量（帶安全餘量）的最高質量版本。',
    variables: [
      {
        symbol: 'R_k',
        meaning: 'Bitrate of version k',
        meaningZh: '版本k的比特率',
      },
      {
        symbol: 'r(t)',
        meaning: 'Measured throughput',
        meaningZh: '測量的吞吐量',
      },
      {
        symbol: 'safety_margin',
        meaning: 'Safety buffer (e.g., 0.2)',
        meaningZh: '安全餘量（如0.2）',
      },
    ],
    topicId: 'video-streaming',
  },

  // ──────────────────────────────────────────────
  // IP - Internet Protocol
  // ──────────────────────────────────────────────
  {
    id: 'ip-1',
    title: 'Subnet Host Count',
    titleZh: '子網主機數',
    formula: 'Hosts = 2^(32 - n) - 2',
    description:
      'The number of usable host addresses in a subnet with prefix length n. Subtract 2 for network address and broadcast address. Example: /24 → 2^8 - 2 = 254 hosts.',
    descriptionZh:
      '前綴長度為n的子網中可用主機地址數。減去2是因為網絡地址和廣播地址不可用。例：/24 → 2^8 - 2 = 254台主機。',
    variables: [
      { symbol: 'n', meaning: 'Subnet prefix length (CIDR notation)', meaningZh: '子網前綴長度（CIDR表示）' },
      { symbol: '32 - n', meaning: 'Number of host bits', meaningZh: '主機位數' },
      { symbol: '-2', meaning: 'Network address + broadcast address', meaningZh: '網絡地址 + 廣播地址' },
    ],
    topicId: 'ip-protocol',
  },
  {
    id: 'ip-2',
    title: 'Number of Subnets',
    titleZh: '子網數量',
    formula: 'Subnets = 2^s',
    description:
      'The number of subnets created by borrowing s bits from the host portion. If the original prefix is /m and the new prefix is /n, then s = n - m.',
    descriptionZh:
      '從主機部分借用s位可創建的子網數量。如果原始前綴為/m，新前綴為/n，則s = n - m。',
    variables: [
      { symbol: 's', meaning: 'Number of subnet bits borrowed', meaningZh: '借用的子網位數' },
      { symbol: '2^s', meaning: 'Total number of subnets', meaningZh: '子網總數' },
    ],
    topicId: 'ip-protocol',
  },
  {
    id: 'ip-3',
    title: 'IPv4 Header Size',
    titleZh: 'IPv4 報文頭大小',
    formula: 'IPv4 header = 20 bytes (min) ~ 60 bytes (max)',
    description:
      'The minimum IPv4 header is 20 bytes (no options). Each option field uses 4 bytes, with up to 40 bytes of options (total 60 bytes). The IHL field specifies header length in 4-byte units.',
    descriptionZh:
      'IPv4頭部最小為20字節（無選項）。每個選項字段佔4字節，最多40字節選項（總共60字節）。IHL字段以4字節為單位指定頭部長度。',
    variables: [
      { symbol: '20 bytes', meaning: 'Minimum header (no options)', meaningZh: '最小頭部（無選項）' },
      { symbol: '60 bytes', meaning: 'Maximum header (40 bytes of options)', meaningZh: '最大頭部（40字節選項）' },
      { symbol: 'IHL', meaning: 'Internet Header Length field (in 32-bit words)', meaningZh: 'Internet頭部長度字段（以32位字為單位）' },
    ],
    topicId: 'ip-protocol',
  },
  {
    id: 'ip-4',
    title: 'CIDR Notation & Subnet Mask',
    titleZh: 'CIDR 表示法與子網遮罩',
    formula: 'CIDR: a.b.c.d/n  →  Subnet Mask: n ones + (32-n) zeros',
    description:
      'CIDR notation a.b.c.d/n specifies an IP address with a prefix of n network bits. The subnet mask has n consecutive 1-bits followed by (32-n) 0-bits. Example: 192.168.1.0/24 → mask 255.255.255.0.',
    descriptionZh:
      'CIDR表示法a.b.c.d/n指定一個帶有n位網絡前綴的IP地址。子網遮罩有n個連續的1位後跟(32-n)個0位。例：192.168.1.0/24 → 遮罩255.255.255.0。',
    variables: [
      { symbol: 'n', meaning: 'Prefix length (network bits)', meaningZh: '前綴長度（網絡位數）' },
      { symbol: 'a.b.c.d', meaning: 'Network address', meaningZh: '網絡地址' },
      { symbol: '32-n', meaning: 'Host bits', meaningZh: '主機位數' },
    ],
    topicId: 'ip-protocol',
  },

  // ──────────────────────────────────────────────
  // BGP - Border Gateway Protocol
  // ──────────────────────────────────────────────
  {
    id: 'bgp-1',
    title: 'BGP Route Selection: AS_PATH',
    titleZh: 'BGP 路由選擇：AS_PATH',
    formula: 'Prefer route with SHORTER AS_PATH length',
    description:
      'Among multiple routes to the same destination, BGP prefers the route with the fewest AS numbers in the AS_PATH attribute. This is one of the key decision steps in the BGP best path selection algorithm.',
    descriptionZh:
      '在到達同一目的地的多條路由中，BGP優先選擇AS_PATH屬性中AS編號最少的那條。呢是BGP最佳路徑選擇算法的關鍵決策步驟之一。',
    variables: [
      { symbol: 'AS_PATH', meaning: 'Ordered list of ASes traversed', meaningZh: '經過的AS有序列表' },
      { symbol: 'Length', meaning: 'Number of ASes in the path', meaningZh: '路徑中AS的數量' },
    ],
    topicId: 'bgp-routing',
  },
  {
    id: 'bgp-2',
    title: 'BGP Route Selection Criteria',
    titleZh: 'BGP 路由選擇標準',
    formula: '1. Highest LOCAL_PREF → 2. Shortest AS_PATH → 3. Best IGP metric → ...',
    description:
      'BGP selects the best route through an ordered decision process: (1) Highest LOCAL_PREF, (2) Shortest AS_PATH, (3) Lowest IGP cost to next-hop, (4) Lowest MED, (5) eBGP over iBGP, (6) Lowest IGP router ID.',
    descriptionZh:
      'BGP通過有序決策過程選擇最佳路由：(1)最高LOCAL_PREF，(2)最短AS_PATH，(3)到下一跳的最低IGP代價，(4)最低MED，(5)eBGP優於iBGP，(6)最低IGP路由器ID。',
    variables: [
      { symbol: 'LOCAL_PREF', meaning: 'Local preference (well-known discretionary)', meaningZh: '本地優先級（公認自主屬性）' },
      { symbol: 'MED', meaning: 'Multi-Exit Discriminator (optional non-transitive)', meaningZh: '多出口鑑別器（可選非傳遞屬性）' },
      { symbol: 'IGP metric', meaning: 'Interior gateway protocol cost to BGP next-hop', meaningZh: '到BGP下一跳的內部網關協定代價' },
    ],
    topicId: 'bgp-routing',
  },
  {
    id: 'bgp-3',
    title: 'LOCAL_PREF vs MED',
    titleZh: 'LOCAL_PREF 與 MED',
    formula: 'LOCAL_PREF: outbound policy (higher wins) | MED: inbound policy (lower wins)',
    description:
      'LOCAL_PREF is set by the receiving AS and communicated within the AS — it controls outbound traffic. MED is set by the neighboring AS to influence inbound traffic — lower MED is preferred. LOCAL_PREF is evaluated BEFORE MED in best-path selection.',
    descriptionZh:
      'LOCAL_PREF由接收方AS設定並在AS內部傳播——它控制出站流量。MED由鄰居AS設定以影響入站流量——較低的MED優先。在最佳路徑選擇中LOCAL_PREF先於MED評估。',
    variables: [
      { symbol: 'LOCAL_PREF', meaning: 'Intra-AS attribute, controls which exit to use', meaningZh: 'AS內部屬性，控制使用哪個出口' },
      { symbol: 'MED', meaning: 'Inter-AS attribute, hints preferred entry point', meaningZh: 'AS間屬性，提示首選入口點' },
      { symbol: 'Higher / Lower', meaning: 'Preference direction for each attribute', meaningZh: '各屬性的偏好方向' },
    ],
    topicId: 'bgp-routing',
  },
  {
    id: 'bgp-4',
    title: 'iBGP Full Mesh Requirement',
    titleZh: 'iBGP 全互連要求',
    formula: 'iBGP sessions needed = n × (n - 1) / 2',
    description:
      'In iBGP, all routers within an AS must be fully meshed (each pair has a session) to avoid routing loops, because iBGP routes are not forwarded to other iBGP peers. For large ASes, route reflectors are used to reduce the mesh.',
    descriptionZh:
      '在iBGP中，AS內所有路由器必須全互連（每對路由器都有會話）以避免路由環路，因為iBGP路由不會轉發畀其他iBGP對等體。對於大型AS，使用路由反射器來減少互連。',
    variables: [
      { symbol: 'n', meaning: 'Number of BGP routers in the AS', meaningZh: 'AS中BGP路由器數量' },
      { symbol: 'n(n-1)/2', meaning: 'Number of iBGP sessions (full mesh)', meaningZh: 'iBGP會話數量（全互連）' },
    ],
    topicId: 'bgp-routing',
  },

  // ──────────────────────────────────────────────
  // Internet Architecture
  // ──────────────────────────────────────────────
  {
    id: 'ia-1',
    title: 'ISP Transit Cost',
    titleZh: 'ISP 轉接成本',
    formula: 'Cost ∝ traffic_volume × transit_price_per_bps',
    description:
      'An ISP pays upstream transit providers based on the volume of traffic exchanged. The cost is proportional to the 95th percentile traffic rate multiplied by the per-Mbps transit price. Tier-1 ISPs have no upstream and peer for free.',
    descriptionZh:
      'ISP向上遊轉接提供商付費基於交換的流量。成本與第95百分位流量速率乘以每Mbps轉接價格成正比。一級ISP冇上游並免費對等。',
    variables: [
      { symbol: 'traffic_volume', meaning: '95th percentile traffic rate (Mbps)', meaningZh: '第95百分位流量速率（Mbps）' },
      { symbol: 'transit_price', meaning: 'Per-Mbps transit cost ($/Mbps/month)', meaningZh: '每Mbps轉接成本（$/Mbps/月）' },
    ],
    topicId: 'internet-architecture',
  },
  {
    id: 'ia-2',
    title: 'IXP Peering Savings',
    titleZh: 'IXP 對等節省',
    formula: 'Savings = (peer_traffic / total_traffic) × transit_cost',
    description:
      'By peering at an Internet Exchange Point (IXP), ISPs can exchange traffic directly instead of paying transit. The savings equal the fraction of traffic that can be offloaded to peers times the transit cost. Traffic stays local → lower latency + lower cost.',
    descriptionZh:
      '通過在互聯網交換點（IXP）對等互聯，ISP可以直接交換流量而無需支付轉接費。節省量等於可以卸載到對等體的流量比例乘以轉接成本。流量保持本地→更低延遲+更低成本。',
    variables: [
      { symbol: 'peer_traffic', meaning: 'Traffic exchanged via peering', meaningZh: '通過對等交換的流量' },
      { symbol: 'total_traffic', meaning: 'Total traffic volume', meaningZh: '總流量' },
      { symbol: 'transit_cost', meaning: 'Cost of sending via upstream transit', meaningZh: '通過上游轉接發送的成本' },
    ],
    topicId: 'internet-architecture',
  },
  {
    id: 'ia-3',
    title: 'Internet Tier Hierarchy',
    titleZh: '互聯網層級結構',
    formula: 'Tier 1 → Tier 2 → Tier 3 (access networks)',
    description:
      'Tier 1 ISPs form the Internet backbone and peer freely. Tier 2 ISPs connect to Tier 1 (paying transit) and may also peer at IXPs. Tier 3 (access) ISPs connect end-users and buy transit from Tier 1/2. Lower tiers pay for transit; same-tier peers exchange traffic for free.',
    descriptionZh:
      '一級ISP構成互聯網骨幹並自由對等。二級ISP連接一級ISP（支付轉接費）並可能在IXP對等。三級（接入）ISP連接終端用户並向一級/二級購買轉接。低層級支付轉接費；同層級免費交換流量。',
    variables: [
      { symbol: 'Tier 1', meaning: 'Backbone, settlement-free peering', meaningZh: '骨幹網，免費對等' },
      { symbol: 'Tier 2', meaning: 'Regional, buys transit + may peer', meaningZh: '區域網，購買轉接+可能對等' },
      { symbol: 'Tier 3', meaning: 'Access ISP, pays for upstream transit', meaningZh: '接入ISP，支付上游轉接費' },
    ],
    topicId: 'internet-architecture',
  },

  // ──────────────────────────────────────────────
  // LAN - Local Area Networks
  // ──────────────────────────────────────────────
  {
    id: 'lan-1',
    title: 'Ethernet Efficiency (CSMA/CD)',
    titleZh: '以太網效率（CSMA/CD）',
    formula: 'Efficiency = 1 / (1 + 5 × d_prop / d_trans)',
    description:
      'The maximum efficiency of CSMA/CD depends on the ratio of propagation delay to transmission delay. For long, slow links, efficiency drops. Modern switched Ethernet eliminates collisions, effectively achieving near 100% efficiency.',
    descriptionZh:
      'CSMA/CD的最大效率取決於傳播延遲與傳輸延遲之比。對於長而慢的鏈路，效率下降。現代交換式以太網消除了衝突，實際上實現了接近100%的效率。',
    variables: [
      { symbol: 'd_prop', meaning: 'Propagation delay (one-way)', meaningZh: '傳播延遲（單向）' },
      { symbol: 'd_trans', meaning: 'Transmission delay = L/R', meaningZh: '傳輸延遲 = L/R' },
      { symbol: '5', meaning: 'Factor from worst-case collision scenario', meaningZh: '最壞衝突場景的系數' },
    ],
    topicId: 'lan-networks',
  },
  {
    id: 'lan-2',
    title: 'MAC Address Format',
    titleZh: 'MAC 地址格式',
    formula: 'MAC = 48 bits = 6 bytes (hex: AA:BB:CC:DD:EE:FF)',
    description:
      'Ethernet MAC addresses are 48 bits: first 24 bits = Organizationally Unique Identifier (OUI) assigned by IEEE, last 24 bits = unique identifier. The least significant bit of the first byte indicates multicast (1) vs unicast (0). The second bit indicates locally (1) vs globally (0) administered.',
    descriptionZh:
      '以太網MAC地址為48位：前24位=IEEE分配的組織唯一標識符（OUI），後24位=唯一標識符。第一個字節的最低有效位表示多播(1)vs單播(0)。第二位表示本地(1)vs全局(0)管理。',
    variables: [
      { symbol: '48 bits', meaning: 'Total MAC address length', meaningZh: 'MAC地址總長度' },
      { symbol: 'OUI (24 bits)', meaning: 'Organizationally Unique Identifier', meaningZh: '組織唯一標識符' },
      { symbol: 'U/L bit', meaning: 'Unicast (0) / Multicast (1) bit', meaningZh: '單播(0) / 多播(1)位' },
    ],
    topicId: 'lan-networks',
  },
  {
    id: 'lan-3',
    title: 'Ethernet Frame Size',
    titleZh: '以太網幀大小',
    formula: 'Frame = 64 bytes (min) ~ 1518 bytes (max)  |  MTU = 1500 bytes',
    description:
      'Ethernet frame: 8-byte preamble + 14-byte header (dst MAC + src MAC + type) + payload (46–1500 bytes) + 4-byte FCS. Minimum 64 bytes ensures collision detection works. Maximum 1518 bytes (standard). Jumbo frames: up to 9000 bytes.',
    descriptionZh:
      '以太網幀：8字節前導碼 + 14字節頭部（目的MAC + 源MAC + 類型）+ 載荷（46-1500字節）+ 4字節FCS。最小64字節確保衝突檢測有效。最大1518字節（標準）。巨型幀：最大9000字節。',
    variables: [
      { symbol: '64 bytes', meaning: 'Minimum frame (ensures collision detection)', meaningZh: '最小幀（確保衝突檢測）' },
      { symbol: 'MTU = 1500B', meaning: 'Maximum payload (IP datagram)', meaningZh: '最大載荷（IP數據報）' },
      { symbol: '1518 bytes', meaning: 'Maximum frame (header + payload + FCS)', meaningZh: '最大幀（頭部+載荷+FCS）' },
    ],
    topicId: 'lan-networks',
  },
  {
    id: 'lan-4',
    title: 'Ethernet Throughput Calculation',
    titleZh: '以太網吞吐量計算',
    formula: 'Effective_rate = Link_rate × (Payload / Frame_size)',
    description:
      'Due to header/preamble overhead, the effective throughput is less than the raw link rate. For Fast Ethernet (100 Mbps) with 1500B payload and 38B overhead: effective ≈ 100 × (1500/1538) ≈ 97.5 Mbps.',
    descriptionZh:
      '由於頭部/前導碼開銷，有效吞吐量低於原始鏈路速率。對於100Mbps快速以太網，1500B載荷和38B開銷：有效 ≈ 100 × (1500/1538) ≈ 97.5 Mbps。',
    variables: [
      { symbol: 'Link_rate', meaning: 'Raw link speed (e.g., 100 Mbps, 1 Gbps)', meaningZh: '原始鏈路速率（如100Mbps，1Gbps）' },
      { symbol: 'Payload', meaning: 'Data payload per frame (bytes)', meaningZh: '每幀數據載荷（字節）' },
      { symbol: 'Frame_size', meaning: 'Total frame including headers and FCS', meaningZh: '包含頭部和FCS的總幀大小' },
    ],
    topicId: 'lan-networks',
  },

  // ──────────────────────────────────────────────
  // Distance Vector Routing
  // ──────────────────────────────────────────────
  {
    id: 'dv-1',
    title: 'Bellman-Ford Equation',
    titleZh: 'Bellman-Ford 方程',
    formula: 'Dx(y) = min_v{ c(x,v) + Dv(y) }',
    description:
      'The minimum cost from node x to destination y is the minimum over all neighbors v of: the direct cost from x to v plus the estimated cost from v to y. Each node iteratively exchanges distance vectors with neighbors until convergence.',
    descriptionZh:
      '從節點x到目的地y的最小代價是所有鄰居v的最小值：從x到v的直接代價加上從v到y的估計代價。每個節點迭代地與鄰居交換距離向量直到收斂。',
    variables: [
      { symbol: 'Dx(y)', meaning: 'Minimum cost from x to y', meaningZh: '從x到y的最小代價' },
      { symbol: 'c(x,v)', meaning: 'Direct link cost from x to neighbor v', meaningZh: '從x到鄰居v的直接鏈路代價' },
      { symbol: 'Dv(y)', meaning: 'Distance from neighbor v to destination y', meaningZh: '從鄰居v到目的地y的距離' },
      { symbol: 'v', meaning: 'Each neighbor of x', meaningZh: 'x的每個鄰居' },
    ],
    topicId: 'distance-vector-routing',
  },
  {
    id: 'dv-2',
    title: 'RIP Hop Count Limit',
    titleZh: 'RIP 跳數限制',
    formula: 'Max RIP hops = 15  |  16 = unreachable (infinity)',
    description:
      'RIP uses hop count as the metric with a maximum of 15 hops. A hop count of 16 means the destination is unreachable (infinity). This limits RIP to networks with a diameter of at most 15 hops. The small infinity value speeds up convergence but restricts network size.',
    descriptionZh:
      'RIP使用跳數作為度量，最大15跳。16跳錶示目的地不可達（無窮大）。呢限制了RIP適用於直徑最多15跳的網絡。較小的無窮大值加速收斂但限制了網絡規模。',
    variables: [
      { symbol: '15 hops', meaning: 'Maximum RIP hop count', meaningZh: 'RIP最大跳數' },
      { symbol: '16', meaning: 'RIP infinity (unreachable)', meaningZh: 'RIP無窮大（不可達）' },
      { symbol: 'Hop count', meaning: 'Number of routers traversed', meaningZh: '經過的路由器數量' },
    ],
    topicId: 'distance-vector-routing',
  },
  {
    id: 'dv-3',
    title: 'Count-to-Infinity Problem',
    titleZh: '計數到無窮大問題',
    formula: 'Poison reverse: advertise infinite cost (16) back to the neighbor from which the route was learned',
    description:
      'When a link fails, distance vector routing may slowly converge as nodes incrementally increase their cost estimates (counting to infinity). Poison reverse helps by advertising ∞ back to the route\'s source. Split horizon helps by not advertising a route back to the neighbor it came from.',
    descriptionZh:
      '當鏈路故障時，距離向量路由可能因為節點逐步增加代價估計而緩慢收斂（計數到無窮大）。毒性逆轉通過向路由源通告無窮大來幫助。水平分割通過不向路由來源鄰居通告該路由來幫助。',
    variables: [
      { symbol: 'Poison reverse', meaning: 'Set cost to ∞ when advertising back to source neighbor', meaningZh: '向源鄰居回傳時將代價設為∞' },
      { symbol: 'Split horizon', meaning: 'Don\'t advertise route to the neighbor it came from', meaningZh: '不向路由來源鄰居通告該路由' },
      { symbol: '∞ (RIP)', meaning: '16 hops in RIP', meaningZh: 'RIP中16跳' },
    ],
    topicId: 'distance-vector-routing',
  },
  {
    id: 'dv-4',
    title: 'Distance Vector Convergence Time',
    titleZh: '距離向量收斂時間',
    formula: 'T_converge ≈ hops_to_propagate × update_interval',
    description:
      'After a topology change, the time for all routers to converge depends on the number of hops the change must propagate and the periodic update interval. RIP sends updates every 30 seconds, so convergence can take minutes for large networks.',
    descriptionZh:
      '拓撲變化後，所有路由器收斂的時間取決於變化需要傳播的跳數和週期性更新間隔。RIP每30秒發送更新，因呢個大型網絡的收斂可能需要幾分鐘。',
    variables: [
      { symbol: 'update_interval', meaning: 'Periodic DV update interval (RIP: 30s)', meaningZh: '週期性DV更新間隔（RIP: 30秒）' },
      { symbol: 'hops_to_propagate', meaning: 'Network diameter for the change', meaningZh: '變化的網絡直徑' },
      { symbol: 'T_converge', meaning: 'Approximate convergence time', meaningZh: '近似收斂時間' },
    ],
    topicId: 'distance-vector-routing',
  },

  // ──────────────────────────────────────────────
  // Link Layer
  // ──────────────────────────────────────────────
  {
    id: 'll-1',
    title: 'CRC Error Detection',
    titleZh: 'CRC 錯誤檢測',
    formula: 'T(x) = M(x) × x^r + R(x)',
    description:
      'CRC encoding: multiply message polynomial M(x) by x^r (append r zeros), then divide by generator polynomial G(x). The remainder R(x) is the CRC checksum. At the receiver, if T(x) mod G(x) = 0, no error detected. CRC-32 detects all single-bit, double-bit, and burst errors ≤ 32 bits.',
    descriptionZh:
      'CRC編碼：將訊息多項式M(x)乘以x^r（追加r個零），然後除以生成多項式G(x)。餘數R(x)是CRC校驗和。在接收端，若T(x) mod G(x) = 0，則未檢測到錯誤。CRC-32可檢測所有單位、雙位錯誤和≤32位的突發錯誤。',
    variables: [
      { symbol: 'M(x)', meaning: 'Message polynomial', meaningZh: '訊息多項式' },
      { symbol: 'G(x)', meaning: 'Generator polynomial (e.g., CRC-32)', meaningZh: '生成多項式（如CRC-32）' },
      { symbol: 'R(x)', meaning: 'CRC remainder (r bits)', meaningZh: 'CRC餘數（r位）' },
      { symbol: 'r', meaning: 'Degree of generator polynomial', meaningZh: '生成多項式的次數' },
    ],
    topicId: 'link-layer',
  },
  {
    id: 'll-2',
    title: 'Pure ALOHA Efficiency',
    titleZh: '純 ALOHA 效率',
    formula: 'S = G × e^(-2G)  |  Max at G = 0.5: S_max = 1/(2e) ≈ 18.4%',
    description:
      'Pure ALOHA: stations transmit anytime. A frame is vulnerable to collision for twice its transmission time (2×T). Maximum throughput S_max ≈ 18.4% occurs at offered load G = 0.5. The effective rate is very low due to high collision probability.',
    descriptionZh:
      '純ALOHA：站點隨時發送。幀在2倍傳輸時間（2×T）內容易衝突。最大吞吐量S_max ≈ 18.4%出現在負載G = 0.5時。由於衝突概率高，有效速率非常低。',
    variables: [
      { symbol: 'S', meaning: 'Successful throughput (frames per frame time)', meaningZh: '成功吞吐量（每幀時間的幀數）' },
      { symbol: 'G', meaning: 'Offered load (frames per frame time)', meaningZh: '提供負載（每幀時間的幀數）' },
      { symbol: '2T', meaning: 'Vulnerable period (twice frame transmission time)', meaningZh: '脆弱期（幀傳輸時間的兩倍）' },
      { symbol: 'S_max ≈ 18.4%', meaning: 'Maximum Pure ALOHA efficiency', meaningZh: '純ALOHA最大效率' },
    ],
    topicId: 'link-layer',
  },
  {
    id: 'll-3',
    title: 'Slotted ALOHA Efficiency',
    titleZh: '時隙 ALOHA 效率',
    formula: 'S = G × e^(-G)  |  Max at G = 1: S_max = 1/e ≈ 36.8%',
    description:
      'Slotted ALOHA divides time into slots equal to frame transmission time. Frames only start at slot boundaries, reducing the vulnerable period from 2T to T. Maximum throughput doubles to S_max ≈ 36.8% at G = 1.',
    descriptionZh:
      '時隙ALOHA將時間分成等於幀傳輸時間的時隙。幀只在時隙邊界開始傳輸，將脆弱期從2T減少到T。最大吞吐量翻倍到S_max ≈ 36.8%（G = 1時）。',
    variables: [
      { symbol: 'S', meaning: 'Successful throughput', meaningZh: '成功吞吐量' },
      { symbol: 'G', meaning: 'Offered load', meaningZh: '提供負載' },
      { symbol: 'T', meaning: 'Vulnerable period (one frame time)', meaningZh: '脆弱期（一個幀時間）' },
      { symbol: 'S_max ≈ 36.8%', meaning: 'Maximum Slotted ALOHA efficiency (2× Pure ALOHA)', meaningZh: '時隙ALOHA最大效率（純ALOHA的2倍）' },
    ],
    topicId: 'link-layer',
  },
  {
    id: 'll-4',
    title: 'CSMA Efficiency',
    titleZh: 'CSMA 效率',
    formula: 'Eff_CSMA = 1 / (1 + 5 × d_prop / d_trans)  (for 1-persistent)',
    description:
      'CSMA (Carrier Sense Multiple Access) senses the channel before transmitting, which improves efficiency over ALOHA. The 1-persistent CSMA/CD efficiency formula accounts for propagation delay relative to frame transmission time. Lower d_prop/d_trans ratio → higher efficiency.',
    descriptionZh:
      'CSMA（載波偵聽多路存取）在發送前偵聽信道，比ALOHA提高效率。1-堅持CSMA/CD效率公式考慮了幀傳輸時間與傳播延遲之比。較低的d_prop/d_trans比→更高的效率。',
    variables: [
      { symbol: 'd_prop', meaning: 'Maximum propagation delay between any two nodes', meaningZh: '任意兩節點間的最大傳播延遲' },
      { symbol: 'd_trans', meaning: 'Frame transmission time = L/R', meaningZh: '幀傳輸時間 = L/R' },
      { symbol: '1-persistent', meaning: 'Transmit immediately when channel free', meaningZh: '信道空閒時立即發送' },
    ],
    topicId: 'link-layer',
  },

  // ──────────────────────────────────────────────
  // Wireless Networks
  // ──────────────────────────────────────────────
  {
    id: 'wn-1',
    title: 'WiFi Effective Throughput',
    titleZh: 'WiFi 有效吞吐量',
    formula: 'Effective_rate ≈ Raw_rate × (1 - overhead_fraction)',
    description:
      'WiFi effective throughput is significantly lower than the raw PHY rate due to MAC-layer overhead: DIFS, SIFS, ACK frames, inter-frame spaces, and contention (backoff). Typical: 802.11n 300 Mbps raw → ~100 Mbps effective (~33% efficiency).',
    descriptionZh:
      'WiFi有效吞吐量由於MAC層開銷（DIFS、SIFS、ACK幀、幀間間隔和競爭退避）顯著低於原始PHY速率。典型：802.11n 300Mbps原始→約100Mbps有效（約33%效率）。',
    variables: [
      { symbol: 'Raw_rate', meaning: 'Physical layer data rate (e.g., 300 Mbps)', meaningZh: '物理層數據速率（如300Mbps）' },
      { symbol: 'overhead_fraction', meaning: 'MAC overhead (DIFS, SIFS, ACK, backoff, etc.)', meaningZh: 'MAC開銷（DIFS、SIFS、ACK、退避等）' },
      { symbol: '~33%', meaning: 'Typical efficiency for 802.11n', meaningZh: '802.11n的典型效率' },
    ],
    topicId: 'wireless-networks',
  },
  {
    id: 'wn-2',
    title: 'Hidden Terminal Problem',
    titleZh: '隱藏終端問題',
    formula: 'Collision risk when: d(A,C) > range AND d(A,B) ≤ range AND d(B,C) ≤ range',
    description:
      'When nodes A and C are both within range of B but not each other, both may transmit to B simultaneously causing a collision at B. CSMA cannot detect this because each node senses the channel as idle. Solutions: RTS/CTS handshake (802.11), busy tone, or increased transmit power.',
    descriptionZh:
      '當節點A和C都在B的範圍內但互相不在時，兩者可能同時向B發送導致B處衝突。CSMA無法檢測到呢種情況，因為每個節點都感測信道空閒。解決方案：RTS/CTS握手（802.11）、忙音或增加發射功率。',
    variables: [
      { symbol: 'range', meaning: 'Wireless signal transmission range', meaningZh: '無線信號傳輸範圍' },
      { symbol: 'RTS/CTS', meaning: 'Request to Send / Clear to Send handshake', meaningZh: '請求發送/允許發送握手' },
      { symbol: 'd(A,C)', meaning: 'Distance between hidden terminals', meaningZh: '隱藏終端之間的距離' },
    ],
    topicId: 'wireless-networks',
  },
  {
    id: 'wn-3',
    title: 'CSMA/CA Binary Exponential Backoff',
    titleZh: 'CSMA/CA 二進制指數退避',
    formula: 'Backoff = uniform(0, CW) × slot_time,  CW = 2^(min(k,10)) - 1',
    description:
      'In 802.11 CSMA/CA, after each collision the contention window (CW) doubles: CW_min=15 (k=0), CW_max=1023 (k=10). The node picks a random backoff from [0, CW] slot times. After a successful transmission, CW resets to CW_min. Slot time = 20 μs for 802.11b.',
    descriptionZh:
      '在802.11 CSMA/CA中，每次衝突後競爭窗口(CW)翻倍：CW_min=15 (k=0), CW_max=1023 (k=10)。節點從[0, CW]時隙中隨機選擇退避值。成功傳輸後CW重置為CW_min。802.11b的時隙時間=20μs。',
    variables: [
      { symbol: 'CW', meaning: 'Contention window size', meaningZh: '競爭窗口大小' },
      { symbol: 'k', meaning: 'Number of retries (up to 10)', meaningZh: '重試次數（最多10次）' },
      { symbol: 'slot_time', meaning: 'Basic time unit (20 μs for 802.11b)', meaningZh: '基本時間單位（802.11b為20μs）' },
    ],
    topicId: 'wireless-networks',
  },

  // ──────────────────────────────────────────────
  // New Network Technologies
  // ──────────────────────────────────────────────
  {
    id: 'nn-1',
    title: 'SDN Architecture Layers',
    titleZh: 'SDN 架構層級',
    formula: 'Application Layer ↔ Control Layer (controllers) ↔ Data Plane (switches) via OpenFlow API',
    description:
      'Software-Defined Networking separates the control plane from the data plane. The application layer runs network apps (firewall, load balancer). The control layer has SDN controllers maintaining a global network view. The data plane forwards packets according to flow rules. Communication via OpenFlow protocol.',
    descriptionZh:
      '軟件定義網絡將控制平面與數據平面分離。應用層運行網絡應用（防火牆、負載均衡器）。控制層有SDN控制器維護全局網絡視圖。數據平面根據流規則轉發數據包。通過OpenFlow協定通信。',
    variables: [
      { symbol: 'Application Layer', meaning: 'Network programs/apps (firewall, routing, etc.)', meaningZh: '網絡程序/應用（防火牆、路由等）' },
      { symbol: 'Control Layer', meaning: 'SDN controllers with global network view', meaningZh: '具有全局網絡視圖的SDN控制器' },
      { symbol: 'Data Plane', meaning: 'Switches/routers forwarding packets', meaningZh: '轉發數據包的交換機/路由器' },
      { symbol: 'OpenFlow', meaning: 'Southbound API between controller and switches', meaningZh: '控制器與交換機之間的南向API' },
    ],
    topicId: 'new-networks',
  },
  {
    id: 'nn-2',
    title: 'SDN Flow Table Matching',
    titleZh: 'SDN 流表匹配',
    formula: 'Match: (src_ip, dst_ip, src_port, dst_port, protocol, in_port) → Action: (forward, drop, modify)',
    description:
      'SDN switches use flow tables to determine how to handle packets. Each flow entry matches on header fields (L2-L4) and specifies actions: FORWARD (output port), DROP, or MODIFY (rewrite headers). Tables are populated by the SDN controller via OpenFlow.',
    descriptionZh:
      'SDN交換機使用流表來確定如何處理數據包。每個流條目匹配頭部字段（L2-L4）並指定操作：FORWARD（輸出端口）、DROP或MODIFY（重寫頭部）。流表由SDN控制器通過OpenFlow填充。',
    variables: [
      { symbol: 'Match fields', meaning: 'Packet header fields for rule matching', meaningZh: '用於規則匹配的數據包頭部字段' },
      { symbol: 'Action', meaning: 'What to do with matching packets', meaningZh: '對匹配數據包的操作' },
      { symbol: 'Priority', meaning: 'Rule priority (higher = checked first)', meaningZh: '規則優先級（越高越先檢查）' },
    ],
    topicId: 'new-networks',
  },
  {
    id: 'nn-3',
    title: 'NFV Resource Allocation',
    titleZh: 'NFV 資源分配',
    formula: 'VNF CPU = Σ(req_i × load_i) ≤ total_cpu',
    description:
      'Network Function Virtualization (NFV) runs network functions as software (VNFs) on commodity servers. Resource allocation must ensure the sum of each VNF\'s required CPU per unit load, multiplied by its load, does not exceed total available CPU. Key benefit: elastic scaling of network functions.',
    descriptionZh:
      '網絡功能虛擬化（NFV）在通用服務器上以軟件（VNF）形式運行網絡功能。資源分配必須確保每個VNF的單位負載所需CPU乘以其負載之和不超過總可用CPU。核心優勢：網絡功能的彈性擴展。',
    variables: [
      { symbol: 'req_i', meaning: 'CPU required by VNF i per unit load', meaningZh: 'VNF i每單位負載所需CPU' },
      { symbol: 'load_i', meaning: 'Current traffic load on VNF i', meaningZh: 'VNF i當前流量負載' },
      { symbol: 'total_cpu', meaning: 'Total server CPU capacity', meaningZh: '服務器總CPU容量' },
    ],
    topicId: 'new-networks',
  },

  // ──────────────────────────────────────────────
  // Network Security
  // ──────────────────────────────────────────────
  {
    id: 'ns-1',
    title: 'RSA Encryption & Decryption',
    titleZh: 'RSA 加密與解密',
    formula: 'Encrypt: C = M^e mod n  |  Decrypt: M = C^d mod n',
    description:
      'RSA key generation: choose primes p, q → n = p×q, φ(n) = (p-1)(q-1). Choose e such that gcd(e, φ(n)) = 1. Compute d such that e×d ≡ 1 (mod φ(n)). Public key = (e, n), Private key = (d, n). Security relies on difficulty of factoring large n.',
    descriptionZh:
      'RSA密鑰生成：選擇素數p, q → n = p×q, φ(n) = (p-1)(q-1)。選擇e使gcd(e, φ(n)) = 1。計算d使e×d ≡ 1 (mod φ(n))。公鑰=(e, n)，私鑰=(d, n)。安全性依賴於大數n的因式分解困難。',
    variables: [
      { symbol: 'M', meaning: 'Plaintext message (integer < n)', meaningZh: '明文訊息（整數 < n）' },
      { symbol: 'C', meaning: 'Ciphertext', meaningZh: '密文' },
      { symbol: 'e', meaning: 'Public exponent', meaningZh: '公鑰指數' },
      { symbol: 'd', meaning: 'Private exponent', meaningZh: '私鑰指數' },
      { symbol: 'n = p×q', meaning: 'RSA modulus (product of two large primes)', meaningZh: 'RSA模數（兩個大素數的乘積）' },
    ],
    topicId: 'network-security',
  },
  {
    id: 'ns-2',
    title: 'Diffie-Hellman Key Exchange',
    titleZh: 'Diffie-Hellman 密鑰交換',
    formula: 'Shared secret = (g^b mod p)^a mod p = (g^a mod p)^b mod p = g^(ab) mod p',
    description:
      'Alice and Bob agree on public prime p and base g. Alice sends g^a mod p, Bob sends g^b mod p. Both compute g^(ab) mod p as the shared secret. An eavesdropper cannot compute the secret from g, g^a mod p, and g^b mod p without solving the discrete logarithm problem.',
    descriptionZh:
      'Alice和Bob約定公開素數p和基數g。Alice發送g^a mod p，Bob發送g^b mod p。雙方計算g^(ab) mod p作為共享密鑰。竊聽者無法從g、g^a mod p和g^b mod p計算出密鑰，除非能解決離散對數問題。',
    variables: [
      { symbol: 'p', meaning: 'Large prime number (public)', meaningZh: '大素數（公開）' },
      { symbol: 'g', meaning: 'Generator/base (public)', meaningZh: '生成元/基數（公開）' },
      { symbol: 'a, b', meaning: 'Private random numbers chosen by Alice and Bob', meaningZh: 'Alice和Bob選擇的私有隨機數' },
      { symbol: 'g^(ab) mod p', meaning: 'Shared secret key', meaningZh: '共享密鑰' },
    ],
    topicId: 'network-security',
  },
  {
    id: 'ns-3',
    title: 'Digital Signature Verification',
    titleZh: '數字簽名驗證',
    formula: 'Sign: S = H(M)^d mod n  |  Verify: H(M) ?= S^e mod n',
    description:
      'To sign: hash the message H(M), then encrypt with sender\'s private key d. To verify: decrypt the signature with sender\'s public key e and compare to H(M). If they match, the message is authentic and unmodified. Provides authentication, integrity, and non-repudiation.',
    descriptionZh:
      '簽名：對訊息哈希H(M)，然後用發送方私鑰d加密。驗證：用發送方公鑰e解密簽名並與H(M)比較。如果匹配，訊息是真實且未被修改的。提供認證、完整性和不可否認性。',
    variables: [
      { symbol: 'H(M)', meaning: 'Hash of message (e.g., SHA-256)', meaningZh: '訊息哈希（如SHA-256）' },
      { symbol: 'S', meaning: 'Digital signature', meaningZh: '數字簽名' },
      { symbol: 'd', meaning: 'Sender\'s private key', meaningZh: '發送方私鑰' },
      { symbol: 'e', meaning: 'Sender\'s public key', meaningZh: '發送方公鑰' },
    ],
    topicId: 'network-security',
  },
  {
    id: 'ns-4',
    title: 'Symmetric vs Asymmetric Key Sizes',
    titleZh: '對稱密鑰與非對稱密鑰大小',
    formula: 'Security equivalence: 128-bit AES ≈ 3072-bit RSA',
    description:
      'Symmetric key algorithms (AES) require much smaller keys than asymmetric algorithms (RSA) for equivalent security. Approximate equivalences: 80-bit ≈ 1024-bit RSA, 112-bit ≈ 2048-bit RSA, 128-bit ≈ 3072-bit RSA, 256-bit ≈ 15360-bit RSA. AES is used for bulk encryption; RSA for key exchange and signatures.',
    descriptionZh:
      '對稱密鑰算法（AES）比非對稱算法（RSA）需要更小的密鑰來實現同等安全性。近似等價關系：80位≈1024位RSA，112位≈2048位RSA，128位≈3072位RSA，256位≈15360位RSA。AES用於批量加密；RSA用於密鑰交換和簽名。',
    variables: [
      { symbol: 'AES', meaning: 'Symmetric encryption (128/192/256-bit keys)', meaningZh: '對稱加密（128/192/256位密鑰）' },
      { symbol: 'RSA', meaning: 'Asymmetric encryption (1024/2048/3072-bit keys)', meaningZh: '非對稱加密（1024/2048/3072位密鑰）' },
      { symbol: '3072-bit', meaning: 'RSA key equivalent to 128-bit AES', meaningZh: '等價於128位AES的RSA密鑰長度' },
    ],
    topicId: 'network-security',
  },
];

// Topic metadata for display in the formula sheet
export const formulaTopicMeta: Record<
  string,
  { label: string; labelZh: string; icon: string }
> = {
  'network-fundamentals': {
    label: 'Network Fundamentals',
    labelZh: '網絡基礎',
    icon: 'Globe',
  },
  'transport-layer': {
    label: 'Transport Layer',
    labelZh: '傳輸層',
    icon: 'Layers',
  },
  'reliable-transmission': {
    label: 'Reliable Transmission',
    labelZh: '可靠傳輸',
    icon: 'ArrowRightLeft',
  },
  'tcp-connection': {
    label: 'TCP Connection',
    labelZh: 'TCP 連接',
    icon: 'Link',
  },
  'flow-congestion-control': {
    label: 'Flow & Congestion Control',
    labelZh: '流量與擁塞控制',
    icon: 'Gauge',
  },
  'web-http': {
    label: 'Web & HTTP',
    labelZh: 'Web 與 HTTP',
    icon: 'Globe2',
  },
  'video-streaming': {
    label: 'Video Streaming',
    labelZh: '視頻流',
    icon: 'Play',
  },
  'advanced-congestion-control': {
    label: 'Advanced CC',
    labelZh: '高級擁塞控制',
    icon: 'Zap',
  },
  'queue-management': {
    label: 'Queue Management',
    labelZh: '隊列管理',
    icon: 'LayoutGrid',
  },
  'ip-protocol': {
    label: 'IP Protocol',
    labelZh: 'IP 協定',
    icon: 'Network',
  },
  'bgp-routing': {
    label: 'BGP Routing',
    labelZh: 'BGP 路由',
    icon: 'Route',
  },
  'internet-architecture': {
    label: 'Internet Architecture',
    labelZh: '互聯網架構',
    icon: 'Building2',
  },
  'lan-networks': {
    label: 'LAN Networks',
    labelZh: '局域網',
    icon: 'EthernetPort',
  },
  'distance-vector-routing': {
    label: 'Distance Vector Routing',
    labelZh: '距離向量路由',
    icon: 'GitBranch',
  },
  'link-layer': {
    label: 'Link Layer',
    labelZh: '鏈路層',
    icon: 'Shield',
  },
  'wireless-networks': {
    label: 'Wireless Networks',
    labelZh: '無線網絡',
    icon: 'Wifi',
  },
  'new-networks': {
    label: 'New Network Technologies',
    labelZh: '新型網絡技術',
    icon: 'Lightbulb',
  },
  'network-security': {
    label: 'Network Security',
    labelZh: '網絡安全',
    icon: 'Lock',
  },
};
