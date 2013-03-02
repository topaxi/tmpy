;(function(window) { 'use strict';

var document = window.document
  , drop     = id('drop')

bind(drop, 'dragover', preventDefault)
bind(drop, 'drop', function(e) {
  e.preventDefault()
  e.stopPropagation()

  var files = e.dataTransfer.files

  for (var i = 0, l = files.length; i < l; ++i) {
    upload(files[i], function() { console.log(arguments) })
  }
}, false)

function id(id) {
  return document.getElementById(id)
}

function preventDefault(e) {
  e.preventDefault()
}

function bind(el, ev, fun) {
  ev.split(' ').forEach(function(ev) {
    el.addEventListener(ev, fun, false)
  })
}

function upload(file, prog, done) {
  var xhr  = new XMLHttpRequest
    , form = new FormData
    , ul   = xhr.upload || xhr

  form.append('file', file)

  xhr.open('post', '/upload', true)

  if (progress) bind(ul, 'progress', progress)
  if (done)     xhr.onreadystatechange = ready(done)

  xhr.send(form)
}

function ready(fun) {
  return function() {
    if (this.readyState == 3) fun.apply(this, arguments)
  }
}

function progress(fun) {
  return function(e) {
    var position = e.position  || e.loaded
        total    = e.totalSize || e.total

    fun.call(this, e, position, total)
  }
}

})(this)
