"""
Probabilistic tube line inference system for TFL Wrapped.

This module infers the most likely tube line for journeys based on:
- Station-to-line mappings
- Route heuristics (fewest interchanges, shortest path)
- Deterministic fallback for ambiguous cases

Note: Line data is inferred probabilistically due to limitations in available
journey history. The CSV data only contains tap-in and tap-out stations, not
the actual route taken.
"""

import json
import os
import hashlib
from typing import Dict, List, Tuple, Optional, Set
import pandas as pd

NETWORK_FILE = os.path.join(os.path.dirname(__file__), "tube_network.json")

with open(NETWORK_FILE, "r") as f:
    NETWORK_DATA = json.load(f)

STATIONS = NETWORK_DATA["stations"]
LINES = NETWORK_DATA["lines"]
STATION_ALIASES = NETWORK_DATA.get("station_aliases", {})


def normalize_station_name(station: str) -> str:
    if pd.isna(station):
        return ""

    import re

    station = str(station).strip()

    station = re.sub(r"\s*\[.*?\]", "", station)

    if station in STATION_ALIASES:
        station = STATION_ALIASES[station]

    for key in STATIONS.keys():
        if key.lower() == station.lower():
            return key

    station_base = station.split("(")[0].strip()
    for key in STATIONS.keys():
        if key.lower() == station_base.lower():
            return key

    return station


def get_lines_for_station(station: str) -> Set[str]:
    normalized = normalize_station_name(station)
    if normalized in STATIONS:
        return set(STATIONS[normalized])
    return set()


def count_stations_on_line(
    start_station: str, end_station: str, line: str
) -> Optional[int]:
    """
    Count the number of stations between start and end on a given line.
    Returns None if both stations are not on the line or path cannot be determined.
    """
    normalized_start = normalize_station_name(start_station)
    normalized_end = normalize_station_name(end_station)

    if line not in LINES:
        return None

    line_stations = LINES[line]["stations"]

    # Find indices of stations on this line
    start_idx = None
    end_idx = None

    for i, station in enumerate(line_stations):
        if station.lower() == normalized_start.lower():
            start_idx = i
        if station.lower() == normalized_end.lower():
            end_idx = i

    if start_idx is None or end_idx is None:
        return None

    # Return absolute distance (number of stations)
    return abs(end_idx - start_idx)


def find_shortest_path_line(
    start_station: str, end_station: str, candidate_lines: Set[str]
) -> Optional[str]:
    best_line = None
    shortest_distance = float("inf")

    for line in candidate_lines:
        distance = count_stations_on_line(start_station, end_station, line)
        if distance is not None and distance < shortest_distance:
            shortest_distance = distance
            best_line = line

    return best_line


def deterministic_fallback(
    start_station: str, end_station: str, candidate_lines: Set[str]
) -> str:

    # Create deterministic hash from station names
    combined = f"{start_station}|{end_station}"
    hash_value = int(hashlib.md5(combined.encode()).hexdigest(), 16)

    # Convert to list and sort for consistency
    sorted_lines = sorted(list(candidate_lines))

    # Use hash to select deterministically
    selected_index = hash_value % len(sorted_lines)
    return sorted_lines[selected_index]


def infer_line_for_single_journey(
    start_station: str, end_station: str
) -> Tuple[str, str]:
    """
    Infer the most likely tube line for a single journey.

    Returns:
        Tuple of (inferred_line, confidence) where confidence is 'high', 'medium', or 'low'
    """
    # Skip bus journeys (handle both formats)
    start_lower = str(start_station).lower()
    end_lower = str(end_station).lower()
    if (
        "bus journey" in start_lower
        or "bus journey" in end_lower
        or (start_lower.startswith("bus") and "route" in start_lower)
        or (end_lower.startswith("bus") and "route" in end_lower)
    ):
        return ("Bus", "high")

    # Get lines serving start and end stations
    start_lines = get_lines_for_station(start_station)
    end_lines = get_lines_for_station(end_station)

    # If either station not found, return unknown
    if not start_lines or not end_lines:
        return ("Unknown", "low")

    # Compute intersection: lines that serve both stations
    common_lines = start_lines.intersection(end_lines)

    # Case 1: Exactly one line serves both stations -> High confidence
    if len(common_lines) == 1:
        return (list(common_lines)[0], "high")

    # Case 2: Multiple lines serve both stations -> Apply heuristics
    if len(common_lines) > 1:
        # Heuristic 1: Prefer lines with shortest path (fewest stations)
        shortest_line = find_shortest_path_line(
            start_station, end_station, common_lines
        )

        if shortest_line:
            # Check if there's a clear winner (significantly shorter)
            distances = {}
            for line in common_lines:
                dist = count_stations_on_line(start_station, end_station, line)
                if dist is not None:
                    distances[line] = dist

            if distances:
                min_dist = min(distances.values())
                # Get all other distances (excluding the minimum)
                other_distances = [d for d in distances.values() if d != min_dist]

                # If shortest is at least 2 stations shorter than others, medium confidence
                # If all distances are the same or very close, it's ambiguous (low confidence)
                if other_distances and min_dist < min(other_distances) - 1:
                    return (shortest_line, "medium")
                else:
                    # Ambiguous - use deterministic fallback
                    return (
                        deterministic_fallback(
                            start_station, end_station, common_lines
                        ),
                        "low",
                    )

        # If no valid path found, use deterministic fallback
        return (deterministic_fallback(start_station, end_station, common_lines), "low")

    # Case 3: No common lines -> Journey requires interchange
    # For simplicity, we'll try to find the most direct route
    # This is a simplified approach - in reality, we'd need full routing

    # Try to find a line that serves start and has connection to end
    # For now, use first available line from start as fallback
    if start_lines:
        return (list(start_lines)[0], "low")

    return ("Unknown", "low")


def infer_line_for_journey(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add inferred line and confidence columns to journey DataFrame.

    This function processes the Journey column which contains strings like
    "Station A to Station B" and infers the most likely tube line.

    Args:
        df: DataFrame with at least a 'Journey' column

    Returns:
        DataFrame with added 'inferred_line' and 'confidence' columns
    """
    df = df.copy()

    # Extract start and end stations from Journey column
    def extract_stations(journey_str):
        if pd.isna(journey_str):
            return (None, None)

        journey_str = str(journey_str)

        # Skip bus journeys (handle both "Bus Journey" and "bus journey")
        journey_lower = journey_str.lower()
        if "bus journey" in journey_lower or (
            journey_lower.startswith("bus") and "route" in journey_lower
        ):
            return ("Bus Journey", "Bus Journey")

        # Split on " to "
        if " to " in journey_str:
            parts = journey_str.split(" to ", 1)
            start = parts[0].strip()
            end = parts[1].strip()
            return (start, end)

        return (None, None)

    # Apply inference to each journey
    inferred_data = []
    for idx, row in df.iterrows():
        start, end = extract_stations(row.get("Journey", ""))

        if start is None or end is None:
            inferred_data.append({"inferred_line": "Unknown", "confidence": "low"})
        else:
            line, confidence = infer_line_for_single_journey(start, end)
            inferred_data.append({"inferred_line": line, "confidence": confidence})

    # Add columns to DataFrame
    df["inferred_line"] = [d["inferred_line"] for d in inferred_data]
    df["confidence"] = [d["confidence"] for d in inferred_data]

    return df
