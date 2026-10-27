(function(){
const C=window.APP_CONFIG,{FIELDS,TEMPLATES}=window.PB,$=s=>document.querySelector(s);
const KEY="pb_pro_unlocked";
const isPro=()=>localStorage.getItem(KEY)==="1";
document.querySelectorAll("[data-brand]").forEach(e=>e.textContent=C.BRAND_NAME);
document.querySelectorAll("[data-price]").forEach(e=>e.textContent=C.PRO_PRICE);
document.querySelectorAll("[data-pricenote]").forEach(e=>e.textContent=C.PRO_PRICE_NOTE);
document.querySelectorAll("[data-pay]").forEach(e=>e.href=C.PAYMENT_LINK_URL);
const toast=m=>{const t=$("#toast");t.textContent=m;t.style.display="block";setTimeout(()=>t.style.display="none",2200)};
const EX={etsy:{productType:"printable weekly planner PDF",niche:"ADHD-friendly productivity",audience:"adults with ADHD, busy professionals",tone:"Warm & friendly",features:"52 undated weekly pages\nBrain-dump and top-3 priorities sections\nA4 + US Letter sizes\nInstant digital download",price:"$6.50",seeds:"adhd planner, weekly planner printable"},
 kdp:{bookType:"large-print Sudoku puzzle book",niche:"seniors / brain training",audience:"adults 60+ and gift buyers",tone:"Warm & friendly",features:"200 puzzles, easy to hard\nOne puzzle per page, extra-large print\nSolutions at the back",pages:"210 pages, 8.5 x 11 in",price:"$8.99",seeds:"large print sudoku, sudoku for seniors"}};
let plat="etsy",cur=null;
async function verifyKey(k){
 if(C.GUMROAD_PRODUCT_ID){
  const r=await fetch("https://api.gumroad.com/v2/licenses/verify",{method:"POST",body:new URLSearchParams({product_id:C.GUMROAD_PRODUCT_ID,license_key:k,increment_uses_count:"false"})});
  const d=await r.json().catch(()=>({}));const pu=d.purchase||{};
  return !!(d.success&&!pu.refunded&&!pu.chargebacked&&!pu.disputed&&!pu.subscription_cancelled_at);}
 return C.UNLOCK_CODES.map(x=>x.toUpperCase()).includes(k.toUpperCase());}
async function unlock(){const c=prompt(C.GUMROAD_PRODUCT_ID?"Enter the licence key from your Gumroad receipt:":"Enter your Pro unlock code:");if(!c)return;
 let ok=false;try{ok=await verifyKey(c.trim())}catch(e){alert("Couldn't reach the licence server — check your connection and try again.");return}
 if(ok){localStorage.setItem(KEY,"1");localStorage.setItem("pb_license",c.trim());toast("Pro unlocked — thank you!");renderT();select(cur.id)}
 else alert("That key didn't match an active purchase. Check your receipt email or contact "+C.CONTACT_EMAIL);}
$("#havecode").onclick=e=>{e.preventDefault();unlock()};
function renderT(){const box=$("#tpls");box.innerHTML="";
 TEMPLATES.filter(t=>t.platform===plat).forEach(t=>{const b=document.createElement("button");b.className="tpl"+(cur&&cur.id===t.id?" on":"");b.dataset.id=t.id;
  b.innerHTML=`<b>${t.pro&&!isPro()?"🔒 ":""}${t.name}<span class="badge ${t.pro?"pro":"free"}">${t.pro?(t.bundle?"PRO BUNDLE":"PRO"):"FREE"}</span></b><small>${t.desc}</small>`;
  b.onclick=()=>select(t.id);box.appendChild(b)})}
function select(id){cur=TEMPLATES.find(t=>t.id===id);renderT();$("#tname").textContent=cur.name;$("#tdesc").textContent=cur.desc;
 const f=$("#form");const old=Object.fromEntries(new FormData(f));f.innerHTML="";
 cur.fields.forEach(k=>{const d=FIELDS[k];let h=`<label for="f-${k}">${d.label}</label>`;
  if(d.type==="select")h+=`<select id="f-${k}" name="${k}">${d.opts.map(o=>`<option>${o}</option>`).join("")}</select>`;
  else if(d.type==="textarea")h+=`<textarea id="f-${k}" name="${k}" placeholder="${d.ph}"></textarea>`;
  else h+=`<input id="f-${k}" name="${k}" placeholder="${d.ph}">`;f.insertAdjacentHTML("beforeend",h);if(old[k])f.elements[k].value=old[k]});
 const locked=cur.pro&&!isPro();$("#gen").disabled=locked;
 $("#outwrap").style.display=locked?"none":"";let lk=$("#lockbox");if(lk)lk.remove();
 if(locked)$("#outwrap").insertAdjacentHTML("beforebegin",`<div class="lock" id="lockbox"><h3>🔒 ${cur.name} is a Pro template</h3><p>Unlock all 17 templates and bundles for ${C.PRO_PRICE} (${C.PRO_PRICE_NOTE}).</p><a class="btn btn-p" href="${C.PAYMENT_LINK_URL}" target="_blank" rel="noopener">Unlock Pro</a><p class="muted"><a href="#" id="lc">I have a code</a></p></div>`),$("#lc").onclick=e=>{e.preventDefault();unlock()};
}
function gen(){if(cur.pro&&!isPro())return;const v=Object.fromEntries(new FormData($("#form")));const p=cur.build(v);$("#out").textContent=p;
 const q=encodeURIComponent(p),short=q.length<7000;
 $("#o-gpt").href="https://chatgpt.com/?q="+(short?q:"");$("#o-claude").href="https://claude.ai/new?q="+(short?q:"");$("#o-grok").href="https://grok.com/?q="+(short?q:"");
 $("#count").textContent=`${p.length.toLocaleString()} characters. `+(short?"Open buttons pre-fill the prompt where supported; otherwise copy & paste.":"Prompt is long — copy it, then paste into the chat that opens.");
 try{localStorage.setItem("pb_last_"+cur.id,JSON.stringify(v))}catch(e){}}
$("#gen").onclick=gen;
$("#ex").onclick=()=>{const e=EX[plat];[...$("#form").elements].forEach(el=>{if(e[el.name])el.value=e[el.name]})};
$("#copy").onclick=async()=>{const t=$("#out").textContent;try{await navigator.clipboard.writeText(t)}catch(e){const a=document.createElement("textarea");a.value=t;document.body.appendChild(a);a.select();document.execCommand("copy");a.remove()}toast("Prompt copied — paste it into your AI chat")};
["#o-gpt","#o-claude","#o-grok","#o-gem"].forEach(s=>$(s).addEventListener("click",()=>{navigator.clipboard&&navigator.clipboard.writeText($("#out").textContent).catch(()=>{})}));
document.querySelectorAll("#plat .pill").forEach(b=>b.onclick=()=>{document.querySelectorAll("#plat .pill").forEach(x=>x.classList.remove("on"));b.classList.add("on");plat=b.dataset.p;select(TEMPLATES.find(t=>t.platform===plat).id)});
$("#email").onsubmit=e=>{e.preventDefault();const em=e.target.querySelector("input").value;
 if(C.EMAIL_FORM_ACTION){fetch(C.EMAIL_FORM_ACTION,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({email:em})}).then(()=>$("#emailmsg").textContent="Thanks! You're on the list.").catch(()=>$("#emailmsg").textContent="Something went wrong — try again.")}
 else{const l=JSON.parse(localStorage.getItem("pb_emails")||"[]");l.push(em);localStorage.setItem("pb_emails",JSON.stringify(l));$("#emailmsg").textContent="Thanks! (Email provider not connected yet — placeholder.)"}};
select("etsy-title");
})();
