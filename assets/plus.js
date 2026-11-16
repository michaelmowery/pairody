// Free and Plus: what's included and what will be part of Pairody Plus.
// Same idea as Noodlit's plus.js: one place that says which tier each deck and feature is in,
// a small tag to show next to it, and one check (canUse) to ask before turning it on.
//
// Nothing is locked yet. Until purchases arrive, owns() says yes to every tier, so every deck
// plays for everyone. When the App Store purchase is added (one-time unlock, through
// RevenueCat), owns() is the one place that changes.
//
// Rules:
//   - Animals is the free deck. Every other deck is Plus, including any new deck, unless its
//     id is added to FREE_DECKS.
//   - Your music (YouTube) is never Plus: YouTube's terms don't allow charging for access to
//     its videos. It is web only (the iOS app leaves it out).
//   - Board sizes, Difficult mode, Demo and best scores are free. A paid feature that isn't a
//     deck goes in FEATURES by id.
//   - Tags show on the website only for now. The app shows them once it can sell Plus.
(function(){
  const TIERS = {
    free: { label: 'Free', hint: 'Always included' },
    plus: { label: 'Plus', hint: 'Part of Pairody Plus. Free for everyone during the preview' },
  };
  const FREE_DECKS = new Set(['animals']);
  const FEATURES = {
    // 'record-deck': 'plus',   // later: record your own deck
    // 'pass-and-play': 'plus', // later: two players on one device
  };

  const deckTier = (deck) => (FREE_DECKS.has(deck) ? 'free' : 'plus');
  const featureTier = (id) => FEATURES[id] || 'free';

  // Does this player have the tier? Preview: yes, every tier.
  const RANK = { free: 0, plus: 1 };
  function owns(tier){ return RANK[tier] != null; } // later: RANK[tier] <= RANK[entitlement]
  const canPlay = (deck) => owns(deckTier(deck));
  const canUse = (id) => owns(featureTier(id));

  // The little "Plus" pill shown next to a Plus deck or feature. Free items get no tag.
  function tierTag(tier){
    if (tier === 'free') return null;
    const tag = document.createElement('span');
    tag.className = 'tier-tag tier-' + tier;
    tag.textContent = TIERS[tier].label;
    tag.title = TIERS[tier].hint;
    return tag;
  }

  // Tag each deck button. The tag goes before the best-score <small> so they don't jumble.
  function tagDecks(){
    document.querySelectorAll('.decks button[data-deck]').forEach((btn) => {
      if (btn.querySelector('.tier-tag')) return;
      const tag = tierTag(deckTier(btn.dataset.deck));
      if (!tag) return;
      btn.insertBefore(tag, btn.querySelector('small'));
      btn.title = TIERS.plus.hint;
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tagDecks);
  else tagDecks();

  window.PairodyPlus = { TIERS, FREE_DECKS, FEATURES, deckTier, featureTier, owns, canPlay, canUse, tierTag };
})();
