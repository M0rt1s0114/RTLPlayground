/* theme + i18n (merged to keep the flash file table small) */
/* theme.js – 主题选择（light / dark / Selenized），保存在 localStorage */
(function () {
  var THEMES = { dark: '深色', light: '浅色', 'sel-dark': 'Selenized 深色', 'sel-light': 'Selenized 浅色' };
  function apply(v) {
    if (v === 'dark') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', v);
  }
  var cur = 'dark';
  try { cur = localStorage.getItem('rtl_theme') || 'dark'; } catch (e) {}
  apply(cur);
  window.RTL_THEMES = THEMES;
  window.applyTheme = function (v) {
    try { localStorage.setItem('rtl_theme', v); } catch (e) {}
    apply(v);
  };
})();

/* i18n.js - runtime zh/en/ja translation for the modular UI */

(function () {
  var LANG_KEY = 'rtl_lang';
  var LANGS = { zh: '中文', en: 'English', ja: '日本語' };
  var DICT = { en: {
 "— 请选择 —": "— select —",
 "(成员": " (members: ",
 "⚠ 输入错误命令可能导致设备无法访问。": "⚠ A wrong command can make the device unreachable.",
 "⚠ 刷写过程中请勿断电，否则可能造成设备变砖。": "⚠ Do not power off while flashing, or the device may be bricked.",
 "⚠ 写入格式错误的配置可能导致设备无法访问。": "⚠ A malformed configuration can make the device unreachable.",
 "保存配置到 Flash": "Save config to flash",
 "保存启动配置到 Flash": "Save startup config to flash",
 "本端通告": "Local advertisement",
 "本机桥 MAC": "Local bridge MAC",
 "本机是根桥": "this switch is root",
 "边缘": "edge",
 "编译日期": "Build date",
 "操作": "Action",
 "超时": "Timeout",
 "成员端口": "Member ports",
 "出向（Egress）": "Egress",
 "初始化": "Initialize",
 "带宽 [kbit/s]": "Bandwidth [kbit/s]",
 "带宽限速": "Bandwidth limits",
 "当前": "Current",
 "当前时间：": "Local time: ",
 "当前速率": "Current rate",
 "当前状态": "Current state",
 "登录": "Login",
 "等待同步": "Waiting for sync",
 "端口": "Port",
 "端口 / LAG 设置": "Port / LAG settings",
 "端口隔离": "Port isolation",
 "端口禁用": "Port disabled",
 "端口镜像": "Port mirroring",
 "端口配置": "Port settings",
 "端口设置与命令行": "Port settings are identical to the CLI ",
 "端口统计": "Port statistics",
 "端口许可（permit / block）": "Port permission (permit / block)",
 "端口状态": "Port status",
 "对端通告": "Partner advertisement",
 "对广播 / 组播 / 未知单播 / 未知组播限速；单位 pps 或 kbit/s，限速值 0 表示关闭。": "Limit broadcast / multicast / unknown unicast / unknown multicast; unit pps or kbit/s, 0 = off.",
 "发送": "TX",
 "发送（异常）": "TX (bad)",
 "发送（正常）": "TX (good)",
 "分钟前）": " min ago)",
 "风暴控制（Storm Control）": "Storm control",
 "服务器 IP": "Server IP",
 "概览": "Overview",
 "高级": "Advanced",
 "高级设置": "Advanced settings",
 "格式的固件文件后点击\"上传并刷入\"。": " firmware file and click \"Upload and flash\".",
 "根保护": "root guard",
 "根端口": "root port",
 "根路径开销": "Root path cost",
 "根桥": "Root bridge",
 "更新 / 创建": "Update / create",
 "更新 / 创建 VLAN": "Update / create VLAN",
 "更新网络设置": "Apply network settings",
 "固件版本": "Firmware",
 "固件升级": "Firmware upgrade",
 "关闭": "off",
 "关闭 LACP": "Disable LACP",
 "广播": "Broadcast",
 "过滤": "filter",
 "候选成员": "Candidate members",
 "活动成员": "Active members",
 "基本信息": "Basic information",
 "激活": "Active",
 "将当前运行配置保存到 Flash 持久化存储。": "Persist the running configuration to flash.",
 "交换机信息": "Switch information",
 "角色": "Role",
 "接收（异常）": "RX (bad)",
 "接收（正常）": "RX (good)",
 "节能以太网": "EEE",
 "节能以太网（EEE）": "Energy Efficient Ethernet (EEE)",
 "禁用": "disabled",
 "禁用 EEE": "Disable EEE",
 "禁用镜像": "Disable mirroring",
 "禁止": "block",
 "镜像端口 — RX（接收）": "Mirrored ports — RX",
 "镜像端口 — TX（发送）": "Mirrored ports — TX",
 "镜像目标端口：": "Mirror destination port: ",
 "聚合器 MAC": "Aggregator MAC",
 "聚合有效": "Aggregation valid",
 "可选": "optional",
 "控制台": "Console",
 "类型": "Type",
 "例：port 1 auto": "e.g. port 1 auto",
 "链路": "Link",
 "链路聚合": "Link aggregation",
 "链路聚合组（LAG）": "Link aggregation groups (LAG)",
 "链路速率": "Link speed",
 "流控": "Flow control",
 "路径开销": "Path cost",
 "美国": "United States",
 "密码": "Password",
 "名称": "Name",
 "命令": "Command",
 "默认网关": "Default gateway",
 "默认值": "default",
 "欧洲": "Europe",
 "启动配置": "Startup configuration",
 "启用": "enabled",
 "启用 EEE": "Enable EEE",
 "启用 LACP": "Enable LACP",
 "启用 LLDP": "Enable LLDP",
 "启用 NTP": "Enable NTP",
 "启用镜像": "Enable mirroring",
 "启用生成树": "Enable spanning tree",
 "浅色": "Light",
 "桥优先级 0-15": "Bridge priority 0-15",
 "清除配置": "Clear config",
 "全选": "Select all",
 "入向（Ingress）": "Ingress",
 "删除": "Delete",
 "上传并刷入固件": "Upload and flash firmware",
 "上限": "Limit",
 "设备数": "Devices",
 "设置速率": "Set rate",
 "深色": "Dark",
 "生成树": "Spanning tree",
 "生成树（STP / RSTP）": "Spanning tree (STP / RSTP)",
 "时间 / NTP": "Time / NTP",
 "时区": "Time zone",
 "速率": "Rate",
 "拓扑变更计数": "Topology changes",
 "替代端口": "alternate port",
 "同步间隔 [分钟]": "Poll interval [min]",
 "完全等价；桥设置点上方“应用桥设置”。": "; the bridge settings are applied with “Apply bridge settings” above.",
 "网络": "Network",
 "网络设置": "Network settings",
 "未启用": "disabled",
 "未启用（在某个 LAG 上点“启用 LACP”）": "disabled (press “Enable LACP” on a LAG)",
 "未选择文件": "no file selected",
 "未知(": "unknown (",
 "未知单播": "Unknown unicast",
 "未知组播": "Unknown multicast",
 "系统设置": "System",
 "夏令时": "Daylight saving",
 "先勾选该组的成员端口": "Select the member ports of this group first",
 "显示": "Display",
 "限速": "Limit",
 "详细端口计数器": "Detailed port counters",
 "详细计数": "Detailed counters",
 "协议版本": "Protocol version",
 "芯片温度": "Temperature",
 "行 = 源端口，列 = 允许访问的目标端口；“•”表示自身（始终允许）。默认全部允许。": "Row = source port, column = allowed destination; “•” is the port itself (always allowed). All allowed by default.",
 "型号": "Model",
 "修改 IP 后请更新浏览器地址栏中的地址。": "After changing the IP, update the address in your browser.",
 "选择": "Select",
 "选择 VLAN": "Select VLAN",
 "学习": "learning",
 "已配置 VLAN": "Configured VLANs",
 "已启用": "enabled",
 "已同步（": "synced (",
 "应用": "Apply",
 "应用 DNS": "Apply DNS",
 "应用 LAG 1": "Apply LAG 1",
 "应用 LAG 2": "Apply LAG 2",
 "应用 LAG 3": "Apply LAG 3",
 "应用 LAG 4": "Apply LAG 4",
 "应用 NTP": "Apply NTP",
 "应用 Syslog": "Apply Syslog",
 "应用隔离设置": "Apply isolation",
 "应用桥设置": "Apply bridge settings",
 "应用主机名": "Apply hostname",
 "优先级": "Priority",
 "源端口 \\ 目标": "Source \\ Target",
 "允许": "permit",
 "运行状态": "Status",
 "载入": "Load",
 "指定端口": "designated port",
 "重置交换机": "Reset switch",
 "主机名": "Hostname",
 "主机名不能为空": "Hostname must not be empty",
 "主题": "Theme",
 "主题只保存在当前浏览器。": "The theme is stored in this browser only.",
 "转发": "forwarding",
 "状态": "State",
 "状态：": "Status: ",
 "子网掩码": "Netmask",
 "自动边缘": "auto edge",
 "阻塞": "blocking",
 "组": "Group",
 "组播": "Multicast",
 "最大帧长（MTU）": "Max frame size (MTU)",
 "Actor 状态": "Actor state",
 "BPDU 保护": "BPDU guard",
 "DHCP 下发：": "From DHCP: ",
 "DNS 服务器 1": "DNS server 1",
 "DNS 服务器 1 不能为空；关闭 DNS 请填 0.0.0.0": "DNS server 1 must not be empty; use 0.0.0.0 to turn DNS off",
 "DNS 服务器 2": "DNS server 2",
 "Flash 存储": "Flash storage",
 "Flash 大小": "Flash size",
 "Forward Delay 秒 4-30": "Forward delay [s] 4-30",
 "FreeSwitchOS · 带宽限速": "FreeSwitchOS · Bandwidth",
 "FreeSwitchOS · 登录": "FreeSwitchOS · Login",
 "FreeSwitchOS · 端口隔离": "FreeSwitchOS · Port isolation",
 "FreeSwitchOS · 端口镜像": "FreeSwitchOS · Port mirroring",
 "FreeSwitchOS · 端口配置": "FreeSwitchOS · Ports",
 "FreeSwitchOS · 端口统计": "FreeSwitchOS · Statistics",
 "FreeSwitchOS · 概览": "FreeSwitchOS · Overview",
 "FreeSwitchOS · 固件升级": "FreeSwitchOS · Firmware",
 "FreeSwitchOS · 节能以太网": "FreeSwitchOS · EEE",
 "FreeSwitchOS · 链路聚合": "FreeSwitchOS · LAG",
 "FreeSwitchOS · 生成树": "FreeSwitchOS · Spanning tree",
 "FreeSwitchOS · 系统设置": "FreeSwitchOS · System",
 "FreeSwitchOS · L2 表": "FreeSwitchOS · MAC table",
 "FreeSwitchOS · VLAN 配置": "FreeSwitchOS · VLANs",
 "Hello 秒 1-10": "Hello time [s] 1-10",
 "information.json 获取失败:": "failed to fetch information.json:",
 "IP 地址": "IP address",
 "L2 表": "MAC table",
 "L2 MAC 地址表": "L2 MAC address table",
 "LACP 组": "LACP group",
 "LACP（802.3ad）状态": "LACP (802.3ad) status",
 "LLDP 报文会从允许的端口发出；每个端口的许可可以单独设置。": "LLDP frames are sent on permitted ports; each port can be permitted or blocked individually.",
 "LLDP（链路层发现）": "LLDP (link layer discovery)",
 "MAC 地址": "MAC address",
 "Max Age 秒 6-40": "Max age [s] 6-40",
 "NTP 服务器": "NTP server",
 "Partner 系统": "Partner system",
 "Partner 状态": "Partner state",
 "PVID 端口（入口默认 VLAN）": "PVID ports (ingress VLAN)",
 "RX 计数": "RX count",
 "RX 状态": "RX state",
 "Selenized 浅色": "Selenized light",
 "Selenized 深色": "Selenized dark",
 "SFP 插槽 1": "SFP slot 1",
 "SFP 插槽 2": "SFP slot 2",
 "Syslog 服务器": "Syslog server",
 "Tagged 端口": "Tagged ports",
 "Untagged 端口": "Untagged ports",
 "VLAN 名称": "VLAN name",
 "VLAN 配置": "VLAN configuration"
}, ja: {
 "— 请选择 —": "— 選択 —",
 "(成员": " (メンバー: ",
 "⚠ 输入错误命令可能导致设备无法访问。": "⚠ 誤ったコマンドは本体に接続できなくなる可能性があります。",
 "⚠ 刷写过程中请勿断电，否则可能造成设备变砖。": "⚠ 書き込み中は電源を切らないでください。故障の原因になります。",
 "⚠ 写入格式错误的配置可能导致设备无法访问。": "⚠ 形式の誤った設定は本体に接続できなくなる可能性があります。",
 "保存配置到 Flash": "設定をフラッシュへ保存",
 "保存启动配置到 Flash": "起動設定をフラッシュへ保存",
 "本端通告": "自局アドバタイズ",
 "本机桥 MAC": "自局ブリッジ MAC",
 "本机是根桥": "自局がルートブリッジ",
 "边缘": "エッジ",
 "编译日期": "ビルド日時",
 "操作": "操作",
 "超时": "タイムアウト",
 "成员端口": "メンバーポート",
 "出向（Egress）": "Egress",
 "初始化": "初期化",
 "带宽 [kbit/s]": "帯域 [kbit/s]",
 "带宽限速": "帯域制限",
 "当前": "現在",
 "当前时间：": "現在時刻: ",
 "当前速率": "現在のレート",
 "当前状态": "現在の状態",
 "登录": "ログイン",
 "等待同步": "同期待ち",
 "端口": "ポート",
 "端口 / LAG 设置": "ポート / LAG 設定",
 "端口隔离": "ポート分離",
 "端口禁用": "ポート無効",
 "端口镜像": "ポートミラーリング",
 "端口配置": "ポート設定",
 "端口设置与命令行": "ポート設定は CLI ",
 "端口统计": "ポート統計",
 "端口许可（permit / block）": "ポート許可 (permit / block)",
 "端口状态": "ポート状態",
 "对端通告": "相手アドバタイズ",
 "对广播 / 组播 / 未知单播 / 未知组播限速；单位 pps 或 kbit/s，限速值 0 表示关闭。": "ブロードキャスト / マルチキャスト / 未知ユニキャスト / 未知マルチキャストを制限。単位 pps または kbit/s、0 で無効。",
 "发送": "TX",
 "发送（异常）": "TX（異常）",
 "发送（正常）": "TX（正常）",
 "分钟前）": " 分前）",
 "风暴控制（Storm Control）": "ストーム制御",
 "服务器 IP": "サーバ IP",
 "概览": "概要",
 "高级": "詳細",
 "高级设置": "詳細設定",
 "格式的固件文件后点击\"上传并刷入\"。": " 形式のファームウェアを選び「アップロードして書き込む」を押してください。",
 "根保护": "root guard",
 "根端口": "ルートポート",
 "根路径开销": "ルートパスコスト",
 "根桥": "ルートブリッジ",
 "更新 / 创建": "更新 / 作成",
 "更新 / 创建 VLAN": "VLAN を更新 / 作成",
 "更新网络设置": "ネットワーク設定を適用",
 "固件版本": "ファームウェア",
 "固件升级": "ファームウェア更新",
 "关闭": "オフ",
 "关闭 LACP": "LACP を無効化",
 "广播": "ブロードキャスト",
 "过滤": "フィルタ",
 "候选成员": "候補メンバー",
 "活动成员": "稼働メンバー",
 "基本信息": "基本情報",
 "激活": "有効",
 "将当前运行配置保存到 Flash 持久化存储。": "現在の実行設定をフラッシュに保存します。",
 "交换机信息": "スイッチ情報",
 "角色": "役割",
 "接收（异常）": "RX（異常）",
 "接收（正常）": "RX（正常）",
 "节能以太网": "EEE",
 "节能以太网（EEE）": "省電力イーサネット (EEE)",
 "禁用": "無効",
 "禁用 EEE": "EEE を無効化",
 "禁用镜像": "ミラーリングを無効化",
 "禁止": "ブロック",
 "镜像端口 — RX（接收）": "ミラーポート — RX",
 "镜像端口 — TX（发送）": "ミラーポート — TX",
 "镜像目标端口：": "ミラー先ポート: ",
 "聚合器 MAC": "アグリゲータ MAC",
 "聚合有效": "アグリゲーション有効",
 "可选": "任意",
 "控制台": "コンソール",
 "类型": "種類",
 "例：port 1 auto": "例: port 1 auto",
 "链路": "リンク",
 "链路聚合": "リンクアグリゲーション",
 "链路聚合组（LAG）": "リンクアグリゲーショングループ (LAG)",
 "链路速率": "リンク速度",
 "流控": "フロー制御",
 "路径开销": "パスコスト",
 "美国": "米国",
 "密码": "パスワード",
 "名称": "名前",
 "命令": "コマンド",
 "默认网关": "デフォルトゲートウェイ",
 "默认值": "デフォルト",
 "欧洲": "欧州",
 "启动配置": "起動設定",
 "启用": "有効",
 "启用 EEE": "EEE を有効化",
 "启用 LACP": "LACP を有効化",
 "启用 LLDP": "LLDP を有効化",
 "启用 NTP": "NTP を有効化",
 "启用镜像": "ミラーリングを有効化",
 "启用生成树": "スパニングツリーを有効化",
 "浅色": "ライト",
 "桥优先级 0-15": "ブリッジ優先度 0-15",
 "清除配置": "設定をクリア",
 "全选": "すべて選択",
 "入向（Ingress）": "Ingress",
 "删除": "削除",
 "上传并刷入固件": "アップロードして書き込む",
 "上限": "上限",
 "设备数": "端末数",
 "设置速率": "レート設定",
 "深色": "ダーク",
 "生成树": "スパニングツリー",
 "生成树（STP / RSTP）": "スパニングツリー (STP / RSTP)",
 "时间 / NTP": "時刻 / NTP",
 "时区": "タイムゾーン",
 "速率": "レート",
 "拓扑变更计数": "トポロジ変更回数",
 "替代端口": "代替ポート",
 "同步间隔 [分钟]": "同期間隔 [分]",
 "完全等价；桥设置点上方“应用桥设置”。": " と等価です。ブリッジ設定は上の「ブリッジ設定を適用」で反映します。",
 "网络": "ネットワーク",
 "网络设置": "ネットワーク設定",
 "未启用": "無効",
 "未启用（在某个 LAG 上点“启用 LACP”）": "無効（LAG の「LACP を有効化」を押してください）",
 "未选择文件": "ファイル未選択",
 "未知(": "不明(",
 "未知单播": "未知ユニキャスト",
 "未知组播": "未知マルチキャスト",
 "系统设置": "システム",
 "夏令时": "夏時間",
 "先勾选该组的成员端口": "先にこのグループのメンバーポートを選択してください",
 "显示": "表示",
 "限速": "制限",
 "详细端口计数器": "詳細ポートカウンタ",
 "详细计数": "詳細カウンタ",
 "协议版本": "プロトコル版",
 "芯片温度": "チップ温度",
 "行 = 源端口，列 = 允许访问的目标端口；“•”表示自身（始终允许）。默认全部允许。": "行 = 送信元ポート、列 = 許可する宛先ポート。「•」は自身（常に許可）。既定はすべて許可。",
 "型号": "型番",
 "修改 IP 后请更新浏览器地址栏中的地址。": "IP 変更後はブラウザのアドレスを更新してください。",
 "选择": "選択",
 "选择 VLAN": "VLAN を選択",
 "学习": "ラーニング",
 "已配置 VLAN": "設定済み VLAN",
 "已启用": "有効",
 "已同步（": "同期済み（",
 "应用": "適用",
 "应用 DNS": "DNS を適用",
 "应用 LAG 1": "LAG 1 を適用",
 "应用 LAG 2": "LAG 2 を適用",
 "应用 LAG 3": "LAG 3 を適用",
 "应用 LAG 4": "LAG 4 を適用",
 "应用 NTP": "NTP を適用",
 "应用 Syslog": "Syslog を適用",
 "应用隔离设置": "分離設定を適用",
 "应用桥设置": "ブリッジ設定を適用",
 "应用主机名": "ホスト名を適用",
 "优先级": "優先度",
 "源端口 \\ 目标": "送信元 \\ 宛先",
 "允许": "許可",
 "运行状态": "稼働状態",
 "载入": "読み込み",
 "指定端口": "指定ポート",
 "重置交换机": "スイッチをリセット",
 "主机名": "ホスト名",
 "主机名不能为空": "ホスト名は空にできません",
 "主题": "テーマ",
 "主题只保存在当前浏览器。": "テーマはこのブラウザにのみ保存されます。",
 "转发": "転送",
 "状态": "状態",
 "状态：": "状態: ",
 "子网掩码": "サブネットマスク",
 "自动边缘": "自動エッジ",
 "阻塞": "ブロッキング",
 "组": "グループ",
 "组播": "マルチキャスト",
 "最大帧长（MTU）": "最大フレーム長 (MTU)",
 "Actor 状态": "Actor 状態",
 "BPDU 保护": "BPDU ガード",
 "DHCP 下发：": "DHCP 取得: ",
 "DNS 服务器 1": "DNS サーバ 1",
 "DNS 服务器 1 不能为空；关闭 DNS 请填 0.0.0.0": "DNS サーバ 1 は必須です。無効化は 0.0.0.0",
 "DNS 服务器 2": "DNS サーバ 2",
 "Flash 存储": "フラッシュ保存",
 "Flash 大小": "フラッシュ容量",
 "Forward Delay 秒 4-30": "フォワード遅延 [秒] 4-30",
 "FreeSwitchOS · 带宽限速": "FreeSwitchOS · 帯域制限",
 "FreeSwitchOS · 登录": "FreeSwitchOS · ログイン",
 "FreeSwitchOS · 端口隔离": "FreeSwitchOS · ポート分離",
 "FreeSwitchOS · 端口镜像": "FreeSwitchOS · ミラーリング",
 "FreeSwitchOS · 端口配置": "FreeSwitchOS · ポート設定",
 "FreeSwitchOS · 端口统计": "FreeSwitchOS · ポート統計",
 "FreeSwitchOS · 概览": "FreeSwitchOS · 概要",
 "FreeSwitchOS · 固件升级": "FreeSwitchOS · ファームウェア",
 "FreeSwitchOS · 节能以太网": "FreeSwitchOS · EEE",
 "FreeSwitchOS · 链路聚合": "FreeSwitchOS · LAG",
 "FreeSwitchOS · 生成树": "FreeSwitchOS · スパニングツリー",
 "FreeSwitchOS · 系统设置": "FreeSwitchOS · システム",
 "FreeSwitchOS · L2 表": "FreeSwitchOS · MAC テーブル",
 "FreeSwitchOS · VLAN 配置": "FreeSwitchOS · VLAN",
 "Hello 秒 1-10": "Hello 時間 [秒] 1-10",
 "information.json 获取失败:": "information.json の取得に失敗:",
 "IP 地址": "IP アドレス",
 "L2 表": "MAC テーブル",
 "L2 MAC 地址表": "L2 MAC アドレステーブル",
 "LACP 组": "LACP グループ",
 "LACP（802.3ad）状态": "LACP (802.3ad) 状態",
 "LLDP 报文会从允许的端口发出；每个端口的许可可以单独设置。": "LLDP フレームは許可されたポートから送信されます。ポートごとに許可/ブロックできます。",
 "LLDP（链路层发现）": "LLDP（リンク層検出）",
 "MAC 地址": "MAC アドレス",
 "Max Age 秒 6-40": "Max Age [秒] 6-40",
 "NTP 服务器": "NTP サーバ",
 "Partner 系统": "Partner システム",
 "Partner 状态": "Partner 状態",
 "PVID 端口（入口默认 VLAN）": "PVID ポート（入力既定 VLAN）",
 "RX 计数": "RX 回数",
 "RX 状态": "RX 状態",
 "Selenized 浅色": "Selenized ライト",
 "Selenized 深色": "Selenized ダーク",
 "SFP 插槽 1": "SFP スロット 1",
 "SFP 插槽 2": "SFP スロット 2",
 "Syslog 服务器": "Syslog サーバ",
 "Tagged 端口": "Tagged ポート",
 "Untagged 端口": "Untagged ポート",
 "VLAN 名称": "VLAN 名",
 "VLAN 配置": "VLAN 設定"
} };
  var PATTERNS = [
 [
  "^端口 (\\S+)$",
  "Port $1",
  "ポート $1"
 ],
 [
  "^LAG (\\d+) \\(成员 (\\S+)\\)$",
  "LAG $1 (members $2)",
  "LAG $1（メンバー $2）"
 ],
 [
  "^LAG (\\d+)$",
  "LAG $1",
  "LAG $1"
 ],
 [
  "^组 (\\d+)$",
  "Group $1",
  "グループ $1"
 ],
 [
  "^VLAN (\\d+)$",
  "VLAN $1",
  "VLAN $1"
 ],
 [
  "^已同步（(\\d+) 分钟前）$",
  "synced ($1 min ago)",
  "同期済み（$1 分前）"
 ],
 [
  "^DHCP 下发：(\\S+)$",
  "From DHCP: $1",
  "DHCP 取得: $1"
 ],
 [
  "^未知\\((\\d+)\\)$",
  "unknown ($1)",
  "不明($1)"
 ],
 [
  "^LACP: 已启用$",
  "LACP: enabled",
  "LACP: 有効"
 ],
 [
  "^LACP: 未启用（在某个 LAG 上点“启用 LACP”）$",
  "LACP: disabled",
  "LACP: 無効"
 ],
 [
  "^端口 (\\d+) / LAG$",
  "Port $1 / LAG",
  "ポート $1 / LAG"
 ]
];
  var lang = 'zh';
  try { lang = localStorage.getItem(LANG_KEY) || 'zh'; } catch (e) {}
  if (lang !== 'zh' && lang !== 'en' && lang !== 'ja') lang = 'zh';

  var EXTRA = {
 "en": {
  "语言": "Language",
  "主题与语言只保存在当前浏览器。": "The theme and language are stored in this browser only.",
  "断开": "down",
  "密码错误，请重试": "Wrong password, try again",
  "正在检查固件…": "checking firmware…",
  "✓ 固件检查通过（": "✓ firmware check passed (",
  "✗ 固件过大（> 1 MB）": "✗ firmware too large (> 1 MB)",
  "✗ 文件太小，不像固件镜像": "✗ file too small to be a firmware image",
  "✗ 这个固件不是为「": "✗ this firmware is not built for \"",
  "」构建的，型号不匹配": "\" — model mismatch",
  "📁 选择固件文件": "📁 choose firmware file",
  "是": "yes",
  "否": "no"
 },
 "ja": {
  "语言": "言語",
  "主题与语言只保存在当前浏览器。": "テーマと言語はこのブラウザにのみ保存されます。",
  "断开": "ダウン",
  "密码错误，请重试": "パスワードが違います。再試行してください。",
  "正在检查固件…": "ファームウェアを確認中…",
  "✓ 固件检查通过（": "✓ ファームウェア確認 OK（",
  "✗ 固件过大（> 1 MB）": "✗ ファームウェアが大きすぎます（> 1 MB）",
  "✗ 文件太小，不像固件镜像": "✗ ファイルが小さすぎます。ファームウェアではありません",
  "✗ 这个固件不是为「": "✗ このファームウェアは次のモデル用ではありません:「",
  "」构建的，型号不匹配": "」— 型番が一致しません",
  "📁 选择固件文件": "📁 ファームウェアを選択",
  "是": "はい",
  "否": "いいえ"
 }
};
  Object.keys(EXTRA.en).forEach(function (k) { DICT.en[k] = EXTRA.en[k]; });
  Object.keys(EXTRA.ja).forEach(function (k) { DICT.ja[k] = EXTRA.ja[k]; });
  PATTERNS = PATTERNS.concat([
 [
  "^删除 VLAN (\\d+)\\?$",
  "Delete VLAN $1?",
  "VLAN $1 を削除しますか？"
 ],
 [
  "^✗ 这个固件不是为「(.+)」构建的，型号不匹配$",
  "✗ this firmware is not built for \"$1\" (model mismatch)",
  "✗ このファームウェアは「$1」用ではありません（型番不一致）"
 ],
 [
  "^✓ 固件检查通过（(\\d+) KB）$",
  "✓ firmware check passed ($1 KB)",
  "✓ ファームウェア確認 OK（$1 KB）"
 ]
]);

  var EXTRA2 = {
 "en": {
  "查看": "View",
  "设备": "Devices",
  "关闭窗口": "Close",
  "静态": "static",
  "暂无设备（L2 表为空或该端口未学习到 MAC）": "No devices (empty L2 table or nothing learned on this port)"
 },
 "ja": {
  "查看": "表示",
  "设备": "端末",
  "关闭窗口": "閉じる",
  "静态": "静的",
  "暂无设备（L2 表为空或该端口未学习到 MAC）": "端末なし（L2 テーブルが空、または未学習）"
 }
};
  Object.keys(EXTRA2.en).forEach(function (k) { DICT.en[k] = EXTRA2.en[k]; });
  Object.keys(EXTRA2.ja).forEach(function (k) { DICT.ja[k] = EXTRA2.ja[k]; });
  PATTERNS = PATTERNS.concat([
 [
  "^端口 (\\d+) 的设备$",
  "Devices on port $1",
  "ポート $1 の端末"
 ]
]);

  function translateText(s) {
    if (lang === 'zh' || !s) return null;
    var t = s.trim();
    if (!t) return null;
    var dict = DICT[lang] || {};
    if (Object.prototype.hasOwnProperty.call(dict, t)) {
      return s.replace(t, dict[t]);
    }
    for (var i = 0; i < PATTERNS.length; i++) {
      var p = PATTERNS[i];
      var re = new RegExp(p[0]);
      var m = t.match(re);
      if (m) {
        var out = (lang === 'en' ? p[1] : p[2]);
        for (var k = m.length - 1; k >= 1; k--) out = out.replace(new RegExp('\\$' + k, 'g'), m[k]);
        return s.replace(t, out);
      }
    }
    return null;
  }

  function applyToNode(node) {
    if (node.nodeType === 3) {
      var v = translateText(node.nodeValue);
      if (v !== null && v !== node.nodeValue) node.nodeValue = v;
    } else if (node.nodeType === 1) {
      var tag = node.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA') return;
      ['placeholder', 'title', 'alt'].forEach(function (a) {
        var val = node.getAttribute && node.getAttribute(a);
        if (val) { var t = translateText(val); if (t !== null && t !== val) node.setAttribute(a, t); }
      });
      if (tag === 'INPUT' && (node.type === 'submit' || node.type === 'button')) {
        var v = node.value, t2 = translateText(v);
        if (t2 !== null && t2 !== v) node.value = t2;
      }
      for (var i = 0; i < node.childNodes.length; i++) applyToNode(node.childNodes[i]);
    }
  }

  function apply() {
    var tt = translateText(document.title);
    if (tt !== null && tt !== document.title) document.title = tt;
    applyToNode(document.body);
  }
  function setLang(l) {
    if (!LANGS[l]) return;
    try { localStorage.setItem(LANG_KEY, l); } catch (e) {}
    location.reload();
  }

  window.RTL_LANG = lang;
  window.RTL_LANGS = LANGS;
  window.t = function (s) { var r = translateText(s); return r === null ? s : r; };
  window.applyI18n = apply;
  window.setLang = setLang;

  function initLangSelect() {
    var sel = document.getElementById('lang');
    if (!sel) return;
    Object.keys(LANGS).forEach(function (k) {
      var o = document.createElement('option');
      o.value = k; o.textContent = LANGS[k];
      sel.appendChild(o);
    });
    sel.value = lang;
    sel.onchange = function () { setLang(this.value); };
  }

  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
  document.addEventListener('DOMContentLoaded', function () {
    apply();
    initLangSelect();
    var mo = new MutationObserver(function () { apply(); });
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  });
})();
