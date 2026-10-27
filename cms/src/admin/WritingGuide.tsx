'use client'

import { useFormFields } from '@payloadcms/ui'
import { useState } from 'react'

// Hints and a copy-paste starter for each kind of post, shown at the top of the form. Edit the text here.
type Guide = { hints: string[]; template: string }

const POSTS: Record<string, Guide> = {
  blog: {
    hints: [
      'A blog is the full story of what we did and why. Aim for 400-900 words, in short paragraphs.',
      'Open with the single most important thing in one or two sentences. Say who, what, where, when.',
      'Use plain words. One idea per paragraph. Write "we" for the collective and "you" for the reader.',
      'Add photos from the day: click + in the editor and choose Upload. Add a caption saying who or what is shown.',
      'Link every claim to its source (select the words, click the chain icon). Name people only with their consent.',
      'End with what happens next and one clear action: come to the next event, share, sign up.',
      'Write it in English. Other languages are translated automatically after you save, so avoid slang and idioms that do not translate.',
    ],
    template: `[Opening: one or two sentences. What happened, where, when, and why it matters.]

What happened
[The story in the order it happened. Short paragraphs. Include numbers (how many people, how long) where you have them.]

Why we did it
[The reason, the people affected, the background in two or three sentences.]

In their words
[A short quote from someone who was there, with their name or "a protester who asked not to be named".]

What comes next
[Next event or step, with the date and place.]

How you can help
[One clear action: join us, share, donate, sign.]`,
  },
  news: {
    hints: [
      'News is a short update: 80-200 words. Put the key fact in the first sentence.',
      'Give the date, time and place. Say what is new since the last update.',
      'Use the excerpt as the one-line version; it shows on cards and in link previews.',
      'Link to the longer blog post or the news article if there is one (pick it under "News articles about this").',
    ],
    template: `[Key fact in one sentence: what is happening, where, when.]

[Two or three sentences of detail: who is involved, what changed.]

[What to do or where to find out more.]`,
  },
  statement: {
    hints: [
      'A statement is our official position and is signed "South Asia Collective". Keep it 150-400 words, calm and factual.',
      'Say what we are responding to, what we believe, and what we demand. No insults, no unverified claims.',
      'Every factual claim needs a source. Have another team member check it before you publish.',
      'Avoid slang and idioms. The text is translated into 13 languages and should stay precise.',
      'Put your name in the draft notes, not in the text: the public byline is the collective.',
    ],
    template: `[Heading: the position in one line.]

We are responding to [event or decision, with date and a link to the source].

What we know
[The verified facts, one short paragraph.]

Our position
[What we believe, in plain terms.]

Our demands
1. [Specific, achievable demand.]
2. [Specific, achievable demand.]

[Closing line: how people can stand with us.]`,
  },
}

const TEAM: Guide = {
  hints: [
    "Photo: a clear, square-ish head and shoulders photo. It turns from black and white to colour when hovered. Only add a photo with the person's consent.",
    'Role: a few words, e.g. "Founder, program management".',
    'Summary: one or two sentences in the first person for the card, e.g. "I help turn protests into a lasting organisation."',
    'Bio: the full story, 80-200 words: why you joined, what you do, what you hope for. Short paragraphs.',
    'Social links: add only accounts the person wants public. Each one becomes a button on their page.',
    'Never add home addresses, phone numbers or private emails.',
  ],
  template: `[Why I got involved: one or two sentences.]

[What I do in the collective.]

[What I hope we achieve.]`,
}

const Box = ({ guide }: { guide: Guide }) => {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(guide.template)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy the template:', guide.template)
    }
  }
  return (
    <details style={{ border: '1px solid var(--theme-elevation-150)', padding: '12px 16px', marginBottom: 24 }} open>
      <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Writing tips and starter template</summary>
      <ul style={{ margin: '12px 0', paddingInlineStart: 20 }}>
        {guide.hints.map((h) => (
          <li key={h} style={{ marginBottom: 6 }}>
            {h}
          </li>
        ))}
      </ul>
      <pre style={{ whiteSpace: 'pre-wrap', background: 'var(--theme-elevation-50)', padding: 12, fontSize: 13 }}>
        {guide.template}
      </pre>
      <button type="button" className="btn btn--style-secondary btn--size-small" onClick={copy}>
        {copied ? 'Copied. Paste it into the text box.' : 'Copy template'}
      </button>
    </details>
  )
}

export const PostGuide = () => {
  const type = useFormFields(([f]) => f.type?.value as string | undefined)
  return <Box guide={POSTS[type ?? 'blog'] ?? POSTS.blog} />
}

export const TeamGuide = () => <Box guide={TEAM} />
