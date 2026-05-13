<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Your Donation</title>
</head>
<body style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #000000; background-color: #F5F5F5; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #E60000; padding-bottom: 15px;">
            <h1 style="color: #E60000; margin: 0; font-size: 24px; font-weight: bold;">Al Gohar Foundation</h1>
        </div>
        
        <div style="background-color: #F5F5F5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #000000; margin-top: 0; font-size: 20px;">Thank You for Your Donation!</h2>
            <p style="color: #000000;">Dear <?php echo e($donation->donor_name); ?>,</p>
            <p style="color: #000000;">We have received your donation request and truly appreciate your generosity and support for our cause.</p>
            
            <div style="background-color: #FFFFFF; border: 2px solid #E60000; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #E60000; margin-top: 0; font-size: 18px; border-bottom: 2px solid #E60000; padding-bottom: 10px;">Donation Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Transaction ID:</td>
                        <td style="padding: 8px 0; font-family: monospace; color: #000000;"><?php echo e($donation->transaction_id); ?></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Amount:</td>
                        <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #E60000;">PKR <?php echo e(number_format($donation->amount, 2)); ?></td>
                    </tr>
                    <?php if($donation->donation_type): ?>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Type:</td>
                        <td style="padding: 8px 0; color: #000000;"><?php echo e(ucfirst($donation->donation_type)); ?></td>
                    </tr>
                    <?php endif; ?>
                    <?php if($donation->cause): ?>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Cause:</td>
                        <td style="padding: 8px 0; color: #000000;"><?php echo e($donation->cause); ?></td>
                    </tr>
                    <?php endif; ?>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Status:</td>
                        <td style="padding: 8px 0;">
                            <span style="background-color: #FFF3F3; color: #E60000; border: 1px solid #E60000; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                                <?php echo e(ucfirst($donation->status)); ?>

                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Date:</td>
                        <td style="padding: 8px 0; color: #000000;"><?php echo e($donation->created_at->format('F d, Y h:i A')); ?></td>
                    </tr>
                </table>
            </div>

            <?php if($donation->status === 'pending'): ?>
            <div style="background-color: #FFF9E6; border: 2px solid #FFA500; padding: 15px; margin: 20px 0; border-radius: 8px;">
                <p style="color: #000000; margin: 0; font-weight: bold;">⏳ Payment Pending</p>
                <p style="color: #000000; margin: 10px 0 0 0;">Your payment is currently pending. You will receive a confirmation email once your payment is processed.</p>
            </div>
            <?php endif; ?>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E0E0E0;">
            <p style="color: #000000; font-size: 14px; margin: 10px 0;">
                Your contribution makes a real difference in the lives of those we serve.
            </p>
            <p style="color: #666666; font-size: 12px; margin: 5px 0;">
                This is an automated confirmation email. Please keep this for your records.
            </p>
            <?php if($companyEmail || $companyPhone): ?>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #E0E0E0;">
                <p style="color: #000000; font-size: 13px; font-weight: bold; margin: 5px 0;">Need Help?</p>
                <?php if($companyEmail): ?>
                <p style="color: #333333; font-size: 12px; margin: 3px 0;">
                    Email: <a href="mailto:<?php echo e($companyEmail); ?>" style="color: #E60000; text-decoration: none; font-weight: bold;"><?php echo e($companyEmail); ?></a>
                </p>
                <?php endif; ?>
                <?php if($companyPhone): ?>
                <p style="color: #333333; font-size: 12px; margin: 3px 0;">
                    Phone: <a href="tel:<?php echo e($companyPhone); ?>" style="color: #E60000; text-decoration: none; font-weight: bold;"><?php echo e($companyPhone); ?></a>
                </p>
                <?php endif; ?>
            </div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>

<?php /**PATH F:\Al Gohar Foundation\backend\resources\views/emails/user/donation-confirmation.blade.php ENDPATH**/ ?>