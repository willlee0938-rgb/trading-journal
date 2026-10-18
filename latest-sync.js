/* Daily publication sync: edit latest-article.json only. Keep private drafts in localStorage. */
(()=>{'use strict';
const endpoint=new URL('latest-article.json',document.baseURI);
async function sync(){
  try{
    const res=await fetch(endpoint.href+'?t='+Date.now(),{cache:'no-store'});
    if(!res.ok)throw Error('HTTP '+res.status);
    const post=await res.json();
    if(!post||!post.id||!post.title||!post.datetime||!post.thesis)throw Error('invalid article');
    if(typeof entries==='undefined'||typeof renderDashboardLatest!=='function')return;
    const i=entries.findIndex(e=>e.id===post.id);
    const old=i>=0?entries[i]:null;
    const merged={...post,images:Array.isArray(post.images)&&post.images.length?post.images:(old?.images||[])};
    if(i>=0)entries.splice(i,1,merged);else entries.push(merged);
    entries.sort((a,b)=>new Date(b.datetime||0)-new Date(a.datetime||0));
    try{saveEntries(entries)}catch(e){}
    renderDashboardLatest();
    if(typeof renderEntries==='function')renderEntries(document.getElementById('searchInput')?.value||'');
    const notice=document.getElementById('publicationStatus')||document.createElement('small');
    notice.id='publicationStatus';notice.style.cssText='display:block;color:var(--accent2);margin-top:8px';
    notice.textContent='已同步 GitHub 最新發布文章 · '+post.datetime.slice(0,16).replace('T',' ');
    document.querySelector('#dashboard .hero-copy')?.appendChild(notice);
  }catch(err){console.warn('最新文章同步暫時失敗；保留既有文章',err)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});
setInterval(()=>{if(!document.hidden)sync()},300000);
})();