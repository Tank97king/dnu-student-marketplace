const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Use custom sender email if provided, otherwise use default from .env
  const senderEmail = options.fromEmail || process.env.EMAIL_USER;
  const senderPassword = options.fromPassword || process.env.EMAIL_PASSWORD;
  
  if (!senderEmail || !senderPassword) {
    throw new Error('Email sender chưa được cấu hình. Vui lòng kiểm tra EMAIL_USER và EMAIL_PASSWORD trong .env');
  }

  // Determine if using Outlook/Hotmail or Gmail based on sender email
  const isOutlook = senderEmail && (
    senderEmail.includes('@outlook') || 
    senderEmail.includes('@hotmail') ||
    senderEmail.includes('@live') ||
    senderEmail.includes('@office365') ||
    senderEmail.includes('@dnu.edu.vn')
  );

  // Determine host based on email domain
  let emailHost = process.env.EMAIL_HOST;
  if (!emailHost && isOutlook) {
    emailHost = 'smtp-mail.outlook.com';
  } else if (!emailHost) {
    emailHost = 'smtp.gmail.com';
  }

  const transporter = nodemailer.createTransport({
    host: emailHost,
    port: parseInt(process.env.EMAIL_PORT) || (isOutlook ? 587 : 587),
    secure: false, // true for 465, false for other ports
    auth: {
      user: senderEmail,
      pass: senderPassword
    },
    // Outlook/Hotmail specific settings
    ...(isOutlook && {
      tls: {
        ciphers: 'SSLv3'
      }
    })
  });

  const mailOptions = {
    from: `DNU Marketplace <${senderEmail}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || options.message
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully from ${senderEmail} to ${options.email}`);
  } catch (error) {
    console.error('Email sending error:', error);
    // Re-throw with more context
    throw new Error(`Không thể gửi email: ${error.message}`);
  }
};

module.exports = sendEmail;








