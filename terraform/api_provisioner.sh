#!/bin/bash

sudo apt-get update

sudo git clone http://www.github.com/plainviewdata/plainview ~/plainview

cd ~/plainview/api/

sudo npm install --prefix ~/plainview/api/

sudo nohup npm start --prefix ~/plainview/api/