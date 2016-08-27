const mongoose = require('mongoose')
const path     = require('path')

var FileSchema = mongoose.Schema({
  'name': String,
  'hash': String,
  'size': Number,
  'type': String,
  'date': Date
})

FileSchema.virtual('path').get(function() {
  return path.join(__dirname, '../uploads', this.hash)
})

module.exports = FileSchema
