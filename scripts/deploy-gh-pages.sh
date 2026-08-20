#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
SITE_DIR="$ROOT"
DIST_DIR="$SITE_DIR/dist"
DISTRIBUTION_INPUT="${MAGPIE_DISTRIBUTION_REPO:-$ROOT/../magpie}"

cd "$SITE_DIR"

npm run build

main_js="$(awk -F'"' '/<script type="module" crossorigin src="\/assets\/.*\.js"/ { print $4; exit }' "$DIST_DIR/index.html")"
main_css="$(awk -F'"' '/<link rel="stylesheet" crossorigin href="\/assets\/.*\.css"/ { print $4; exit }' "$DIST_DIR/index.html")"
if [ -n "$main_js" ] && [ ! -f "$DIST_DIR/${main_js#/}" ]; then
  echo "Deploy aborted: missing referenced JS asset $main_js"
  exit 1
fi
if [ -n "$main_css" ] && [ ! -f "$DIST_DIR/${main_css#/}" ]; then
  echo "Deploy aborted: missing referenced CSS asset $main_css"
  exit 1
fi

if ! distribution_repo="$(git -C "$DISTRIBUTION_INPUT" rev-parse --show-toplevel 2>/dev/null)"; then
  echo "Distribution repository not found: $DISTRIBUTION_INPUT" >&2
  echo "Clone Magpie-Tools/magpie beside this repository or set MAGPIE_DISTRIBUTION_REPO." >&2
  exit 1
fi

publisher="$distribution_repo/scripts/publish-pages-artifact.sh"
if [ ! -f "$publisher" ]; then
  echo "Pages publisher not found: $publisher" >&2
  exit 1
fi

bash "$publisher" "$DIST_DIR" root "Deploy website"
