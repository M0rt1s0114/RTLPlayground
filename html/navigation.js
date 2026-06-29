(function() {
  const path = location.pathname.split('/').pop() || 'index.html';
  const links = [
    { href: 'index.html',     label: 'Overview',         icon: '⬡' },
    { href: 'ports.html',     label: 'Port Config',      icon: '⛭' },
    { href: 'stat.html',      label: 'Port Statistics',  icon: '◈' },
    { href: 'vlan.html',      label: 'VLAN',             icon: '◧' },
    { href: 'l2.html',        label: 'L2 Table',         icon: '⊞' },
    { href: 'mirror.html',    label: 'Mirroring',        icon: '⇆' },
    { href: 'lag.html',       label: 'Link Aggregation', icon: '⇌' },
    { href: 'eee.html',       label: 'EEE',              icon: '⚡' },
    { href: 'bandwidth.html', label: 'Bandwidth Limits', icon: '◉' },
    { href: 'system.html',    label: 'System Settings',  icon: '⚙' },
    { href: 'update.html',    label: 'Firmware Update',  icon: '↑' },
  ];
  const ul = document.createElement('ul');
  links.forEach(function(l) {
    const li = document.createElement('li');
    const a  = document.createElement('a');
    a.href = l.href;
    a.setAttribute('data-icon', l.icon);
    a.textContent = l.label;
    if (l.href === path) a.classList.add('active');
    li.appendChild(a);
    ul.appendChild(li);
  });
  const nav = document.getElementById('sidebar');
  if (nav) nav.appendChild(ul);
})();
