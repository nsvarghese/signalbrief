import { test, expect } from '@playwright/test'

test('research action requires authentication and raw paid proxy is closed', async ({ request }) => {
  const action = await request.post('/api/actions/research', { data: { domain: 'linear.app' } })
  expect(action.status()).toBe(401)
  const proxy = await request.post('/api/integrations/anthropic/chat-completion', { data: {} })
  expect(proxy.status()).toBe(403)
})

test('fictional preview exposes its evidence and stays usable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.getByText('Fictional company and authored evidence.', { exact: false })).toBeVisible()
  await page.locator('#source-S1 summary').click()
  await expect(page.locator('#source-S1 pre')).toContainText('workflow software')
  const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  expect(overflows).toBe(false)
  await page.screenshot({ path: '.deepspace/mobile-preview.png', fullPage: true })
})
