<?php
// Hardcoded values for merchant ID and secured key
$merchant_id = "14833"; // Replace with your merchant ID
$secured_key = "rPcy4T7GQkSCFsHBLdn26s";  // Replace with your secured key

// Get values from URL parameters
$err_code = isset($_GET['err_code']) ? $_GET['err_code'] : '';
$err_msg = isset($_GET['err_msg']) ? $_GET['err_msg'] : '';
$transaction_id = isset($_GET['transaction_id']) ? $_GET['transaction_id'] : '';
$basket_id = isset($_GET['basket_id']) ? $_GET['basket_id'] : '';
$order_date = isset($_GET['order_date']) ? $_GET['order_date'] : '';
$validation_hash = isset($_GET['validation_hash']) ? $_GET['validation_hash'] : '';

// Validate hash
$validation_string = sprintf(
    "%s|%s|%s|%s",
    $basket_id,
    $secured_key,
    $merchant_id,
    $err_code
);

$calculated_hash = hash('sha256', $validation_string);
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Success</title>
    <link href="https://fonts.googleapis.com/css?family=Nunito+Sans:400,400i,700,900&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: "Nunito Sans", sans-serif;
            text-align: center;
            padding: 40px 0;
            background: #EBF0F5;
        }

        .card {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
            display: inline-block;
            margin: 0 auto;
            text-align: center;
            max-width: 800px;
            /* Increased width */
            width: 100%;
        }

        h1 {
            color: #88B04B;
            font-weight: 900;
            font-size: 36px;
            margin-bottom: 10px;
        }

        p {
            color: #404F5E;
            font-size: 18px;
            margin: 10px 0;
        }

        .button {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            font-size: 16px;
            border-radius: 5px;
            margin-top: 20px;
        }

        .button:hover {
            background-color: #45a049;
        }

        pre {
            text-align: center;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            /* Enable horizontal scrolling for very long text */
            white-space: pre-wrap;
            /* Wrap text if it doesn't fit */
            word-wrap: break-word;
            /* Break long words */
            font-size: 14px;
            /* Adjust font size for better readability */
        }

        .checkmark {
            font-size: 60px;
            color: #9ABC66;
        }
    </style>
</head>

<body>
    <div class="card">
        <div style="margin-bottom: 20px;">
            <span class="checkmark">✓</span>
        </div>
        <h1>Thank You!</h1>
        <p>Your payment has been received successfully.</p>
        <pre>
Basket ID: <?php echo htmlspecialchars($basket_id); ?> <br />
Merchant ID: <?php echo htmlspecialchars($merchant_id); ?> <br />
Error Code: <?php echo htmlspecialchars($err_code); ?> <br />

Example: Basket_ID|Your Secured key|Your Merchant ID|Error Code
<br />
Concatenated Validation String: <?php echo htmlspecialchars($validation_string); ?><br /><br />
Received Validation Hash: <?php echo htmlspecialchars($validation_hash); ?> <br />
Calculated Hash: <?php echo htmlspecialchars($calculated_hash); ?> <br />
        </pre>

        <?php
        // Compare hashes
        if (strtolower($calculated_hash) !== strtolower($validation_hash)) {
            echo "<p><strong style='color: red;'>Hash mismatch! Transaction could not be verified.</strong></p>";
        } elseif ($err_code === '000' || $err_code === '00') {
            echo "<p><strong>Transaction Verified</strong></p>";
            echo "<p>Transaction ID: " . htmlspecialchars($transaction_id) . "</p>";
            echo "<p>Date: " . htmlspecialchars($order_date) . "</p>";
        } else {
            echo "<p><strong style='color: red;'>Transaction Failed.</strong></p>";
            echo "<p>Message: " . htmlspecialchars($err_msg) . "</p>";
        }
        ?>

        <a class="button" href="http://localhost/redirection/payment.php">Go to Shop</a>
    </div>
</body>

</html>

