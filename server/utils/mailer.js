import SibApiV3Sdk from "@getbrevo/brevo";

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

export const sendMail = async ({ to, subject, html }) => {
  const email = new SibApiV3Sdk.SendSmtpEmail();
  email.to = [{ email: to }];
  email.sender = { email: process.env.LAURA_EMAIL, name: "L Gard'Educ" };
  email.subject = subject;
  email.htmlContent = html;
  return apiInstance.sendTransacEmail(email);
};
