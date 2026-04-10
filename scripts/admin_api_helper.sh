#!/usr/bin/env bash
set -e

pause() {
  read -rp "Press any key to exit..." -n1
  echo
}

# ── Shared: collect credentials ──────────────────────────────

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

# ── Helper: curl wrapper that prints status + response ───────

api_call() {
  local METHOD="$1" ENDPOINT="$2" BODY="$3"

  local CURL_ARGS=(-s -w "\n%{http_code}" -X "$METHOD"
    "$RAILWAY_URL$ENDPOINT"
    -H "Content-Type: application/json"
    -H "Authorization: Bearer $ADMIN_SECRET")

  if [ -n "$BODY" ]; then
    CURL_ARGS+=(-d "$BODY")
  fi

  RESPONSE=$(curl "${CURL_ARGS[@]}")
  RESP_BODY=$(echo "$RESPONSE" | head -n -1)
  RESP_STATUS=$(echo "$RESPONSE" | tail -n 1)

  echo "Status: $RESP_STATUS"
  echo "Response: $RESP_BODY"

  if [ "$RESP_STATUS" -ge 200 ] && [ "$RESP_STATUS" -lt 300 ]; then
    return 0
  else
    echo "Error: request failed." >&2
    return 1
  fi
}

# ── Actions ──────────────────────────────────────────────────

do_refresh_guides() {
  echo ""
  echo "Refresh type:"
  echo "  1) all"
  echo "  2) specific spec"
  echo "  3) multiple specs (parallel)"
  echo "  4) all specs for a class (parallel)"
  read -rp "Choice [1/2/3/4]: " CHOICE

  local SPEC_JSON="" CLASS_JSON="" LABEL=""

  if [ "$CHOICE" = "2" ]; then
    read -rp "Spec name (e.g. warrior_arms): " SPEC
    if [ -z "$SPEC" ]; then
      echo "Error: spec name cannot be empty." >&2; return 1
    fi
    SPEC_JSON="\"$SPEC\""
    LABEL="$SPEC"
  elif [ "$CHOICE" = "4" ]; then
    read -rp "Class name (e.g. warrior): " CLASS_INPUT
    if [ -z "$CLASS_INPUT" ]; then
      echo "Error: class name cannot be empty." >&2; return 1
    fi
    CLASS_JSON="\"$CLASS_INPUT\""
    LABEL="class:$CLASS_INPUT"
  elif [ "$CHOICE" = "3" ]; then
    read -rp "Spec names comma-separated, or 'all' (e.g. warrior_arms,mage_fire): " SPEC_INPUT
    if [ -z "$SPEC_INPUT" ]; then
      echo "Error: spec list cannot be empty." >&2; return 1
    fi
    if [ "$SPEC_INPUT" = "all" ]; then
      SPEC_JSON="\"all\""
      LABEL="all"
    else
      SPEC_JSON=$(echo "$SPEC_INPUT" | awk -F',' '{
        printf "[";
        for (i=1;i<=NF;i++) {
          gsub(/^[ \t]+|[ \t]+$/, "", $i);
          printf "\"%s\"", $i;
          if (i<NF) printf ",";
        }
        printf "]"
      }')
      LABEL="multiple"
    fi
  else
    SPEC_JSON="\"all\""
    LABEL="all"
  fi

  read -rp "Force regenerate (skip SHA check)? [y/N]: " FORCE_ANSWER
  local FORCE="false"
  if [[ "${FORCE_ANSWER,,}" == "y" ]]; then FORCE="true"; fi

  local BODY_JSON
  if [ -n "$CLASS_JSON" ]; then
    BODY_JSON="{\"class\":$CLASS_JSON,\"force\":$FORCE}"
  else
    BODY_JSON="{\"spec\":$SPEC_JSON,\"force\":$FORCE}"
  fi

  echo "Refreshing guides for: $LABEL (force=$FORCE)"
  echo "Target: $RAILWAY_URL"
  api_call POST /api/admin/refresh "$BODY_JSON"
}

do_delete_old_guides() {
  read -rp "Spec name to purge (or leave blank for all specs): " PURGE_SPEC

  local BODY="{}"
  if [ -n "$PURGE_SPEC" ]; then
    BODY="{\"spec\":\"$PURGE_SPEC\"}"
    echo "Deleting old guides for spec: $PURGE_SPEC"
  else
    echo "Deleting old guides for all specs"
  fi

  echo "Target: $RAILWAY_URL"
  api_call DELETE /api/admin/guides/history "$BODY"
}

do_backfill_changelog() {
  echo ""
  echo "Scope:"
  echo "  1) Specific spec"
  echo "  2) All specs"
  read -rp "Choice [1/2]: " SCOPE

  local SPEC
  if [ "$SCOPE" = "2" ]; then
    SPEC="all"
  else
    read -rp "Spec name (e.g. warrior_arms): " SPEC
    if [ -z "$SPEC" ]; then
      echo "Error: spec name cannot be empty." >&2; return 1
    fi
  fi

  echo ""
  echo "Mode:"
  echo "  1) Current guide only"
  echo "  2) All guides in history"
  read -rp "Choice [1/2]: " MODE_CHOICE

  local MODE="current"
  if [ "$MODE_CHOICE" = "2" ]; then MODE="all"; fi

  echo "Backfilling changelog for: $SPEC (mode=$MODE)"
  echo "Target: $RAILWAY_URL"
  api_call POST /api/admin/backfill-changelog "{\"spec\":\"$SPEC\",\"mode\":\"$MODE\"}"
}

do_delete_changelogs() {
  read -rp "Are you sure you want to delete ALL changelogs? [y/N]: " CONFIRM
  if [[ "${CONFIRM,,}" != "y" ]]; then
    echo "Cancelled."; return 0
  fi

  echo "Deleting all changelogs..."
  echo "Target: $RAILWAY_URL"
  api_call DELETE /api/admin/changelogs
}

do_create_qa_key() {
  read -rp "Label (e.g. Brandon): " LABEL
  if [ -z "$LABEL" ]; then
    echo "Error: label cannot be empty." >&2; return 1
  fi

  echo "Creating QA key for \"$LABEL\"..."
  if api_call POST /api/admin/qa-keys "{\"label\":\"$LABEL\"}"; then
    echo ""
    echo "Enter the apiKey value in the Ask AI panel on any spec guide page."
  fi
}

do_list_qa_keys() {
  echo "Fetching QA keys..."
  api_call GET /api/admin/qa-keys
}

do_revoke_qa_key() {
  read -rp "Key ID to revoke: " KEY_ID
  if [ -z "$KEY_ID" ]; then
    echo "Error: key ID cannot be empty." >&2; return 1
  fi

  echo "Revoking key: $KEY_ID"
  if api_call DELETE "/api/admin/qa-keys/$KEY_ID"; then
    echo "Key revoked."
  fi
}

# ── Main menu ────────────────────────────────────────────────

echo ""
echo "=== SimC Rotation Guides Admin ==="
echo ""
echo "Guides:"
echo "  1) Refresh guides"
echo "  2) Delete old (non-current) guides"
echo ""
echo "Changelogs:"
echo "  3) Backfill changelogs"
echo "  4) Delete all changelogs"
echo ""
echo "QA Keys:"
echo "  5) Create a QA key"
echo "  6) List QA keys"
echo "  7) Revoke a QA key"
echo ""
read -rp "Choice [1-7]: " MAIN_ACTION

case "$MAIN_ACTION" in
  1) do_refresh_guides ;;
  2) do_delete_old_guides ;;
  3) do_backfill_changelog ;;
  4) do_delete_changelogs ;;
  5) do_create_qa_key ;;
  6) do_list_qa_keys ;;
  7) do_revoke_qa_key ;;
  *) echo "Invalid choice." >&2 ;;
esac

echo ""
echo "Done."
pause
