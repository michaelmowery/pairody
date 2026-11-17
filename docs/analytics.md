# Analytics (GoatCounter)

Pairody counts anonymous usage with [GoatCounter](https://www.goatcounter.com), the same way
Noodlit does. The code is in `assets/analytics.js`. It sets no cookies, never sends playlists,
song links or anything typed, sends nothing offline, skips local and preview copies (it logs to
the console there instead), and turns off when the player switches off **Anonymous usage
counts** in the info panel (saved in localStorage `pairody.prefs` as `{"analytics": false}`).

## Setup (one time)

1. Go to <https://www.goatcounter.com/signup>.
2. Pick the site code **pairody**, so the dashboard is at `https://pairody.goatcounter.com`.
   If that code is taken, pick another and change `GOATCOUNTER_CODE` at the top of
   `assets/analytics.js` to match.
3. Enter an email and password and finish signing up.

Counting starts as soon as the code is live on pairody.app. To turn analytics off everywhere,
set `GOATCOUNTER_CODE = ''`. Only `pairody.app` and the iOS app send counts.

## The iOS app

The App Store app counts the same events as the website, with the same opt-out switch, but every
count is tagged so the two never mix:

- every event starts with `ios/`: `ios/deck/animals`, `ios/play/jokes/big/triples`,
  `ios/win/capitals/daily`, `ios/players/2`, `ios/launch` (each app start), and so on. Titles
  start with `iOS:`.
- page views start with `/app` (`/app/index.html`).

In the dashboard, type `ios/` in the filter box to see only the app. Because the filter matches
part of a name, `win/animals` shows web and app together, and `ios/win/animals` the app only.
The app reaches `https://pairody.goatcounter.com` directly (its pages load from
`capacitor://localhost`); no extra app setup or App Tracking Transparency prompt is needed, since
nothing identifies the player. `/youtube.html` and the `yt/` events never come from the app.

## What is counted

| Event | When |
| --- | --- |
| page view (`/`, `/youtube.html`) | each page load |
| `launch/installed-app`, `launch/browser` | each page load on the website, by how Pairody was opened. The App Store app sends `ios/launch` instead (see The iOS app above). |
| `install` | installed to the home screen (Chrome, Edge, Android) |
| `deck/<id>` | a deck picked (a card in the deck picker since 2026-11-16, a deck button before that) (animals, talk, everyday, instruments, seasonal, quotes, jokes, twisters, hello, wordplay, opposites, brain, times, melodies, notes, keypad, morse, weather, vehicles, ringtones, homophones, synonyms, elements, planets, presidents; the six after talk/before keypad were added 2026-11-16, and weather, vehicles, ringtones, homophones were added later that day, then synonyms, elements, planets, presidents after them; `brain` is the Capitals deck, called Brain Food until 2026-11-16 when its times tables moved to their own `times` deck; `wordplay` is the Rhymes deck, called Word Play until 2026-11-16 when its opposites moved to their own `opposites` deck). Seasonal boards are not split by season; the season follows the date (Halloween Oct 1 to Nov 7, Holidays Nov 8 to Jan 6, Spring to May 31, Summer to Sep 30); `deck/youtube` = the Your music tile (web only) |
| `decks/open` | deck picker opened (the deck chip at the top of the board; added 2026-11-16) |
| `decks/view/all`, `decks/view/grouped` | (stopped 2026-11-17, when the switch was removed) deck picker switched between one A to Z list and Grouped by kind (Grouped is the default) |
| `decks/featured/<id>` | (stopped 2026-11-17, when the Featured row was removed) a deck picked from the picker's Featured row (also counted as `deck/<id>`) |
| `play/<id>[/small\|/big][/timed][/2p][/daily][/nolabels]` | first pad tapped on a new board (`/small` or `/big` = board size, none = Classic 4x4; `/timed` = the Timed switch is on). Before 2026-11-17 there were also `/triples` and `/difficult` (sounds only) suffixes; both modes were removed that day. |
| `win/<id>[/small\|/big][/timed][/2p][/daily]` | board cleared (suffixes as for `play`) |
| `perfect/<id>[/small\|/big][/timed][/daily]` | board cleared in one move per pair (not counted for 2 Players) |
| `labels/on`, `labels/off` | the Labels switch (pad names while playing) turned on or off (added 2026-11-17; it replaces Difficult mode, the other way round). Labels-off games add `/nolabels` at the end of `play` and `win` |
| `timed/on`, `timed/off` | the Timed switch (next to New game and Demo) turned on or off (added 2026-11-17, replacing the Pairs/Triples/Timed style buttons) |
| `style/<style>` | (stopped 2026-11-17, see `timed/on`) board style picked (pairs, triples, timed, duo, daily). Styles added 2026-11-16; earlier counts are all Pairs. Note the picker id for 2 Players is `duo` but its play/win suffix is `/2p`. |
| `players/1`, `players/2` | 1 Player / 2 Players picked (added 2026-11-16). Since then 2 Players is not a style: `style/duo` stops, and 2-player games add `/2p` after the style suffix in play/win/perfect (for example `win/animals/triples/2p`; Pairs shows just `/2p`, as before). |
| `matchup/drag/<id>` | on a two-sided Match up board, a match made by dragging a line from one side to the other instead of tapping both pads (added 2026-11-16) |
| `timed/out/<id>[/small\|/big]` | a Timed board ran out of time |
| `done/new`, `done/close` | on the Well done card shown after a board is cleared: New board, or See board (closes the card). Added 2026-11-16. |
| `done/away` | the Well done card closed by tapping outside it (added 2026-11-17) |
| `daily/streak/<n>` | a Daily streak grew to n days (n capped at 30) |
| `daily/on`, `daily/off` | Daily Pairody turned on or off with its pill (added 2026-11-16). Since then Daily is not a style: `style/daily` stops, and Daily games add `/daily` after the style suffix in play/win/perfect (for example `win/jokes/big/triples/daily`; Pairs shows just `/daily`). Before, `/daily` was the style suffix of a per-board Daily game. |
| `daily/card/play` | (stopped 2026-11-17, when the Daily banner above the board was removed) Play today's game tapped on that banner (added 2026-11-16) |
| `daily/share/pill`, `daily/share/done` | a Daily result shared through the share sheet, from the Share link under the Daily Pairody pill or the Well done card (`daily/share/card` until 2026-11-17, from the old banner) |
| `daily/copy/pill`, `daily/copy/done` | a Daily result copied instead (no share sheet, or sharing failed) |
| `size/<size>` | board size picked (small, classic, big). Sizes added 2026-11-15; earlier play/win counts are all Classic. |
| `difficult/on`, `difficult/off` | (stopped 2026-11-17, when Difficult mode was removed) Difficult mode (sounds only) switched. Names show by default. Before 2026-11-12 this was `easy/on`/`easy/off`, and `play`/`win` used an `/easy` suffix instead. |
| `demo/start/<id>` | Demo button tapped (auto-plays a board of the current deck) |
| `demo/done/<id>` | Demo finished the board |
| `demo/stop/<id>` | Demo stopped early (Stop demo, New board or picking a deck) |
| `welcome/demo` | Show demo tapped on the Early preview note (then `demo/start/<id>` follows) |
| `yt/beta-unlocked` | Your music beta password entered |
| `yt/load/playlist`, `yt/load/links` | Your music songs loaded (the playlist itself is not sent) |
| `yt/win[/hard]` | Your music board cleared |
| `scores/open/info`, `scores/open/done`, `scores/open/best`, `scores/open/streak` | best scores screen opened from the info panel, the Well done card's All best scores, or by tapping the Best box (`streak` = the box while it shows the Daily streak or on 2 Players) (added 2026-11-16) |
| `scores/clear` | best scores cleared after the confirmation step |
| `info/open` | info panel opened |
| `notes/open/info`, `notes/open/welcome` | release notes opened from the info panel's What's new, or from All release notes on the New version note (added 2026-11-15) |
| `feedback` | Send feedback tapped |
| `access/cues/on`, `access/cues/off`, `access/extraTime/on`, `access/extraTime/off` | Audio cues or Extra time switched in the info panel's Accessibility section (added 2026-11-17) |
| `analytics/off` | usage counts switched off (the last count sent) |

Each count also carries what GoatCounter collects for every hit: referrer, screen size, browser
and OS (from the User-Agent), and country or region from the IP (the IP itself isn't stored).
