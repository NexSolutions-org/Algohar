<?php

namespace App\Mail\Admin;

use App\Models\Donation;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewDonationNotification extends Mailable
{
    use Queueable, SerializesModels;

    public Donation $donation;
    public string $companyEmail;
    public string $companyPhone;

    public function __construct(Donation $donation)
    {
        $this->donation = $donation;
        $this->companyEmail = $this->getCompanyEmail();
        $this->companyPhone = $this->getCompanyPhone();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Donation Received - Al Gohar Foundation',
        );
    }

    public function content(): Content
    {
        return new Content(
            html: 'emails.admin.new-donation',
            with: [
                'donation' => $this->donation,
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

