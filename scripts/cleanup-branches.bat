@echo off
REM ##############################################################################
REM Branch Cleanup Script for Windows - سكريبت تنظيف الفروع لويندوز
REM 
REM هذا السكريبت يحذف جميع الفروع غير المفيدة (53 فرع)
REM This script deletes all useless branches (53 branches)
REM
REM ⚠️  تحذير: الحذف نهائي! تأكد من وجود نسخة احتياطية
REM ⚠️  Warning: Deletion is permanent! Make sure you have a backup
REM ##############################################################################

echo ==========================================
echo Branch Cleanup Script for Windows
echo ==========================================
echo.

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo Error: Not a git repository!
    pause
    exit /b 1
)

echo WARNING: This script will delete 53 branches!
echo.
echo Branches to be deleted:
echo   - 10 fix branches
echo   - 7 review branches
echo   - 6 update branches
echo   - 4 install branches
echo   - 5 redesign branches
echo   - 6 feature branches
echo   - 4 publish branches
echo   - 10 other branches
echo   - 1 flyio branch
echo.

set /p confirmation="Are you sure you want to continue? (yes/no): "
if not "%confirmation%"=="yes" (
    echo Operation cancelled by user.
    pause
    exit /b 0
)

echo.
echo Creating backup tag...
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set BACKUP_TAG=backup-before-cleanup-%mydate%-%mytime%

git tag -a "%BACKUP_TAG%" -m "Backup before branch cleanup"
git push origin "%BACKUP_TAG%" 2>nul

echo.
echo Backup created: %BACKUP_TAG%
echo.
echo Starting branch cleanup...
echo.

REM Fix branches
echo Deleting fix branches...
git push origin --delete copilot/fix-404-error-on-website 2>nul
git push origin --delete copilot/fix-and-publish 2>nul
git push origin --delete copilot/fix-build-command-issue 2>nul
git push origin --delete copilot/fix-issue-in-recent-update 2>nul
git push origin --delete copilot/fix-publish-directory-issue 2>nul
git push origin --delete copilot/fix-report-page-error 2>nul
git push origin --delete copilot/fix-report-page-issue 2>nul
git push origin --delete copilot/fix-uncommitted-changes-issue 2>nul

REM Review branches
echo Deleting review branches...
git push origin --delete copilot/review-and-deploy-site 2>nul
git push origin --delete copilot/review-and-publish-project 2>nul
git push origin --delete copilot/review-and-update-database 2>nul
git push origin --delete copilot/review-complete-system 2>nul
git push origin --delete copilot/review-entire-system 2>nul
git push origin --delete copilot/review-entire-system-again 2>nul

REM Update branches
echo Deleting update branches...
git push origin --delete copilot/update-and-publish 2>nul
git push origin --delete copilot/update-and-publish-new-changes 2>nul
git push origin --delete copilot/update-complete-system 2>nul
git push origin --delete copilot/update-latest-releases-for-deployment 2>nul
git push origin --delete copilot/update-unknown-parameters 2>nul
git push origin --delete copilot/update-visual-identity-system 2>nul

REM Install branches
echo Deleting install branches...
git push origin --delete copilot/install-dependencies-for-project 2>nul
git push origin --delete copilot/install-npm-dependencies 2>nul

REM Redesign branches
echo Deleting redesign branches...
git push origin --delete copilot/redesign-dashboard-layout 2>nul
git push origin --delete copilot/redesign-home-page-professionally 2>nul
git push origin --delete copilot/refactor-duplicated-code 2>nul
git push origin --delete copilot/refactor-microphone-structure 2>nul
git push origin --delete copilot/restructure-project-files 2>nul

REM Feature branches
echo Deleting feature branches...
git push origin --delete copilot/add-back-button-to-traffic-violations 2>nul
git push origin --delete copilot/add-car-sticker-data 2>nul
git push origin --delete copilot/add-hidden-content-search 2>nul
git push origin --delete copilot/add-identity-verification-system 2>nul
git push origin --delete copilot/add-internet-publishing-link 2>nul
git push origin --delete copilot/add-local-server-infrastructure 2>nul

REM Publish branches
echo Deleting publish branches...
git push origin --delete copilot/publish-content 2>nul
git push origin --delete copilot/unlock-system-and-publish 2>nul
git push origin --delete copilot/connect-database-and-deploy 2>nul

REM Other branches
echo Deleting other branches...
git push origin --delete copilot/check-stickers-data-existence 2>nul
git push origin --delete copilot/check-vehicle-sticker-page 2>nul
git push origin --delete copilot/cleanup-unrelated-files 2>nul
git push origin --delete copilot/complete-report-and-settings-page 2>nul
git push origin --delete copilot/create-page-if-not-exists 2>nul
git push origin --delete copilot/create-vehicles-database 2>nul
git push origin --delete copilot/design-comprehensive-traffic-system 2>nul
git push origin --delete copilot/enable-email-notifications 2>nul
git push origin --delete copilot/export-docker-image-format 2>nul
git push origin --delete copilot/improve-code-efficiency 2>nul
git push origin --delete copilot/link-pages-and-redesign-cards 2>nul
git push origin --delete copilot/remove-dashboard-page 2>nul
git push origin --delete copilot/replace-login-window-design 2>nul
git push origin --delete copilot/show-single-pages 2>nul
git push origin --delete copilot/verify-repo-connection 2>nul
git push origin --delete copilot/set-up-plate-recognizer-api 2>nul
git push origin --delete copilot/setup-local-server-version 2>nul

REM Flyio branch
echo Deleting flyio branch...
git push origin --delete flyio-new-files 2>nul

echo.
echo ==========================================
echo Cleanup completed!
echo ==========================================
echo.
echo Backup tag: %BACKUP_TAG%
echo.
echo Next steps:
echo   1. Verify main branch has all features
echo   2. Test the system
echo   3. Update documentation
echo   4. Merge this PR into main
echo   5. Delete copilot/consolidate-branches-into-one
echo.
pause
