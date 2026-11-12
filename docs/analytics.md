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
set `GOATCOUNTER_CODE = ''`. Only `pairody.app` sends counts.

## What is counted

| Event | When |
| --- | --- |
| page view (`/`, `/youtube.html`) | each page load |
| `launch/installed-app`, `launch/browser` | each page load, by how Pairody was opened |
| `install` | installed to the home screen (Chrome, Edge, Android) |
| `deck/<id>` | a deck button tapped (animals, quotes, notes) |
| `play/<id>[/easy]` | first pad tapped on a new board |
| `win/<id>[/easy]` | board cleared |
| `perfect/<id>` | board cleared in 8 moves |
| `easy/on`, `easy/off` | Easy mode switched |
| `demo/start` | Demo button tapped (auto-plays an Animals board) |
| `demo/done` | Demo finished the board |
| `demo/stop` | Demo stopped early (Stop demo, New board or a deck button) |
| `yt/beta-unlocked` | Your music beta password entered |
| `yt/load/playlist`, `yt/load/links` | Your music songs loaded (the playlist itself is not sent) |
| `yt/win[/hard]` | Your music board cleared |
| `info/open` | info panel opened |
| `feedback` | Send feedback tapped |
| `analytics/off` | usage counts switched off (the last count sent) |

Each count also carries what GoatCounter collects for every hit: referrer, screen size, browser
and OS (from the User-Agent), and country or region from the IP (the IP itself isn't stored).
