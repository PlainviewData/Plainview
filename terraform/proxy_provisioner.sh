#!/bin/bash

sudo apt-get update

sudo apt-get install -y git

sudo git clone https://github.com/hypothesis/via ~/via

sudo make deps --directory=~/via

sudo make serve --directory=~/via
