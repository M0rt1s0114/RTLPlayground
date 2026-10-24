/* stp.js - 生成树（STP/RSTP）状态、桥设置与每端口设置 */
var stpData = null;
var stpPorts = [];
var stpCfgBuilt = false;

var STP_PF = { EN: 1, ADMEDGE: 2, AUTOEDGE: 4, BPDUG: 8, ROOTG: 16, FILTER: 32, OPEREDGE: 64, TRIP: 128 };

function stpStateName(st) { return ['禁用', '阻塞', '学习', '转发'][st] || ('未知(' + st + ')'); }
function stpRoleName(r) { return ['禁用', '根端口', '指定端口', '替代端口'][r] || ('未知(' + r + ')'); }
function stpHex(v, n) { return '0x' + (v >>> 0).toString(16).padStart(n, '0'); }

function stpRefreshStatus() {
  if (!stpData) return;
  var s = stpData;
  document.getElementById('stp-on').checked = !!s.on;
  document.getElementById('stp-rstp').value = s.rstp ? 'rstp' : 'stp';
  document.getElementById('stp-prio').value = s.prio;
  document.getElementById('stp-hello').value = s.hello;
  document.getElementById('stp-maxage').value = s.maxage;
  document.getElementById('stp-fwd').value = s.fwd;
  document.getElementById('stp-txhold').value = s.txhold;
  document.getElementById('stp-root').textContent = parseInt(s.rootPrio, 16).toString(16).padStart(4, '0') + ' / ' + s.rootMac;
  document.getElementById('stp-my').textContent = s.myMac;
  document.getElementById('stp-cost').textContent = stpHex(parseInt(s.cost, 16), 8);
  document.getElementById('stp-rootport').textContent = s.weRoot ? '本机是根桥' : ('端口 ' + s.rootPort);
  document.getElementById('stp-tc').textContent = stpHex(parseInt(s.tc, 16), 4);

  var tb = document.getElementById('stp-ports').tBodies[0];
  tb.innerHTML = '';
  s.ports.forEach(function (p) {
    var tr = tb.insertRow();
    var name = p.lag ? ('LAG ' + p.lag + ' (成员 ' + p.mbr + ')') : ('端口 ' + p.p);
    var cells = [
      name, stpRoleName(p.role), stpStateName(p.st), p.pc, p.prio,
      p.p2 === 0 ? 'auto' : (p.p2 === 1 ? 'on' : 'off'),
      (p.f & STP_PF.EN) ? '是' : '否',
      (p.f & STP_PF.ADMEDGE) ? '是' : ((p.f & STP_PF.AUTOEDGE) ? 'auto' : '否'),
      (p.f & STP_PF.BPDUG) ? '是' : '否',
      (p.f & STP_PF.ROOTG) ? '是' : '否',
      (p.f & STP_PF.FILTER) ? '是' : '否',
    ];
    cells.forEach(function (c, i) {
      var td = tr.insertCell();
      td.textContent = c;
      if (i === 2) td.style.color = (p.st === 3) ? 'var(--grn)' : (p.st === 0 ? 'var(--mut)' : 'var(--acc)');
    });
  });
}

function stpSelect(id, opts) {
  var s = '<select id="' + id + '">';
  opts.forEach(function (o) { s += '<option value="' + o[0] + '">' + o[1] + '</option>'; });
  return s + '</select>';
}

function stpBuildCfg() {
  if (stpCfgBuilt || !stpData) return;
  stpCfgBuilt = true;
  stpPorts = stpData.ports;
  var wrap = document.getElementById('stp-cfg');
  var t = document.createElement('table');
  t.innerHTML = '<thead><tr><th>端口</th><th>启用</th><th>Edge</th><th>路径开销</th><th>优先级</th>' +
    '<th>Guard</th><th>Filter</th><th>P2P</th><th>应用</th></tr></thead><tbody></tbody>';
  wrap.appendChild(t);
  var tb = t.tBodies[0];
  stpPorts.forEach(function (p, i) {
    var tr = tb.insertRow();
    tr.insertCell().textContent = p.lag ? ('LAG ' + p.lag) : ('端口 ' + p.p);
    var td = tr.insertCell();
    td.innerHTML = '<input type="checkbox" id="stpcfg_' + i + '_en">';
    td = tr.insertCell();
    td.innerHTML = stpSelect('stpcfg_' + i + '_edge', [['off', 'off'], ['on', 'on'], ['auto', 'auto']]);
    td = tr.insertCell();
    td.innerHTML = '<input type="number" min="0" max="200000000" id="stpcfg_' + i + '_cost" style="width:110px;">';
    td = tr.insertCell();
    td.innerHTML = '<input type="number" min="0" max="240" step="16" id="stpcfg_' + i + '_prio" style="width:80px;">';
    td = tr.insertCell();
    td.innerHTML = stpSelect('stpcfg_' + i + '_guard', [['none', 'none'], ['bpdu', 'bpdu'], ['root', 'root']]);
    td = tr.insertCell();
    td.innerHTML = '<input type="checkbox" id="stpcfg_' + i + '_filter">';
    td = tr.insertCell();
    td.innerHTML = stpSelect('stpcfg_' + i + '_p2p', [['auto', 'auto'], ['on', 'on'], ['off', 'off']]);
    td = tr.insertCell();
    var b = document.createElement('button');
    b.textContent = '应用';
    b.onclick = (function (idx) { return function () { stpApplyPort(idx); }; })(i);
    td.appendChild(b);

    var en = document.getElementById('stpcfg_' + i + '_en');
    en.checked = !!(p.f & STP_PF.EN);
    var edge = document.getElementById('stpcfg_' + i + '_edge');
    edge.value = (p.f & STP_PF.ADMEDGE) ? 'on' : ((p.f & STP_PF.AUTOEDGE) ? 'auto' : 'off');
    document.getElementById('stpcfg_' + i + '_cost').value = parseInt(p.pc, 16);
    document.getElementById('stpcfg_' + i + '_prio').value = p.prio;
    var g = document.getElementById('stpcfg_' + i + '_guard');
    g.value = (p.f & STP_PF.BPDUG) ? 'bpdu' : ((p.f & STP_PF.ROOTG) ? 'root' : 'none');
    document.getElementById('stpcfg_' + i + '_filter').checked = !!(p.f & STP_PF.FILTER);
    var p2 = document.getElementById('stpcfg_' + i + '_p2p');
    p2.value = p.p2 === 0 ? 'auto' : (p.p2 === 1 ? 'on' : 'off');
  });
}

function stpLoad() {
  return fetch('/stp.json').then(function (r) { return r.json(); }).then(function (s) {
    stpData = s;
    stpRefreshStatus();
    stpBuildCfg();
  }).catch(function (e) { console.error('stp.json:', e); });
}
function stpCmd(cmd) {
  return fetch('/cmd', { method: 'POST', body: cmd }).catch(function (e) { console.error(e); });
}
function stpToggle() {
  stpCmd(document.getElementById('stp-on').checked ? 'stp on' : 'stp off').then(stpLoad);
}
function stpApply() {
  var cmds = [
    'stp version ' + document.getElementById('stp-rstp').value,
    'stp prio ' + document.getElementById('stp-prio').value,
    'stp hello ' + document.getElementById('stp-hello').value,
    'stp maxage ' + document.getElementById('stp-maxage').value,
    'stp fwd ' + document.getElementById('stp-fwd').value,
    'stp txhold ' + document.getElementById('stp-txhold').value,
  ];
  cmds.reduce(function (p, c) { return p.then(function () { return stpCmd(c); }); }, Promise.resolve()).then(stpLoad);
}

function stpApplyPort(i) {
  var p = stpPorts[i];
  var target = p.lag ? ('lag ' + p.lag) : ('port ' + p.p);
  var en = document.getElementById('stpcfg_' + i + '_en').checked;
  var edge = document.getElementById('stpcfg_' + i + '_edge').value;
  var cost = parseInt(document.getElementById('stpcfg_' + i + '_cost').value, 10);
  var prio = parseInt(document.getElementById('stpcfg_' + i + '_prio').value, 10);
  var guard = document.getElementById('stpcfg_' + i + '_guard').value;
  var filter = document.getElementById('stpcfg_' + i + '_filter').checked;
  var p2p = document.getElementById('stpcfg_' + i + '_p2p').value;
  var cmds = [
    'stp ' + target + ' ' + (en ? 'on' : 'off'),
    'stp ' + target + ' edge ' + edge,
    'stp ' + target + ' cost ' + (isNaN(cost) ? 0 : cost),
    'stp ' + target + ' prio ' + (isNaN(prio) ? 0 : prio),
    'stp ' + target + ' guard ' + guard,
    'stp ' + target + ' filter ' + (filter ? 'on' : 'off'),
    'stp ' + target + ' p2p ' + p2p,
  ];
  cmds.reduce(function (pr, c) { return pr.then(function () { return stpCmd(c); }); }, Promise.resolve())
    .then(function () { setTimeout(stpLoad, 300); });
}

window.addEventListener('load', function () {
  if (typeof update === 'function') update(function () {});
  stpLoad();
  setInterval(stpLoad, 2000);
});
