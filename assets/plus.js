// Free and Plus: which decks and board styles are free, and which will be part of Pairody Plus.
// Same idea as Noodlit's plus.js: one place that says which tier each thing is in, a small
// tag to show next to it, and one check (canPlay / canUse) to ask before turning it on.
//
// THE SPLIT LIVES HERE. To move something, edit FREE_DECKS or PLUS_STYLES (or FEATURES).
//   - Decks: free only if listed in FREE_DECKS. Every other deck is Plus, including any new one.
//   - Board styles: Plus only if listed in PLUS_STYLES. Other styles are free.
//   - Board sizes, Difficult mode, Demo and best scores are free.
//   - Your music (YouTube) is never Plus: YouTube's terms don't allow charging for access to its
//     videos. It is web only (the iOS app leaves it out).
//   - A paid feature that isn't a deck or style goes in FEATURES by id.
//
// Nothing is locked yet. Until purchases arrive, owns() says yes to every tier, so everything
// plays for everyone. When the App Store purchase is added (one-time unlock, through
// RevenueCat), owns() is the one place that changes.
//
// Rules for when Plus locks (Michael, 2026-11-16):
//   - Demo always runs, on any deck and style, for everyone. Demo boards never use a try.
//   - Try before you buy: without Plus, each Plus deck and each Plus style can be played
//     TRIAL_PLAYS times (a board counts once its first pad is tapped). After that its button
//     says "Get Plus" instead of playing. Counts live on this device (pairody.plusTries), so a
//     reinstall or cleared site data resets them; that's fine for a small one-time unlock.
//   - The Plus tag then shows how many tries are left ("Plus · 3 left").
// None of this runs yet: LOCKED is false, so nothing is counted and nothing is blocked.
//
// Tags show on the website only for now; the iOS app hides them (.native .tier-tag in
// pairody.css) until it can sell Plus.
(function(){
  const TIERS = {
    free: { label: 'Free', hint: 'Always included' },
    plus: { label: 'Plus', hint: 'Part of Pairody Plus. Free for everyone for now' },
  };
  const FREE_DECKS = new Set(['animals', 'melodies', 'jokes', 'brain']); // one per group: Sounds, Music, Words, Learning (brain = Capitals)
  const PLUS_STYLES = new Set(['triples', 'timed', 'duo']);
  const LOCKED = false;      // flip on when the purchase exists (with owns() below)
  const TRIAL_PLAYS = 10;    // free tries per Plus deck and per Plus style
  const TRIES_KEY = 'pairody.plusTries';
  const FEATURES = {
    // 'record-deck': 'plus',   // later: record your own deck
  };

  const deckTier = (deck) => (FREE_DECKS.has(deck) ? 'free' : 'plus');
  const styleTier = (style) => (PLUS_STYLES.has(style) ? 'plus' : 'free');
  const featureTier = (id) => FEATURES[id] || 'free';

  // Does this player have the tier? For now: yes, every tier.
  const RANK = { free: 0, plus: 1 };
  function owns(tier){ return RANK[tier] != null; } // later: RANK[tier] <= RANK[entitlement]
  const canUse = (id) => owns(featureTier(id));

  // Free tries (see the rules above). key is "deck:<id>" or "style:<id>".
  function readTries(){ try { return JSON.parse(localStorage.getItem(TRIES_KEY)) || {}; } catch (e) { return {}; } }
  function triesLeft(key){ return Math.max(0, TRIAL_PLAYS - (readTries()[key] || 0)); }
  // Call when a real (non-demo) board's first pad is tapped.
  function useTry(kind, id){
    if (!LOCKED) return;
    const tier = kind === 'deck' ? deckTier(id) : styleTier(id);
    if (tier === 'free' || owns(tier)) return;
    const t = readTries(), key = kind + ':' + id;
    t[key] = (t[key] || 0) + 1;
    try { localStorage.setItem(TRIES_KEY, JSON.stringify(t)); } catch (e) {}
  }
  // Can this deck / style be played right now? (Demo doesn't ask: it always runs.)
  const canPlay = (deck) => !LOCKED || owns(deckTier(deck)) || triesLeft('deck:' + deck) > 0;
  const canPlayStyle = (style) => !LOCKED || owns(styleTier(style)) || triesLeft('style:' + style) > 0;

  // The little "Plus" pill shown next to a Plus deck, style or feature. Free items get no tag,
  // except in the deck picker's cards, which say Free too (showFree), like Noodlit's scene menu.
  function tierTag(tier, showFree){
    if (tier === 'free' && !showFree) return null;
    const tag = document.createElement('span');
    tag.className = 'tier-tag tier-' + tier;
    tag.textContent = TIERS[tier].label;
    tag.setAttribute('aria-label', ', ' + TIERS[tier].label);
    return tag;
  }

  function tagButtons(selector, tierOf, key, showFree){
    document.querySelectorAll(selector).forEach((btn) => {
      if (btn.querySelector('.tier-tag')) return;
      const tier = tierOf(btn.dataset[key]);
      const tag = tierTag(tier, showFree);
      if (!tag) return;
      // Deck cards: after the name. Elsewhere: before the best-score <small>, so the two don't jumble
      const host = btn.querySelector('.dt-name') || btn;
      host.insertBefore(tag, host === btn ? btn.querySelector('small') : null);
      if (tier !== 'free') btn.title = (btn.title ? btn.title + '. ' : '') + TIERS.plus.hint;
    });
  }
  function tagAll(){
    tagButtons('.decks button[data-deck]', deckTier, 'deck', true);
    tagButtons('.styles button[data-style]', styleTier, 'style');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tagAll);
  else tagAll();

  window.PairodyPlus = { TIERS, FREE_DECKS, PLUS_STYLES, FEATURES, LOCKED, TRIAL_PLAYS, triesLeft, useTry, deckTier, styleTier, featureTier, owns, canPlay, canPlayStyle, canUse, tierTag };
})();
