<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Code</title>
</head>
<body style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #000000; background-color: #F5F5F5; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #E60000; padding-bottom: 15px;">
            <h1 style="color: #E60000; margin: 0; font-size: 24px; font-weight: bold;">Al Gohar Foundation</h1>
        </div>
        
        <div style="background-color: #F5F5F5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #000000; margin-top: 0; font-size: 20px;">Your Login OTP Code</h2>
            <p style="color: #000000;">Hello <?php echo e($name); ?>,</p>
            <p style="color: #000000;">You requested a login verification code. Use the code below to complete your login:</p>
            
            <div style="background-color: #FFFFFF; border: 2px dashed #E60000; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                <h1 style="color: #E60000; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: monospace; font-weight: bold;"><?php echo e($otp); ?></h1>
            </div>
            
            <p style="color: #333333; font-size: 14px;">
                <strong style="color: #000000;">This code will expire in 10 minutes.</strong><br>
                If you didn't request this code, please ignore this email.
            </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E0E0E0;">
            <p style="color: #666666; font-size: 12px; margin: 0;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>

<?php /**PATH F:\Al Gohar Foundation\backend\resources\views/emails/otp.blade.php ENDPATH**/ ?>