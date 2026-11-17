// Today's game: the Daily game card above the board, and the Share button.
// Daily itself (the seeded deal and the streak) lives in index.html; this file only shows it.
//   - The card shows today's date, the streak and what to do next: play today's game, or, once
//     one is cleared, a countdown to tomorrow's game and a Share button.
//   - Share builds a Wordle-style result (one square per move: green = match, dark = miss)
//     and opens the share sheet, or copies it where there is none.
// The page tells this file about new games ("pairody:board") and Daily clears
// ("pairody:daily-cleared"). It reads the page's globals: Daily, dailyOn, enterDaily, leaveDaily, moves, DECKNAME, SIZES, fmt.
// Words: in what players see, a "board" is a deck (Animals, Jokes...) and a "game" is one round.
(function(){
  const $ = (id) => document.getElementById(id);
  const card = $('today'); if (!card || typeof Daily === 'undefined') return;
  const track = (n, t) => window.PairodyAnalytics && window.PairodyAnalytics.track(n, t);
  const days = (n) => n + (n === 1 ? ' day' : ' days');

  // One plain line on how today's game plays, so a Timed day doesn't surprise anyone
  const RULE = { pairs: 'Find the 2 pads that match.', timed: 'Find every pair before the clock runs out.' };
  // "Jokes · Big" or "Jokes · Big · Timed". (Triples was removed 2026-11-17; a result saved
  // earlier that day as Triples still labels and scores as one.)
  const comboLabel = (r) => [DECKNAME[r.deck] || r.deck, SIZES[r.size] ? SIZES[r.size].name : r.size]
    .concat(r.style === 'timed' ? ['Timed'] : r.style === 'triples' ? ['Triples'] : []).join(' · ');
  const OLD_TRIPLES = { small: 4, classic: 5, big: 8 };
  function untilTomorrow(){
    const now = new Date(), next = new Date(now); next.setHours(24, 0, 0, 0);
    const m = Math.ceil((next - now) / 60000), h = Math.floor(m / 60);
    return h ? h + 'h ' + (m % 60) + 'm' : m > 1 ? m + ' minutes' : 'under a minute';
  }

  function render(){
    const now = new Date();
    $('tdMon').textContent = now.toLocaleDateString(undefined, { month: 'short' });
    $('tdDay').textContent = now.getDate();
    const n = Daily.streak(), done = !!Daily.result(), daily = dailyOn;
    const flame = n ? '🔥 ' + days(n) + (n > 1 ? ' in a row' : '') + '. ' : '';
    let title, sub;
    if (done) {
      title = '✓ Today\'s game done';
      sub = flame + 'Next Daily Pairody in ' + untilTomorrow() + '.';
    } else if (daily) {
      title = 'Today\'s Daily Pairody';
      const c = Daily.combo();
      sub = comboLabel(c) + '. ' + (RULE[c.style] || RULE.pairs) + ' Same pads for everyone today. '
        + (n ? 'Clear it to keep your 🔥 ' + n + '-day streak.' : 'Clear it to start a streak.');
    } else {
      title = 'Daily Pairody';
      sub = 'One surprise game a day: the board, size and clock are picked for everyone. '
        + (n ? '🔥 ' + days(n) + ': play to keep your streak.' : 'Clear one a day to build a streak.');
    }
    $('tdTitle').textContent = title;
    $('tdSub').textContent = sub;
    card.classList.toggle('done', done);
    card.classList.toggle('on', daily && !done);
    $('tdPlay').hidden = daily || done;
    $('tdShare').hidden = !done;
    card.hidden = false;
    const ask = $('dailyAsk');
    if (ask) { ask.textContent = done ? '✓ You Pairody\'d today' : 'Have you Pairody\'d today?'; ask.classList.toggle('done', done); }
  }

  // "Daily Pairody · Nov 16" / "Jokes · Big · Timed" / "14 moves, 1:02" / squares / streak / link
  function shareText(r){
    const when = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const sq = (r.log || '').split('').map((c) => c === '1' ? '🟩' : '⬛');
    const rows = []; for (let i = 0; i < sq.length; i += 8) rows.push(sq.slice(i, i + 8).join(''));
    const pairs = r.style === 'triples' ? OLD_TRIPLES[r.size] : SIZES[r.size] ? SIZES[r.size].pairs : 0;
    const extras = [r.moves === pairs ? '⭐ Perfect' : '', r.easy === false ? '🎧 Sounds only' : '', r.streak ? '🔥 ' + days(r.streak) : ''].filter(Boolean);
    return ['Daily Pairody · ' + when,
      comboLabel(r), r.moves + ' moves, ' + fmt(r.secs)]
      .concat(rows, extras.length ? [extras.join('  ')] : [], ['https://pairody.app']).join('\n');
  }
  function copied(btn){
    const was = btn.textContent; btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = was; }, 1800);
  }
  async function share(btn, from){
    const r = Daily.result(); if (!r) return;
    const text = shareText(r);
    if (navigator.share) {
      try { await navigator.share({ text }); track('daily/share/' + from, 'Daily result shared'); return; }
      catch (e) { if (e && e.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(text); }
    catch (e) {
      const t = document.createElement('textarea'); t.value = text; t.setAttribute('readonly', '');
      t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch (e2) {} t.remove();
    }
    track('daily/copy/' + from, 'Daily result copied');
    copied(btn);
  }

  $('tdPlay').onclick = () => {
    track('daily/card/play', 'Today\'s game card: Play');
    if (!dailyOn) enterDaily();
  };
  $('tdShare').onclick = () => share($('tdShare'), 'card');
  const ds = $('doneShare');
  if (ds) ds.onclick = () => share(ds, 'done');

  // A cleared Daily game's Well done card offers Share instead of a new game (a new Daily
  // game would deal the same pads again)
  const dn = $('doneNew');
  addEventListener('pairody:daily-cleared', () => {
    if (ds) { ds.hidden = false; ds.classList.add('primary'); dn.hidden = true; }
    render();
  });
  addEventListener('pairody:board', () => {
    if (ds) { ds.hidden = true; ds.classList.remove('primary'); dn.hidden = false; }
    render();
  });
  // Keep the countdown fresh, and roll over at midnight (a Daily game not started yet is redealt)
  let today = Daily.day();
  setInterval(() => {
    if (Daily.day() !== today) {
      today = Daily.day();
      if (dailyOn && !moves) { leaveDaily(true); enterDaily(); return; }
    }
    render();
  }, 30000);
  render();
})();
