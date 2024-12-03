import { Resend } from "resend";

export async function sendEmailWithResend(recipients, subject, emailBody) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log(resend);
    const { data, error } = await resend.emails.send({
      // from: process.env.RESEND_SENDER,
      from: "onboarding@resend.dev",
      // from: "onboarding@resend.dev",
      to: recipients,
      subject,
      html: emailBody,
    });
    console.log(`Email sent: ${data?.id}`);

    if (error) {
      console.log("mail error :", error);
      return console.error({ error });
    }

    console.log(`Email sent: ${data?.id}`);
  } catch (error) {
    console.log("mail error :", error);
  }
}
