#!/usr/bin/env bash
set -e

AUTH_FILE="tests/e2e/.auth/user.json"

if [ ! -f "$AUTH_FILE" ]; then
  echo ""
  echo "╔══════════════════════════════════════════════════╗"
  echo "║  No session found. Running auth setup...         ║"
  echo "║  A browser will open — log in with Google.       ║"
  echo "╚══════════════════════════════════════════════════╝"
  echo ""
  bunx playwright test --project=setup --headed

  if [ ! -f "$AUTH_FILE" ]; then
    echo ""
    echo "✗ Setup failed — session not saved."
    exit 1
  fi

  echo ""
  echo "✓ Session saved. Running full test suite..."
  echo ""
fi

exec bunx playwright test "$@"
