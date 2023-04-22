import SMTPTransport from "nodemailer/lib/smtp-transport";
import { EMAIL, INotificationService } from "../interfaces";
import { Transporter, createTransport } from "nodemailer";
import { Logger } from "../lib/Logger";

export class NotificationService implements INotificationService {
  private transporter: Transporter;

  constructor() {
    const options: SMTPTransport.Options = {
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };
    this.transporter = createTransport(options);
  }
  async sendEmail(to: string, from: string, email: EMAIL): Promise<void> {
    const options = {
      from,
      to,
      ...email,
    };
    try {
      await this.transporter.sendMail(options);
      Logger.DEBUG("Email sent.", email);
    } catch (err) {
      Logger.ERROR(err);
    }
  }
}
