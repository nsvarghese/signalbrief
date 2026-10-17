import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { BriefView } from '../components/BriefView'
import { example } from '../domain/example'
import { seo } from '../seo'

export default function Landing() {
  return <><Seo {...seo} path="/" /><div data-testid="static-landing" className="landing">
    <header className="landing-nav"><Link to="/" className="brand">SignalBrief<span className="brand-dot">●</span></Link><span>ACCOUNT RESEARCH / HUMAN JUDGMENT</span><Link to="/home" className="sb-button">Open workspace ↗</Link></header>
    <main className="landing-grid"><div className="landing-intro"><div className="eyebrow">A BETTER FIRST CONVERSATION</div><h1>Know the account.<br/>Show your work.</h1><p>Turn a company domain into a focused GTM brief: fit against your criteria, a possible outreach trigger, and the sources behind the story.</p><Link to="/home" className="sb-button primary">Research an account ↗</Link><p className="fineprint">Built by Nathan Varghese on DeepSpace.<br/>Exa discovery · Firecrawl extraction · Claude synthesis</p><div className="method-note"><span>THE METHOD</span><ol><li>Find company-owned evidence.</li><li>Assess fit and flag what’s unknown.</li><li>Review, edit, and save your brief.</li></ol></div></div><div><BriefView {...example} sample /></div></main>
    <footer className="landing-footer">A focused build exercise. No automated outreach. No employer or client data.</footer>
  </div></>
}
