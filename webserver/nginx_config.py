import os
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--api_server_ip')
parser.add_argument('--client_server_ip')
parser.add_argument('--proxy_server_ip')
args = parser.parse_args()

with open("default_template.txt", "rt") as fin:
    with open("default", "wt") as fout:
        for line in fin:
            newline = line.replace('{{api_server_ip}}', args.api_server_ip)
            newline = newline.replace('{{client_server_ip}}', args.client_server_ip)
            newline = newline.replace('{{proxy_server_ip}}', args.proxy_server_ip)
            fout.write(newline)