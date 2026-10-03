/**
 * Welcome Email HTML Template for York Employee Management System.
 *
 * @param {string} fullName - Recipient full name
 * @param {string} [authProvider="google"] - "google" or "local"
 * @returns {string} Fully rendered HTML email string
 */
export function getWelcomeEmailHtml(fullName, authProvider = "google") {
  const currentYear = new Date().getFullYear();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const isGoogle = authProvider === "google";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to York</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
    }
    .wrapper {
      width: 100%;
      background-color: #f4f6f9;
      padding: 40px 10px;
      box-sizing: border-box;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
      padding: 32px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 26px;
      letter-spacing: 2px;
      font-weight: 800;
    }
    .header p {
      margin: 6px 0 0;
      color: #c7d2fe;
      font-size: 13px;
    }
    .content {
      padding: 36px 32px;
    }
    .content h2 {
      margin: 0 0 16px;
      color: #0f172a;
      font-size: 20px;
      font-weight: 700;
    }
    .content p {
      margin: 0 0 16px;
      color: #334155;
      font-size: 15px;
      line-height: 1.6;
    }
    .highlight-box {
      background: #f8fafc;
      border-left: 4px solid #4f46e5;
      padding: 16px 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .highlight-box p {
      margin: 0;
      font-size: 14px;
      color: #475569;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0 24px;
    }
    .btn {
      display: inline-block;
      background: #4f46e5;
      color: #ffffff !important;
      text-decoration: none;
      padding: 13px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      transition: background 0.2s ease;
    }
    .footer {
      border-top: 1px solid #f1f5f9;
      padding: 24px 32px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>YORK</h1>
        <p>Employee Management System</p>
      </div>
      <div class="content">
        <h2>Welcome to York, ${fullName || "Team Member"}!</h2>
        <p>
          ${
            isGoogle
              ? "Your account has been successfully created and linked with your Google profile. You now have access to the York HR platform."
              : "Your account has been successfully created. You now have access to the York HR platform."
          }
        </p>
        <div class="highlight-box">
          <p>
            <strong>Next Step:</strong> Log in to your portal and complete your employee onboarding details (contact info, emergency details, department preferences) so your team leads can welcome you aboard.
          </p>
        </div>
        <div class="btn-container">
          <a href="${frontendUrl}" class="btn" target="_blank" rel="noopener noreferrer">Go to York Portal</a>
        </div>
        <p style="font-size: 13px; color: #64748b;">
          If you have any questions or need assistance, please reach out to your HR administrator or internal IT support team.
        </p>
      </div>
      <div class="footer">
        <p>© ${currentYear} York HR. All rights reserved.</p>
        <p>This automated message was sent to your registered ${isGoogle ? "Google " : ""}email address.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export default getWelcomeEmailHtml;
