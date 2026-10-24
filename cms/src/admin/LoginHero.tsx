// Shown above the sign-in form: a welcome and a way back to the public site
export const LoginHero = () => (
  <div className="sac-login-hero">
    <h1>Welcome back</h1>
    <p>Sign in to write posts, add events and look after the site.</p>
    <a
      className="sac-login-site"
      href={process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}
    >
      View the main site
    </a>
  </div>
)
