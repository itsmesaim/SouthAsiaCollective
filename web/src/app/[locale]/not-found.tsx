import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="band">
      <div className="w narrow">
        <h1 style={{ fontSize: 'clamp(3rem,10vw,7rem)' }}>404</h1>
        <p style={{ margin: '12px 0 24px' }}>This page is not here. It may have moved.</p>
        <Link className="btn" href="/en">
          South Asia Collective
        </Link>
      </div>
    </section>
  )
}
