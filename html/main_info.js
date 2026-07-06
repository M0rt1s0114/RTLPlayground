/* main_info.js – 拉取 information.json 并渲染概览表格 */
(function () {
  /* 固件返回的 JSON key → 中文显示名（按展示顺序排列） */
  var KEY_LABELS = {
    hw_ver:           '型号',
    sw_ver:           '固件版本',
    build_date:       '编译日期',
    mac_address:      'MAC 地址',
    ip_address:       'IP 地址',
    ip_gateway:       '默认网关',
    ip_netmask:       '子网掩码',
    syslog_server_ip: 'Syslog 服务器',
    flash_size:       'Flash 大小',
    sfp_slot_0:       'SFP 插槽 1',
    sfp_slot_1:       'SFP 插槽 2',
  };

  document.addEventListener('DOMContentLoaded', function () {
    fetch('/information.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var tbody = document.querySelector('#infoTable tbody');
        /* 按 KEY_LABELS 定义的顺序输出已知字段 */
        Object.keys(KEY_LABELS).forEach(function (k) {
          if (!(k in data)) return;
          var tr = document.createElement('tr');
          var td1 = document.createElement('td');
          var td2 = document.createElement('td');
          td1.textContent = KEY_LABELS[k];
          td2.textContent = data[k];
          tr.appendChild(td1);
          tr.appendChild(td2);
          tbody.appendChild(tr);
        });
        /* 未知字段兜底显示，避免信息丢失 */
        Object.keys(data).forEach(function (k) {
          if (k in KEY_LABELS) return;
          var tr = document.createElement('tr');
          var td1 = document.createElement('td');
          var td2 = document.createElement('td');
          td1.textContent = k;
          td2.textContent = data[k];
          tr.appendChild(td1);
          tr.appendChild(td2);
          tbody.appendChild(tr);
        });
      })
      .catch(function (e) { console.error('information.json 获取失败:', e); });
  });
})();
