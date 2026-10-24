var lagInterval = Number();

function lagForm() {
  if (!numPorts)
    return;
  for (let j=0; j < 4; j++) {
    var lag = "mLAG" + j
    console.log("Adding LAG " + lag)
    var m = document.getElementById(lag);
    for (let i = 1; i <= numPorts; i++) {
      const d = document.createElement("div");
      d.classList.add("cbgroup");
      const l = document.createElement("label");
      l.innerHTML = "" + i;
      l.classList.add("cbgroup");
      const inp = document.createElement("input");
      inp.type = "checkbox"; inp.setAttribute("class","psel");
      inp.id = "p_" + lag + "_" + i;
      const o = document.createElement("span");
    o.innerHTML = pIsSFP[i-1] ? sfpSVGStr(60,44) : portSVGStr(40,40);
      l.appendChild(inp); l.appendChild(o);
      d.appendChild(l)
      m.appendChild(d);
    }
  }
  fetchLag();
}

function setL(p, c){
  console.log("LAG setting: ", p, " to ", c);
  document.getElementById(p).checked=c;
}

function fetchLag() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      const s = JSON.parse(xhttp.responseText);
      console.log("LAG: ", JSON.stringify(s));
      for (let l = 0; l < 4; l++) {
        let members = parseInt(s[l].members, 2);
        let hash = parseInt(s[l].hash, 16);
        for (let i = 1; i <= numPorts; i++) {
          let p = i - 1;
          if (numPorts < 9)
            p = physToLogPort[p];            
          setL("p_mLAG"+l+"_"+i, members & (1<<p));
        }
      }
    }
  };
  xhttp.open("GET", `/lag.json`, true);
  sendXHTTP(xhttp);
}
async function lagSub(l) {
  var cmd = "lag " + l;
  for (let i = 1; i <= numPorts; i++) {
    if (document.getElementById("p_mLAG"+l+"_"+i).checked)
      cmd = cmd + ` ${i}`;
  }
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

window.addEventListener("load", function() {
  update( () => {
    lagForm();
    const interval = setInterval(update, 2000);
  });
});

/* ── LACP ─────────────────────────────────────────────────────────────────── */
var lacpRxNames = ['初始化', '端口禁用', '超时', '默认值', '当前'];

function lacpMaskToPorts(mask) {
  var out = [];
  for (var i = 1; i <= numPorts; i++) if (mask & (1 << (i - 1))) out.push(i);
  return out.join(',') || '—';
}

function lacpLoad() {
  fetch('/lacp.json').then(function (r) { return r.json(); }).then(function (s) {
    document.getElementById('lacp-on').textContent = 'LACP: ' + (s.on ? '已启用' : '未启用（在某个 LAG 上点“启用 LACP”）');
    var tb = document.getElementById('lacptbl').tBodies[0];
    tb.innerHTML = '';
    s.lags.forEach(function (l, g) {
      var tr = tb.insertRow();
      tr.insertCell().textContent = 'LAG ' + (g + 1);
      tr.insertCell().textContent = lacpMaskToPorts(parseInt(l.cfg, 16));
      tr.insertCell().textContent = l.aggValid ? '是' : '否';
      tr.insertCell().textContent = lacpMaskToPorts(parseInt(l.members, 16));
      tr.insertCell().textContent = l.agg;
    });
    var pb = document.getElementById('lacpports').tBodies[0];
    pb.innerHTML = '';
    s.ports.forEach(function (p) {
      var tr = pb.insertRow();
      tr.insertCell().textContent = p.p;
      tr.insertCell().textContent = (p.lag === 255 || p.lag === 0xff) ? '—' : (p.lag + 1);
      tr.insertCell().textContent = p.a;
      tr.insertCell().textContent = p.pt;
      tr.insertCell().textContent = lacpRxNames[p.rs] || p.rs;
      tr.insertCell().textContent = parseInt(p.rx, 16);
      tr.insertCell().textContent = p.psys;
    });
  }).catch(function (e) { console.error('lacp.json:', e); });
}

function lacpEnable(g) {
  var ports = [];
  for (var i = 1; i <= numPorts; i++) {
    var cb = document.getElementById('p_mLAG' + g + '_' + i);
    if (cb && cb.checked) ports.push(i);
  }
  if (!ports.length) { alert('先勾选该组的成员端口'); return; }
  fetch('/cmd', { method: 'POST', body: 'lag ' + (g + 1) + ' lacp ' + ports.join(' ') })
    .then(function () { setTimeout(lacpLoad, 300); });
}

function lacpDisable(g) {
  fetch('/cmd', { method: 'POST', body: 'lag ' + (g + 1) + ' lacp off' })
    .then(function () { setTimeout(lacpLoad, 300); });
}

window.addEventListener('load', function () {
  lacpLoad();
  setInterval(lacpLoad, 2000);
});
