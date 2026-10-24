/* stp.js – 生成树（STP/RSTP）状态与配置 */
var stpData = null;

function stpStateName(st) {
  return ['禁用', '阻塞', '学习', '转发'][st] || ('未知(' + st + ')');
}
function stpRoleName(r) {
  return ['禁用', '根端口', '指定端口', '替代端口'][r] || ('未知(' + r + ')');
}
function stpHex(v, n) {
  return '0x' + (v >>> 0).toString(16).padStart(n, '0');
}
function stpRefreshView() {
  if (!stpData) return;
  var s = stpData;
  document.getElementById('stp-on').checked = !!s.on;
  document.getElementById('stp-rstp').value = s.rstp ? 'rstp' : 'stp';
  document.getElementById('stp-prio').value = s.prio;
  document.getElementById('stp-hello').value = s.hello;
  document.getElementById('stp-maxage').value = s.maxage;
  document.getElementById('stp-fwd').value = s.fwd;
  document.getElementById('stp-txhold').value = s.txhold;
  document.getElementById('stp-root').textContent =
    stpHex(parseInt(s.rootPrio, 16), 4) + ' / ' + s.rootMac;
  document.getElementById('stp-my').textContent = s.myMac;
  document.getElementById('stp-cost').textContent = stpHex(parseInt(s.cost, 16), 8);
  document.getElementById('stp-rootport').textContent =
    s.weRoot ? '本机是根桥' : ('端口 ' + s.rootPort);
  document.getElementById('stp-tc').textContent = stpHex(parseInt(s.tc, 16), 4);

  var tb = document.getElementById('stp-ports').tBodies[0];
  tb.innerHTML = '';
  s.ports.forEach(function (p) {
    var tr = tb.insertRow();
    var name = p.lag ? ('LAG ' + p.lag + ' (成员 ' + p.mbr + ')') : ('端口 ' + p.p);
    var cells = [
      name,
      stpRoleName(p.role),
      stpStateName(p.st),
      p.pc,
      p.prio,
      p.p2 ? 'on' : 'off',
      (p.f & 1) ? '是' : '否',
      (p.f & 2) ? '是' : '否',
      (p.f & 4) ? '是' : '否',
      (p.f & 8) ? '是' : '否',
      (p.f & 16) ? '是' : '否',
      (p.f & 32) ? '是' : '否',
    ];
    cells.forEach(function (c, i) {
      var td = tr.insertCell();
      td.textContent = c;
      if (i === 2) td.style.color = (p.st === 3) ? 'var(--grn)' : (p.st === 0 ? 'var(--mut)' : 'var(--acc)');
    });
  });
}
function stpLoad() {
  return fetch('/stp.json').then(function (r) { return r.json(); }).then(function (s) {
    stpData = s;
    stpRefreshView();
  }).catch(function (e) { console.error('stp.json:', e); });
}
function stpCmd(cmd) {
  return fetch('/cmd', { method: 'POST', body: cmd }).catch(function (e) { console.error(e); });
}
function stpToggle() {
  stpCmd(document.getElementById('stp-on').checked ? 'stp on' : 'stp off')
    .then(stpLoad);
}
function stpApply() {
  var cmds = [];
  cmds.push('stp version ' + document.getElementById('stp-rstp').value);
  cmds.push('stp prio ' + document.getElementById('stp-prio').value);
  cmds.push('stp hello ' + document.getElementById('stp-hello').value);
  cmds.push('stp maxage ' + document.getElementById('stp-maxage').value);
  cmds.push('stp fwd ' + document.getElementById('stp-fwd').value);
  cmds.push('stp txhold ' + document.getElementById('stp-txhold').value);
  cmds.reduce(function (p, c) { return p.then(function () { return stpCmd(c); }); }, Promise.resolve())
    .then(stpLoad);
}
window.addEventListener('load', function () {
  if (typeof update === 'function') update(function () {});
  stpLoad();
  setInterval(stpLoad, 2000);
});
