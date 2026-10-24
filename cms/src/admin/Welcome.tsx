import type { AdminViewServerProps } from 'payload'

// Plain-language starting point shown above the dashboard
const Step = ({ href, title, text }: { href: string; title: string; text: string }) => (
  <a href={href} className="sac-step">
    <strong>{title}</strong>
    <span>{text}</span>
  </a>
)

export const Welcome = ({ user }: AdminViewServerProps) => {
  const staff = user?.role === 'admin' || user?.role === 'subadmin'
  return (
    <section className="sac-welcome">
      <h2>Hi {user?.name?.split(' ')[0] ?? 'there'}</h2>
      <p>
        {staff
          ? 'What would you like to do?'
          : 'Write something, save it as a draft, publish when it is ready. You can edit your own posts any time.'}
      </p>
      <div className="sac-steps">
        <Step
          href="/admin/collections/posts/create"
          title="Write a post"
          text="Blog write-up, news update or statement"
        />
        {staff && (
          <Step
            href="/admin/collections/events/create"
            title="Add an event"
            text="Protests and meetups, with a poster to share"
          />
        )}
        <Step
          href="/admin/collections/comments?where[status][equals]=pending"
          title="Review comments"
          text="Approve or reject what readers wrote"
        />
        {staff && (
          <Step
            href="/admin/collections/kits/create"
            title="Write a protest press kit"
            text="One per protest: blurb, statements, photos, news coverage"
          />
        )}
        {staff && (
          <Step
            href="/admin/globals/press-kit"
            title="Logos, facts and contacts"
            text="What stays the same between protests"
          />
        )}
        {staff && (
          <Step href="/admin/collections/team/create" title="Add a team member" text="Show people on the About page" />
        )}
      </div>
    </section>
  )
}
