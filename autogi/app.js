/* 인스타 자동기 공통 로직 — 모든 페이지 공유 */
const esc=s=>(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const linkify=s=>esc(s).replace(/(https?:\/\/[^\s]+)/g,'<a href="$1" target="_blank">$1</a>');
const num=n=>n==null?'—':n>=10000?(n/10000).toFixed(1)+'만':n.toLocaleString();
const fmtDue=d=>{if(!d)return '—';const t=new Date(d);return (t.getMonth()+1)+'/'+t.getDate()+' '+String(t.getHours()).padStart(2,'0')+':'+String(t.getMinutes()).padStart(2,'0')};
const fmtTime=d=>{if(!d)return '—';const t=new Date(d);return String(t.getHours()).padStart(2,'0')+':'+String(t.getMinutes()).padStart(2,'0')};
const fmtDay=d=>{const t=new Date(d);const wd='일월화수목금토'[t.getDay()];const today=new Date();const diff=Math.round((new Date(t.getFullYear(),t.getMonth(),t.getDate())-new Date(today.getFullYear(),today.getMonth(),today.getDate()))/86400000);
  const base=`${t.getMonth()+1}월 ${t.getDate()}일 (${wd})`;return diff===0?`오늘 · ${base}`:diff===1?`내일 · ${base}`:base};
let HANDLES={},LOGOS={};
const av=(h,logo)=>logo?`<img class="av" loading="lazy" src="${logo}">`:h?`<img class="av" loading="lazy" src="https://unavatar.io/instagram/${encodeURIComponent(h)}" onerror="this.outerHTML='<span class=\\'av ph\\'>${esc((h||'?')[0].toUpperCase())}</span>'">`:`<span class="av ph">?</span>`;
const isThreads=p=>p.service==='threads'||(p.type||'')==='쓰레드';
const isBoth=p=>(p.type||'')==='인스타+쓰레드';
function toggleEmbed(id,url){const el=document.getElementById(id);if(el.style.display==='block'){el.style.display='none';return}
  if(!el.dataset.loaded){el.innerHTML=`<iframe loading="lazy" src="${url}"></iframe>`;el.dataset.loaded=1}
  el.style.display='block'}
function setMeta(d){
  const m=document.getElementById('meta');
  if(m)m.innerHTML=`${d.generated} 기준 · ${esc(d.host)}<br>발행기 ${d.engine.self_pub_ready?'🟢':'🟡 토큰 대기'} · 노션 ${d.engine.notion_ready?'🟢':'🟡'} · Buffer ${d.engine.buffer_ready?'🟢':'—'}`;
  d.channels.forEach(c=>{HANDLES[c.name]=c.handle;LOGOS[c.name]=c.logo});
}
function postRow(p,i,allowEmbed){
  const h=HANDLES[p.channel]||p.channel;
  const permalink=p.link?(p.link.endsWith('/')?p.link:p.link+'/'):null;
  const emb=allowEmbed&&permalink&&permalink.includes('instagram.com')?`<button class="aghost" onclick="toggleEmbed('pemb${i}','${esc(permalink)}embed')">▾ 게시물 임베드</button>`:'';
  return `<div class="post"><div class="phead">${av(h,LOGOS[p.channel])}
    <div><div class="chn">${esc(p.channel)} ${isThreads(p)?'🧵':isBoth(p)?'📷+🧵':'📷'}</div><div class="when">${fmtDue(p.due)}</div></div>
    <span class="st ${['sent','발행완료'].includes(p.status)?'ok':['error','실패'].includes(p.status)?'er':'wt'}">${esc(p.status)}</span></div>
  <div class="txt">${esc(p.text)}</div>
  <div class="pacts">
    ${p.link?`<a class="alink" href="${esc(p.link)}" target="_blank">게시물 열기 →</a>`:''}
    ${emb}
    ${h&&!p.link&&!isThreads(p)?`<a class="aghost" href="https://www.instagram.com/${encodeURIComponent(h)}/" target="_blank">계정에서 보기</a>`:''}
    ${h&&isThreads(p)?`<a class="aghost" href="https://www.threads.com/@${encodeURIComponent(h)}" target="_blank">쓰레드에서 보기</a>`:''}
    <span style="color:var(--mut);font-size:11px">${esc(p.src)}</span>
  </div>
  ${allowEmbed?`<div class="embed" id="pemb${i}"></div>`:''}
  ${p.error?`<div class="err">${esc(p.error.slice(0,120))}</div>`:''}</div>`}
function chCard(c,i,withEmbed){
  return `<div class="ch"><div class="chtop">${av(c.handle,c.logo)}
    <div><div class="nm">${esc(c.name)}</div>
    <div class="hl">
      ${c.handle?`<a href="${esc(c.url)}" target="_blank">📷 @${esc(c.handle)}</a>`:`<span style="color:var(--mut);font-size:12px">${esc(c.status||'개설 대기')}</span>`}
      ${c.threads_url?`<a href="${esc(c.threads_url)}" target="_blank">🧵 쓰레드</a>`:''}
    </div></div></div>
  <div class="engrow">
    <div><b>${num(c.eng&&c.eng.followers)}</b><span>팔로워</span></div>
    <div><b>${num(c.eng&&c.eng.media)}</b><span>게시물</span></div>
    <div><b>${c.eng?c.eng.avg_eng:'—'}</b><span>평균 반응</span></div>
    <div><b>${num(c.eng&&c.eng.recent_comments)}</b><span>최근 댓글</span></div>
  </div>
  <div class="badges">
    ${c.professional?'<span class="bdg pro">프로페셔널 ⭕</span>':''}
    ${c.self_pub?'<span class="bdg on">자체발행기</span>':'<span class="bdg wait">토큰 대기</span>'}
    ${c.buffer?'<span class="bdg on">Buffer</span>':''}
    ${c.threads?'<span class="bdg on">쓰레드 ⭕</span>':''}
    ${c.dm?'<span class="bdg on">DM봇</span>':'<span class="bdg off">DM 미설정</span>'}
  </div>
  ${withEmbed&&c.handle?`<button class="pv" onclick="toggleEmbed('emb${i}','https://www.instagram.com/${encodeURIComponent(c.handle)}/embed')">▾ 게시물 미리보기</button><div class="embed" id="emb${i}"></div>`:''}
  </div>`}
async function getData(){
  if(window.__DATA__)return window.__DATA__;
  try{return await (await fetch('/api/data')).json()}catch(e){return null}
}

/* ─── SVG 차트 유틸 (의존성 0) ─── */
function barChart(items, opts={}){ // items: [{label, value, sub?}]
  const W=opts.w||1100, H=opts.h||220, pad=34, max=Math.max(1,...items.map(i=>i.value));
  const bw=Math.min(64,(W-pad*2)/items.length*0.62), gap=(W-pad*2)/items.length;
  const bars=items.map((it,i)=>{
    const h=Math.round((H-70)*it.value/max), x=pad+i*gap+(gap-bw)/2, y=H-40-h;
    return `<rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="7" fill="url(#rg)"/>
      <text x="${x+bw/2}" y="${y-8}" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">${it.value||''}</text>
      <text x="${x+bw/2}" y="${H-16}" text-anchor="middle" font-size="12" fill="#8B8D93" font-weight="600">${esc(it.label)}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto">
    <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF5A3C"/><stop offset="1" stop-color="#E43A25"/></linearGradient></defs>
    <line x1="${pad}" y1="${H-40}" x2="${W-pad}" y2="${H-40}" stroke="#242427" stroke-width="1.5"/>${bars}</svg>`;
}
function lineChart(series, labels, opts={}){ // series: [{name,color,values[]}]
  const W=opts.w||1100, H=opts.h||230, pad=40;
  const all=series.flatMap(s=>s.values).filter(v=>v!=null);
  if(!all.length)return `<div class="empty">데이터 축적 중 — 토큰 연동 후 일별 스냅샷이 쌓이면 그래프가 그려집니다</div>`;
  const max=Math.max(...all), min=Math.min(...all), span=(max-min)||1;
  const X=i=>pad+(W-pad*2)*(labels.length<2?0.5:i/(labels.length-1));
  const Y=v=>H-36-(H-70)*((v-min)/span);
  const paths=series.map(s=>{
    const pts=s.values.map((v,i)=>v==null?null:`${X(i)},${Y(v)}`).filter(Boolean);
    return `<polyline points="${pts.join(' ')}" fill="none" stroke="${s.color}" stroke-width="3" stroke-linecap="round"/>`+
      s.values.map((v,i)=>v==null?'':`<circle cx="${X(i)}" cy="${Y(v)}" r="4" fill="${s.color}"/>`).join('');
  }).join('');
  const xt=labels.map((l,i)=>i%Math.ceil(labels.length/7)?'':`<text x="${X(i)}" y="${H-12}" text-anchor="middle" font-size="11.5" fill="#8B8D93">${esc(l)}</text>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto">
    <line x1="${pad}" y1="${H-36}" x2="${W-pad}" y2="${H-36}" stroke="#242427" stroke-width="1.5"/>${paths}${xt}</svg>`;
}
function publishTrend(d,days=14){ // 최근 N일 발행 건수
  const cnt={};
  [...d.published,...d.scheduled].forEach(p=>{if(!p.due)return;const k=p.due.slice(5,10);cnt[k]=(cnt[k]||0)+1});
  const out=[];const now=new Date();
  for(let i=days-1;i>=0;i--){const t=new Date(now-i*86400000);const k=`${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
    out.push({label:k.slice(3)+'일',value:cnt[k]||0})}
  return out;
}
