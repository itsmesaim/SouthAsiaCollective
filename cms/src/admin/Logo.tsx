// Shown on the login screen and in the admin header
export const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
    <img src="/logo.png" alt="" width={64} height={64} style={{ borderRadius: '50%' }} />
    <div style={{ lineHeight: 1.05 }}>
      <div
        style={{
          font: '800 26px "Bricolage Grotesque Variable", "Schibsted Grotesk Variable", sans-serif',
          textTransform: 'uppercase',
        }}
      >
        South Asia Collective
      </div>
      <div style={{ fontSize: 13, opacity: 0.7 }}>Content studio</div>
    </div>
  </div>
)

export const Icon = () => <img src="/logo.png" alt="" width={28} height={28} style={{ borderRadius: '50%' }} />
