const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Kayıt olma
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername)
      return res.status(400).json({ message: 'Bu kullanıcı adı zaten kayıtlı.' });

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail)
      return res.status(400).json({ message: 'Bu e-posta zaten kayıtlı.' });


    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Kayıt başarılı!' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Giriş yapma
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'Lütfen kullanıcı adı ve şifre girin.' });

    const user = await User.findOne({ username });
    if (!user)
      return res.status(400).json({ message: 'Geçersiz kullanıcı adı veya şifre.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Geçersiz kullanıcı adı veya şifre.' });

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, username: user.username, message: 'Giriş başarılı!' });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const resetTokens = new Map();

//E-posta ile sıfırlama linki gönder
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'E-posta bulunamadı.' });

    const token = crypto.randomBytes(32).toString('hex');
    resetTokens.set(token, user.email);

    const resetLink = `http://localhost:5500/reset-password.html?token=${token}`;

    const mailOptions = {
      to: email,
      subject: 'Şifre Sıfırlama',
      html: `<p>Şifrenizi sıfırlamak için <a href="${resetLink}">buraya tıklayın</a>.</p>`
    };

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Şifre sıfırlama bağlantısı gönderildi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Şifre sıfırlama
router.post('/reset-password', async (req, res) => {
  const { token, username, email, newPassword } = req.body;

  const storedEmail = resetTokens.get(token);
  if (!storedEmail || storedEmail !== email)
    return res.status(400).json({ message: 'Geçersiz veya süresi geçmiş bağlantı.' });

  const user = await User.findOne({ email, username });
  if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  resetTokens.delete(token);

  res.json({ message: 'Şifre güncellendi.' });
});


module.exports = router;
