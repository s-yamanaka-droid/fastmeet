// Now on AIr (https://s-yamanaka-droid.github.io/nowonair/) から
// 今日のAIニュース TOP 5 を server-side で取得する。
//
// 構造:
//   /news/YYYY-MM-DD/ ページに 5記事固定
//   topic-1 〜 topic-5 のセクションに h2 タイトル

export type NewsItem = {
  rank: number;
  title: string;
  url: string;
  image?: string;
};

function getJSTDateString(d = new Date()): string {
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10); // YYYY-MM-DD
}

export async function getTodayNews(): Promise<{ date: string; items: NewsItem[] }> {
  const today = getJSTDateString();
  const base = "https://s-yamanaka-droid.github.io/nowonair";
  const url = `${base}/news/${today}/`;

  let html = "";
  try {
    const res = await Promise.race([
      fetch(url, { next: { revalidate: 1800 } }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("News fetch timeout")), 3500)
      ),
    ]);
    if (!res.ok) {
      // 今日のニュースがなければ昨日にフォールバック
      const yesterday = getJSTDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));
      const fallbackRes = await fetch(`${base}/news/${yesterday}/`, { next: { revalidate: 1800 } });
      if (!fallbackRes.ok) return { date: today, items: [] };
      html = await fallbackRes.text();
      return parse(html, base, yesterday);
    }
    html = await res.text();
  } catch {
    return { date: today, items: [] };
  }

  return parse(html, base, today);
}

function parse(html: string, base: string, date: string): { date: string; items: NewsItem[] } {
  const items: NewsItem[] = [];

  // <div class="daily-topic" id="topic-N">...<h2>TITLE</h2>...<img src="...">
  // シンプルなregexで5件分抽出
  const blockRegex = /<div[^>]*class="daily-topic"[^>]*id="topic-(\d+)"[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>(?:[\s\S]*?<img[^>]*src="([^"]+)")?/g;

  let m;
  while ((m = blockRegex.exec(html)) !== null) {
    const rank = parseInt(m[1], 10);
    const titleRaw = m[2].replace(/<[^>]+>/g, "").trim();
    const imgPath = m[3];
    const url = `${base}/news/${date}/#topic-${rank}`;
    const image = imgPath
      ? imgPath.startsWith("http") ? imgPath : `${base}/news/${date}/${imgPath.replace(/^\.\.\/\.\.\//, "")}`
      : undefined;
    items.push({ rank, title: titleRaw, url, image });
    if (items.length >= 5) break;
  }

  // rankでソート
  items.sort((a, b) => a.rank - b.rank);
  return { date, items };
}
