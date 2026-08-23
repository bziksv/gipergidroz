<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$config = is_file(__DIR__ . '/_mail_config.php')
    ? require __DIR__ . '/_mail_config.php'
    : [
        'to' => 'sale@gipergidroz.su',
        'from' => 'noreply@gipergidroz.su',
        'site' => 'gipergidroz.su',
    ];

if (!is_array($config)) {
    $config = ['to' => 'sale@gipergidroz.su', 'from' => 'noreply@gipergidroz.su', 'site' => 'gipergidroz.su'];
}

if (is_file(__DIR__ . '/config.php')) {
    $local = require __DIR__ . '/config.php';
    if (is_array($local)) {
        $config = array_merge($config, $local);
    }
}

$raw = file_get_contents('php://input');
$data = json_decode($raw ?: '', true);
if (!is_array($data)) {
    $data = $_POST;
}

function field(array $data, string $key, int $max = 500): string
{
    $v = isset($data[$key]) ? trim((string) $data[$key]) : '';
    if (strlen($v) > $max) {
        $v = substr($v, 0, $max);
    }
    return $v;
}

$formCode = field($data, 'FORM_CODE', 64);
$name = field($data, 'NAME', 200);
$phone = field($data, 'PHONE', 64);
$email = field($data, 'EMAIL', 200);
$subject = field($data, 'SUBJECT', 300);
$question = field($data, 'QUESTION', 2000);
$source = field($data, 'SOURCE', 500);

$allowedForms = ['ranx_landing_form_callback', 'ranx_landing_form_order'];
if (!in_array($formCode, $allowedForms, true)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Unknown form']);
    exit;
}

if ($name === '' || $phone === '') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Required fields']);
    exit;
}

if ($formCode === 'ranx_landing_form_order') {
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Укажите корректный e-mail']);
        exit;
    }
}

$formTitle = $formCode === 'ranx_landing_form_order' ? 'Заявка с сайта' : 'Заказ звонка';

$siteName = $config['site'];
if ($formCode === 'ranx_landing_form_callback') {
    $mailSubject = "Заказ звонка с сайта {$siteName} — {$name}";
} else {
    $mailSubject = "Заявка с сайта {$siteName} — {$name}";
}

$lines = [
    "Сайт: {$config['site']}",
    "Форма: {$formTitle} ({$formCode})",
    "Имя: {$name}",
    "Телефон: {$phone}",
];

if ($email !== '') {
    $lines[] = "Email: {$email}";
}
if ($subject !== '') {
    $lines[] = "Тема: {$subject}";
}
if ($question !== '') {
    $lines[] = "ИНН / реквизиты / вопрос: {$question}";
}
if ($source !== '') {
    $lines[] = "Страница: {$source}";
}
$lines[] = 'Время: ' . date('Y-m-d H:i:s');

$body = implode("\n", $lines) . "\n";
$encodedSubject = '=?UTF-8?B?' . base64_encode($mailSubject) . '?=';

$from = $config['from'];
$to = $config['to'];

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'From: ' . $from,
    'X-Mailer: PHP/' . PHP_VERSION,
];
if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $headers[] = 'Reply-To: ' . $email;
}

$extraParams = '';
if (str_contains($from, '@')) {
    $extraParams = '-f' . $from;
}

$mailOk = mail($to, $encodedSubject, $body, implode("\r\n", $headers), $extraParams);

$logCandidates = [
    getenv('GIPERGIDROZ_FORM_LOG_DIR') ?: '',
    '/var/www/amplipuls_su_usr/data/logs/gipergidroz-forms',
    dirname(__DIR__) . '/_submissions',
];
$logDir = '';
foreach ($logCandidates as $candidate) {
    if ($candidate === '') {
        continue;
    }
    if (!is_dir($candidate)) {
        @mkdir($candidate, 0775, true);
    }
    if (is_dir($candidate) && is_writable($candidate)) {
        $logDir = $candidate;
        break;
    }
}
$logLine = json_encode(
    [
        'time' => date('c'),
        'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
        'data' => [
            'FORM_CODE' => $formCode,
            'NAME' => $name,
            'PHONE' => $phone,
            'EMAIL' => $email,
            'SUBJECT' => $subject,
            'SOURCE' => $source,
        ],
        'mail' => $mailOk,
        'to' => $to,
    ],
    JSON_UNESCAPED_UNICODE
);
if ($logDir !== '') {
    @file_put_contents($logDir . '/' . date('Y-m-d') . '.log', $logLine . "\n", FILE_APPEND | LOCK_EX);
}

if (!$mailOk) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Не удалось отправить письмо']);
    exit;
}

echo json_encode(['status' => 'success']);
