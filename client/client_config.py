import os
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--api_server_ip')
args = parser.parse_args()

with open("config/api_server.json", "r") as jsonFile:
    data = json.load(jsonFile)

data["ip"] = args.api_server_ip

with open("config/api_server.json", "w") as jsonFile:
    json.dump(data, jsonFile)