!function(window) { 'use strict';

var document = window.document
  , Upload   = window.Upload
  , drop     = id('drop')
  , each     = Array.prototype.forEach
  , maxAge   = tmpy.maxAge * 60 * 1000

Upload.chunking = false

bind(drop, 'drop dragover', preventDefault)
bind(drop, 'drop', function(e) {
  e.stopPropagation()

  Upload.upload(e.dataTransfer.files, {
    start: function() {
      var li       = create('li')
        , progress = create('progress')
        , span     = create('span')

      span.textContent = this.file.name

      li.appendChild(span)
      li.appendChild(progress)
      id('uploads').appendChild(li)

      this.on('progress', function(e, loaded, total) {
        if (e.lengthComputable) {
          progress.max         = total
          progress.value       = loaded
          progress.textContent = 100 / total * loaded + '%'
        }
      })

      this.on('done', function() {
        var a  = create('a')

        a.href        = this.xhr.responseText
        a.textContent = this.file.name

        li.dataset.created = Date.now()

        li.removeChild(progress)
        li.removeChild(span)
        li.appendChild(a)
      })
    }
  })
})

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
    , uploads = id('uploads')

  each.call(uploads.children, function(li) {
    if (now - li.dataset.created >= maxAge) {
      uploads.removeChild(li)
    }
  })

  setTimeout(janitor, 5000)
}()

}(this)
