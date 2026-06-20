import * as Brevo from "@getbrevo/brevo";

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY,
);

export const sendMail = async ({ to, subject, html }) => {
  const email = new Brevo.SendSmtpEmail();
  email.to = [{ email: to }];
  email.sender = { email: process.env.LAURA_EMAIL, name: "L Gard'Educ" };
  email.subject = subject;
  email.htmlContent = html;
  return apiInstance.sendTransacEmail(email);
};
