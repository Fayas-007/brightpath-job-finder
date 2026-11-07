const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const BRAND = {
  ink: "#050b24",
  navy: "#0a1f6b",
  blue: "#1646e0",
  cyan: "#38bdf8",
  yellow: "#ffd23f",
  tint: "#eaf0ff",
  line: "#dbe6ff",
  text: "#475569",
  muted: "#94a3b8",
};

const FONT = "'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "'SFMono-Regular', Consolas, 'Courier New', monospace";

const buildResetEmail = ({
  resetLink,
  name = "",
  email = "",
  expiresInMinutes = 60,
}) => {
  const baseUrl = (process.env.FRONTEND_URL || "").replace(/\/+$/, "");
  const logoUrl =
    process.env.EMAIL_LOGO_URL || `${baseUrl}/brightpath-bp-logo.png`;
  const heroUrl = process.env.EMAIL_HERO_URL || "";
  const supportEmail =
    process.env.SUPPORT_EMAIL || process.env.SMTP_USER || "";

  const firstName = escapeHtml(String(name).trim().split(" ")[0] || "there");
  const safeEmail = escapeHtml(email);
  const safeLink = escapeHtml(resetLink);
  const year = new Date().getFullYear();
  const requestedAt = `${new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  })} UTC`;
  const expiryLabel =
    expiresInMinutes >= 60
      ? `${Math.round(expiresInMinutes / 60)} hour${
          expiresInMinutes >= 120 ? "s" : ""
        }`
      : `${expiresInMinutes} minutes`;

  const heroBlock = heroUrl
    ? `<tr>
        <td style="padding:0;line-height:0;font-size:0;background-color:${BRAND.navy};">
          <img src="${escapeHtml(heroUrl)}" width="600" alt="" style="display:block;width:100%;max-width:600px;height:auto;border:0;" />
        </td>
      </tr>`
    : `<tr>
        <td height="120" style="height:120px;background-color:${BRAND.navy};background-image:linear-gradient(135deg,${BRAND.ink} 0%,${BRAND.navy} 45%,${BRAND.blue} 100%);font-size:0;line-height:0;">&nbsp;</td>
      </tr>`;

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Reset your BrightPath password</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    a { text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .container { width: 100% !important; }
      .px { padding-left: 24px !important; padding-right: 24px !important; }
      .h1 { font-size: 28px !important; line-height: 34px !important; }
      .btn-link { display: block !important; width: auto !important; }
      .hide-mobile { display: none !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">
    Use this secure link to choose a new password. It expires in ${expiryLabel}.
    &#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">

          <!-- Top bar -->
          <tr>
            <td style="padding:0 4px 24px 4px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <img src="${escapeHtml(logoUrl)}" alt="BrightPath" height="56" style="display:block;height:56px;width:auto;font-family:${FONT};font-size:24px;font-weight:800;color:${BRAND.navy};" />
                  </td>
                  <td class="hide-mobile" align="right" valign="middle" style="font-family:${MONO};font-size:13px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${BRAND.blue};">
                    &#9679; Secure channel
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border:1px solid ${BRAND.line};border-radius:24px;overflow:hidden;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

                ${heroBlock}

                <!-- Accent line -->
                <tr>
                  <td height="4" style="height:4px;font-size:0;line-height:0;background-color:${BRAND.yellow};background-image:linear-gradient(90deg,${BRAND.cyan} 0%,${BRAND.blue} 50%,${BRAND.yellow} 100%);">&nbsp;</td>
                </tr>

                <!-- Hero text -->
                <tr>
                  <td class="px" style="padding:40px 44px 8px 44px;">
                    <p style="margin:0 0 14px 0;font-family:${MONO};font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${BRAND.blue};">
                      // Account recovery
                    </p>
                    <h1 class="h1" style="margin:0;font-family:${FONT};font-size:34px;line-height:40px;font-weight:800;letter-spacing:-0.025em;color:${BRAND.ink};">
                      Your next move starts with a new password.
                    </h1>
                  </td>
                </tr>

                <tr>
                  <td class="px" style="padding:16px 44px 8px 44px;font-family:${FONT};font-size:16px;line-height:26px;color:${BRAND.text};">
                    Hi ${firstName}, we received a request to reset the password for your BrightPath account.
                    Confirm below and you&rsquo;ll be back to your jobs, applications and opportunities in seconds.
                  </td>
                </tr>

                <!-- Button -->
                <tr>
                  <td class="px" style="padding:24px 44px 8px 44px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="border-radius:14px;background-color:${BRAND.yellow};">
                          <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${safeLink}" style="height:58px;v-text-anchor:middle;width:280px;" arcsize="22%" strokecolor="${BRAND.ink}" strokeweight="2pt" fillcolor="${BRAND.yellow}">
                            <w:anchorlock/>
                            <center style="color:${BRAND.ink};font-family:Arial,sans-serif;font-size:17px;font-weight:bold;">Reset my password</center>
                          </v:roundrect>
                          <![endif]-->
                          <!--[if !mso]><!-->
                          <a class="btn-link" href="${safeLink}" target="_blank" style="display:inline-block;padding:18px 44px;font-family:${FONT};font-size:17px;line-height:22px;font-weight:700;letter-spacing:0.02em;color:${BRAND.ink};background-color:${BRAND.yellow};border:2px solid ${BRAND.ink};border-radius:14px;text-align:center;">
                            Reset my password &nbsp;&rarr;
                          </a>
                          <!--<![endif]-->
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td class="px" style="padding:14px 44px 28px 44px;font-family:${FONT};font-size:13px;line-height:20px;color:${BRAND.muted};">
                    One-time link &middot; expires in ${expiryLabel}
                  </td>
                </tr>

                <!-- Request details -->
                <tr>
                  <td class="px" style="padding:0 44px 24px 44px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f7ff;border:1px solid ${BRAND.line};border-radius:16px;">
                      <tr>
                        <td style="padding:18px 22px 6px 22px;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${BRAND.muted};">
                          Request details
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 22px 4px 22px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding:9px 0;font-family:${FONT};font-size:14px;color:${BRAND.text};">Account</td>
                              <td align="right" style="padding:9px 0;font-family:${FONT};font-size:14px;font-weight:700;color:${BRAND.navy};">${safeEmail}</td>
                            </tr>
                            <tr>
                              <td style="padding:9px 0;border-top:1px solid ${BRAND.line};font-family:${FONT};font-size:14px;color:${BRAND.text};">Requested</td>
                              <td align="right" style="padding:9px 0;border-top:1px solid ${BRAND.line};font-family:${FONT};font-size:14px;font-weight:700;color:${BRAND.navy};">${requestedAt}</td>
                            </tr>
                            <tr>
                              <td style="padding:9px 0;border-top:1px solid ${BRAND.line};font-family:${FONT};font-size:14px;color:${BRAND.text};">Link valid for</td>
                              <td align="right" style="padding:9px 0;border-top:1px solid ${BRAND.line};font-family:${FONT};font-size:14px;font-weight:700;color:${BRAND.navy};">${expiryLabel}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr><td style="height:10px;line-height:10px;font-size:10px;">&nbsp;</td></tr>
                    </table>
                  </td>
                </tr>

                <!-- Security note -->
                <tr>
                  <td class="px" style="padding:0 44px 28px 44px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fff6d6;border-left:4px solid ${BRAND.yellow};border-radius:12px;">
                      <tr>
                        <td style="padding:16px 20px;font-family:${FONT};font-size:14px;line-height:22px;color:${BRAND.ink};">
                          <strong>Didn&rsquo;t request this?</strong> You can safely ignore this email.
                          Your password stays the same unless you open the link and set a new one.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Fallback link -->
                <tr>
                  <td class="px" style="padding:0 44px 36px 44px;font-family:${FONT};font-size:13px;line-height:20px;color:${BRAND.muted};">
                    Button not working? Copy and paste this link into your browser:<br />
                    <a href="${safeLink}" target="_blank" style="color:${BRAND.blue};word-break:break-all;">${safeLink}</a>
                  </td>
                </tr>

                <!-- Footer band -->
                <tr>
                  <td class="px" style="background-color:${BRAND.ink};background-image:linear-gradient(135deg,${BRAND.ink} 0%,${BRAND.navy} 100%);padding:30px 44px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-family:${FONT};font-size:17px;font-weight:800;color:#ffffff;">
                          BrightPath
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:6px;font-family:${FONT};font-size:13px;line-height:20px;color:#c5d7ff;">
                          Smarter hiring. Faster job discovery. One focused platform.
                        </td>
                      </tr>
                      ${
                        supportEmail
                          ? `<tr>
                        <td style="padding-top:14px;font-family:${FONT};font-size:13px;color:#c5d7ff;">
                          Need help? <a href="mailto:${escapeHtml(supportEmail)}" style="color:${BRAND.yellow};font-weight:700;">${escapeHtml(supportEmail)}</a>
                        </td>
                      </tr>`
                          : ""
                      }
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Below card -->
          <tr>
            <td align="center" style="padding:24px 16px 0 16px;font-family:${FONT};font-size:12px;line-height:18px;color:${BRAND.muted};">
              You received this email because a password reset was requested for your BrightPath account.<br />
              &copy; ${year} BrightPath. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    "Reset your BrightPath password",
    "",
    `Hi ${String(name).trim().split(" ")[0] || "there"},`,
    "",
    "We received a request to reset the password for your BrightPath account.",
    "Open this link to choose a new password:",
    "",
    resetLink,
    "",
    `This link works once and expires in ${expiryLabel}.`,
    "",
    "Didn't request this? You can safely ignore this email. Your password stays the same unless you open the link and set a new one.",
    "",
    `© ${year} BrightPath`,
  ].join("\n");

  return { html, text };
};

module.exports = { buildResetEmail };