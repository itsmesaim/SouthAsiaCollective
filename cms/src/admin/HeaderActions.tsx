// Always-visible links in the top bar of the admin: the public site and sign out
export const HeaderActions = () => (
  <div className="sac-actions">
    <a href={process.env.SITE_URL || 'http://localhost:3001'} target="_blank" rel="noopener noreferrer">
      View site
    </a>
    <a className="out" href="/admin/logout">
      Sign out
    </a>
  </div>
)
