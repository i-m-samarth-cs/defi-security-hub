import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class TakedownService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendTakedownRequest(incident: any) {
    const emailBody = `
Phishing Incident Report

Evidence: ${process.env.IPFS_GATEWAY}${incident.evidence_cid}
Transaction: ${incident.tx_hash}
Domain: ${incident.origin_domain}
Score: ${incident.score}

Please take immediate action to remove this malicious content.
    `;

    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'abuse@registrar.com',
      subject: 'Phishing Takedown Request',
      text: emailBody,
    });

    return { sent: true };
  }
}
