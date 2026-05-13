<?php

namespace App\Mail\Admin;

use App\Models\User;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentMethodDeletedNotification extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public string $paymentMethodType;
    public string $paymentMethodProvider;
    public string $companyEmail;
    public string $companyPhone;

    public function __construct(User $user, string $paymentMethodType, string $paymentMethodProvider = '')
    {
        $this->user = $user;
        $this->paymentMethodType = $paymentMethodType;
        $this->paymentMethodProvider = $paymentMethodProvider;
        $this->companyEmail = $this->getCompanyEmail();
        $this->companyPhone = $this->getCompanyPhone();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Payment Method Deleted - Al Gohar Foundation',
        );
    }

    public function content(): Content
    {
        return new Content(
            html: 'emails.admin.payment-method-deleted',
            with: [
                'user' => $this->user,
                'paymentMethodType' => $this->paymentMethodType,
                'paymentMethodProvider' => $this->paymentMethodProvider,
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

