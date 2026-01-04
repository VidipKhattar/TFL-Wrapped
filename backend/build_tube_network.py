import json

with open("london_stations.json", "r") as f:
    station_data = json.load(f)

lines = {}
all_lines = set()

for station, station_lines in station_data["stations"].items():
    for line in station_lines:
        all_lines.add(line)

for line in sorted(all_lines):
    lines[line] = {"stations": []}

for station, station_lines in station_data["stations"].items():
    for line in station_lines:
        if line in lines:
            lines[line]["stations"].append(station)

for line in lines:
    lines[line]["stations"] = sorted(lines[line]["stations"])

tube_network = {"stations": station_data["stations"], "lines": lines}

with open("tube_network.json", "w") as f:
    json.dump(tube_network, f, indent=2)
