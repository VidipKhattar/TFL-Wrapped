# TfL Wrapped

TfL Wrapped is a full-stack web application that visualises personal Transport for London (TfL) journey data in a “wrapped” style experience popularised by Spotify.
Thought it would be a fun project since I am a brand new Londoner who lives in zone 4 and works in zone 1 five days a week (Amounts to £12.80 a day). So I built this to check how much TFL is robbing me in general.
They don't make it easy! I saw some pretty terrible public APIs on their end. 

Users upload their TfL journey history CSV and receive interactive insights about their travel patterns, including stations used, inferred routes, and usage trends.

Live deployment: https://tfl-wrapped.vercel.app/

## Tech Stack

### Frontend
- Next.js (React)
- Tailwind CSS
- Framer Motion
- Deployed on Vercel

### Backend
- FastAPI
- Pandas
- Python
- Deployed on Railway

## Architecture

The repository is split into two services:

- `frontend/` – Next.js client application
- `backend/` – FastAPI service for CSV processing and data analysis

The frontend communicates with the backend via a REST API.

## Data Processing

Journey history is parsed from a user-uploaded CSV file. Where route or line information is not explicitly available, the backend infers the most likely TfL line based on station pairs and known network connectivity.

## Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
