#!/bin/bash

sudo apt-get update
sudo apt-get update

sudo apt-get install -y build-essential

sudo apt-get install -y python-setuptools python-dev build-essential

sudo easy_install pip

sudo apt-get install -y git

sudo git clone https://github.com/hypothesis/via ~/via

sudo -H make deps -C ~/via

sudo -H nohup make serve -C ~/via &
