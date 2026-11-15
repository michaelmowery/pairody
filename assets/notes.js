// Release notes ("What's new"). Shared by every page.
// Versions are stamped at deploy (0.<run number>, see assets/update.js), so a PR can't know its
// own version number. Notes are keyed by date instead: add a new entry at the TOP of NOTES in the
// same PR as the feature, written for players (what they'll notice, not how it was built).
// Several entries can share a date. Keep each entry to a few short bullets.
//
// Where notes show:
//   - the info panel's "What's new" section (newest entry, plus "All release notes")
//   - the "New version released" note (assets/welcome.js) lists entries newer than the
//     newest one this device has already seen
//   - the full list opens in its own panel
// localStorage: pairody.notesSeen = id (date + title) of the newest entry this device has seen.
(function(){
  const NOTES = [
    { date: '2026-11-15', title: 'Matches you can hear', items: [
      'When you find a pair, the sound now stops right away and a little chime plays, so you know it was a match.',
      'Tapping a new pad cuts off the one before it, so sounds never pile up.',
      '<b>Your music:</b> a matching clip now fades out after about a second instead of playing to the end.',
    ]},
    { date: '2026-11-15', title: 'More sounds in every deck', items: [
      'Bigger sets for every deck: about twice as many quotes, jokes, rhymes, opposites, capitals and tunes, numbers in Morse Code, and times tables up to 10.',
      'Each new board deals fresh pairs, like a shuffled deck: you hear everything in a deck before anything comes back.',
    ]},
    { date: '2026-11-15', title: 'Board sizes and release notes', items: [
      '<b>Pick your board size:</b> Small (6 pairs), Classic (8 pairs) or Big (12 pairs, with the Pairody logo in the middle). Best scores are kept for each size.',
      'The board now shrinks to fit your window on laptops and desktops, so you never have to scroll to reach the bottom row.',
      'Four more real animal recordings: horse, elephant, wolf and goat.',
      'These release notes. Find them any time under <b class="welcome-i">i</b>.',
    ]},
    { date: '2026-11-12', title: 'Six new decks and a Demo', items: [
      '<b>New decks:</b> Quotes, Animal Talk, Jokes, Word Play, Brain Food, Melodies and Morse Code. Each deck shows a short how-to under the deck buttons.',
      '<b>Demo</b> plays a board of the current deck for you, and the welcome note can start it too.',
      'Drums, Chords and Rhythms were retired to make room for the new decks.',
    ]},
    { date: '2026-11-12', title: 'Easier to play, nicer to watch', items: [
      'Sound names now show on each pad while it plays. Turn on <b>Difficult mode</b> for sounds only. Your music has Difficult mode too.',
      'Pads flip over like real cards (off if your device asks for reduced motion).',
      'More real animal recordings: songbird, duck, and a friendlier cat.',
      'Fixed: tapping New board in the middle of a move, and Your music clips that were slow to start.',
    ]},
    { date: '2026-11-12', title: 'Updates, offline play and feedback', items: [
      'The <b class="welcome-i">i</b> button explains the preview and holds your settings.',
      '<b>Check for updates</b>, and Pairody now works offline once it has loaded.',
      '<b>Send feedback</b> straight from the info panel.',
      'Anonymous usage counts help us see which decks people enjoy. You can switch them off under Privacy.',
    ]},
    { date: '2026-11-11', title: 'Pairody launches', items: [
      'Pairody opens at pairody.app: memory match, played by ear.',
      'The Animals deck plays real recordings.',
      '<b>Best scores</b> for each deck, saved on your device.',
      '<b>Your music</b> <span class="beta">Beta</span> builds a board from a YouTube playlist, for beta testers.',
    ]},
  ];
  const SEEN_KEY = 'pairody.notesSeen';
  const idOf = (n) => n.date + ' ' + n.title;
  function read(){ try { return localStorage.getItem(SEEN_KEY); } catch(e){ return null; } }
  function markSeen(){ try { localStorage.setItem(SEEN_KEY, idOf(NOTES[0])); } catch(e){} }
  // Entries newer than the newest one this device has seen. Nothing recorded yet (players from
  // before release notes existed) means just the newest entry, not the whole history.
  function unseen(){
    const i = NOTES.findIndex((n) => idOf(n) === read());
    return i === -1 ? NOTES.slice(0, 1) : NOTES.slice(0, i);
  }
  function fmt(d){
    const [y, m, day] = d.split('-').map(Number);
    return new Date(y, m - 1, day).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  }
  function entryHtml(n, heading){
    return `<section class="note"><${heading} class="note-title">${n.title}</${heading}>`
      + `<p class="note-date"><time datetime="${n.date}">${fmt(n.date)}</time></p>`
      + `<ul>${n.items.map((i) => `<li>${i}</li>`).join('')}</ul></section>`;
  }
  const track = (name, title) => window.PairodyAnalytics?.track(name, title);

  // The full list, in its own panel. `from` says where it was opened, for the usage count.
  let dlg = null;
  function open(from){
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.className = 'info notes';
      dlg.setAttribute('aria-labelledby', 'notesTitle');
      dlg.innerHTML = `<form method="dialog" class="info-x"><button aria-label="Close">×</button></form>`
        + `<p class="info-tag">Release notes</p><h2 id="notesTitle">What's new in Pairody</h2>`
        + NOTES.map((n) => entryHtml(n, 'h3')).join('')
        + `<p class="info-foot">Ideas for what comes next? Use Send feedback under <b class="welcome-i">i</b>.</p>`;
      dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
      document.body.appendChild(dlg);
    }
    // Opened from the info panel: close it first so the two panels don't stack.
    document.querySelectorAll('dialog.info[open]').forEach((d) => { if (d !== dlg) d.close(); });
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    dlg.scrollTop = 0;
    markSeen();
    track('notes/open/' + (from || 'other'), 'Release notes opened');
  }

  window.PairodyNotes = { list: NOTES, unseen, markSeen, open, entryHtml, fmt };
})();
