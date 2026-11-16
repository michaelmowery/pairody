#!/bin/sh
# Builds app-www/, the copy of the site that goes inside the iOS app (Capacitor's webDir).
# The website itself has no build step; this only runs for the app:
#   npm run app:ios     build, copy into the Xcode project, open Xcode
#   npm run app:sync    build and copy only
# What changes from the website:
#   - only game files go in (no repo, hosting, docs or native project files),
#   - youtube.html (Your music beta) stays out: the app is the sound decks only,
#   - sw.js stays out: the app ships its files, so there is no offline cache or update check,
#   - the copy's version is stamped from package.json ("1.0.0"), so the info panel and
#     feedback emails say which App Store build someone has. The repo's STAMP line is untouched.
set -e
cd "$(dirname "$0")/.."
OUT=app-www
VERSION=$(node -p "require('./package.json').version")

rm -rf "$OUT"
mkdir -p "$OUT"
cp index.html privacy.html manifest.webmanifest favicon.ico apple-touch-icon.png "$OUT"/
cp -R assets sounds "$OUT"/
rm -f "$OUT"/sounds/*.md "$OUT"/assets/og-image.png

sed -i.bak -E "s|^  const STAMP = '[^']*';|  const STAMP = '${VERSION}';|" "$OUT"/assets/update.js
rm -f "$OUT"/assets/update.js.bak
grep -q "^  const STAMP = '${VERSION}';" "$OUT"/assets/update.js

echo "Built $OUT for the app (version $VERSION)"
