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
        @if(isset($transaction_id))
            <p><strong>Transaction ID:</strong> {{ $transaction_id }}</p>
        @endif
        @if(isset($basket_id))
            <p><strong>Basket ID:</strong> {{ $basket_id }}</p>
        @endif
        @if(isset($order_date))
            <p><strong>Date:</strong> {{ $order_date }}</p>
        @endif
        <a class="button" href="{{ config('app.frontend_url', '/') }}">Return to Home</a>
    </div>
</body>
</html>

