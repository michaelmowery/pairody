# Pairody on the App Store (iOS)

The iPhone/iPad app wraps the same game files with [Capacitor](https://capacitorjs.com) 8, as the
Noodlit README plans for Noodlit. The website still has no build step and deploys exactly as
before; nothing here changes pairody.app.

## What's in the repo

| Path | What it is |
| --- | --- |
| `package.json` | Capacitor packages and the `app:*` scripts. Its `version` is the app version shown in the info panel. |
| `capacitor.config.json` | App id `app.pairody`, name, web folder (`app-www`). |
| `scripts/build-app.sh` | Builds `app-www/`: the game files only, no `youtube.html` (Your music beta), no `sw.js`, version stamped from `package.json`. |
| `ios/` | The Xcode project (Swift Package Manager, no CocoaPods). Icon, navy splash, silent-switch audio and the export-compliance flag are already set. |
| `assets/native.js` | Detects the app and adds `class="native"` to `<html>`. `.web-only` / `.native-only` in the HTML pick what shows where. |
| `privacy.html` | Privacy policy, served at https://pairody.app/privacy.html (needed for the App Store listing). |

The deploy workflow drops `ios/`, `scripts/`, `package*.json` and `capacitor.config.json` before
publishing, so they are never served or cached offline.

How the app differs from the website:
- Sound decks only: the Your music (YouTube) beta and the Sounds / Your music tabs are hidden.
- No service worker and no "Check for updates": updates come through the App Store.
- No "early preview" wording (Apple rejects apps that call themselves a beta or preview).
- Pads play with the ring/silent switch on (`AppDelegate.swift` sets the audio session to playback).
- Usage counts still go to GoatCounter (boards, sizes, styles, players, wins, Daily, and so on),
  tagged so they don't mix with the website's: events start with `ios/` and page views with
  `/app`. The Anonymous usage counts switch in the info panel turns them off. See `docs/analytics.md`.

## One-time setup on the Mac (Wison)

1. Install Xcode from the Mac App Store, open it once, and accept the license.
2. Install Node.js 20+ (`brew install node`, or from nodejs.org).
3. `git clone https://github.com/michaelmowery/pairody && cd pairody && npm install`
4. `npm run app:ios`. This builds `app-www/`, copies it into the Xcode project and opens Xcode.
5. In Xcode, select the **App** target, then **Signing & Capabilities**: tick *Automatically manage
   signing* and pick your team (Mount M Technologies, the same team as Noodlit).
6. Pick a simulator or your iPhone and press Run. Play a board with the phone on silent to check sound.

## Ship a build

1. In [App Store Connect](https://appstoreconnect.apple.com): **Apps → + → New App**. Platform iOS,
   name **Pairody**, language English (U.S.), bundle ID **app.pairody** (register it first under
   Certificates, Identifiers & Profiles if it isn't listed), SKU `pairody-ios`.
2. In Xcode: set the run destination to **Any iOS Device (arm64)**, then **Product → Archive**.
3. In the Organizer: **Distribute App → App Store Connect → Upload**.
4. Optional: try it through TestFlight first.
5. Fill in the listing (below), attach the build, and **Submit for Review**.

For each later release: `git pull`, bump `version` in `package.json` and *Version* / *Build* in
Xcode (App target → General), `npm run app:sync`, then Archive and upload again.

## Listing copy (ready to paste)

- **Name:** Pairody
- **Subtitle (30):** Memory match, played by ear
- **Category:** Games, secondary Puzzle (or Family)
- **Price:** Free. No in-app purchases.
- **Age rating:** 4+ (answer "None" to every content question)
- **Privacy policy URL:** https://pairody.app/privacy.html
- **Support URL:** https://pairody.app
- **Marketing URL:** https://pairody.app
- **Copyright:** 2026 Mount M Technologies, LLC
- **Keywords (100):** memory,match,concentration,sound,ear,listening,animal sounds,brain,music,morse,kids,pairs
- **Promotional text:** Twenty-one decks of sounds to match by ear: animal calls, everyday sounds, instruments, quotes, tongue twisters, old tunes and more.
- **Description:**

  > Pairody is the classic memory match game, played by ear. Every card is a sound. Flip one,
  > listen, then find its twin.
  >
  > Twenty-one decks, each a little different:
  > • Animals: real recordings, from a cat's meow to an elephant's trumpet
  > • Animal Talk: match each animal's name to its call
  > • Everyday Sounds: doorbells, kettles, sirens and more
  > • Instruments: the same tune on piano, guitar, flute and more
  > • Seasonal: Halloween, holiday, spring and summer sounds that change with the calendar
  > • Quotes: the start of a famous line and its ending
  > • Jokes: a riddle and its punchline
  > • Tongue Twisters: the start of a twister and its ending
  > • Say Hello: hello in 20+ languages, matched to the language
  > • Rhymes: a word and its rhyme
  > • Opposites: a word and its opposite
  > • Capitals: countries and their capitals
  > • Times Tables: a sum and its answer
  > • Melodies: the two halves of an old tune
  > • Notes: ear training
  > • Phone Keypad: keys and their dial tones
  > • Morse Code: letters and their beeps
  >
  > Pick Small, Classic or Big boards. Names show on each pad while it plays, so kids can jump
  > right in; turn on Difficult mode for sounds only. Your best score for every deck and size is
  > saved on your device, and Demo shows you how it's done.
  >
  > Free, with no ads and no accounts.

- **App Privacy (nutrition label):** answer *Yes, we collect data*, then tick only
  *Usage Data → Product Interaction*. For it: **not linked to the user's identity**, **not used
  for tracking**, purpose **Analytics** only. Nothing else is collected (no contact info, no
  identifiers, no diagnostics). GoatCounter sets no cookies or device IDs and keeps no profile,
  so no App Tracking Transparency prompt is needed and `NSUserTrackingUsageDescription` stays out
  of `Info.plist`. Players can switch counts off in the info panel (Privacy).
- **Export compliance:** already answered in `Info.plist` (`ITSAppUsesNonExemptEncryption = NO`).
- **Review notes:** "Pairody is a memory game where every card is a sound. Turn the volume up,
  pick a deck and tap two pads to find matching sounds. No login is needed."

### Screenshots

App Store Connect needs 6.9" iPhone screenshots (1320 × 2868 or 1290 × 2796). iPad screenshots
(13", 2064 × 2752) are needed too because the app runs on iPad. The easiest way: run the iPhone
16 Pro Max and iPad Pro 13" simulators and press ⌘S on a few screens (a board mid-game, the
deck picker, a cleared board).
