// Daily Pairody's bits around the board, and the Share button.
// Daily itself (the seeded deal and the streak) lives in index.html; this file only shows it.
//   - Under the Daily Pairody pill: "Have you Pairody'd today?" (with the streak), or once today's
//     game is cleared "✓ Done today" and a Share link. (Until 2026-11-17 a Today's game banner sat
//     above the board; Michael found it too much, so the pill and the Well done card carry it.)
//   - On the Well done card after a Daily clear: Share up front, today's squares, the streak and
//     a countdown to the next one.
//   - Share builds a Wordle-style result (one square per move: green = match, dark = miss)
//     and opens the share sheet, or copies it where there is none.
// The page tells this file about new games ("pairody:board") and Daily clears
// ("pairody:daily-cleared"). It reads the page's globals: Daily, dailyOn, enterDaily, leaveDaily, moves, DECKNAME, SIZES, fmt.
// Words: in what players see, a "board" is a deck (Animals, Jokes...) and a "game" is one round.
(function(){
  const $ = (id) => document.getElementById(id);
  const ask = $('dailyAsk'); if (!ask || typeof Daily === 'undefined') return;
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
    const n = Daily.streak(), done = !!Daily.result();
    const fire = n ? ' · 🔥 ' + days(n) : '';
    ask.textContent = done ? '✓ Done today' + fire : 'Have you Pairody\'d today?' + (n ? ' 🔥 ' + n : '');
    ask.classList.toggle('done', done);
    document.body.classList.toggle('daily-todo', !done && !dailyOn); // the arrow pointing at the pill
    const sh = $('dailyShare'); if (sh) sh.hidden = !done;
    $('dailyPill').title = done
      ? 'Daily Pairody: you cleared today\'s game. Next one in ' + untilTomorrow() + '. Tap to play it again, or tap again to go back to your own game.'
      : 'Daily Pairody: one surprise game a day, the same board and size for everyone. Tap again to go back to your own game.';
    const nx = $('doneNext'); if (nx && !$('doneDaily').hidden) nx.textContent = 'Next Daily Pairody in ' + untilTomorrow() + '.';
  }
  const squares = (log) => { const sq = (log || '').split('').map((c) => c === '1' ? '🟩' : '⬛'); const rows = []; for (let i = 0; i < sq.length; i += 8) rows.push(sq.slice(i, i + 8).join('')); return rows; };

  // "Daily Pairody · Nov 16" / "Jokes · Big · Timed" / "14 moves, 1:02" / squares / streak / link
  function shareText(r){
    const when = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const rows = squares(r.log);
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

  const psh = $('dailyShare');
  if (psh) psh.onclick = () => share(psh, 'pill');
  const ds = $('doneShare');
  if (ds) ds.onclick = () => share(ds, 'done');

  // A cleared Daily game's Well done card offers Share instead of a new game (a new Daily
  // game would deal the same pads again)
  const dn = $('doneNew');
  // and shows today's squares (this clear's moves: green = match, dark = miss) and when the next one comes
  addEventListener('pairody:daily-cleared', (e) => {
    if (ds) { ds.hidden = false; ds.classList.add('primary'); dn.hidden = true; }
    const pk = $('donePick'); if (pk) pk.hidden = false; // a way on to another board
    const dd = $('doneDaily');
    if (dd) {
      $('doneSquares').innerHTML = squares(typeof mlog !== 'undefined' ? mlog.join('') : (Daily.result() || {}).log).join('<br>');
      $('doneSquares').setAttribute('aria-label', moves + ' moves: ' + mlog.filter((x) => x).length + ' matches and ' + mlog.filter((x) => !x).length + ' misses');
      dd.hidden = false;
    }
    render();
  });
  addEventListener('pairody:board', () => {
    if (ds) { ds.hidden = true; ds.classList.remove('primary'); dn.hidden = false; }
    const pk = $('donePick'); if (pk) pk.hidden = true;
    const dd = $('doneDaily'); if (dd) dd.hidden = true;
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
