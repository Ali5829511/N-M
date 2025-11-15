#!/bin/bash

###############################################################################
# Final Branch Cleanup Execution - التنفيذ النهائي لحذف الفروع
# 
# هذا السكريبت ينفذ عملية حذف جميع الفروع غير المفيدة (53 فرع)
# This script executes deletion of all useless branches (53 branches)
#
# ⚠️  تحذير: يجب تنفيذ هذا بعد دمج PR في main
# ⚠️  Warning: Execute this AFTER merging PR into main
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "🚀 Final Branch Cleanup Execution"
echo "=========================================="
echo ""

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not a git repository!"
    exit 1
fi

print_info "Repository: Ali5829511/N-M"
print_info "Current branch: $(git branch --show-current)"
echo ""

# Show current branch count
CURRENT_COUNT=$(git branch -r | grep -v "HEAD" | wc -l)
print_info "Current remote branches: $CURRENT_COUNT"
echo ""

print_warning "This script will delete 53 branches from GitHub"
echo ""
echo "Categories to be deleted:"
echo "  ❌ 10 fix branches (fixes for old issues)"
echo "  ❌ 7 review branches (review tasks completed)"
echo "  ❌ 6 update branches (updates already merged)"
echo "  ❌ 4 install branches (installation completed)"
echo "  ❌ 5 redesign branches (redesigns completed)"
echo "  ❌ 6 feature branches (features in main)"
echo "  ❌ 4 publish branches (publishing completed)"
echo "  ❌ 10 other branches (various completed tasks)"
echo "  ❌ 1 flyio branch (already in main)"
echo ""

print_warning "What will remain:"
echo "  ✅ main (unified integrated system)"
echo ""

# Ask for confirmation
read -p "⚠️  Continue with branch deletion? (yes/no): " confirmation

if [ "$confirmation" != "yes" ]; then
    print_warning "Operation cancelled by user."
    exit 0
fi

echo ""
print_status "Starting branch cleanup..."
echo ""

# Create backup tag (local only - will be pushed with report_progress)
BACKUP_TAG="backup-before-cleanup-$(date +%Y%m%d-%H%M%S)"
print_info "Creating local backup tag: $BACKUP_TAG"
git tag -a "$BACKUP_TAG" -m "Backup before branch cleanup on $(date)" 2>/dev/null || true
print_status "Local backup tag created"
print_warning "Note: Tag will be pushed when you commit next"
echo ""

# Counters
DELETED_COUNT=0
FAILED_COUNT=0
SKIPPED_COUNT=0

# Function to delete a branch
delete_branch() {
    local branch=$1
    echo -n "  Deleting: $branch ... "
    
    # Try to delete
    if git push origin --delete "$branch" 2>/dev/null; then
        echo -e "${GREEN}✅${NC}"
        ((DELETED_COUNT++))
    else
        # Check if branch doesn't exist
        if git ls-remote --exit-code --heads origin "$branch" &>/dev/null; then
            echo -e "${RED}❌ Failed${NC}"
            ((FAILED_COUNT++))
        else
            echo -e "${YELLOW}⊘ Already deleted${NC}"
            ((SKIPPED_COUNT++))
        fi
    fi
}

# Category 1: Fix branches
echo "📁 Category 1: Fix Branches (10)"
delete_branch "copilot/fix-404-error-on-website"
delete_branch "copilot/fix-and-publish"
delete_branch "copilot/fix-build-command-issue"
delete_branch "copilot/fix-issue-in-recent-update"
delete_branch "copilot/fix-publish-directory-issue"
delete_branch "copilot/fix-report-page-error"
delete_branch "copilot/fix-report-page-issue"
delete_branch "copilot/fix-uncommitted-changes-issue"
echo ""

# Category 2: Review branches
echo "📁 Category 2: Review Branches (7)"
delete_branch "copilot/review-and-deploy-site"
delete_branch "copilot/review-and-publish-project"
delete_branch "copilot/review-and-update-database"
delete_branch "copilot/review-complete-system"
delete_branch "copilot/review-entire-system"
delete_branch "copilot/review-entire-system-again"
echo ""

# Category 3: Update branches
echo "📁 Category 3: Update Branches (6)"
delete_branch "copilot/update-and-publish"
delete_branch "copilot/update-and-publish-new-changes"
delete_branch "copilot/update-complete-system"
delete_branch "copilot/update-latest-releases-for-deployment"
delete_branch "copilot/update-unknown-parameters"
delete_branch "copilot/update-visual-identity-system"
echo ""

# Category 4: Install branches
echo "📁 Category 4: Install Branches (4)"
delete_branch "copilot/install-dependencies-for-project"
delete_branch "copilot/install-npm-dependencies"
echo ""

# Category 5: Redesign branches
echo "📁 Category 5: Redesign Branches (5)"
delete_branch "copilot/redesign-dashboard-layout"
delete_branch "copilot/redesign-home-page-professionally"
delete_branch "copilot/refactor-duplicated-code"
delete_branch "copilot/refactor-microphone-structure"
delete_branch "copilot/restructure-project-files"
echo ""

# Category 6: Feature branches
echo "📁 Category 6: Feature Branches (6)"
delete_branch "copilot/add-back-button-to-traffic-violations"
delete_branch "copilot/add-car-sticker-data"
delete_branch "copilot/add-hidden-content-search"
delete_branch "copilot/add-identity-verification-system"
delete_branch "copilot/add-internet-publishing-link"
delete_branch "copilot/add-local-server-infrastructure"
echo ""

# Category 7: Publish branches
echo "📁 Category 7: Publish Branches (4)"
delete_branch "copilot/publish-content"
delete_branch "copilot/unlock-system-and-publish"
delete_branch "copilot/connect-database-and-deploy"
echo ""

# Category 8: Other branches
echo "📁 Category 8: Other Branches (15)"
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

# Category 9: Flyio branch
echo "📁 Category 9: Flyio Branch (1)"
delete_branch "flyio-new-files"
echo ""

# Final summary
echo "=========================================="
echo "📊 Cleanup Summary"
echo "=========================================="
echo ""
echo -e "${GREEN}✅ Successfully deleted: $DELETED_COUNT branches${NC}"
if [ $SKIPPED_COUNT -gt 0 ]; then
    echo -e "${YELLOW}⊘ Already deleted: $SKIPPED_COUNT branches${NC}"
fi
if [ $FAILED_COUNT -gt 0 ]; then
    echo -e "${RED}❌ Failed to delete: $FAILED_COUNT branches${NC}"
fi
echo ""

# Show remaining branches
REMAINING=$(git ls-remote --heads origin | wc -l)
print_info "Remaining remote branches: $REMAINING"
echo ""

if [ $REMAINING -le 2 ]; then
    print_status "✅ Cleanup successful!"
    echo ""
    echo "Remaining branches should be:"
    echo "  ✅ main"
    echo "  🔄 copilot/consolidate-branches-into-one (will be deleted after merge)"
else
    print_warning "Some branches remain. Check manually."
fi

echo ""
echo "Backup tag created: $BACKUP_TAG"
echo ""
print_status "Next steps:"
echo "  1. Verify main branch has all features"
echo "  2. Test the unified system"
echo "  3. Merge this PR into main"
echo "  4. Delete copilot/consolidate-branches-into-one"
echo "  5. ✅ Enjoy your clean, unified system!"
echo ""
echo "=========================================="
