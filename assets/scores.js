// Best scores screen: every best saved on this device (assets/best.js), grouped by deck, with
// rows for each board size and style and columns for names shown / Difficult (sounds only).
// Opens from the info panel, the Well done card and the Best box under the board.
// "Clear best scores" asks first and removes only the "pairody-best:" keys: settings, the Daily
// streak, release-note and welcome state are left alone.
// After a clear it fires "pairody:bests-cleared" on window so the page can refresh its Best box.
(function(){
  const PREFIX = 'pairody-best:';
  // Deck buttons order (by category, as in index.html). A deck that isn't listed here still shows, named from its id.
  const DECKS = [
    // Sounds
    ['animals','Animals'],['everyday','Everyday Sounds'],['weather','Weather'],['vehicles','Vehicles'],['keypad','Phone Keypad'],['morse','Morse Code'],
    // Music
    ['notes','Notes'],['melodies','Melodies'],['instruments','Instruments'],['ringtones','Ringtones'],['seasonal','Seasonal'],
    // Words
    ['talk','Animal Talk'],['quotes','Quotes'],['jokes','Jokes'],['twisters','Tongue Twisters'],['hello','Say Hello'],['wordplay','Rhymes'],['opposites','Opposites'],['homophones','Homophones'],
    // Learning
    ['brain','Capitals'],['times','Times Tables'],['synonyms','Synonyms'],['elements','Elements'],['planets','Planets'],['presidents','Presidents'],
  ];
  const SIZES = [['small','Small'],['classic','Classic'],['big','Big']];
  const STYLES = [['pairs','Pairs'],['triples','Triples'],['timed','Timed']];
  // Pairs (or sets, in Triples) on each board, for the perfect-board star
  const PAIRS = { pairs: { small: 6, classic: 8, big: 12 }, timed: { small: 6, classic: 8, big: 12 }, triples: { small: 4, classic: 5, big: 8 } };
  const track = (name, title) => window.PairodyAnalytics && window.PairodyAnalytics.track(name, title);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmtTime = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');

  function keys(){
    const out = [];
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(PREFIX)) out.push(k); } } catch (e) {}
    return out;
  }
  function read(k){ try { const v = JSON.parse(localStorage.getItem(k)); return v && v.moves > 0 ? v : null; } catch (e) { return null; } }

  // Key formats (see bestKey in index.html): <deck>[@small|@big][~triples|~timed][:easy]
  // ":easy" = names shown (the default); no suffix = Difficult. Your music keys start with "yt:".
  function collect(){
    const decks = {}, yt = [];
    for (const k of keys()) {
      const v = read(k); if (!v) continue;
      const key = k.slice(PREFIX.length);
      if (key.startsWith('yt:')) { yt.push(v); continue; }
      const m = /^([a-z]+)(?:@(small|big))?(?:~(triples|timed))?(:easy)?$/.exec(key);
      if (!m) continue;
      const [, deck, size = 'classic', style = 'pairs', easy] = m;
      const d = decks[deck] = decks[deck] || {};
      const row = d[style + '/' + size] = d[style + '/' + size] || { style, size };
      row[easy ? 'names' : 'difficult'] = v;
    }
    return { decks, yt };
  }

  function cell(v, row){
    if (!v) return '<td class="sc-none">—</td>';
    const perfect = v.moves === PAIRS[row.style][row.size];
    return `<td><b>${v.moves}</b>${perfect ? '<span class="sc-star" title="Perfect game" aria-label="perfect">★</span>' : ''}`
      + `<span class="sc-time">${fmtTime(v.secs)}</span></td>`;
  }

  function render(){
    const { decks, yt } = collect();
    const names = new Map(DECKS);
    Object.keys(decks).forEach((id) => { if (!names.has(id)) names.set(id, id[0].toUpperCase() + id.slice(1)); });
    const played = [...names.keys()].filter((id) => decks[id]);
    const unplayed = DECKS.map(([id]) => id).filter((id) => !decks[id]);
    let count = 0, perfect = 0;
    let html = '';
    for (const id of played) {
      const rows = [];
      for (const [st, stName] of STYLES) for (const [sz, szName] of SIZES) {
        const r = decks[id][st + '/' + sz]; if (!r) continue;
        [r.names, r.difficult].forEach((v) => { if (v) { count++; if (v.moves === PAIRS[st][sz]) perfect++; } });
        rows.push(`<tr><th scope="row">${szName}${st === 'pairs' ? '' : ' · ' + stName}</th>${cell(r.names, r)}${cell(r.difficult, r)}</tr>`);
      }
      html += `<section class="sc-deck"><h3>${esc(names.get(id))}</h3><table class="sc-table">`
        + '<thead><tr><th scope="col">Game</th><th scope="col">Names</th><th scope="col">Difficult</th></tr></thead>'
        + `<tbody>${rows.join('')}</tbody></table></section>`;
    }
    if (yt.length) {
      count += yt.length;
      html += `<section class="sc-deck"><h3>Your music</h3><p class="sc-note">Best scores for ${yt.length} ${yt.length === 1 ? 'playlist or song set' : 'playlists and song sets'}. They show on the Your music page when you load those songs again.</p></section>`;
    }
    const summary = count
      ? `<p class="sc-summary"><b>${count}</b> best ${count === 1 ? 'score' : 'scores'} on ${played.length + (yt.length ? 1 : 0)} ${played.length + (yt.length ? 1 : 0) === 1 ? 'board' : 'boards'}`
        + (perfect ? ` · <span class="sc-nw"><b>${perfect}</b> perfect ${perfect === 1 ? 'game' : 'games'} <span class="sc-star">★</span></span>` : '') + '</p>'
      : '<div class="sc-empty"><p><b>No best scores yet.</b></p><p>Clear a game and your score shows up here. Each board keeps a best for every game size and style, with and without Difficult mode.</p></div>';
    const legend = count ? '<p class="sc-legend">Fewest moves, then fastest time. <b>Names</b> = sound names shown; <b>Difficult</b> = sounds only. ★ = a perfect game, one move per pair.</p>' : '';
    const rest = count && unplayed.length ? `<p class="sc-unplayed"><b>Not played yet:</b> ${unplayed.map((id) => esc(names.get(id))).join(', ')}.</p>` : '';
    let streak = '';
    try { if (typeof Daily !== 'undefined' && Daily.streak) { const n = Daily.streak(); if (n) streak = `<p class="sc-streak">Daily streak: <b>${n} ${n === 1 ? 'day' : 'days'}</b>. Daily games and 2 Players don't set best scores.</p>`; } } catch (e) {}
    return { body: summary + legend + html + rest + streak, count };
  }

  let dlg = null;
  function draw(){
    const { body, count } = render();
    dlg.querySelector('.sc-body').innerHTML = body;
    const clear = dlg.querySelector('.sc-clear');
    clear.hidden = !count;
    dlg.querySelector('.sc-clear-btn').hidden = false;
    dlg.querySelector('.sc-confirm').hidden = true;
    dlg.querySelector('.sc-confirm-q').textContent = `Clear all ${count} best ${count === 1 ? 'score' : 'scores'} on this device? This can't be undone.`;
  }
  function build(){
    dlg = document.createElement('dialog');
    dlg.className = 'info scores';
    dlg.setAttribute('aria-labelledby', 'scoresTitle');
    dlg.innerHTML = '<form method="dialog" class="info-x"><button aria-label="Close">×</button></form>'
      + '<p class="info-tag">Score card</p><h2 id="scoresTitle">Your best scores</h2>'
      + '<div class="sc-body"></div>'
      + '<div class="sc-clear"><button type="button" class="btn sc-clear-btn">Clear best scores…</button>'
      + '<div class="sc-confirm" role="alertdialog" aria-labelledby="scConfirmQ" hidden><p class="sc-confirm-q" id="scConfirmQ"></p>'
      + '<p class="sc-keep">Your settings and Daily streak are kept.</p>'
      + '<div class="sc-confirm-btns"><button type="button" class="btn sc-danger sc-yes">Clear scores</button><button type="button" class="btn sc-no">Cancel</button></div></div></div>'
      + '<p class="sc-done" role="status"></p>'
      + '<p class="info-foot">Saved on this device only. No account needed.</p>';
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    dlg.querySelector('.sc-clear-btn').addEventListener('click', () => {
      dlg.querySelector('.sc-clear-btn').hidden = true;
      dlg.querySelector('.sc-confirm').hidden = false;
      dlg.querySelector('.sc-no').focus();
    });
    dlg.querySelector('.sc-no').addEventListener('click', () => { draw(); dlg.querySelector('.sc-clear-btn').focus(); });
    dlg.querySelector('.sc-yes').addEventListener('click', () => {
      const n = clearAll();
      track('scores/clear', 'Best scores cleared');
      draw();
      dlg.querySelector('.sc-done').textContent = `Cleared ${n} best ${n === 1 ? 'score' : 'scores'}.`;
      dlg.querySelector('.info-x button').focus();
    });
    document.body.appendChild(dlg);
  }
  // Removes only best scores ("pairody-best:" keys). Returns how many were removed.
  function clearAll(){
    const ks = keys();
    ks.forEach((k) => { try { localStorage.removeItem(k); } catch (e) {} });
    try { window.dispatchEvent(new CustomEvent('pairody:bests-cleared')); } catch (e) {}
    return ks.length;
  }
  // `from` says where it was opened, for the usage count: info, done, best
  function open(from){
    if (!dlg) build();
    draw();
    dlg.querySelector('.sc-done').textContent = '';
    document.querySelectorAll('dialog.info[open]').forEach((d) => { if (d !== dlg) d.close(); });
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    dlg.scrollTop = 0;
    track('scores/open/' + (from || 'other'), 'Best scores opened');
  }

  window.PairodyScores = { open, collect, clearAll };
})();
