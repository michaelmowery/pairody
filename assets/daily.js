// Today's game: the Daily game card above the board, and the Share button.
// Daily itself (the seeded deal and the streak) lives in index.html; this file only shows it.
//   - The card shows today's date, the streak and what to do next: play today's game, or, once
//     one is cleared, a countdown to tomorrow's game and a Share button.
//   - Share builds a Wordle-style result (one square per move: green = match, dark = miss)
//     and opens the share sheet, or copies it where there is none.
// The page tells this file about new games ("pairody:board") and Daily clears
// ("pairody:daily-cleared"). It reads the page's globals: Daily, deck, size, style, DECKNAME, SIZES, fmt.
// Words: in what players see, a "board" is a deck (Animals, Jokes...) and a "game" is one round.
(function(){
  const $ = (id) => document.getElementById(id);
  const card = $('today'); if (!card || typeof Daily === 'undefined') return;
  const track = (n, t) => window.PairodyAnalytics && window.PairodyAnalytics.track(n, t);
  const sizeLabel = (s) => s === 'classic' ? '' : ' (' + SIZES[s].name + ')';
  const days = (n) => n + (n === 1 ? ' day' : ' days');

  // Today's clears, newest last: [{moves, secs, log, deck, size, easy, streak}]
  function clears(){
    const v = Daily.load();
    if (!v.today || v.today.date !== Daily.day()) return [];
    return Object.values(v.today.done || {});
  }
  // The result Share sends: this board and size if cleared today, otherwise the latest clear
  function shareable(){
    return Daily.result() || clears().slice(-1)[0] || null;
  }
  function untilTomorrow(){
    const now = new Date(), next = new Date(now); next.setHours(24, 0, 0, 0);
    const m = Math.ceil((next - now) / 60000), h = Math.floor(m / 60);
    return h ? h + 'h ' + (m % 60) + 'm' : m > 1 ? m + ' minutes' : 'under a minute';
  }

  function render(){
    const now = new Date();
    $('tdMon').textContent = now.toLocaleDateString(undefined, { month: 'short' });
    $('tdDay').textContent = now.getDate();
    const n = Daily.streak(), done = clears().length > 0, here = Daily.result(), daily = style === 'daily';
    const flame = n ? '🔥 ' + days(n) + (n > 1 ? ' in a row' : '') + '. ' : '';
    let title, sub;
    if (done) {
      title = '✓ Today\'s game done';
      sub = (daily && !here
        ? 'Your streak is safe; this ' + DECKNAME[deck] + ' game is just for fun. ' : '') + flame + 'Next game in ' + untilTomorrow() + '.';
    } else if (daily) {
      title = 'Today\'s ' + DECKNAME[deck] + ' game';
      sub = 'Everyone playing ' + DECKNAME[deck] + sizeLabel(size) + ' gets these same pads today. '
        + (n ? 'Clear it to keep your 🔥 ' + n + '-day streak.' : 'Clear it to start a streak.');
    } else {
      title = 'Daily game';
      sub = 'Same pads for everyone today. ' + (n ? '🔥 ' + days(n) + ': play to keep your streak.' : 'Clear one a day to build a streak.');
    }
    $('tdTitle').textContent = title;
    $('tdSub').textContent = sub;
    card.classList.toggle('done', done);
    card.classList.toggle('on', daily && !done);
    $('tdPlay').hidden = daily || done;
    $('tdShare').hidden = !done;
    card.hidden = false;
  }

  // "Pairody Daily · Nov 16" / "Animals (Big): 14 moves, 1:02" / squares / streak / link
  function shareText(r){
    const when = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const sq = (r.log || '').split('').map((c) => c === '1' ? '🟩' : '⬛');
    const rows = []; for (let i = 0; i < sq.length; i += 8) rows.push(sq.slice(i, i + 8).join(''));
    const pairs = SIZES[r.size] ? SIZES[r.size].pairs : 0;
    const extras = [r.moves === pairs ? '⭐ Perfect' : '', r.easy === false ? '🎧 Sounds only' : '', r.streak ? '🔥 ' + days(r.streak) : ''].filter(Boolean);
    return ['Pairody Daily · ' + when,
      (DECKNAME[r.deck] || r.deck) + sizeLabel(r.size) + ': ' + r.moves + ' moves, ' + fmt(r.secs)]
      .concat(rows, extras.length ? [extras.join('  ')] : [], ['https://pairody.app']).join('\n');
  }
  function copied(btn){
    const was = btn.textContent; btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = was; }, 1800);
  }
  async function share(btn, from){
    const r = shareable(); if (!r) return;
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
    const b = document.querySelector('.styles button[data-style="daily"]'); if (b) b.click();
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
      if (style === 'daily' && !moves && typeof build === 'function') { build(); return; }
    }
    render();
  }, 30000);
  render();
})();
