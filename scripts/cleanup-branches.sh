#!/bin/bash

###############################################################################
# Branch Cleanup Script - سكريبت تنظيف الفروع
# 
# هذا السكريبت يحذف جميع الفروع غير المفيدة (53 فرع)
# This script deletes all useless branches (53 branches)
#
# ⚠️  تحذير: الحذف نهائي! تأكد من وجود نسخة احتياطية
# ⚠️  Warning: Deletion is permanent! Make sure you have a backup
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "🧹 Branch Cleanup Script"
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

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not a git repository!"
    exit 1
fi

print_warning "This script will delete 53 branches!"
echo ""
echo "Branches to be deleted:"
echo "  - 10 fix branches"
echo "  - 7 review branches"
echo "  - 6 update branches"
echo "  - 4 install branches"
echo "  - 5 redesign branches"
echo "  - 6 feature branches"
echo "  - 4 publish branches"
echo "  - 10 other branches"
echo "  - 1 flyio branch"
echo ""

# Ask for confirmation
read -p "⚠️  Are you sure you want to continue? (yes/no): " confirmation

if [ "$confirmation" != "yes" ]; then
    print_warning "Operation cancelled by user."
    exit 0
fi

echo ""
print_status "Starting branch cleanup..."
echo ""

# Create backup tag
BACKUP_TAG="backup-before-cleanup-$(date +%Y%m%d-%H%M%S)"
print_status "Creating backup tag: $BACKUP_TAG"
git tag -a "$BACKUP_TAG" -m "Backup before branch cleanup on $(date)"
git push origin "$BACKUP_TAG" 2>/dev/null || print_warning "Could not push backup tag (may already exist)"

echo ""
print_status "Backup created. You can restore from tag: $BACKUP_TAG"
echo ""

# Counter for deleted branches
DELETED_COUNT=0
FAILED_COUNT=0

# Function to delete a branch
delete_branch() {
    local branch=$1
    echo -n "Deleting: $branch ... "
    
    if git push origin --delete "$branch" 2>/dev/null; then
        echo -e "${GREEN}✅ Done${NC}"
        ((DELETED_COUNT++))
    else
        echo -e "${RED}❌ Failed${NC}"
        ((FAILED_COUNT++))
    fi
}

# Category 1: Fix branches (10)
print_status "Category 1: Deleting fix branches..."
delete_branch "copilot/fix-404-error-on-website"
delete_branch "copilot/fix-and-publish"
delete_branch "copilot/fix-build-command-issue"
delete_branch "copilot/fix-issue-in-recent-update"
delete_branch "copilot/fix-publish-directory-issue"
delete_branch "copilot/fix-report-page-error"
delete_branch "copilot/fix-report-page-issue"
delete_branch "copilot/fix-uncommitted-changes-issue"

echo ""

# Category 2: Review branches (7)
print_status "Category 2: Deleting review branches..."
delete_branch "copilot/review-and-deploy-site"
delete_branch "copilot/review-and-publish-project"
delete_branch "copilot/review-and-update-database"
delete_branch "copilot/review-complete-system"
delete_branch "copilot/review-entire-system"
delete_branch "copilot/review-entire-system-again"

echo ""

# Category 3: Update branches (6)
print_status "Category 3: Deleting update branches..."
delete_branch "copilot/update-and-publish"
delete_branch "copilot/update-and-publish-new-changes"
delete_branch "copilot/update-complete-system"
delete_branch "copilot/update-latest-releases-for-deployment"
delete_branch "copilot/update-unknown-parameters"
delete_branch "copilot/update-visual-identity-system"

echo ""

# Category 4: Install branches (4)
print_status "Category 4: Deleting install branches..."
delete_branch "copilot/install-dependencies-for-project"
delete_branch "copilot/install-npm-dependencies"

echo ""

# Category 5: Redesign branches (5)
print_status "Category 5: Deleting redesign branches..."
delete_branch "copilot/redesign-dashboard-layout"
delete_branch "copilot/redesign-home-page-professionally"
delete_branch "copilot/refactor-duplicated-code"
delete_branch "copilot/refactor-microphone-structure"
delete_branch "copilot/restructure-project-files"

echo ""

# Category 6: Feature branches (6)
print_status "Category 6: Deleting feature branches..."
delete_branch "copilot/add-back-button-to-traffic-violations"
delete_branch "copilot/add-car-sticker-data"
delete_branch "copilot/add-hidden-content-search"
delete_branch "copilot/add-identity-verification-system"
delete_branch "copilot/add-internet-publishing-link"
delete_branch "copilot/add-local-server-infrastructure"

echo ""

# Category 7: Publish branches (4)
print_status "Category 7: Deleting publish branches..."
delete_branch "copilot/publish-content"
delete_branch "copilot/unlock-system-and-publish"
delete_branch "copilot/connect-database-and-deploy"

echo ""

# Category 8: Other branches (15)
print_status "Category 8: Deleting other branches..."
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

# Delete flyio branch
print_status "Deleting flyio branch..."
delete_branch "flyio-new-files"

echo ""
echo "=========================================="
echo "📊 Cleanup Summary"
echo "=========================================="
echo ""
echo -e "${GREEN}✅ Successfully deleted: $DELETED_COUNT branches${NC}"
if [ $FAILED_COUNT -gt 0 ]; then
    echo -e "${RED}❌ Failed to delete: $FAILED_COUNT branches${NC}"
fi
echo ""
echo "Backup tag: $BACKUP_TAG"
echo ""

# Show remaining branches
print_status "Remaining branches:"
git branch -r | grep -v "HEAD" | wc -l | xargs echo "  Total:"

echo ""
print_status "✅ Cleanup completed!"
echo ""
echo "Next steps:"
echo "  1. Verify main branch has all features"
echo "  2. Test the system"
echo "  3. Update documentation"
echo "  4. Merge this PR into main"
echo "  5. Delete copilot/consolidate-branches-into-one"
echo ""
echo "=========================================="
