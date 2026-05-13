<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PayFastService
{
    protected ?string $merchantId = null;
    protected ?string $securedKey = null;
    protected ?string $mode = null;
    protected ?string $apiUrl = null;

    public function __construct()
    {
        // Don't load settings in constructor - load them dynamically when needed
        // This ensures settings are always up-to-date from the database
    }

    /**
     * Load settings from database dynamically
     */
    protected function loadSettings(): void
    {
        // Initialize with defaults
        $this->merchantId = '';
        $this->securedKey = '';
        $this->mode = 'sandbox';
        $this->apiUrl = 'https://ipguat.apps.net.pk/Ecommerce/api/Transaction/';
        
        // Try to load settings from database, but don't fail if it doesn't work
        try {
            if (class_exists(Setting::class)) {
                $merchantId = Setting::get('payfastMerchantId', '');
                $securedKey = Setting::get('payfastSecuredKey', '');
                $mode = Setting::get('payfastMode', 'sandbox');
                
                if (!empty($merchantId)) {
                    $this->merchantId = $merchantId;
                }
                if (!empty($securedKey)) {
                    $this->securedKey = $securedKey;
                }
                if (!empty($mode)) {
                    $this->mode = $mode;
                }
            }
        } catch (\Exception $e) {
            // If database access fails, use defaults (already set above)
            // Only log if it's not a connection issue
            if (strpos($e->getMessage(), 'Connection') === false) {
                Log::debug('PayFastService: Failed to load settings from database', [
                    'error' => $e->getMessage(),
                ]);
            }
        }
        
        // Set API URL based on mode
        if ($this->mode === 'production') {
            $this->apiUrl = 'https://ipg1.apps.net.pk/Ecommerce/api/Transaction/';
        } else {
            $this->apiUrl = 'https://ipguat.apps.net.pk/Ecommerce/api/Transaction/';
        }
    }

    /**
     * Check if PayFast is enabled
     */
    public function isEnabled(): bool
    {
        // Load settings dynamically to ensure they're up-to-date
        $this->loadSettings();
        
        return Setting::get('payfastEnabled', false) && 
               !empty($this->merchantId) && 
               !empty($this->securedKey);
    }

    /**
     * Generate a random basket ID
     */
    public function generateBasketId(string $prefix = 'DON'): string
    {
        return $prefix . '-' . strtoupper(Str::random(8));
    }

    /**
     * Get HTTP client with SSL verification options
     * Note: PayFast has SSL certificate issues, so we disable verification
     * 
     * @return \Illuminate\Http\Client\PendingRequest
     */
    protected function getHttpClient()
    {
        $client = Http::asForm()->timeout(30);
        
        // Disable SSL verification for PayFast (they have certificate issues)
        // This is necessary for PayFast API to work
        $client = $client->withoutVerifying();
        
        return $client;
    }

    /**
     * Get access token from PayFast API
     * PayFast API requires POST request with form data
     * Matching the working PayFastModule implementation
     * 
     * @param string $basketId Basket ID for the transaction
     * @param float $amount Transaction amount
     * @param string $currencyCode Currency code (default: PKR)
     * @param array $transactionParams Additional transaction parameters (optional)
     * @return array{success: bool, token: ?string, error: ?string, ACCESS_TOKEN?: string}
     */
    public function getAccessToken(string $basketId = '', float $amount = 0, string $currencyCode = 'PKR', array $transactionParams = []): array
    {
        // Load settings dynamically to ensure they're up-to-date
        $this->loadSettings();
        
        if (!$this->isEnabled()) {
            $error = 'PayFast service is not enabled or credentials are missing.';
            Log::error('PayFast: Service not enabled or credentials missing', [
                'merchant_id_set' => !empty($this->merchantId),
                'secured_key_set' => !empty($this->securedKey),
                'payfast_enabled' => Setting::get('payfastEnabled', false),
            ]);
            return ['success' => false, 'token' => null, 'error' => $error];
        }

        try {
            // PayFast GetAccessToken API requires these parameters (matching working PayFastModule)
            // Ensure basket ID is not empty
            if (empty($basketId)) {
                $basketId = $transactionParams['basket_id'] ?? 'TEST-' . time();
            }
            
            // Format amount to 2 decimal places
            $formattedAmount = $transactionParams['txnamt'] ?? number_format((float)$amount, 2, '.', '');
            
            // Build URL-encoded form data (matching working PayFastModule format exactly)
            $payload = [
                'MERCHANT_ID' => $this->merchantId,
                'SECURED_KEY' => $this->securedKey,
                'BASKET_ID' => $basketId,
                'ORDER_DATE' => $transactionParams['order_date'] ?? date('Y-m-d H:i:s'),
                'TXNAMT' => $formattedAmount,
                'CUSTOMER_MOBILE_NO' => $transactionParams['customer_mobile'] ?? '',
                'CUSTOMER_EMAIL_ADDRESS' => $transactionParams['customer_email'] ?? '',
                'SIGNATURE' => $transactionParams['signature'] ?? '',
                'VERSION' => '1.0',
                'TXNDESC' => $transactionParams['txndesc'] ?? 'Test Transaction',
                'PROCCODE' => $transactionParams['proccode'] ?? '00',
                'CURRENCY_CODE' => $transactionParams['currency_code'] ?? $currencyCode,
            ];

            $tokenApiUrl = $this->apiUrl . 'GetAccessToken';
            
            Log::info('PayFast: Getting access token', [
                'url' => $tokenApiUrl,
                'mode' => $this->mode,
                'basket_id' => $basketId,
                'amount' => $formattedAmount,
                'currency' => $currencyCode,
            ]);

            // Use asForm() to send as application/x-www-form-urlencoded (matching PayFast example)
            // Disable SSL verification for PayFast (they have certificate issues)
            $response = Http::asForm()
                ->timeout(30)
                ->withoutVerifying()
                ->post($tokenApiUrl, $payload);

            $statusCode = $response->status();
            $rawBody = $response->body();
            
            // Log the raw response for debugging
            Log::info('PayFast API Response', [
                'url' => $tokenApiUrl,
                'status_code' => $statusCode,
                'content_type' => $response->header('Content-Type'),
                'body_length' => strlen($rawBody),
                'body_preview' => substr($rawBody, 0, 500),
            ]);
            
            if ($response->failed()) {
                // Check if response is HTML (wrong URL)
                if (str_contains($rawBody, '<!doctype html') || str_contains($rawBody, '<html')) {
                    Log::error('PayFast API URL is incorrect - received HTML page instead of JSON', [
                        'url' => $tokenApiUrl,
                        'status' => $statusCode,
                    ]);
                    return [
                        'success' => false,
                        'token' => null,
                        'error' => 'Invalid PayFast API URL. The endpoint returned a website page instead of API response. Please verify the correct API Base URL with PayFast support.',
                        'http_code' => $statusCode,
                    ];
                }
                
                // Log full error details for debugging
                Log::error('PayFast token request failed', [
                    'status' => $statusCode,
                    'url' => $tokenApiUrl,
                    'body_full' => $rawBody,
                    'body_preview' => substr($rawBody, 0, 500),
                    'headers' => $response->headers(),
                ]);
                
                // Try to parse error message from response
                $errorMessage = 'Failed to get PayFast access token. Status: ' . $statusCode;
                try {
                    $responseData = $response->json();
                    // PayFast may return error in various formats
                    $errorMessage = $responseData['MESSAGE'] 
                        ?? $responseData['message'] 
                        ?? $responseData['ERROR'] 
                        ?? $responseData['error'] 
                        ?? $responseData['errorDescription']
                        ?? $responseData['error_description']
                        ?? $errorMessage;
                    
                    // Log the parsed error data
                    Log::error('PayFast error response parsed', [
                        'error_data' => $responseData,
                        'error_message' => $errorMessage,
                    ]);
                } catch (\Exception $e) {
                    // Response is not JSON, use raw body
                    if (!empty($rawBody)) {
                        $errorMessage = 'PayFast API Error: ' . substr($rawBody, 0, 200);
                        Log::warning('PayFast returned non-JSON error response', [
                            'body' => $rawBody,
                        ]);
                    }
                }
                
                return [
                    'success' => false,
                    'token' => null,
                    'error' => $errorMessage,
                    'http_code' => $statusCode,
                    'response_body' => config('app.debug') ? substr($rawBody, 0, 500) : null,
                ];
            }
            
            // Check if response is empty
            if (empty($rawBody)) {
                return [
                    'success' => false,
                    'token' => null,
                    'error' => 'PayFast returned an empty response. The API endpoint may be incorrect or the service is unavailable.',
                ];
            }
            
            // Check if response is valid JSON
            $data = $response->json();
            if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
                Log::error('PayFast returned invalid JSON', [
                    'json_error' => json_last_error_msg(),
                    'raw_body' => substr($rawBody, 0, 1000),
                ]);
                return [
                    'success' => false,
                    'token' => null,
                    'error' => 'PayFast returned invalid JSON response. Raw response: ' . substr($rawBody, 0, 200),
                ];
            }
            
            // Check for error responses
            if (isset($data['errorCode']) || isset($data['errorDescription'])) {
                $errorCode = $data['errorCode'] ?? 'Unknown';
                $errorDesc = $data['errorDescription'] ?? 'Unknown error';
                return [
                    'success' => false,
                    'token' => null,
                    'error' => "PayFast API Error (Code: {$errorCode}): {$errorDesc}",
                ];
            }
            
            // PayFast uses ACCESS_TOKEN (uppercase) instead of token (lowercase)
            if (!isset($data['ACCESS_TOKEN']) && !isset($data['token'])) {
                Log::error('PayFast response structure unexpected', [
                    'response' => $data,
                    'status_code' => $response->status(),
                    'headers' => $response->headers(),
                ]);
                
                return [
                    'success' => false,
                    'token' => null,
                    'error' => 'PayFast response missing ACCESS_TOKEN field. Received: ' . json_encode($data),
                ];
            }
            
            // Get the access token
            $accessToken = $data['ACCESS_TOKEN'] ?? $data['token'] ?? null;

            Log::debug('PayFast: Access token retrieved successfully');
            return [
                'success' => true,
                'token' => $accessToken,
                'ACCESS_TOKEN' => $accessToken,
                'error' => null,
            ];
        } catch (\Exception $e) {
            $errorMessage = 'PayFast API request failed: ' . $e->getMessage();
            Log::error('PayFast: Request exception getting access token', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return [
                'success' => false,
                'token' => null,
                'error' => $errorMessage,
            ];
        }
    }

    /**
     * Prepare payment form data for PayFast
     * Based on WordPress plugin structure
     */
    public function preparePaymentData(array $donationData, string $basketId, string $token): array
    {
        // Load settings dynamically to ensure they're up-to-date
        $this->loadSettings();
        
        $appUrl = config('app.url');
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        $merchantName = Setting::get('foundationName', 'Al Gohar Foundation');
        $storeId = Setting::get('payfastStoreId', '');
        $amount = number_format($donationData['amount'], 2, '.', '');
        
        // Generate signature using md5(merchantId . securedKey . amount)
        $signature = md5($this->merchantId . $this->securedKey . $amount);
        
        return [
            'MERCHANT_ID' => $this->merchantId,
            'MERCHANT_NAME' => $merchantName,
            'STORE_ID' => $storeId,
            'TOKEN' => $token,
            'PROCCODE' => '00',
            'SIGNATURE' => $signature,
            'VERSION' => 'Laravel1.0',
            'TXNDESC' => $donationData['description'] ?? 'Payment For ' . $merchantName,
            'SUCCESS_URL' => $appUrl . '/api/payments/payfast/success',
            'FAILURE_URL' => $appUrl . '/api/payments/payfast/failure',
            'BASKET_ID' => $basketId,
            'ORDER_DATE' => now()->format('Y-m-d H:i:s'),
            'CHECKOUT_URL' => $appUrl . '/api/payments/payfast/failure',
            'TXNAMT' => $amount,
            'CURRENCY_CODE' => $donationData['currency_code'] ?? 'PKR',
            'CUSTOMER_EMAIL_ADDRESS' => $donationData['donor_email'],
            'CUSTOMER_MOBILE_NO' => $donationData['donor_phone'] ?? '',
        ];
    }

    /**
     * Generate PayFast payment form HTML (Official GoPayFast Integration)
     * 
     * @param array $orderData Order data containing amount, customer info, etc.
     * @return array Form data with HTML
     * @throws \Exception
     */
    public function generatePaymentForm(array $orderData): array
    {
        // Load settings dynamically to ensure they're up-to-date
        $this->loadSettings();
        
        if (!$this->isEnabled()) {
            throw new \Exception('PayFast is not configured or enabled');
        }

        try {
            $merchantId = $this->merchantId;
            $securedKey = $this->securedKey;
            $basketId = $orderData['order_number'];
            $currencyCode = $orderData['currency'] ?? 'PKR';
            $customerMobile = $orderData['customer_mobile'] ?? '03000000000';
            $customerEmail = $orderData['customer_email'];
            $description = $orderData['description'] ?? 'Payment for Order ' . $basketId;
            $merchantName = $orderData['merchant_name'] ?? Setting::get('foundationName', config('app.name', 'Merchant'));
            $storeId = $orderData['store_id'] ?? Setting::get('payfastStoreId', '');
            
            // CRITICAL: Format amount as string with exactly 2 decimal places (no thousands separator)
            // This must match EXACTLY between token request and form submission
            $amount = number_format((float)$orderData['amount'], 2, '.', '');
            
            // Validate amount is not zero or negative
            if ((float)$amount <= 0) {
                throw new \Exception('Invalid transaction amount. Amount must be greater than 0.');
            }
            
            // Validate basket ID is not empty
            if (empty($basketId)) {
                throw new \Exception('Basket ID is required for PayFast transaction.');
            }
            
            // Validate customer email
            if (empty($customerEmail) || !filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
                throw new \Exception('Valid customer email is required for PayFast transaction.');
            }

            // Get access token using existing method
            // CRITICAL: The basket_id, txnamt, and currency_code MUST match exactly in the form
            $orderDate = date('Y-m-d H:i:s');
            $tokenResponse = $this->getAccessToken($basketId, (float)$amount, $currencyCode, [
                'basket_id' => $basketId,
                'order_date' => $orderDate,
                'txnamt' => $amount, // Use formatted amount string - MUST match form
                'customer_mobile' => $customerMobile,
                'customer_email' => $customerEmail,
                'txndesc' => $description,
                'proccode' => '00',
                'currency_code' => $currencyCode,
            ]);

            if (!$tokenResponse['success'] || !isset($tokenResponse['ACCESS_TOKEN'])) {
                Log::error('PayFast token response missing ACCESS_TOKEN field', [
                    'response' => $tokenResponse,
                    'base_url' => $this->apiUrl,
                    'basket_id' => $basketId,
                    'amount' => $amount,
                    'currency' => $currencyCode,
                ]);
                throw new \Exception('Access token not received from PayFast. Error: ' . ($tokenResponse['error'] ?? 'Unknown error'));
            }

            $accessToken = $tokenResponse['ACCESS_TOKEN'];
            
            // Validate token is not empty
            if (empty($accessToken)) {
                throw new \Exception('PayFast returned an empty access token. Please verify your credentials.');
            }

            // Generate signature using md5(merchantId . securedKey . amount)
            // CRITICAL: Use the EXACT same amount string that was used in token request
            $signature = md5($merchantId . $securedKey . $amount);
            
            // Log signature calculation for debugging
            Log::debug('PayFast signature calculation', [
                'merchant_id_length' => strlen($merchantId),
                'secured_key_length' => strlen($securedKey),
                'amount' => $amount,
                'signature' => $signature,
            ]);

            // Build form HTML
            $postUrl = $this->getPaymentUrl();
            // Ensure URLs are absolute and properly formatted (no trailing slashes)
            $appUrl = rtrim(config('app.url'), '/');
            $successUrl = $orderData['success_url'] ?? $appUrl . '/api/payments/payfast/success';
            $failureUrl = $orderData['failure_url'] ?? $appUrl . '/api/payments/payfast/failure';
            $checkoutUrl = $orderData['checkout_url'] ?? $appUrl . '/api/payments/payfast/checkout';
            
            // CRITICAL: Use the SAME order_date that was used in token request
            // This ensures consistency between token generation and form submission

            // Validate all required fields before building form
            $requiredFields = [
                'merchant_id' => $merchantId,
                'token' => $accessToken,
                'basket_id' => $basketId,
                'amount' => $amount,
                'currency' => $currencyCode,
                'customer_email' => $customerEmail,
            ];
            
            foreach ($requiredFields as $fieldName => $fieldValue) {
                if (empty($fieldValue)) {
                    throw new \Exception("Required PayFast field '{$fieldName}' is empty. Cannot generate payment form.");
                }
            }

            // Log form data for debugging (without sensitive data)
            Log::info('PayFast payment form generation', [
                'basket_id' => $basketId,
                'amount' => $amount,
                'currency' => $currencyCode,
                'token_length' => strlen($accessToken),
                'token_preview' => substr($accessToken, 0, 10) . '...',
                'signature_preview' => substr($signature, 0, 10) . '...',
                'order_date' => $orderDate,
                'customer_email' => $customerEmail,
                'customer_mobile' => $customerMobile,
                'post_url' => $postUrl,
                'success_url' => $successUrl,
                'failure_url' => $failureUrl,
                'checkout_url' => $checkoutUrl,
            ]);

            // CRITICAL: Ensure form field order and values match PayFast requirements exactly
            // The BASKET_ID, TXNAMT, CURRENCY_CODE, and ORDER_DATE MUST match the token request exactly
            $formHtml = sprintf('
<form name="PayFastForm" id="PayFastForm" action="%s" method="post">
    <input type="hidden" name="MERCHANT_ID" value="%s">
    <input type="hidden" name="MERCHANT_NAME" value="%s">
    <input type="hidden" name="TOKEN" value="%s">
    <input type="hidden" name="PROCCODE" value="00">
    <input type="hidden" name="PLUGIN_VERSION" value="Laravel">
    <input type="hidden" name="TXNAMT" value="%s">
    <input type="hidden" name="CUSTOMER_MOBILE_NO" value="%s">
    <input type="hidden" name="CUSTOMER_EMAIL_ADDRESS" value="%s">
    <input type="hidden" name="SIGNATURE" value="%s">
    <input type="hidden" name="VERSION" value="Laravel1.0">
    <input type="hidden" name="TXNDESC" value="%s">
    <input type="hidden" name="CURRENCY_CODE" value="%s">
    <input type="hidden" name="SUCCESS_URL" value="%s">
    <input type="hidden" name="FAILURE_URL" value="%s">
    <input type="hidden" name="BASKET_ID" value="%s">
    <input type="hidden" name="ORDER_DATE" value="%s">
    <input type="hidden" name="CHECKOUT_URL" value="%s">
    <input type="hidden" name="STORE_ID" value="%s">
    <input type="hidden" name="TRAN_TYPE" value="ECOMM_PURCHASE">
</form>
<script type="text/javascript">
    document.getElementById("PayFastForm").submit();
</script>',
                htmlspecialchars($postUrl, ENT_QUOTES, 'UTF-8'),
                htmlspecialchars($merchantId, ENT_QUOTES, 'UTF-8'),
                htmlspecialchars($merchantName, ENT_QUOTES, 'UTF-8'),
                htmlspecialchars($accessToken, ENT_QUOTES, 'UTF-8'),
                htmlspecialchars($amount, ENT_QUOTES, 'UTF-8'), // Must match token request
                htmlspecialchars($customerMobile, ENT_QUOTES, 'UTF-8'),
                htmlspecialchars($customerEmail, ENT_QUOTES, 'UTF-8'),
                htmlspecialchars($signature, ENT_QUOTES, 'UTF-8'),
                htmlspecialchars($description, ENT_QUOTES, 'UTF-8'),
                htmlspecialchars($currencyCode, ENT_QUOTES, 'UTF-8'), // Must match token request
                htmlspecialchars($successUrl, ENT_QUOTES, 'UTF-8'),
                htmlspecialchars($failureUrl, ENT_QUOTES, 'UTF-8'),
                htmlspecialchars($basketId, ENT_QUOTES, 'UTF-8'), // Must match token request
                htmlspecialchars($orderDate, ENT_QUOTES, 'UTF-8'), // Must match token request
                htmlspecialchars($checkoutUrl, ENT_QUOTES, 'UTF-8'),
                htmlspecialchars($storeId, ENT_QUOTES, 'UTF-8')
            );
            
            // Log the exact form values being sent for debugging
            Log::debug('PayFast form values being submitted', [
                'MERCHANT_ID' => $merchantId,
                'BASKET_ID' => $basketId,
                'TXNAMT' => $amount,
                'CURRENCY_CODE' => $currencyCode,
                'ORDER_DATE' => $orderDate,
                'TOKEN_preview' => substr($accessToken, 0, 20) . '...',
                'SIGNATURE' => $signature,
            ]);

            Log::info('PayFast payment form generated', [
                'order_number' => $basketId,
                'amount' => $amount,
                'currency' => $currencyCode,
            ]);

            return [
                'success' => true,
                'payment_form_html' => $formHtml,
                'order_number' => $basketId,
                'amount' => $amount,
            ];

        } catch (\Exception $e) {
            Log::error('PayFast payment form generation failed', [
                'error' => $e->getMessage(),
                'order_data' => $orderData,
            ]);
            throw $e;
        }
    }

    /**
     * Get PayFast payment form action URL
     */
    public function getPaymentUrl(): string
    {
        // Load settings dynamically to ensure they're up-to-date
        $this->loadSettings();
        
        // PayFast webcheckout endpoint
        if ($this->mode === 'production') {
            return 'https://ipg1.apps.net.pk/Ecommerce/api/Transaction/PostTransaction';
        } else {
            return 'https://ipguat.apps.net.pk/Ecommerce/api/Transaction/PostTransaction';
        }
    }

    /**
     * Validate hash from PayFast callback
     */
    public function validateHash(string $basketId, string $errCode, string $validationHash): bool
    {
        // Load settings dynamically to ensure they're up-to-date
        $this->loadSettings();
        
        $validationString = sprintf(
            "%s|%s|%s|%s",
            $basketId,
            $this->securedKey,
            $this->merchantId,
            $errCode
        );

        $calculatedHash = hash('sha256', $validationString);

        return strtolower($calculatedHash) === strtolower($validationHash);
    }

    /**
     * Check if error code indicates success
     */
    public function isSuccessCode(string $errCode): bool
    {
        return in_array($errCode, ['000', '00']);
    }

    /**
     * Get human-readable error message for PayFast error codes
     */
    public function getErrorMessage(string $errCode, string $errMsg = ''): string
    {
        $errorMessages = [
            '9000' => 'Transaction rejected by PayFast. This usually indicates: (1) Merchant account not fully activated, (2) Payment method (Wallet/Bank) not enabled for your account, (3) Account restrictions or limitations, (4) Minimum transaction amount not met, or (5) Test/Production environment mismatch. Please contact PayFast support to verify your account status and enabled payment methods.',
            '9001' => 'Invalid merchant credentials or account not found.',
            '9002' => 'Invalid transaction parameters.',
            '9003' => 'Transaction amount is below minimum allowed.',
            '9004' => 'Transaction amount exceeds maximum allowed.',
            '9005' => 'Invalid currency code.',
            '9006' => 'Invalid basket ID or order number.',
            '9007' => 'Token expired or invalid.',
            '9008' => 'Signature validation failed.',
            '9009' => 'Payment method not available for this transaction.',
        ];

        $baseMessage = $errorMessages[$errCode] ?? "PayFast Error (Code: {$errCode})";
        
        if (!empty($errMsg) && $errMsg !== 'REJECTED') {
            return $baseMessage . ' Additional details: ' . $errMsg;
        }
        
        return $baseMessage;
    }

    /**
     * Test connection with provided credentials
     * Uses POST request with form data (matching working PayFastModule)
     */
    public function testConnection(string $merchantId, string $securedKey, string $mode = 'sandbox'): array
    {
        // Validate inputs
        if (empty($merchantId) || empty($securedKey)) {
            return [
                'success' => false,
                'message' => 'Merchant ID and Secured Key are required.',
                'error' => 'missing_credentials',
            ];
        }

        // Temporarily set credentials for testing
        $this->merchantId = $merchantId;
        $this->securedKey = $securedKey;
        $this->mode = $mode;

        // Set API URL based on mode
        if ($mode === 'production') {
            $this->apiUrl = 'https://ipg1.apps.net.pk/Ecommerce/api/Transaction/';
        } else {
            $this->apiUrl = 'https://ipguat.apps.net.pk/Ecommerce/api/Transaction/';
        }

        try {
            // Generate test basket ID for reference
            $basketId = 'TEST-' . strtoupper(Str::random(8));
            $testAmount = '1.00'; // Minimum test amount
            $currencyCode = 'PKR';
            
            // Use the getAccessToken method which now uses POST
            // Pass all required transaction parameters to match working PayFastModule
            $tokenResponse = $this->getAccessToken($basketId, (float)$testAmount, $currencyCode, [
                'basket_id' => $basketId,
                'order_date' => date('Y-m-d H:i:s'),
                'txnamt' => $testAmount,
                'customer_mobile' => '',
                'customer_email' => '',
                'txndesc' => 'Test Connection',
                'proccode' => '00',
                'currency_code' => $currencyCode,
            ]);

            if ($tokenResponse['success'] && isset($tokenResponse['ACCESS_TOKEN'])) {
                Log::info('PayFast: Connection successful', [
                    'mode' => $mode,
                    'basket_id' => $basketId,
                ]);

                return [
                    'success' => true,
                    'message' => 'Connection successful! Credentials are valid.',
                    'basket_id' => $basketId,
                    'mode' => $mode,
                    'url_used' => $mode,
                ];
            } else {
                $errorMessage = $tokenResponse['error'] ?? 'Failed to get access token';
                $httpCode = $tokenResponse['http_code'] ?? 400;
                
                return [
                    'success' => false,
                    'message' => $errorMessage,
                    'http_code' => $httpCode,
                    'response' => $tokenResponse['error'] ?? 'Unknown error',
                    'debug' => config('app.debug') ? [
                        'mode' => $mode,
                        'basket_id' => $basketId,
                    ] : null,
                ];
            }
        } catch (\Exception $e) {
            Log::error('PayFast testConnection exception', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'An error occurred while testing connection: ' . $e->getMessage(),
                'error' => $e->getMessage(),
                'debug' => config('app.debug') ? [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ] : null,
            ];
        }
    }
}

