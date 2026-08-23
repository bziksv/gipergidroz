#!/usr/bin/env bash
set -euo pipefail

HOST="${DEPLOY_HOST:-vilmed}"
WEBROOT="/var/www/amplipuls_su_usr/data/www/gipergidroz.su"
REPO_DIR="_repo"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Build"
cd "$ROOT"
npm ci
npm run build

echo "==> Upload dist to $HOST:$WEBROOT"
TARBALL="$(mktemp /tmp/gipergidroz-dist.XXXXXX.tar.gz)"
trap 'rm -f "$TARBALL"' EXIT
tar czf "$TARBALL" -C dist .
scp "$TARBALL" "$HOST:/tmp/gipergidroz-dist.tar.gz"
ssh "$HOST" "rm -rf \
  $WEBROOT/docs/gipergidroz-cookies \
  $WEBROOT/docs/gipergidroz-personal-data \
  $WEBROOT/docs/gipergidroz-data-consent \
  $WEBROOT/docs/gipergidroz-recommendations \
  $WEBROOT/css/legal.css 2>/dev/null; \
  cd $WEBROOT && tar xzf /tmp/gipergidroz-dist.tar.gz && rm -f /tmp/gipergidroz-dist.tar.gz"

echo "==> Update git mirror on server"
ssh "$HOST" "bash -lc '
  set -e
  WEBROOT=$WEBROOT
  if [ -d $WEBROOT/$REPO_DIR/.git ]; then
    cd $WEBROOT/$REPO_DIR && git pull origin main
  else
    git clone https://github.com/bziksv/gipergidroz.git $WEBROOT/$REPO_DIR
  fi
'"

echo "==> Done: https://gipergidroz.su/"
