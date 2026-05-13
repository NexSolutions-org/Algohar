<?php

namespace App\Mail\Admin;

use App\Models\Payment;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentFailedNotification extends Mailable
{
    use Queueable, SerializesModels;

    public Payment $payment;
    public string $companyEmail;
    public string $companyPhone;

    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
        $this->companyEmail = $this->getCompanyEmail();
        $this->companyPhone = $this->getCompanyPhone();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Payment Failed - Al Gohar Foundation',
        );
    }

    public function content(): Content
    {
        return new Content(
            html: 'emails.admin.payment-failed',
            with: [
                'payment' => $this->payment,
                'companyEmail' => $this->companyEmail,
                'companyPhone' => $this->companyPhone,
            ],
        );
    }

    private function getCompanyEmail(): string
    {
        return Setting::get('contactEmailContact') 
            ?? Setting::get('contactEmail1') 
            ?? Setting::get('foundationEmail') 
            ?? 'contact@algohar.org';
    }

    private function getCompanyPhone(): string
    {
        return Setting::get('contactPhone1') 
            ?? Setting::get('foundationPhone') 
            ?? '';
    }
}

