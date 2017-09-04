import os
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--api_server_ip')
parser.add_argument('--client_server_ip')
parser.add_argument('--proxy_server_ip')
args = parser.parse_args()

with open(os.path.join("/home/ubuntu/plainview/webserver", "default_template.txt"), "rt") as fin:
    with open(os.path.join("/home/ubuntu/plainview/webserver", "default"), "wt") as fout:
        for line in fin:
            fout.write(line.replace('{{api_server_ip}}', args.api_server_ip))

with open(os.path.join("/home/ubuntu/plainview/webserver", "default_template.txt"), "rt") as fin:
    with open(os.path.join("/home/ubuntu/plainview/webserver", "default"), "wt") as fout:
        for line in fin:
            fout.write(line.replace('{{client_server_ip}}', args.client_server_ip))

with open(os.path.join("/home/ubuntu/plainview/webserver", "default_template.txt"), "rt") as fin:
    with open(os.path.join("/home/ubuntu/plainview/webserver", "default"), "wt") as fout:
        for line in fin:
            fout.write(line.replace('{{proxy_server_ip}}', args.proxy_server_ip))