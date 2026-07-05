var txG=new BigInt64Array(10),txB=new BigInt64Array(10),rxG=new BigInt64Array(10),rxB=new BigInt64Array(10);
const linkS=["Disabled","Down","10M","100M","1000M","500M","10G","2.5G","5G"];
var pState=new Int8Array(10),pIsSFP=new Int8Array(10),pAdvertised=new Int8Array(10);
var numPorts=0,logToPhysPort=new Int8Array(10),physToLogPort=new Int8Array(10),portNames=new Array(10);
var currentRequests=[],currentCallback;

/* ── Inline SVG templates (replaces external <object> loads) ─────────────── */
function mkPortSVG(id){
  // RJ45 port: body + 8 pins + 2 LEDs. All colours driven by JS via style.fill
  return `<svg id="${id}" viewBox="0 0 44 44" width="44" height="44" xmlns="http://www.w3.org/2000/svg">
  <rect rx="3" ry="3" x="2" y="2" width="40" height="38" fill="#1e2235" stroke="#3a3f5a" stroke-width="1.5"/>
  <rect class="bg" x="6" y="5" width="32" height="24" rx="2" fill="#2a2a40"/>
  <rect x="8"  y="7" width="2.5" height="10" fill="#555" rx="1"/>
  <rect x="12" y="7" width="2.5" height="10" fill="#555" rx="1"/>
  <rect x="16" y="7" width="2.5" height="10" fill="#555" rx="1"/>
  <rect x="20" y="7" width="2.5" height="10" fill="#555" rx="1"/>
  <rect x="24" y="7" width="2.5" height="10" fill="#555" rx="1"/>
  <rect x="28" y="7" width="2.5" height="10" fill="#555" rx="1"/>
  <rect x="32" y="7" width="2.5" height="10" fill="#555" rx="1"/>
  <rect class="led" id="${id}_l0" x="5"  y="32" width="14" height="8" rx="2" fill="#222"/>
  <rect class="led" id="${id}_l1" x="25" y="32" width="14" height="8" rx="2" fill="#222"/>
</svg>`;
}

function mkSfpSVG(id){
  // SFP+ cage: wider body + 2 LEDs
  return `<svg id="${id}" viewBox="0 0 60 44" width="60" height="44" xmlns="http://www.w3.org/2000/svg">
  <rect rx="3" ry="3" x="2" y="2" width="56" height="38" fill="#1e2235" stroke="#3a3f5a" stroke-width="1.5"/>
  <rect class="bg" x="5" y="5" width="50" height="24" rx="2" fill="#111"/>
  <text x="30" y="21" font-size="9" fill="#444" text-anchor="middle" font-family="monospace">SFP+</text>
  <rect x="46" y="12" width="7" height="5"  rx="1" fill="#333"/>
  <rect x="46" y="20" width="7" height="5"  rx="1" fill="#333"/>
  <rect class="led" id="${id}_l0" x="5"  y="32" width="22" height="8" rx="2" fill="#222"/>
  <rect class="led" id="${id}_l1" x="33" y="32" width="22" height="8" rx="2" fill="#222"/>
</svg>`;
}

function drawPorts(){
  var f=document.getElementById('ports');
  for(let i=0;i<numPorts;i++){
    var d=document.createElement('div');
    d.className='tooltip';
    var s=document.createElement('span');
    s.className='tooltiptext';
    s.id='tt_'+(i+1);
    var pid='port'+(i+1);
    d.innerHTML=(pIsSFP[i]?mkSfpSVG(pid):mkPortSVG(pid));
    d.appendChild(s);
    // port number label
    var lbl=document.createElement('div');
    lbl.className='port-num';
    lbl.textContent=i+1;
    d.appendChild(lbl);
    var wrap=document.createElement('div');
    wrap.className='port-wrap';
    wrap.appendChild(d);
    f.appendChild(wrap);
  }
}

function parseUint16(v){return parseInt(v,16)&0xffff;}
function parseInt16(v){let n=parseInt(v,16)&0x7fff;return(parseInt(v,16)&0x8000)?n-0x8000:n;}
function applyCalSO(v,c){if(typeof c!=='string')return v;if(c.startsWith("0x"))c=c.substring(2);if(c.length!=8)return v;return(parseUint16(c.substring(0,4))/256)*v+parseInt16(c.substring(4,8));}
function applyRxPowerCal(v,c){if(typeof c!=='string')return v;if(c.startsWith("0x"))c=c.substring(2);if(c.length!=40)return v;let b=c.match(/.{1,2}/g).map(x=>parseInt(x,16)),dv=new DataView(new Uint8Array(b).buffer);return dv.getFloat32(0)*Math.pow(v,4)+dv.getFloat32(4)*Math.pow(v,3)+dv.getFloat32(8)*Math.pow(v,2)+dv.getFloat32(12)*v+dv.getFloat32(16);}
function decodeSfpTemp(v,c){return applyCalSO(parseInt16(v),c)/256;}
function decodeSfpVcc(v,c){return applyCalSO(parseUint16(v),c)/10000;}
function decodeSfpTxBias(v,c){return applyCalSO(parseUint16(v),c)/500;}
function decodeSfpTxPower(v,c){return applyCalSO(parseUint16(v),c)/10000;}
function decodeSfpRxPower(v,c){return applyRxPowerCal(parseUint16(v),c)/10000;}
function dBm(v){return 10*Math.log10(v);}

function rxLosHTML(pin,mod){
  if(mod!==null&&pin!==null&&mod!==pin)return`pin=${pin}<br>mod=${mod} ❗`;
  return mod??pin;
}

function setLed(pid,l0,l1){
  var e0=document.getElementById(pid+'_l0'),e1=document.getElementById(pid+'_l1');
  if(e0)e0.style.fill=l0;
  if(e1)e1.style.fill=l1;
}
function setBg(pid,col){
  var svg=document.getElementById(pid);
  if(!svg)return;
  var bg=svg.querySelector('.bg');
  if(bg)bg.style.fill=col;
}
function setSvgOpacity(pid,op){
  var svg=document.getElementById(pid);
  if(svg)svg.style.opacity=op;
}

function update(callback){
  var xhttp=new XMLHttpRequest();
  xhttp.onreadystatechange=function(){
    if(this.readyState==4&&this.status==401)document.location="/login.html";
    if(this.readyState==4&&this.status==200){
      const s=JSON.parse(xhttp.responseText);
      if(!numPorts){
        numPorts=s.length;
        for(let i=0;i<s.length;i++)pIsSFP[s[i].portNum-1]=s[i].isSFP;
        drawPorts();
      }
      for(let i=0;i<s.length;i++){
        let p=s[i],n=p.portNum;
        logToPhysPort[p.logPort]=n;
        physToLogPort[n-1]=p.logPort;
        portNames[p.logPort]=p.name;
        let pid='port'+n;
        n--;
        txG[n]=BigInt(p.txG);txB[n]=BigInt(p.txB);rxG[n]=BigInt(p.rxG);rxB[n]=BigInt(p.rxB);
        const pName=p.name||portNames[p.logPort]||'';
        let iHTML='<table class="tt_table">';
        if(pName)iHTML+='<tr><td>Name</td><td>'+pName+'</td></tr>';
        if(p.enabled==0){
          pState[n]=-1;
          setBg(pid,'#3a1010');setLed(pid,'#111','#111');setSvgOpacity(pid,0.4);
          iHTML+='<tr><td>Status</td><td>Disabled</td></tr>';
        } else {
          setSvgOpacity(pid,1);
          pState[n]=p.link;
          // LED colours: link=5(2.5G) or 7(2.5G) → green+blue; 4(1G)/6(10G) → green+orange; 1/2/3 → green+green; 0 → off
          if(p.link==5||p.link==7){setLed(pid,'#22c55e','#3d8ef0');}
          else if(p.link==4||p.link==6){setLed(pid,'#22c55e','#f59e0b');}
          else if(p.link>=1&&p.link<=3){setLed(pid,'#22c55e','#22c55e');}
          else{setLed(pid,'#1a1a2e','#1a1a2e');setSvgOpacity(pid,0.4);}
          iHTML+='<tr><td>Speed</td><td>'+linkS[p.link+1]+'</td></tr>';
          if(p.isSFP){
            pAdvertised[n]=0;
            const hasExt=p.sfp_options&0x40;
            iHTML+='<tr><td>Vendor</td><td>'+p.sfp_vendor+'</td></tr>';
            iHTML+='<tr><td>Model</td><td>'+p.sfp_model+'</td></tr>';
            iHTML+='<tr><td>Serial</td><td>'+p.sfp_serial+'</td></tr>';
            if(hasExt){
              let txP=decodeSfpTxPower(p.sfp_txpower,p.sfp_txpower_cal);
              let rxP=decodeSfpRxPower(p.sfp_rxpower,p.sfp_rxpower_cal);
              iHTML+='<tr><td>Temp</td><td>'+decodeSfpTemp(p.sfp_temp,p.sfp_temp_cal).toFixed(2)+'&#8239;&#8451;</td></tr>';
              iHTML+='<tr><td>Vcc</td><td>'+decodeSfpVcc(p.sfp_vcc,p.sfp_vcc_cal).toFixed(2)+'&#8239;V</td></tr>';
              iHTML+='<tr><td>TX-Fault</td><td>'+(Boolean(Number(p.sfp_state)&0x4))+'</td></tr>';
              iHTML+='<tr><td>TX-Dis</td><td>'+(Boolean(Number(p.sfp_state)&0x80))+'</td></tr>';
              iHTML+='<tr><td>TX-Bias</td><td>'+decodeSfpTxBias(p.sfp_txbias,p.sfp_txbias_cal).toFixed(1)+'&#8239;mA</td></tr>';
              iHTML+='<tr><td>TX-Power</td><td>'+txP.toFixed(3)+'&#8239;mW / '+dBm(txP).toFixed(2)+'&#8239;dBm</td></tr>';
              iHTML+='<tr><td>RX-Power</td><td>'+rxP.toFixed(3)+'&#8239;mW / '+dBm(rxP).toFixed(2)+'&#8239;dBm</td></tr>';
            }
            const losPin=p.sfp_los!==null?Boolean(Number(p.sfp_los)):null;
            const losMod=hasExt?Boolean(Number(p.sfp_state)&0x2):null;
            if(losMod!==null||losPin!==null)iHTML+='<tr><td>RX-LOS</td><td>'+rxLosHTML(losPin,losMod)+'</td></tr>';
          } else {
            pAdvertised[n]=parseInt(p.adv,2);
          }
        }
        iHTML+='</table>';
        var tt=document.getElementById('tt_'+(n+1));
        if(tt)tt.innerHTML=iHTML;
      }
      if(callback)callback();
    }
  };
  xhttp.open("GET","/status.json",true);
  xhttp.timeout=5000;
  sendXHTTP(xhttp);
}

function callbackXHTTP(){
  var x=currentRequests.shift();
  x.onreadystatechange=currentCallback;
  x.onreadystatechange();
  if(!currentRequests.length)return;
  x=currentRequests[0];
  currentCallback=x.onreadystatechange;
  x.onreadystatechange=callbackXHTTP;
  setTimeout(()=>x.send(),20);
}

function sendXHTTP(x){
  if(!currentRequests.length){
    currentRequests.push(x);
    currentCallback=x.onreadystatechange;
    x.onreadystatechange=callbackXHTTP;
    x.send();return;
  }
  currentRequests.push(x);
}

/* ── Inline SVG strings for checkbox port selectors (vlan/mirror/lag) ── */
function portSVGStr(w,h){
  return `<svg viewBox="0 0 44 44" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect rx="3" x="2" y="2" width="40" height="38" fill="#1e2235" stroke="#3a3f5a" stroke-width="1.5"/>
  <rect x="6" y="5" width="32" height="24" rx="2" fill="#2a2a40"/>
  <rect x="8"  y="7" width="2.5" height="10" fill="#555" rx="1"/>
  <rect x="12" y="7" width="2.5" height="10" fill="#555" rx="1"/>
  <rect x="16" y="7" width="2.5" height="10" fill="#555" rx="1"/>
  <rect x="20" y="7" width="2.5" height="10" fill="#555" rx="1"/>
  <rect x="24" y="7" width="2.5" height="10" fill="#555" rx="1"/>
  <rect x="28" y="7" width="2.5" height="10" fill="#555" rx="1"/>
  <rect x="32" y="7" width="2.5" height="10" fill="#555" rx="1"/>
  <rect x="5" y="32" width="14" height="8" rx="2" fill="#333"/>
  <rect x="25" y="32" width="14" height="8" rx="2" fill="#333"/>
</svg>`;
}
function sfpSVGStr(w,h){
  return `<svg viewBox="0 0 60 44" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect rx="3" x="2" y="2" width="56" height="38" fill="#1e2235" stroke="#3a3f5a" stroke-width="1.5"/>
  <rect x="5" y="5" width="50" height="24" rx="2" fill="#111"/>
  <text x="30" y="21" font-size="9" fill="#444" text-anchor="middle" font-family="monospace">SFP+</text>
  <rect x="46" y="12" width="7" height="5" rx="1" fill="#333"/>
  <rect x="46" y="20" width="7" height="5" rx="1" fill="#333"/>
  <rect x="5" y="32" width="22" height="8" rx="2" fill="#333"/>
  <rect x="33" y="32" width="22" height="8" rx="2" fill="#333"/>
</svg>`;
}
