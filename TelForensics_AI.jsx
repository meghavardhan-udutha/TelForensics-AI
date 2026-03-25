import { useState, useEffect, useRef, useCallback } from "react";

// ─── EMBEDDED SAMPLE DATA (pre-computed from 710 CDR records) ───────────────
const SAMPLE_DATA = {"summary":{"total_calls":710,"unique_numbers":22,"total_hours":82.9,"avg_duration":420.5,"date_range":"2024-10-01 to 2024-12-29","call_types":{"Voice":577,"SMS":133}},"top_callers":[{"number":"+91-98765-43210","calls":153,"score":62,"flags":["120 calls between 1AM-5AM","21 unique contacts","26 international calls"]},{"number":"+91-11223-34455","calls":99,"score":61,"flags":["80 calls between 1AM-5AM","21 unique contacts","18 international calls"]},{"number":"+91-55667-78899","calls":86,"score":21,"flags":[]},{"number":"+91-66345-67890","calls":33,"score":32,"flags":["14 calls between 1AM-5AM"]},{"number":"+91-70345-67890","calls":31,"score":29,"flags":["11 calls between 1AM-5AM"]},{"number":"+91-20890-12345","calls":30,"score":32,"flags":["14 calls between 1AM-5AM"]},{"number":"+91-60456-78901","calls":29,"score":32,"flags":["12 calls between 1AM-5AM"]},{"number":"+91-30789-01234","calls":27,"score":33,"flags":["14 calls between 1AM-5AM"]},{"number":"+91-80234-56789","calls":25,"score":29,"flags":["10 calls between 1AM-5AM"]},{"number":"+91-99012-34567","calls":24,"score":22,"flags":[]}],"scores":{"+91-98765-43210":{"score":62,"flags":["120 calls between 1AM-5AM","21 unique contacts","26 international calls"]},"+91-11223-34455":{"score":61,"flags":["80 calls between 1AM-5AM","21 unique contacts","18 international calls"]},"+91-50567-89012":{"score":36,"flags":["13 calls between 1AM-5AM"]},"+91-10901-23456":{"score":34,"flags":["12 calls between 1AM-5AM"]},"+91-40678-90123":{"score":34,"flags":["12 calls between 1AM-5AM"]},"+91-30789-01234":{"score":33,"flags":["14 calls between 1AM-5AM"]},"+86-138-0013-8000":{"score":32,"flags":["8 calls between 1AM-5AM"]},"+91-66345-67890":{"score":32,"flags":["14 calls between 1AM-5AM"]},"+91-77234-56789":{"score":32,"flags":["12 calls between 1AM-5AM"]},"+91-60456-78901":{"score":32,"flags":["12 calls between 1AM-5AM"]},"+44-7911-123456":{"score":32,"flags":["8 calls between 1AM-5AM"]},"+91-20890-12345":{"score":32,"flags":["14 calls between 1AM-5AM"]},"+91-44567-89012":{"score":32,"flags":["11 calls between 1AM-5AM"]},"+91-55456-78901":{"score":31,"flags":["9 calls between 1AM-5AM"]},"+91-70345-67890":{"score":29,"flags":["11 calls between 1AM-5AM"]},"+91-80234-56789":{"score":29,"flags":["10 calls between 1AM-5AM"]},"+1-555-0101":{"score":29,"flags":["9 calls between 1AM-5AM"]},"+971-50-123-4567":{"score":29,"flags":["12 calls between 1AM-5AM"]},"+91-88123-45678":{"score":27,"flags":["9 calls between 1AM-5AM"]},"+91-90123-45678":{"score":23,"flags":[]}},"hourly":{"1":17,"2":58,"3":50,"4":50,"5":25,"8":29,"9":38,"10":22,"11":29,"12":25,"13":31,"14":59,"15":48,"16":33,"17":26,"18":30,"19":26,"20":22,"21":22,"22":55,"23":15},"daily":[{"date":"2024-10-01","calls":7},{"date":"2024-10-04","calls":10},{"date":"2024-10-05","calls":10},{"date":"2024-10-06","calls":12},{"date":"2024-10-09","calls":7},{"date":"2024-10-11","calls":9},{"date":"2024-10-14","calls":10},{"date":"2024-10-15","calls":10},{"date":"2024-10-18","calls":12},{"date":"2024-10-20","calls":9},{"date":"2024-10-23","calls":12},{"date":"2024-10-24","calls":11},{"date":"2024-10-26","calls":9},{"date":"2024-11-01","calls":10},{"date":"2024-11-03","calls":9},{"date":"2024-11-05","calls":10},{"date":"2024-11-07","calls":10},{"date":"2024-11-09","calls":14},{"date":"2024-11-10","calls":11},{"date":"2024-11-19","calls":10},{"date":"2024-11-20","calls":11},{"date":"2024-11-21","calls":12},{"date":"2024-11-24","calls":10},{"date":"2024-11-25","calls":11},{"date":"2024-11-26","calls":12},{"date":"2024-11-28","calls":13},{"date":"2024-11-30","calls":10},{"date":"2024-12-04","calls":10},{"date":"2024-12-06","calls":9},{"date":"2024-12-08","calls":15},{"date":"2024-12-11","calls":10},{"date":"2024-12-13","calls":14},{"date":"2024-12-15","calls":10},{"date":"2024-12-18","calls":10},{"date":"2024-12-22","calls":12},{"date":"2024-12-23","calls":9},{"date":"2024-12-24","calls":12},{"date":"2024-12-27","calls":10},{"date":"2024-12-29","calls":7}],"pairs":[{"caller_number":"+91-98765-43210","receiver_number":"+91-70345-67890","count":13},{"caller_number":"+91-98765-43210","receiver_number":"+91-30789-01234","count":12},{"caller_number":"+91-98765-43210","receiver_number":"+91-44567-89012","count":11},{"caller_number":"+91-55667-78899","receiver_number":"+91-90123-45678","count":11},{"caller_number":"+91-98765-43210","receiver_number":"+91-77234-56789","count":10},{"caller_number":"+91-98765-43210","receiver_number":"+91-60456-78901","count":10},{"caller_number":"+91-98765-43210","receiver_number":"+91-20890-12345","count":9},{"caller_number":"+91-98765-43210","receiver_number":"+91-80234-56789","count":9},{"caller_number":"+91-11223-34455","receiver_number":"+91-50567-89012","count":9},{"caller_number":"+91-55667-78899","receiver_number":"+91-77234-56789","count":9}],"network":{"nodes":[{"id":"+86-138-0013-8000","score":32,"calls":9},{"id":"+91-70345-67890","score":29,"calls":76},{"id":"+91-66345-67890","score":32,"calls":75},{"id":"+91-90123-45678","score":23,"calls":47},{"id":"+91-55667-78899","score":21,"calls":109},{"id":"+91-80234-56789","score":29,"calls":62},{"id":"+91-10901-23456","score":34,"calls":55},{"id":"+91-77234-56789","score":32,"calls":62},{"id":"+91-11223-34455","score":61,"calls":114},{"id":"+91-60456-78901","score":32,"calls":65},{"id":"+91-30789-01234","score":33,"calls":67},{"id":"+1-555-0101","score":29,"calls":12},{"id":"+91-40678-90123","score":34,"calls":56},{"id":"+91-88123-45678","score":27,"calls":69},{"id":"+91-50567-89012","score":36,"calls":58},{"id":"+91-99012-34567","score":22,"calls":59},{"id":"+971-50-123-4567","score":29,"calls":14},{"id":"+91-55456-78901","score":31,"calls":50},{"id":"+44-7911-123456","score":32,"calls":9},{"id":"+91-20890-12345","score":32,"calls":75},{"id":"+91-44567-89012","score":32,"calls":56},{"id":"+91-98765-43210","score":62,"calls":221}],"edges":[{"source":"+1-555-0101","target":"+91-98765-43210","weight":3},{"source":"+91-10901-23456","target":"+91-70345-67890","weight":3},{"source":"+91-10901-23456","target":"+91-88123-45678","weight":3},{"source":"+91-10901-23456","target":"+91-98765-43210","weight":3},{"source":"+91-11223-34455","target":"+1-555-0101","weight":6},{"source":"+91-11223-34455","target":"+44-7911-123456","weight":3},{"source":"+91-11223-34455","target":"+86-138-0013-8000","weight":5},{"source":"+91-11223-34455","target":"+91-10901-23456","weight":7},{"source":"+91-11223-34455","target":"+91-20890-12345","weight":8},{"source":"+91-11223-34455","target":"+91-30789-01234","weight":6},{"source":"+91-11223-34455","target":"+91-40678-90123","weight":6},{"source":"+91-11223-34455","target":"+91-44567-89012","weight":4},{"source":"+91-11223-34455","target":"+91-50567-89012","weight":9},{"source":"+91-11223-34455","target":"+91-55456-78901","weight":5},{"source":"+91-11223-34455","target":"+91-60456-78901","weight":6},{"source":"+91-11223-34455","target":"+91-66345-67890","weight":8},{"source":"+91-11223-34455","target":"+91-70345-67890","weight":3},{"source":"+91-11223-34455","target":"+91-77234-56789","weight":3},{"source":"+91-11223-34455","target":"+91-80234-56789","weight":6},{"source":"+91-11223-34455","target":"+91-88123-45678","weight":5},{"source":"+91-11223-34455","target":"+971-50-123-4567","weight":4},{"source":"+91-20890-12345","target":"+91-40678-90123","weight":3},{"source":"+91-20890-12345","target":"+91-80234-56789","weight":3},{"source":"+91-20890-12345","target":"+91-98765-43210","weight":7},{"source":"+91-20890-12345","target":"+91-99012-34567","weight":3},{"source":"+91-30789-01234","target":"+91-66345-67890","weight":3},{"source":"+91-30789-01234","target":"+91-88123-45678","weight":3},{"source":"+91-30789-01234","target":"+91-98765-43210","weight":6},{"source":"+91-30789-01234","target":"+91-99012-34567","weight":4},{"source":"+91-40678-90123","target":"+91-44567-89012","weight":3},{"source":"+91-40678-90123","target":"+91-98765-43210","weight":4},{"source":"+91-44567-89012","target":"+91-10901-23456","weight":3},{"source":"+91-44567-89012","target":"+91-98765-43210","weight":3},{"source":"+91-50567-89012","target":"+91-88123-45678","weight":3},{"source":"+91-50567-89012","target":"+91-98765-43210","weight":3},{"source":"+91-55456-78901","target":"+91-40678-90123","weight":3},{"source":"+91-55456-78901","target":"+91-66345-67890","weight":3},{"source":"+91-55667-78899","target":"+91-10901-23456","weight":6},{"source":"+91-55667-78899","target":"+91-20890-12345","weight":5},{"source":"+91-55667-78899","target":"+91-30789-01234","weight":7},{"source":"+91-55667-78899","target":"+91-40678-90123","weight":5},{"source":"+91-55667-78899","target":"+91-44567-89012","weight":5},{"source":"+91-55667-78899","target":"+91-50567-89012","weight":4},{"source":"+91-55667-78899","target":"+91-55456-78901","weight":3},{"source":"+91-55667-78899","target":"+91-60456-78901","weight":5},{"source":"+91-55667-78899","target":"+91-66345-67890","weight":3},{"source":"+91-55667-78899","target":"+91-70345-67890","weight":5},{"source":"+91-55667-78899","target":"+91-77234-56789","weight":9},{"source":"+91-55667-78899","target":"+91-80234-56789","weight":4},{"source":"+91-55667-78899","target":"+91-88123-45678","weight":6},{"source":"+91-55667-78899","target":"+91-90123-45678","weight":11},{"source":"+91-55667-78899","target":"+91-99012-34567","weight":6},{"source":"+91-60456-78901","target":"+91-30789-01234","weight":3},{"source":"+91-60456-78901","target":"+91-70345-67890","weight":3},{"source":"+91-60456-78901","target":"+91-80234-56789","weight":4},{"source":"+91-60456-78901","target":"+91-98765-43210","weight":5},{"source":"+91-66345-67890","target":"+91-50567-89012","weight":4},{"source":"+91-66345-67890","target":"+91-55456-78901","weight":4},{"source":"+91-66345-67890","target":"+91-77234-56789","weight":5},{"source":"+91-66345-67890","target":"+91-88123-45678","weight":5},{"source":"+91-66345-67890","target":"+91-98765-43210","weight":5},{"source":"+91-70345-67890","target":"+91-50567-89012","weight":3},{"source":"+91-70345-67890","target":"+91-55667-78899","weight":5},{"source":"+91-70345-67890","target":"+91-80234-56789","weight":3},{"source":"+91-70345-67890","target":"+91-98765-43210","weight":3},{"source":"+91-77234-56789","target":"+91-20890-12345","weight":3},{"source":"+91-77234-56789","target":"+91-40678-90123","weight":3},{"source":"+91-77234-56789","target":"+91-98765-43210","weight":4},{"source":"+91-80234-56789","target":"+91-20890-12345","weight":5},{"source":"+91-80234-56789","target":"+91-40678-90123","weight":4},{"source":"+91-80234-56789","target":"+91-66345-67890","weight":3},{"source":"+91-88123-45678","target":"+91-20890-12345","weight":3},{"source":"+91-88123-45678","target":"+91-60456-78901","weight":4},{"source":"+91-88123-45678","target":"+91-70345-67890","weight":3},{"source":"+91-88123-45678","target":"+91-98765-43210","weight":6},{"source":"+91-90123-45678","target":"+91-20890-12345","weight":3},{"source":"+91-90123-45678","target":"+91-70345-67890","weight":3},{"source":"+91-90123-45678","target":"+91-98765-43210","weight":3},{"source":"+91-98765-43210","target":"+1-555-0101","weight":3},{"source":"+91-98765-43210","target":"+44-7911-123456","weight":5},{"source":"+91-98765-43210","target":"+86-138-0013-8000","weight":3},{"source":"+91-98765-43210","target":"+91-10901-23456","weight":8},{"source":"+91-98765-43210","target":"+91-20890-12345","weight":9},{"source":"+91-98765-43210","target":"+91-30789-01234","weight":12},{"source":"+91-98765-43210","target":"+91-40678-90123","weight":8},{"source":"+91-98765-43210","target":"+91-44567-89012","weight":11},{"source":"+91-98765-43210","target":"+91-50567-89012","weight":7},{"source":"+91-98765-43210","target":"+91-55456-78901","weight":6},{"source":"+91-98765-43210","target":"+91-60456-78901","weight":10},{"source":"+91-98765-43210","target":"+91-66345-67890","weight":8},{"source":"+91-98765-43210","target":"+91-70345-67890","weight":13},{"source":"+91-98765-43210","target":"+91-77234-56789","weight":10},{"source":"+91-98765-43210","target":"+91-80234-56789","weight":9},{"source":"+91-98765-43210","target":"+91-88123-45678","weight":8},{"source":"+91-98765-43210","target":"+91-90123-45678","weight":4},{"source":"+91-98765-43210","target":"+91-99012-34567","weight":7},{"source":"+91-98765-43210","target":"+971-50-123-4567","weight":8},{"source":"+91-99012-34567","target":"+91-66345-67890","weight":4},{"source":"+91-99012-34567","target":"+91-98765-43210","weight":4}]}};

// ─── STYLES ─────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Syne', sans-serif; background: #050b14; color: #e2eaf5; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0a1525; }
  ::-webkit-scrollbar-thumb { background: #00d4ff44; border-radius: 2px; }
  .app { display: flex; height: 100vh; overflow: hidden; }
  .sidebar { width: 220px; min-width: 220px; background: #060d1a; border-right: 1px solid #0d2035; display: flex; flex-direction: column; padding: 0; }
  .sidebar-logo { padding: 20px 16px 16px; border-bottom: 1px solid #0d2035; }
  .logo-badge { display: flex; align-items: center; gap: 10px; }
  .logo-icon { width: 34px; height: 34px; background: linear-gradient(135deg, #00d4ff22, #7b2fbe22); border: 1px solid #00d4ff55; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
  .logo-text { font-size: 13px; font-weight: 800; letter-spacing: 1px; color: #00d4ff; line-height: 1.2; }
  .logo-sub { font-size: 9px; color: #4a7a9b; letter-spacing: 2px; font-family: 'Space Mono', monospace; }
  .nav { padding: 12px 8px; flex: 1; display: flex; flex-direction: column; gap: 2px; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; color: #4a7a9b; transition: all 0.2s; letter-spacing: 0.5px; border: 1px solid transparent; }
  .nav-item:hover { background: #0d2035; color: #a8d4f5; }
  .nav-item.active { background: #00d4ff12; color: #00d4ff; border-color: #00d4ff22; }
  .nav-icon { font-size: 15px; width: 18px; text-align: center; }
  .sidebar-footer { padding: 12px 16px; border-top: 1px solid #0d2035; }
  .status-dot { display: flex; align-items: center; gap: 8px; font-size: 10px; color: #4a7a9b; font-family: 'Space Mono', monospace; }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: #00c896; box-shadow: 0 0 6px #00c89688; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .topbar { padding: 14px 24px; background: #060d1a; border-bottom: 1px solid #0d2035; display: flex; align-items: center; justify-content: space-between; }
  .page-title { font-size: 18px; font-weight: 800; color: #e2eaf5; }
  .page-sub { font-size: 11px; color: #4a7a9b; margin-top: 2px; font-family: 'Space Mono', monospace; }
  .topbar-actions { display: flex; gap: 10px; align-items: center; }
  .upload-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #00d4ff15; border: 1px solid #00d4ff44; border-radius: 8px; color: #00d4ff; font-size: 11px; font-weight: 700; cursor: pointer; letter-spacing: 0.5px; transition: all 0.2s; font-family: 'Syne', sans-serif; }
  .upload-btn:hover { background: #00d4ff25; border-color: #00d4ff88; }
  .content { flex: 1; overflow-y: auto; padding: 20px 24px; }

  /* DASHBOARD */
  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
  .stat-card { background: #060d1a; border: 1px solid #0d2035; border-radius: 12px; padding: 16px; position: relative; overflow: hidden; }
  .stat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background: var(--accent); }
  .stat-label { font-size: 10px; color: #4a7a9b; letter-spacing: 1.5px; font-family: 'Space Mono', monospace; margin-bottom: 8px; }
  .stat-value { font-size: 28px; font-weight: 800; color: var(--accent); font-family: 'Space Mono', monospace; line-height: 1; }
  .stat-sub { font-size: 10px; color: #4a7a9b; margin-top: 4px; }
  .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .card { background: #060d1a; border: 1px solid #0d2035; border-radius: 12px; padding: 18px; }
  .card-title { font-size: 12px; font-weight: 700; color: #8aa8c4; letter-spacing: 1px; margin-bottom: 14px; font-family: 'Space Mono', monospace; }
  .full-width { grid-column: 1 / -1; }

  /* CHARTS */
  .bar-chart { display: flex; align-items: flex-end; gap: 3px; height: 100px; }
  .bar-col { display: flex; flex-direction: column; align-items: center; flex: 1; gap: 4px; }
  .bar { width: 100%; border-radius: 3px 3px 0 0; min-height: 2px; transition: all 0.3s; cursor: pointer; }
  .bar:hover { opacity: 0.8; filter: brightness(1.2); }
  .bar-label { font-size: 8px; color: #4a7a9b; font-family: 'Space Mono', monospace; }
  .line-chart { position: relative; height: 80px; }
  .line-chart svg { width: 100%; height: 100%; }

  /* TABLES */
  .table { width: 100%; border-collapse: collapse; }
  .table th { text-align: left; font-size: 10px; color: #4a7a9b; padding: 6px 8px; border-bottom: 1px solid #0d2035; font-family: 'Space Mono', monospace; letter-spacing: 0.5px; }
  .table td { padding: 8px 8px; font-size: 11px; border-bottom: 1px solid #0a1525; }
  .table tr:hover td { background: #0a1525; }
  .badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 4px; font-size: 9px; font-weight: 700; letter-spacing: 0.5px; font-family: 'Space Mono', monospace; }
  .badge-high { background: #ff4b4b18; color: #ff4b4b; border: 1px solid #ff4b4b44; }
  .badge-medium { background: #ffb80018; color: #ffb800; border: 1px solid #ffb80044; }
  .badge-low { background: #00c89618; color: #00c896; border: 1px solid #00c89644; }

  /* SCORE BAR */
  .score-bar-wrap { display: flex; align-items: center; gap: 8px; }
  .score-bar-bg { flex: 1; height: 5px; background: #0d2035; border-radius: 3px; overflow: hidden; }
  .score-bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s; }
  .score-num { font-size: 11px; font-weight: 700; font-family: 'Space Mono', monospace; width: 24px; text-align: right; }

  /* NETWORK GRAPH */
  .graph-container { position: relative; background: #040b14; border-radius: 8px; overflow: hidden; }
  .graph-svg { width: 100%; }
  .node-label { font-size: 9px; fill: #a8d4f5; font-family: 'Space Mono', monospace; pointer-events: none; }
  .graph-legend { display: flex; gap: 14px; margin-top: 10px; flex-wrap: wrap; }
  .legend-item { display: flex; align-items: center; gap: 6px; font-size: 10px; color: #4a7a9b; }
  .legend-dot { width: 8px; height: 8px; border-radius: 50%; }

  /* CHAT */
  .chat-wrap { display: flex; flex-direction: column; height: 100%; }
  .chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
  .msg { display: flex; gap: 10px; max-width: 85%; }
  .msg.user { align-self: flex-end; flex-direction: row-reverse; }
  .msg-avatar { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
  .msg-avatar.bot { background: #00d4ff15; border: 1px solid #00d4ff33; }
  .msg-avatar.user { background: #7b2fbe15; border: 1px solid #7b2fbe33; }
  .msg-bubble { background: #0a1a2e; border: 1px solid #0d2035; border-radius: 12px; padding: 10px 14px; font-size: 12px; line-height: 1.6; color: #c8ddef; }
  .msg.user .msg-bubble { background: #0d1a30; border-color: #7b2fbe44; }
  .msg-result { margin-top: 10px; }
  .result-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  .result-table th { font-size: 9px; color: #4a7a9b; padding: 4px 8px; border-bottom: 1px solid #0d2035; font-family: 'Space Mono', monospace; text-align: left; }
  .result-table td { font-size: 10px; padding: 5px 8px; border-bottom: 1px solid #0a1525; color: #c8ddef; }
  .chat-input-area { padding: 14px 16px; border-top: 1px solid #0d2035; display: flex; gap: 10px; background: #060d1a; }
  .chat-input { flex: 1; background: #0a1525; border: 1px solid #0d2035; border-radius: 10px; padding: 10px 14px; color: #e2eaf5; font-size: 12px; font-family: 'Syne', sans-serif; outline: none; transition: border-color 0.2s; }
  .chat-input:focus { border-color: #00d4ff44; }
  .send-btn { width: 40px; height: 40px; background: #00d4ff20; border: 1px solid #00d4ff44; border-radius: 10px; color: #00d4ff; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .send-btn:hover { background: #00d4ff35; }
  .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .quick-queries { padding: 8px 16px; display: flex; gap: 6px; flex-wrap: wrap; background: #060d1a; border-bottom: 1px solid #0d2035; }
  .quick-btn { padding: 4px 10px; background: #0a1525; border: 1px solid #0d2035; border-radius: 20px; font-size: 10px; color: #8aa8c4; cursor: pointer; transition: all 0.2s; font-family: 'Syne', sans-serif; }
  .quick-btn:hover { border-color: #00d4ff44; color: #00d4ff; }
  .typing { display: flex; gap: 4px; align-items: center; padding: 4px 0; }
  .typing span { width: 5px; height: 5px; background: #00d4ff; border-radius: 50%; animation: bounce 1.2s infinite; }
  .typing span:nth-child(2) { animation-delay: 0.2s; }
  .typing span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }

  /* SUSPICION PAGE */
  .sus-grid { display: grid; gap: 10px; }
  .sus-card { background: #060d1a; border: 1px solid #0d2035; border-radius: 10px; padding: 14px 16px; cursor: pointer; transition: all 0.2s; }
  .sus-card:hover { border-color: #00d4ff33; }
  .sus-card.expanded { border-color: #00d4ff44; background: #071525; }
  .sus-header { display: flex; align-items: center; gap: 10px; }
  .sus-num { font-size: 13px; font-weight: 700; color: #c8ddef; font-family: 'Space Mono', monospace; flex: 1; }
  .sus-expand { color: #4a7a9b; font-size: 11px; }
  .sus-flags { margin-top: 10px; display: flex; flex-direction: column; gap: 5px; }
  .sus-flag { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #8aa8c4; padding: 4px 8px; background: #0a1525; border-radius: 4px; }
  .flag-icon { color: #ffb800; }

  /* UPLOAD ZONE */
  .upload-zone { border: 2px dashed #0d2035; border-radius: 12px; padding: 40px; text-align: center; cursor: pointer; transition: all 0.3s; }
  .upload-zone:hover, .upload-zone.drag { border-color: #00d4ff44; background: #00d4ff08; }
  .upload-icon { font-size: 40px; margin-bottom: 12px; }
  .upload-title { font-size: 15px; font-weight: 700; color: #c8ddef; margin-bottom: 6px; }
  .upload-sub { font-size: 11px; color: #4a7a9b; }
  .file-input { display: none; }
  .loaded-banner { background: #00c89615; border: 1px solid #00c89633; border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; gap: 8px; font-size: 11px; color: #00c896; margin-bottom: 14px; font-family: 'Space Mono', monospace; }

  /* MINI SPINNER */
  .spinner { width: 14px; height: 14px; border: 2px solid #00d4ff22; border-top-color: #00d4ff; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// ─── HELPERS ────────────────────────────────────────────────────────────────
const riskColor = (score) => score >= 60 ? "#ff4b4b" : score >= 30 ? "#ffb800" : "#00c896";
const riskLabel = (score) => score >= 60 ? "HIGH" : score >= 30 ? "MEDIUM" : "LOW";
const riskClass = (score) => score >= 60 ? "badge-high" : score >= 30 ? "badge-medium" : "badge-low";
const shortNum = (n) => n.slice(-10);

// ─── NLP QUERY ENGINE (client-side) ─────────────────────────────────────────
function processQuery(query, data) {
  const q = query.toLowerCase();
  if (!data) return { type: "error", message: "No data loaded. Using sample dataset." };

  const phoneMatch = query.match(/[\+\d][\d\s\-]{7,}/);
  const targetNum = phoneMatch ? data.scores && Object.keys(data.scores).find(n =>
    n.replace(/\D/g,'').includes(phoneMatch[0].replace(/\D/g,''))) : null;

  if (/top.?caller|most.?call|frequent.?caller|who called most|highest.?call/i.test(q))
    return { type: "top_callers", data: data.top_callers, message: `Top ${data.top_callers.length} callers by outgoing call frequency:` };

  if (/suspicious|high.?risk|suspect|threat|score/i.test(q)) {
    if (targetNum) {
      const s = data.scores[targetNum];
      return { type: "score_detail", number: targetNum, data: s, message: `Suspicion analysis for ${targetNum} — Score: ${s.score}/100 (${riskLabel(s.score)} RISK)` };
    }
    const sus = Object.entries(data.scores).map(([n,v])=>({number:n,...v})).sort((a,b)=>b.score-a.score);
    return { type: "suspicious_list", data: sus, message: `Found ${sus.filter(s=>s.score>=60).length} HIGH-RISK numbers. Ranked by suspicion score:` };
  }

  if (/night|late|midnight|2am|3am|4am|1am|after 11|after midnight/i.test(q)) {
    const nightData = Object.entries(data.hourly).filter(([h])=>parseInt(h)<=5||parseInt(h)>=22).reduce((a,[h,c])=>({...a,[h]:c}),{});
    const total = Object.values(nightData).reduce((a,b)=>a+b,0);
    return { type: "night_calls", data: nightData, totalNight: total, message: `${total} calls detected between 10PM–5AM (late-night pattern):` };
  }

  if (/network|graph|connection|link|who.?know|mapping/i.test(q))
    return { type: "network", data: data.network, message: `Communication network: ${data.network.nodes.length} entities, ${data.network.edges.length} connections` };

  if (/hour|peak|time.?pattern|distribution|busiest/i.test(q)) {
    const peak = Object.entries(data.hourly).sort((a,b)=>b[1]-a[1])[0];
    return { type: "hourly", data: data.hourly, message: `Peak activity at ${peak[0]}:00 hrs (${peak[1]} calls). Hourly distribution:` };
  }

  if (/summary|overview|stats|total|how many|dataset/i.test(q))
    return { type: "summary", data: data.summary, message: "Dataset overview:" };

  if (/trend|daily|per day|over time|timeline/i.test(q))
    return { type: "daily_trend", data: data.daily, message: "Daily call volume trend (Oct–Dec 2024):" };

  if (/pair|between|frequent.?pair|who.?talk/i.test(q))
    return { type: "pairs", data: data.pairs, message: "Most frequent communication pairs:" };

  if (/international|foreign|overseas|+44|+1|+86|+971/i.test(q)) {
    const intlNums = Object.entries(data.scores).filter(([n])=>!n.startsWith('+91'));
    return { type: "international", data: intlNums, message: `${intlNums.length} international/foreign numbers detected in dataset:` };
  }

  if (targetNum) {
    const s = data.scores[targetNum];
    const tc = data.top_callers.find(c=>c.number===targetNum);
    return { type: "number_detail", number: targetNum, score: s, calls: tc?.calls || "N/A", message: `Analysis for ${targetNum}:` };
  }

  return { type: "summary", data: data.summary, message: `Try: "Show top callers", "Who is suspicious?", "Night calls", "Network graph", or "Hourly distribution"` };
}

// ─── NETWORK GRAPH (D3-style, pure SVG) ────────────────────────────────────
function NetworkGraph({ data }) {
  const svgRef = useRef(null);
  const [positions, setPositions] = useState({});
  const [tooltip, setTooltip] = useState(null);
  const [dragging, setDragging] = useState(null);
  const animRef = useRef(null);
  const posRef = useRef({});
  const velRef = useRef({});

  const W = 700, H = 420;

  useEffect(() => {
    if (!data?.nodes?.length) return;
    // Initialize positions in a circle
    const pos = {}, vel = {};
    data.nodes.forEach((n, i) => {
      const angle = (i / data.nodes.length) * 2 * Math.PI;
      const r = 150 + Math.random() * 60;
      pos[n.id] = { x: W/2 + Math.cos(angle)*r, y: H/2 + Math.sin(angle)*r };
      vel[n.id] = { x: 0, y: 0 };
    });
    posRef.current = pos;
    velRef.current = vel;
    setPositions({...pos});

    // Simple force simulation
    let frame = 0;
    const simulate = () => {
      if (frame++ > 200) return;
      const p = posRef.current, v = velRef.current;
      const alpha = Math.max(0.01, 0.3 * Math.exp(-frame * 0.015));

      // Repulsion
      data.nodes.forEach(a => {
        data.nodes.forEach(b => {
          if (a.id === b.id) return;
          const dx = p[a.id].x - p[b.id].x, dy = p[a.id].y - p[b.id].y;
          const d = Math.sqrt(dx*dx + dy*dy) || 1;
          const force = (2000 / (d * d)) * alpha;
          v[a.id].x += (dx/d) * force;
          v[a.id].y += (dy/d) * force;
        });
      });

      // Attraction along edges
      data.edges.forEach(e => {
        if (!p[e.source] || !p[e.target]) return;
        const dx = p[e.target].x - p[e.source].x, dy = p[e.target].y - p[e.source].y;
        const d = Math.sqrt(dx*dx+dy*dy)||1;
        const strength = (d - 80) * 0.015 * alpha;
        v[e.source].x += (dx/d)*strength; v[e.source].y += (dy/d)*strength;
        v[e.target].x -= (dx/d)*strength; v[e.target].y -= (dy/d)*strength;
      });

      // Center gravity
      data.nodes.forEach(n => {
        v[n.id].x += (W/2 - p[n.id].x) * 0.003 * alpha;
        v[n.id].y += (H/2 - p[n.id].y) * 0.003 * alpha;
        v[n.id].x *= 0.8; v[n.id].y *= 0.8;
        p[n.id].x = Math.max(20, Math.min(W-20, p[n.id].x + v[n.id].x));
        p[n.id].y = Math.max(20, Math.min(H-20, p[n.id].y + v[n.id].y));
      });

      setPositions({...p});
      animRef.current = requestAnimationFrame(simulate);
    };
    animRef.current = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(animRef.current);
  }, [data]);

  const nodeSize = (n) => Math.max(8, Math.min(24, 6 + n.calls / 12));

  return (
    <div className="graph-container" style={{height: 420}}>
      <svg ref={svgRef} className="graph-svg" viewBox={`0 0 ${W} ${H}`}>
        <defs>
          {["#ff4b4b","#ffb800","#00c896"].map((c,i) => (
            <radialGradient key={i} id={`ng${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={c} stopOpacity="0.9"/>
              <stop offset="100%" stopColor={c} stopOpacity="0.4"/>
            </radialGradient>
          ))}
          <filter id="glow"><feGaussianBlur stdDeviation="2.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Edges */}
        {data.edges.map((e,i) => {
          if (!positions[e.source] || !positions[e.target]) return null;
          return <line key={i}
            x1={positions[e.source].x} y1={positions[e.source].y}
            x2={positions[e.target].x} y2={positions[e.target].y}
            stroke="#1e3a5f" strokeWidth={Math.min(3, e.weight * 0.3)} strokeOpacity="0.6"/>;
        })}
        {/* Nodes */}
        {data.nodes.map(n => {
          if (!positions[n.id]) return null;
          const {x,y} = positions[n.id];
          const r = nodeSize(n);
          const gi = n.score >= 60 ? 0 : n.score >= 30 ? 1 : 2;
          const col = n.score >= 60 ? "#ff4b4b" : n.score >= 30 ? "#ffb800" : "#00c896";
          return (
            <g key={n.id} style={{cursor:'pointer'}}
              onMouseEnter={() => setTooltip({...n, x, y})}
              onMouseLeave={() => setTooltip(null)}>
              <circle cx={x} cy={y} r={r+4} fill={col} fillOpacity="0.08"/>
              <circle cx={x} cy={y} r={r} fill={`url(#ng${gi})`} stroke={col} strokeWidth="1.5" filter={n.score>=60?"url(#glow)":"none"}/>
              <text x={x} y={y+r+12} textAnchor="middle" className="node-label">{n.id.slice(-8)}</text>
            </g>
          );
        })}
        {/* Tooltip */}
        {tooltip && (
          <g>
            <rect x={Math.min(tooltip.x+10, W-160)} y={tooltip.y-50} width={150} height={60} rx={6} fill="#060d1a" stroke="#0d2035" strokeWidth="1"/>
            <text x={Math.min(tooltip.x+18, W-152)} y={tooltip.y-30} fill="#00d4ff" fontSize="10" fontFamily="Space Mono">{tooltip.id.slice(-12)}</text>
            <text x={Math.min(tooltip.x+18, W-152)} y={tooltip.y-14} fill="#8aa8c4" fontSize="9" fontFamily="Space Mono">Calls: {tooltip.calls}</text>
            <text x={Math.min(tooltip.x+18, W-152)} y={tooltip.y+2} fill={riskColor(tooltip.score)} fontSize="9" fontFamily="Space Mono">Score: {tooltip.score} — {riskLabel(tooltip.score)}</text>
          </g>
        )}
      </svg>
      <div className="graph-legend">
        {[["#ff4b4b","HIGH RISK (≥60)"],["#ffb800","MEDIUM (30–59)"],["#00c896","LOW (<30)"]].map(([c,l])=>(
          <div key={l} className="legend-item"><div className="legend-dot" style={{background:c}}/>{l}</div>
        ))}
        <div className="legend-item" style={{marginLeft:'auto',fontStyle:'italic'}}>Hover nodes for details · Edge thickness = call volume</div>
      </div>
    </div>
  );
}

// ─── HOURLY BAR CHART ────────────────────────────────────────────────────────
function HourlyChart({ data }) {
  const max = Math.max(...Object.values(data));
  const hours = Array.from({length:24},(_,i)=>i);
  return (
    <div>
      <div className="bar-chart">
        {hours.map(h => {
          const v = data[String(h)] || 0;
          const pct = (v / max) * 100;
          const isNight = h >= 22 || h <= 5;
          return (
            <div key={h} className="bar-col">
              <div className="bar" style={{height:`${pct}%`, minHeight: v>0?'2px':0, background: isNight ? '#ff4b4b88' : '#00d4ff44', border: isNight ? '1px solid #ff4b4b66' : '1px solid #00d4ff33'}} title={`${h}:00 — ${v} calls`}/>
              <div className="bar-label">{h%6===0?h:''}</div>
            </div>
          );
        })}
      </div>
      <div style={{display:'flex',gap:12,marginTop:8,fontSize:10,color:'#4a7a9b'}}>
        <span><span style={{color:'#ff4b4b'}}>■</span> Late-night calls (10PM–5AM)</span>
        <span><span style={{color:'#00d4ff'}}>■</span> Daytime calls</span>
      </div>
    </div>
  );
}

// ─── DAILY TREND ─────────────────────────────────────────────────────────────
function DailyTrend({ data }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d=>d.calls));
  const W=500, H=70, pad=4;
  const pts = data.map((d,i) => ({
    x: pad + (i/(data.length-1)) * (W-2*pad),
    y: H - pad - ((d.calls/max)*(H-2*pad))
  }));
  const pathD = pts.map((p,i)=>`${i===0?'M':'L'}${p.x},${p.y}`).join(' ');
  const areaD = `${pathD} L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`;
  return (
    <div className="line-chart">
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:'100%'}}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#areaGrad)"/>
        <path d={pathD} stroke="#00d4ff" strokeWidth="1.5" fill="none"/>
        {pts.filter((_,i)=>i%15===0).map((p,i)=>(
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#00d4ff"/>
        ))}
      </svg>
    </div>
  );
}

// ─── CHAT RESULT RENDERER ───────────────────────────────────────────────────
function ChatResult({ result }) {
  if (!result) return null;
  const { type, data, message, number } = result;

  if (type === "top_callers") return (
    <div className="msg-result">
      <table className="result-table">
        <thead><tr><th>#</th><th>NUMBER</th><th>CALLS</th><th>RISK</th><th>SCORE</th></tr></thead>
        <tbody>{data.map((r,i)=>(
          <tr key={r.number}>
            <td style={{color:'#4a7a9b'}}>{i+1}</td>
            <td style={{fontFamily:'Space Mono',fontSize:10,color:'#00d4ff'}}>{r.number}</td>
            <td style={{color:'#e2eaf5',fontWeight:700}}>{r.calls}</td>
            <td><span className={`badge ${riskClass(r.score)}`}>{riskLabel(r.score)}</span></td>
            <td><div className="score-bar-wrap"><div className="score-bar-bg"><div className="score-bar-fill" style={{width:`${r.score}%`,background:riskColor(r.score)}}/></div><span className="score-num" style={{color:riskColor(r.score)}}>{r.score}</span></div></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );

  if (type === "suspicious_list") return (
    <div className="msg-result">
      <table className="result-table">
        <thead><tr><th>NUMBER</th><th>SCORE</th><th>RISK</th><th>ANOMALIES</th></tr></thead>
        <tbody>{data.slice(0,10).map(r=>(
          <tr key={r.number}>
            <td style={{fontFamily:'Space Mono',fontSize:10,color:'#00d4ff'}}>{r.number}</td>
            <td><div className="score-bar-wrap"><div className="score-bar-bg"><div className="score-bar-fill" style={{width:`${r.score}%`,background:riskColor(r.score)}}/></div><span className="score-num" style={{color:riskColor(r.score)}}>{r.score}</span></div></td>
            <td><span className={`badge ${riskClass(r.score)}`}>{riskLabel(r.score)}</span></td>
            <td style={{fontSize:10,color:'#8aa8c4'}}>{r.flags?.slice(0,1).join(', ')||'—'}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );

  if (type === "score_detail" || type === "number_detail") {
    const s = data || result.score;
    return (
      <div className="msg-result">
        <div style={{background:'#0a1525',border:`1px solid ${riskColor(s.score)}44`,borderRadius:8,padding:12}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
            <div style={{fontSize:32,fontWeight:800,color:riskColor(s.score),fontFamily:'Space Mono'}}>{s.score}</div>
            <div>
              <div style={{fontSize:10,color:'#4a7a9b',fontFamily:'Space Mono'}}>SUSPICION SCORE / 100</div>
              <span className={`badge ${riskClass(s.score)}`}>{riskLabel(s.score)} RISK</span>
            </div>
          </div>
          <div style={{marginBottom:6,fontSize:11,color:'#8aa8c4',fontWeight:700}}>Detected Anomalies:</div>
          {s.flags?.length ? s.flags.map((f,i)=>(
            <div key={i} style={{display:'flex',gap:6,alignItems:'center',fontSize:11,color:'#c8ddef',padding:'3px 0'}}>
              <span style={{color:'#ffb800'}}>⚠</span>{f}
            </div>
          )) : <div style={{fontSize:11,color:'#4a7a9b'}}>No significant anomalies detected.</div>}
        </div>
      </div>
    );
  }

  if (type === "summary") return (
    <div className="msg-result">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        {[
          ["TOTAL CALLS", data.total_calls, "#00d4ff"],
          ["UNIQUE NUMBERS", data.unique_numbers, "#7b2fbe"],
          ["TOTAL HOURS", data.total_hours, "#00c896"],
          ["AVG DURATION", `${data.avg_duration}s`, "#ffb800"],
          ["DATE RANGE", data.date_range, "#8aa8c4"],
          ["VOICE CALLS", data.call_types?.Voice || 0, "#00d4ff"],
        ].map(([l,v,c])=>(
          <div key={l} style={{background:'#0a1525',borderRadius:6,padding:'8px 10px'}}>
            <div style={{fontSize:9,color:'#4a7a9b',fontFamily:'Space Mono',letterSpacing:1}}>{l}</div>
            <div style={{fontSize:14,fontWeight:700,color:c,fontFamily:'Space Mono',marginTop:2}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );

  if (type === "hourly") return (
    <div className="msg-result" style={{background:'#0a1525',borderRadius:8,padding:12}}>
      <HourlyChart data={data}/>
    </div>
  );

  if (type === "daily_trend") return (
    <div className="msg-result" style={{background:'#0a1525',borderRadius:8,padding:12}}>
      <DailyTrend data={data}/>
    </div>
  );

  if (type === "pairs") return (
    <div className="msg-result">
      <table className="result-table">
        <thead><tr><th>CALLER</th><th>RECEIVER</th><th>CALLS</th></tr></thead>
        <tbody>{data.map((p,i)=>(
          <tr key={i}>
            <td style={{fontFamily:'Space Mono',fontSize:10,color:'#00d4ff'}}>{p.caller_number}</td>
            <td style={{fontFamily:'Space Mono',fontSize:10,color:'#7b2fbe'}}>{p.receiver_number || p.receiver_number}</td>
            <td style={{fontWeight:700,color:'#e2eaf5'}}>{p.count}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );

  if (type === "international") return (
    <div className="msg-result">
      {data.map(([num, info])=>(
        <div key={num} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:'1px solid #0a1525'}}>
          <span style={{fontSize:11,color:'#ff4b4b'}}>🌐</span>
          <span style={{fontFamily:'Space Mono',fontSize:10,color:'#00d4ff',flex:1}}>{num}</span>
          <span className={`badge ${riskClass(info.score)}`}>{info.score}</span>
        </div>
      ))}
    </div>
  );

  if (type === "night_calls") return (
    <div className="msg-result" style={{background:'#0a1525',borderRadius:8,padding:12}}>
      <div style={{marginBottom:8,fontSize:11,color:'#ff4b4b',fontWeight:700}}>🌙 {result.totalNight} calls during suspicious hours</div>
      <HourlyChart data={data}/>
    </div>
  );

  if (type === "network") return (
    <div className="msg-result">
      <NetworkGraph data={data}/>
    </div>
  );

  return null;
}

// ─── AI CHAT (Anthropic API) ─────────────────────────────────────────────────
async function callAI(userMessage, data, history) {
  const systemPrompt = `You are TelForensics AI, an expert forensic investigator analyzing Call Detail Records (CDR) for law enforcement.

Dataset loaded: ${data.summary.total_calls} calls, ${data.summary.unique_numbers} unique numbers, date range: ${data.summary.date_range}.

Key findings from this dataset:
- Top suspicious numbers: ${Object.entries(data.scores).slice(0,3).map(([n,v])=>`${n} (score:${v.score})`).join(', ')}
- Most frequent callers: ${data.top_callers.slice(0,3).map(c=>`${c.number} (${c.calls} calls)`).join(', ')}
- Night-hour (1AM-5AM) call spike detected: ${data.hourly['2']+data.hourly['3']+data.hourly['4']} calls between 2-4AM
- ${data.network.nodes.length} entities in communication network

Respond as a sharp, concise forensic analyst. Give specific insights from the dataset. Keep responses under 150 words. Use 🔴 for high risk, 🟡 for medium, 🟢 for low risk indicators.`;

  const messages = [
    ...history.filter(m=>m.role).map(m=>({role:m.role,content:m.text})),
    { role: "user", content: userMessage }
  ];

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages
    })
  });
  const d = await resp.json();
  return d.content?.[0]?.text || "Unable to get AI response.";
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function TelForensicsApp() {
  const [page, setPage] = useState("dashboard");
  const [data, setData] = useState(SAMPLE_DATA);
  const [dataLoaded, setDataLoaded] = useState(true);
  const [fileName, setFileName] = useState("sample_cdr.xlsx (built-in)");
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", text: "👋 Welcome to **TelForensics AI**! Sample CDR dataset (710 records, Oct–Dec 2024) is loaded and ready.\n\nI can answer natural language questions about the data, show suspicion scores, network graphs, and more. Try asking me something!", result: null }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedSus, setExpandedSus] = useState(null);
  const [isDrag, setIsDrag] = useState(false);
  const msgEndRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => { msgEndRef.current?.scrollIntoView({behavior:'smooth'}); }, [messages]);

  const handleFile = useCallback((file) => {
    if (!file) return;
    setFileName(file.name);
    // In real deployment, send to FastAPI /upload endpoint
    // For demo, keep using sample data
    setDataLoaded(true);
    setMessages(prev => [...prev, {
      id: Date.now(), role: "assistant",
      text: `✅ File **${file.name}** uploaded! In production mode this connects to your FastAPI backend. For this demo, the built-in sample dataset remains active.\n\n🔗 **Backend endpoint:** POST /upload`,
      result: null
    }]);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");

    const userMsg = { id: Date.now(), role: "user", text: userText };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // First: run local NLP for structured data results
      const localResult = processQuery(userText, data);

      // Then: get AI narrative response
      let aiText = "";
      try {
        aiText = await callAI(userText, data, messages.slice(-6));
      } catch {
        aiText = `📊 **Query processed.** ${localResult.message}`;
      }

      setMessages(prev => [...prev, {
        id: Date.now()+1, role: "assistant",
        text: aiText, result: localResult
      }]);
    } catch(e) {
      setMessages(prev => [...prev, {
        id: Date.now()+1, role: "assistant",
        text: "Analysis error. Please try again.", result: null
      }]);
    }
    setLoading(false);
  }, [input, loading, data, messages]);

  const nav = [
    { id: "dashboard", icon: "⬛", label: "DASHBOARD" },
    { id: "chat", icon: "💬", label: "AI CHATBOT" },
    { id: "suspicious", icon: "⚠", label: "SUSPICION SCORE" },
    { id: "network", icon: "🕸", label: "NETWORK GRAPH" },
    { id: "upload", icon: "📁", label: "UPLOAD DATA" },
  ];

  const pageTitles = {
    dashboard: ["Dashboard Overview", "CDR ANALYTICS PLATFORM"],
    chat: ["AI Forensic Chatbot", "NATURAL LANGUAGE QUERY ENGINE"],
    suspicious: ["Suspicion Score Engine", "AI-COMPUTED BEHAVIORAL THREAT SCORES"],
    network: ["Communication Network", "ENTITY RELATIONSHIP GRAPH"],
    upload: ["Upload CDR Data", "EXCEL / CSV IMPORT"],
  };

  const suspiciousSorted = Object.entries(data.scores)
    .map(([n, v]) => ({number: n, ...v}))
    .sort((a,b) => b.score - a.score);

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-badge">
              <div className="logo-icon">🛡</div>
              <div>
                <div className="logo-text">TelForensics</div>
                <div className="logo-sub">AI · v1.0</div>
              </div>
            </div>
          </div>
          <nav className="nav">
            {nav.map(n => (
              <div key={n.id} className={`nav-item ${page===n.id?'active':''}`} onClick={()=>setPage(n.id)}>
                <span className="nav-icon">{n.icon}</span>
                <span>{n.label}</span>
              </div>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="status-dot"><div className="dot"/> SYSTEM ONLINE</div>
            <div style={{marginTop:6,fontSize:9,color:'#2a4a6a',fontFamily:'Space Mono'}}>710 CDR RECORDS LOADED</div>
          </div>
        </div>

        {/* MAIN */}
        <div className="main">
          <div className="topbar">
            <div>
              <div className="page-title">{pageTitles[page][0]}</div>
              <div className="page-sub">{pageTitles[page][1]}</div>
            </div>
            <div className="topbar-actions">
              <div style={{fontSize:10,color:'#4a7a9b',fontFamily:'Space Mono',textAlign:'right'}}>
                <div style={{color:'#00c896'}}>● ACTIVE DATASET</div>
                <div>{fileName}</div>
              </div>
              <button className="upload-btn" onClick={()=>setPage('upload')}>⬆ UPLOAD CDR</button>
            </div>
          </div>

          {/* ─── DASHBOARD ─── */}
          {page === "dashboard" && (
            <div className="content">
              <div className="stat-grid">
                {[
                  {label:"TOTAL CALLS", value:data.summary.total_calls.toLocaleString(), sub:"Oct–Dec 2024", accent:"#00d4ff"},
                  {label:"UNIQUE NUMBERS", value:data.summary.unique_numbers, sub:"entities tracked", accent:"#7b2fbe"},
                  {label:"HIGH RISK", value:suspiciousSorted.filter(s=>s.score>=60).length, sub:"numbers flagged", accent:"#ff4b4b"},
                  {label:"TOTAL HOURS", value:data.summary.total_hours, sub:"of call activity", accent:"#00c896"},
                ].map(s=>(
                  <div key={s.label} className="stat-card" style={{"--accent":s.accent}}>
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-sub">{s.sub}</div>
                  </div>
                ))}
              </div>
              <div className="dash-grid">
                <div className="card">
                  <div className="card-title">HOURLY CALL DISTRIBUTION</div>
                  <HourlyChart data={data.hourly}/>
                </div>
                <div className="card">
                  <div className="card-title">DAILY CALL TREND</div>
                  <DailyTrend data={data.daily}/>
                  <div style={{marginTop:10,fontSize:10,color:'#4a7a9b'}}>Oct 2024 – Dec 2024 · {data.daily.length} active days</div>
                </div>
                <div className="card">
                  <div className="card-title">TOP CALLERS BY VOLUME</div>
                  <table className="table">
                    <thead><tr><th>NUMBER</th><th>CALLS</th><th>RISK</th></tr></thead>
                    <tbody>{data.top_callers.slice(0,6).map(c=>(
                      <tr key={c.number} style={{cursor:'pointer'}} onClick={()=>setPage('suspicious')}>
                        <td style={{fontFamily:'Space Mono',fontSize:10,color:'#00d4ff'}}>{c.number}</td>
                        <td style={{fontWeight:700}}>{c.calls}</td>
                        <td><span className={`badge ${riskClass(c.score)}`}>{riskLabel(c.score)}</span></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <div className="card">
                  <div className="card-title">SUSPICION LEADERBOARD</div>
                  {suspiciousSorted.slice(0,6).map((s,i)=>(
                    <div key={s.number} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:'1px solid #0a1525',cursor:'pointer'}} onClick={()=>{setPage('suspicious');setExpandedSus(s.number);}}>
                      <span style={{color:'#2a4a6a',fontFamily:'Space Mono',fontSize:10,width:16}}>{i+1}</span>
                      <span style={{fontFamily:'Space Mono',fontSize:10,color:'#00d4ff',flex:1}}>{s.number}</span>
                      <div className="score-bar-wrap" style={{width:80}}>
                        <div className="score-bar-bg"><div className="score-bar-fill" style={{width:`${s.score}%`,background:riskColor(s.score)}}/></div>
                        <span className="score-num" style={{color:riskColor(s.score)}}>{s.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card full-width">
                  <div className="card-title">FREQUENT COMMUNICATION PAIRS</div>
                  <table className="table">
                    <thead><tr><th>#</th><th>CALLER</th><th>RECEIVER</th><th>CALLS</th><th>WEIGHT</th></tr></thead>
                    <tbody>{data.pairs.map((p,i)=>(
                      <tr key={i}>
                        <td style={{color:'#4a7a9b',fontFamily:'Space Mono'}}>{String(i+1).padStart(2,'0')}</td>
                        <td style={{fontFamily:'Space Mono',fontSize:10,color:'#00d4ff'}}>{p.caller_number}</td>
                        <td style={{fontFamily:'Space Mono',fontSize:10,color:'#7b2fbe'}}>{p.receiver_number}</td>
                        <td style={{fontWeight:700,color:'#e2eaf5'}}>{p.count}</td>
                        <td style={{width:120}}><div className="score-bar-bg"><div className="score-bar-fill" style={{width:`${(p.count/13)*100}%`,background:'#00d4ff'}}/></div></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── CHATBOT ─── */}
          {page === "chat" && (
            <div style={{display:'flex',flexDirection:'column',height:'calc(100vh - 65px)'}}>
              <div className="quick-queries">
                <span style={{fontSize:10,color:'#4a7a9b',fontFamily:'Space Mono',marginRight:4}}>QUICK:</span>
                {["Show top callers","Who is suspicious?","Night calls","Network graph","Daily trend","International calls"].map(q=>(
                  <button key={q} className="quick-btn" onClick={()=>{setInput(q);}}>{q}</button>
                ))}
              </div>
              <div className="chat-messages">
                {messages.map(m=>(
                  <div key={m.id} className={`msg ${m.role==='user'?'user':''}`}>
                    <div className={`msg-avatar ${m.role==='user'?'user':'bot'}`}>{m.role==='user'?'👤':'🛡'}</div>
                    <div>
                      <div className="msg-bubble" style={{whiteSpace:'pre-wrap'}}>{m.text.replace(/\*\*/g,'')}</div>
                      {m.result && m.result.type !== "error" && <ChatResult result={m.result}/>}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="msg">
                    <div className="msg-avatar bot">🛡</div>
                    <div className="msg-bubble"><div className="typing"><span/><span/><span/></div></div>
                  </div>
                )}
                <div ref={msgEndRef}/>
              </div>
              <div className="chat-input-area">
                <input className="chat-input" placeholder="Ask about your telecom data... e.g. 'Who has the highest suspicion score?'" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()} disabled={loading}/>
                <button className="send-btn" onClick={sendMessage} disabled={loading||!input.trim()}>
                  {loading ? <div className="spinner"/> : '→'}
                </button>
              </div>
            </div>
          )}

          {/* ─── SUSPICIOUS NUMBERS ─── */}
          {page === "suspicious" && (
            <div className="content">
              <div style={{display:'flex',gap:12,marginBottom:16}}>
                {[["HIGH RISK", suspiciousSorted.filter(s=>s.score>=60).length, "#ff4b4b"],
                  ["MEDIUM", suspiciousSorted.filter(s=>s.score>=30&&s.score<60).length, "#ffb800"],
                  ["LOW RISK", suspiciousSorted.filter(s=>s.score<30).length, "#00c896"]].map(([l,v,c])=>(
                  <div key={l} style={{background:'#060d1a',border:`1px solid ${c}33`,borderRadius:10,padding:'12px 16px',flex:1,borderTop:`2px solid ${c}`}}>
                    <div style={{fontSize:9,color:'#4a7a9b',fontFamily:'Space Mono',letterSpacing:1}}>{l}</div>
                    <div style={{fontSize:26,fontWeight:800,color:c,fontFamily:'Space Mono'}}>{v}</div>
                    <div style={{fontSize:9,color:'#4a7a9b'}}>numbers</div>
                  </div>
                ))}
              </div>
              <div className="sus-grid">
                {suspiciousSorted.map(s=>(
                  <div key={s.number} className={`sus-card ${expandedSus===s.number?'expanded':''}`} onClick={()=>setExpandedSus(expandedSus===s.number?null:s.number)}>
                    <div className="sus-header">
                      <div className="sus-num">{s.number}</div>
                      <div className="score-bar-wrap" style={{width:140}}>
                        <div className="score-bar-bg"><div className="score-bar-fill" style={{width:`${s.score}%`,background:riskColor(s.score)}}/></div>
                        <span className="score-num" style={{color:riskColor(s.score)}}>{s.score}</span>
                      </div>
                      <span className={`badge ${riskClass(s.score)}`} style={{width:55,textAlign:'center'}}>{riskLabel(s.score)}</span>
                      <span className="sus-expand">{expandedSus===s.number?'▲':'▼'}</span>
                    </div>
                    {expandedSus===s.number && (
                      <div className="sus-flags">
                        {s.flags?.length ? s.flags.map((f,i)=>(
                          <div key={i} className="sus-flag"><span className="flag-icon">⚠</span>{f}</div>
                        )) : <div className="sus-flag"><span style={{color:'#00c896'}}>✓</span>No significant anomalies detected for this number.</div>}
                        <button style={{marginTop:8,padding:'6px 12px',background:'#00d4ff12',border:'1px solid #00d4ff33',borderRadius:6,color:'#00d4ff',fontSize:10,cursor:'pointer',fontFamily:'Syne,sans-serif'}}
                          onClick={e=>{e.stopPropagation();setPage('chat');setInput(`Tell me more about ${s.number}`)}}>
                          🔍 Ask AI about this number →
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── NETWORK GRAPH ─── */}
          {page === "network" && (
            <div className="content">
              <div style={{display:'flex',gap:12,marginBottom:16}}>
                {[
                  {l:"NODES", v:data.network.nodes.length, c:"#00d4ff"},
                  {l:"CONNECTIONS", v:data.network.edges.length, c:"#7b2fbe"},
                  {l:"HIGH RISK NODES", v:data.network.nodes.filter(n=>n.score>=60).length, c:"#ff4b4b"},
                ].map(({l,v,c})=>(
                  <div key={l} style={{background:'#060d1a',border:`1px solid ${c}33`,borderRadius:10,padding:'12px 16px',flex:1,borderTop:`2px solid ${c}`}}>
                    <div style={{fontSize:9,color:'#4a7a9b',fontFamily:'Space Mono',letterSpacing:1}}>{l}</div>
                    <div style={{fontSize:24,fontWeight:800,color:c,fontFamily:'Space Mono'}}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="card-title">COMMUNICATION NETWORK GRAPH · Hover nodes for details</div>
                <NetworkGraph data={data.network}/>
              </div>
              <div className="card" style={{marginTop:14}}>
                <div className="card-title">TOP CONNECTED ENTITIES</div>
                <table className="table">
                  <thead><tr><th>NUMBER</th><th>TOTAL CALLS</th><th>SUSPICION SCORE</th><th>RISK LEVEL</th></tr></thead>
                  <tbody>{[...data.network.nodes].sort((a,b)=>b.calls-a.calls).slice(0,8).map(n=>(
                    <tr key={n.id}>
                      <td style={{fontFamily:'Space Mono',fontSize:10,color:'#00d4ff'}}>{n.id}</td>
                      <td style={{fontWeight:700}}>{n.calls}</td>
                      <td><div className="score-bar-wrap"><div className="score-bar-bg"><div className="score-bar-fill" style={{width:`${n.score}%`,background:riskColor(n.score)}}/></div><span className="score-num" style={{color:riskColor(n.score)}}>{n.score}</span></div></td>
                      <td><span className={`badge ${riskClass(n.score)}`}>{riskLabel(n.score)}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── UPLOAD ─── */}
          {page === "upload" && (
            <div className="content">
              {dataLoaded && (
                <div className="loaded-banner">
                  <span>✓</span><span>Dataset active: <strong>{fileName}</strong> · {data.summary.total_calls} records loaded</span>
                </div>
              )}
              <div className="card" style={{marginBottom:14}}>
                <div className="card-title">UPLOAD NEW CDR FILE</div>
                <div className={`upload-zone ${isDrag?'drag':''}`}
                  onClick={()=>fileRef.current?.click()}
                  onDragOver={e=>{e.preventDefault();setIsDrag(true)}}
                  onDragLeave={()=>setIsDrag(false)}
                  onDrop={e=>{e.preventDefault();setIsDrag(false);handleFile(e.dataTransfer.files[0])}}>
                  <input ref={fileRef} className="file-input" type="file" accept=".xlsx,.xls,.csv" onChange={e=>handleFile(e.target.files[0])}/>
                  <div className="upload-icon">📂</div>
                  <div className="upload-title">Drop your CDR file here</div>
                  <div className="upload-sub">Supports .xlsx, .xls, .csv — Max 50MB</div>
                  <div style={{marginTop:12,padding:'6px 16px',background:'#00d4ff15',border:'1px solid #00d4ff33',borderRadius:6,display:'inline-block',fontSize:11,color:'#00d4ff'}}>Browse Files</div>
                </div>
              </div>
              <div className="card" style={{marginBottom:14}}>
                <div className="card-title">EXPECTED COLUMN FORMAT</div>
                <table className="table">
                  <thead><tr><th>COLUMN</th><th>TYPE</th><th>EXAMPLE</th><th>REQUIRED</th></tr></thead>
                  <tbody>{[
                    ["caller_number","Text","+91-98765-43210","✓"],
                    ["receiver_number","Text","+91-80234-56789","✓"],
                    ["call_datetime","DateTime","2024-10-01 02:35:00","✓"],
                    ["duration_seconds","Number","125","Optional"],
                    ["call_type","Text","Voice / SMS","Optional"],
                    ["tower_location","Text","Hyderabad-Central","Optional"],
                    ["imei","Text","351234567890123","Optional"],
                  ].map(([c,t,e,r])=>(
                    <tr key={c}>
                      <td style={{fontFamily:'Space Mono',fontSize:10,color:'#00d4ff'}}>{c}</td>
                      <td style={{color:'#8aa8c4'}}>{t}</td>
                      <td style={{color:'#4a7a9b',fontFamily:'Space Mono',fontSize:10}}>{e}</td>
                      <td><span className={`badge ${r==='✓'?'badge-low':'badge-medium'}`}>{r}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <div className="card">
                <div className="card-title">BACKEND API CONNECTION</div>
                <div style={{fontSize:11,color:'#8aa8c4',lineHeight:1.8}}>
                  <div style={{marginBottom:8}}>Connect this UI to your FastAPI backend running locally:</div>
                  {[
                    ["Start backend:", "cd backend && uvicorn main:app --reload --port 8000"],
                    ["Upload endpoint:", "POST http://localhost:8000/upload"],
                    ["Chat endpoint:", "POST http://localhost:8000/chat"],
                    ["Scores endpoint:", "GET http://localhost:8000/suspicious"],
                  ].map(([l,v])=>(
                    <div key={l} style={{display:'flex',gap:8,alignItems:'center',padding:'4px 0'}}>
                      <span style={{color:'#4a7a9b',fontSize:10,width:130}}>{l}</span>
                      <code style={{fontFamily:'Space Mono',fontSize:10,background:'#0a1525',padding:'2px 8px',borderRadius:4,color:'#00d4ff'}}>{v}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
