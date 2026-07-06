(function () {
  var path = location.pathname.split('/').pop() || 'index.html';
  var links = [
    { href: 'index.html',     label: '概览',     icon: '⬡' },
    { href: 'ports.html',     label: '端口配置', icon: '⛭' },
    { href: 'stat.html',      label: '端口统计', icon: '◈' },
    { href: 'vlan.html',      label: 'VLAN',     icon: '◧' },
    { href: 'l2.html',        label: 'L2 表',    icon: '⊞' },
    { href: 'mirror.html',    label: '端口镜像', icon: '⇆' },
    { href: 'lag.html',       label: '链路聚合', icon: '⇌' },
    { href: 'eee.html',       label: '节能以太网', icon: '⚡' },
    { href: 'bandwidth.html', label: '带宽限速', icon: '◉' },
    { href: 'system.html',    label: '系统设置', icon: '⚙' },
    { href: 'update.html',    label: '固件升级', icon: '↑' },
  ];
  var ul = document.createElement('ul');
  links.forEach(function (l) {
    var li = document.createElement('li');
    var a  = document.createElement('a');
    a.href = l.href;
    a.setAttribute('data-icon', l.icon);
    a.textContent = l.label;
    if (l.href === path) a.classList.add('active');
    li.appendChild(a);
    ul.appendChild(li);
  });
  var nav = document.getElementById('sidebar');
  if (nav) nav.appendChild(ul);
})();
