import nodemailer, { SendMailOptions } from 'nodemailer';

type SendEmailOptions = {
  toEmail: string;
  name: string;
};

export const sendEnabledEmail = (options: SendEmailOptions): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: 'Outlook365',
      host: 'smtp.office365.com',
      port: 587,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.NODEMAILER_EMAIL, // generated ethereal user
        pass: process.env.NODEMAILER_PASS, // generated ethereal password
      },
    });

    const mailOptions: SendMailOptions = {
      from: '"AAOK" <admin@associatedasphalt.biz>',
      to: options.toEmail,
      subject: 'AAOK: Your account has been activated!',
      html: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" />
      <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head> </head>
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="x-apple-disable-message-reformatting" />
          <!--[if !mso]><!-->
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <!--<![endif]-->
          <style type="text/css">
            * {
              text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
              -moz-text-size-adjust: 100%;
              -webkit-text-size-adjust: 100%;
            }
            html {
              height: 100%;
              width: 100%;
            }
            body {
              height: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              mso-line-height-rule: exactly;
            }
            div[style*="margin: 16px 0"] {
              margin: 0 !important;
            }
            table,
            td {
              mso-table-lspace: 0pt;
              mso-table-rspace: 0pt;
            }
            img {
              border: 0;
              height: auto;
              line-height: 100%;
              outline: none;
              text-decoration: none;
              -ms-interpolation-mode: bicubic;
            }
            .ReadMsgBody,
            .ExternalClass {
              width: 100%;
            }
            .ExternalClass,
            .ExternalClass p,
            .ExternalClass span,
            .ExternalClass td,
            .ExternalClass div {
              line-height: 100%;
            }
          </style>
          <!--[if gte mso 9]>
            <style type="text/css">
            li { text-indent: -1em; }
            table td { border-collapse: collapse; }
            </style>
            <![endif]-->
          <title>Your account has been activated!</title>
          <!-- content -->
          <!--[if gte mso 9]><xml>
            <o:OfficeDocumentSettings>
              <o:AllowPNG/>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
            </xml><![endif]-->
        </head>
        <body class="body" style="margin: 0; width: 100%;">
          <div class="preview" style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">AAOK Account activated&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
          <table
            class="bodyTable" role="presentation" width="100%" align="left" border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin: 0;">
            <tr>
              <td class="body__content" align="left" width="100%" valign="top" style="font-family: Helvetica,Arial,sans-serif; font-size: 16px; line-height: 20px; color: #FFFFFF;">
                <div class="container" style="margin: 0 auto; max-width: 600px; width: 100%;"> <!--[if mso | IE]>
                  <table class="container__table__ie" role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-right: auto; margin-left: auto;width: 600px" width="600" align="center">
                    <tr>
                      <td> <![endif]-->
                        <table class="container__table" role="presentation" border="0" align="center" cellpadding="0" cellspacing="0" width="100%">
                          <tr class="container__row">
                            <td class="container__cell" width="100%" align="left" valign="top" style="background-color: #2D2D2D; padding: 50px;" bgcolor="#2D2D2D">
                              <div class="row">
                                <table class="row__table" width="100%" align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" style="table-layout: fixed;">
                                  <tr class="row__row">
                                    <h1 large="4" class="header h1" style="margin: 20px 0; line-height: 40px; font-family: Helvetica,Arial,sans-serif; color: #FFFFFF;">Dear ${options.name},</h1>
                                    <p large="4" class="text p" style="display: block; margin: 14px 0; font-family: Helvetica,Arial,sans-serif; font-size: 16px; line-height: 20px; color: #FFFFFF;">We thank you for registering to AAOK! An admin has reviewed your account and enabled it.</p>
                                    <p large="4" class="text p" style="display: block; margin: 14px 0; font-family: Helvetica,Arial,sans-serif; font-size: 16px; line-height: 20px; color: #FFFFFF;">
                                    You can now login with your email and start sharing your experiences through AAOK. Simply select a form and fill it up with the required information and submit it once you are ready! </p>
                                  </tr>
                                </table>
                              </div>
                              <div class="row">
                                <table class="row__table" width="100%" align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" style="table-layout: fixed;">
                                  <tr class="row__row"> From, <br large="12" /> AAOK Team </tr>
                                </table>
                              </div>
                            </td>
                          </tr>
                        </table> <!--[if mso | IE]> </td>
                    </tr>
                  </table> <![endif]--> </div>
              </td>
            </tr>
            </table>
            <div style="display:none; white-space:nowrap; font-size:15px; line-height:0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </div>
        </body>
      </html>
      `,
    };

    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.log('Error occured while sending email', err);
        reject(false);
      } else {
        console.log('Email sent successfully!!', data);
        resolve(true);
      }
    });
  });
};
