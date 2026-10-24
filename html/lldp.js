/* lldp.js – LLDP 状态与端口许可 */
function lldpLoad() {
  fetch('/lldp.json').then(function (r) { return r.json(); }).then(function (s) {
    var en = document.getElementById('lldp-on');
    if (en) en.checked = !!s.on;
    var tb = document.getElementById('lldp-ports').tBodies[0];
    tb.innerHTML = '';
    s.portStatus.forEach(function (p) {
      var tr = tb.insertRow();
      tr.insertCell().textContent = p.portNum;
      tr.insertCell().textContent = p.name || '—';
      var td = tr.insertCell();
      td.textContent = p.permitted ? '允许' : '禁止';
      td.style.color = p.permitted ? 'var(--grn)' : 'var(--red)';
      var b = document.createElement('button');
      b.textContent = p.permitted ? '禁止' : '允许';
      b.onclick = function () {
        fetch('/cmd', { method: 'POST', body: 'port ' + p.portNum + ' lldp ' + (p.permitted ? 'block' : 'permit') })
          .then(lldpLoad).catch(function (e) { console.error(e); });
      };
      tr.insertCell().appendChild(b);
    });
  }).catch(function (e) { console.error('lldp.json:', e); });
}
function lldpToggle() {
  fetch('/cmd', { method: 'POST', body: document.getElementById('lldp-on').checked ? 'lldp on' : 'lldp off' })
    .then(lldpLoad).catch(function (e) { console.error(e); });
}
window.addEventListener('load', function () {
  if (typeof update === 'function') update(function () {});
  lldpLoad();
  setInterval(lldpLoad, 2000);
});
