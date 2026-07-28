#!/usr/bin/env bash
# ==========================================================================
# deploy.sh — Build and push to GitHub Pages
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh "Deploy my-map v1.0"
#
# Prerequisites:
#   - A git repository with a remote named 'origin'
#   - The 'gh-pages' branch is set as the GitHub Pages source
# ==========================================================================

set -euo pipefail

COMMIT_MSG="${1:-Deploy my-map}"

echo "🔨 Building project..."
npm run build

echo "📁 Preparing gh-pages branch..."
cd dist

# Create an empty git repo inside dist/
git init
git checkout -b gh-pages

git add -A
git commit -m "$COMMIT_MSG"

echo "🚀 Pushing to gh-pages..."
# Force-push to the gh-pages branch on origin
git push -f git@github.com:$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/').git gh-pages

cd ..
echo "✅ Deployed! Your site should be live at https://<username>.github.io/<repo>/"
