var mongoose   = require('mongoose')
  , FileSchema = require('../schemas').FileSchema

var File = mongoose.model('File', FileSchema)

module.exports = File
