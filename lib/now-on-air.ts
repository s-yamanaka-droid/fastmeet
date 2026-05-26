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
  const base = "https://s-yamanaka-droid.github.io/nowonair";
  // 今日〜7日前まで順にトライ（土日・更新遅延対応）
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const targetDate = getJSTDateString(
      new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000)
    );
    const url = `${base}/news/${targetDate}/`;
    try {
      const res = await Promise.race([
        fetch(url, { cache: "no-store" }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 3500)
        ),
      ]);
      if (!res.ok) continue;
      const html = await res.text();
      const parsed = parse(html, base, targetDate);
      if (parsed.items.length > 0) return parsed;
    } catch {
      continue;
    }
  }
  return { date: getJSTDateString(), items: [] };
}

function parse(html: string, base: string, date: string): { date: string; items: NewsItem[] } {
  const items: NewsItem[] = [];

  // id="topic-N" から次の <h2> までを取得（要素種別問わず）
  const blockRegex = /id="topic-(\d+)"[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>/g;

  let m;
  while ((m = blockRegex.exec(html)) !== null) {
    const rank = parseInt(m[1], 10);
    const titleRaw = m[2].replace(/<[^>]+>/g, "").trim();
    if (!titleRaw) continue;
    items.push({
      rank,
      title: titleRaw,
      url: `${base}/news/${date}/#topic-${rank}`,
    });
    if (items.length >= 5) break;
  }

  items.sort((a, b) => a.rank - b.rank);
  return { date, items };
}
