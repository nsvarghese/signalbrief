/* home pattern: search-first — account research form and saved briefs beside the evidence document */
import { useState, type FormEvent } from 'react'
import { AuthOverlay, getAuthToken, useAuthProfileReady, useMutations, useQuery } from 'deepspace'
import { BriefView } from '../../components/BriefView'
import { requestSchema, type Evidence, type Report } from '../../domain/brief'
import { example } from '../../domain/example'

type BriefData = { domain: string; seller: string; criteriaJson: string; sourcesJson: string; reportJson: string; draft: string; warningsJson: string }
async function action(name: string, params: unknown): Promise<{ recordId: string }> {
  const token = await getAuthToken()
  if (!token) throw new Error('Sign in again to continue. Your saved briefs are safe.')
  const response = await fetch(`/api/actions/${name}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(params) })
  const body = await response.json() as { success?: boolean; error?: string; data: { recordId: string } }
  if (!response.ok || !body.success) throw new Error(body.error ?? 'This step could not finish. Please retry.')
  return body.data
}

export default function HomePage() {
  const { isSignedIn } = useAuthProfileReady({ requireUser: true })
  const { records, status } = useQuery<BriefData>('briefs', { orderBy: 'createdAt', orderDir: 'desc', limit: 50 })
  const { putConfirmed, ready } = useMutations<BriefData>('briefs')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showSample, setShowSample] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [domain, setDomain] = useState('')
  const [seller, setSeller] = useState('We help technical teams make customer onboarding repeatable with shared deployment checklists.')
  const [criteriaText, setCriteriaText] = useState('Sells B2B software\nHas a technical customer deployment\nHas evidence of product expansion')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editedDraft, setEditedDraft] = useState<string | null>(null)
  const selected = records.find(record => record.recordId === selectedId)
  const data = selected?.data
  const parsed = (() => { try { return data ? { criteria: JSON.parse(data.criteriaJson) as string[], sources: JSON.parse(data.sourcesJson) as Evidence[], report: data.reportJson ? JSON.parse(data.reportJson) as Report : null, warnings: JSON.parse(data.warningsJson) as string[] } : null } catch { return null } })()

  async function synthesize(recordId: string) {
    setBusy('Writing a source-backed brief…'); setError('')
    try { await action('synthesize', { recordId }); setNotice('Analysis saved. Check the evidence and edit the opening message.'); setEditedDraft(null) }
    catch (err) { setError(err instanceof Error ? err.message : 'Analysis failed. Your evidence is saved.') }
    finally { setBusy('') }
  }
  async function research(event: FormEvent) {
    event.preventDefault(); setError(''); setNotice('')
    if (!isSignedIn) { setShowAuth(true); return }
    const input = requestSchema.safeParse({ domain, seller, criteria: criteriaText.split('\n').map(value => value.trim()).filter(Boolean) })
    if (!input.success) { setError(input.error.issues[0]?.message ?? 'Check the research inputs.'); return }
    setBusy('Finding and extracting company evidence…'); setShowSample(false)
    try { const result = await action('research', input.data); setSelectedId(result.recordId); setEditedDraft(null); await synthesize(result.recordId) }
    catch (err) { setError(err instanceof Error ? err.message : 'Research failed. Please try again.'); setBusy('') }
  }
  async function saveDraft() {
    if (!selectedId || editedDraft === null) return
    setBusy('Saving edits…'); setError(''); setNotice('')
    try { await putConfirmed(selectedId, { draft: editedDraft }); setNotice('Your edits are saved.'); setEditedDraft(null) }
    catch { setError('Your edits could not be confirmed. Keep this page open and try again.') }
    finally { setBusy('') }
  }
  function select(id: string) {
    if (editedDraft !== null && !window.confirm('Leave your unsaved message edits?')) return
    setSelectedId(id); setEditedDraft(null); setShowSample(false); setError(''); setNotice('')
  }
  return <div className="workspace">
    <aside className="research-panel">
      <div className="eyebrow">THE RESEARCH DESK</div><h1>Find your reason<br/>to reach out.</h1><p className="panel-intro">One account. Clear fit. Evidence you can inspect.</p>
      <form onSubmit={research}>
        <label htmlFor="domain">Company domain</label><input id="domain" placeholder="acme.com" autoComplete="off" value={domain} onChange={event => setDomain(event.target.value)} maxLength={300} required />
        <label htmlFor="seller">What do you sell?</label><textarea id="seller" value={seller} onChange={event => setSeller(event.target.value)} rows={4} minLength={20} maxLength={1200} required />
        <label htmlFor="criteria">Fit criteria <span>1–3, one per line</span></label><textarea id="criteria" value={criteriaText} onChange={event => setCriteriaText(event.target.value)} rows={4} maxLength={550} required />
        <button className="sb-button primary" type="submit" disabled={!!busy || (isSignedIn && !ready)}>{busy || (isSignedIn ? 'Research account ↗' : 'Sign in to research ↗')}</button>
        <p className="fineprint">Uses Exa, Firecrawl, and Claude through DeepSpace. Demo allowance: 3 research runs and 6 analyses per user per UTC day, within an app-wide cap.</p>
      </form>
      <button className="text-button" disabled={!!busy} onClick={() => { setShowSample(true); setSelectedId(null); setEditedDraft(null) }}>Explore the fictional example →</button>
      <div className="saved-heading"><h2>Saved briefs</h2><span>{isSignedIn ? records.length : '—'}</span></div>
      {!isSignedIn ? <p className="fineprint">Sign in to keep a private research notebook.</p> : status === 'loading' ? <p role="status">Loading your notebook…</p> : records.length === 0 ? <p className="fineprint">Your first account brief will appear here. Enter a domain above to begin.</p> : <ul className="saved-list">{records.map(record => <li key={record.recordId}><button disabled={!!busy} aria-pressed={record.recordId === selectedId} onClick={() => select(record.recordId)}><strong>{record.data.domain}</strong><span>{record.data.reportJson ? 'Brief ready' : 'Evidence saved · analysis pending'}</span></button></li>)}</ul>}
    </aside>
    <div className="document-panel">
      <div aria-live="polite" className="feedback">{busy && <p className="progress" role="status">{busy} <span>This can take a minute. Keep this page open.</span></p>}{error && <p role="alert" className="error-note">{error}</p>}{notice && <p className="success-note">{notice}</p>}</div>
      {showSample || !isSignedIn ? <BriefView {...example} sample /> : data && parsed ? <>
        {parsed.warnings.map(warning => <p className="warning-note" key={warning}>{warning}</p>)}
        {!parsed.report && <button className="sb-button" disabled={!!busy} onClick={() => synthesize(selected.recordId)}>Generate analysis from saved evidence</button>}
        <BriefView key={selectedId} domain={data.domain} {...parsed} draft={editedDraft ?? data.draft} onDraftChange={setEditedDraft} onSave={editedDraft !== null && ready ? saveDraft : undefined} saving={!!busy} />
      </> : selectedId ? <p role="status">Loading saved evidence…</p> : <div className="desk-empty"><div className="eyebrow">YOUR NEXT CONVERSATION STARTS HERE</div><h2>Build a brief you<br/>can stand behind.</h2><p>Research a company to see its product, fit against your criteria, possible outreach trigger, and the evidence behind each claim.</p><button className="sb-button secondary" onClick={() => setShowSample(true)}>See a fictional example</button></div>}
    </div>
    {showAuth && <AuthOverlay onClose={() => setShowAuth(false)} />}
  </div>
}

