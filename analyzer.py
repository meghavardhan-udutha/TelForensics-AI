"""
TelForensics AI — CDR Analysis Engine v2.0
"""
import pandas as pd
import numpy as np
from collections import defaultdict
import re, json
from datetime import datetime

# ── Global state ──────────────────────────────────────────────────────────────
_df = None
_col = {}          # column map: 'caller','called','dt','dur','type'
_scores = {}       # cache: number -> score dict
_all_nums = set()

# ── Column detection ──────────────────────────────────────────────────────────
_ALIASES = {
    "caller": ["caller_number","caller","calling_number","from","a_party","a-party","source","msisdn_a"],
    "called": ["receiver_number","called_number","receiver","called","dialed_number","to","b_party","b-party","destination","msisdn_b"],
    "dt":     ["call_datetime","datetime","call_date","date_time","timestamp","date","start_time","call_time","datetime_of_call"],
    "dur":    ["duration_seconds","duration","call_duration","dur","seconds","duration_sec"],
    "type":   ["call_type","type","direction","call_direction"],
    "tower":  ["tower_location","location","cell_location","tower","city","tower_id"],
}

def _find(cols, key):
    lc = {c.lower().strip().replace(" ","_"): c for c in cols}
    for alias in _ALIASES.get(key, []):
        if alias in lc: return lc[alias]
    return None

# ── Load ──────────────────────────────────────────────────────────────────────
def load_data(filepath: str) -> dict:
    global _df, _col, _scores, _all_nums
    try:
        if filepath.lower().endswith(".csv"):
            df = pd.read_csv(filepath)
        else:
            df = pd.read_excel(filepath)
        df.columns = [str(c).strip() for c in df.columns]

        col = {}
        for key in _ALIASES:
            col[key] = _find(df.columns, key)

        if not col["caller"] or not col["called"]:
            return {"success": False, "error": f"Cannot find caller/receiver columns. Found: {list(df.columns)}"}

        # Normalise datetime
        if col["dt"]:
            try:
                df[col["dt"]] = pd.to_datetime(df[col["dt"]], format="mixed", dayfirst=False)
            except Exception:
                try:
                    df[col["dt"]] = pd.to_datetime(df[col["dt"]])
                except Exception:
                    col["dt"] = None

        # Normalise duration
        if col["dur"]:
            df[col["dur"]] = pd.to_numeric(df[col["dur"]], errors="coerce").fillna(0)

        df[col["caller"]] = df[col["caller"]].astype(str).str.strip()
        df[col["called"]] = df[col["called"]].astype(str).str.strip()

        _df = df
        _col = col
        _scores = {}
        _all_nums = set(df[col["caller"]]) | set(df[col["called"]])

        date_range = {}
        if col["dt"]:
            date_range = {
                "start": str(df[col["dt"]].min())[:10],
                "end":   str(df[col["dt"]].max())[:10],
            }

        return {
            "success": True,
            "total_records": len(df),
            "unique_numbers": len(_all_nums),
            "date_range": date_range,
            "columns": list(df.columns),
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# ── Summary ───────────────────────────────────────────────────────────────────
def get_summary_stats() -> dict:
    if _df is None: return {}
    dur_total = _df[_col["dur"]].sum() if _col["dur"] else 0
    dur_avg   = _df[_col["dur"]].mean() if _col["dur"] else 0
    days = 0
    if _col["dt"]:
        days = (_df[_col["dt"]].max() - _df[_col["dt"]].min()).days

    type_counts = {}
    if _col["type"]:
        type_counts = _df[_col["type"]].value_counts().to_dict()

    return {
        "total_calls": len(_df),
        "unique_numbers": len(_all_nums),
        "total_duration_hours": round(dur_total / 3600, 1),
        "avg_duration_seconds": round(dur_avg, 1),
        "date_range": f"{str(_df[_col['dt']].min())[:10]} to {str(_df[_col['dt']].max())[:10]}" if _col["dt"] else "N/A",
        "date_range_days": days,
        "call_types": type_counts,
    }

# ── Top callers ───────────────────────────────────────────────────────────────
def get_top_callers(n=10) -> list:
    if _df is None: return []
    counts = _df[_col["caller"]].value_counts().head(n)
    result = []
    for num, cnt in counts.items():
        sc = _get_score(num)
        result.append({
            "number": num,
            "outgoing_calls": int(cnt),
            "suspicion_score": sc["total_score"],
            "risk_level": _risk_label(sc["total_score"]),
        })
    return result

# ── Frequent pairs ────────────────────────────────────────────────────────────
def get_frequent_pairs(n=10) -> list:
    if _df is None: return []
    pairs = _df.groupby([_col["caller"], _col["called"]]).size().reset_index(name="call_count")
    pairs = pairs.sort_values("call_count", ascending=False).head(n)
    return pairs.rename(columns={_col["caller"]:"caller_number", _col["called"]:"receiver_number"}).to_dict("records")

# ── Hourly distribution ───────────────────────────────────────────────────────
def get_hourly_distribution() -> dict:
    if _df is None or not _col["dt"]: return {}
    h = _df[_col["dt"]].dt.hour.value_counts().sort_index()
    return {str(k): int(v) for k, v in h.items()}

# ── Daily trend ───────────────────────────────────────────────────────────────
def get_daily_trend() -> list:
    if _df is None or not _col["dt"]: return []
    daily = _df.groupby(_df[_col["dt"]].dt.date).size().reset_index()
    daily.columns = ["date", "calls"]
    daily["date"] = daily["date"].astype(str)
    return daily.to_dict("records")

# ── Number search ─────────────────────────────────────────────────────────────
def search_number(number: str) -> dict:
    if _df is None: return {}
    out = _df[_df[_col["caller"]] == number]
    inc = _df[_df[_col["called"]] == number]
    all_c = pd.concat([out, inc])
    sc = _get_score(number)
    return {
        "number": number,
        "total_calls": len(all_c),
        "outgoing_calls": len(out),
        "incoming_calls": len(inc),
        "unique_contacts": len(set(out[_col["called"]]) | set(inc[_col["caller"]])),
        "total_duration_minutes": round(all_c[_col["dur"]].sum() / 60, 1) if _col["dur"] else 0,
        "avg_duration_seconds": round(all_c[_col["dur"]].mean(), 1) if _col["dur"] else 0,
        "top_outgoing_contacts": out[_col["called"]].value_counts().head(5).to_dict(),
        "top_incoming_contacts": inc[_col["caller"]].value_counts().head(5).to_dict(),
        "suspicion_score": sc,
        "first_seen": str(all_c[_col["dt"]].min())[:19] if _col["dt"] else "N/A",
        "last_seen":  str(all_c[_col["dt"]].max())[:19] if _col["dt"] else "N/A",
    }

# ── Suspicion score ───────────────────────────────────────────────────────────
def _get_score(number: str) -> dict:
    if number in _scores: return _scores[number]
    if _df is None: return {"total_score": 0, "flags": [], "factors": {}}

    out = _df[_df[_col["caller"]] == number]
    inc = _df[_df[_col["called"]] == number]
    all_c = pd.concat([out, inc])

    if len(all_c) == 0:
        return {"total_score": 0, "risk_level": "LOW", "flags": [], "factors": {}}

    factors = {}
    flags   = []

    # 1. Night calls (1–5 AM) → 25 pts
    night_score = 0
    if _col["dt"]:
        night = all_c[all_c[_col["dt"]].dt.hour.between(1, 5)]
        night_ratio = len(night) / max(len(all_c), 1)
        night_score = min(25, int(night_ratio * 100))
        if len(night) > 5:
            flags.append(f"{len(night)} calls between 1AM–5AM")
    factors["night_calls"] = {"score": night_score, "max": 25}

    # 2. Unique contacts → 20 pts
    unique = len(set(out[_col["called"]]) | set(inc[_col["caller"]]))
    contact_score = min(20, int(np.log1p(unique) * 4))
    if unique > 20: flags.append(f"{unique} unique contacts")
    factors["unique_contacts"] = {"score": contact_score, "max": 20}

    # 3. Call burst → 20 pts
    burst_score = 0
    if _col["dt"] and len(out) > 1:
        sorted_t = out[_col["dt"]].sort_values()
        diffs = sorted_t.diff().dt.total_seconds().dropna()
        rapid = int((diffs < 120).sum())
        burst_score = min(20, rapid * 2)
        if rapid > 5: flags.append(f"Call burst: {rapid} calls within 2-min windows")
    factors["burst"] = {"score": burst_score, "max": 20}

    # 4. International calls → 15 pts
    intl_pat = r'^\+(?!91)'
    intl_out = int(out[_col["called"]].str.match(intl_pat).sum()) if len(out) else 0
    intl_in  = int(inc[_col["caller"]].str.match(intl_pat).sum()) if len(inc) else 0
    intl = intl_out + intl_in
    intl_score = min(15, intl * 3)
    if intl > 0: flags.append(f"{intl} international calls")
    factors["international"] = {"score": intl_score, "max": 15}

    # 5. Short calls (<10s) → 10 pts
    short_score = 0
    if _col["dur"]:
        short = all_c[all_c[_col["dur"]] < 10]
        short_ratio = len(short) / max(len(all_c), 1)
        short_score = min(10, int(short_ratio * 30))
        if len(short) > 5: flags.append(f"{len(short)} calls under 10 seconds")
    factors["short_calls"] = {"score": short_score, "max": 10}

    # 6. Volume anomaly → 10 pts
    avg_vol = len(_df) / max(len(_all_nums), 1)
    vol_ratio = len(all_c) / max(avg_vol, 1)
    vol_score = min(10, max(0, int((vol_ratio - 1) * 3)))
    if vol_ratio > 3: flags.append(f"High call volume ({len(all_c)} calls, {round(vol_ratio,1)}x average)")
    factors["volume"] = {"score": vol_score, "max": 10}

    total = min(100, sum(f["score"] for f in factors.values()))
    result = {
        "total_score": total,
        "risk_level":  _risk_label(total),
        "factors":     factors,
        "flags":       flags,
        "summary":     f"{number} is {_risk_label(total)} RISK (Score: {total}/100). " +
                       ("; ".join(flags[:3]) if flags else "No significant anomalies detected."),
    }
    _scores[number] = result
    return result

def _risk_label(score):
    return "HIGH" if score >= 60 else "MEDIUM" if score >= 30 else "LOW"

def get_all_suspicion_scores(limit=50) -> list:
    if _df is None: return []
    result = []
    for num in _all_nums:
        sc = _get_score(num)
        result.append({"number": num, "score": sc["total_score"], "risk_level": sc["risk_level"], "flags": sc["flags"]})
    return sorted(result, key=lambda x: -x["score"])[:limit]

# ── Network graph ─────────────────────────────────────────────────────────────
def get_network_graph(min_calls=2, max_nodes=50) -> dict:
    if _df is None: return {"nodes": [], "edges": []}
    edges_df = _df.groupby([_col["caller"], _col["called"]]).size().reset_index(name="weight")
    edges_df = edges_df[edges_df["weight"] >= min_calls]

    active = set(edges_df[_col["caller"]]) | set(edges_df[_col["called"]])
    if len(active) > max_nodes:
        vc = (_df[_col["caller"]].value_counts() + _df[_col["called"]].value_counts()).nlargest(max_nodes)
        active = set(vc.index)
        edges_df = edges_df[edges_df[_col["caller"]].isin(active) & edges_df[_col["called"]].isin(active)]

    nodes = []
    for num in active:
        sc = _get_score(num)
        total = int(len(_df[_df[_col["caller"]]==num]) + len(_df[_df[_col["called"]]==num]))
        nodes.append({
            "id": num, "suspicion_score": sc["total_score"],
            "risk_level": sc["risk_level"], "total_calls": total,
        })

    edges = [{"source": r[_col["caller"]], "target": r[_col["called"]], "weight": int(r["weight"])}
             for _, r in edges_df.iterrows()]
    return {"nodes": nodes, "edges": edges}

# ── NLP query engine ──────────────────────────────────────────────────────────
def process_query(query: str) -> dict:
    if _df is None:
        return {"type": "error", "message": "No data loaded. Please upload a CDR file first."}

    q = query.lower().strip()

    # extract phone number from query
    phone_raw = re.findall(r'[\+\d][\d\s\-]{7,}[\d]', query)
    target = None
    if phone_raw:
        raw = phone_raw[0].strip()
        matches = [n for n in _all_nums if raw.replace(" ","").replace("-","") in n.replace(" ","").replace("-","")]
        target = matches[0] if matches else None

    if re.search(r'top.{0,10}caller|most.{0,10}call|frequent.{0,10}caller|who called most|highest.{0,8}call', q):
        data = get_top_callers(10)
        return {"type": "top_callers", "data": data, "message": f"Top {len(data)} callers by outgoing call volume:"}

    if re.search(r'suspici|high.?risk|suspect|threat|danger|score|flagged', q):
        if target:
            sc = _get_score(target)
            return {"type": "suspicion_score", "number": target, "data": sc, "message": sc["summary"]}
        data = get_all_suspicion_scores()
        high = [d for d in data if d["risk_level"]=="HIGH"]
        return {"type": "suspicious_numbers", "data": data[:15],
                "message": f"Found {len(high)} HIGH-RISK numbers. Ranked by suspicion score:"}

    if re.search(r'night|late.?night|midnight|2am|3am|4am|1am|after 11|after midnight|late hour', q):
        hourly = get_hourly_distribution()
        night  = {k:v for k,v in hourly.items() if int(k)<=5 or int(k)>=22}
        total  = sum(night.values())
        return {"type": "night_calls", "data": night, "total_night": total,
                "message": f"{total} calls detected between 10PM–5AM (suspicious hours):"}

    if re.search(r'network|graph|connect|link|map|who.?know|relat|cluster', q):
        data = get_network_graph()
        return {"type": "network_graph", "data": data,
                "message": f"Communication network: {len(data['nodes'])} entities, {len(data['edges'])} connections"}

    if re.search(r'hour|peak.?hour|time.?pattern|distribut|busiest', q):
        data = get_hourly_distribution()
        peak = max(data, key=data.get) if data else "N/A"
        return {"type": "hourly", "data": data,
                "message": f"Hourly distribution. Peak activity at {peak}:00 hrs ({data.get(peak,0)} calls):"}

    if re.search(r'summary|overview|stats|total|how many|dataset|count', q):
        data = get_summary_stats()
        return {"type": "summary", "data": data, "message": "Dataset overview:"}

    if re.search(r'trend|daily|per day|over time|timeline|day.?by.?day', q):
        data = get_daily_trend()
        return {"type": "daily_trend", "data": data, "message": "Daily call volume trend:"}

    if re.search(r'pair|between|frequent.?pair|who.?talk|common', q):
        data = get_frequent_pairs(10)
        return {"type": "frequent_pairs", "data": data, "message": "Most frequent communication pairs:"}

    if re.search(r'internation|foreign|overseas|\+44|\+1\b|\+86|\+971|abroad', q):
        intl = _df[_df[_col["called"]].str.match(r'^\+(?!91)',na=False) |
                   _df[_col["caller"]].str.match(r'^\+(?!91)',na=False)]
        callers = intl[_col["caller"]].value_counts().head(8).to_dict()
        return {"type": "international", "data": {"total": len(intl), "top_callers": callers},
                "message": f"Found {len(intl)} international calls:"}

    if target:
        data = search_number(target)
        return {"type": "number_detail", "number": target, "data": data,
                "message": f"Full analysis for {target}:"}

    # default
    data = get_summary_stats()
    return {"type": "summary", "data": data,
            "message": "Here's the dataset overview. Try: 'Show top callers', 'Who is suspicious?', 'Show night calls', 'Network graph'"}