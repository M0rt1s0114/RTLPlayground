/* theme + i18n (merged to keep the flash file table small) */
/* theme.js – 主题选择（light / dark / Selenized），保存在 localStorage */
(function () {
  var THEMES = { system: '跟随系统', dark: '深色', light: '浅色', 'sel-dark': 'Selenized 深色', 'sel-light': 'Selenized 浅色' };
  function systemPref() {
    try { return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'; }
    catch (e) { return 'dark'; }
  }
  function apply(v) {
    var eff = (v === 'system') ? systemPref() : v;
    if (eff === 'dark') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', eff);
  }
  var cur = 'dark';
  try { cur = localStorage.getItem('rtl_theme') || 'dark'; } catch (e) {}
  apply(cur);
  window.RTL_THEMES = THEMES;
  window.applyTheme = function (v) {
    try { localStorage.setItem('rtl_theme', v); } catch (e) {}
    apply(v);
  };
  try {
    var mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)');
    if (mq) {
      var onChange = function () {
        var c = 'dark';
        try { c = localStorage.getItem('rtl_theme') || 'dark'; } catch (e) {}
        if (c === 'system') apply('system');
      };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  } catch (e) {}
})();

/* i18n.js - runtime zh/en translation for the modular UI */

(function () {
  var LANG_KEY = 'rtl_lang';
  var LANGS = { zh: '中文', en: 'English' };
  var DICT = {
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
 "VLAN 配置": "VLAN configuration",
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
 "否": "no",
 "查看": "View",
 "设备": "Devices",
 "关闭窗口": "Close",
 "静态": "static",
 "暂无设备（L2 表为空或该端口未学习到 MAC）": "No devices (empty L2 table or nothing learned on this port)"
};
  var PATTERNS = [
 [
  "^端口 (\\S+)$",
  "Port $1"
 ],
 [
  "^LAG (\\d+) \\(成员 (\\S+)\\)$",
  "LAG $1 (members $2)"
 ],
 [
  "^LAG (\\d+)$",
  "LAG $1"
 ],
 [
  "^组 (\\d+)$",
  "Group $1"
 ],
 [
  "^VLAN (\\d+)$",
  "VLAN $1"
 ],
 [
  "^已同步（(\\d+) 分钟前）$",
  "synced ($1 min ago)"
 ],
 [
  "^DHCP 下发：(\\S+)$",
  "From DHCP: $1"
 ],
 [
  "^未知\\((\\d+)\\)$",
  "unknown ($1)"
 ],
 [
  "^LACP: 已启用$",
  "LACP: enabled"
 ],
 [
  "^LACP: 未启用（在某个 LAG 上点“启用 LACP”）$",
  "LACP: disabled"
 ],
 [
  "^端口 (\\d+) / LAG$",
  "Port $1 / LAG"
 ],
 [
  "^删除 VLAN (\\d+)\\?$",
  "Delete VLAN $1?"
 ],
 [
  "^✗ 这个固件不是为「(.+)」构建的，型号不匹配$",
  "✗ this firmware is not built for \"$1\" (model mismatch)"
 ],
 [
  "^✓ 固件检查通过（(\\d+) KB）$",
  "✓ firmware check passed ($1 KB)"
 ],
 [
  "^端口 (\\d+) 的设备$",
  "Devices on port $1"
 ]
];
  var lang = 'zh';
  try { lang = localStorage.getItem(LANG_KEY) || 'zh'; } catch (e) {}
  if (lang !== 'zh' && lang !== 'en') lang = 'zh';

  var EXTRA3 = {
 "💾 选择固件文件": "💾 choose firmware file",
 "入向 & 出向带宽限速": "Ingress & egress bandwidth limits",
 "未知": "unknown",
 "源端口 \\ 目标": "Source \\ Target"
};
  Object.keys(EXTRA3).forEach(function (k) { DICT[k] = EXTRA3[k]; });

  var EXTRA4 = {
 "通过 DHCP 获取地址": "Get address via DHCP",
 "设为管理 VLAN": "Set as management VLAN",
 "操作": "Action",
 "确定要让交换机通过 DHCP 获取地址？当前地址会失效。": "Request an address via DHCP? The current address will be lost.",
 "已请求 DHCP 地址，请到路由器上查找交换机的新 IP。": "DHCP requested; look up the new switch IP on your router.",
 "把 VLAN ": "Set VLAN ",
 " 设为管理 VLAN？如果当前连接的端口不携带该 VLAN，页面会失联。": " as the management VLAN? If your port does not carry that VLAN, this page will become unreachable."
};
  Object.keys(EXTRA4).forEach(function (k) { DICT[k] = EXTRA4[k]; });
  PATTERNS = PATTERNS.concat([
    ["^把 VLAN (\\d+) 设为管理 VLAN？如果当前连接的端口不携带该 VLAN，页面会失联。$",
     "Set VLAN $1 as the management VLAN? If your port does not carry that VLAN, this page will become unreachable."]
  ]);

  var EXTRA6 = {
 "/ RX": "/ RX",
 "（固件不支持清空所有因子；至少保留一项）": "(the firmware cannot clear all factors; keep at least one selected)"
};
  Object.keys(EXTRA6).forEach(function (k) { DICT[k] = EXTRA6[k]; });
  PATTERNS = PATTERNS.concat([
 [
  "^上传中 (\\\\d+)%（(\\\\d+) / (\\\\d+) KB）$",
  "Uploading $1% ($2 / $3 KB)"
 ],
 [
  "^设备重启中…（(\\\\d+) s）$",
  "Device rebooting… ($1 s)"
 ]
]);

  var EXTRA5 = {
 "跟随系统": "System",
 "实时流量": "Live traffic",
 "累计包数：TX": "Total packets: TX",
 " / RX": " / RX",
 "会话超时": "Session timeout",
 "超时 [秒]": "Timeout [s]",
 "应用会话超时": "Apply timeout",
 "管理 MAC": "Management MAC",
 "修改后请用新 MAC 重新连接。": "Reconnect using the new MAC after applying.",
 "应用 MAC": "Apply MAC",
 "LAG Hash 因子": "LAG hash factors",
 "应用 Hash 因子": "Apply hash factors",
 "至少选择一个 hash 因子（固件不接受清空）": "Select at least one hash factor (the firmware cannot clear all)",
 "源端口": "Source port",
 "源 MAC": "Source MAC",
 "目的 MAC": "Destination MAC",
 "源 IP": "Source IP",
 "目的 IP": "Destination IP",
 "源端口号": "Source port number",
 "目的端口号": "Destination port number",
 "入口过滤（ingress）": "Ingress filter",
 "不改变": "unchanged",
 "全部": "all",
 "仅 Untagged": "untagged only",
 "仅 Tagged": "tagged only",
 "应用入口过滤": "Apply ingress filter",
 "固件不提供 ingress 当前状态查询，这里只发送设置；“不改变”表示该端口保持原值。": "The firmware does not report the current ingress state; this only sends settings. “unchanged” keeps the current mode.",
 "过滤 MAC / VLAN / 端口": "filter MAC / VLAN / port",
 "清空 L2 表": "Flush L2 table",
 "上传中": "uploading ",
 "上传完成，等待设备重启…": "Upload complete, waiting for the device to reboot…",
 "上传完成，设备重启中…": "Upload complete; the device is rebooting…",
 "设备重启中…": "Device rebooting…",
 "设备已恢复运行，请重新登录。": "The device is back online; please log in again.",
 "等待设备恢复超时，请检查设备状态后手动刷新。": "Timed out waiting for the device; check it and reload manually.",
 "连接中断，设备可能正在重启…": "Connection lost; the device may be rebooting…",
 "端口名不能含空格，最长 15 字符": "Port name must not contain spaces and be at most 15 characters",
 "会话超时必须是 1-65535 秒": "Session timeout must be 1-65535 seconds",
 "MAC 格式：aa:bb:cc:dd:ee:ff": "MAC format: aa:bb:cc:dd:ee:ff"
};
  Object.keys(EXTRA5).forEach(function (k) { DICT[k] = EXTRA5[k]; });

  var EXTRA7 = {
 "本机是根桥": "this switch is the root bridge",
 "端口设置与命令行": "Port settings are identical to the CLI ",
 "完全等价；桥设置点上方“应用桥设置”。": "; bridge settings are applied with “Apply bridge settings” above.",
 "过滤": "Filter",
 "设备数": "Clients",
 "本端通告": "Local advertisement",
 "对端通告": "Partner advertisement",
 "聚合有效": "Aggregation valid",
 "候选成员": "Candidate members",
 "链路速率": "Link speed",
 "动态学习": "learned"
};
  Object.keys(EXTRA7).forEach(function (k) { DICT[k] = EXTRA7[k]; });

  function translateText(s) {
    if (lang === 'zh' || !s) return null;
    var t = s.trim();
    if (!t) return null;
    if (Object.prototype.hasOwnProperty.call(DICT, t)) {
      return s.replace(t, DICT[t]);
    }
    for (var i = 0; i < PATTERNS.length; i++) {
      var p = PATTERNS[i];
      var m = t.match(new RegExp(p[0]));
      if (m) {
        var out = p[1];
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
        var vv = node.value, t2 = translateText(vv);
        if (t2 !== null && t2 !== vv) node.value = t2;
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
    var pending = false;
    var mo = new MutationObserver(function () {
      if (pending) return;
      pending = true;
      setTimeout(function () { pending = false; apply(); }, 40);
    });
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  });
})();

/* ── navigation + overview info (merged here to save BANK1 file-table space) ── */
(function () {
  function buildNav() {
    var path = location.pathname.split('/').pop() || 'index.html';
    var links = [
      { href: 'index.html',     label: '概览',     icon: '⬡' },
      { href: 'ports.html',     label: '端口配置', icon: '⛭' },
      { href: 'stat.html',      label: '端口统计', icon: '◈' },
      { href: 'vlan.html',      label: 'VLAN',     icon: '◧' },
      { href: 'l2.html',        label: 'L2 表',    icon: '⊞' },
      { href: 'mirror.html',    label: '端口镜像', icon: '⇆' },
      { href: 'stp.html',       label: '生成树',   icon: '⌁' },
      { href: 'lag.html',       label: '链路聚合', icon: '⇌' },
      { href: 'lldp.html',      label: 'LLDP',     icon: '⌖' },
      { href: 'isolation.html', label: '端口隔离', icon: '⌗' },
      { href: 'eee.html',       label: '节能以太网', icon: '⚡' },
      { href: 'bandwidth.html', label: '带宽限速', icon: '◉' },
      { href: 'system.html',    label: '系统设置', icon: '⚙' },
      { href: 'update.html',    label: '固件升级', icon: '↑' },
    ];
    var ul = document.createElement('ul');
    links.forEach(function (l) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = l.href;
      a.setAttribute('data-icon', l.icon);
      a.textContent = l.label;
      if (l.href === path) a.classList.add('active');
      li.appendChild(a);
      ul.appendChild(li);
    });
    var nav = document.getElementById('sidebar');
    if (nav) nav.appendChild(ul);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildNav);
  else buildNav();
})();

/* overview: fetch information.json and fill the info table (index only) */
(function () {
  var KEY_LABELS = {
    hw_ver: '型号', sw_ver: '固件版本', build_date: '编译日期', hostname: '主机名',
    mac_address: 'MAC 地址', chip_temp: '芯片温度', ip_address: 'IP 地址',
    ip_gateway: '默认网关', ip_netmask: '子网掩码', syslog_server: 'Syslog 服务器',
    flash_size: 'Flash 大小', sfp_slot_0: 'SFP 插槽 1', sfp_slot_1: 'SFP 插槽 2'
  };
  document.addEventListener('DOMContentLoaded', function () {
    var tbody = document.querySelector('#infoTable tbody');
    if (!tbody) return;
    fetch('/information.json').then(function (r) { return r.json(); }).then(function (data) {
      function row(k, v) {
        var tr = document.createElement('tr');
        var td1 = document.createElement('td'); td1.textContent = k;
        var td2 = document.createElement('td'); td2.textContent = v;
        tr.appendChild(td1); tr.appendChild(td2); tbody.appendChild(tr);
      }
      Object.keys(KEY_LABELS).forEach(function (k) { if (k in data) row(KEY_LABELS[k], data[k]); });
      Object.keys(data).forEach(function (k) { if (!(k in KEY_LABELS)) row(k, data[k]); });
    }).catch(function (e) { console.error('information.json:', e); });
  });
})();
