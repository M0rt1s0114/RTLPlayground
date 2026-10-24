var l2GetInterval;
var l2Entries = [];
var l2CurrentEntry = 0;

function fillStats() {
  var tbl = document.getElementById('statstable');
  if (!numPorts)
    return;
  if (tbl.rows.length > 1) {
    for (let i = 0; i < numPorts; i++) {
      console.log("Table Update row: " + i + " state " + pState[i] + " is " + linkS[pState[i] +1]);
      tbl.rows[i+1].cells[1].innerHTML = `${linkS[pState[i]+1]}`;
      tbl.rows[i+1].cells[2].innerHTML = `${txG[i]} pkts`;
      tbl.rows[i+1].cells[3].innerHTML = `${txB[i]} pkts`;
      tbl.rows[i+1].cells[4].innerHTML = `${rxG[i]} pkts`;
      tbl.rows[i+1].cells[5].innerHTML = `${rxB[i]} pkts`;
    }
  } else {
    for (let i = 0; i < numPorts; i++) {
      console.log("Table row: " + i);
      const tr = tbl.insertRow();
      let td = tr.insertCell(); td.appendChild(document.createTextNode(`Port ${i+1}`));
      td = tr.insertCell(); td.appendChild(document.createTextNode(`${linkS[pState[i]+1]}`));
      td = tr.insertCell(); td.appendChild(document.createTextNode(`${txG[i]} pkts`));
      td = tr.insertCell();td.appendChild(document.createTextNode(`${txB[i]} pkts`));
      td = tr.insertCell();td.appendChild(document.createTextNode(`${rxG[i]} pkts`));
      td = tr.insertCell();td.appendChild(document.createTextNode(`${rxB[i]} pkts`));
    }
  }
}

function l2CMP(a, b)
{
  if (a.port < b.port)
    return -1;
  if (a.port > b.port)
    return 1;
  if (a.mac < b.mac)
    return -1;
  if (a.mac > b.mac)
    return 1;
  if (a.vlan < b.vlan)
    return -1;
  if (a.vlan > b.vlan)
    return 1;
  return 0;
}

function uniq(a) {
    return a.filter(function(item, pos, ary) {
        return !pos || item.idx != ary[pos - 1].idx;
    });
}

function delL2(idx) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var s = JSON.parse(xhttp.responseText);
      console.log("Entry deletion result: ", s.result);
    }
  };
  xhttp.open("GET", "/l2_del.json?idx=" + idx, true);
  xhttp.timeout = 1500; xhttp.send();
}

var l2All = [];

function renderL2() {
  var tbl = document.getElementById('l2table');
  var f = document.getElementById('l2filter');
  var q = f ? f.value.trim().toLowerCase() : '';
  while (tbl.rows.length > 1) tbl.deleteRow(tbl.rows.length - 1);
  var list = l2All.filter(function (e) {
    if (!q) return true;
    return String(e.port).toLowerCase().indexOf(q) >= 0 ||
           String(e.mac).toLowerCase().indexOf(q) >= 0 ||
           String(e.vlan).toLowerCase().indexOf(q) >= 0 ||
           String(e.type).toLowerCase().indexOf(q) >= 0;
  });
  list.forEach(function (e) {
    var tr = tbl.insertRow();
    tr.insertCell().textContent = e.port;
    tr.insertCell().textContent = e.mac;
    tr.insertCell().textContent = e.vlan;
    tr.insertCell().textContent = e.type;
    tr.insertCell().innerHTML = '<button type="button" onclick="delL2(' + e.idx + ');">Delete</button>';
  });
  var c = document.getElementById('l2count');
  if (c) c.textContent = list.length + ' / ' + l2All.length;
}

function fillL2(s) {
  if (!s || !s.length) { l2All = []; renderL2(); l2Entries = []; return; }
  s = s.slice().sort(l2CMP);
  s = uniq(s);
  l2All = s.map(function (e) { e.port = e.port != 9 ? e.port : "CPU"; return e; });
  renderL2();
  l2Entries = [];
}

async function flushL2() {
  try { await fetch('/cmd', { method: 'POST', body: 'l2 forget' }); } catch (e) { console.error(e); }
  l2All = []; l2Entries = []; l2CurrentEntry = 0;
  renderL2();
}

function getL2() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var s = JSON.parse(xhttp.responseText);
      if (!Array.isArray(s) || !s.length) { l2Entries = []; l2CurrentEntry = 0; l2All = []; renderL2(); return; }
      var s = s.map(function(e) { 
        e.vlan = parseInt(e.vlan, 16);
        e.idx = parseInt(e.idx, 16);
        e.type = e.type == "s" ? "static" : "learned";
        e.port = e.port == 9 ? 9 : logToPhysPort[e.port];
      return e;
    });
      l2Entries.push(...s);
      if (l2Entries.length >= 4096) {
        l2Entries = [];
        l2CurrentEntry = 0;
        clearInterval(l2GetInterval);
        return;
      }
      var w = 0;
      for (var i = l2Entries.length-1; i > 0; i--) {
        if (l2Entries[0].idx == l2Entries[i].idx) {
          w = 1;
          break;
        }
      }
      if (w) {
        l2CurrentEntry = 0; 
        fillL2(l2Entries);
      } else {
        l2CurrentEntry = s[s.length-1].idx + 1;
      }
    }
  };
  xhttp.open("GET", "/l2.json?idx=" + l2CurrentEntry, true);
  xhttp.timeout = 1500; sendXHTTP(xhttp);
}

window.addEventListener("load", function() {
  update( () => {
    getL2();
    const interval = setInterval(update, 2000);
    l2GetInterval = setInterval(getL2, 1000);
  });;
});

