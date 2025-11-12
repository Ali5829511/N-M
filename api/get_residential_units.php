<?php
/**
 * API للحصول على بيانات الوحدات السكنية
 * وحدة إسكان هيئة التدريس - جامعة الإمام محمد بن سعود الإسلامية
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// Database connection
require_once '../config/database.php';

try {
    // Get units data from view
    $query = "SELECT * FROM v_residential_units_detailed ORDER BY building_number, unit_number";
    $stmt = $pdo->query($query);
    $units = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get statistics
    $statsQuery = "SELECT * FROM v_units_statistics";
    $statsStmt = $pdo->query($statsQuery);
    $statistics = $statsStmt->fetch(PDO::FETCH_ASSOC);

    // Prepare response
    $response = [
        'success' => true,
        'units' => $units,
        'statistics' => $statistics,
        'total_count' => count($units),
        'timestamp' => date('Y-m-d H:i:s')
    ];

    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    // Error response
    $response = [
        'success' => false,
        'error' => 'خطأ في قاعدة البيانات',
        'message' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ];

    http_response_code(500);
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
?>
