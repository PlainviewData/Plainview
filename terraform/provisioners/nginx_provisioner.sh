#!/bin/bash

while [[ $# -gt 1 ]]
do
key="$1"

case $key in
    -a|--api_server_ip)
    api_server_ip="$2"
    shift # past argument
    ;;
    -c|--client_server_ip)
    client_server_ip="$2"
    shift # past argument
    ;;
    -p|--proxy_server_ip)
    proxy_server_ip="$2"
    shift # past argument
    ;;
    --default)
    DEFAULT=YES
    ;;
    *)
            # unknown option
    ;;
esac
shift # past argument or value
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