var mongoose = require('mongoose')
  , path     = require('path')

var FileSchema = mongoose.Schema({ 'name': String
                                 , 'hash': String
                                 , 'size': Number
                                 , 'type': String
                                 , 'date': Date
                                 })

FileSchema.virtual('path').get(function() {
  return path.join(__dirname, '../public/uploads', this.hash)
})

module.exports = FileSchema
