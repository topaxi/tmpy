!function(window) { 'use strict';

var document = window.document
var Upload   = window.Upload
var drop     = id('drop')
var each     = Array.prototype.forEach
var maxAge   = tmpy.maxAge * 60 * 1000

Upload.chunking = false

var clicker = document.createElement('input')
clicker.type = 'file'
clicker.multiple = true

bind(clicker, 'change', function(e) {
  upload(e.target.files)
  e.target.value = null
})
bind(clicker, 'drop dragover', function(e) {
  e.stopImmediatePropagation()
})

drop.appendChild(clicker)

bind(drop, 'drop dragover', preventDefault)
bind(drop, 'drop', function(e) {
  e.stopPropagation()

  upload(e.dataTransfer.files)
})

function upload(files) {
  Upload.upload(files, {
    start: function() {
      var li       = create('li')
      var progress = create('progress')
      var span     = create('span')

      span.textContent = this.file.name

      li.appendChild(span)
      li.appendChild(progress)
      id('uploads').appendChild(li)

      this.on('progress', function(e) {
        if (e.lengthComputable) {
          progress.max         = e.total
          progress.value       = e.loaded
          progress.textContent = e.percent
        }
      })

      this.on('done', function() {
        var a = create('a')

        a.href        = this.xhr.responseText
        a.textContent = this.file.name

        li.dataset.created = Date.now()

        li.removeChild(progress)
        li.removeChild(span)
        li.appendChild(a)
      })
    }
  })
}

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

function create(el) {
  return document.createElement(el)
}

!function janitor() {
  var now     = Date.now()
  var uploads = id('uploads')

  each.call(uploads.children, function(li) {
    if (now - li.dataset.created >= maxAge) {
      uploads.removeChild(li)
    }
  })

  setTimeout(janitor, 5000)
}()

}(this)
