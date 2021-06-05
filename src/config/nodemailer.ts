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

type SendAdminAssignmentEmailToAdminOptions = {
  adminEmail: string;
  adminName: string;
  submissionId: number;
  formTitle: string;
  formDescription: string;
  user: User | null;
  submissionDate: string;
};

type SendEmailToManagersForNewSubmissionOptions = {
  admins: User[];
  submissionId: number;
  formTitle: string;
  formDescription: string;
  submitter: User | null;
  submissionDate: string;
};

type SendAssignmentEmailToUserOptions = {
  formTitle: string;
  formDescription: string;
  status: string;
  user: User;
  assignedAdmin: User;
  submissionDate: string;
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

export const sendAdminAssignmentEmailToAdmin = (options: SendAdminAssignmentEmailToAdminOptions) => {
  new Promise((resolve, reject) => {
    const mailOptions: SendMailOptions = {
      from: `"AAOK" <${fromEmail}>`,
      to: options.adminEmail,
      subject: `A New '${options.formTitle}' submission has been assigned to you`,
      // @ts-ignore
      context: {
        adminName: options.adminName,
        submissionLink: ServiceLinks.getSubmissionDetailsUrl(options.submissionId),
        formTitle: options.formTitle,
        formDescription: options.formDescription,
        date: options.submissionDate,
        user: options.user,
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
  }).then();
};

export const sendAssignmentEmailToUser = (options: SendAssignmentEmailToUserOptions) => {
  new Promise(async (resolve, reject) => {
    const emailSubject = `Your '${options.formTitle}' submission is ${options.status}`;

    const mailOptions: SendMailOptions = {
      from: `"AAOK" <${fromEmail}>`,
      to: options.user.email,
      subject: emailSubject,
      // @ts-ignore
      context: {
        emailSubject,
        formTitle: options.formTitle,
        user: options.user,
        assignedAdmin: options.assignedAdmin,
        date: options.submissionDate,
      },
      template: 'user-submission-status-change',
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

export const sendEmailToManagersForNewSubmission = (options: SendEmailToManagersForNewSubmissionOptions) => {
  new Promise(async (resolve, reject) => {
    const adminEmails = options.admins.map((admin) => admin.email);
    console.log('Sending emails to the following emails', adminEmails.join());

    const emailSubject = `New '${options.formTitle}' submission from ${
      options.submitter ? options.submitter.getFullName() : 'an Anonymous User'
    }`;

    const mailOptions: SendMailOptions = {
      from: `"AAOK" <${fromEmail}>`,
      to: process.env.SUPER_USER_EMAIL || 'aaokapp@gmail.com',
      subject: emailSubject,
      bcc: adminEmails,
      // @ts-ignore
      context: {
        emailSubject: emailSubject,
        formTitle: options.formTitle,
        formDescription: options.formDescription,
        user: options.submitter,
        date: options.submissionDate,
        submissionLink: ServiceLinks.getSubmissionDetailsUrl(options.submissionId),
      },
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
