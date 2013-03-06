#!/usr/bin/env bash

get() {
  if [[ $1 == http* ]] ;
  then
    curl -# -O -J -L $1
  else
    curl -# -O -J -L http://tmpy.topaxi.ch/uploads/$1
  fi
}

put() {
  curl -F file=@$1 http://tmpy.topaxi.ch/upload
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
    $1 $2
    ;;
  *)
    usage
    ;;
esac
