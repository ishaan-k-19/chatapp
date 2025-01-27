import { createTransport } from "nodemailer";

export const sendMail = async (email, subject, html) => {
    // Create a Nodemailer transport instance with the specified configuration
    const transport = createTransport({
        service: "Hostinger", // Email service provider (e.g., Gmail, Hostinger, etc.)
        host: process.env.SMTP_HOST, // SMTP host address, provided in environment variables
        port: process.env.SMTP_PORT, // SMTP port, provided in environment variables
        secure: true, // Indicates the use of a secure connection (SSL/TLS)
        secureConnection: false, // Ensures TLS is used if available
        tls: {
            ciphers: "SSLv3", // Specifies the cipher suite to use for SSL/TLS connections
        },
        requireTLS: true, // Forces the use of TLS for the connection
        debug: true, // Enables debug mode for detailed connection logs
        connectionTimeout: 10000, // Timeout for establishing the connection in milliseconds
        auth: {
            user: process.env.SMTP_USER, // SMTP username (from environment variables)
            pass: process.env.SMTP_PASS, // SMTP password (from environment variables)
        },
        from: process.env.SMTP_USER, // Default sender address for emails
    });

    // Send an email using the transport configuration
    await transport.sendMail({
        from: process.env.SMTP_USER, // Sender's email address
        to: email, // Recipient's email address
        subject, // Email subject
        html, // HTML content of the email body
    });
};
