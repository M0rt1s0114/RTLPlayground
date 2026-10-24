var mtus = new Int16Array(10);
var clicked = new Int8Array(10);
function createPortTable() {
  var tbl = document.getElementById('speedtable');
   if (tbl.rows.length <= 2 && numPorts) {
     const sSelect = '<select name="speed_sel" id="speed_sel">'
      + '<option value="auto">Auto</option>'
      + '<option value="2g5">2500MBit/Full</option>'
      + '<option value="1g">1000MBit/Full</option>'
      + '<option value="100m full">100MBit/Full</option>'
      + '<option value="100m half">100MBit/Half</option>'
      + '<option value="10m full">10MBit/Full</option>'
      + '<option value="10m half">10MBit/Half</option>'
      + '</select>';
      const dSwitch = '<input type="checkbox" id="disable_port" onchange="portOnOff();">'
     for (let i = 1; i <= numPorts; i++) {
      const tr = tbl.insertRow();
      let td = tr.insertCell(); td.appendChild(document.createTextNode(`Port ${i}`));
      let portName = portNames[physToLogPort[i-1]] || '';
      td = tr.insertCell();
      td.innerHTML = '<input id="pname_' + i + '" style="width:120px;" value="' + escAttr(portName) + '">';
      td = tr.insertCell(); td.innerHTML = linkS[pState[i] + 1];
      if (pIsSFP[i-1]) {
        const sfpSel = '<select id="sfp_sel_' + i + '">'
          + '<option value="auto">Auto</option>'
          + '<option value="10g">10G</option>'
          + '<option value="2g5">2.5G</option>'
          + '<option value="1g">1G</option>'
          + '<option value="100m">100M</option>'
          + '</select>';
        td = tr.insertCell(); td.innerHTML = sfpSel;
        td = tr.insertCell();
        td.innerHTML = '<input type="checkbox" id="disable_sfp_' + i + '"' + (pEnabled[i-1] ? '' : ' checked') + '>';
        td = tr.insertCell();
        td.innerHTML = '<button type="button" style="margin: 0 0 0 24px" onclick="applySfp(' + i + ');">Apply</button>';
      } else {
        td = tr.insertCell(); td.innerHTML = sSelect.replaceAll("speed_sel", "speed_sel_" + i);
        td = tr.insertCell(); td.innerHTML = dSwitch.replaceAll("disable_port", "disable_port_" + i)
                .replace("portOnOff()", "portOnOff(" + i + ")");
        td = tr.insertCell();
        td.innerHTML = '<button type="button" style="margin: 0 0 0 24px" onclick="applySpeed(' + i + ');">Apply</button>';
      }
      td = tr.insertCell();
      td.innerHTML = '<button type="button" onclick="showPortDevices(' + i + ');">查看</button>';
    }
  }
  tbl = document.getElementById('mtutable');
  if (tbl.rows.length <= 2 && numPorts) {
     const mSelect = '<select name="mtu_sel" id="mtu_sel">'
      + '<option value="16383">16383</option>'
      + '<option value="1522">1522</option>'
      + '<option value="1536">1536</option>'
      + '<option value="1552">1552</option>'
      + '<option value="9216">9216</option>'
      + '</select>';
      var tr = tbl.insertRow();
      for (let i = 1; i <= numPorts; i++) {
        let td = tr.insertCell();
        td.innerHTML = pIsSFP[i-1] ? sfpSVGStr(60,44) : portSVGStr(40,40);
      }
      tr = tbl.insertRow();
      for (let i = 1; i <= numPorts; i++) {
        let td = tr.insertCell();
        td.innerHTML = mSelect.replaceAll("mtu_sel", "mtu_sel_" + i);
      }
      tr = tbl.insertRow();
      for (let i = 1; i <= numPorts; i++) {
        let td = tr.insertCell();
        td.innerHTML = '<button type="button" style="margin: 0 0 0 24px" onclick="applyMTU(' + i + ');">Apply</button>';
      }
  }
}

function updatePortTable() {
  console.log("updatePortTable called");
  var tbl = document.getElementById('speedtable');
  if (tbl.rows.length <= 2 || !numPorts)
    return;
  for (let i = 1; i <= numPorts ; i++) {
    if (!tbl.rows[i]) continue;
    tbl.rows[i].cells[2].innerHTML = `${linkS[pState[i-1]+1]}`;
    if (pIsSFP[i-1]) {
      var sd = document.getElementById('disable_sfp_' + i);
      if (sd) sd.checked = !pEnabled[i-1];
      continue;
    }
    if (!clicked[i] && pState[i - 1] < 0) {
      document.getElementById('speed_sel_' + i).disabled = true;
      document.getElementById('disable_port_' + i).checked = true;
    }
  }
}

function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function portNameValue(port) {
  var el = document.getElementById('pname_' + port);
  return el ? el.value.trim() : '';
}

async function sendCmd(body) {
  try { await fetch('/cmd', { method: 'POST', body: body }); }
  catch (err) { console.error(err); }
}

async function sendPortName(port) {
  if (typeof portNames === 'undefined') return;
  var oldName = portNames[physToLogPort[port - 1]] || '';
  var newName = portNameValue(port);
  if (!newName || newName === oldName) return;
  if (!/^\S{1,15}$/.test(newName)) { alert(window.t ? t('端口名不能含空格，最长 15 字符') : '端口名不能含空格，最长 15 字符'); return; }
  await sendCmd('port ' + port + ' name ' + newName);
  portNames[physToLogPort[port - 1]] = newName;
}

async function applySpeed(port) {
  var speed = document.getElementById('speed_sel_' + port).value;
  var disabled = document.getElementById('disable_port_' + port).checked;
  await sendPortName(port);
  var cmd = "port " + port + " ";
  if (!disabled)
    cmd = cmd + speed;
  else
    cmd = cmd + "off";
  console.log("CMD: " + cmd);
  await sendCmd(cmd);
}

async function portOnOff(p) {
  var disabled = document.getElementById('disable_port_' + p).checked;
  document.getElementById('speed_sel_' + p).disabled = disabled;
  clicked[p] = 1;
}

async function applyMTU(port) {
  var mtu = document.getElementById('mtu_sel_' + port).value;
  var cmd = "mtu " + port + " " + mtu;
  try {
    const response = await fetch('/cmd', {
      method: 'POST',
      body: cmd
    });
    console.log('MTU Completed!', response);
    getMTUs();
  } catch(err) {
    console.error(`Error: ${err}`);
  }
}

function getMTUs() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      const s = JSON.parse(xhttp.responseText);
      console.log("MTUS: ", JSON.stringify(s));
      for (let i = 0; i < s.length; i++) {
        p = s[i];
	let n = p.portNum;
        mtus[n] = parseInt(p.mtu, 16);
        var mtu = document.getElementById('mtu_sel_' + n);
        if (!mtu)
          continue;
        mtu.value = mtus[n];
      }
    }
  };
  xhttp.open("GET", "/mtu.json", true);
  xhttp.timeout = 1500; sendXHTTP(xhttp);
}

window.addEventListener("load", function() {
  update( () => {
    createPortTable();
    updatePortTable();
    getMTUs()
    const interval = setInterval(update, 2000);
    const updatePortTableInterval = setInterval(updatePortTable, 1000);
  });
});

/* ── 端口设备清单（遍历 L2 表） ──────────────────────────────────────────── */
var l2AllCache = null;
var l2AllCacheAt = 0;

async function fetchL2All() {
  var now = Date.now();
  if (l2AllCache && now - l2AllCacheAt < 5000) return l2AllCache;
  var out = [], seen = {}, idx = 0, guard = 0;
  while (guard++ < 24) {
    var arr;
    try { arr = await fetch('/l2.json?idx=' + idx).then(function (r) { return r.json(); }); }
    catch (e) { break; }
    if (!Array.isArray(arr) || !arr.length) break;
    var added = 0;
    arr.forEach(function (e) {
      var k = parseInt(e.idx, 16);
      if (!seen[k]) { seen[k] = 1; out.push(e); added++; }
    });
    if (!added || out.length >= 4096) break;
    idx = parseInt(arr[arr.length - 1].idx, 16) + 1;
  }
  l2AllCache = out; l2AllCacheAt = now;
  return out;
}

async function showPortDevices(port) {
  var modal = document.getElementById('devmodal');
  var tb = document.getElementById('devtable').tBodies[0];
  document.getElementById('devtitle').textContent = '端口 ' + port + ' 的设备';
  tb.innerHTML = '<tr><td colspan="3">…</td></tr>';
  modal.style.display = 'flex';
  var all = await fetchL2All();
  var rows = all.filter(function (e) {
    if (e.port === 9) return false; // CPU port
    var logical = (typeof logToPhysPort !== 'undefined') ? logToPhysPort[e.port] : e.port;
    return logical === port;
  });
  tb.innerHTML = '';
  if (!rows.length) {
    tb.innerHTML = '<tr><td colspan="3">暂无设备（L2 表为空或该端口未学习到 MAC）</td></tr>';
    return;
  }
  rows.sort(function (a, b) { return a.mac.localeCompare(b.mac); });
  rows.forEach(function (e) {
    var tr = tb.insertRow();
    tr.insertCell().textContent = e.mac;
    tr.insertCell().textContent = parseInt(e.vlan, 16);
    tr.insertCell().textContent = e.type === 's' ? '静态' : '学习';
  });
}

function closeDevices() {
  document.getElementById('devmodal').style.display = 'none';
}

async function applySfp(port) {
  var slot = pIsSFP[port - 1];
  if (!slot) return;
  var speed = document.getElementById('sfp_sel_' + port).value;
  var disabled = document.getElementById('disable_sfp_' + port).checked;
  await sendPortName(port);
  await sendCmd('port ' + port + (disabled ? ' off' : ' on'));
  if (!disabled) await sendCmd('sfp ' + slot + ' ' + speed);
}
