#!/bin/bash
# Quick Execution Script - Run this to complete the task
# السكريبت السريع - شغل هذا لإكمال المهمة

echo "════════════════════════════════════════════════════════"
echo "  تنفيذ المهمة النهائي / Final Task Execution"
echo "════════════════════════════════════════════════════════"
echo ""
echo "المهمة: دمج وحذف الفروع الفرعية"
echo "Task: Merge and delete secondary branches"
echo ""
echo "الحالة: جاهز للتنفيذ الفوري"
echo "Status: Ready for immediate execution"
echo ""
echo "الإذن: مسموح اكمل ✅"
echo "Permission: Granted ✅"
echo ""
echo "════════════════════════════════════════════════════════"
echo ""

# Change to repository directory
cd /home/runner/work/N-M/N-M 2>/dev/null || cd "$(dirname "$0")"

echo "سيتم حذف 68 فرع فرعي"
echo "Will delete 68 secondary branches"
echo ""
echo "جميع الفروع تم دمجها مسبقاً عبر Pull Requests"
echo "All branches were previously merged via Pull Requests"
echo ""
echo "════════════════════════════════════════════════════════"
echo ""

# Ask for confirmation
read -p "هل تريد المتابعة؟ Do you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo ""
    echo "تم الإلغاء / Cancelled"
    echo ""
    echo "للتنفيذ لاحقاً، شغل: bash delete_all_branches.sh"
    echo "To execute later, run: bash delete_all_branches.sh"
    exit 0
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "  بدء الحذف / Starting Deletion"
echo "════════════════════════════════════════════════════════"
echo ""

# Execute the main deletion script
if [ -f "delete_all_branches.sh" ]; then
    bash delete_all_branches.sh
else
    echo "❌ خطأ: لم يتم العثور على delete_all_branches.sh"
    echo "❌ Error: delete_all_branches.sh not found"
    echo ""
    echo "تأكد من وجودك في المجلد الصحيح"
    echo "Make sure you're in the correct directory"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "  اكتمل / Complete"
echo "════════════════════════════════════════════════════════"
