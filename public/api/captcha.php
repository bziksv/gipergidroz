<?php
declare(strict_types=1);

require __DIR__ . '/_captcha.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$config = captcha_config();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        echo json_encode(captcha_issue($config), JSON_UNESCAPED_UNICODE);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['ok' => false]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false]);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw ?: '', true);
if (!is_array($data)) {
    $data = $_POST;
}

$token = isset($data['token']) ? (string) $data['token'] : '';
$answer = isset($data['answer']) ? (string) $data['answer'] : '';

try {
    $ok = captcha_check($token, $answer, $config);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false]);
    exit;
}

echo json_encode(['ok' => $ok]);
