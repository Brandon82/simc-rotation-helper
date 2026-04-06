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
echo "  1) Create a new QA key"
echo "  2) List existing QA keys"
echo "  3) Revoke a QA key"
read -rp "Choice [1/2/3]: " ACTION

if [ "$ACTION" = "2" ]; then
  echo "Fetching QA keys..."
  RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$RAILWAY_URL/api/admin/qa-keys" \
    -H "Authorization: Bearer $ADMIN_SECRET")
  BODY=$(echo "$RESPONSE" | head -n -1)
  STATUS=$(echo "$RESPONSE" | tail -n 1)
  echo "Status: $STATUS"
  echo "Response: $BODY"
  pause; exit 0
fi

if [ "$ACTION" = "3" ]; then
  read -rp "Key ID to revoke: " KEY_ID
  if [ -z "$KEY_ID" ]; then
    echo "Error: key ID cannot be empty." >&2
    pause; exit 1
  fi
  echo "Revoking key: $KEY_ID"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$RAILWAY_URL/api/admin/qa-keys/$KEY_ID" \
    -H "Authorization: Bearer $ADMIN_SECRET")
  BODY=$(echo "$RESPONSE" | head -n -1)
  STATUS=$(echo "$RESPONSE" | tail -n 1)
  echo "Status: $STATUS"
  echo "Response: $BODY"
  if [ "$STATUS" -ge 200 ] && [ "$STATUS" -lt 300 ]; then
    echo "Key revoked."
  else
    echo "Error: request failed." >&2
  fi
  pause; exit 0
fi

# Default: create a new key
read -rp "Label (e.g. Brandon): " LABEL
if [ -z "$LABEL" ]; then
  echo "Error: label cannot be empty." >&2
  pause; exit 1
fi

echo "Creating QA key for \"$LABEL\"..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$RAILWAY_URL/api/admin/qa-keys" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_SECRET" \
  -d "{\"label\":\"$LABEL\"}")

BODY=$(echo "$RESPONSE" | head -n -1)
STATUS=$(echo "$RESPONSE" | tail -n 1)

echo "Status: $STATUS"

if [ "$STATUS" -ge 200 ] && [ "$STATUS" -lt 300 ]; then
  echo "Response: $BODY"
  echo ""
  echo "Enter the apiKey value in the Ask AI panel on any spec guide page."
else
  echo "Error: request failed." >&2
  echo "Response: $BODY"
fi

pause
