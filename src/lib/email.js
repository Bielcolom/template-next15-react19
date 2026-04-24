import "server-only";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

/**
 * Send a single email via Resend.
 *
 * @param {object} options
 * @param {string|string[]} options.to      - Recipient address(es)
 * @param {string}          options.subject - Email subject
 * @param {string}          options.html    - Email HTML body
 * @param {string}          [options.from]  - Sender address (defaults to RESEND_FROM_EMAIL env var)
 * @returns {Promise<{ id: string }|null>}
 */
export async function sendEmail({ to, subject, html, from = DEFAULT_FROM }) {
  const { data, error } = await resend.emails.send({ from, to, subject, html });

  if (error) {
    throw new Error(error.message ?? "Failed to send email");
  }

  return data;
}
