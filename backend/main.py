from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Any
import pandas as pd
from datetime import datetime
import os
import shutil
from line_inference import infer_line_for_journey
from csv_parser import load_and_normalize_csv

app = FastAPI(title="TFL Wrapped API", version="1.0.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://tfl-wrapped.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CSV_PATH = os.path.join(os.path.dirname(__file__), "journeys.csv")


def load_and_process_data(csv_path: str = None) -> pd.DataFrame:
    path = csv_path or CSV_PATH

    df = load_and_normalize_csv(path)
    df = infer_line_for_journey(df)

    return df


def compute_wrapped_metrics(df: pd.DataFrame) -> Dict[str, Any]:
    total_journeys = len(df)
    total_spent = df["Charge_Abs"].sum()

    route_counts = df["Journey"].value_counts().head(5)
    top_routes = [
        {"route": route, "count": int(count)} for route, count in route_counts.items()
    ]

    origins = df["Journey"].str.split(" to ").str[0].value_counts().head(3)
    destinations = df["Journey"].str.split(" to ").str[-1].value_counts().head(3)

    top_origins = [
        {"location": loc, "count": int(count)} for loc, count in origins.items()
    ]

    top_destinations = [
        {"location": loc, "count": int(count)} for loc, count in destinations.items()
    ]

    journey_type_counts = df["Journey_Type"].value_counts()
    journey_types = [
        {"type": jtype, "count": int(count)}
        for jtype, count in journey_type_counts.items()
    ]

    daily_spending = df.groupby(df["Date"].dt.date)["Charge_Abs"].sum().reset_index()
    daily_spending.columns = ["date", "amount"]
    daily_spending["date"] = daily_spending["date"].astype(str)

    hourly_counts = df["Hour"].value_counts().sort_index()
    hourly_pattern = [
        {"hour": int(hour), "count": int(count)}
        for hour, count in hourly_counts.items()
        if pd.notna(hour)
    ]

    if "Capped" in df.columns and df["Capped"].notna().any():
        capped_count = int((df["Capped"] == "Y").sum())
        non_capped_count = int((df["Capped"] == "N").sum())
    else:
        capped_count = int((df["Charge_Abs"] == 0).sum())
        non_capped_count = int((df["Charge_Abs"] > 0).sum())

    avg_cost = float(df[df["Charge_Abs"] > 0]["Charge_Abs"].mean())

    daily_spending_totals = df.groupby(df["Date"].dt.date)["Charge_Abs"].sum()
    avg_spend_per_day = (
        float(daily_spending_totals.mean()) if len(daily_spending_totals) > 0 else 0.0
    )

    date_range = (df["Date"].max() - df["Date"].min()).days + 1 if len(df) > 0 else 0

    if "Duration_Minutes" in df.columns and df["Duration_Minutes"].notna().any():
        total_time_minutes = float(df["Duration_Minutes"].sum())
    else:
        total_time_minutes = 0

    most_expensive = df.loc[df["Charge_Abs"].idxmax()]

    daily_journey_counts = df.groupby(df["Date"].dt.date).size().reset_index()
    daily_journey_counts.columns = ["date", "count"]
    busiest_day = daily_journey_counts.loc[daily_journey_counts["count"].idxmax()]

    if "inferred_line" in df.columns:
        line_counts = (
            df[df["inferred_line"].isin(["Bus", "Unknown"]) == False]["inferred_line"]
            .value_counts()
            .head(5)
        )
        top_lines = [
            {"line": line, "count": int(count)} for line, count in line_counts.items()
        ]

        # Confidence breakdown
        confidence_counts = df["confidence"].value_counts().to_dict()
        confidence_breakdown = {
            "high": int(confidence_counts.get("high", 0)),
            "medium": int(confidence_counts.get("medium", 0)),
            "low": int(confidence_counts.get("low", 0)),
        }
    else:
        top_lines = []
        confidence_breakdown = {"high": 0, "medium": 0, "low": 0}

    return {
        "summary": {
            "total_journeys": total_journeys,
            "total_spent": round(total_spent, 2),
            "average_cost": round(avg_cost, 2),
            "average_spend_per_day": round(avg_spend_per_day, 2),
            "days_covered": date_range,
            "capped_journeys": capped_count,
            "non_capped_journeys": non_capped_count,
            "total_time_minutes": round(total_time_minutes, 0),
        },
        "top_routes": top_routes,
        "top_origins": top_origins,
        "top_destinations": top_destinations,
        "journey_types": journey_types,
        "daily_spending": daily_spending.to_dict("records"),
        "hourly_pattern": hourly_pattern,
        "most_expensive_journey": {
            "route": str(most_expensive["Journey"]),
            "date": most_expensive["Date"].strftime("%Y-%m-%d"),
            "cost": round(float(most_expensive["Charge_Abs"]), 2),
        },
        "busiest_day": {
            "date": busiest_day["date"].strftime("%Y-%m-%d"),
            "journey_count": int(busiest_day["count"]),
        },
        "top_lines": top_lines,
        "confidence_breakdown": confidence_breakdown,
        "line_inference_note": "Line data is inferred probabilistically due to limitations in available journey history.",
    }


@app.get("/")
def root():
    return {"status": "ok", "message": "TFL Wrapped API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV file")

    try:
        file_path = CSV_PATH
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        try:
            df = load_and_process_data(file_path)
            if df.empty:
                raise HTTPException(
                    status_code=400, detail="CSV file appears to be empty"
                )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid CSV format: {str(e)}")

        return {
            "status": "success",
            "message": "CSV file uploaded and processed successfully",
            "filename": file.filename,
            "journey_count": len(df),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


@app.get("/wrapped")
def get_wrapped():
    # Check if CSV file exists
    if not os.path.exists(CSV_PATH):
        raise HTTPException(status_code=404, detail="No CSV file has been uploaded yet")

    try:
        df = load_and_process_data()
        if df.empty:
            raise HTTPException(status_code=404, detail="No journey data available")
        metrics = compute_wrapped_metrics(df)
        return metrics
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing journey data: {str(e)}"
        )
