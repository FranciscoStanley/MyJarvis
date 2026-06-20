/** Extrai ID do YouTube a partir de URLs comuns. */
export function getYoutubeVideoId(url: string): string | null {
  const patterns = [
    /(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function getYoutubeEmbedUrl(url: string): string | null {
  const id = getYoutubeVideoId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}
