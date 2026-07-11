import { Link } from 'react-router-dom'

/**
 * Shared Twogele brand mark (same logo as favicon / official portal identity).
 */
export function BrandLogo({
  to = '/',
  label = 'Twogele Boda',
  className = 'brand-logo',
}) {
  return (
    <Link className={className} to={to} aria-label={label}>
      <img className="brand-logo-mark" src="/favicon.svg" alt="" width={32} height={32} />
      <span>{label}</span>
    </Link>
  )
}
