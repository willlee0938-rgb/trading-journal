"""Browser regressions. Run against a static server with Python Playwright installed.

BASE_URL defaults to http://127.0.0.1:8000/trading-journal/.
CHROMIUM_BIN defaults to /usr/bin/chromium.
"""
import os
import unittest
from urllib.parse import parse_qs, urlparse

from playwright.sync_api import sync_playwright


class AssistantTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(
            executable_path=os.getenv('CHROMIUM_BIN', '/usr/bin/chromium'),
            args=['--no-sandbox'],
        )

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        self.context = self.browser.new_context()
        self.page = self.context.new_page()
        self.errors = []
        self.page.on('pageerror', lambda error: self.errors.append(str(error)))
        response = self.page.goto(os.getenv('BASE_URL', 'http://127.0.0.1:8000/trading-journal/'), wait_until='networkidle')
        self.assertTrue(response.ok)
        self.page.wait_for_selector('#aiAssistantToggle', state='visible')

    def tearDown(self):
        self.context.close()
        self.assertEqual(self.errors, [])

    def open_assistant(self):
        self.page.locator('#aiAssistantToggle').click()
        self.assertTrue(self.page.locator('#aiAssistantQuestion').evaluate('(e) => e === document.activeElement'))

    def test_dashboard_and_images_unchanged(self):
        page = self.page
        page.wait_for_function('document.querySelector("#heroPrimaryImage").naturalWidth > 0')
        for image in page.locator('#evidenceGallery img').all():
            image.scroll_into_view_if_needed()
            image.evaluate('(e) => e.loading = "eager"')
        page.wait_for_function('[...document.querySelectorAll("#evidenceGallery img")].every(e => e.complete && e.naturalWidth > 0)')
        self.assertEqual(page.locator('#evidenceGallery img').count(), 9)
        self.assertEqual(page.locator('.logic-step').count(), 4)
        self.assertTrue(page.locator('.event-card').is_visible())
        self.assertIn('FOMC', page.locator('.event-card').inner_text())
        before = page.locator('#dashboard').inner_html()
        self.open_assistant()
        page.locator('#aiAssistantQuestion').fill('請檢視失效條件')
        page.locator('#aiAssistantClose').click()
        self.assertEqual(page.locator('#dashboard').inner_html(), before)
        page.locator('#primaryAnalysisCard').click()
        self.assertTrue(page.locator('#imageDialog').evaluate('(e) => e.open'))

    def test_prompt_and_real_new_tab_navigation(self):
        self.open_assistant()
        page = self.page
        # Empty questions must not navigate.
        page.locator('#aiAssistantOpen').click()
        self.assertIn('請先輸入', page.locator('#aiAssistantStatus').inner_text())
        question = '跌破 80,800？ & 反彈 #風險 + 條件'
        page.locator('#aiAssistantQuestion').fill(question)
        expected = page.evaluate('getLatestEntry()')
        href = page.locator('#aiAssistantOpen').get_attribute('href')
        prompt = parse_qs(urlparse(href).query)['q'][0]
        for value in [expected['thesis'], expected['levels'], expected['invalidation'], question]:
            self.assertIn(value, prompt)
        self.assertEqual(prompt, page.locator('#aiAssistantPrompt').input_value())
        self.assertIn('本頁不會產生即時 AI 回覆', page.locator('#aiAssistantNotice').inner_text())
        # Verify navigation and URL without sending test data to ChatGPT.
        self.context.route('https://chatgpt.com/**', lambda route: route.fulfill(status=200, body='Navigation test only'))
        with page.expect_popup() as popup_info:
            page.locator('#aiAssistantOpen').click()
        popup = popup_info.value
        popup.wait_for_load_state()
        self.assertEqual(parse_qs(urlparse(popup.url).query)['q'][0], prompt)
        self.assertTrue(popup.evaluate('window.opener === null'))

    def test_latest_entry_and_copy(self):
        self.open_assistant()
        page = self.page
        page.locator('#aiAssistantClose').click()
        page.locator('#newEntryBtn').click()
        values = {'title': '最新劇本 <script>test</script>', 'datetime': '2099-01-01T12:00', 'thesis': '新的核心邏輯', 'levels': '100 / 200', 'invalidation': '跌破 100'}
        for name, value in values.items():
            page.locator(f'#entryForm [name={name}]').fill(value)
        page.locator('#saveEntryBtn').click()
        self.open_assistant()
        page.locator('#aiAssistantQuestion').fill('我的新問題')
        self.assertEqual(page.locator('#aiAssistantEntry').inner_text(), values['title'])
        for name in ['thesis', 'levels', 'invalidation']:
            self.assertIn(values[name], page.locator('#aiAssistantPrompt').input_value())
        page.evaluate('''() => { window.copied = ''; Object.defineProperty(navigator, 'clipboard', {configurable:true, value:{writeText: async value => {window.copied = value;}}}); }''')
        page.locator('#aiAssistantCopy').click()
        self.assertEqual(page.evaluate('window.copied'), page.locator('#aiAssistantPrompt').input_value())
        page.evaluate('Object.defineProperty(navigator, "clipboard", {value: undefined})')
        page.locator('#aiAssistantCopy').click()
        self.assertTrue(page.locator('.ai-preview').evaluate('(e) => e.open'))
        self.assertIn('無法自動複製', page.locator('#aiAssistantStatus').inner_text())
        self.assertEqual(page.locator('#aiAssistantPrompt').evaluate('(e) => e.selectionEnd - e.selectionStart'), len(page.locator('#aiAssistantPrompt').input_value()))

    def test_long_context_is_not_truncated(self):
        self.page.evaluate('entries.unshift({title:"Long", thesis:"完整邏輯".repeat(3000), levels:"100", invalidation:"200"})')
        self.open_assistant()
        self.page.locator('#aiAssistantQuestion').fill('檢查')
        self.assertEqual(self.page.locator('#aiAssistantOpen').get_attribute('href'), 'https://chatgpt.com/')
        self.assertIn('完整邏輯' * 3000, self.page.locator('#aiAssistantPrompt').input_value())

    def test_mobile_layout_and_keyboard_close(self):
        page = self.page
        for width, height in [(1440, 900), (390, 844), (320, 568), (844, 390)]:
            with self.subTest(viewport=(width, height)):
                page.set_viewport_size({'width': width, 'height': height})
                self.open_assistant()
                box = page.locator('#aiAssistantPanel').bounding_box()
                self.assertGreaterEqual(box['x'], 0)
                self.assertGreaterEqual(box['y'], 0)
                self.assertLessEqual(box['x'] + box['width'], width)
                self.assertLessEqual(box['y'] + box['height'], height)
                if width <= 760:
                    button = page.locator('#aiAssistantToggle').bounding_box()
                    nav = page.locator('.sidebar').bounding_box()
                    self.assertLessEqual(button['y'] + button['height'], nav['y'])
                page.locator('#aiAssistantQuestion').fill('手機問題')
                page.locator('#aiAssistantOpen').scroll_into_view_if_needed()
                self.assertTrue(page.locator('#aiAssistantOpen').is_visible())
                page.keyboard.press('Escape')
                self.assertFalse(page.locator('#aiAssistantPanel').is_visible())
                self.assertEqual(page.locator('#aiAssistantToggle').get_attribute('aria-expanded'), 'false')


if __name__ == '__main__':
    unittest.main(verbosity=2)
