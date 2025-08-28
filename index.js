// email-sender-api/index.js

// Import necessary modules
const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config();

// Create an Express application
const app = express();
const port = process.env.PORT || 3001;

// === Middleware ===

// Enable CORS for your frontend only (Vercel domain)
app.use(cors({
  origin: 'https://ahmed-mezghani.vercel.app',
  methods: ['POST', 'GET'],
}));

// Parse incoming JSON requests
app.use(express.json());

// === Email Transporter Configuration ===

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 5,
  debug: true,
  logger: true,
});

// Verify the transporter is working
transporter.verify((error, success) => {
  if (error) {
    console.error("Transporter verification failed:", error);
    console.log("SMTP config used:", {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
      secure: process.env.EMAIL_SECURE,
    });
  } else {
    console.log("✅ Server is ready to send emails");
  }
});

// === Email Sending Endpoint ===

// === Email Sending Endpoint ===
app.post('/send-email', async (req, res) => {
  // 🔑 Check API key
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.SECRET_API_KEY) {
    return res.status(403).json({ message: 'Unauthorized: Invalid API key' });
  }

  const { to, subject, text, html } = req.body;

  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ message: 'Missing required email fields.' });
  }

  const mailOptions = {
    from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'high'
    }
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📤 Message sent:', info.messageId);

    res.status(200).json({
      message: 'Email sent successfully!',
      messageId: info.messageId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Email sending failed:', error);

    res.status(500).json({
      message: 'Failed to send email',
      error: error.message,
      code: error.code
    });
  }
});

// === Health Check Endpoint ===

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString()
  });
});

// === Start the Server ===

app.listen(port, () => {
  console.log(`🚀 Email sender backend listening at http://localhost:${port}`);
});
