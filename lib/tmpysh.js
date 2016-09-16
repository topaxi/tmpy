const dedent = require('dedent-js')
const config = require('./config')

module.exports = tmpysh
function tmpysh() {
  let baseUrl = `${config.https ? 'https' : 'http'}://${config.hostname}`

  return dedent`
    #!/usr/bin/env bash

    BASE_URL=${baseUrl}

    get() {
      if [[ "$1" == http* ]] ;
      then
        curl -# -O -J -L "$1"
      else
        curl -# -O -J -L "$BASE_URL/uploads/$1"
      fi
    }

    put() {
      curl -# -L -F file=@"$1" "$BASE_URL/upload"
    }

    usage() {
      echo 'Usage: tmpy.sh [action] [filename]'
      echo 'Actions:'
      echo '  get: get a file from tmpy'
      echo '  put: put a file on tmpy'
    }

    if [ $# -lt 2 ]
    then
      usage
      exit
    fi

    case "$1" in
      "get" | "put")
        $1 "$2"
        ;;
      *)
        usage
        ;;
    esac\n
  `
}
