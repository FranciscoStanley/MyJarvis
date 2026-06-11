#!/bin/sh
set -eu

npm config set fetch-retries 5
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000
npm config set maxsockets 2

max_attempts=5
attempt=1

while [ "$attempt" -le "$max_attempts" ]; do
  echo "npm install attempt ${attempt}/${max_attempts}..."
  if npm install "$@"; then
    exit 0
  fi
  if [ "$attempt" -eq "$max_attempts" ]; then
    echo "npm install failed after ${max_attempts} attempts"
    exit 1
  fi
  sleep $((attempt * 15))
  attempt=$((attempt + 1))
done
