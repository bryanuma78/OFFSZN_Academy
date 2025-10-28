
<?php
// Configuración de errores
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

// Archivo de log detallado
function logDebug($message) {
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents('debug.log', "[$timestamp] $message\n", FILE_APPEND);
}

logDebug("=== INICIO DE SOLICITUD ===");
logDebug("Método: " . $_SERVER['REQUEST_METHOD']);
logDebug("FILES: " . print_r($_FILES, true));
logDebug("POST: " . print_r($_POST, true));

// Siempre enviar JSON
header('Content-Type: application/json; charset=utf-8');

// Función para enviar respuesta JSON y terminar
function sendResponse($data) {
    logDebug("Respuesta: " . json_encode($data));
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// Configuración
$VT_API_KEY = '7425cef7f32b3d1f519ffeab3f2200bbad842f5a81247eb04f4484121897328e';
$UPLOAD_DIR = 'uploads/';

// Crear directorio si no existe
if (!file_exists($UPLOAD_DIR)) {
    if (!mkdir($UPLOAD_DIR, 0777, true)) {
        sendResponse([
            'success' => false,
            'message' => 'Error al crear directorio de subida'
        ]);
    }
    logDebug("Directorio creado: $UPLOAD_DIR");
}

// Clase VirusTotal mejorada
class VirusTotalScanner {
    private $apiKey;
    private $apiUrl = 'https://www.virustotal.com/api/v3/';
    
    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
    }
    
    public function scanFile($filePath) {
        logDebug("Iniciando escaneo de archivo: $filePath");
        
        if (!file_exists($filePath)) {
            logDebug("ERROR: Archivo no existe");
            return ['success' => false, 'message' => 'Archivo no encontrado'];
        }
        
        $url = $this->apiUrl . 'files';
        $file = new CURLFile($filePath);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, ['file' => $file]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['x-apikey: ' . $this->apiKey]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 300);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        
        logDebug("Respuesta de escaneo - Código HTTP: $httpCode");
        
        if ($curlError) {
            logDebug("ERROR CURL: $curlError");
            return ['success' => false, 'message' => 'Error de conexión: ' . $curlError];
        }
        
        if ($httpCode !== 200) {
            logDebug("ERROR: Código HTTP $httpCode - Respuesta: $response");
            return ['success' => false, 'message' => "Error al escanear (HTTP $httpCode)"];
        }
        
        $data = json_decode($response, true);
        
        if (!$data || !isset($data['data']['id'])) {
            logDebug("ERROR: Respuesta JSON inválida");
            return ['success' => false, 'message' => 'Respuesta de VirusTotal inválida'];
        }
        
        logDebug("Escaneo iniciado - ID: " . $data['data']['id']);
        
        return [
            'success' => true,
            'scan_id' => $data['data']['id']
        ];
    }
    
    public function getReport($scanId) {
        logDebug("Obteniendo reporte: $scanId");
        
        $url = $this->apiUrl . 'analyses/' . $scanId;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['x-apikey: ' . $this->apiKey]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        logDebug("Reporte - Código HTTP: $httpCode");
        
        if ($httpCode !== 200) {
            logDebug("ERROR: No se pudo obtener reporte");
            return ['success' => false, 'message' => 'Error al obtener reporte'];
        }
        
        $data = json_decode($response, true);
        
        if (!$data || !isset($data['data']['attributes']['stats'])) {
            logDebug("ERROR: Datos de reporte inválidos");
            return ['success' => false, 'message' => 'Reporte inválido'];
        }
        
        $stats = $data['data']['attributes']['stats'];
        $status = $data['data']['attributes']['status'];
        
        logDebug("Reporte - Malicious: {$stats['malicious']}, Suspicious: {$stats['suspicious']}, Status: $status");
        
        return [
            'success' => true,
            'status' => $status,
            'malicious' => $stats['malicious'],
            'suspicious' => $stats['suspicious'],
            'undetected' => $stats['undetected'],
            'harmless' => $stats['harmless'],
            'is_safe' => $stats['malicious'] === 0 && $stats['suspicious'] === 0
        ];
    }
    
    public function checkHash($hash) {
        logDebug("Verificando hash: $hash");
        
        $url = $this->apiUrl . 'files/' . $hash;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['x-apikey: ' . $this->apiKey]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        logDebug("Hash check - Código HTTP: $httpCode");
        
        if ($httpCode === 404) {
            logDebug("Hash no encontrado en VirusTotal");
            return null;
        }
        
        if ($httpCode !== 200) {
            logDebug("ERROR al verificar hash");
            return null;
        }
        
        $data = json_decode($response, true);
        
        if (!$data || !isset($data['data']['attributes']['last_analysis_stats'])) {
            logDebug("ERROR: Datos de hash inválidos");
            return null;
        }
        
        $stats = $data['data']['attributes']['last_analysis_stats'];
        
        logDebug("Hash check - Malicious: {$stats['malicious']}, Suspicious: {$stats['suspicious']}");
        
        return [
            'malicious' => $stats['malicious'],
            'suspicious' => $stats['suspicious'],
            'is_safe' => $stats['malicious'] === 0 && $stats['suspicious'] === 0
        ];
    }
}

// Verificar método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse([
        'success' => false,
        'message' => 'Método no permitido. Use POST'
    ]);
}

// Verificar archivo
if (!isset($_FILES['file'])) {
    logDebug("ERROR: No se recibió archivo");
    sendResponse([
        'success' => false,
        'message' => 'No se recibió ningún archivo'
    ]);
}

$file = $_FILES['file'];

logDebug("Archivo recibido: {$file['name']}, Tamaño: {$file['size']}, Error: {$file['error']}");

// Verificar errores de subida
$uploadErrors = [
    UPLOAD_ERR_INI_SIZE => 'El archivo excede upload_max_filesize en php.ini',
    UPLOAD_ERR_FORM_SIZE => 'El archivo excede MAX_FILE_SIZE',
    UPLOAD_ERR_PARTIAL => 'El archivo se subió parcialmente',
    UPLOAD_ERR_NO_FILE => 'No se subió ningún archivo',
    UPLOAD_ERR_NO_TMP_DIR => 'Falta carpeta temporal',
    UPLOAD_ERR_CANT_WRITE => 'Error al escribir en disco',
    UPLOAD_ERR_EXTENSION => 'Extensión bloqueada'
];

if ($file['error'] !== UPLOAD_ERR_OK) {
    $errorMsg = $uploadErrors[$file['error']] ?? 'Error desconocido';
    logDebug("ERROR de subida: $errorMsg");
    sendResponse([
        'success' => false,
        'message' => $errorMsg
    ]);
}

// Verificar que el archivo temporal existe
if (!file_exists($file['tmp_name'])) {
    logDebug("ERROR: Archivo temporal no existe");
    sendResponse([
        'success' => false,
        'message' => 'Archivo temporal no encontrado'
    ]);
}

// Calcular hash
$hash = hash_file('sha256', $file['tmp_name']);
logDebug("Hash calculado: $hash");

// Inicializar VirusTotal
$vt = new VirusTotalScanner($VT_API_KEY);

// Verificar hash en caché de VirusTotal
$hashCheck = $vt->checkHash($hash);

if ($hashCheck !== null) {
    logDebug("Archivo encontrado en caché de VirusTotal");
    
    if ($hashCheck['is_safe']) {
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = bin2hex(random_bytes(16)) . '.' . $extension;
        $uploadPath = $UPLOAD_DIR . $filename;
        
        if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
            logDebug("Archivo subido exitosamente: $filename");
            sendResponse([
                'success' => true,
                'message' => 'Archivo seguro y subido',
                'filename' => $filename,
                'hash' => $hash,
                'method' => 'cache',
                'detections' => 0
            ]);
        } else {
            logDebug("ERROR: No se pudo mover el archivo");
            sendResponse([
                'success' => false,
                'message' => 'Error al guardar el archivo'
            ]);
        }
    } else {
        logDebug("Archivo malicioso detectado en caché");
        if (file_exists($file['tmp_name'])) {
            unlink($file['tmp_name']);
        }
        sendResponse([
            'success' => false,
            'message' => 'Archivo detectado como malicioso',
            'detections' => $hashCheck['malicious']
        ]);
    }
}

// Si no está en caché, escanear
logDebug("Archivo no encontrado en caché, iniciando escaneo nuevo");

$scanResult = $vt->scanFile($file['tmp_name']);

if (!$scanResult['success']) {
    logDebug("ERROR al iniciar escaneo");
    if (file_exists($file['tmp_name'])) {
        unlink($file['tmp_name']);
    }
    sendResponse([
        'success' => false,
        'message' => $scanResult['message']
    ]);
}

$scanId = $scanResult['scan_id'];
logDebug("Esperando 15 segundos para el análisis...");

// Esperar análisis
sleep(15);

// Obtener reporte
$report = $vt->getReport($scanId);

if (!$report['success']) {
    logDebug("ERROR al obtener reporte");
    sendResponse([
        'success' => false,
        'message' => 'Error al obtener resultados del análisis',
        'scan_id' => $scanId
    ]);
}

logDebug("Reporte obtenido - Status: {$report['status']}");

// Verificar si el análisis completó
if ($report['status'] !== 'completed') {
    logDebug("Análisis aún en progreso");
    sendResponse([
        'success' => false,
        'message' => 'Análisis en progreso. Intenta nuevamente en unos segundos',
        'scan_id' => $scanId,
        'status' => $report['status']
    ]);
}

// Verificar resultado
if ($report['is_safe']) {
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = bin2hex(random_bytes(16)) . '.' . $extension;
    $uploadPath = $UPLOAD_DIR . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
        logDebug("Archivo escaneado y subido exitosamente: $filename");
        sendResponse([
            'success' => true,
            'message' => 'Archivo escaneado y subido',
            'filename' => $filename,
            'hash' => $hash,
            'method' => 'scan',
            'scan_results' => [
                'malicious' => $report['malicious'],
                'suspicious' => $report['suspicious'],
                'undetected' => $report['undetected'],
                'harmless' => $report['harmless']
            ]
        ]);
    } else {
        logDebug("ERROR: No se pudo mover el archivo escaneado");
        sendResponse([
            'success' => false,
            'message' => 'Error al guardar el archivo'
        ]);
    }
} else {
    logDebug("Archivo malicioso detectado tras escaneo");
    if (file_exists($file['tmp_name'])) {
        unlink($file['tmp_name']);
    }
    sendResponse([
        'success' => false,
        'message' => 'Archivo detectado como malicioso',
        'detections' => $report['malicious'],
        'scan_results' => [
            'malicious' => $report['malicious'],
            'suspicious' => $report['suspicious']
        ]
    ]);
}

logDebug("=== FIN DE SOLICITUD ===");
?>