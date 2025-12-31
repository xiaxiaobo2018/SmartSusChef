#!/usr/bin/env python3
"""
Convert SARIF files into a standalone HTML report with embedded charts.

Usage:
    python sarif_to_html.py --title "CodeQL Report" -o report.html file1.sarif file2.sarif
    python sarif_to_html.py --title "Trivy Report"  -o report.html trivy-*.sarif
"""

import argparse
import json
import html
import sys
from pathlib import Path
from collections import Counter
from datetime import datetime, timezone


def parse_sarif(filepath: str) -> dict:
    """Parse a single SARIF file and extract findings."""
    with open(filepath, encoding="utf-8") as f:
        data = json.load(f)

    findings = []
    for run in data.get("runs", []):
        tool_name = run.get("tool", {}).get("driver", {}).get("name", "unknown")
        rules_map = {}
        for rule in run.get("tool", {}).get("driver", {}).get("rules", []):
            rules_map[rule["id"]] = {
                "name": rule.get("shortDescription", {}).get("text", rule["id"]),
                "description": rule.get("fullDescription", {}).get("text", ""),
                "severity": rule.get("defaultConfiguration", {}).get("level", "warning"),
                "tags": rule.get("properties", {}).get("tags", []),
            }

        for result in run.get("results", []):
            rule_id = result.get("ruleId", "unknown")
            rule_info = rules_map.get(rule_id, {})
            level = result.get("level", rule_info.get("severity", "warning"))

            locations = []
            for loc in result.get("locations", []):
                pl = loc.get("physicalLocation", {})
                artifact = pl.get("artifactLocation", {}).get("uri", "")
                region = pl.get("region", {})
                start_line = region.get("startLine", 0)
                locations.append({"file": artifact, "line": start_line})

            findings.append({
                "tool": tool_name,
                "ruleId": rule_id,
                "ruleName": rule_info.get("name", rule_id),
                "level": level,
                "message": result.get("message", {}).get("text", ""),
                "locations": locations,
                "tags": rule_info.get("tags", []),
            })

    return {"file": Path(filepath).name, "findings": findings}


def generate_html(all_findings: list, title: str) -> str:
    """Generate a standalone HTML report with embedded Chart.js charts."""
    # Aggregate stats
    total = len(all_findings)
    by_level = Counter(f["level"] for f in all_findings)
    by_rule = Counter(f["ruleId"] for f in all_findings)
    by_file = Counter()
    for f in all_findings:
        for loc in f["locations"]:
            if loc["file"]:
                by_file[loc["file"]] += 1

    # Sort
    top_rules = by_rule.most_common(15)
    top_files = by_file.most_common(15)

    level_colors = {
        "error": "#e74c3c",
        "warning": "#f39c12",
        "note": "#3498db",
        "none": "#95a5a6",
    }

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    # Build findings table rows
    rows_html = ""
    for i, f in enumerate(all_findings):
        level = f["level"]
        badge_color = level_colors.get(level, "#95a5a6")
        loc_str = ""
        if f["locations"]:
            loc = f["locations"][0]
            loc_str = f'{html.escape(loc["file"])}:{loc["line"]}' if loc["file"] else ""

        rows_html += f"""
        <tr>
          <td>{i+1}</td>
          <td><span class="badge" style="background:{badge_color}">{html.escape(level.upper())}</span></td>
          <td><code>{html.escape(f['ruleId'])}</code></td>
          <td>{html.escape(f['message'][:200])}</td>
          <td class="loc">{html.escape(loc_str)}</td>
        </tr>"""

    # Chart data
    severity_labels = json.dumps(list(by_level.keys()))
    severity_values = json.dumps(list(by_level.values()))
    severity_colors = json.dumps([level_colors.get(k, "#95a5a6") for k in by_level.keys()])

    rule_labels = json.dumps([r[0][:40] for r in top_rules])
    rule_values = json.dumps([r[1] for r in top_rules])

    file_labels = json.dumps([Path(f[0]).name for f in top_files])
    file_values = json.dumps([f[1] for f in top_files])

    # Build conditional HTML blocks (avoids nested f-strings, compatible with Python < 3.12)
    if total == 0:
        charts_section = ""
        table_section = "<div class='empty'><div class='icon'>&#10003;</div>No security findings detected!</div>"
        script_section = ""
    else:
        charts_section = f'''
<div class="charts">
  <div class="chart-card">
    <h3>Findings by Severity</h3>
    <canvas id="severityChart"></canvas>
  </div>
  <div class="chart-card">
    <h3>Top Rules</h3>
    <canvas id="rulesChart"></canvas>
  </div>
  <div class="chart-card">
    <h3>Top Affected Files</h3>
    <canvas id="filesChart"></canvas>
  </div>
</div>
'''
        table_section = f'''
<h2 class="section-title">All Findings ({total})</h2>
<table>
  <thead>
    <tr><th>#</th><th>Severity</th><th>Rule</th><th>Message</th><th>Location</th></tr>
  </thead>
  <tbody>
    {rows_html}
  </tbody>
</table>
'''
        script_section = f"""
new Chart(document.getElementById('severityChart'), {{
  type: 'doughnut',
  data: {{
    labels: {severity_labels},
    datasets: [{{ data: {severity_values}, backgroundColor: {severity_colors}, borderWidth: 2, borderColor: '#fff' }}]
  }},
  options: {{ responsive: true, plugins: {{ legend: {{ position: 'bottom' }} }} }}
}});

new Chart(document.getElementById('rulesChart'), {{
  type: 'bar',
  data: {{
    labels: {rule_labels},
    datasets: [{{ label: 'Count', data: {rule_values}, backgroundColor: '#3498db', borderRadius: 6 }}]
  }},
  options: {{ responsive: true, indexAxis: 'y', plugins: {{ legend: {{ display: false }} }},
    scales: {{ x: {{ beginAtZero: true, ticks: {{ stepSize: 1 }} }} }} }}
}});

new Chart(document.getElementById('filesChart'), {{
  type: 'bar',
  data: {{
    labels: {file_labels},
    datasets: [{{ label: 'Findings', data: {file_values}, backgroundColor: '#e74c3c', borderRadius: 6 }}]
  }},
  options: {{ responsive: true, indexAxis: 'y', plugins: {{ legend: {{ display: false }} }},
    scales: {{ x: {{ beginAtZero: true, ticks: {{ stepSize: 1 }} }} }} }}
}});
"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{html.escape(title)}</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
         background: #f5f6fa; color: #2c3e50; padding: 20px; }}
  .header {{ background: linear-gradient(135deg, #2c3e50, #3498db); color: white;
             padding: 30px; border-radius: 12px; margin-bottom: 24px; }}
  .header h1 {{ font-size: 28px; margin-bottom: 8px; }}
  .header .meta {{ opacity: 0.85; font-size: 14px; }}
  .stats {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px; margin-bottom: 24px; }}
  .stat-card {{ background: white; border-radius: 10px; padding: 20px; text-align: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08); }}
  .stat-card .num {{ font-size: 36px; font-weight: 700; }}
  .stat-card .label {{ font-size: 13px; color: #7f8c8d; margin-top: 4px; }}
  .charts {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
             gap: 20px; margin-bottom: 24px; }}
  .chart-card {{ background: white; border-radius: 10px; padding: 20px;
                 box-shadow: 0 2px 8px rgba(0,0,0,0.08); }}
  .chart-card h3 {{ margin-bottom: 12px; font-size: 16px; }}
  table {{ width: 100%; border-collapse: collapse; background: white;
           border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }}
  th {{ background: #2c3e50; color: white; padding: 12px 16px; text-align: left; font-size: 13px; }}
  td {{ padding: 10px 16px; border-bottom: 1px solid #ecf0f1; font-size: 13px; }}
  tr:hover {{ background: #f8f9fa; }}
  .badge {{ display: inline-block; padding: 3px 10px; border-radius: 12px;
            color: white; font-size: 11px; font-weight: 600; }}
  .loc {{ font-family: monospace; font-size: 12px; color: #7f8c8d; max-width: 300px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }}
  code {{ background: #ecf0f1; padding: 2px 6px; border-radius: 4px; font-size: 12px; }}
  .empty {{ text-align: center; padding: 60px; color: #27ae60; font-size: 20px; }}
  .empty .icon {{ font-size: 48px; margin-bottom: 12px; }}
  .section-title {{ font-size: 20px; font-weight: 600; margin: 24px 0 12px; }}
</style>
</head>
<body>

<div class="header">
  <h1>{html.escape(title)}</h1>
  <div class="meta">Generated: {now} &bull; Total findings: {total}</div>
</div>

<div class="stats">
  <div class="stat-card">
    <div class="num" style="color:#2c3e50">{total}</div>
    <div class="label">Total Findings</div>
  </div>
  <div class="stat-card">
    <div class="num" style="color:#e74c3c">{by_level.get('error', 0)}</div>
    <div class="label">Errors / Critical</div>
  </div>
  <div class="stat-card">
    <div class="num" style="color:#f39c12">{by_level.get('warning', 0)}</div>
    <div class="label">Warnings / High</div>
  </div>
  <div class="stat-card">
    <div class="num" style="color:#3498db">{by_level.get('note', 0)}</div>
    <div class="label">Notes / Info</div>
  </div>
</div>

{charts_section}

{table_section}

<script>
{script_section}
</script>
</body>
</html>"""


def main():
    parser = argparse.ArgumentParser(description="Convert SARIF files to HTML report with charts")
    parser.add_argument("sarif_files", nargs="+", help="SARIF file(s) to process")
    parser.add_argument("--title", default="Security Scan Report", help="Report title")
    parser.add_argument("-o", "--output", required=True, help="Output HTML file path")
    args = parser.parse_args()

    all_findings = []
    for sf in args.sarif_files:
        p = Path(sf)
        if not p.exists():
            print(f"Warning: {sf} not found, skipping", file=sys.stderr)
            continue
        result = parse_sarif(str(p))
        all_findings.extend(result["findings"])

    html_content = generate_html(all_findings, args.title)
    Path(args.output).write_text(html_content, encoding="utf-8")
    print(f"Report generated: {args.output} ({len(all_findings)} findings)")


if __name__ == "__main__":
    main()
