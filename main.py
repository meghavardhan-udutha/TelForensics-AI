"""
TelForensics AI — FastAPI Backend v2.0
Run: uvicorn main:app --reload --port 8000
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import tempfile, os
import analyzer as az

app = FastAPI(title="TelForensics AI API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

class NumberRequest(BaseModel):
    number: str

@app.get("/")
def root():
    return FileResponse("index.html")

@app.get("/health")
def health():
    loaded = az._df is not None
    return {
        "status": "healthy",
        "data_loaded": loaded,
        "records": len(az._df) if loaded else 0,
    }

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    fname = file.filename.lower()
    if not fname.endswith((".xlsx", ".xls", ".csv")):
        raise HTTPException(400, "Only .xlsx, .xls, .csv files accepted")
    suffix = ".csv" if fname.endswith(".csv") else ".xlsx"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    try:
        result = az.load_data(tmp_path)
    finally:
        try: os.unlink(tmp_path)
        except: pass
    if not result.get("success"):
        raise HTTPException(400, result.get("error", "Load failed"))
    return result

@app.post("/chat")
def chat(req: ChatRequest):
    return az.process_query(req.message)

@app.get("/summary")
def summary():
    if az._df is None: raise HTTPException(400, "No data loaded")
    return az.get_summary_stats()

@app.get("/top-callers")
def top_callers(n: int = 10):
    if az._df is None: raise HTTPException(400, "No data loaded")
    return az.get_top_callers(n)

@app.get("/suspicious")
def suspicious(limit: int = 25):
    if az._df is None: raise HTTPException(400, "No data loaded")
    return az.get_all_suspicion_scores(limit)

@app.get("/hourly")
def hourly():
    if az._df is None: raise HTTPException(400, "No data loaded")
    return az.get_hourly_distribution()

@app.get("/daily-trend")
def daily_trend():
    if az._df is None: raise HTTPException(400, "No data loaded")
    return az.get_daily_trend()

@app.get("/frequent-pairs")
def frequent_pairs(n: int = 10):
    if az._df is None: raise HTTPException(400, "No data loaded")
    return az.get_frequent_pairs(n)

@app.get("/network-graph")
def network_graph(min_calls: int = 2):
    if az._df is None: raise HTTPException(400, "No data loaded")
    return az.get_network_graph(min_calls=min_calls)

@app.post("/number-detail")
def number_detail(req: NumberRequest):
    if az._df is None: raise HTTPException(400, "No data loaded")
    return az.search_number(req.number)

@app.post("/score")
def score(req: NumberRequest):
    if az._df is None: raise HTTPException(400, "No data loaded")
    return az._get_score(req.number)
