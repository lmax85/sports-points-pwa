#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing env file: $ENV_FILE"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

: "${VERCEL_TOKEN:?VERCEL_TOKEN is required in $ENV_FILE}"
: "${VERCEL_SCOPE:?VERCEL_SCOPE is required in $ENV_FILE}"

npx vercel --prod --token "$VERCEL_TOKEN" --scope "$VERCEL_SCOPE"
