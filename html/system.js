var configInterval = Number();
var configuration = [];
const conf_cmds = [
  /^ip\s+(\d{1,3}\.){3}\d{1,3}$/,
  /^ip\s+dhcp$/,
  /^gw\s+(\d{1,3}\.){3}\d{1,3}$/,
  /^netmask\s+(\d{1,3}\.){3}\d{1,3}$/,
  /^syslog\s+(on|off)$/,
  /^syslog\s+ip\s+(\d{1,3}\.){3}\d{1,3}$/,
  /^passwd\s+\S+$/,
  /^vlan\s+\d{1,4}\s+d$/,
  /^vlan\s+\d{1,4}\s+mgmt$/,
  /^vlan\s+\d{1,4}(\s+[a-zA-Z]\w*)?(\s+\d{1,2}[tu]?)+$/,
  /^pvid\s+\d{1,2}\s+\d{1,4}$/,
  /^ingress(\s+\d{1,2}[tua])+$/,
  /^ingress\s+[tua]$/,
  /^port\s+\d{1,2}\s+(10m|100m|1g|2g5|5g|10g|auto|on|off)(\s+(half|full))?$/,
  /^port\s+\d{1,2}\s+name\s+\S+$/,
  /^eee(\s+\d{1,2})?\s+(on|off)$/,
  /^mirror(\s+\d{1,2})(\s+\d{1,2}[tr]?)+$/,
  /^lag\s+\d(\s+\d{1,2})+$/,
  /^laghash\s+\d(\s+\w+)+$/,
  /^isolate\s+\d{1,2}(\s+(off|\d{1,2}))+$/,
  /^stp\s+(on|off)$/,
  /^igmp\s+(on|off)$/,
  /^mtu\s+\d{1,2}\s+\d+$/,
  /^bw\s+(in|out)\s+\d{1,2}\s+\S+$/,
  /^hostname\s+\S{1,23}$/,
  /^syslog\s+(ip\s+(\d{1,3}\.){3}\d{1,3}|port\s+\d{1,5}|on|off)$/,
  /^dns\s+server\s+(\d{1,3}\.){3}\d{1,3}(\s+(\d{1,3}\.){3}\d{1,3})?$/,
  /^ntp\s+(on|off|server\s+\S{1,47}|interval\s+\d{1,4}|timezone\s+[+-]?\d{1,2}(:\d{2})?|dst\s+(off|eu|us))$/,
  /^storm\s+\d{1,2}\s+(bcast|mcast|ucast|umcast)\s+(off|\d{1,8}\s+(pps|kbps))$/,
  /^lldp\s+(on|off)$/,
  /^port\s+\d{1,2}\s+lldp\s+(permit|block)$/,
  /^lag\s+[1-4]\s+lacp(\s+(off|\d{1,2}))+$/,
  /^stp\s+version\s+(rstp|stp)$/,
  /^stp\s+(port\s+\d{1,2}|lag\s+[1-4])\s+(on|off|edge\s+(on|off|auto)|cost\s+\d{1,9}|prio\s+\d{1,3}|guard\s+(none|bpdu|root)|filter\s+(on|off)|p2p\s+(auto|on|off))$/,
  /^stp\s+(prio|hello|maxage|fwd|txhold)\s+\d{1,2}$/,
  /^isolate\s+\d{1,2}(\s+\d{1,2})*$/,
  /^mac\s+\S+$/,
  /^isolate\s+\d{1,2}\s+off$/,
];
const conf_overwrite = [
  /^ip\b/,
  /^gw\b/,
  /^netmask\b/,
  /^syslog\s+ip\b/,
  /^syslog\b/,
  /^passwd\b/,
  /^vlan\s+\d{1,4}\s+mgmt$/,
  /^vlan\s+\d{1,4}(?!\s+mgmt\b)/,
  /^pvid\s+\d{1,2}\b/,
  /^ingress\b/,
  /^port\s+\d{1,2}(?!\s+name\b)/,
  /^port\s+\d{1,2}\s+name\b/,
  /^eee\s+\d{1,2}\b/,
  /^eee\b/,
  /^mirror\b/,
  /^lag\s+\d+\b/,
  /^laghash\b/,
  /^isolate\s+\d{1,2}\b/,
  /^stp\b/,
  /^igmp\b/,
  /^mtu\s+\d{1,2}\b/,
  /^bw\s+(in|out)\s+\d{1,2}\b/,
  /^hostname\b/,
  /^syslog\b/,
  /^dns\b/,
  /^ntp\b/,
  /^storm\b/,
  /^lldp\b/,
  /^port\s+\d{1,2}\s+lldp\b/,
  /^lag\s+\d+\s+lacp\b/,
  /^stp\s+(port|lag|version)\b/,
  /^isolate\b/,
  /^mac\b/,
];

function parseConf(s){
  var a = s.split(/\r\n|\n/);
  for (var l = 0; l < a.length; l++) {
    var line = a[l].trim().replace(/\s+/g, ' ');
    if (!line.length) continue;
    const deleteMatch = line.match(/^vlan\s+(\d{1,4})\s+d$/);
    if (deleteMatch) {
      const prefix = "vlan " + deleteMatch[1] + " ";
      configuration = configuration.filter(c => !c.startsWith(prefix));
      continue;
    }
    console.log(l + ' --> ' + line);
    var ignore = true;
    for (const x of conf_cmds)
      if (x.test(line)) { ignore = false; break; }
    if (ignore) continue;
    for (const x of conf_overwrite) {
      if (x.test(line)) {
        let m = line.match(x);
        let matchStr = m[0];
        configuration = configuration.filter(item =>
          !(item === matchStr || (item.startsWith(matchStr + " ") && !item.endsWith(" mgmt") && !item.startsWith(matchStr + " name "))));
        break;
      }
    }
    // Only one management VLAN can be active, so drop any previous mgmt entry
    if (/^vlan\s+\d{1,4}\s+mgmt$/.test(line))
      configuration = configuration.filter(item => !/^vlan\s+\d{1,4}\s+mgmt$/.test(item));
    configuration.push(line);
  }
  console.log("Configuration now:");
  for (const x of configuration) { console.log(x); }
}

async function fetchConfig() {
  try {
    const response = await fetch('/config');
    console.log("CONFIG: ", response);
    const t = await response.text();
    return t;
  } catch(err) {
    console.error("Error: ", err);
  }
}

async function fetchCmdLog() {
  try {
    const response = await fetch('/cmd_log');
    console.log("CMD-Log: ", response);
    const t = await response.text();
    return t;
  } catch(err) {
    console.error("Error: ", err);
    return "";
  }
}


var systemInterval = Number();
var isSaving = false;
const ips = ["ip", "netmask", "gw"];

function checkIp(ip) {
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4.test(ip)) {alert(`Invalid ip:${ip}`); return false };
  return true;
}

async function ipSub() {
  for (let i=0;i<3;i++) {
    if (!checkIp(document.getElementById(ips[i]).value))
      return;
  }
  var cmd = '';
  for (let i=0; i<3;i++){
    cmd += ips[i]+' '+document.getElementById(ips[i]).value+'\n';
  }
  try {
    const response = await fetch('/cmd', {
      method: 'POST',
      body: cmd
    });
    console.log('Completed!', response);
    fetchIP();
  } catch(err) {
    console.error(`Error: ${err}`);
  }
}

async function cmdSub() {
  var cmd = document.getElementById('console_cmd').value;
  try {
    const response = await fetch('/cmd', {
      method: 'POST',
      body: cmd
    });
    console.log('Completed!', response);
  } catch(err) {
      console.error(`Error: ${err}`);
  }
}


async function sendConfig(c) {
  if (isSaving) return;
  isSaving = true;
  clearInterval(systemInterval);
  const form = new FormData();
  form.append("MAX_FILE_SIZE", "4096");
  form.append("configuration", new Blob([c], {type: "application/octet-stream"}), "config.txt");
  try {
    const response = await fetch('/config', {
      method: 'POST',
      body: form
    });
    console.log('Completed!', response);
    try {
      await fetch('/cmd_log_clear', { method: 'GET' });
    } catch(e) {}
  } catch(err) {
    console.error(`Error: ${err}`);
  } finally {
    isSaving = false;
    systemInterval = setInterval(fetchIP, 1000);
  }
}


async function flashSave() {
  configuration = [];
  const savedConfig = await fetchConfig();
  const cmdLog = await fetchCmdLog();
  if (savedConfig) parseConf(savedConfig);
  if (cmdLog) parseConf(cmdLog);
  const body = configuration.join('\n') + '\n';
  console.log("CONFIGURATION to save: ", body);
  await sendConfig(body);
}

async function flashStartupSave() {
  var configContent = document.getElementById("config_display").value;
  console.log("CONFIGURATION to save: ", configContent);
  sendConfig(configContent);
  // Clear the command log 1 second after initiating the config save
  setTimeout(() => {
    fetch('/cmd_log_clear', { method: 'GET' })
      .then(response => console.log('Command log cleared', response))
      .catch(err => console.error('Error clearing command log:', err));
  }, 1000);
}

function clearConfig() {
  document.getElementById("config_display").value = "";
  
  // Validate and populate with current IP settings
  for (let i=0; i<3; i++) {
    if (!checkIp(document.getElementById(ips[i]).value))
      return;
  }
  
  var configLines = "";
  for (let i=0; i<3; i++){
    var cmd = ips[i]+' '+document.getElementById(ips[i]).value;
    configLines += cmd + "\n";
  }
  
  document.getElementById("config_display").value = configLines;
}

function fetchIP() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      const s = JSON.parse(xhttp.responseText);
      console.log("IP: ", s);
      document.getElementById("ip").value=s.ip_address;
      document.getElementById("netmask").value=s.ip_netmask;
      document.getElementById("gw").value=s.ip_gateway;
      clearInterval(systemInterval);
      // Fetch and populate the config textbox
      fetchConfig().then((configText) => {
        let fullConfig = configText;
        // Fetch and append cmd_log
        //return fetchCmdLog().then((cmdLogText) => {
        //  if (cmdLogText) {
        //    fullConfig = fullConfig + cmdLogText;
        //  }
        document.getElementById("config_display").value = fullConfig;
        });
      };
    }
  xhttp.open("GET", `/information.json`, true);
  xhttp.send();
}

function resetSwitch() {
  if (!confirm('Are you sure you want to reset the switch?')) {
    return;
  }
  fetch('/reset', { method: 'GET' }).catch(() => {});
  setTimeout(() => {
    alert('Switch is resetting. Please wait and refresh the page.');
  }, 3000);
}

window.addEventListener("load", function() {
  systemInterval = setInterval(fetchIP, 1000);
});

/* ── 主机名 / Syslog ──────────────────────────────────────────────────────── */
var sysInfo = {};

function loadSysExtra() {
  fetch('/information.json').then(function (r) { return r.json(); }).then(function (s) {
    sysInfo = s;
    var hn = document.getElementById('hostname');
    if (hn) hn.value = s.hostname || '';
    var sp = s.syslog_server || '';
    var m = sp.match(/^([0-9.]+)(?::([0-9]+))?$/);
    if (m) {
      var ip = document.getElementById('syslog_ip');
      var pt = document.getElementById('syslog_port');
      if (ip) ip.value = m[1];
      if (pt && m[2]) pt.value = parseInt(m[2], 10);
    }
  }).catch(function (e) { console.error('information.json:', e); });
  fetch('/config').then(function (r) { return r.text(); }).then(function (t) {
    var cb = document.getElementById('syslog_en');
    if (cb) cb.checked = /^syslog on$/m.test(t);
  }).catch(function (e) { console.error('/config:', e); });
}

function hostnameSub() {
  var v = document.getElementById('hostname').value.trim();
  if (!v) { alert('主机名不能为空'); return; }
  fetch('/cmd', { method: 'POST', body: 'hostname ' + v })
    .then(loadSysExtra).catch(function (e) { console.error(e); });
}

function syslogSub() {
  var cmds = [];
  cmds.push(document.getElementById('syslog_en').checked ? 'syslog on' : 'syslog off');
  var ip = document.getElementById('syslog_ip').value.trim();
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) cmds.push('syslog ip ' + ip);
  var port = parseInt(document.getElementById('syslog_port').value, 10);
  if (port > 0) cmds.push('syslog port ' + port);
  cmds.reduce(function (p, c) {
    return p.then(function () { return fetch('/cmd', { method: 'POST', body: c }); });
  }, Promise.resolve()).then(loadSysExtra).catch(function (e) { console.error(e); });
}

window.addEventListener('load', function () {
  loadSysExtra();
  setInterval(loadSysExtra, 10000);
});

/* ── 主题选择 ─────────────────────────────────────────────────────────────── */
function initThemeCard() {
  var sel = document.getElementById('theme');
  if (!sel || !window.RTL_THEMES) return;
  Object.keys(window.RTL_THEMES).forEach(function (k) {
    var o = document.createElement('option');
    o.value = k; o.textContent = window.RTL_THEMES[k];
    sel.appendChild(o);
  });
  var cur = 'dark';
  try { cur = localStorage.getItem('rtl_theme') || 'dark'; } catch (e) {}
  sel.value = cur;
  sel.onchange = function () { window.applyTheme(this.value); };
}

/* ── DNS（命令输出解析，与上游 SPA 一致） ─────────────────────────────────── */
function dnsLoad() {
  return fetch('/cmd', { method: 'POST', body: 'dns' })
    .then(function (r) { return r.text(); })
    .then(function (b) {
      var m = b.match(/DNS servers ([\d.]+) ([\d.]+), from DHCP ([\d.]+)/);
      if (!m) return;
      function v(x) { return x === '0.0.0.0' ? '' : x; }
      document.getElementById('dns1').value = v(m[1]);
      document.getElementById('dns2').value = v(m[2]);
      document.getElementById('dns_dhcp').textContent = m[3] === '0.0.0.0' ? '' : ('DHCP 下发：' + m[3]);
    }).catch(function (e) { console.error('dns:', e); });
}
function dnsSub() {
  var a = document.getElementById('dns1').value.trim();
  var b = document.getElementById('dns2').value.trim();
  if (!a) { alert('DNS 服务器 1 不能为空；关闭 DNS 请填 0.0.0.0'); return; }
  fetch('/cmd', { method: 'POST', body: 'dns server ' + a + (b ? ' ' + b : '') })
    .then(function () { setTimeout(dnsLoad, 300); }).catch(function (e) { console.error(e); });
}

/* ── NTP / 本地时间 ───────────────────────────────────────────────────────── */
var ntpBase = null;
function ntpPad(n) { return String(n).padStart(2, '0'); }
function ntpTick() {
  var el = document.getElementById('ntp_now');
  if (!el) return;
  if (!ntpBase) { el.textContent = '—'; return; }
  var d = new Date(ntpBase.ms + (Date.now() - ntpBase.at));
  el.textContent = d.getUTCFullYear() + '-' + ntpPad(d.getUTCMonth() + 1) + '-' + ntpPad(d.getUTCDate()) +
    ' ' + ntpPad(d.getUTCHours()) + ':' + ntpPad(d.getUTCMinutes()) + ':' + ntpPad(d.getUTCSeconds()) + ' ' + ntpBase.tz;
}
function ntpLoad() {
  return fetch('/cmd', { method: 'POST', body: 'ntp' })
    .then(function (r) { return r.text(); })
    .then(function (b) {
      var m = b.match(/NTP (on|off), server (\S*), address ([\d.]+), interval (\d+) min, timezone ([+-]\d\d:\d\d), dst (\w+)/);
      if (!m) return;
      var x = b.match(/Time (\d{4})-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d) UTC([+-]\d\d:\d\d)( DST)?, synchronised (\d+) min ago/);
      if (x) {
        ntpBase = {
          at: Date.now(),
          ms: Date.UTC(+x[1], +x[2] - 1, +x[3], +x[4], +x[5], +x[6]),
          tz: x[7] + (x[8] ? ' DST' : ''),
          sync: +x[9]
        };
        ntpTick();
        document.getElementById('ntp_sync').textContent = '已同步（' + x[9] + ' 分钟前）';
      } else {
        ntpBase = null;
        ntpTick();
        document.getElementById('ntp_sync').textContent = m[1] === 'on' ? '等待同步' : '未启用';
      }
      var en = document.getElementById('ntp_en');
      if (document.activeElement !== en) en.checked = (m[1] === 'on');
      var srv = document.getElementById('ntp_server');
      if (document.activeElement !== srv) srv.value = m[2];
      var it = document.getElementById('ntp_interval');
      if (document.activeElement !== it) it.value = m[4];
      var tz = document.getElementById('ntp_tz');
      if (document.activeElement !== tz) tz.value = m[5];
      document.getElementById('ntp_dst').value = m[6];
    }).catch(function (e) { console.error('ntp:', e); });
}
function ntpSub() {
  var cmds = [];
  cmds.push(document.getElementById('ntp_en').checked ? 'ntp on' : 'ntp off');
  var srv = document.getElementById('ntp_server').value.trim();
  if (srv) cmds.push('ntp server ' + srv);
  var it = parseInt(document.getElementById('ntp_interval').value, 10);
  if (it > 0) cmds.push('ntp interval ' + it);
  var tz = document.getElementById('ntp_tz').value.trim();
  if (/^[+-]?\d{1,2}(:\d{2})$/.test(tz)) cmds.push('ntp timezone ' + tz);
  cmds.push('ntp dst ' + document.getElementById('ntp_dst').value);
  cmds.reduce(function (p, c) {
    return p.then(function () { return fetch('/cmd', { method: 'POST', body: c }); });
  }, Promise.resolve()).then(function () { setTimeout(ntpLoad, 300); })
    .catch(function (e) { console.error(e); });
}

window.addEventListener('load', function () {
  initThemeCard();
  dnsLoad();
  ntpLoad();
  setInterval(ntpTick, 1000);
  setInterval(dnsLoad, 15000);
  setInterval(ntpLoad, 15000);
});
