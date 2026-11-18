// Free and Plus: which decks and board styles are free, and which will be part of Pairody Plus.
// Same idea as Noodlit's plus.js: one place that says which tier each thing is in, a small
// tag to show next to it, and one check (canPlay / canUse) to ask before turning it on.
//
// THE SPLIT LIVES HERE. To move something, edit FREE_DECKS or PLUS_STYLES (or FEATURES).
//   - Decks: free only if listed in FREE_DECKS. Every other deck is Plus, including any new one.
//   - Game options: Plus only if listed in PLUS_STYLES (empty for now). Timed and 2 Players
//     are free (Michael, 2026-11-17). Triples and Difficult mode were removed that day.
//   - Board sizes, Timed, 1 or 2 Players, Demo and best scores are free.
//   - Your music (YouTube) is never Plus: YouTube's terms don't allow charging for access to its
//     videos. It is web only (the iOS app leaves it out).
//   - A paid feature that isn't a deck or style goes in FEATURES by id.
//
// Where Plus is sold (2026-11-18, Michael: $3.99, one-time):
//   - The iOS app: LOCKED is on. Plus is a non-consumable in-app purchase bought through the App
//     Store (StoreKit 2, ios/App/App/PlusStore.swift, product id com.mountmtech.pairody.plus).
//     owns('plus') is true once this Apple ID has bought it (or restored it). The answer is kept
//     in localStorage pairody.plus so the app knows at once on the next launch, then checked
//     again with the App Store (works offline too: StoreKit keeps its own copy).
//   - The website: still open to everyone (LOCKED is off), so owns() says yes to every tier.
//
// Rules while Plus locks (Michael, 2026-11-16):
//   - Demo always runs, on any deck and style, for everyone. Demo boards never use a try.
//   - Daily Pairody always plays, whatever board it picks, and never uses a try.
//   - Try before you buy: without Plus, each Plus deck and each Plus style can be played
//     TRIAL_PLAYS times (a board counts once its first pad is tapped). After that its first tap
//     opens the Plus sheet instead. Counts live on this device (pairody.plusTries), so a
//     reinstall resets them; that's fine for a small one-time unlock.
//   - The Plus tag then shows how many tries are left ("Plus · 3 left").
//
// The Plus sheet (dialog#plusSheet, built here) has Get Plus with Apple's local price and
// Restore purchases. The info panel has the same two buttons (assets/info.js).
(function(){
  const NATIVE = !!window.PairodyNative; // assets/native.js runs first
  const TIERS = {
    free: { label: 'Free', hint: 'Always included' },
    plus: { label: 'Plus', hint: NATIVE ? 'Part of Pairody Plus' : 'Part of Pairody Plus. Free for everyone on the website' },
  };
  const FREE_DECKS = new Set(['animals', 'melodies', 'jokes', 'brain']); // one per group: Sounds, Music, Words, Learning (brain = Capitals)
  const PLUS_STYLES = new Set([]);
  const LOCKED = NATIVE;     // the iOS app sells Plus; the website stays open
  const TRIAL_PLAYS = 10;    // free tries per Plus deck and per Plus style
  const TRIES_KEY = 'pairody.plusTries';
  const OWNED_KEY = 'pairody.plus'; // "1" = this Apple ID owns Plus (last answer from the App Store)
  const FEATURES = {
    // 'record-deck': 'plus',   // later: record your own deck
  };
  const track = (n, t) => window.PairodyAnalytics && window.PairodyAnalytics.track(n, t);

  const deckTier = (deck) => (FREE_DECKS.has(deck) ? 'free' : 'plus');
  const styleTier = (style) => (PLUS_STYLES.has(style) ? 'plus' : 'free');
  const featureTier = (id) => FEATURES[id] || 'free';

  // Does this player have the tier? On the website: yes, every tier. In the app: Free always,
  // Plus once bought.
  let plus = false;
  try { plus = localStorage.getItem(OWNED_KEY) === '1'; } catch (e) {}
  const RANK = { free: 0, plus: 1 };
  function owns(tier){
    if (RANK[tier] == null) return false;
    return !LOCKED || tier === 'free' || plus;
  }
  const canUse = (id) => owns(featureTier(id));

  // Free tries (see the rules above). key is "deck:<id>" or "style:<id>".
  function readTries(){ try { return JSON.parse(localStorage.getItem(TRIES_KEY)) || {}; } catch (e) { return {}; } }
  function triesLeft(key){ return Math.max(0, TRIAL_PLAYS - (readTries()[key] || 0)); }
  // Call when a real (not demo, not Daily) board's first pad is tapped.
  function useTry(kind, id){
    if (!LOCKED) return;
    const tier = kind === 'deck' ? deckTier(id) : styleTier(id);
    if (tier === 'free' || owns(tier)) return;
    const t = readTries(), key = kind + ':' + id;
    t[key] = (t[key] || 0) + 1;
    try { localStorage.setItem(TRIES_KEY, JSON.stringify(t)); } catch (e) {}
    track('plus/try/' + id, 'Plus free try used: ' + id + ' (' + triesLeft(key) + ' left)');
    tagAll();
  }
  // Can this deck / style be played right now? (Demo and Daily don't ask: they always run.)
  const canPlay = (deck) => !LOCKED || owns(deckTier(deck)) || triesLeft('deck:' + deck) > 0;
  const canPlayStyle = (style) => !LOCKED || owns(styleTier(style)) || triesLeft('style:' + style) > 0;
  // A Plus deck being played on free tries: how many are left (null if it isn't on tries)
  const deckTries = (deck) => (LOCKED && !owns(deckTier(deck)) ? triesLeft('deck:' + deck) : null);

  // The little "Plus" pill shown next to a Plus deck, style or feature. Free items get no tag,
  // except in the deck picker's cards, which say Free too (showFree), like Noodlit's scene menu.
  // In the app, a Plus tag also says how many free tries are left, or "Get Plus" once they're used.
  function tagText(tier, key){
    if (tier !== 'plus' || !LOCKED || plus || !key) return TIERS[tier].label;
    const left = triesLeft(key);
    return left ? 'Plus · ' + left + ' left' : 'Get Plus';
  }
  function tierTag(tier, showFree, key){
    if (tier === 'free' && !showFree) return null;
    const tag = document.createElement('span');
    tag.className = 'tier-tag tier-' + tier;
    tag.textContent = tagText(tier, key);
    tag.setAttribute('aria-label', ', ' + tag.textContent.replace('·', ','));
    return tag;
  }

  function tagButtons(selector, tierOf, key, showFree, kind){
    document.querySelectorAll(selector).forEach((btn) => {
      const id = btn.dataset[key], tier = tierOf(id), old = btn.querySelector('.tier-tag');
      const tag = tierTag(tier, showFree, kind + ':' + id);
      if (old) { if (tag) old.replaceWith(tag); else old.remove(); return; }
      if (!tag) return;
      // Deck cards: after the name. Elsewhere: before the best-score <small>, so the two don't jumble
      const host = btn.querySelector('.dt-name') || btn;
      host.insertBefore(tag, host === btn ? btn.querySelector('small') : null);
      if (tier !== 'free') btn.title = (btn.title ? btn.title + '. ' : '') + TIERS.plus.hint;
    });
  }
  function tagAll(){
    document.documentElement.classList.toggle('plus-owned', LOCKED && plus);
    tagButtons('.decks button[data-deck]', deckTier, 'deck', true, 'deck');
    tagButtons('.toggle[data-style]', styleTier, 'style', false, 'style'); // the Timed switch
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tagAll);
  else tagAll();

  // ---- Buying Plus (the iOS app only) ----
  // The native side is ios/App/App/PlusStore.swift ("PairodyStore").
  let price = '', available = false;
  const store = (method) => window.Capacitor.nativePromise('PairodyStore', method, {});
  function setPlus(v){
    v = !!v;
    try { localStorage.setItem(OWNED_KEY, v ? '1' : '0'); } catch (e) {}
    if (v === plus) return;
    plus = v;
    tagAll();
    dispatchEvent(new CustomEvent('pairody:plus', { detail: { plus } }));
    render();
  }
  async function refresh(){
    if (!LOCKED) return;
    try {
      const r = await store('status');
      price = r.price || ''; available = !!r.available;
      setPlus(r.plus);
    } catch (e) { /* keep the last answer */ }
    render();
  }
  if (LOCKED) {
    refresh();
    // Plus bought some other way: Ask to Buy approved, an offer code, a refund
    addEventListener('pairodyplus', (e) => setPlus(e.plus));
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  }

  // ---- The Plus sheet ----
  // offer({deck, deckName, from}) opens it and resolves true if Plus was bought or restored.
  let dlg = null, resolveOffer = null, busy = false;
  const HTML = `
<form method="dialog" class="info-x"><button aria-label="Close">×</button></form>
<p class="info-tag">Pairody Plus</p>
<h2 id="plusTitle">Unlock every board</h2>
<p class="plus-why"></p>
<ul class="plus-list">
  <li><b class="plus-count">Every Plus board</b>: Quotes, Notes, Morse Code, Times Tables, Weather and the rest.</li>
  <li><b>Every new board</b> as it arrives, at no extra cost.</li>
  <li><b>Pay once.</b> No subscription, no ads, no account.</li>
</ul>
<p class="plus-free">Animals, Melodies, Jokes, Capitals and Daily Pairody stay free, with every game size, Timed, Labels and 2 Players.</p>
<div class="plus-actions">
  <button type="button" class="btn primary plus-buy">Get Plus</button>
  <button type="button" class="btn plus-restore">Restore purchases</button>
</div>
<p class="plus-status" role="status"></p>
<p class="plus-owned-note"><b>You have Pairody Plus.</b> Every board is yours to play. Thank you for supporting Pairody!</p>
<div class="plus-more"><button type="button" class="btn plus-pick" hidden>Pick a free board</button></div>`;
  let ctx = {};
  function build(){
    if (dlg) return dlg;
    dlg = document.createElement('dialog');
    dlg.className = 'info plus-sheet'; dlg.id = 'plusSheet';
    dlg.setAttribute('aria-labelledby', 'plusTitle');
    dlg.innerHTML = HTML;
    document.body.appendChild(dlg);
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', () => { if (resolveOffer) { const r = resolveOffer; resolveOffer = null; r(plus); } });
    dlg.querySelector('.plus-buy').addEventListener('click', buy);
    dlg.querySelector('.plus-restore').addEventListener('click', restore);
    dlg.querySelector('.plus-pick').addEventListener('click', () => {
      dlg.close(); track('plus/pickfree', 'Plus sheet: Pick a free board');
      const chip = document.getElementById('deckChip'); if (chip) chip.click();
    });
    return dlg;
  }
  function say(t){ if (dlg) dlg.querySelector('.plus-status').textContent = t || ''; }
  function render(){
    if (!dlg) return;
    dlg.classList.toggle('owned', plus);
    const n = document.querySelectorAll('.deck-tile[data-deck]').length;
    const nPlus = [...document.querySelectorAll('.deck-tile[data-deck]')].filter((t) => deckTier(t.dataset.deck) === 'plus').length;
    if (nPlus) dlg.querySelector('.plus-count').textContent = nPlus + ' more boards';
    let why = 'Get every board in Pairody' + (n ? ', all ' + n + ' of them' : '') + ', with one purchase.';
    if (ctx.deckName && ctx.out) why = 'You’ve played your ' + TRIAL_PLAYS + ' free games of ' + ctx.deckName + '. Get Plus to keep playing it, along with every other board.';
    else if (ctx.deckName) why = ctx.deckName + ' is part of Pairody Plus. Get Plus to play it as much as you like, along with every other board.';
    dlg.querySelector('.plus-why').textContent = why;
    const b = dlg.querySelector('.plus-buy');
    b.disabled = busy || !available;
    b.textContent = !available ? 'Plus isn’t available right now' : 'Get Plus' + (price ? ' · ' + price : '');
    dlg.querySelector('.plus-restore').disabled = busy;
    dlg.querySelector('.plus-pick').hidden = !ctx.out || plus;
  }
  function offer(opts){
    if (!LOCKED) return Promise.resolve(true);
    ctx = opts || {};
    build(); say(''); render();
    track('plus/open/' + (ctx.from || 'other'), 'Plus sheet opened' + (ctx.deck ? ': ' + ctx.deck : ''));
    if (!available) refresh();
    document.querySelectorAll('dialog[open]').forEach((d) => { if (d !== dlg) d.close(); });
    if (!dlg.open) dlg.showModal();
    return new Promise((ok) => { resolveOffer = ok; });
  }
  async function buy(){
    if (busy) return;
    busy = true; render(); say('Opening the App Store…');
    track('plus/buy', 'Get Plus tapped');
    try {
      const r = await store('purchase');
      setPlus(r.plus);
      const res = r.result;
      if (res === 'purchased') { track('plus/bought', 'Plus bought'); say(''); busy = false; render(); setTimeout(() => dlg.open && dlg.close(), 1600); return; }
      if (res === 'pending') { track('plus/pending', 'Plus purchase waiting for approval'); say('Waiting for approval. Plus unlocks as soon as the purchase is approved.'); }
      else if (res === 'cancelled') { track('plus/cancel', 'Plus purchase cancelled'); say(''); }
      else { track('plus/fail/' + res, 'Plus purchase failed: ' + res); say('The App Store couldn’t finish the purchase. Please try again in a moment.'); }
    } catch (e) {
      track('plus/fail/error', 'Plus purchase error');
      say('The App Store couldn’t finish the purchase. Check your connection and try again.');
    }
    busy = false; render();
  }
  async function restore(){
    if (busy) return null;
    busy = true; render(); say('Checking with the App Store…');
    track('plus/restore', 'Restore purchases tapped');
    try {
      const r = await store('restore');
      setPlus(r.plus);
      if (r.plus) { track('plus/restored', 'Plus restored'); say('Plus restored. Every board is unlocked.'); }
      else { track('plus/restore/none', 'Restore found no Plus'); say('No Plus purchase found for this Apple ID. If you bought it with another Apple ID, sign in with that one in Settings and try again.'); }
    } catch (e) {
      say('Couldn’t reach the App Store. Check your connection and try again.');
      busy = false; render(); return false;
    }
    busy = false; render(); return true;
  }

  window.PairodyPlus = { TIERS, FREE_DECKS, PLUS_STYLES, FEATURES, LOCKED, TRIAL_PLAYS, triesLeft, useTry, deckTier, styleTier, featureTier, owns, canPlay, canPlayStyle, canUse, deckTries, tierTag, tagAll,
    offer, buy, restore, refresh, has: () => plus, price: () => price };
})();
