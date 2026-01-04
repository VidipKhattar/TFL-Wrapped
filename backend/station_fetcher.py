import requests
import json
from collections import defaultdict

URL = "https://api.tfl.gov.uk/StopPoint/Mode/tube,overground,elizabeth-line,dlr,tram,national-rail"

response = requests.get(URL)
data = response.json()

stations = defaultdict(set)

for stop in data["stopPoints"]:
    name = stop["commonName"]

    for line in stop.get("lines", []):
        line_name = line["name"]
        stations[name].add(line_name)

stations_json = {
    "stations": {
        station: sorted(list(lines)) for station, lines in sorted(stations.items())
    }
}

with open("london_stations.json", "w") as f:
    json.dump(stations_json, f, indent=2)

print(f"Saved {len(stations_json['stations'])} stations")
