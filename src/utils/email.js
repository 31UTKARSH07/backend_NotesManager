import nodemailer from 'nodemailer';

const createTransporter = () => {
    if (process.env.EMAIL_HOST === 'console') {
        return {
            sendMail: async (mailOptions) => {
                console.log('\n=== MOCK EMAIL SENT TO CONSOLE ===');
                console.log(`To: ${mailOptions.to}`);
                console.log(`Subject: ${mailOptions.subject}`);
                console.log(`Content: ${mailOptions.html || mailOptions.text}`);
                console.log('==================================\n');
                return { messageId: 'console-mode-' + Date.now() };
            }
        };
    }

    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465, 
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

export const sendPasswordResetEmail = async (email, resetToken) => {
    try {
        const transporter = createTransporter();
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: `"Notes App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request - Notes App',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 5px;">
                  <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
                  <p>Hello,</p>
                  <p>You have requested to reset your password for your Notes App account.</p>
                  <p>Click the button below to set a new password:</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}"
                       style="background-color: #007bff; color: white; padding: 12px 30px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                      Reset Password
                    </a>
                  </div>
                  <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                  <p style="word-break: break-all; color: #007bff; font-size: 14px;">${resetUrl}</p>
                  <p><strong>For security reasons, this link will expire in 10 minutes.</strong></p>
                  <p>If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>
                  <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                  <p style="color: #666; font-size: 12px; text-align: center;">
                    This is an automated message from Notes App. Please do not reply.
                  </p>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', result.messageId);
        return {
            success: true,
            messageId: result.messageId
        };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

