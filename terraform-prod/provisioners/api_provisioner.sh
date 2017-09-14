#!/bin/bash

sudo apt-get update

sudo apt-get install -y git
sudo curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y npm

sudo git clone http://www.github.com/plainviewdata/plainview ~/plainview

sudo npm install --prefix ~/plainview/api/

sudo npm install forever

sudo npm start --prefix ~/plainview/api/