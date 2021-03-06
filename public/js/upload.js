// Author:  Damian Senn
// License: MIT
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

function ProgressEvent(e, up) {
  this.originalEvent    = e
  this.lengthComputable = e.lengthComputable
  this.currentTarget    = e.currentTarget
  this.loaded           = up.chunkNumber * up.chunkSize + up.chunkLoaded
  this.position         = this.loaded
  this.target           = e.target
  this.timeStamp        = e.timeStamp
  this.file             = up.file
  this.total            = up.file.size
  this.totalSize        = e.total
  this.type             = e.progress
  this.chunk            = { loaded:  up.chunkLoaded
                          , total:   up.chunkTotal
                          , number:  up.chunkNumber
                          , percent: 100 / up.chunkTotal * up.chunkLoaded
                          }
  this.percent          = 100 / this.total * this.loaded
}

function Upload(file, target, config) {
  if (!this) return new Upload(file, target, config)

  if (!config && typeof target != 'string') {
    config = target
    target = null
  }

  this.fileId          = ++fileId
  this.file            = file
  this.fileName        = config.fileName  || Upload.fileName
  this.target          = config.target    || target || Upload.target
  this.chunkSize       = config.chunkSize || Upload.chunkSize
  this.accept          = config.accept    || Upload.accept
  this.method          = config.method
  this.events          = {}
  this.xhr             = null // the current XMLHttpRequest
  this.chunkLoaded     = null
  this.chunkTotal      = null
  this.chunkNumber     = null
  this.chunking        = config.chunking != null ? config.chunking : Upload.chunking
  this.chunks          = this.countChunks()
  this.data            = config.data || null // additional data to be uploaded
  this.prependQueue    = !!config.prependQueue
  this.processResponse = config.processResponse || Upload.processResponse

  if (typeof config == 'function') {
    this.on('start', config)
  }

  if (config.start)    this.once('start',    config.start   )
  if (config.progress) this.on  ('progress', config.progress)
  if (config.done)     this.once('done',     config.done    )
}

Upload.upload          = upload
Upload.target          = '/upload'
Upload.method          = 'post'
Upload.fileName        = 'file'
Upload.max             = 4
Upload.chunking        = true
Upload.chunkSize       = 2 * 1024 * 1024
Upload.accept          = 'application/json'
Upload.processResponse = function(xhr) { return xhr }

Upload.prototype = {
    constructor: Upload
  , send: function(method) {
    if (method) this.method = method

    if (uploadCount >= Upload.max) {
      globalQueue[this.prependQueue ? 'unshift' : 'push'](this)

      return
    }

    uploadCount++

    this.onbeforesend(function() {
      this.chunks      = this.chunking ? this.countChunks() : 1
      this.chunkNumber = 0
      this._sendChunk()

      this.trigger('start')
    }.bind(this))
  }
  , countChunks: function() {
    return this.chunks = Math.round(this.file.size / this.chunkSize + .5)
  }
  , _sendChunk: function() {
    var form   = new FormData
      , xhr    = this.xhr = new XMLHttpRequest
      , upload = xhr.upload || xhr
      , chunk  = this.chunking ? sliceFile(this.file, this.chunkNumber, this.chunkSize) : this.file

    if (this.chunking) {
      form.append('first', +(this.chunkNumber == 0))
      form.append('last',  +(this.chunkNumber == this.chunks - 1))
    }

    if (this.data) {
      for (var i in this.data) {
        form.append(i, this.data[i])
      }
    }

    form.append(this.fileName, chunk, this.file.name)

    xhr.open(this.method || Upload.method, this.target, true)
    xhr.setRequestHeader('Accept', this.accept)
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')

    upload.onprogress = progress(this._progress, this)

    xhr.onreadystatechange = ready(this._ready, this)

    xhr.send(form)
  }
  , _progress: function(e, chunkLoaded, chunkTotal) {
    this.chunkLoaded = chunkLoaded
    this.chunkTotal  = chunkTotal

    this.trigger('progress', new ProgressEvent(e, this))
  }
  , _ready: function() {
    var res = this.processResponse(this.xhr)

    if (this.chunkNumber == this.chunks - 1) {
      this.trigger('ready', res)
      this.trigger('done',  res)

      this.xhr = this.chunkLoaded = this.chunkTotal = null

      fileDone()
    }
    else {
      this.trigger('ready',      res)
      this.trigger('chunk done', res)
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
  , off: function(e, handler) {
    if (!Array.isArray(this.events[e])) return this

    if (!handler) {
      this.events[e] = []

      return this
    }

    var i = this.events[e].indexOf(handler)

    if (i >= 0) this.events[e].splice(i, 1)

    return this
  }
  , once: function(e, handler) {
    this.on(e, function() {
      handler.apply(this, arguments)

      this.off(e, handler)
    })
  }
  , onbeforesend: function(callback) {
    callback()
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
