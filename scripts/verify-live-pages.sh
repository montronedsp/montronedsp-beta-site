#!/usr/bin/env bash
# Confirm the GitHub Pages CDN is serving this commit.
# Do not grep marketing copy: that goes stale and fails every deploy.
# Do not `echo "$html" | grep -q` under pipefail: grep -q closes the pipe
# early and echo SIGPIPEs, so the check is always false.
set -euo pipefail

SITE="${LIVE_SITE_URL:-https://www.montronedsp.com}"
EXPECTED="${EXPECTED_SHA:-${GITHUB_SHA:?EXPECTED_SHA or GITHUB_SHA is required}}"
ATTEMPTS="${VERIFY_ATTEMPTS:-24}"
SLEEP_SECONDS="${VERIFY_SLEEP_SECONDS:-10}"

fetch() {
  local url="$1"
  local dest="$2"
  curl -fsSL --retry 3 --retry-delay 2 \
    -H 'Cache-Control: no-cache' \
    -H 'Pragma: no-cache' \
    -o "$dest" \
    "${url}?nocache=${EXPECTED}"
}

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

echo "Waiting for ${SITE} to serve deploy SHA ${EXPECTED}"

for attempt in $(seq 1 "$ATTEMPTS"); do
  if fetch "${SITE}/deploy-sha.txt" "${tmp}/deploy-sha.txt"; then
    live="$(tr -d '[:space:]' < "${tmp}/deploy-sha.txt")"
    if [[ "$live" == "$EXPECTED" ]]; then
      echo "Live deploy SHA matches on attempt ${attempt}/${ATTEMPTS}."

      fetch "${SITE}/" "${tmp}/index.html"
      fetch "${SITE}/about.html" "${tmp}/about.html"

      grep -F -q 'MontroneDSP' "${tmp}/index.html"
      grep -F -q '<title>' "${tmp}/index.html"
      grep -F -q 'MontroneDSP' "${tmp}/about.html"

      echo "Live site is serving this commit."
      exit 0
    fi
    echo "Attempt ${attempt}/${ATTEMPTS}: deploy-sha.txt is ${live:-empty}, expected ${EXPECTED}"
  else
    echo "Attempt ${attempt}/${ATTEMPTS}: deploy-sha.txt not reachable yet"
  fi
  sleep "$SLEEP_SECONDS"
done

echo "Pages did not publish commit ${EXPECTED} within timeout."
exit 1
