import pandas as pd
from typing import Tuple, Literal
from datetime import datetime


def detect_csv_format(df: pd.DataFrame) -> Literal["contactless", "oyster"]:
    columns = [col.lower().strip() for col in df.columns]

    if "start time" in columns and "journey/action" in columns:
        return "oyster"

    if "charge (gbp)" in columns and "journey" in columns and "time" in columns:
        return "contactless"

    if "charge" in columns and "journey" in columns:
        if "start time" in columns:
            return "oyster"
        return "contactless"
    return "contactless"


def parse_contactless_csv(df: pd.DataFrame) -> pd.DataFrame:
    result = df.copy()
    result["Date"] = pd.to_datetime(result["Date"], format="%d/%m/%Y", errors="coerce")

    result["Charge_Abs"] = result["Charge (GBP)"].abs()

    if "Time" in result.columns:
        time_parts = result["Time"].str.split(" - ", expand=True)
        result["Start_Time"] = time_parts[0]
        result["End_Time"] = time_parts[1] if len(time_parts.columns) > 1 else None
        result["Hour"] = pd.to_datetime(
            result["Start_Time"], format="%H:%M", errors="coerce"
        ).dt.hour

        start_dt = pd.to_datetime(result["Start_Time"], format="%H:%M", errors="coerce")
        end_dt = pd.to_datetime(result["End_Time"], format="%H:%M", errors="coerce")
        result["Duration_Minutes"] = (end_dt - start_dt).dt.total_seconds() / 60
    else:
        result["Start_Time"] = None
        result["End_Time"] = None
        result["Hour"] = None
        result["Duration_Minutes"] = None

    result["Journey"] = result["Journey"]

    result["Journey_Type"] = result["Journey"].apply(
        lambda x: (
            "Bus"
            if "Bus Journey" in str(x) or "bus journey" in str(x).lower()
            else "Tube/Train"
        )
    )

    if "Capped" in result.columns:
        result["Capped"] = result["Capped"]
    else:
        result["Capped"] = None

    return result


def parse_oyster_csv(df: pd.DataFrame) -> pd.DataFrame:
    result = df.copy()

    date_formats = ["%d-%b-%Y", "%d-%B-%Y", "%d/%m/%Y", "%Y-%m-%d"]
    date_parsed = False

    original_date_col = result["Date"].copy()

    for fmt in date_formats:
        try:
            parsed = pd.to_datetime(original_date_col, format=fmt, errors="coerce")
            if parsed.notna().sum() > len(result) * 0.5:
                result["Date"] = parsed
                date_parsed = True
                break
        except:
            continue

    if not date_parsed:
        result["Date"] = pd.to_datetime(original_date_col, errors="coerce")

    if "Charge" in result.columns:
        result["Charge_Abs"] = result["Charge"].abs()
    else:
        result["Charge_Abs"] = 0

    if "Start Time" in result.columns:
        result["Start_Time"] = result["Start Time"]
        result["Hour"] = pd.to_datetime(
            result["Start_Time"], format="%H:%M", errors="coerce"
        ).dt.hour
    else:
        result["Start_Time"] = None
        result["Hour"] = None

    if "End Time" in result.columns:
        result["End_Time"] = result["End Time"]
        start_dt = pd.to_datetime(result["Start_Time"], format="%H:%M", errors="coerce")
        end_dt = pd.to_datetime(result["End_Time"], format="%H:%M", errors="coerce")
        result["Duration_Minutes"] = (end_dt - start_dt).dt.total_seconds() / 60
    else:
        result["End_Time"] = None
        result["Duration_Minutes"] = None

    if "Journey/Action" in result.columns:
        result["Journey"] = result["Journey/Action"]
    elif "Journey" in result.columns:
        result["Journey"] = result["Journey"]
    else:
        result["Journey"] = ""

    result["Journey_Type"] = result["Journey"].apply(
        lambda x: (
            "Bus"
            if "bus journey" in str(x).lower() or "bus" in str(x).lower()[:10]
            else "Tube/Train"
        )
    )

    if "Note" in result.columns:
        result["Capped"] = result["Note"].apply(
            lambda x: (
                "Y"
                if pd.notna(x)
                and ("cap" in str(x).lower() or "cheaper or free" in str(x).lower())
                else "N"
            )
        )
    else:
        result["Capped"] = "N"

    return result


def normalize_journey_string(journey_str: str) -> str:
    if pd.isna(journey_str):
        return ""

    journey = str(journey_str).strip()

    import re

    journey = re.sub(r"\s*\[.*?\]", "", journey)

    if "bus journey" in journey.lower():
        if "route" in journey.lower():
            route_match = re.search(r"route\s+(\w+)", journey, re.IGNORECASE)
            if route_match:
                return f"Bus Journey, Route {route_match.group(1).upper()}"
        return "Bus Journey"

    return journey.strip()


def load_and_normalize_csv(csv_path: str) -> pd.DataFrame:
    """
    Load CSV file, detect format, parse, and normalize to common structure.

    Returns:
        DataFrame with normalized columns: Date, Journey, Charge_Abs, Start_Time, Hour, Journey_Type, Capped
    """
    df = pd.read_csv(csv_path, skipinitialspace=True)

    if len(df) > 0:
        first_row_empty = (
            df.iloc[0].isna().all() or (df.iloc[0].astype(str).str.strip() == "").all()
        )
        if first_row_empty:
            df = df.iloc[1:].reset_index(drop=True)

    df = df.dropna(how="all")

    key_cols = ["Date", "Journey", "Journey/Action"]
    available_key_cols = [col for col in key_cols if col in df.columns]
    if available_key_cols:
        df = df.dropna(subset=available_key_cols, how="all")

    csv_format = detect_csv_format(df)

    if csv_format == "oyster":
        df = parse_oyster_csv(df)
    else:
        df = parse_contactless_csv(df)

    df["Journey"] = df["Journey"].apply(normalize_journey_string)

    required_cols = [
        "Date",
        "Journey",
        "Charge_Abs",
        "Start_Time",
        "End_Time",
        "Hour",
        "Journey_Type",
        "Capped",
        "Duration_Minutes",
    ]
    for col in required_cols:
        if col not in df.columns:
            df[col] = None

    df = df[df["Date"].notna()]

    df = df.sort_values("Date", ascending=False).reset_index(drop=True)

    return df
