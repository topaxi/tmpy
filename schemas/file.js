const mongoose = require('mongoose')
const path     = require('path')

var FileSchema = mongoose.Schema({
  'name':     String,
  'hash':     { type: String, index: { unique: true } },
  'filehash': String,
  'size':     Number,
  'type':     String,
  'date':     Date
})

FileSchema.pre('save', function(next) {
  this.hash = parseInt(this.filehash, 16).toString(36).slice(0, 6)

  next()
})

FileSchema.virtual('path').get(function() {
  return path.join(__dirname, '../uploads', this.filehash)
})

module.exports = FileSchema
