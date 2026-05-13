<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Failed</title>
</head>
<body style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #000000; background-color: #F5F5F5; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #E60000; padding-bottom: 15px;">
            <h1 style="color: #E60000; margin: 0; font-size: 24px; font-weight: bold;">Al Gohar Foundation</h1>
        </div>
        
        <div style="background-color: #F5F5F5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #000000; margin-top: 0; font-size: 20px;">Payment Failed</h2>
            <p style="color: #000000;">Hello Admin,</p>
            <p style="color: #000000;">A payment has failed and requires your attention.</p>
            
            <div style="background-color: #FFFFFF; border: 2px solid #E60000; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #E60000; margin-top: 0; font-size: 18px; border-bottom: 2px solid #E60000; padding-bottom: 10px;">Payment Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Payment ID:</td>
                        <td style="padding: 8px 0; font-family: monospace; color: #000000;">{{ $payment->transaction_id }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Amount:</td>
                        <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #E60000;">PKR {{ number_format($payment->amount, 2) }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Status:</td>
                        <td style="padding: 8px 0;">
                            <span style="background-color: #FFF3F3; color: #E60000; border: 1px solid #E60000; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                                {{ ucfirst($payment->status) }}
                            </span>
                        </td>
                    </tr>
                    @if($payment->donation)
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Donation ID:</td>
                        <td style="padding: 8px 0; font-family: monospace; color: #000000;">{{ $payment->donation->transaction_id }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Donor:</td>
                        <td style="padding: 8px 0; color: #000000;">{{ $payment->donation->donor_name }} ({{ $payment->donation->donor_email }})</td>
                    </tr>
                    @endif
                    @if($payment->user)
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">User:</td>
                        <td style="padding: 8px 0; color: #000000;">{{ $payment->user->name }} ({{ $payment->user->email }})</td>
                    </tr>
                    @endif
                    @if($payment->gateway_response)
                    @php
                        $gatewayResponse = is_string($payment->gateway_response) 
                            ? json_decode($payment->gateway_response, true) 
                            : $payment->gateway_response;
                        $errorMsg = $gatewayResponse['err_msg'] ?? ($gatewayResponse['error'] ?? 'Unknown error');
                        $errorCode = $gatewayResponse['err_code'] ?? ($gatewayResponse['error_code'] ?? 'N/A');
                    @endphp
                    @if($errorMsg && $errorMsg !== 'Unknown error')
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Error Message:</td>
                        <td style="padding: 8px 0; color: #E60000; font-weight: bold;">{{ $errorMsg }}</td>
                    </tr>
                    @endif
                    @if($errorCode && $errorCode !== 'N/A')
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Error Code:</td>
                        <td style="padding: 8px 0; color: #000000;">{{ $errorCode }}</td>
                    </tr>
                    @endif
                    @endif
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Date:</td>
                        <td style="padding: 8px 0; color: #000000;">{{ $payment->created_at->format('F d, Y h:i A') }}</td>
                    </tr>
                </table>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E0E0E0;">
            <p style="color: #666666; font-size: 12px; margin: 5px 0;">
                This is an automated notification. Please do not reply to this email.
            </p>
            @if($companyEmail || $companyPhone)
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #E0E0E0;">
                <p style="color: #000000; font-size: 13px; font-weight: bold; margin: 5px 0;">Contact Information</p>
                @if($companyEmail)
                <p style="color: #333333; font-size: 12px; margin: 3px 0;">
                    Email: <a href="mailto:{{ $companyEmail }}" style="color: #E60000; text-decoration: none; font-weight: bold;">{{ $companyEmail }}</a>
                </p>
                @endif
                @if($companyPhone)
                <p style="color: #333333; font-size: 12px; margin: 3px 0;">
                    Phone: <a href="tel:{{ $companyPhone }}" style="color: #E60000; text-decoration: none; font-weight: bold;">{{ $companyPhone }}</a>
                </p>
                @endif
            </div>
            @endif
        </div>
    </div>
</body>
</html>

