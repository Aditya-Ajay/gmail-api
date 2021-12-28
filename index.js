import { google } from "googleapis";
import dotenv from "dotenv";
import * as nodemailer from "nodemailer";
import express from "express";

// config
dotenv.config();

const configuration = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  refreshToken: process.env.REFRESH_TOKEN,
  emailId: "aaak1837@gmail.com",
};
console.log(configuration);

// ---------------

const Oauth2 = google.auth.OAuth2;

// send Email
const sendEmail = async (email, subject, message) => {
  const oauth2Client = new Oauth2(
    configuration.clientId,
    configuration.clientSecret
  );

  oauth2Client.setCredentials({ refresh_token: configuration.refreshToken });

  const accessToken = oauth2Client.getAccessToken();
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: configuration.emailId,
      clientId: configuration.clientId,
      clientSecret: configuration.clientSecret,
      refreshToken: configuration.refreshToken,
      accessToken,
    },
  });

  const mailOptions = {
    from: configuration.emailId,
    to: email,
    subject,
    text: message,
  };

  const sendMailSync = (transport, mailOptions) => {
    return new Promise((res, rej) => {
      transport.sendMail(mailOptions, (err, info) => {
        if (err) {
          rej(err);
        } else {
          res(info);
        }
      });
    });
  };
  await sendMailSync(transport, mailOptions);
};

// ------------

// api
const init = () => {
  const app = express();
  app.use(express.json());
  const PORT = 8080;
  app.post("/api/send/mail", (req, res) => {
    const { email, subject, message } = req.body;
    sendEmail(email, subject, message)
      .then(() => res.send({ message: " MESSAGE SENT " }))
      .catch((error) => res.status(500).send(error));
  });

  app.listen(PORT, () => {
    console.log(`server running on 😇 ${PORT}`);
  });
};

// -------------------
init();
