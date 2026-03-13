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
echo "  3) multiple specs (parallel)"
echo "  4) all specs for a class (parallel)"
read -rp "Choice [1/2/3/4]: " CHOICE

if [ "$CHOICE" = "2" ]; then
  read -rp "Spec name (e.g. warrior_arms): " SPEC
  if [ -z "$SPEC" ]; then
    echo "Error: spec name cannot be empty." >&2
    pause; exit 1
  fi
  SPEC_JSON="\"$SPEC\""
  CLASS_JSON=""
elif [ "$CHOICE" = "4" ]; then
  read -rp "Class name (e.g. warrior): " CLASS_INPUT
  if [ -z "$CLASS_INPUT" ]; then
    echo "Error: class name cannot be empty." >&2
    pause; exit 1
  fi
  CLASS_JSON="\"$CLASS_INPUT\""
  SPEC="class:$CLASS_INPUT"
  SPEC_JSON=""
elif [ "$CHOICE" = "3" ]; then
  read -rp "Spec names comma-separated, or 'all' (e.g. warrior_arms,mage_fire): " SPEC_INPUT
  if [ -z "$SPEC_INPUT" ]; then
    echo "Error: spec list cannot be empty." >&2
    pause; exit 1
  fi
  CLASS_JSON=""
  if [ "$SPEC_INPUT" = "all" ]; then
    SPEC="all"
    SPEC_JSON="\"all\""
  else
    # Build a JSON array from the comma-separated input
    SPEC_JSON=$(echo "$SPEC_INPUT" | awk -F',' '{
      printf "[";
      for (i=1;i<=NF;i++) {
        gsub(/^[ \t]+|[ \t]+$/, "", $i);
        printf "\"%s\"", $i;
        if (i<NF) printf ",";
      }
      printf "]"
    }')
    SPEC="multiple"
  fi
else
  SPEC="all"
  SPEC_JSON="\"all\""
  CLASS_JSON=""
fi

read -rp "Force regenerate (skip SHA check)? [y/N]: " FORCE_ANSWER
if [[ "${FORCE_ANSWER,,}" == "y" ]]; then
  FORCE="true"
else
  FORCE="false"
fi

echo "Refreshing guides for spec: $SPEC (force=$FORCE)"
echo "Target: $RAILWAY_URL"

if [ -n "$CLASS_JSON" ]; then
  BODY_JSON="{\"class\":$CLASS_JSON,\"force\":$FORCE}"
else
  BODY_JSON="{\"spec\":$SPEC_JSON,\"force\":$FORCE}"
fi

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$RAILWAY_URL/api/admin/refresh" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_SECRET" \
  -d "$BODY_JSON")

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
