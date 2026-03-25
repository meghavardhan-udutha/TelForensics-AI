# TelForensics AI — Setup Guide

## Quick Start

### 1. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 2. Start the FastAPI backend
```bash
uvicorn main:app --reload --port 8000
```
Backend runs at: http://localhost:8000
API docs at:     http://localhost:8000/docs

### 3. Open the React frontend
The TelForensics_AI.jsx file works as a Claude Artifact (demo mode with built-in data).
For full deployment with your backend, replace the fetch calls with http://localhost:8000.

## Files
- `main.py`          — FastAPI backend (all API endpoints)
- `analyzer.py`      — CDR analysis engine (NLP, scoring, graph)
- `generate_sample.py` — Generate test CDR dataset
- `sample_cdr.xlsx`  — 710 sample CDR records
- `TelForensics_AI.jsx` — Full React frontend

## Sample Suspicious Numbers (in dataset)
- +91-98765-43210 → Score: 62 (120 night calls, 26 international)
- +91-11223-34455 → Score: 61 (80 night calls, 18 international)
