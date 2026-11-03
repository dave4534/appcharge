#!/usr/bin/env bash
# Copies the Mondave design system (components, tokens, Appcharge theme) into
# src/design-system. Run after the design system changes.
set -euo pipefail
DS="${MONDAVE_DIR:-$HOME/Documents/daves-workspace/Work/AI Code Projects/Design System/app}"
cd "$(dirname "$0")/.."
rsync -a --delete --exclude='*.stories.tsx' --exclude='*.mdx' "$DS/src/components/" src/design-system/components/
rsync -a --delete "$DS/src/styles/generated" "$DS/src/styles/themes" src/design-system/styles/
echo "Synced design system from $DS"
