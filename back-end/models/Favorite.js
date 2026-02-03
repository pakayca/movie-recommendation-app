const mongoose = require('mongoose');
const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Film',
    required: true
  }
}, { timestamps: true }); 

module.exports = mongoose.model('Favorite', favoriteSchema);
