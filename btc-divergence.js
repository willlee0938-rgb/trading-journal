(()=>{'use strict';
const radar=document.getElementById('radar');if(!radar)return;
const card=document.createElement('section');card.className='radar-card';card.style.margin='16px 0';card.innerHTML='<h3>4H 背離監控 · MACD / RSI</h3><p class="radar-muted">僅使用已收線 K 棒；樞紐高低點需左右各 3 根確認，訊號會延遲。背離不代表必然反轉。</p><div class="radar-grid"><div class="radar-card"><span>背離狀態</span><h2 id="dv-status">尚未檢查</h2><small id="dv-detail">—</small></div><div class="radar-card"><span>MACD 金叉 / 死叉</span><h2 id="dv-cross">—</h2><small id="dv-cross-note">4H 已收線確認</small></div><div class="radar-card"><span>最近確認背離</span><h2 id="dv-age">—</h2><small id="dv-source">Binance BTCUSDT 4H</small></div></div><p id="dv-explain">正在等待檢查。</p><p class="radar-muted">「嚴重」代表 MACD 與 RSI 同時確認相同方向的背離，不是高勝率保證。金叉、死叉只作輔助條件。</p></section>';
radar.querySelector('.radar-wrap')?.appendChild(card);
const out=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
function ema(arr,n){const a=2/(n+1);let prev=arr[0];return arr.map((v,i)=>prev=i?prev+a*(v-prev):v)}
function macd(a){const f=ema(a,12),s=ema(a,26),line=a.map((_,i)=>f[i]-s[i]),signal=ema(line,9);return{line,signal,hist:line.map((v,i)=>v-signal[i])}}
function rsi(a,n=14){const out=Array(a.length).fill(null);let up=0,down=0;for(let i=1;i<=n;i++){const d=a[i]-a[i-1];up+=Math.max(0,d);down+=Math.max(0,-d)}up/=n;down/=n;out[n]=down?100-100/(1+up/down):100;for(let i=n+1;i<a.length;i++){const d=a[i]-a[i-1];up=(up*(n-1)+Math.max(0,d))/n;down=(down*(n-1)+Math.max(0,-d))/n;out[i]=down?100-100/(1+up/down):100}return out}
function pivots(values,type){const found=[];for(let i=3;i<values.length-3;i++){const window=values.slice(i-3,i+4);if(type==='high'&&values[i]===Math.max(...window)&&window.filter(x=>x===values[i]).length===1)found.push(i);if(type==='low'&&values[i]===Math.min(...window)&&window.filter(x=>x===values[i]).length===1)found.push(i)}return found}
let running=false;
async function check(){if(running)return;running=true;out('dv-status','檢查中…');try{
const c=new AbortController(),timer=setTimeout(()=>c.abort(),9000);let response;try{response=await fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=4h&limit=160',{signal:c.signal,cache:'no-store'})}finally{clearTimeout(timer)}
if(!response.ok)throw Error('資料來源暫時無法使用');
const raw=await response.json();if(!Array.isArray(raw)||raw.length<80)throw Error('K 線資料不足');
const now=Date.now(),bars=raw.filter(x=>+x[6]<now),close=bars.map(x=>+x[4]),high=bars.map(x=>+x[2]),low=bars.map(x=>+x[3]);const m=macd(close),r=rsi(close);
const last=close.length-1,prior=last-1;let cross='無新交叉';if(m.line[prior]<=m.signal[prior]&&m.line[last]>m.signal[last])cross='MACD 金叉';else if(m.line[prior]>=m.signal[prior]&&m.line[last]<m.signal[last])cross='MACD 死叉';
out('dv-cross',cross);out('dv-cross-note','最近一根已收線 4H K 棒');
const candidates=[];for(const type of ['high','low']){const ps=pivots(type==='high'?high:low,type);for(let j=1;j<ps.length;j++){const a=ps[j-1],b=ps[j];if(b<35||b<last-30)continue;const priceA=type==='high'?high[a]:low[a],priceB=type==='high'?high[b]:low[b];const priceOpposite=type==='high'?priceB>priceA*1.001:priceB<priceA*.999;if(!priceOpposite)continue;
const macdOpposite=type==='high'?m.line[b]<m.line[a]:m.line[b]>m.line[a],rsiOpposite=type==='high'?r[b]<r[a]:r[b]>r[a];
if(macdOpposite||rsiOpposite)candidates.push({type,b,macdOpposite,rsiOpposite,severe:macdOpposite&&rsiOpposite});}}
candidates.sort((a,b)=>b.b-a.b);const x=candidates[0];
if(!x){out('dv-status','未確認背離');out('dv-detail','最近 30 根已收線 K 棒未發現符合規則的背離');out('dv-age','—');out('dv-explain','目前不建議單憑 MACD 金叉或死叉推定行情方向。');}
else{const direction=x.type==='high'?'頂背離 · 偏空警示':'底背離 · 偏多警示';out('dv-status',(x.severe?'嚴重 ':'一般 ')+direction);out('dv-detail',(x.macdOpposite?'MACD 確認':'MACD 未確認')+' / '+(x.rsiOpposite?'RSI 確認':'RSI 未確認'));out('dv-age',(last-x.b)+' 根 4H 前');out('dv-explain','價格創'+(x.type==='high'?'更高高點，但指標高點下降':'更低低點，但指標低點上升')+'。訊號在樞紐右側 3 根 K 棒後才能確認；仍須結合結構、OI 與價格行為。');}
}catch(e){out('dv-status','資料不可用');out('dv-detail',String(e.message||e));out('dv-age','—');out('dv-explain','資料未成功載入，不產生背離警報。')}finally{running=false}}
document.querySelector('[data-view="radar"]')?.addEventListener('click',check);
document.getElementById('r-refresh')?.addEventListener('click',check);
setInterval(()=>{if(radar.classList.contains('active'))check()},300000);
})();