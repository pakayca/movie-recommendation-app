const router      = require('express').Router();
const nodemailer  = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: `"Ne İzlesem Formu" <${process.env.EMAIL_USER}>`,
    to:   process.env.EMAIL_USER,
    subject: 'Yeni İletişim Mesajı',
    html: `
      <h2>Yeni mesaj</h2>
      <p><b>Gönderen:</b> ${name} (${email})</p>
      <p><b>Mesaj:</b><br/>${message}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Mesaj iletildi!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Posta gönderilemedi.' });
  }
});

module.exports = router;
