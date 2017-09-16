#!/bin/bash

while getopts ":a:" opt; do
  case $opt in
    a) api_server_ip="$OPTARG"
    ;;
  esac
done

sudo git clone http://www.github.com/plainviewdata/plainview ~/plainview

sudo python ~/plainview/client/client_config.py --api_server_ip "${api_server_ip}"

sudo npm install --prefix ~/plainview/client/ --production

sudo npm install forever -g

sudo npm start --prefix ~/plainview/client/