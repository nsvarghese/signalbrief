import { useState } from 'react'
import { priority, type Evidence, type Report } from '../domain/brief'

export function BriefView({ domain, criteria, sources, report, draft, onDraftChange, onSave, saving = false, sample = false }: {
  domain: string; criteria: string[]; sources: Evidence[]; report: Report | null; draft?: string;
  onDraftChange?: (value: string) => void; onSave?: () => void; saving?: boolean; sample?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const decision = report ? priority(report) : null
  const refs = (ids: string[]) => <span className="refs">{ids.map(id => <a key={id} href={`#source-${id}`} aria-label={`Read source ${id}`}>{id}</a>)}</span>
  async function copy() {
    try { await navigator.clipboard.writeText(draft ?? report?.openingMessage ?? ''); setCopied(true); setCopyError(false) }
    catch { setCopyError(true) }
  }
  return <article className="brief-paper" aria-label="Account brief">
    <div className="paper-mast"><span>ACCOUNT INTELLIGENCE</span><span>{sample ? 'ILLUSTRATIVE SAMPLE' : 'PRIVATE BRIEF'}</span></div>
    <h2>{domain}</h2>
    {sample && <p className="sample-note">Fictional company and authored evidence. This is a product preview, not a live research result.</p>}
    {decision && <div className="decision"><strong>{decision.label}</strong><span>{decision.detail}</span></div>}
    {report ? <>
      <section><h3>The company</h3><p>{report.summary.text} {refs(report.summary.sourceIds)}</p></section>
      <section><h3>Fit against your criteria</h3><div className="assessment-list">{report.assessments.slice().sort((a,b) => a.criterionIndex-b.criterionIndex).map(item => <div className="assessment" key={item.criterionIndex}>
        <div><span className={`verdict ${item.verdict}`}>{item.verdict}</span><strong>{criteria[item.criterionIndex]}</strong></div>
        <p>{item.reason} {refs(item.sourceIds)}</p>
      </div>)}</div></section>
      <section><h3>A possible reason to reach out</h3><p>{report.trigger.text} {refs(report.trigger.sourceIds)}</p></section>
      <section className="draft-section"><div className="section-heading"><h3>Opening message</h3><span>Draft · review before using</span></div>
        {onDraftChange ? <textarea aria-label="Edit opening message" value={draft ?? ''} onChange={event => onDraftChange(event.target.value)} maxLength={2000} rows={6} /> : <p className="draft-copy">{report.openingMessage}</p>}
        <div className="button-row">{onSave && <button className="sb-button" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save edits'}</button>}<button className="sb-button secondary" onClick={copy}>{copied ? 'Copied' : 'Copy draft'}</button></div>
        {copyError && <p role="status">Clipboard access is unavailable. Select the message text to copy it.</p>}
      </section>
      <section><h3>What we still don’t know</h3><ul className="unknowns">{report.unknowns.map(item => <li key={item}>{item}</li>)}</ul></section>
    </> : <div className="evidence-ready"><h3>Evidence is saved</h3><p>Review the sources below, then generate an analysis. If synthesis fails, your research stays here.</p></div>}
    <section><div className="section-heading"><h3>Evidence notebook</h3><span>{sources.length} sources</span></div><p className="fineprint">Company-owned sources. AI interpretations need your review; a citation does not independently verify a claim.</p>
      {sources.map(source => <details className="source" key={source.id} id={`source-${source.id}`}><summary><span className="source-id">{source.id}</span><span>{source.title}<small>{source.kind === 'website' ? 'Website extraction' : 'Search evidence'} · {source.publishedDate ? `Published ${source.publishedDate.slice(0,10)}` : 'Publication date unknown'}</small></span></summary><div className="source-body">{!sample && <a href={source.url} target="_blank" rel="noopener noreferrer">Open source ↗</a>}<p>Retrieved {source.retrievedAt.slice(0,10)}</p><pre>{source.text}</pre></div></details>)}
    </section>
    <footer className="paper-footer">SignalBrief / Evidence first. Judgment stays with you.</footer>
  </article>
}
