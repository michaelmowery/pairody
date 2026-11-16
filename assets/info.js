// Pairody "i" button: adds an info button to the header that opens a short
// "this is a preview" panel. Shared by every page so the copy lives in one place.
(function(){
  const HTML=`
<form method="dialog" class="info-x"><button aria-label="Close">×</button></form>
<p class="info-tag"><span class="web-only">Preview</span><span class="native-only">About</span></p>
<h2 id="infoTitle"><span class="web-only">You're playing an early preview</span><span class="native-only">About Pairody</span></h2>
<p class="web-only">Pairody is new and still taking shape. It's free to play while we build it, and things may change, move around, or occasionally break.</p>
<p class="native-only">Memory match, played by ear. Pairody is free to play, with no ads and no accounts, and new decks arrive with app updates.</p>
<div class="info-news" hidden>
  <p class="info-news-latest"></p>
  <button type="button" class="btn info-news-btn">What's new</button>
</div>
<h3>What's here now</h3>
<ul>
  <li><b>Nine decks.</b> Animals uses real recordings, and Animal Talk matches each animal’s name to its call. Quotes, Jokes, Word Play and Brain Food read pairs aloud: an opening and its ending, a riddle and its answer, rhymes or opposites, countries and capitals or times tables. Melodies splits old tunes in two. Notes is ear training, and Morse Code matches letters to their beeps.</li>
  <li><b>Sound names</b> show on each pad while it plays, so kids and first-timers can jump right in. Turn on <b>Difficult mode</b> for sounds only.</li>
  <li><b>Best scores</b> for each deck, saved on this device. No account or sign-up.</li>
  <li class="web-only"><b>Your music</b> <span class="beta">Beta</span> builds a board from a YouTube playlist. It's open to beta testers for now. Find it at the end of the deck buttons.</li>
  <li class="web-only"><b>Free and Plus.</b> Animals is the free deck. Decks tagged <span class="tier-tag">Plus</span> will be part of Pairody Plus, a one-time unlock, later on. For now every deck is free for everyone.</li>
</ul>
<h3>Good to know</h3>
<ul>
  <li class="web-only">Headphones help. On iPhone, flip off silent mode or you won't hear the pads.</li>
  <li class="native-only">Headphones help. Pads play even with your iPhone on silent, so turn the volume down if you're somewhere quiet.</li>
  <li>No ads and no accounts. Your scores stay on this device.<span class="web-only"> Your music plays through YouTube's own player.</span></li>
  <li>Animal sounds are public domain or CC0 recordings (<a href="https://github.com/michaelmowery/pairody/blob/main/sounds/CREDITS.md" target="_blank" rel="noopener">credits</a>).</li>
</ul>
<h3>Privacy</h3>
<p>To learn which decks and features people use, Pairody sends anonymous counts (like "Animals board cleared") to <a href="https://www.goatcounter.com" target="_blank" rel="noopener">GoatCounter</a>. No cookies, no ads, and nothing that follows you around the web. <span class="web-only">Your playlists and song links are never sent. </span><a href="privacy.html">Privacy policy</a></p>
<label class="toggle info-analytics"><input type="checkbox" name="analytics" checked><span>Anonymous usage counts (saved on this device)</span></label>
<h3>Feedback</h3>
<p>Found a bug, or have an idea for a deck? We'd love to hear it.</p>
<div class="info-feedback"><a class="btn info-feedback-btn" href="mailto:mountmtech@gmail.com?subject=Pairody%20feedback">Send feedback</a>
<span class="info-email">mountmtech@gmail.com</span></div>
<h3>Preferences</h3>
<div class="info-prefs" id="infoPrefs">
  <label class="toggle"><input type="checkbox" name="updateNote" checked><span>Note after updates: show what’s new when a new version arrives</span></label>
  <p class="info-prefs-note">Saved on this device.</p>
</div>
<h3>Updates</h3>
<div class="info-update">
  <button type="button" class="btn info-update-btn web-only">Check for updates</button>
  <span class="info-version"></span>
</div>
<p class="info-update-status" role="status"></p>
<p class="native-only">New versions arrive through the App Store.</p>
<p class="info-foot">Pairody<span class="web-only"> preview</span> · © 2026 Mount M Technologies, LLC</p>`;
  function init(){
    const top=document.querySelector(".top");if(!top)return;
    const btn=document.createElement("button");
    btn.className="info-btn";btn.type="button";btn.setAttribute("aria-label","About this preview");
    btn.setAttribute("aria-haspopup","dialog");btn.title="About this preview";btn.textContent="i";
    const dlg=document.createElement("dialog");
    dlg.className="info";dlg.setAttribute("aria-labelledby","infoTitle");dlg.innerHTML=HTML;
    // Group the nav and the button so the header keeps logo-left, controls-right
    const nav=top.querySelector(".nav"),right=document.createElement("div");
    right.className="top-right";
    if(nav){nav.replaceWith(right);right.appendChild(nav)}else top.appendChild(right);
    right.appendChild(btn);document.body.appendChild(dlg);
    btn.onclick=()=>{if(dlg.showModal)dlg.showModal();else dlg.setAttribute("open","")};
    // Tap outside the panel to close it
    dlg.addEventListener("click",e=>{if(e.target===dlg)dlg.close()});
    setupUpdates(dlg);btn.addEventListener("click",()=>{resetUpdateUi(dlg);setFeedbackLink(dlg)});
    setFeedbackLink(dlg);setupNews(dlg);
  }
  // "What's new": the newest release note's title and date, and a button for the full list (assets/notes.js)
  function setupNews(dlg){
    const N=window.PairodyNotes,box=dlg.querySelector(".info-news");
    if(!N||!N.list.length)return;
    const n=N.list[0];
    box.querySelector(".info-news-latest").innerHTML="<b>Latest:</b> "+n.title+" <span>· "+N.fmt(n.date)+"</span>";
    box.querySelector(".info-news-btn").addEventListener("click",()=>N.open("info"));
    box.hidden=false;
  }
  // "Send feedback": prefill the email with the version and page so bug reports say where they came from
  function setFeedbackLink(dlg){
    const body="\n\n---\nPairody version "+U().version+" · "+location.pathname.replace(/^.*\//,"/");
    dlg.querySelector(".info-feedback-btn").href="mailto:mountmtech@gmail.com?subject="+encodeURIComponent("Pairody feedback")+"&body="+encodeURIComponent(body);
  }
  // "Check for updates": asks the service worker (assets/update.js) for a newer version,
  // installs it, then reloads. Same flow as Noodlit's About panel.
  const U=()=>window.PairodyUpdate||{version:"dev",supported:false,check:async()=>"unsupported",reload:()=>location.reload(),isReady:()=>false};
  function setUpdateUi(dlg,label,status,busy){
    const b=dlg.querySelector(".info-update-btn");
    b.textContent=label;b.disabled=!!busy;b.classList.toggle("busy",!!busy);
    dlg.querySelector(".info-update-status").textContent=status||"";
  }
  function resetUpdateUi(dlg){
    dlg.querySelector(".info-version").textContent="Version "+U().version;
    if(U().isReady())setUpdateUi(dlg,"Refresh to update","A new version is ready.");
    else setUpdateUi(dlg,"Check for updates","");
  }
  function setupUpdates(dlg){
    resetUpdateUi(dlg);
    dlg.querySelector(".info-update-btn").addEventListener("click",async()=>{
      const u=U(),v=u.version;
      if(u.isReady()){setUpdateUi(dlg,"Updating…","",true);u.reload();return}
      if(!u.supported){setUpdateUi(dlg,"Check for updates","You're on version "+v+". Updates arrive when you reload.");return}
      setUpdateUi(dlg,"Checking…","",true);
      // A short minimum so "Checking…" doesn't just flicker
      const [r]=await Promise.all([u.check(),new Promise(ok=>setTimeout(ok,700))]);
      if(r==="ready"){setUpdateUi(dlg,"Updating…","Found a new version. Reloading…",true);setTimeout(u.reload,500)}
      else if(r==="current")setUpdateUi(dlg,"Check for updates","You're up to date ("+v+").");
      else if(r==="offline")setUpdateUi(dlg,"Try again","Couldn't reach pairody.app. Are you offline?");
      else setUpdateUi(dlg,"Check for updates","You're on version "+v+". Updates arrive when you reload.");
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
