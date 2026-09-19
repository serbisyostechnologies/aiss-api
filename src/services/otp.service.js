import bcrypt from "bcryptjs";
import Otp from "../models/otp.model.js";
import User from "../models/user.model.js";
import resend from "../config/resend.js";
import { generateOtp } from "../utils/otp.util.js";
import env from "../config/environment.js";
import axios from "axios";

const OTP_EXPIRY_MINUTES = Number(env.OTP_EXPIRE_MINUTES || 10);

export const sendEmailOtp = async ({ email }) => {
  const otp = generateOtp();

  const hashedOtp = await bcrypt.hash(otp, 10);

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await Otp.findOneAndUpdate(
    { emailMobile: email },
    {
      otp: hashedOtp,
      otpFrom: "email",
      expiresAt,
    },
    {
      upsert: true,
      returnDocument: 'after',
    },
  );

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Email Verification OTP",

    html: `
      <div style="font-family:Arial;padding:30px">
          <h2>AISerbisyosStudio</h2>

          <p>Your verification code is</p>

          <h1 style="
              letter-spacing:8px;
              color:#2563eb;
          ">
              ${otp}
          </h1>

          <p>
              This OTP is valid for
              <b>10 minutes</b>.
          </p>

          <p>
              Do not share this OTP with anyone.
          </p>

          <hr>

          <small>
              Team AISerbisyos Studios
          </small>
      </div>
      `,
  });
};

export const verifyEmailOtp = async ({ userId, email, otp }) => {
  const emailOtp = await Otp.findOne({ emailMobile: email });

  if (!emailOtp) {
    throw new Error("OTP not found");
  }

  if (emailOtp.expiresAt < new Date()) {
    await Otp.deleteOne({ emailMobile: email });

    throw new Error("OTP expired");
  }

  const isValid = await bcrypt.compare(otp, emailOtp.otp);

  if (!isValid) {
    throw new Error("Invalid OTP");
  }

  await Otp.deleteOne({ emailMobile: email });

  await User.findByIdAndUpdate(userId, {
    isEmailVerified: true,
  });
};

export const sendMobileOtp = async ({ mobile }) => {
  const otp = generateOtp();

  const hashedOtp = await bcrypt.hash(otp, 10);

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await Otp.findOneAndUpdate(
    { emailMobile: mobile },
    {
      otp: hashedOtp,
      otpFrom: "mobile",
      expiresAt,
    },
    {
      upsert: true,
      returnDocument: 'after',
    },
  );

  const url = `https://2factor.in/API/V1/${env.SMS_OTP_API_KEY}/SMS/${mobile}/${otp}/${env.SMS_OTP_TEMPLATE}`;
  const { data } = await axios.get(url);

  return data;
};

export const verifyMobileOtp = async ({ userId, mobile, otp }) => {
  const mobileOtp = await Otp.findOne({ emailMobile: mobile });

  if (!mobileOtp) {
    throw new Error("OTP not found");
  }

  if (mobileOtp.expiresAt < new Date()) {
    await Otp.deleteOne({ emailMobile: email });

    throw new Error("OTP expired");
  }

  const isValid = await bcrypt.compare(otp, mobileOtp.otp);

  if (!isValid) {
    throw new Error("Invalid OTP");
  }

  await Otp.deleteOne({ emailMobile: mobile });

  await User.findByIdAndUpdate(userId, {
    isMobileVerified: true,
  });
};