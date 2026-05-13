<?php

namespace App\Mail\Admin;

use App\Models\Donation;
use App\Models\Setting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DonationStatusChangedNotification extends Mailable
{
    use Queueable, SerializesModels;

    public Donation $donation;
    public string $oldStatus;
    public string $newStatus;
    public string $companyEmail;
    public string $companyPhone;

    public function __construct(Donation $donation, string $oldStatus, string $newStatus)
    {
        $this->donation = $donation;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
        $this->companyEmail = $this->getCompanyEmail();
        $this->companyPhone = $this->getCompanyPhone();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Donation Status Changed - Al Gohar Foundation',
        );
    }

    public function content(): Content
    {
        return new Content(
            html: 'emails.admin.donation-status-changed',
            with: [
                'donation' => $this->donation,
                'oldStatus' => $this->oldStatus,
                'newStatus' => $this->newStatus,
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

