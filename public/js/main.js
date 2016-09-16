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
bind(drop, 'dragenter', function(e) {
  e.target.classList.add('drag-over')
})
bind(drop, 'dragleave drop', function(e) {
  e.target.classList.remove('drag-over')
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

      progress.max         = 1
      progress.value       = 0
      progress.textContent = 0

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
        else {
          progress.max         = null
          progress.value       = null
          progress.textContent = ''
        }
      })

      this.on('done', function() {
        var link = fragment()
        var a = create('a')
        var copy = create('button')

        var clipboard = new Clipboard(copy, {
          text: function() {
            return a.href
          }
        })

        link.appendChild(a)
        link.appendChild(copy)

        a.href        = this.xhr.responseText
        a.textContent = this.file.name

        copy.className = 'copy'
        copy.textContent = '📋'
        bind(copy, 'mouseleave', function(e) {
          e.currentTarget.classList.remove('tooltipped', 'tooltipped-s')
          e.currentTarget.removeAttribute('aria-label')
        })

        clipboard.on('success', function(e) {
          showTooltip(e.trigger, 'Copied!')
        })
        clipboard.on('error', function(e) {
          showTooltip(e.trigger, fallbackMessage(e.action))
        })

        li.dataset.created = Date.now()

        li.removeChild(progress)
        li.removeChild(span)
        li.appendChild(link)
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

function fragment() {
  return document.createDocumentFragment()
}

function showTooltip(el, msg) {
  el.classList.add('tooltipped', 'tooltipped-s')
  el.setAttribute('aria-label', msg)
}

function fallbackMessage(action) {
  var actionMsg = ''
  var actionKey = action === 'cut' ? 'X' : 'C'

  if (/iPhone|iPad/i.test(navigator.userAgent)) {
    actionMsg = 'No support :('
  }
  else if (/Mac/i.test(navigator.userAgent)) {
    actionMsg = 'Press ⌘-' + actionKey + ' to ' + action
  }
  else {
    actionMsg = 'Press Ctrl-' + actionKey + ' to ' + action
  }

  return actionMsg
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
