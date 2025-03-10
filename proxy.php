<?php
/**
 * Optimized PHP proxy for u2NET Background Removal API
 * 
 * This script forwards requests to the u2NET API and bypasses CORS restrictions
 * Performance optimizations included
 */

// Allow cross-origin requests from your domain
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// For OPTIONS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Target API URL
$target_url = 'https://pollinations--u2net-bg-remover-fastapi-app.modal.run/remove-background';

// Check if we received an image
if (!isset($_FILES['image']) || !is_uploaded_file($_FILES['image']['tmp_name'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No image provided']);
    exit;
}

try {
    // Initialize cURL session
    $ch = curl_init();
    
    // Prepare file for upload
    $file_path = $_FILES['image']['tmp_name'];
    
    // Create a CURLFile object
    $cfile = new CURLFile(
        $file_path,
        $_FILES['image']['type'],
        $_FILES['image']['name']
    );
    
    // Setup POST data with file
    $post_data = ['image' => $cfile];
    
    // Set optimized cURL options
    curl_setopt($ch, CURLOPT_URL, $target_url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    // Performance optimizations
    curl_setopt($ch, CURLOPT_TCP_FASTOPEN, true); // Enable TCP Fast Open if available
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Skip SSL verification for better performance
    curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_2_0); // Try to use HTTP/2 if available
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5); // Connection timeout
    curl_setopt($ch, CURLOPT_TIMEOUT, 30); // Overall timeout
    curl_setopt($ch, CURLOPT_BUFFERSIZE, 128000); // Larger buffer size for faster transfer
    
    // Enable compression to reduce payload size
    curl_setopt($ch, CURLOPT_ENCODING, ''); // Accept all available encodings
    
    // Execute the request
    $response = curl_exec($ch);
    
    // Check for errors
    if (curl_errno($ch)) {
        http_response_code(500);
        echo json_encode(['error' => 'cURL error: ' . curl_error($ch)]);
        exit;
    }
    
    // Get response info
    $info = curl_getinfo($ch);
    
    // Close cURL session
    curl_close($ch);
    
    // Set the same content type as the API response
    header('Content-Type: ' . $info['content_type']);
    
    // Return the response directly
    echo $response;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Proxy error: ' . $e->getMessage()]);
}