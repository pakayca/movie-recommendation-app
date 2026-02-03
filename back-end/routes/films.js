const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const Favorite = require('../models/Favorite');
const Film = require('../models/Film');

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, 'uploads'),
  filename: (_, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/weekly', async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const topFavorites = await Favorite.aggregate([
      {
        $match: {
          createdAt: { $gte: oneWeekAgo }
        }
      },
      {
        $group: {
          _id: '$movieId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'films',
          localField: '_id',
          foreignField: '_id',
          as: 'film'
        }
      },
      { $unwind: '$film' },
      {
        $replaceRoot: {
          newRoot: '$film'
        }
      }
    ]);

    res.json(topFavorites);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Bu haftanın filmleri getirilemedi.',
      error: err.message
    });
  }
});

/*── GET /api/films/search ─────────────*/
router.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ message: 'Arama sorgusu boş olamaz' });

  try {
    const films = await Film.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }).limit(20);

    res.json(films);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

/*── POST /api/films/bulk ─────────────*/
router.post('/bulk', async (req, res) => {
  try {
    const films = req.body;
    if (!Array.isArray(films)) return res.status(400).json({ message: 'Dizi bekleniyor' });
    const saved = await Film.insertMany(films);
    res.status(201).json({ message: `${saved.length} film eklendi`, films: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

/*── GET /api/films ─────────────*/
router.get('/', async (req, res) => {
  try {
    const films = await Film.find();
    const grouped = films.reduce((acc, film) => {
      const category = film.category || 'belirsiz';
      if (!acc[category]) acc[category] = [];
      acc[category].push(film);
      return acc;
    }, {});
    res.json(grouped);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
});

/*── GET /api/films/:id ─────────────*/
router.get('/:id', async (req, res) => {
  try {
    const film = await Film.findById(req.params.id);
    film ? res.json(film) : res.sendStatus(404);
  } catch (err) {
    res.status(400).json({ message: 'Geçersiz ID' });
  }
});

/*── POST /api/films  (poster dosyası) ─*/
router.post('/', upload.single('poster'), async (req, res) => {
  try {
    const filmData = { ...req.body };
    if (req.file) filmData.imageUrl = '/uploads/' + req.file.filename;

    const film = new Film(filmData);
    await film.save();
    res.status(201).json(film);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Film eklenemedi' });
  }
});

/*── PUT /api/films/:id ─────────────*/
router.put('/:id', async (req, res) => {
  try {
    const updated = await Film.findByIdAndUpdate(req.params.id, req.body, { new: true });
    updated ? res.json(updated) : res.sendStatus(404);
  } catch (err) {
    res.status(400).json({ message: 'Geçersiz ID' });
  }
});

/*── DELETE /api/films/:id ─────────────*/
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Film.findByIdAndDelete(req.params.id);
    deleted ? res.sendStatus(204) : res.sendStatus(404);
  } catch (err) {
    res.status(400).json({ message: 'Geçersiz ID' });
  }
});

module.exports = router;
