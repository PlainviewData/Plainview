import os
import argparse
import json

parser = argparse.ArgumentParser()
parser.add_argument('--api_server_ip')
args = parser.parse_args()

with open("/home/bitnami/plainview/client/config/api_server.json", "r") as jsonFile:
    data = json.load(jsonFile)

data["ip"] = args.api_server_ip+":4000"

with open("/home/bitnami/plainview/client/config/api_server.json", "w") as jsonFile:
    json.dump(data, jsonFile)