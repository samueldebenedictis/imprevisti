#!/usr/bin/env bash
# Copia tutti gli screenshot generati dai test Playwright nella cartella immagini della tesi.
# Scansiona tutte le sottocartelle di tests/e2e/snapshots/ e copia i .png in elaborato/immagini/screenshots/.

set -euo pipefail

SNAPSHOTS_DIR="tests/e2e/snapshots"
DEST_DIR="elaborato/immagini/screenshots"

if [ ! -d "$SNAPSHOTS_DIR" ]; then
  echo "Cartella snapshot non trovata: $SNAPSHOTS_DIR"
  exit 1
fi

mkdir -p "$DEST_DIR"

count=0
for src in "$SNAPSHOTS_DIR"/**/*.png "$SNAPSHOTS_DIR"/*.png; do
  [ -f "$src" ] || continue
  filename=$(basename "$src")
  dest_name="${filename/-chromium-linux/}"
  cp "$src" "$DEST_DIR/$dest_name"
  echo "  $filename → $DEST_DIR/$dest_name"
  ((++count))
done

echo ""
echo "Copiati $count screenshot in $DEST_DIR"
