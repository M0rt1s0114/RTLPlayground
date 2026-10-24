/* isolation.js – 端口隔离矩阵（允许访问的目标端口） */
var isoData = [];

function isoBuild() {
  if (!numPorts) return;
  var tbl = document.getElementById('isotbl');
  if (tbl.tHead.rows.length) return;
  var h1 = tbl.tHead.insertRow();
  var th = document.createElement('th');
  th.textContent = '源端口 \\ 目标';
  h1.appendChild(th);
  for (var c = 1; c <= numPorts; c++) {
    var hc = document.createElement('th');
    hc.textContent = c;
    h1.appendChild(hc);
  }
  var hc = document.createElement('th');
  hc.textContent = 'CPU';
  h1.appendChild(hc);

  var tb = tbl.tBodies[0];
  for (var r = 1; r <= numPorts; r++) {
    var tr = tb.insertRow();
    tr.insertCell().textContent = r;
    for (var c = 1; c <= numPorts + 1; c++) {
      var td = tr.insertCell();
      td.style.textAlign = 'center';
      if (r === c) {
        td.textContent = '•';
        td.style.color = 'var(--mut)';
        continue;
      }
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.id = 'iso' + r + '_' + c;
      td.appendChild(cb);
    }
  }
}

function isoLoad() {
  if (!numPorts) return;
  isoBuild();
  fetch('/isolation.json').then(function (r) { return r.json(); }).then(function (s) {
    isoData = s;
    s.forEach(function (e) {
      var m = parseInt(e.allow, 16);
      var row = parseInt(e.portNum, 10);
      for (var c = 1; c <= numPorts; c++) {
        var cb = document.getElementById('iso' + row + '_' + c);
        if (cb) cb.checked = !!(m & (1 << physToLogPort[c - 1]));
      }
      var cpu = document.getElementById('iso' + row + '_' + (numPorts + 1));
      if (cpu) cpu.checked = !!(m & 0x200);
    });
  }).catch(function (e) { console.error('isolation.json:', e); });
}

function isoApply() {
  var cmds = [];
  for (var r = 1; r <= numPorts; r++) {
    var cmd = 'isolate ' + r;
    for (var c = 1; c <= numPorts; c++) {
      var cb = document.getElementById('iso' + r + '_' + c);
      if (r === c || (cb && cb.checked)) cmd += ' ' + c;
    }
    var cpu = document.getElementById('iso' + r + '_' + (numPorts + 1));
    if (cpu && cpu.checked) cmd += ' 0';
    cmds.push(cmd);
  }
  cmds.reduce(function (p, c) {
    return p.then(function () { return fetch('/cmd', { method: 'POST', body: c }); });
  }, Promise.resolve()).then(function () {
    setTimeout(isoLoad, 200);
  }).catch(function (e) { console.error(e); });
}

window.addEventListener('load', function () {
  if (typeof update === 'function') update(function () { isoLoad(); });
});
