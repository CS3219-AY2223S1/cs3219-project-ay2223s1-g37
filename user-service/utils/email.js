import nodemailer from 'nodemailer'

export async function sendEmail(email, subject, text) {
    try {
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: "heng.dora@gmail.com",
                pass: "mgmdaxedhjitclqp"
            },
        });

        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            text: text,
        });

        console.log("email sent sucessfully");
    } catch (err){
        console.log(err, "email not sent");
    }
}