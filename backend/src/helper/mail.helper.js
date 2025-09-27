const nodemailer = require("nodemailer");

exports.sendEmail = async (to, subject, htmlContent, attachments = [], replyTo = null, cc = null) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: process.env.MAIL_PORT === "465", // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_PORT === "465" ? process.env.MAIL_EMAIL : process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        });
        transporter.sendMail({
            from: `VCare Furniture" <${process.env.MAIL_EMAIL}>`,
            to,
            subject,
            html: htmlContent,
            replyTo,
            cc,
            attachments
        });
    } catch (error) {
        console.error(`[MAIL-HELPER] Error sending email: ${error.message}`);
        throw error;
    }
};
