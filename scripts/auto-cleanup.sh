#!/bin/bash

###############################################################################
# Automated Branch Cleanup - تنظيف الفروع التلقائي
# Executes the branch cleanup as requested by the user
###############################################################################

echo "=========================================="
echo "🚀 Automated Branch Cleanup"
echo "=========================================="
echo ""

# Create local backup tag
BACKUP_TAG="backup-before-cleanup-$(date +%Y%m%d-%H%M%S)"
echo "📦 Creating backup tag: $BACKUP_TAG"
git tag -a "$BACKUP_TAG" -m "Backup before automated branch cleanup" 2>/dev/null || true
echo "✅ Backup tag created locally"
echo ""

# Counters
DELETED=0
FAILED=0
SKIPPED=0

# Function to delete branch
delete_branch() {
    local branch=$1
    if git push origin --delete "$branch" 2>/dev/null; then
        ((DELETED++))
        echo "✅ Deleted: $branch"
    else
        if git ls-remote --exit-code --heads origin "$branch" &>/dev/null; then
            ((FAILED++))
            echo "❌ Failed: $branch"
        else
            ((SKIPPED++))
            echo "⊘ Already deleted: $branch"
        fi
    fi
}

echo "🗑️  Starting branch deletion..."
echo ""

# Delete all 53 branches
echo "Category 1: Fix Branches"
delete_branch "copilot/fix-404-error-on-website"
delete_branch "copilot/fix-and-publish"
delete_branch "copilot/fix-build-command-issue"
delete_branch "copilot/fix-issue-in-recent-update"
delete_branch "copilot/fix-publish-directory-issue"
delete_branch "copilot/fix-report-page-error"
delete_branch "copilot/fix-report-page-issue"
delete_branch "copilot/fix-uncommitted-changes-issue"

echo ""
echo "Category 2: Review Branches"
delete_branch "copilot/review-and-deploy-site"
delete_branch "copilot/review-and-publish-project"
delete_branch "copilot/review-and-update-database"
delete_branch "copilot/review-complete-system"
delete_branch "copilot/review-entire-system"
delete_branch "copilot/review-entire-system-again"

echo ""
echo "Category 3: Update Branches"
delete_branch "copilot/update-and-publish"
delete_branch "copilot/update-and-publish-new-changes"
delete_branch "copilot/update-complete-system"
delete_branch "copilot/update-latest-releases-for-deployment"
delete_branch "copilot/update-unknown-parameters"
delete_branch "copilot/update-visual-identity-system"

echo ""
echo "Category 4: Install Branches"
delete_branch "copilot/install-dependencies-for-project"
delete_branch "copilot/install-npm-dependencies"

echo ""
echo "Category 5: Redesign Branches"
delete_branch "copilot/redesign-dashboard-layout"
delete_branch "copilot/redesign-home-page-professionally"
delete_branch "copilot/refactor-duplicated-code"
delete_branch "copilot/refactor-microphone-structure"
delete_branch "copilot/restructure-project-files"

echo ""
echo "Category 6: Feature Branches"
delete_branch "copilot/add-back-button-to-traffic-violations"
delete_branch "copilot/add-car-sticker-data"
delete_branch "copilot/add-hidden-content-search"
delete_branch "copilot/add-identity-verification-system"
delete_branch "copilot/add-internet-publishing-link"
delete_branch "copilot/add-local-server-infrastructure"

echo ""
echo "Category 7: Publish Branches"
delete_branch "copilot/publish-content"
delete_branch "copilot/unlock-system-and-publish"
delete_branch "copilot/connect-database-and-deploy"

echo ""
echo "Category 8: Other Branches"
delete_branch "copilot/check-stickers-data-existence"
delete_branch "copilot/check-vehicle-sticker-page"
delete_branch "copilot/cleanup-unrelated-files"
delete_branch "copilot/complete-report-and-settings-page"
delete_branch "copilot/create-page-if-not-exists"
delete_branch "copilot/create-vehicles-database"
delete_branch "copilot/design-comprehensive-traffic-system"
delete_branch "copilot/enable-email-notifications"
delete_branch "copilot/export-docker-image-format"
delete_branch "copilot/improve-code-efficiency"
delete_branch "copilot/link-pages-and-redesign-cards"
delete_branch "copilot/remove-dashboard-page"
delete_branch "copilot/replace-login-window-design"
delete_branch "copilot/show-single-pages"
delete_branch "copilot/verify-repo-connection"
delete_branch "copilot/set-up-plate-recognizer-api"
delete_branch "copilot/setup-local-server-version"

echo ""
echo "Category 9: Flyio Branch"
delete_branch "flyio-new-files"

echo ""
echo "=========================================="
echo "📊 Cleanup Summary"
echo "=========================================="
echo "✅ Deleted: $DELETED branches"
echo "⊘ Already deleted: $SKIPPED branches"
echo "❌ Failed: $FAILED branches"
echo ""
echo "Backup tag: $BACKUP_TAG"
echo ""
echo "✅ Branch cleanup completed!"
echo "=========================================="
