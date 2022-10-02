import nodemailer from 'nodemailer'
import 'dotenv/config'

export async function sendEmail(email, subject, text) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.USERNAME,
                pass: process.env.PASSWORD,
            },
        });

        await transporter.sendMail({
            from: process.env.USERNAME,
            to: email,
            subject: subject,
            text: text,
        });
        console.log("email sent sucessfully");
    } catch (err){
        console.log(err, "email not sent");
    }
}