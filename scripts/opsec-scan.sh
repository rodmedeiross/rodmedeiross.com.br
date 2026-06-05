#!/usr/bin/env bash
# OPSEC content guard.
# Fails if published content leaks internal infrastructure detail.
# Scans markdown under the given root (default: content/) for:
#   - RFC1918 private IPv4 addresses
#   - the internal domain
#   - Proxmox VMIDs
#   - common secret material (private keys, cloud/VCS tokens)
#
# Intentionally NOT flagged (allowed by policy): default service ports,
# hostnames (Kojima-themed), stack names, and the hardware table.
set -uo pipefail

ROOT="${1:-content}"

names=(
  "private IPv4 (RFC1918)"
  "internal domain"
  "Proxmox VMID"
  "private key block"
  "AWS access key"
  "GitHub token"
)
regexes=(
  '\b(10\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|192\.168\.[0-9]{1,3}\.[0-9]{1,3}|172\.(1[6-9]|2[0-9]|3[01])\.[0-9]{1,3}\.[0-9]{1,3})\b'
  'outerheaven'
  '\bVMID[ _-]*[0-9]+'
  'BEGIN [A-Z ]*PRIVATE KEY'
  '\bAKIA[0-9A-Z]{16}\b'
  '\bghp_[0-9A-Za-z]{36}\b'
)

found=0
for i in "${!regexes[@]}"; do
  hits=$(grep -rInE --include='*.md' -- "${regexes[$i]}" "$ROOT" 2>/dev/null || true)
  if [ -n "$hits" ]; then
    echo "::error::OPSEC guard: possible leak — ${names[$i]}"
    echo "$hits"
    echo ""
    found=1
  fi
done

if [ "$found" -ne 0 ]; then
  echo "OPSEC guard FAILED: remove the items above before publishing."
  echo "(default ports, hostnames and the hardware table are allowed by policy.)"
  exit 1
fi

echo "OPSEC guard: clean — no internal IPs / domains / VMIDs / secrets in ${ROOT}/."
