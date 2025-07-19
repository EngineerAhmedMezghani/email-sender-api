// email-sender-api/index.js
// This file sets up a simple Node.js Express server to handle email sending.
// It runs on your local machine (or a server), not in the browser.

// Import necessary modules
const express = require('express'); // Express.js for creating the server
const nodemailer = require('nodemailer'); // Nodemailer for sending emails
const dotenv = require('dotenv'); // dotenv for loading environment variables from a .env file
const cors = require('cors'); // CORS for handling cross-origin requests from your frontend

// Load environment variables from .env file.
// This reads your EMAIL_HOST, EMAIL_PORT, etc., from the .env file in this directory.
dotenv.config();

// Create an Express application
const app = express();
// Define the port for the server, defaulting to 3001 if not specified in .env
const port = process.env.PORT || 3001;

// Middleware
// Enable CORS for all origins. In a production environment, you should restrict this
// to only your frontend's domain for better security (e.g., cors({ origin: 'http://localhost:8080' }))
app.use(cors());
// Parse JSON bodies for incoming requests (e.g., when your frontend sends data)
app.use(express.json());

// --- Email Sending Logic using Nodemailer ---

// Create a Nodemailer transporter.
// This object is responsible for sending emails via an SMTP server.
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // SMTP host (e.g., 'smtp.gmail.com')
    port: parseInt(process.env.EMAIL_PORT), // SMTP port (e.g., 587 or 465)
    secure: process.env.EMAIL_SECURE === 'true', // true for 465 (SSL), false for 587 (TLS)
    auth: {
        user: process.env.EMAIL_USER, // Your email address for authentication
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
    pool: true, // Use pooled connections
    maxConnections: 5, // Maximum number of simultaneous connections
    maxMessages: 100, // Maximum number of messages per connection
    rateDelta: 1000, // Define the time window for rate limiting in milliseconds
    rateLimit: 5, // Maximum number of messages to send in rateDelta time window
    debug: true, // Enable debug logging
    logger: true // Enable built-in logger
});

// Enhanced verification with detailed logging
transporter.verify(function (error, success) {
    if (error) {
        console.error("Transporter verification failed:");
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        if (error.response) {
            console.error("SMTP Response:", error.response);
        }
        // Check configuration
        console.log("Current configuration:");
        console.log("Host:", process.env.EMAIL_HOST);
        console.log("Port:", process.env.EMAIL_PORT);
        console.log("User:", process.env.EMAIL_USER);
        console.log("Secure:", process.env.EMAIL_SECURE);
    } else {
        console.log("Server is ready to send emails");
    }
});

// Define a POST endpoint for sending emails.
// Your frontend will send requests to 'http://localhost:3001/send-email'.
app.post('/send-email', async (req, res) => {
    // Extract email details from the request body sent by the frontend.
    const { to, subject, text, html } = req.body;

    // Basic validation: ensure required fields are present.
    if (!to || !subject || (!text && !html)) {
        return res.status(400).json({ message: 'Missing required email fields.' });
    }

    try {
        // Define email options for Nodemailer.
        const mailOptions = {
            from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`, // Add a friendly name
            to,
            subject,
            text,
            html,
            headers: {
                'X-Priority': '1', // Add priority headers
                'X-MSMail-Priority': 'High',
                'Importance': 'high'
            }
        };

        // Send the email using the configured transporter.
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        
        // Return more detailed success response
        res.status(200).json({
            message: 'Email sent successfully!',
            messageId: info.messageId,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Detailed error:', {
            code: error.code,
            response: error.response,
            responseCode: error.responseCode
        });
        
        res.status(500).json({
            message: 'Failed to send email',
            error: error.message,
            code: error.code
        });
    }
});

// Add a health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'UP',
        timestamp: new Date().toISOString() 
    });
});

// Start the Express server and listen for incoming requests.
app.listen(port, () => {
    console.log(`Email sender backend listening at http://localhost:${port}`);
});
