#!/bin/bash

sudo apt-get update
sudo apt-get install -y git
sudo git clone http://www.github.com/plainviewdata/plainview ~/plainview
########################### api, client
sudo curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y npm

sudo npm install --prefix ~/plainview/api/
sudo npm install --prefix ~/plainview/client/

sudo npm start --prefix ~/plainview/api/
sudo npm start --prefix ~/plainview/client/
########################### proxy
sudo apt-get install -y build-essential

sudo apt-get install -y python-setuptools python-dev build-essential
sudo easy_install pip

sudo git clone https://github.com/hypothesis/via ~/via

sudo -H make deps -C ~/via

sudo -H nohup make serve -C ~/via &
########################### webserver
while getopts ":a:p:c:" opt; do
  case $opt in
    i) ip="$OPTARG"
    ;;
  esac
done

sudo python nginx_config.py --ip "${ip}"

sudo cp ~/plainview/webserver/default ~/../../etc/nginx/sites-available/
sudo cp ~/plainview/webserver/default ~/../../etc/nginx/sites-enabled/

sudo service nginx start