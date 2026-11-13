#!/usr/bin/env python3
"""
SNOWY // Cold-Start WiFi Usage & Draw Calls Debugger
===================================================
A standalone CLI tool to measure:
  1. Total and per-asset cold-start WiFi network transfer (in KB and MB)
  2. Total WiFi network calls (HTTP requests)
  3. WebGL GPU draw calls and triangles per frame
  4. Network waterfall duration and milestone timings

Usage:
  python scripts/measure_wifi.py
  python scripts/measure_wifi.py https://yzn511hmad-alt.github.io/free-key.html
  python scripts/measure_wifi.py --browser msedge
"""

import sys
import os
import time
import json
import argparse
from urllib.parse import urlparse

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("Error: playwright is not installed. Please run: pip install playwright")
    sys.exit(1)

def format_size(bytes_val):
    if bytes_val >= 1024 * 1024:
        return f"{bytes_val / (1024 * 1024):.2f} MB"
    elif bytes_val >= 1024:
        return f"{bytes_val / 1024:.1f} KB"
    else:
        return f"{bytes_val} B"

def categorize_url(url, initiator=""):
    path = urlparse(url).path.lower()
    if path.endswith(('.mp4', '.webm', '.ogv')) or initiator == 'video':
        return 'Video'
    elif path.endswith(('.webp', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.hdr')) or initiator == 'img':
        return '3D Texture'
    elif path.endswith(('.js', '.mjs')) or initiator == 'script':
        return 'JavaScript'
    elif path.endswith(('.woff2', '.woff', '.ttf', '.otf')) or initiator == 'font':
        return 'Web Font'
    elif path.endswith('.css') or initiator == 'css':
        return 'CSS Style'
    elif path.endswith(('.html', '')) or initiator == 'document':
        return 'HTML Document'
    else:
        return 'Other'

def run_wifi_audit(target_url, browser_channel='chrome', headless=True, timeout=25):
    print("\n" + "=" * 78)
    print("❄️  SNOWY // COLD-START WIFI USAGE & DRAW CALLS AUDIT")
    print("=" * 78)
    print(f"Target URL:      {target_url}")
    print(f"Browser Engine:  {browser_channel.upper()} (Clean Incognito Profile - Zero Cache)")
    print(f"Audit Mode:      100% PURE COLD START")
    print("-" * 78)

    with sync_playwright() as p:
        # Try selected browser, fallback to chromium if channel fails
        try:
            browser = p.chromium.launch(channel=browser_channel, headless=headless)
        except Exception:
            print(f"Notice: Channel '{browser_channel}' not found, falling back to default chromium.")
            browser = p.chromium.launch(headless=headless)

        # Fresh isolated context with cache disabled to simulate absolute cold start
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=1.0,
            has_touch=False
        )
        page = context.new_page()

        # Track network requests via CDP / Playwright events
        tracked_assets = []
        network_waterfall = []
        t0 = time.time()

        def handle_response(resp):
            try:
                url = resp.url
                # Skip data URIs or chrome internal URLs
                if url.startswith(('data:', 'chrome:', 'blob:')):
                    return

                t_resp = time.time() - t0
                status = resp.status
                headers = resp.headers
                content_len = headers.get('content-length')
                transfer_bytes = int(content_len) if content_len and content_len.isdigit() else 0
                
                # If content-length was not provided, read body length
                if transfer_bytes == 0:
                    try:
                        body = resp.body()
                        transfer_bytes = len(body)
                    except Exception:
                        pass

                name = url.split('/')[-1].split('?')[0] or url
                category = categorize_url(url, resp.request.resource_type)

                tracked_assets.append({
                    "name": name,
                    "url": url,
                    "status": status,
                    "category": category,
                    "resource_type": resp.request.resource_type,
                    "bytes": transfer_bytes,
                    "time_sec": round(t_resp, 3)
                })
            except Exception:
                pass

        page.on("response", handle_response)

        print("📡 Navigating and recording network packets...")
        nav_start = time.time()
        try:
            page.goto(target_url, wait_until="domcontentloaded", timeout=timeout * 1000)
            dcl_time = time.time() - nav_start
        except Exception as e:
            print(f"Navigation warning: {e}")
            dcl_time = time.time() - nav_start

        # Wait for Three.js WebGL scene to present and settle
        print("⏳ Waiting for 3D scene presentation and WebGL hydration...")
        scene_presented = False
        gpu_draw_calls = 0
        gpu_triangles = 0
        first_frame_ms = 0

        for _ in range(50):
            time.sleep(0.1)
            try:
                stats = page.evaluate("""() => {
                    const root = document.getElementById('key-access');
                    return {
                        scenePresented: root ? root.dataset.scenePresented : null,
                        effectsPresented: root ? root.dataset.effectsPresented : null,
                        drawCalls: root ? root.dataset.drawCalls : null,
                        triangles: root ? root.dataset.triangles : null,
                        renderCount: root ? root.dataset.renderCount : null,
                        previewDecodedAt: document.documentElement.dataset.previewDecodedAt
                    };
                }""")
                if stats.get('drawCalls'):
                    gpu_draw_calls = int(stats['drawCalls'])
                if stats.get('triangles'):
                    gpu_triangles = int(stats['triangles'])
                if stats.get('previewDecodedAt'):
                    first_frame_ms = float(stats['previewDecodedAt'])
                if stats.get('scenePresented') == 'true':
                    scene_presented = True
                    break
            except Exception:
                pass

        # Give 1 extra second for ambient effects
        time.sleep(1.0)
        total_audit_time = time.time() - nav_start

        # Also collect browser PerformanceResourceTiming for precise byte confirmation
        perf_resources = page.evaluate("""() => {
            return performance.getEntriesByType('resource').map(r => ({
                name: r.name.split('/').pop().split('?')[0],
                url: r.name,
                transferSize: r.transferSize,
                decodedBodySize: r.decodedBodySize,
                duration: r.duration
            }));
        }""")

        # Merge browser reported transfer sizes
        perf_map = {r['url']: r for r in perf_resources}
        for item in tracked_assets:
            if item['url'] in perf_map:
                p_size = perf_map[item['url']]['transferSize']
                if p_size > 0:
                    item['bytes'] = p_size

        browser.close()

    # Calculate Totals & Category Summaries
    total_bytes = sum(a['bytes'] for a in tracked_assets)
    category_summary = {}
    for a in tracked_assets:
        cat = a['category']
        if cat not in category_summary:
            category_summary[cat] = {"bytes": 0, "count": 0}
        category_summary[cat]["bytes"] += a["bytes"]
        category_summary[cat]["count"] += 1

    # Sort assets by wire transfer size descending
    sorted_assets = sorted(tracked_assets, key=lambda x: x['bytes'], reverse=True)

    # PRINT SUMMARY
    print("\n" + "=" * 78)
    print("📊  COLD-START SUMMARY RESULTS")
    print("=" * 78)
    print(f"  📶 Total Cold WiFi Usage:    {format_size(total_bytes):>10}  ({total_bytes:,} bytes)")
    print(f"  ⚡ Total WiFi Network Calls: {len(tracked_assets):>10}  HTTP requests")
    print(f"  🎮 WebGL GPU Draw Calls:     {gpu_draw_calls:>10}  calls/frame")
    print(f"  🔺 WebGL Triangles:          {gpu_triangles:>10,}  triangles/frame")
    print(f"  🖼️ First Scene Visible:      {first_frame_ms / 1000:>10.2f}s (Skeleton hidden)")
    print(f"  ⏱️ Total Cold Load Time:     {total_audit_time:>10.2f}s")
    print("-" * 78)

    print("\n📦  WIFI USAGE BREAKDOWN BY ASSET TYPE:")
    print("-" * 78)
    print(f"{'Category':<20} | {'Files':<6} | {'WiFi Transfer':<14} | {'% of Total':<10}")
    print("-" * 78)
    for cat, data in sorted(category_summary.items(), key=lambda x: x[1]['bytes'], reverse=True):
        pct = (data['bytes'] / max(1, total_bytes)) * 100
        print(f"{cat:<20} | {data['count']:<6} | {format_size(data['bytes']):<14} | {pct:>6.1f}%")
    print("-" * 78)

    print("\n📋  ALL ASSETS RANKED BY COLD WIFI USAGE:")
    print("-" * 78)
    print(f"{'#':<3} | {'Asset Name':<34} | {'Category':<14} | {'WiFi Size':<10} | {'Time'}")
    print("-" * 78)
    for i, a in enumerate(sorted_assets, 1):
        trunc_name = (a['name'][:31] + '...') if len(a['name']) > 34 else a['name']
        print(f"{i:<3} | {trunc_name:<34} | {a['category']:<14} | {format_size(a['bytes']):<10} | {a['time_sec']:.2f}s")
    print("-" * 78)

    # Save JSON report
    report_path = "wifi-audit-report.json"
    report_data = {
        "url": target_url,
        "date": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_wifi_bytes": total_bytes,
        "total_wifi_formatted": format_size(total_bytes),
        "total_network_calls": len(tracked_assets),
        "gpu_draw_calls": gpu_draw_calls,
        "gpu_triangles": gpu_triangles,
        "category_summary": category_summary,
        "assets": sorted_assets
    }
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2)

    print(f"\n💾 Full JSON report saved to: {os.path.abspath(report_path)}")
    print("=" * 78 + "\n")

    return report_data

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Measure cold-start WiFi usage and draw calls.")
    parser.add_argument("url", nargs="?", default="https://yzn511hmad-alt.github.io/free-key.html", help="URL to audit")
    parser.add_argument("--browser", default="chrome", choices=["chrome", "msedge", "chromium"], help="Browser to test")
    parser.add_argument("--headful", action="store_true", help="Run with visible browser window")
    args = parser.parse_args()

    run_wifi_audit(args.url, browser_channel=args.browser, headless=not args.headful)
