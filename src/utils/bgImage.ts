/**
 * Probe image URLs in shuffled order and resolve the first one that loads.
 * Returns null if every URL fails (404, CORS, network error, etc.).
 */
export async function pickRandomLoadableImage(urls: string[]): Promise<string | null> {
  const pool = [...urls];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  for (const url of pool) {
    const ok = await new Promise<boolean>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
    if (ok) return url;
  }
  return null;
}
