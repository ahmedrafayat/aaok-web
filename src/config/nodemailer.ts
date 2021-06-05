import nodemailer, { SendMailOptions } from 'nodemailer';
import nodemailerHandlebars from 'nodemailer-express-handlebars';
import path from 'path';
import { User } from '../models/User';
import { ServiceLinks } from '../utils/ServiceLinks';

type SendEnabledEmailOptions = {
  toEmail: string;
  name: string;
};

type SendResetPasswordEmailOptions = {
  toEmail: string;
  name: string;
  resetToken: string;
};

type SendAdminAssignmentEmailOptions = {
  toEmail: string;
  name: string;
  submissionId: number;
};

const fromEmail = process.env.NODEMAILER_EMAIL || 'admin@associatedasphalt.biz';
const mailerUser = process.env.NODEMAILER_EMAIL;
const mailerPass = process.env.NODEMAILER_PASS;

const transporter = nodemailer.createTransport({
  service: 'Outlook365',
  host: 'smtp.office365.com',
  port: 465,
  secure: true,
  auth: {
    user: mailerUser,
    pass: mailerPass,
  },
});

transporter.use(
  'compile',
  nodemailerHandlebars({
    viewEngine: {
      extname: '.hbs',
      partialsDir: path.join(__dirname, '../views/email-handlebars/'),
      layoutsDir: path.join(__dirname, '../views/email-handlebars/'),
      defaultLayout: '',
    },
    viewPath: path.join(__dirname, '../views/email-handlebars/'),
    extName: '.hbs',
  })
);

export const sendEnabledEmail = (options: SendEnabledEmailOptions): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const mailOptions: SendMailOptions = {
      from: `"AAOK" <${fromEmail}>`,
      to: options.toEmail,
      subject: 'You’re all set to go with our new AA OK App!!',
      // @ts-ignore
      context: { name: options.name },
      template: 'user-enabled-email',
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error('Error occurred while sending email', err);
        reject(false);
      } else {
        console.log('Email sent successfully!!');
        resolve(true);
      }
    });
  });
};

export const sendResetPasswordEmail = (options: SendResetPasswordEmailOptions) => {
  return new Promise((resolve, reject) => {
    const mailOptions: SendMailOptions = {
      from: `"AAOK" <${fromEmail}>`,
      to: options.toEmail,
      subject: 'Reset your AA OK password',
      // @ts-ignore
      context: { name: options.name, resetPasswordUrl: ServiceLinks.getPasswordResetLink(options.resetToken) },
      template: 'reset-password-email',
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error('Error occurred while sending email', err);
        reject(false);
      } else {
        console.log('Email sent successfully!!');
        resolve(true);
      }
    });
  });
};

export const sendAdminAssignmentEmail = (options: SendAdminAssignmentEmailOptions) => {
  return new Promise((resolve, reject) => {
    const mailOptions: SendMailOptions = {
      from: `"AAOK" <${fromEmail}>`,
      to: options.toEmail,
      subject: 'AAOK: You have been assigned to a submission',
      // @ts-ignore
      context: {
        name: options.name,
        submissionLink: ServiceLinks.getSubmissionDetailsUrl(options.submissionId),
      },
      template: 'admin-assignment-alert-email',
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error('Error occurred while sending email', err);
        reject(false);
      } else {
        console.log('Email sent successfully!!');
        resolve(true);
      }
    });
  });
};

export const sendEmailToAllManagersForNewSubmission = (submissionId: number, admins: User[]) => {
  new Promise(async (resolve, reject) => {
    const adminEmails = admins.map((admin) => admin.email);
    console.log('Sending emails to the following emails', adminEmails.join());

    const mailOptions: SendMailOptions = {
      from: `"AAOK" <${fromEmail}>`,
      to: process.env.SUPER_USER_EMAIL || 'aaokapp@gmail.com',
      subject: 'AAOK: New Submission',
      bcc: admins.map((admin) => admin.email),
      // @ts-ignore
      context: { submissionLink: ServiceLinks.getSubmissionDetailsUrl(submissionId) },
      template: 'new-submission-alert-admin',
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error('Error occurred while sending email', err);
        reject(false);
      } else {
        console.log('Email sent successfully!!');
        resolve(true);
      }
    });
  }).then();
};
