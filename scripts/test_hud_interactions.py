import time
from playwright.sync_api import sync_playwright

def test_hud_interactions():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # Open with debug=1
        print("Navigating to http://127.0.0.1:4173/free-key.html?debug=1 ...")
        # Start local server if not running, or let's use preview
        # First let's check local port 4173
        page.goto("http://127.0.0.1:4173/free-key.html?debug=1", wait_until="load")

        # 1. Verify HUD is visible
        hud = page.wait_for_selector("#snowy-wifi-hud-container", state="visible", timeout=5000)
        assert hud is not None, "HUD container not visible!"
        print("PASS 1: HUD is visible on load with ?debug=1")

        # 2. Test Scrolling the Table
        wrapper = page.wait_for_selector("#hud-table-wrapper")
        scroll_initial = page.evaluate("() => document.getElementById('hud-table-wrapper').scrollTop")
        print(f"Initial scrollTop: {scroll_initial}")

        # Scroll down
        page.evaluate("() => { document.getElementById('hud-table-wrapper').scrollTop = 200; }")
        time.sleep(0.5)
        scroll_after = page.evaluate("() => document.getElementById('hud-table-wrapper').scrollTop")
        print(f"Scrolled scrollTop: {scroll_after}")
        assert scroll_after > 0, f"Table did not scroll! scrollTop is {scroll_after}"
        print("PASS 2: Table scrolling works perfectly!")

        # 3. Test Clicking Filter Tabs
        tab_textures = page.wait_for_selector("[data-filter='texture']")
        tab_textures.click()
        time.sleep(0.3)
        rows_count = page.evaluate("() => document.querySelectorAll('#hud-table-body tr').length")
        print(f"Texture rows count after click: {rows_count}")
        assert rows_count > 0, "No texture rows displayed after clicking Texture tab!"
        print("PASS 3: Clicking filter tabs works!")

        # 4. Test Clicking Close Button
        btn_close = page.wait_for_selector("#btn-close-hud")
        btn_close.click()
        time.sleep(0.3)
        is_hidden = page.evaluate("() => document.getElementById('snowy-wifi-hud-container').style.display === 'none'")
        assert is_hidden, "HUD did not close after clicking close button!"
        print("PASS 4: Clicking Close button works!")

        # 5. Test Re-opening with Shift+D
        page.keyboard.press("Shift+D")
        time.sleep(0.3)
        is_open_again = page.evaluate("() => document.getElementById('snowy-wifi-hud-container').style.display === 'flex'")
        assert is_open_again, "HUD did not re-open with Shift+D!"
        print("PASS 5: Shift+D toggle works!")

        # 6. Test Closing with Escape
        page.keyboard.press("Escape")
        time.sleep(0.3)
        is_hidden_esc = page.evaluate("() => document.getElementById('snowy-wifi-hud-container').style.display === 'none'")
        assert is_hidden_esc, "HUD did not close on Escape key!"
        print("PASS 6: Escape key closes HUD!")

        # 7. Test Clicking Floating Badge to Toggle
        badge = page.wait_for_selector("#snowy-wifi-badge")
        badge.click()
        time.sleep(0.3)
        is_open_badge = page.evaluate("() => document.getElementById('snowy-wifi-hud-container').style.display === 'flex'")
        assert is_open_badge, "Badge click did not open HUD!"
        print("PASS 7: Floating badge click works!")

        print("\nALL 7 INTERACTION TESTS PASSED 100%!")
        browser.close()

if __name__ == "__main__":
    # Start a quick server on port 4173 if needed
    import subprocess, socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('127.0.0.1', 4173))
    sock.close()
    srv = None
    if result != 0:
        srv = subprocess.Popen(["python", "-m", "http.server", "4173", "--directory", "docs"])
        time.sleep(1)

    try:
        test_hud_interactions()
    finally:
        if srv:
            srv.terminate()
