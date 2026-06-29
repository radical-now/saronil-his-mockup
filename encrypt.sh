#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if [[ -f .staticrypt-password ]]; then
  export STATICRYPT_PASSWORD="$(tr -d '\n' < .staticrypt-password)"
elif [[ -z "${STATICRYPT_PASSWORD:-}" ]]; then
  echo "Set STATICRYPT_PASSWORD or create .staticrypt-password with your site password." >&2
  exit 1
fi

staticrypt source.html -p "$STATICRYPT_PASSWORD" --template "$ROOT/staticrypt-template.html"
rm -f index.html
mv encrypted/source.html index.html
rmdir encrypted 2>/dev/null || rm -rf encrypted

echo "Encrypted index.html updated."
