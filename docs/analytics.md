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
| `deck/<id>` | a deck button tapped (animals, talk, quotes, jokes, wordplay, brain, melodies, notes, morse); `deck/youtube` = the Your music tile (web only) |
| `play/<id>[/small\|/big][/difficult]` | first pad tapped on a new board (`/small` or `/big` = board size, none = Classic 4x4; `/difficult` = sounds only, no names) |
| `win/<id>[/small\|/big][/difficult]` | board cleared |
| `perfect/<id>[/small\|/big]` | board cleared in one move per pair (6, 8 or 12) |
| `size/<size>` | board size picked (small, classic, big). Sizes added 2026-11-15; earlier play/win counts are all Classic. |
| `difficult/on`, `difficult/off` | Difficult mode (sounds only) switched. Names show by default. Before 2026-11-12 this was `easy/on`/`easy/off`, and `play`/`win` used an `/easy` suffix instead. |
| `demo/start/<id>` | Demo button tapped (auto-plays a board of the current deck) |
| `demo/done/<id>` | Demo finished the board |
| `demo/stop/<id>` | Demo stopped early (Stop demo, New board or a deck button) |
| `welcome/demo` | Show demo tapped on the Early preview note (then `demo/start/<id>` follows) |
| `yt/beta-unlocked` | Your music beta password entered |
| `yt/load/playlist`, `yt/load/links` | Your music songs loaded (the playlist itself is not sent) |
| `yt/win[/hard]` | Your music board cleared |
| `info/open` | info panel opened |
| `notes/open/info`, `notes/open/welcome` | release notes opened from the info panel's What's new, or from All release notes on the New version note (added 2026-11-15) |
| `feedback` | Send feedback tapped |
| `analytics/off` | usage counts switched off (the last count sent) |

Each count also carries what GoatCounter collects for every hit: referrer, screen size, browser
and OS (from the User-Agent), and country or region from the IP (the IP itself isn't stored).
