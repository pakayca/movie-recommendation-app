require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

const Film = require('./models/Film');
const verifyToken = require('./middleware/auth');
const userListsRoutes = require('./routes/userList');
const filmRoutes = require('./routes/films');
        
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', userListsRoutes);
app.use('/api/films', filmRoutes); 
app.listen(PORT, () => console.log(`🚀 API ${PORT} portunda çalışıyor.`));

// MongoDB bağlantısı
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI eksik. .env dosyasını kontrol edin.");
  process.exit(1);
}
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB bağlı'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// MODELLER
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// Multer (poster yükleme)
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, 'uploads'),
  filename: (_, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// 🔐 Kayıt
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: 'Lütfen tüm alanları doldurun.' });

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername)
      return res.status(400).json({ message: 'Bu kullanıcı adı zaten kayıtlı.' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Bu email zaten kayıtlı.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'Kayıt başarılı!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

// 🔐 Giriş
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'Lütfen kullanıcı adı ve şifre girin.' });

    const user = await User.findOne({ username });
    if (!user)
      return res.status(400).json({ message: 'Kullanıcı bulunamadı.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Şifre yanlış.' });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ message: 'Giriş başarılı!', token, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

const crypto = require('crypto');
const resetTokens = new Map();

// Şifremi unuttum
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'E-posta bulunamadı.' });

    const token = crypto.randomBytes(32).toString('hex');
    resetTokens.set(token, user.email);

    const resetLink = `http://localhost:5500/reset-password.html?token=${token}`;

    const mailOptions = {
      to: email,
      subject: 'Şifre Sıfırlama',
      html: `<p>Şifrenizi sıfırlamak için <a href="${resetLink}">buraya tıklayın</a>.</p>`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Şifre sıfırlama bağlantısı gönderildi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Şifre sıfırlama
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, username, email, newPassword } = req.body;
  const storedEmail = resetTokens.get(token);
  if (!storedEmail || storedEmail !== email)
    return res.status(400).json({ message: 'Geçersiz veya süresi geçmiş bağlantı.' });

  try {
    const user = await User.findOne({ email, username });
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    resetTokens.delete(token);

    res.json({ message: 'Şifre güncellendi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});


// 📬 İletişim Formu
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
app.post('/api/contact', async (req, res) => {
  const { username, email, message } = req.body;

  const mailOptions = {
    from: `"Ne İzlesem Formu" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: 'Yeni İletişim Mesajı',
    html: `<h2>Yeni mesaj</h2><p><b>Gönderen:</b> ${username} (${email})</p><p><b>Mesaj:</b><br/>${message}</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Mesaj iletildi!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Posta gönderilemedi.' });
  }
});
