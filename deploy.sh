#!/bin/bash
set -e

echo "Building BatteryGuard AI for web..."
npx expo export --platform web

echo "Fixing asset paths for GitHub Pages..."
sed -i '' 's|href="/favicon.ico"|href="/batteryguard/favicon.ico"|g' dist/index.html
sed -i '' 's|src="/_expo/|src="/batteryguard/_expo/|g' dist/index.html
touch dist/.nojekyll

echo "Deploying to GitHub Pages..."
npx gh-pages -d dist

echo "Done! Visit https://bkessch-hue.github.io/batteryguard/"
