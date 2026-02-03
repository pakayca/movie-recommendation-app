const mongoose = require('mongoose');

const filmSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  genre:       [String],
  year:        Number,
  rating:      Number,
  description: String,
  imageUrl:    String,
  category:    { 
    type: String, 
    enum: ['popüler', 'kesin izle', 'can sıkıntısında akar', 'bence yaklaşma', 'boş zaman eğlencesi', 'hep film olmaz'], 
    default: 'popüler' 
  },
  trailerUrl:  String,
  comment:     String
}, { timestamps: true });

module.exports = mongoose.model('Film', filmSchema);
