import os
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--ip')
args = parser.parse_args()

with open("/home/ubuntu/plainview/webserver/default_template.txt", "rt") as fin:
    with open("/home/ubuntu/plainview/webserver/default", "wt") as fout:
        for line in fin:
            newline = line.replace('{{ip}}', args.ip)
            fout.write(newline)