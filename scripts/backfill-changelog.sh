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

echo "Action:"
echo "  1) Backfill changelog for a spec"
echo "  2) Delete all changelogs"
read -rp "Choice [1/2]: " ACTION

if [ "$ACTION" = "2" ]; then
  read -rp "Are you sure you want to delete ALL changelogs? [y/N]: " CONFIRM
  if [[ "${CONFIRM,,}" != "y" ]]; then
    echo "Cancelled."
    pause; exit 0
  fi

  echo "Deleting all changelogs..."
  echo "Target: $RAILWAY_URL"

  RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$RAILWAY_URL/api/admin/changelogs" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_SECRET")

  BODY=$(echo "$RESPONSE" | head -n -1)
  STATUS=$(echo "$RESPONSE" | tail -n 1)

  echo "Status: $STATUS"
  echo "Response: $BODY"

  if [ "$STATUS" -ge 200 ] && [ "$STATUS" -lt 300 ]; then
    echo "Done."
  else
    echo "Error: request failed." >&2
  fi
  pause; exit 0
fi

read -rp "Spec name (e.g. warrior_arms): " SPEC
if [ -z "$SPEC" ]; then
  echo "Error: spec name cannot be empty." >&2
  pause; exit 1
fi

echo "Backfilling changelog for: $SPEC"
echo "Target: $RAILWAY_URL"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$RAILWAY_URL/api/admin/backfill-changelog" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_SECRET" \
  -d "{\"spec\":\"$SPEC\"}")

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
