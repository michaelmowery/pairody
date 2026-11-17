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
    { date: '2026-11-16', title: 'Know what you picked', items: [
      'On Match up boards the line under the pads now names the pad you just tapped, like <i>“France” picked. Now find its match on the right.</i> It does this in Difficult mode too.',
    ]},
    { date: '2026-11-16', title: 'Clearer Difficult mode switch', items: [
      'The <b>Difficult mode</b> switch now says what it is set to: <i>Off: names shown</i>, or <i>On: sounds only, no names</i>.',
    ]},
    { date: '2026-11-16', title: 'Boards grouped by how they play', items: [
      'In the board picker, <b>Grouped</b> now puts <b>Same sound</b> boards first and <b>Match up</b> boards second, each split into Sounds, Music, Words and Learning.',
      'The cards look different too: Same sound cards show two matching pads with an equals sign, and Match up cards show a prompt and its answer joined by a line.',
    ]},
    { date: '2026-11-16', title: 'Tidier help, and no Triples on Match up boards', items: [
      '<b>How to play</b> under the board name now folds away. Tap it to read how the board you picked plays. The longer help under the game folds away too, and each stays open once you open it.',
      'Match up boards, where a prompt goes with its answer, no longer offer <b>Triples</b>. If Triples was your pick, those boards play Pairs and Triples comes back on Same sound boards.',
    ]},
    { date: '2026-11-16', title: 'Same sound or Match up', items: [
      'Every card in the board picker now says how that board plays: <b>Same sound</b> (find two pads that sound alike) or <b>Match up</b> (match a prompt on the left to its answer on the right).',
    ]},
    { date: '2026-11-16', title: 'Usage counts in the iPhone app', items: [
      'The iPhone and iPad app now sends the same anonymous usage counts as the website, like which boards get played, so we know what to build next. Nothing about you is sent.',
      'Switch it off any time: tap <b>i</b>, then turn off <b>Anonymous usage counts</b> under Privacy.',
    ]},
    { date: '2026-11-16', title: 'Two sides for Match up boards', items: [
      'On boards where a prompt goes with its answer, like <b>Capitals</b>, <b>Jokes</b> and <b>Quotes</b>, prompts now sit on the left and answers on the right.',
      'Tap one pad on each side, or drag a line from one to the other. Each match is joined by its own colored line.',
      'Boards where both pads make the same sound, like <b>Animals</b>, keep the classic grid, and so does <b>Triples</b>.',
    ]},
    { date: '2026-11-16', title: 'A real 2 Players scoreboard', items: [
      'In <b>2 Players</b> a big scoreboard sits above the pads: each player\'s matches, and whose turn it is lit up in their color, teal or coral. The board\'s ring changes color with the turn too.',
      'Tap a name on the scoreboard to type your own. Names are saved on this device.',
    ]},
    { date: '2026-11-16', title: 'Four new Learning boards', items: [
      '<b>Synonyms</b>: match words that mean the same, like big and large.',
      '<b>Elements</b>: one pad spells a chemical symbol and its twin names the element, like F E and iron.',
      '<b>Planets</b>: match a space clue to its planet, moon or star, like the red planet and Mars.',
      '<b>Presidents</b>: match a number to the US president, like the 16th president and Abraham Lincoln.',
    ]},
    { date: '2026-11-16', title: '1 or 2 players, any style', items: [
      'Pick <b>1 Player</b> or <b>2 Players</b> next to the styles. Two players now works with <b>Pairs</b>, <b>Triples</b> and <b>Timed</b>: take turns on one device, and a match means you go again.',
      'In Timed, two players share the clock and whoever has more when it runs out wins.',
    ]},
    { date: '2026-11-16', title: 'Clearer Triples', items: [
      'In <b>Triples</b> the counter above the pads now says <b>Sets of 3</b>, and when you find two alike it tells you to find the third.',
      'The Daily Pairody card says how today\'s style plays, like <i>Triples: find all 3 pads that match.</i>',
    ]},
    { date: '2026-11-16', title: 'Daily Pairody', items: [
      'The daily game is now <b>Daily Pairody</b>: one surprise game a day for everyone. The date picks the board, game size and style, from every board there is.',
      'You play it as dealt. The pickers step aside while it is on, and your own board, size and style come back when you tap <b>Daily Pairody</b> again.',
      'Its button sits next to the board name, with a little reminder underneath: <i>Have you Pairody\'d today?</i>',
      '<b>Demo</b> moved down next to <b>New game</b>, right above the pads.',
    ]},
    { date: '2026-11-16', title: 'Rhymes and Opposites', items: [
      '<b>Word Play</b> is now <b>Rhymes</b>: every game is words and their rhymes. Your best scores carry over.',
      '<b>Opposites</b> is its own board now, so you can pick it any time instead of every other game.',
    ]},
    { date: '2026-11-16', title: 'A free board in every group', items: [
      '<b>Melodies</b> and <b>Capitals</b> are now free too, so every group has one: Animals in Sounds, Melodies in Music, Jokes in Words and Capitals in Learning.',
    ]},
    { date: '2026-11-16', title: 'Free boards first, and Your Music on its own', items: [
      'In <b>Choose a board</b>, the free boards now come first: at the top of each group, and in their own <b>Free</b> section in the All list.',
      '<b>Your music</b> has its own group, <b>Your Music</b>, at the end of the Grouped list.',
    ]},
    { date: '2026-11-16', title: 'Today\'s game', items: [
      'A <b>Daily game</b> card now sits at the top: one game a day, the same pads for everyone, with today\'s date and your 🔥 streak. Tap <b>Play today\'s game</b> to jump in.',
      'Once you clear it, the card shows when the next game starts.',
      'Tap <b>Share</b> to send your result to friends: one square per move, green for a match, dark for a miss. No spoilers, just your score.',
    ]},
    { date: '2026-11-16', title: 'Four new boards', items: [
      '<b>Weather:</b> rain, thunder, wind, hail, a blizzard and more.',
      '<b>Vehicles:</b> a steam train, sirens, a helicopter, a ship\'s horn, a race car and more.',
      '<b>Ringtones:</b> little phone jingles to match by tune and sound.',
      '<b>Homophones:</b> words that sound the same but mean different things, like knight and night.',
    ]},
    { date: '2026-11-16', title: 'Decks are now boards', items: [
      'What used to be called a <b>deck</b> (Animals, Jokes, Capitals and the rest) is now a <b>board</b>. Pick one with <b>Choose a board</b>.',
      'One round is now a <b>game</b>: <b>New game</b>, game sizes, and a <b>Daily</b> game each day. Your best scores and streaks carry over.',
    ]},
    { date: '2026-11-16', title: 'A new board picker', items: [
      'Tap the board name at the top to open the new <b>board picker</b>: every board is a card with a little picture of a matching pair and one line on how it plays.',
      'Switch between <b>Grouped</b> (Sounds, Music, Words, Learning) and <b>All</b>, one A to Z list. <b>Featured</b> boards sit on top as a good place to start.',
      'Each card shows your best score on that board.',
    ]},
    { date: '2026-11-16', title: 'Eleven more animals', items: [
      '<b>11 more real animal recordings:</b> hen, goose, donkey, raven, humpback whale, peacock, rattlesnake, dove, eagle, bison and cicada.',
      'Animals and Animal Talk now pick from 23 animals, so games change much more from one to the next.',
    ]},
    { date: '2026-11-16', title: 'Boards in groups', items: [
      'Boards are now grouped into <b>Sounds</b>, <b>Music</b>, <b>Words</b> and <b>Learning</b>, so it is easier to find the kind of game you are in the mood for.',
    ]},
    { date: '2026-11-16', title: 'Capitals and Times Tables', items: [
      '<b>Brain Food</b> is now <b>Capitals</b>: every game is countries and their capitals. Your best scores carry over.',
      '<b>Times Tables</b> is its own board now, so you can pick it any time instead of every other game.',
    ]},
    { date: '2026-11-16', title: 'New game, closer to hand', items: [
      'The <b>New game</b> button now sits right above the pads, next to your moves and time.',
    ]},
    { date: '2026-11-16', title: 'Free and Plus labels', items: [
      'Some boards and game styles now carry a small <span class="tier-tag">Plus</span> tag. They will be part of Pairody Plus, a one-time unlock, later on. Animals, Jokes, Pairs, Daily, every game size and Difficult mode stay free.',
      'Nothing is locked: every board and style is still free for everyone today.',
    ]},
    { date: '2026-11-16', title: 'Your score card', items: [
      'See every best score on one card: each board, game size and style, with and without Difficult mode. Perfect games get a star.',
      'Open it by tapping <b>Best</b> above the pads, from <b>All best scores</b> on the Well done card, or under <b class="welcome-i">i</b>.',
      'Want a fresh start? <b>Clear best scores</b> on the card asks first, and keeps your settings and Daily streak.',
    ]},
    { date: '2026-11-16', title: 'Well done!', items: [
      'Clear a game and it lights up with a green ring, then a <b>Well done</b> card shows your time and moves, with a <b>New game</b> button right there.',
      'New bests, perfect games and Daily streaks get called out on the card. In <b>2 Players</b> it names the winner.',
      'Tap <b>See game</b> to close the card and look back over what you matched.',
    ]},
    { date: '2026-11-16', title: 'Six new boards', items: [
      '<b>Everyday Sounds:</b> a doorbell, a kettle, a ringing phone, a siren and more.',
      '<b>Instruments:</b> every pad plays the same little tune on a different instrument. Match piano to piano, banjo to banjo.',
      '<b>Seasonal:</b> changes with the calendar. Right now it is the holidays, with carols, sleigh bells and a crackling fire. Halloween, spring and summer each get their own sounds.',
      '<b>Tongue Twisters:</b> match the start of a twister to its ending.',
      '<b>Say Hello:</b> hello in more than 20 languages, matched to the language.',
      '<b>Phone Keypad:</b> match each key to the beep it makes when you dial.',
    ]},
    { date: '2026-11-16', title: 'Four new ways to play', items: [
      'Pick a <b>style</b> under the board buttons. <b>Pairs</b> is the game you know.',
      '<b>Daily:</b> one game a day, the same for everyone playing that board and size. Clear one every day to build a streak.',
      '<b>Triples:</b> every sound is on three pads, and you find all three in one move.',
      '<b>Timed:</b> find every pair before the clock runs out.',
      '<b>2 Players:</b> take turns on one phone. Find a match and you go again; the pads you win show in your color.',
    ]},
    { date: '2026-11-16', title: 'Your music joins the board list', items: [
      '<b>Your music</b> moved from the top of the page to the end of the board buttons, so every way to play is in one list.',
    ]},
    { date: '2026-11-16', title: 'Getting ready for the App Store', items: [
      'Pairody is on its way to iPhone and iPad as a free app. It plays the same boards, and its pads play even with your phone on silent.',
      'A <a href="privacy.html">privacy policy</a> is now linked from the Privacy section under <b class="welcome-i">i</b>.',
    ]},
    { date: '2026-11-15', title: 'Snappier taps', items: [
      'Tapping a new pad stops whatever is playing right away, including read-aloud words.',
      'No more waiting after a miss: tap the next pad and the last two flip back at once.',
      '<b>Your music:</b> a new tap pauses the old clip immediately instead of waiting for the next video to load, and you can tap on while a missed pair is still playing.',
    ]},
    { date: '2026-11-15', title: 'Matches you can hear', items: [
      'When you find a pair, the sound now stops right away and a little chime plays, so you know it was a match.',
      'Tapping a new pad cuts off the one before it, so sounds never pile up.',
      '<b>Your music:</b> a matching clip now fades out after about a second instead of playing to the end.',
    ]},
    { date: '2026-11-15', title: 'More sounds in every board', items: [
      'Bigger sets for every board: about twice as many quotes, jokes, rhymes, opposites, capitals and tunes, numbers in Morse Code, and times tables up to 10.',
      'Each new game deals fresh pairs, like a shuffled deck of cards: you hear everything in a board before anything comes back.',
    ]},
    { date: '2026-11-15', title: 'Game sizes and release notes', items: [
      '<b>Pick your game size:</b> Small (6 pairs), Classic (8 pairs) or Big (12 pairs, with the Pairody logo in the middle). Best scores are kept for each size.',
      'The game now shrinks to fit your window on laptops and desktops, so you never have to scroll to reach the bottom row.',
      'Four more real animal recordings: horse, elephant, wolf and goat.',
      'These release notes. Find them any time under <b class="welcome-i">i</b>.',
    ]},
    { date: '2026-11-12', title: 'Six new boards and a Demo', items: [
      '<b>New boards:</b> Quotes, Animal Talk, Jokes, Word Play, Brain Food, Melodies and Morse Code. Each board shows a short how-to under the board buttons.',
      '<b>Demo</b> plays a game of the current board for you, and the welcome note can start it too.',
      'Drums, Chords and Rhythms were retired to make room for the new boards.',
    ]},
    { date: '2026-11-12', title: 'Easier to play, nicer to watch', items: [
      'Sound names now show on each pad while it plays. Turn on <b>Difficult mode</b> for sounds only. Your music has Difficult mode too.',
      'Pads flip over like real cards (off if your device asks for reduced motion).',
      'More real animal recordings: songbird, duck, and a friendlier cat.',
      'Fixed: tapping New game in the middle of a move, and Your music clips that were slow to start.',
    ]},
    { date: '2026-11-12', title: 'Updates, offline play and feedback', items: [
      'The <b class="welcome-i">i</b> button explains the preview and holds your settings.',
      '<b>Check for updates</b>, and Pairody now works offline once it has loaded.',
      '<b>Send feedback</b> straight from the info panel.',
      'Anonymous usage counts help us see which boards people enjoy. You can switch them off under Privacy.',
    ]},
    { date: '2026-11-11', title: 'Pairody launches', items: [
      'Pairody opens at pairody.app: memory match, played by ear.',
      'The Animals board plays real recordings.',
      '<b>Best scores</b> for each board, saved on your device.',
      '<b>Your music</b> <span class="beta">Beta</span> builds a game from a YouTube playlist, for beta testers.',
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
