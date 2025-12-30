const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

/**
 * Send payment received notification to vendor
 * @param {String} vendorEmail - Vendor's email address
 * @param {Object} bookingDetails - Booking information
 */
const sendPaymentReceivedEmail = async (vendorEmail, bookingDetails) => {
    try {
        const transporter = createTransporter();

        const { vendorName, userName, amount, serviceDate, serviceType, bookingId } = bookingDetails;

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'EventEmpire <noreply@eventempire.com>',
            to: vendorEmail,
            subject: '💰 Payment Received - EventEmpire',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                        .detail-label { font-weight: bold; color: #666; }
                        .amount { font-size: 32px; color: #28a745; font-weight: bold; text-align: center; margin: 20px 0; }
                        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1 style="margin: 0;">🎉 Payment Received!</h1>
                        </div>
                        <div class="content">
                            <p>Dear ${vendorName},</p>
                            <p>Great news! You've received a payment for your services through EventEmpire.</p>
                            
                            <div class="amount">₹${amount.toLocaleString('en-IN')}</div>
                            
                            <div class="details">
                                <h3 style="margin-top: 0; color: #D4AF37;">Booking Details</h3>
                                <div class="detail-row">
                                    <span class="detail-label">Booking ID:</span>
                                    <span>#${bookingId}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Client Name:</span>
                                    <span>${userName}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Service Type:</span>
                                    <span>${serviceType}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Service Date:</span>
                                    <span>${new Date(serviceDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div class="detail-row" style="border-bottom: none;">
                                    <span class="detail-label">Payment Amount:</span>
                                    <span style="color: #28a745; font-weight: bold;">₹${amount.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                            
                            <p><strong>Next Steps:</strong></p>
                            <ul>
                                <li>Log in to your vendor dashboard to view booking details</li>
                                <li>Contact the client if you need any additional information</li>
                                <li>Prepare for the service on the scheduled date</li>
                            </ul>
                            
                            <p>Thank you for being a valued vendor on EventEmpire!</p>
                            
                            <div class="footer">
                                <p>This is an automated notification from EventEmpire.<br>
                                Please do not reply to this email.</p>
                                <p>&copy; 2024 EventEmpire. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Payment notification email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending payment notification email:', error);
        throw new Error('Failed to send payment notification email');
    }
};

/**
 * Send test email to verify configuration
 * @param {String} recipientEmail - Test recipient email
 */
const sendTestEmail = async (recipientEmail) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'EventEmpire <noreply@eventempire.com>',
            to: recipientEmail,
            subject: 'Test Email - EventEmpire',
            html: '<h1>Email Configuration Successful!</h1><p>Your EventEmpire email service is working correctly.</p>',
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Test email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending test email:', error);
        throw error;
    }
};

/**
 * Send RSVP reminder to guest
 * @param {String} guestEmail - Guest's email address
 * @param {Object} eventDetails - Event information
 */
const sendRSVPReminderEmail = async (guestEmail, eventDetails) => {
    try {
        const transporter = createTransporter();

        const { eventName, eventDate, eventLocation, organizerName, daysUntilEvent } = eventDetails;

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'EventEmpire <noreply@eventempire.com>',
            to: guestEmail,
            subject: `⏰ RSVP Reminder: ${eventName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #D4AF37;">RSVP Reminder</h2>
                    <p>Dear Guest,</p>
                    <p>This is a friendly reminder that you haven't yet responded to the invitation for:</p>
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">${eventName}</h3>
                        <p><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString('en-IN')}</p>
                        <p><strong>Location:</strong> ${eventLocation}</p>
                        <p><strong>Organizer:</strong> ${organizerName}</p>
                    </div>
                    <p><strong>The event is only ${daysUntilEvent} days away!</strong></p>
                    <p>Please log in to EventEmpire to confirm your attendance.</p>
                    <p>Thank you!</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('RSVP reminder email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending RSVP reminder email:', error);
        throw new Error('Failed to send RSVP reminder email');
    }
};

module.exports = {
    sendPaymentReceivedEmail,
    sendTestEmail,
    sendRSVPReminderEmail,
};
