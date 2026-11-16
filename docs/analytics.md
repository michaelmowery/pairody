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

## What is counted

| Event | When |
| --- | --- |
| page view (`/`, `/youtube.html`) | each page load |
| `launch/installed-app`, `launch/browser`, `launch/ios-app` | each page load, by how Pairody was opened (`ios-app` = the App Store app; its page views are tagged `/app/...`) |
| `install` | installed to the home screen (Chrome, Edge, Android) |
| `deck/<id>` | a deck button tapped (animals, talk, everyday, instruments, seasonal, quotes, jokes, twisters, hello, wordplay, brain, times, melodies, notes, keypad, morse; the six after talk/before keypad were added 2026-11-16; `brain` is the Capitals deck, called Brain Food until 2026-11-16 when its times tables moved to their own `times` deck). Seasonal boards are not split by season; the season follows the date (Halloween Oct 1 to Nov 7, Holidays Nov 8 to Jan 6, Spring to May 31, Summer to Sep 30); `deck/youtube` = the Your music tile (web only) |
| `play/<id>[/small\|/big][/triples\|/timed\|/2p\|/daily][/difficult]` | first pad tapped on a new board (`/small` or `/big` = board size, none = Classic 4x4; the style suffix is left out for Pairs, the original game; `/difficult` = sounds only, no names) |
| `win/<id>[/small\|/big][/<style>][/difficult]` | board cleared (style suffix as for `play`) |
| `perfect/<id>[/small\|/big][/<style>]` | board cleared in one move per pair, or per set in Triples (not counted for 2 Players) |
| `style/<style>` | board style picked (pairs, triples, timed, duo, daily). Styles added 2026-11-16; earlier counts are all Pairs. Note the picker id for 2 Players is `duo` but its play/win suffix is `/2p`. |
| `timed/out/<id>[/small\|/big]` | a Timed board ran out of time |
| `done/new`, `done/close` | on the Well done card shown after a board is cleared: New board, or See board (closes the card). Added 2026-11-16. |
| `daily/streak/<n>` | a Daily streak grew to n days (n capped at 30) |
| `size/<size>` | board size picked (small, classic, big). Sizes added 2026-11-15; earlier play/win counts are all Classic. |
| `difficult/on`, `difficult/off` | Difficult mode (sounds only) switched. Names show by default. Before 2026-11-12 this was `easy/on`/`easy/off`, and `play`/`win` used an `/easy` suffix instead. |
| `demo/start/<id>` | Demo button tapped (auto-plays a board of the current deck) |
| `demo/done/<id>` | Demo finished the board |
| `demo/stop/<id>` | Demo stopped early (Stop demo, New board or a deck button) |
| `welcome/demo` | Show demo tapped on the Early preview note (then `demo/start/<id>` follows) |
| `yt/beta-unlocked` | Your music beta password entered |
| `yt/load/playlist`, `yt/load/links` | Your music songs loaded (the playlist itself is not sent) |
| `yt/win[/hard]` | Your music board cleared |
| `scores/open/info`, `scores/open/done`, `scores/open/best`, `scores/open/streak` | best scores screen opened from the info panel, the Well done card's All best scores, or by tapping the Best box (`streak` = the box while it shows the Daily streak or on 2 Players) (added 2026-11-16) |
| `scores/clear` | best scores cleared after the confirmation step |
| `info/open` | info panel opened |
| `notes/open/info`, `notes/open/welcome` | release notes opened from the info panel's What's new, or from All release notes on the New version note (added 2026-11-15) |
| `feedback` | Send feedback tapped |
| `analytics/off` | usage counts switched off (the last count sent) |

Each count also carries what GoatCounter collects for every hit: referrer, screen size, browser
and OS (from the User-Agent), and country or region from the IP (the IP itself isn't stored).
