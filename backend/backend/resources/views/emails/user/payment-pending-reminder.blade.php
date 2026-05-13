<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Your Donation Payment</title>
</head>
<body style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #000000; background-color: #F5F5F5; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #E60000; padding-bottom: 15px;">
            <h1 style="color: #E60000; margin: 0; font-size: 24px; font-weight: bold;">Al Gohar Foundation</h1>
        </div>
        
        <div style="background-color: #F5F5F5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #000000; margin-top: 0; font-size: 20px;">⏳ Complete Your Donation Payment</h2>
            <p style="color: #000000;">Dear {{ $donation->donor_name }},</p>
            <p style="color: #000000;">We noticed that your donation payment is still pending. Please complete your payment to finalize your contribution.</p>
            
            <div style="background-color: #FFFFFF; border: 2px solid #FFA500; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #FFA500; margin-top: 0; font-size: 18px; border-bottom: 2px solid #FFA500; padding-bottom: 10px;">Donation Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Transaction ID:</td>
                        <td style="padding: 8px 0; font-family: monospace; color: #000000;">{{ $donation->transaction_id }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Amount:</td>
                        <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #E60000;">PKR {{ number_format($donation->amount, 2) }}</td>
                    </tr>
                    @if($donation->donation_type)
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Type:</td>
                        <td style="padding: 8px 0; color: #000000;">{{ ucfirst($donation->donation_type) }}</td>
                    </tr>
                    @endif
                    @if($donation->cause)
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Cause:</td>
                        <td style="padding: 8px 0; color: #000000;">{{ $donation->cause }}</td>
                    </tr>
                    @endif
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Status:</td>
                        <td style="padding: 8px 0;">
                            <span style="background-color: #FFF9E6; color: #FFA500; border: 1px solid #FFA500; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                                Pending
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Date:</td>
                        <td style="padding: 8px 0; color: #000000;">{{ $donation->created_at->format('F d, Y h:i A') }}</td>
                    </tr>
                </table>
            </div>

            <div style="background-color: #FFF9E6; border: 2px solid #FFA500; padding: 15px; margin: 20px 0; border-radius: 8px;">
                <p style="color: #000000; margin: 0; font-weight: bold;">⏳ Action Required</p>
                <p style="color: #000000; margin: 10px 0 0 0;">Please complete your payment to finalize your donation. If you've already made the payment, please allow some time for it to be processed.</p>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E0E0E0;">
            <p style="color: #000000; font-size: 14px; margin: 10px 0;">
                Your contribution makes a real difference. Thank you for your support!
            </p>
            <p style="color: #666666; font-size: 12px; margin: 5px 0;">
                This is a reminder email. If you've already completed your payment, please ignore this message.
            </p>
            @if($companyEmail || $companyPhone)
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #E0E0E0;">
                <p style="color: #000000; font-size: 13px; font-weight: bold; margin: 5px 0;">Need Help?</p>
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

