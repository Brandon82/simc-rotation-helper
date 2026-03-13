#!/usr/bin/env bash
set -e

pause() {
  read -rp "Press any key to exit..." -n1
  echo
}

read -rp "Railway URL: " RAILWAY_URL
if [ -z "$RAILWAY_URL" ]; then
  echo "Error: Railway URL cannot be empty." >&2
  pause; exit 1
fi

read -rsp "Admin secret: " ADMIN_SECRET
echo

if [ -z "$ADMIN_SECRET" ]; then
  echo "Error: admin secret cannot be empty." >&2
  pause; exit 1
fi

# Prompt for spec type
echo "Refresh type:"
echo "  1) all"
echo "  2) specific spec"
read -rp "Choice [1/2]: " CHOICE

if [ "$CHOICE" = "2" ]; then
  read -rp "Spec name (e.g. warrior_arms): " SPEC
  if [ -z "$SPEC" ]; then
    echo "Error: spec name cannot be empty." >&2
    pause; exit 1
  fi
else
  SPEC="all"
fi

read -rp "Force regenerate (skip SHA check)? [y/N]: " FORCE_ANSWER
if [[ "${FORCE_ANSWER,,}" == "y" ]]; then
  FORCE="true"
else
  FORCE="false"
fi

echo "Refreshing guides for spec: $SPEC (force=$FORCE)"
echo "Target: $RAILWAY_URL"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$RAILWAY_URL/api/admin/refresh" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_SECRET" \
  -d "{\"spec\":\"$SPEC\",\"force\":$FORCE}")

BODY=$(echo "$RESPONSE" | head -n -1)
STATUS=$(echo "$RESPONSE" | tail -n 1)

echo "Status: $STATUS"
echo "Response: $BODY"

if [ "$STATUS" -ge 200 ] && [ "$STATUS" -lt 300 ]; then
  echo "Done."
else
  echo "Error: request failed." >&2
fi

pause
