<?php

namespace App\Mail\Admin;

use App\Models\PaymentMethod;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentMethodUpdatedNotification extends Mailable
{
    use Queueable, SerializesModels;

    public PaymentMethod $paymentMethod;
    public string $changeType;
    public string $companyEmail;
    public string $companyPhone;

    public function __construct(PaymentMethod $paymentMethod, string $changeType = 'updated')
    {
        $this->paymentMethod = $paymentMethod;
        $this->changeType = $changeType;
        $this->companyEmail = $this->getCompanyEmail();
        $this->companyPhone = $this->getCompanyPhone();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Payment Method Updated - Al Gohar Foundation',
        );
    }

    public function content(): Content
    {
        return new Content(
            html: 'emails.admin.payment-method-updated',
            with: [
                'paymentMethod' => $this->paymentMethod,
                'changeType' => $this->changeType,
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

