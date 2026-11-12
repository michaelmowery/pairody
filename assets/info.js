// Pairody "i" button: adds an info button to the header that opens a short
// "this is a preview" panel. Shared by every page so the copy lives in one place.
(function(){
  const HTML=`
<form method="dialog" class="info-x"><button aria-label="Close">×</button></form>
<p class="info-tag">Preview</p>
<h2 id="infoTitle">You're playing an early preview</h2>
<p>Pairody is new and still taking shape. It's free to play while we build it, and things may change, move around, or occasionally break.</p>
<h3>What's here now</h3>
<ul>
  <li><b>Five sound decks.</b> Animals uses real recordings; Drums, Notes, Chords and Rhythms get harder as you go.</li>
  <li><b>Easy mode</b> shows each sound's name while it plays. Good for kids and first games.</li>
  <li><b>Best scores</b> for each deck, saved on this device. No account or sign-up.</li>
  <li><b>Your music</b> <span class="beta">Beta</span> builds a board from a YouTube playlist. It's open to beta testers for now.</li>
</ul>
<h3>Good to know</h3>
<ul>
  <li>Headphones help. On iPhone, flip off silent mode or you won't hear the pads.</li>
  <li>No ads, no accounts, no analytics. Your scores stay on this device. Your music plays through YouTube's own player.</li>
  <li>Animal sounds are public domain or CC0 recordings (<a href="https://github.com/michaelmowery/pairody/blob/main/sounds/CREDITS.md" target="_blank" rel="noopener">credits</a>).</li>
</ul>
<p class="info-foot">Pairody preview · © 2026 Mount M Technologies, LLC</p>`;
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
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
