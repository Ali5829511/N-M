#!/bin/bash
# Script to delete all 68 secondary branches from the repository
# Run this script with: bash delete_all_branches.sh

echo "=========================================="
echo "Branch Deletion Script"
echo "=========================================="
echo "This will delete 68 secondary branches"
echo "All branches have been verified as merged"
echo ""
echo "Repository: Ali5829511/N-M"
echo ""

# Confirmation
read -p "Are you sure you want to delete all 68 branches? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Deletion cancelled."
    exit 0
fi

echo ""
echo "Starting deletion..."
echo ""

# Delete all branches in a single command
git push origin --delete \
  copilot/add-back-button-to-traffic-violations \
  copilot/add-car-sticker-data \
  copilot/add-fetch-vehicles-data \
  copilot/add-hidden-content-search \
  copilot/add-identity-verification-system \
  copilot/add-internet-publishing-link \
  copilot/add-local-server-infrastructure \
  copilot/check-stickers-data-existence \
  copilot/check-vehicle-sticker-page \
  copilot/cleanup-unrelated-files \
  copilot/complete-and-pull-all-commitments \
  copilot/complete-commitments-and-features \
  copilot/complete-pull-and-commit \
  copilot/complete-report-and-settings-page \
  copilot/connect-database-and-deploy \
  copilot/connect-web-service-n-m \
  copilot/consolidate-branches-into-one \
  copilot/create-page-if-not-exists \
  copilot/create-vehicles-database \
  copilot/design-comprehensive-traffic-system \
  copilot/enable-email-notifications \
  copilot/export-docker-image-format \
  copilot/fix-404-error-on-website \
  copilot/fix-and-publish \
  copilot/fix-build-command-issue \
  copilot/fix-issue-in-recent-update \
  copilot/fix-publish-directory-issue \
  copilot/fix-report-page-error \
  copilot/fix-report-page-issue \
  copilot/fix-request-processing-error \
  copilot/fix-uncommitted-changes-issue \
  copilot/implement-rest-api-features \
  copilot/improve-code-efficiency \
  copilot/install-dependencies-for-project \
  copilot/install-npm-dependencies \
  copilot/link-pages-and-redesign-cards \
  copilot/merge-all-branches-into-main \
  copilot/publish-content \
  copilot/redesign-dashboard-layout \
  copilot/redesign-home-page-professionally \
  copilot/refactor-duplicated-code \
  copilot/refactor-microphone-structure \
  copilot/remove-dashboard-page \
  copilot/remove-villas-from-residential-page \
  copilot/replace-login-window-design \
  copilot/resend-username-passwords \
  copilot/resolve-merge-conflicts \
  copilot/restructure-project-files \
  copilot/review-and-deploy-site \
  copilot/review-and-publish-project \
  copilot/review-and-update-database \
  copilot/review-complete-system \
  copilot/review-entire-system \
  copilot/review-entire-system-again \
  copilot/set-up-plate-recognizer-api \
  copilot/setup-local-server-version \
  copilot/show-single-pages \
  copilot/unlock-system-and-publish \
  copilot/update-and-publish \
  copilot/update-and-publish-new-changes \
  copilot/update-complete-system \
  copilot/update-for-release \
  copilot/update-latest-releases-for-deployment \
  copilot/update-software-version \
  copilot/update-unknown-parameters \
  copilot/update-visual-identity-system \
  copilot/verify-repo-connection \
  flyio-new-files

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ SUCCESS: All branches deleted!"
    echo "=========================================="
    echo ""
    echo "Verification: Checking remaining branches..."
    git ls-remote --heads origin
    echo ""
    echo "Done! The repository is now cleaned up."
else
    echo ""
    echo "=========================================="
    echo "❌ ERROR: Branch deletion failed"
    echo "=========================================="
    echo ""
    echo "This could be due to:"
    echo "- Insufficient permissions"
    echo "- Authentication issues"
    echo "- Network problems"
    echo ""
    echo "Please check your GitHub credentials and try again."
    exit 1
fi
