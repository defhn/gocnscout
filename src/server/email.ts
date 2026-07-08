import { env, requireEnv } from "@/lib/env";

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  html: string;
}) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": requireEnv("BREVO_API_KEY"),
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: env.BREVO_FROM_EMAIL || env.SUPPORT_EMAIL,
        name: env.BREVO_FROM_NAME,
      },
      to: [{ email: input.to }],
      subject: input.subject,
      htmlContent: input.html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Brevo email failed: ${response.status}`);
  }

  return response.json();
}
