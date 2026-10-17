import { test, expect } from 'deepspace/testing'

// Explicit opt-in: one real research pipeline bills existing owner credits.
// Ordinary suite runs test auth/UI without spending credits.
test('live research persists edits and stays private across two users', async ({ users }) => {
  test.skip(process.env.SIGNALBRIEF_LIVE_TEST !== '1', 'Set SIGNALBRIEF_LIVE_TEST=1 for one live three-provider verification.')
  test.setTimeout(180_000)
  const [alice, bob] = await users(2)
  await Promise.all([alice.page.goto('/home'), bob.page.goto('/home')])
  await expect(alice.page.getByRole('button', { name: 'Research account ↗', exact: true })).toBeEnabled()
  // The input transform must show an error rather than reject the event handler.
  await alice.page.getByLabel('Company domain').fill('localhost')
  await alice.page.getByRole('button', { name: 'Research account ↗', exact: true }).click()
  await expect(alice.page.getByRole('alert')).toContainText('public company domain')
  await alice.page.getByLabel('Company domain').fill('linear.app')
  const researchResponse = alice.page.waitForResponse(response => response.url().endsWith('/api/actions/research'))
  await alice.page.getByRole('button', { name: 'Research account ↗', exact: true }).click()
  const response = await researchResponse
  const result = await response.json()
  expect(result.success, result.error).toBe(true)
  const recordId = result.data.recordId as string
  try {
    await expect(alice.page.locator('.success-note')).toContainText('Analysis saved.', { timeout: 120_000 })
    await expect(alice.page.getByLabel('Account brief')).toContainText('linear.app')
    // Regression for a real output review: missing onboarding evidence is not a contradiction.
    await expect(alice.page.locator('.assessment').nth(1).locator('.verdict')).toHaveText(/supported|unclear/)
    await expect(alice.page.locator('.brief-paper section').first()).not.toContainText(/seller.s claim|seller.s description/i)
    await expect(alice.page.locator('.source')).not.toHaveCount(0)
    const draft = `__test-${Date.now()}__ My personally reviewed opening message.`
    await alice.page.getByLabel('Edit opening message').fill(draft)
    await alice.page.getByRole('button', { name: 'Save edits', exact: true }).click()
    await expect(alice.page.locator('.success-note')).toContainText('Your edits are saved.')
    await alice.page.reload()
    await alice.page.locator('.saved-list button').filter({ hasText: 'linear.app' }).first().click()
    await expect(alice.page.getByLabel('Edit opening message')).toHaveValue(draft)
    await expect(bob.page.locator('.research-panel')).not.toContainText('linear.app')
    const denied = await bob.page.evaluate(async (id) => {
      const { token } = await (await fetch('/api/auth/token', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' } })).json()
      return (await fetch('/api/actions/synthesize', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ recordId: id }) })).json()
    }, recordId)
    expect(denied.success).toBe(false)
    expect(denied.error).toContain('access denied')
    await alice.page.screenshot({ path: '.deepspace/live-brief.png', fullPage: true })
  } finally {
    alice.page.once('dialog', dialog => dialog.accept())
    const remove = alice.page.getByRole('button', { name: 'Delete brief', exact: true })
    if (await remove.isVisible()) await remove.click()
  }
})


