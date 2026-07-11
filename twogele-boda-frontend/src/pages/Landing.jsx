import { Link } from 'react-router-dom'
import kampalaHero from '../assets/stitch/kampala-boda.png'
import { BrandLogo } from '../components/BrandLogo'
import { Icon } from '../components/Icon'
import { useLanguage } from '../i18n/LanguageContext'
import '../styles/marketing.css'

const FEATURES = [
  {
    title: 'Road danger help',
    body: 'Tell us about a bad road or accident. We help you know who to call.',
    icon: 'emergency_share',
    tone: 'danger',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjbxuZWfZ8Q0NsVEH3HW-vErvKKNupcTTiWyW1xGykMXTHqq74MgzCnqp7gBQcz1frHEp_k7Dk2YGwRvTqiWWtnIOEv2cUIYWrRoJsltk2fGNtV3OIjSUGO7SaVpQbWmCxg8ZmEhtfWb20Q1xB4H-Zx02zJ_YoqbSNvZUnvdWpYRnwNkmG9pgOAr4wRg33imiuYtleOpR6MD8CVNdEVTw-oXM_emBMMI4gtXGMrcPY8LORdOH591j4',
  },
  {
    title: 'Your money',
    body: 'Track fuel, tips, and money you keep — in simple numbers.',
    icon: 'monitoring',
    tone: 'money',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQtpS3vKMiC7TZofRVPaiqv1rGY5AqhaowOdPtu2_fRx2Gn83V9HvJJxa1wWUAeyKVb_spGs_n6hAV1TUlDv316tHFG7PNGxr78VkL08jkRUb6Vq9WqQpR4f8PtqIDkMQVMAtTJ5L-E-6YuBDpbVS5EVCyF4_50bgN1GMXyD0GDN5Wgvx-S5QQW4ggYBv_RFurOrbOtFR-SroK_DNGOjRKsYVBvb5vkmE7otivfP1rqmxIKIpMWuko',
  },
  {
    title: 'Save & grow',
    body: 'Save for a new bike and see easy ways to grow your money.',
    icon: 'savings',
    tone: 'save',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRtPt_zgtOzw3elWr-bVYlpaL31Fi2JFsIZuT_Fp0e77Eog9ni01i1unbuGgL9xsvmzk3blPE4zDrOx62LX5VW1svfc7ND667msB4clYF-iWxXTTRxVFWG1lHHotde5dL9RqvH9GVc0dJPz2MVEw2uqWtYykovJBiomKb1eDrZbB4jcYbNY5EUS2IBrSIBYGAeuNG6VxiuTGIGztxiUoWLCh3RmtpCO7PhEzXq5qhEHPe5rw9i3mbw',
  },
]

export default function Landing() {
  const { t, language, setLanguage, languages } = useLanguage()

  return (
    <div className="mkt">
      <header className="mkt-nav">
        <BrandLogo className="mkt-brand" label={t('brand')} />
        <nav className="mkt-nav-links" aria-label="Page">
          <a href="#features">Features</a>
          <a href="#safety">Safety</a>
          <a href="#join">Join</a>
        </nav>
        <div className="mkt-nav-actions">
          <label className="mkt-lang" htmlFor="landing-lang">
            <Icon name="translate" />
            <select
              id="landing-lang"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label={t('chooseLanguage')}
            >
              {languages.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.native}
                </option>
              ))}
            </select>
          </label>
          <Link className="mkt-btn mkt-btn-ghost" to="/login">
            {t('login')}
          </Link>
          <Link className="mkt-btn mkt-btn-primary" to="/signup">
            {t('signup')}
          </Link>
        </div>
      </header>

      <section className="mkt-hero">
        <div className="mkt-hero-media">
          <img src={kampalaHero} alt="Kampala boda rider on the road" />
        </div>
        <div className="mkt-hero-copy">
          <div className="mkt-pill">
            <Icon name="verified" />
            Now in Kampala
          </div>
          <h1>{t('helpRoadMoney')}</h1>
          <p>{t('simpleHelp')}</p>
          <div className="mkt-cta-row">
            <Link className="mkt-btn mkt-btn-primary mkt-btn-xl" to="/signup">
              {t('joinFree')}
              <Icon name="trending_flat" />
            </Link>
            <Link className="mkt-btn mkt-btn-outline mkt-btn-xl" to="/login">
              {t('alreadyAccount')}
            </Link>
          </div>
        </div>
      </section>

      <section className="mkt-section" id="features">
        <h2>Inside the app</h2>
        <div className="mkt-rule" />
        <div className="mkt-cards">
          {FEATURES.map((item) => (
            <article className="mkt-card" key={item.title}>
              <div className={`mkt-card-icon ${item.tone}`}>
                <Icon name={item.icon} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <img src={item.img} alt="" />
            </article>
          ))}
        </div>
      </section>

      <section className="mkt-section" id="safety">
        <div className="mkt-split">
          <div>
            <h2>Safety first</h2>
            <div className="mkt-rule" />
            <p>
              Kampala roads change fast. Tell Twogele about a pothole, jam, or accident — we point
              you to help.
            </p>
            <ul className="mkt-list">
              <li>
                <div className="mkt-list-icon danger" style={{ background: '#ffdad6', color: '#93000a' }}>
                  <Icon name="emergency" />
                </div>
                <div>
                  <strong>Quick danger alerts</strong>
                  <p>One message to get guidance and who to call.</p>
                </div>
              </li>
              <li>
                <div className="mkt-list-icon money" style={{ background: '#feb28f', color: '#794227' }}>
                  <Icon name="map" />
                </div>
                <div>
                  <strong>Danger map</strong>
                  <p>See busy places and problem spots around the city.</p>
                </div>
              </li>
              <li>
                <div className="mkt-list-icon save" style={{ background: '#bab189', color: '#4a4424' }}>
                  <Icon name="policy" />
                </div>
                <div>
                  <strong>Who can help</strong>
                  <p>Police, KCCA, or ambulance — clear next steps.</p>
                </div>
              </li>
            </ul>
          </div>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB18cvjIYzV70CmqzUXKhZgXa20pt_osvHT_aGPKD4AuLLvPWckqFYpFQDeKBkKfd5CbmRFEq0D7of8LCIWEuCW7N3omtsrwBPzKPql9Po-AprlnJ1rvpAD2cnAaVdZxDTtgrYfUdHu2fX29y9BuoLweCrGZVKh9ra6t8ORQPZhszm-B81x_D2BsrGXB2LGZd-cZ08vLGTRobkO3QJ1oCFU6vTD6A7VDRi5iHd9izLrTDQ9uw0X2uB0"
            alt="Safety monitoring"
          />
        </div>
      </section>

      <section className="mkt-band" id="join">
        <div className="mkt-band-inner">
          <div>
            <h2>Ready to start?</h2>
            <p>
              Join riders in Kampala who use Twogele for road help and daily money tracking.
            </p>
            <div className="mkt-check">
              <Icon name="check_circle" filled />
              Free to join
            </div>
            <div className="mkt-check">
              <Icon name="check_circle" filled />
              Works with typing or voice
            </div>
            <div className="mkt-check">
              <Icon name="check_circle" filled />
              Built for Build with Gemma Uganda
            </div>
          </div>
          <div className="mkt-mini-card">
            <p style={{ marginTop: 0, color: 'var(--m-muted)' }}>Create your rider account</p>
            <Link className="mkt-btn mkt-btn-primary mkt-btn-block mkt-btn-xl" to="/signup">
              Sign up
            </Link>
            <p style={{ textAlign: 'center', marginBottom: 0, marginTop: '1rem', color: 'var(--m-muted)' }}>
              Already joined? <Link to="/login">Log in</Link>
            </p>
          </div>
        </div>
      </section>

      <footer className="mkt-footer">
        <div className="mkt-footer-inner">
          <div>
            <BrandLogo className="mkt-brand" label={t('brand')} />
            <p>Made for Kampala boda riders.</p>
          </div>
          <div className="mkt-footer-links">
            <Link to="/login">Log in</Link>
            <Link to="/signup">Sign up</Link>
            <a href="https://twogele-boda-backend.onrender.com/" target="_blank" rel="noreferrer">
              API status
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
