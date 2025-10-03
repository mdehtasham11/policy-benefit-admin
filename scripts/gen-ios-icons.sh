#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APPICON_DIR="$ROOT/ios/Policybenefit/Images.xcassets/AppIcon.appiconset"
MASTER="$ROOT/ios/appicon-master.png"

if [ ! -f "$MASTER" ]; then
  echo "error: Missing $MASTER (1024x1024 PNG, no alpha)."
  exit 1
fi

mkdir -p "$APPICON_DIR"

gen () { sips -z "$2" "$2" "$MASTER" --out "$APPICON_DIR/$1" >/dev/null; }

# iPhone
gen iphone-notification-20@2x.png 40
gen iphone-notification-20@3x.png 60

gen iphone-settings-29@2x.png 58
gen iphone-settings-29@3x.png 87

gen iphone-spotlight-40@2x.png 80
gen iphone-spotlight-40@3x.png 120

gen iphone-app-60@2x.png 120   # <- REQUIRED 120x120
gen iphone-app-60@3x.png 180

# iPad
gen ipad-notification-20@1x.png 20
gen ipad-notification-20@2x.png 40

gen ipad-settings-29@1x.png 29
gen ipad-settings-29@2x.png 58

gen ipad-spotlight-40@1x.png 40
gen ipad-spotlight-40@2x.png 80

gen ipad-app-76@1x.png 76
gen ipad-app-76@2x.png 152

gen ipad-pro-app-83.5@2x.png 167

# App Store marketing icon
cp -f "$MASTER" "$APPICON_DIR/app-store-1024.png"

# Contents.json
cat > "$APPICON_DIR/Contents.json" <<'JSON'
{
  "images": [
    { "idiom": "iphone", "size": "20x20", "scale": "2x", "filename": "iphone-notification-20@2x.png" },
    { "idiom": "iphone", "size": "20x20", "scale": "3x", "filename": "iphone-notification-20@3x.png" },
    { "idiom": "iphone", "size": "29x29", "scale": "2x", "filename": "iphone-settings-29@2x.png" },
    { "idiom": "iphone", "size": "29x29", "scale": "3x", "filename": "iphone-settings-29@3x.png" },
    { "idiom": "iphone", "size": "40x40", "scale": "2x", "filename": "iphone-spotlight-40@2x.png" },
    { "idiom": "iphone", "size": "40x40", "scale": "3x", "filename": "iphone-spotlight-40@3x.png" },
    { "idiom": "iphone", "size": "60x60", "scale": "2x", "filename": "iphone-app-60@2x.png" },
    { "idiom": "iphone", "size": "60x60", "scale": "3x", "filename": "iphone-app-60@3x.png" },
    { "idiom": "ipad", "size": "20x20", "scale": "1x", "filename": "ipad-notification-20@1x.png" },
    { "idiom": "ipad", "size": "20x20", "scale": "2x", "filename": "ipad-notification-20@2x.png" },
    { "idiom": "ipad", "size": "29x29", "scale": "1x", "filename": "ipad-settings-29@1x.png" },
    { "idiom": "ipad", "size": "29x29", "scale": "2x", "filename": "ipad-settings-29@2x.png" },
    { "idiom": "ipad", "size": "40x40", "scale": "1x", "filename": "ipad-spotlight-40@1x.png" },
    { "idiom": "ipad", "size": "40x40", "scale": "2x", "filename": "ipad-spotlight-40@2x.png" },
    { "idiom": "ipad", "size": "76x76", "scale": "1x", "filename": "ipad-app-76@1x.png" },
    { "idiom": "ipad", "size": "76x76", "scale": "2x", "filename": "ipad-app-76@2x.png" },
    { "idiom": "ipad", "size": "83.5x83.5", "scale": "2x", "filename": "ipad-pro-app-83.5@2x.png" },
    { "idiom": "ios-marketing", "size": "1024x1024", "scale": "1x", "filename": "app-store-1024.png" }
  ],
  "info": { "version": 1, "author": "xcode" }
}
JSON

echo "✅ Generated icons in $APPICON_DIR"
