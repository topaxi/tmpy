;(function(window) { 'use strict';

var document = window.document
  , drop     = id('drop')
  , each     = Array.prototype.forEach

bind(drop, 'dragover', preventDefault)
bind(drop, 'drop', function(e) {
  e.preventDefault()
  e.stopPropagation()

  var files = e.dataTransfer.files

  each.call(e.dataTransfer.files, function(file) {
    var li       = create('li')
      , progress = create('progress')
      , span     = create('span')

    span.textContent = file.name

    li.appendChild(span)
    li.appendChild(progress)
    id('uploads').appendChild(li)

    upload(file, function(e) {
      if (e.lengthComputable) {
        progress.max = e.total
        progress.value = e.loaded
      }
    }, function() {
      var a = create('a')

      a.href        = this.responseText
      a.textContent = file.name

      li.removeChild(progress)
      li.removeChild(span)
      li.appendChild(a)
    })
  })
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

  if (progress) ul.onprogress          = progress
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

function create(el) {
  return document.createElement(el)
}

})(this)
