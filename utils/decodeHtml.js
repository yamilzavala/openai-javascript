export default function decodeHtml(html) {
    return html
      .replace(/&amp;#39;/g, "'")  // special case that appears a lot
      .replace(/&#39;/g, "'")     // simple quote
      .replace(/&quot;/g, '"')    // doble quote
      .replace(/&amp;/g, "&");    // ampersand
  }