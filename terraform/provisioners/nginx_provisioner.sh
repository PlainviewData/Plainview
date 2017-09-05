#!/bin/bash

while getopts ":a:p:c:" opt; do
  case $opt in
    a) api_server_ip="$OPTARG"
    ;;
    p) proxy_server_ip="$OPTARG"
    ;;
    c) client_server_ip="$OPTARG"
    ;;
  esac
done

sudo apt-get update

sudo apt-get install -y git
sudo curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nginx

sudo git clone http://www.github.com/plainviewdata/plainview ~/plainview

sudo python ~/plainview/webserver/nginx_config.py --api_server_ip "${api_server_ip}" --client_server_ip "${client_server_ip}" --proxy_server_ip "${proxy_server_ip}"

sudo cp ~/plainview/webserver/default ~/../../etc/nginx/sites-available/

sudo cp ~/plainview/webserver/default ~/../../etc/nginx/sites-enabled/

sudo service nginx start