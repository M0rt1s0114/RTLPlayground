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
