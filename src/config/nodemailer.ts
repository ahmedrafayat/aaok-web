import nodemailer, { SendMailOptions } from 'nodemailer';
import nodemailerHandlebars from 'nodemailer-express-handlebars';
import path from 'path';
import { User } from '../models/User';
import { UserManagementTypes } from '../models/enums/UserManagementTypes';

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
      partialsDir: path.join(__dirname, '../views/'),
      layoutsDir: path.join(__dirname, '../views/'),
      defaultLayout: '',
    },
    viewPath: path.join(__dirname, '../views/'),
    extName: '.hbs',
  })
);

export const sendEnabledEmail = (options: SendEnabledEmailOptions): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const mailOptions: SendMailOptions = {
      from: `"AAOK" <${fromEmail}>`,
      to: options.toEmail,
      subject: 'AAOK: Your account has been activated!',
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
      subject: 'AAOK: Reset Password',
      // @ts-ignore
      context: { name: options.name, resetPasswordUrl: `${process.env.RESET_PASSWORD_BASE_URL}/${options.resetToken}` },
      template: 'password-reset-email',
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
      context: { name: options.name, submissionLink: `${process.env.CLIENT_URL}/submissions/${options.submissionId}` },
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

export const sendEmailToAllManagersForNewSubmission = (submissionId: number) => {
  return new Promise(async (resolve, reject) => {
    let admins: User[] = [];
    try {
      admins = await User.findAll({
        where: {
          isManagement: UserManagementTypes.ADMIN,
          isEnabled: 1,
        },
        attributes: ['email'],
      });
    } catch (e) {
      console.error(e);
    }

    const adminEmails = admins.map((admin) => admin.email);
    console.log('Sending emails to the following emails', adminEmails.join());

    const mailOptions: SendMailOptions = {
      from: `"AAOK" <${fromEmail}>`,
      to: process.env.SUPER_USE_EMAIL || 'aaokapp@gmail.com',
      subject: 'AAOK: New Submission',
      bcc: admins.map((admin) => admin.email),
      // @ts-ignore
      context: { submissionLink: `${process.env.CLIENT_URL}/submissions/${submissionId}` },
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
  });
};
