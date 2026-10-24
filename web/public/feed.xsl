<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8"/>
  <xsl:template match="/rss/channel">
    <html lang="en">
      <head>
        <meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title><xsl:value-of select="title"/> feed</title>
        <style>
          body{margin:0;background:#000;color:#f6f5f0;font:18px/1.6 system-ui,sans-serif}
          main{max-width:760px;margin:0 auto;padding:40px 20px}
          h1{font-size:2.4rem;margin:0 0 6px}
          .note{background:#ffc21a;color:#000;padding:12px 16px;margin:20px 0 34px;font-weight:600}
          article{background:#f6f5f0;color:#000;padding:18px 22px;margin:0 0 20px;box-shadow:5px 6px 0 rgba(255,90,0,.9)}
          article h2{margin:0 0 6px;font-size:1.3rem} article a{color:#000} article p{margin:6px 0 0;color:#333}
          small{color:#666}
        </style>
      </head>
      <body><main>
        <h1><xsl:value-of select="title"/></h1>
        <p><xsl:value-of select="description"/></p>
        <p class="note">This is a news feed. Copy this page's address into a feed reader (Feedly, NetNewsWire, Inoreader) to get new posts automatically.</p>
        <xsl:for-each select="item">
          <article>
            <h2><a href="{link}"><xsl:value-of select="title"/></a></h2>
            <small><xsl:value-of select="category"/> · <xsl:value-of select="pubDate"/></small>
            <p><xsl:value-of select="description"/></p>
          </article>
        </xsl:for-each>
      </main></body>
    </html>
  </xsl:template>
</xsl:stylesheet>
