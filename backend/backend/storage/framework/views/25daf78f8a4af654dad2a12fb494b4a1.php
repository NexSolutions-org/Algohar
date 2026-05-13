<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Donation Status Update</title>
</head>
<body style="font-family: Inter, Arial, sans-serif; line-height: 1.6; color: #000000; background-color: #F5F5F5; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #E60000; padding-bottom: 15px;">
            <h1 style="color: #E60000; margin: 0; font-size: 24px; font-weight: bold;">Al Gohar Foundation</h1>
        </div>
        
        <div style="background-color: #F5F5F5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #000000; margin-top: 0; font-size: 20px;">Donation Status Update</h2>
            <p style="color: #000000;">Dear <?php echo e($donation->donor_name); ?>,</p>
            <p style="color: #000000;">We wanted to inform you that your donation status has been updated.</p>
            
            <div style="background-color: #FFFFFF; border: 2px solid #E60000; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #E60000; margin-top: 0; font-size: 18px; border-bottom: 2px solid #E60000; padding-bottom: 10px;">Status Change</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Previous Status:</td>
                        <td style="padding: 8px 0; color: #000000;"><?php echo e(ucfirst($oldStatus)); ?></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Current Status:</td>
                        <td style="padding: 8px 0;">
                            <span style="background-color: <?php echo e($newStatus === 'completed' ? '#E8F5E9' : ($newStatus === 'failed' ? '#FFEBEE' : '#FFF3F3')); ?>; color: <?php echo e($newStatus === 'completed' ? '#00AA00' : ($newStatus === 'failed' ? '#D32F2F' : '#E60000')); ?>; border: 1px solid <?php echo e($newStatus === 'completed' ? '#00AA00' : ($newStatus === 'failed' ? '#D32F2F' : '#E60000')); ?>; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                                <?php echo e(ucfirst($newStatus)); ?>

                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Transaction ID:</td>
                        <td style="padding: 8px 0; font-family: monospace; color: #000000;"><?php echo e($donation->transaction_id); ?></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Amount:</td>
                        <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #E60000;">PKR <?php echo e(number_format($donation->amount, 2)); ?></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #333333;">Date:</td>
                        <td style="padding: 8px 0; color: #000000;"><?php echo e(now()->format('F d, Y h:i A')); ?></td>
                    </tr>
                </table>
            </div>

            <?php if($newStatus === 'completed'): ?>
            <div style="background-color: #E8F5E9; border: 2px solid #00AA00; padding: 15px; margin: 20px 0; border-radius: 8px;">
                <p style="color: #000000; margin: 0; font-weight: bold;">✅ Payment Completed</p>
                <p style="color: #000000; margin: 10px 0 0 0;">Your donation has been successfully processed. Thank you for your generous contribution!</p>
            </div>
            <?php elseif($newStatus === 'failed'): ?>
            <div style="background-color: #FFEBEE; border: 2px solid #D32F2F; padding: 15px; margin: 20px 0; border-radius: 8px;">
                <p style="color: #000000; margin: 0; font-weight: bold;">❌ Payment Failed</p>
                <p style="color: #000000; margin: 10px 0 0 0;">Unfortunately, your payment could not be processed. Please try again or contact us for assistance.</p>
            </div>
            <?php elseif($newStatus === 'pending'): ?>
            <div style="background-color: #FFF9E6; border: 2px solid #FFA500; padding: 15px; margin: 20px 0; border-radius: 8px;">
                <p style="color: #000000; margin: 0; font-weight: bold;">⏳ Payment Pending</p>
                <p style="color: #000000; margin: 10px 0 0 0;">Your payment is currently being processed. You will receive a confirmation email once it's completed.</p>
            </div>
            <?php endif; ?>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E0E0E0;">
            <p style="color: #000000; font-size: 14px; margin: 10px 0;">
                <?php if($newStatus === 'completed'): ?>
                Your support helps us continue our mission to serve those in need.
                <?php else: ?>
                If you have any questions about this status update, please don't hesitate to contact us.
                <?php endif; ?>
            </p>
            <p style="color: #666666; font-size: 12px; margin: 5px 0;">
                This is an automated notification email.
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

<?php /**PATH F:\Al Gohar Foundation\backend\resources\views/emails/user/donation-status-update.blade.php ENDPATH**/ ?>