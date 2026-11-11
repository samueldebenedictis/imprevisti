#!/usr/bin/env bash
# Copia nella tesi (repository separato "elaborato") gli screenshot generati
# dai test Playwright, ma solo quelli che tesi.tex usa davvero.
#
# Uso: scripts/copy-screenshots.sh [cartella della tesi]
# Cartella predefinita: ../elaborato
#
# Regole:
# - si copiano solo gli screenshot citati in tesi.tex (\shot, \shotS, \shotH,
#   \storypanel, \includegraphics{immagini/screenshots/...});
# - se esiste la versione "-faces" di uno screenshot (fotografia FACES vera,
#   ignorata da git, vedi tests/e2e/video/face-photos.ts) si copia quella;
# - gli screenshot della sfida dei volti senza versione "-faces" non vengono
#   copiati, per non sostituire nella tesi la foto vera con il segnaposto;
# - i file identici vengono saltati;
# - alla fine un riepilogo, compresi gli screenshot della tesi non più usati
#   (solo elencati, non cancellati).

set -euo pipefail
shopt -s nullglob

SNAPSHOTS_DIR="tests/e2e/snapshots"
THESIS_DIR="${1:-../elaborato}"
TEX="$THESIS_DIR/tesi.tex"
DEST_DIR="$THESIS_DIR/immagini/screenshots"
FACE_PATTERN="face-emotion"
FACE_SUFFIX="-faces"

[ -d "$SNAPSHOTS_DIR" ] || { echo "Cartella snapshot non trovata: $SNAPSHOTS_DIR"; exit 1; }
[ -f "$TEX" ] || { echo "tesi.tex non trovato: $TEX"; exit 1; }
mkdir -p "$DEST_DIR"

# Nomi (senza .png) degli screenshot usati dalla tesi
mapfile -t used < <(
  grep -oE '\\(shot|shotS|shotH|storypanel)\{[^}#]+\}|immagini/screenshots/[A-Za-z0-9_-]+' "$TEX" |
    sed -E 's#.*[{/]##; s#\}$##' | sort -u
)

# Snapshot disponibili, con il nome usato nella tesi (senza -chromium-linux)
declare -A snapshot
for src in "$SNAPSHOTS_DIR"/*/*.png "$SNAPSHOTS_DIR"/*.png; do
  name=$(basename "$src" .png)
  snapshot["${name/-chromium-linux/}"]="$src"
done

copied=() unchanged=() placeholder_only=() missing=()
for name in "${used[@]}"; do
  dest="$DEST_DIR/$name.png"
  src="${snapshot[$name$FACE_SUFFIX]:-}"
  if [ -z "$src" ] && [[ "$name" == *"$FACE_PATTERN"* ]]; then
    placeholder_only+=("$name")
    continue
  fi
  [ -n "$src" ] || src="${snapshot[$name]:-}"
  if [ -z "$src" ]; then
    missing+=("$name")
    continue
  fi
  if [ -f "$dest" ] && cmp -s "$src" "$dest"; then
    unchanged+=("$name")
    continue
  fi
  cp "$src" "$dest"
  copied+=("$name")
done

unused=()
for file in "$DEST_DIR"/*.png; do
  name=$(basename "$file" .png)
  printf '%s\n' "${used[@]}" | grep -qxF "$name" || unused+=("$name")
done

list() { [ "$#" -gt 0 ] && printf '    %s\n' "$@"; return 0; }

echo "Screenshot usati dalla tesi: ${#used[@]}"
echo "  copiati: ${#copied[@]}"
list "${copied[@]}"
echo "  invariati: ${#unchanged[@]}"
echo "  sfida dei volti senza versione con foto vera (non copiati): ${#placeholder_only[@]}"
list "${placeholder_only[@]}"
echo "  senza snapshot: ${#missing[@]}"
list "${missing[@]}"
if [ "${#unused[@]}" -gt 0 ]; then
  echo "In $DEST_DIR ma non usati dalla tesi (non cancellati): ${#unused[@]}"
  list "${unused[@]}"
fi
