const nodeMailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

const transporterDetails = smtpTransport({
  host: "mail.ghorbany.dev",
  port: 465,
  secure: true,
  auth: {
    user: "toplearn@ghorbany.dev",
    pass: "toplearn123456",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

exports.sendEmail = (email, fullname, subject, message) => {
  try {
    const transporter = nodeMailer.createTransport(transporterDetails);
    transporter.sendMail({
      from: "toplearn@ghorbany.dev",
      to: email,
      subject: subject,
      html: `<h1> سلام ${fullname}</h1>
              <p>${message}</p>`,
    });
  } catch (error) {}
};
