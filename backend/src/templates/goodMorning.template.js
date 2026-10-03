/**
 * Good Morning Email HTML Template for York Employee Management System.
 *
 * @param {string} fullName - Recipient full name
 * @returns {string} Fully rendered HTML email string
 */
export function getGoodMorningEmailHtml(fullName) {
  const currentYear = new Date().getFullYear();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const name = fullName ? fullName.trim() : "Team Member";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Good Morning from York</title>
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
    .quote-box {
      background: #f8fafc;
      border-left: 4px solid #4f46e5;
      padding: 16px 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .quote-box p {
      margin: 0;
      font-size: 14px;
      color: #475569;
      font-style: italic;
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
        <h2>Good Morning, ${name}! ☀️</h2>
        <p>
          We wish you a productive, successful, and wonderful day ahead!
        </p>
        <div class="quote-box">
          <p>
            "Every morning brings new potential, but only if you get up and get after it."
          </p>
        </div>
        <p>
          Log in to your portal to check your daily schedule, stay up to date with notifications, or manage your leave requests.
        </p>
        <div class="btn-container">
          <a href="${frontendUrl}" class="btn" target="_blank" rel="noopener noreferrer">Access Employee Portal</a>
        </div>
        <p style="font-size: 13px; color: #64748b;">
          Have a great day!
        </p>
      </div>
      <div class="footer">
        <p>© ${currentYear} York HR Team. All rights reserved.</p>
        <p>This is an automated daily greeting sent to active employees.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export default getGoodMorningEmailHtml;
