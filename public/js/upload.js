!function(window) { 'use strict';

var slice       = Array.prototype.slice
  , globalQueue = []
  , uploadCount = 0
  , fileId      = 0

function upload(files, target, config) {
  if (files.length) {
    return slice.call(files).map(up)
  }

  return up(file)

  function up(file) {
    return new Upload(file, target, config).send()
  }
}

function Upload(file, target, config) {
  if (!this) return new Upload(file, target, config)

  if (!config && typeof target != 'string') {
    config = target
  }

  this.fileId      = ++fileId
  this.file        = file
  this.fileName    = config.fileName  || Upload.fileName
  this.target      = config.target    || target || Upload.target
  this.chunkSize   = config.chunkSize || Upload.chunkSize
  this.method      = config.method
  this.events      = {}
  this.xhr         = null // the current XMLHttpRequest
  this.chunkLoaded = null
  this.chunkTotal  = null
  this.chunkNumber = null
  this.chunking    = config.chunking != null ? config.chunking : Upload.chunking
  this.chunks      = Math.round(this.file.size / this.chunkSize + .5)

  if (config.start)    this.events.start    = [ config.start    ]
  if (config.progress) this.events.progress = [ config.progress ]
  if (config.done)     this.events.done     = [ config.done     ]
}

Upload.upload    = upload
Upload.target    = '/upload'
Upload.method    = 'post'
Upload.fileName  = 'file'
Upload.max       = 4
Upload.chunking  = true
Upload.chunkSize = 2 * 1024 * 1024

Upload.prototype = {
    constructor: Upload
  , send: function(method) {
    if (method) this.method = method

    if (uploadCount >= Upload.max) {
      globalQueue.push(this)

      return
    }

    uploadCount++

    this.chunks      = this.chunking ? Math.round(this.file.size / this.chunkSize + .5) : 1
    this.chunkNumber = 0
    this._sendChunk()

    return this.trigger('start')
  }
  , _sendChunk: function() {
    var form   = new FormData
      , xhr    = this.xhr = new XMLHttpRequest
      , upload = xhr.upload || xhr
      , chunk  = this.chunking ? sliceFile(this.file, this.chunkNumber, this.chunkSize) : this.file

    if (this.chunking) {
      form.append('first', this.chunkNumber == 0)
      form.append('last',  this.chunkNumber == this.chunks - 1)
    }

    form.append(this.fileName, chunk, this.file.name)

    xhr.open(this.method || Upload.method, this.target, true)

    upload.onprogress = progress(this._progress, this)

    xhr.onreadystatechange = ready(this._ready, this)

    xhr.send(form)
  }
  , _progress: function(e, chunkLoaded, chunkTotal) {
    this.chunkLoaded = chunkLoaded
    this.chunkTotal  = chunkTotal

    this.trigger('progress', e, this.chunkNumber * this.chunkSize + chunkLoaded, this.file.size)
  }
  , _ready: function() {
    if (this.chunkNumber == this.chunks - 1) {
      fileDone()
      this.trigger('done', this.xhr)

      this.xhr = this.chunkLoaded = this.chunkTotal = null
    }
    else {
      this.chunkNumber++
      this._sendChunk()
    }
  }
  , post: function() {
    return this.send('post')
  }
  , put: function() {
    return this.send('put')
  }
  , trigger: function(e) {
    if (Array.isArray(this.events[e])) {
      var args = slice.call(arguments, 1)

      this.events[e].forEach(function(handler) {
        handler.apply(this, args)
      }, this)
    }

    return this
  }
  , on: function(e, handler) {
    if (!Array.isArray(this.events[e])) {
      this.events[e] = [ handler ]

      return this
    }

    this.events[e].push(handler)

    return this
  }
}

function sliceFile(file, from, size) {
  return file.slice(from * size, from * size + size, file.type)
}

function fileDone() {
  uploadCount--

  if (globalQueue.length) {
    globalQueue.shift().send()
  }
}

function ready(fun, self) {
  return function() {
    if (this.readyState == 3) fun.apply(self, arguments)
  }
}

function progress(fun, self) {
  return function(e) {
    var loaded = e.position  || e.loaded
      , total  = e.totalSize || e.total

    fun.call(self, e, loaded, total)
  }
}

if (typeof define == 'function') {
  define('upload', function() { return Upload });
}
else {
  window.Upload = Upload
}

}(this)
