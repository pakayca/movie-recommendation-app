const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const verifyToken = require('../middleware/auth');
const Favorite = require('../models/Favorite');
const Watchlist = require('../models/Watchlist');

// Favorilere ekle
router.post('/favorite/add', verifyToken, async (req, res) => {
  const userId = req.user.id;
  let { movieId } = req.body;
  if (!movieId) return res.status(400).json({ message: 'movieId zorunlu' });

  try {
    if (typeof movieId === 'string') {
      movieId = new mongoose.Types.ObjectId(movieId);
    }

    const exists = await Favorite.findOne({ userId, movieId });
    if (exists) return res.status(409).json({ message: 'Film zaten favorilerde' });

    const favorite = new Favorite({ userId, movieId });
    await favorite.save();
    res.status(201).json({ message: 'Favorilere eklendi' });
  } catch (err) {
    res.status(500).json({ message: 'Favorilere eklenirken hata', error: err.message });
  }
});

// ✅ Favorileri getir
router.get('/favorite/list', verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const favorites = await Favorite.find({ userId }).populate('movieId').exec();
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ message: 'Favoriler alınamadı', error: err.message });
  }
});

// Favoriden çıkar
router.delete('/favorite/remove/:id', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const favId = req.params.id;
  if (!favId) return res.status(400).json({ message: 'Favori ID eksik' });

  try {
    const deleted = await Favorite.findOneAndDelete({ _id: favId, userId });
    if (!deleted) return res.status(404).json({ message: 'Favori bulunamadı veya yetkiniz yok' });
    res.json({ message: 'Favoriden çıkarıldı' });
  } catch (err) {
    res.status(500).json({ message: 'Favoriden çıkarma hatası', error: err.message });
  }
});

// İzlenecekler listesine ekle
router.post('/list/add', verifyToken, async (req, res) => {
  const userId = req.user.id;
  let { movieId } = req.body;
  if (!movieId) return res.status(400).json({ message: 'movieId zorunlu' });

  try {
    if (typeof movieId === 'string') {
      movieId = new mongoose.Types.ObjectId(movieId);
    }

    const exists = await Watchlist.findOne({ userId, movieId });
    if (exists) return res.status(409).json({ message: 'Film zaten izleneceklerde' });

    const watchlist = new Watchlist({ userId, movieId });
    await watchlist.save();
    res.status(201).json({ message: 'İzlenecekler listesine eklendi' });
  } catch (err) {
    res.status(500).json({ message: 'İzlenecekler listesine eklenirken hata', error: err.message });
  }
});

// ✅ İzlenecekler listesini getir
router.get('/list/list', verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const list = await Watchlist.find({ userId }).populate('movieId').exec();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'İzlenecekler alınamadı', error: err.message });
  }
});

// İzleme listesinden çıkar
router.delete('/list/remove/:id', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const watchId = req.params.id;
  if (!watchId) return res.status(400).json({ message: 'İzleme listesi ID eksik' });

  try {
    const deleted = await Watchlist.findOneAndDelete({ _id: watchId, userId });
    if (!deleted) return res.status(404).json({ message: 'İzleme listesi kaydı bulunamadı veya yetkiniz yok' });
    res.json({ message: 'İzleme listesinden çıkarıldı' });
  } catch (err) {
    res.status(500).json({ message: 'İzleme listesinden çıkarma hatası', error: err.message });
  }
});

module.exports = router;
