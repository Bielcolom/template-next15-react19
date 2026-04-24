const BRAND_PRIMARY = "#086972";
const BRAND_DARKER = "#0a3d42";
const BRAND_LIGHTER = "#e6f0f1";
const INK = "#1a1f21";
const INK_70 = "#4a5558";
const BORDER = "#e8e6e1";
const SURFACE_ALT = "#faf9f6";
const SURFACE_SOFT = "#f0eeea";
const WHITE = "#ffffff";

/**
 * Base HTML email template — all future emails should go through this function.
 *
 * @param {object} options
 * @param {string} options.title        - <title> tag and email heading
 * @param {string} [options.preheader]  - Hidden preview text in email clients
 * @param {string} options.content      - Inner HTML for the body section
 * @param {string} [options.ctaUrl]     - Call-to-action button URL
 * @param {string} [options.ctaText]    - Call-to-action button label
 * @param {string} [options.footerText] - Custom footer text
 * @param {string} [options.brandName]  - Brand name shown in header & footer
 */
export function baseEmailTemplate({
  title,
  preheader,
  content,
  ctaUrl,
  ctaText,
  footerText,
  brandName = "Wozzo",
}) {
  const year = new Date().getFullYear();
  const defaultFooter = `© ${year} ${brandName}. All rights reserved.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${SURFACE_ALT};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:${SURFACE_ALT};">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ""}

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${SURFACE_ALT};padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- ── Header ── -->
          <tr>
            <td style="background:${BRAND_DARKER};border-radius:14px 14px 0 0;padding:28px 40px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:${WHITE};letter-spacing:-0.02em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                ${brandName}
              </h1>
            </td>
          </tr>

          <!-- ── Body ── -->
          <tr>
            <td style="background:${WHITE};padding:40px 40px 32px;border-left:1px solid ${BORDER};border-right:1px solid ${BORDER};">
              <h2 style="margin:0 0 16px;font-size:20px;font-weight:600;color:${BRAND_DARKER};letter-spacing:-0.01em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                ${title}
              </h2>
              <div style="font-size:15px;line-height:1.7;color:${INK_70};">
                ${content}
              </div>
              ${ctaUrl && ctaText ? `
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                <tr>
                  <td style="border-radius:10px;background:${BRAND_PRIMARY};">
                    <a href="${ctaUrl}" target="_blank"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:${WHITE};text-decoration:none;border-radius:10px;letter-spacing:-0.01em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0;font-size:13px;color:${INK};opacity:0.5;">
                Or copy this link: <span style="color:${BRAND_PRIMARY};">${ctaUrl}</span>
              </p>
              ` : ""}
            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="background:${SURFACE_SOFT};border:1px solid ${BORDER};border-top:none;border-radius:0 0 14px 14px;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:13px;color:${INK_70};line-height:1.6;">
                ${footerText ?? defaultFooter}
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:${INK_70};opacity:0.6;">
                You received this email because an administrator invited you.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}
