import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { footerHTML, headerHTML } from 'src/modules/utils/appData/constants';
import * as QRCode from 'qrcode';

@Injectable()
export class MailingService {
  private options;

  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailerService,
  ) {}

  async sendEmail(link: string, reset: boolean, user: any) {
    const recipient = await user;

    try {
      let attachments = [];
      let qrCid = 'qr-code';

      if (!reset) {
        const qrData = {
          id: recipient.id,
          name: `${recipient.firstName} ${recipient.lastName}`,
          email: recipient.email,
          delegate_type: recipient.delegate_type,
        };

        const qrBuffer = await QRCode.toBuffer(JSON.stringify(qrData));

        attachments.push({
          filename: 'qr-code.png',
          content: qrBuffer,
          cid: qrCid,
        });
      }

      if (reset) {
        this.options = {
          transporterName: null,
          to: recipient.email,
          subject: 'Account password reset',
          html: `${headerHTML}
            </div>
            <div class='content'>
              <p>Hello ${recipient.lastName}</p>
              <p>Your verification code is: <strong>${recipient.activationCode}</strong></p>
              <p>Click here to reset: <a class='button' href='${link}'>Reset your password</a></p>
            </div>
          ${footerHTML}`,
        };
      } else {
        this.options = {
          transporterName: null,
          to: recipient.email,
          subject: 'Welcome to Rwanda Future Skills Forum!',
          html: `${headerHTML}
            </div>
            <div class='content'>
              <p>Hello ${recipient.lastName},</p>
              <p>Welcome to Rwanda Future Skills Forum! 🎉</p>
              <p>Thanks for registering! Below is your unique delegate QR Code:</p>
              <img src="cid:${qrCid}" alt="QR Code" style="width:200px; height:200px;"/>
              <p>Your verification code is: <strong>${recipient.activationCode}</strong></p>
              <p>Click here to verify: <a class='button' href='${link}'>Verify your email</a></p>
            </div>
          ${footerHTML}`,
          attachments,
        };
      }

      await this.mailService.sendMail(this.options);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  async sendResetPasswordToke(link: string, reset: boolean, password: string, user: any) {
    const recipient = await user;
    try {
      this.options = {
        transporterName: null,
        to: recipient.email,
        subject: reset ? 'Account password reset' : 'Account Email verification',
        html: `${headerHTML}
        </div>
        <div class='content'>
          <p>Hello ${recipient.lastName}</p>
          ${reset ? `
            <p>Your temporary password is ${password}</p>
            <p>You can also verify your account by clicking this link: <a class='button' href='${link}'>Verify Email</a>
          ` : `
            <p>Welcome to Rwanda Forum</p>
            <p>Your verification code is ${recipient.activationCode}</p>
            <p>You can also verify your account by clicking this link: <a class='button' href='${link}'>Reset your password</a>
          `}
        </div>
        ${footerHTML}`,
      };

      await this.mailService.sendMail(this.options);
    } catch (error) {
      console.log(error);
    }
  }
  async generateQrCodeBuffer(data: any): Promise<Buffer> {
    // Convert the data object to a string and return QR code buffer
    return await QRCode.toBuffer(JSON.stringify(data));
  }

  async sendWelcomeEmail(user: any) {
    const recipient = await user;
  
    try {
      // Extract approval status
      const isApproved = recipient.is_approved;
      const approvalMessage = isApproved ? 'Approved' : 'Not Approved';
      const approvalIcon = isApproved ? '✅' : '❌';
      const approvalColor = isApproved ? 'green' : 'red';
  
      // This is the content encoded in the QR code
      const qrCodeMessage = `${approvalMessage} ${approvalIcon}`;
  
      // Generate QR code buffer from the simple message
      const qrImageBuffer = await this.generateQrCodeBuffer(qrCodeMessage);
  
      // Email content
      const emailContent = `
        <div class='content'>
          <p>Hello ${recipient.lastName},</p>
          <p>Thank you for registering as a delegate for the Rwanda Future Skills Forum.</p>
          <p>We're excited to have you join us. Stay tuned for more updates!</p>
          <p>If you have any questions, feel free to contact us.</p>
          <p>Your delegate status has been 
            <span style="color: ${approvalColor};"><strong>${approvalMessage}</strong></span>! ${approvalIcon}</p>
          <p>Below is your unique delegate QR Code:</p>
          <img src="cid:qr-code" alt="QR Code" style="width:200px; height:200px;" />
        </div>
      `;
  
      // Full email options
      this.options = {
        transporterName: null,
        to: recipient.email,
        subject: isApproved
          ? 'Welcome to Rwanda Future Skills Forum!'
          : 'Rwanda Future Skills Forum - Delegate Status',
        html: `${headerHTML}${emailContent}${footerHTML}`,
        attachments: [
          {
            filename: 'qr-code.png',
            content: qrImageBuffer,
            cid: 'qr-code', // Matches <img src="cid:qr-code" />
          },
        ],
      };
  
      // Send the email
      await this.mailService.sendMail(this.options);
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }

  async sendNotificationEmail(
    to: string,
    name: string,
    message: string,
    link: string,
  ) {
    // Not yet implemented
  }
}
