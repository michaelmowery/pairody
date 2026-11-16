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
// Tags show on the website only for now; the iOS app hides them (.native .tier-tag in
// pairody.css) until it can sell Plus.
(function(){
  const TIERS = {
    free: { label: 'Free', hint: 'Always included' },
    plus: { label: 'Plus', hint: 'Part of Pairody Plus. Free for everyone for now' },
  };
  const FREE_DECKS = new Set(['animals', 'jokes']);
  const PLUS_STYLES = new Set(['triples', 'timed', 'duo']);
  const FEATURES = {
    // 'record-deck': 'plus',   // later: record your own deck
  };

  const deckTier = (deck) => (FREE_DECKS.has(deck) ? 'free' : 'plus');
  const styleTier = (style) => (PLUS_STYLES.has(style) ? 'plus' : 'free');
  const featureTier = (id) => FEATURES[id] || 'free';

  // Does this player have the tier? For now: yes, every tier.
  const RANK = { free: 0, plus: 1 };
  function owns(tier){ return RANK[tier] != null; } // later: RANK[tier] <= RANK[entitlement]
  const canPlay = (deck) => owns(deckTier(deck));
  const canPlayStyle = (style) => owns(styleTier(style));
  const canUse = (id) => owns(featureTier(id));

  // The little "Plus" pill shown next to a Plus deck, style or feature. Free items get no tag.
  function tierTag(tier){
    if (tier === 'free') return null;
    const tag = document.createElement('span');
    tag.className = 'tier-tag tier-' + tier;
    tag.textContent = TIERS[tier].label;
    tag.setAttribute('aria-label', ', ' + TIERS[tier].label);
    return tag;
  }

  function tagButtons(selector, tierOf, key){
    document.querySelectorAll(selector).forEach((btn) => {
      if (btn.querySelector('.tier-tag')) return;
      const tag = tierTag(tierOf(btn.dataset[key]));
      if (!tag) return;
      // Before the best-score <small> on deck buttons, so the two don't jumble
      btn.insertBefore(tag, btn.querySelector('small'));
      btn.title = (btn.title ? btn.title + '. ' : '') + TIERS.plus.hint;
    });
  }
  function tagAll(){
    tagButtons('.decks button[data-deck]', deckTier, 'deck');
    tagButtons('.styles button[data-style]', styleTier, 'style');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tagAll);
  else tagAll();

  window.PairodyPlus = { TIERS, FREE_DECKS, PLUS_STYLES, FEATURES, deckTier, styleTier, featureTier, owns, canPlay, canPlayStyle, canUse, tierTag };
})();
