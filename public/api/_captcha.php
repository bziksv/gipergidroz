<?php
declare(strict_types=1);

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === '_captcha.php') {
    http_response_code(404);
    exit;
}

const CAPTCHA_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CAPTCHA_TTL = 600;

function captcha_b64url_encode(string $value): string
{
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

function captcha_b64url_decode(string $value): string
{
    $pad = strlen($value) % 4 === 0 ? '' : str_repeat('=', 4 - (strlen($value) % 4));
    $decoded = base64_decode(strtr($value, '-_', '+/') . $pad, true);
    return $decoded === false ? '' : $decoded;
}

function captcha_normalize(string $value): string
{
    $value = preg_replace('/\s+/', '', $value) ?? '';
    return strtoupper($value);
}

function captcha_secret(array $config): string
{
    $fromConfig = isset($config['captcha_secret']) ? trim((string) $config['captcha_secret']) : '';
    if ($fromConfig !== '') {
        return $fromConfig;
    }
    $fromEnv = getenv('CAPTCHA_SECRET');
    if (is_string($fromEnv) && trim($fromEnv) !== '') {
        return trim($fromEnv);
    }

    $paths = [
        dirname(__DIR__, 2) . '/.captcha-secret',
        sys_get_temp_dir() . '/gipergidroz-captcha-secret',
    ];
    foreach ($paths as $path) {
        if (is_file($path)) {
            $existing = trim((string) file_get_contents($path));
            if ($existing !== '') {
                return $existing;
            }
        }
    }

    $created = bin2hex(random_bytes(32));
    foreach ($paths as $path) {
        if (@file_put_contents($path, $created, LOCK_EX) !== false) {
            @chmod($path, 0600);
            return $created;
        }
    }

    throw new RuntimeException('Captcha secret is not writable');
}

function captcha_sign(string $payload, string $secret): string
{
    return hash_hmac('sha256', $payload, $secret);
}

function captcha_config(): array
{
    $config = is_file(__DIR__ . '/_mail_config.php') ? require __DIR__ . '/_mail_config.php' : [];
    if (!is_array($config)) {
        $config = [];
    }
    if (is_file(__DIR__ . '/config.php')) {
        $local = require __DIR__ . '/config.php';
        if (is_array($local)) {
            $config = array_merge($config, $local);
        }
    }
    return $config;
}

function captcha_svg(string $code): string
{
    $w = 168;
    $h = 56;
    $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' . $w . '" height="' . $h . '" viewBox="0 0 ' . $w . ' ' . $h . '">';
    $svg .= '<rect width="100%" height="100%" fill="#f3f6f8"/>';
    for ($i = 0; $i < 6; $i++) {
        $svg .= '<line x1="' . random_int(0, $w) . '" y1="' . random_int(0, $h) . '" x2="' . random_int(0, $w) . '" y2="' . random_int(0, $h) . '" stroke="#9bb0c0" stroke-width="1"/>';
    }
    for ($i = 0; $i < 16; $i++) {
        $svg .= '<circle cx="' . random_int(0, $w) . '" cy="' . random_int(0, $h) . '" r="1" fill="#7f93a3"/>';
    }
    $len = strlen($code);
    for ($i = 0; $i < $len; $i++) {
        $x = 14 + $i * 30 + random_int(-2, 2);
        $y = 38 + random_int(-4, 4);
        $rot = random_int(-22, 22);
        $ch = htmlspecialchars($code[$i], ENT_QUOTES, 'UTF-8');
        $svg .= '<text x="' . $x . '" y="' . $y . '" transform="rotate(' . $rot . ' ' . $x . ' ' . $y . ')" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="#1d3b53">' . $ch . '</text>';
    }
    $svg .= '</svg>';
    return $svg;
}

function captcha_issue(array $config): array
{
    $code = '';
    $max = strlen(CAPTCHA_ALPHABET) - 1;
    for ($i = 0; $i < 5; $i++) {
        $code .= CAPTCHA_ALPHABET[random_int(0, $max)];
    }
    $exp = time() + CAPTCHA_TTL;
    $hash = hash('sha256', $code);
    $payload = $exp . ':' . $hash;
    $secret = captcha_secret($config);
    return [
        'token' => captcha_b64url_encode($payload) . '.' . captcha_sign($payload, $secret),
        'svg' => captcha_svg($code),
    ];
}

function captcha_check(string $token, string $answer, array $config): bool
{
    $dot = strrpos($token, '.');
    if ($dot === false || $dot < 1) {
        return false;
    }
    $payload = captcha_b64url_decode(substr($token, 0, $dot));
    if ($payload === '') {
        return false;
    }
    $secret = captcha_secret($config);
    $mac = substr($token, $dot + 1);
    if (!hash_equals(captcha_sign($payload, $secret), $mac)) {
        return false;
    }
    $sep = strpos($payload, ':');
    if ($sep === false || $sep < 1) {
        return false;
    }
    $exp = (int) substr($payload, 0, $sep);
    $hash = substr($payload, $sep + 1);
    if ($exp < time()) {
        return false;
    }
    $got = hash('sha256', captcha_normalize($answer));
    return hash_equals($hash, $got);
}
