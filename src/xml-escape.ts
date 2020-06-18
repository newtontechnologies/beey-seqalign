const escape: { [index: string]: string } = {
    '"': '&quot;',
    '\'': '&apos;',
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
  };

  const unescape: { [index: string]: string } = {
    '&quot;': '"',
    '&apos;': '\'',
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
  };

  const ESCAPE_REGEX = new RegExp(Object.keys(escape).join('|'), 'g');
  const UNESCAPE_REGEX = new RegExp(Object.keys(unescape).join('|'), 'g');

  export const escapeXMLString = (str: string) => str.replace(
    ESCAPE_REGEX, (match: string) => escape[match],
  );

  export const unescapeXMLString = (str: string) => str.replace(
    UNESCAPE_REGEX, (match: string) => unescape[match],
  );
