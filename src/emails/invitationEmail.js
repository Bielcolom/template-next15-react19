import { baseEmailTemplate } from "./baseTemplate.js";

/**
 * Invitation email sent when an admin invites a user to the platform.
 *
 * @param {object} options
 * @param {string} options.inviteUrl   - Registration or login URL to include in the CTA
 * @param {string} [options.roleName]  - Role the user has been assigned
 * @param {string} [options.brandName] - Brand name shown in the email
 * @param {string} [options.locale]    - Locale for language selection (future use)
 */
export function invitationEmailTemplate({ inviteUrl, roleName, brandName = "Wozzo", locale = "en" }) {
  const isEs = locale === "es";

  const subject = isEs
    ? `Has sido invitado a ${brandName}`
    : `You've been invited to ${brandName}`;

  const preheader = isEs
    ? `Un administrador te ha invitado a unirte a ${brandName}.`
    : `An administrator has invited you to join ${brandName}.`;

  const roleText = roleName
    ? isEs
      ? `<p>Tu rol asignado será: <strong style="color:#0a3d42;">${roleName}</strong></p>`
      : `<p>Your assigned role will be: <strong style="color:#0a3d42;">${roleName}</strong></p>`
    : "";

  const content = isEs
    ? `
      <p>Hola,</p>
      <p>Un administrador de <strong>${brandName}</strong> te ha invitado a acceder a la plataforma.</p>
      ${roleText}
      <p>Haz clic en el botón de abajo para crear tu cuenta y empezar:</p>
    `
    : `
      <p>Hello,</p>
      <p>An administrator at <strong>${brandName}</strong> has invited you to access the platform.</p>
      ${roleText}
      <p>Click the button below to create your account and get started:</p>
    `;

  const ctaText = isEs ? "Aceptar invitación" : "Accept invitation";

  const html = baseEmailTemplate({
    title: subject,
    preheader,
    content,
    ctaUrl: inviteUrl,
    ctaText,
    brandName,
  });

  return { subject, html };
}
