const mongoose = require('mongoose')
const path     = require('path')
const config   = require('../lib/config')

var FileSchema = mongoose.Schema({
  'name':     String,
  'hash':     { type: String, index: { unique: true } },
  'filehash': { type: String, required: true, minlength: 6 },
  'size':     Number,
  'type':     String,
  'date':     Date
})

FileSchema.pre('save', function(next) {
  this.hash = parseInt(this.filehash, 16).toString(36).slice(0, 6)

  next()
})

FileSchema.virtual('path').get(function() {
  return path.join(config['upload-dir'], this.filehash)
})

module.exports = FileSchema
