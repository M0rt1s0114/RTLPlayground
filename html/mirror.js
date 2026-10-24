var mirrorInterval = Number();
const mirrors = ["mPortsTX", "mPortsRX"];

function mirrorForm() {
  if (!numPorts)
    return;
  for (let j=0; j < mirrors.length; j++) {
    console.log("Adding Mirror " + j)
    var m = document.getElementById(mirrors[j]);
      for (let i = 1; i <= numPorts; i++) {
      const d = document.createElement("div");
      d.classList.add("cbgroup");
      const l = document.createElement("label");
      l.innerHTML = "" + i;
      l.classList.add("cbgroup");
      const inp = document.createElement("input");
      inp.type = "checkbox"; inp.setAttribute("class","psel");
      inp.id = mirrors[j] + i;
      const o = document.createElement("span");
    o.innerHTML = pIsSFP[i-1] ? sfpSVGStr(60,44) : portSVGStr(40,40);
      l.appendChild(inp); l.appendChild(o);
      d.appendChild(l)
      m.appendChild(d);
    }
  }
  fetchMirror();
}

function setM(p, c){
  document.getElementById(p).checked=c;
}

function fetchMirror() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      const s = JSON.parse(xhttp.responseText);
      console.log("MIRROR: ", JSON.stringify(s));
      document.getElementById('me').checked = s.enabled;
      document.getElementById('mp').value = s.mPort;
      let m_tx = parseInt(s.mirror_tx, 2);
      let m_rx = parseInt(s.mirror_rx, 2);
      for (let i = 1; i <= numPorts; i++) {
        let p = i - 1;
        if (numPorts < 9)
          p = physToLogPort[p];
        setM("mPortsTX"+i, m_tx&(1<<p)); setM("mPortsRX"+i, m_rx&(1<<p));
      }
    }
  };
  xhttp.open("GET", `/mirror.json`, true);
  sendXHTTP(xhttp);
}

window.addEventListener("load", function() {
  update( () => {
    mirrorForm();
    const interval = setInterval(update, 2000);
  });
});

async function mirrorSub() {
  var cmd = "mirror ";
  var mp=document.getElementById('mp').value
  if (!mp) {
    alert("Set Mirroring Port first");
    return;
  }
  document.getElementById(mirrors[0]+mp).checked=false;document.getElementById(mirrors[1]+mp).checked=false;
  cmd = cmd + mp;
  for (let i = 1; i <= numPorts; i++) {
    if (document.getElementById(mirrors[0] + i).checked && document.getElementById(mirrors[1] + i).checked)
      cmd = cmd + ` ${i}`;
    else if (document.getElementById(mirrors[0] + i).checked)
      cmd = cmd + ` ${i}t`;
    else if (document.getElementById(mirrors[1] + i).checked)
      cmd = cmd + ` ${i}r`;
  }
  if (cmd.length < 10) {
    alert("Select Mirrored Ports");
    return;
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
async function mirrorDel() {
  var cmd = "mirror off";
try {
    const response = await fetch('/cmd', {
      method: 'POST',
      body: cmd
    });
    location.reload();
  } catch(err) {
    console.error(`Error: ${err}`);
  }
}
