import { Publication } from '@/types/publication';

export function parseGitHubRepo(url?: string): { owner: string; repo: string } | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    if (!/^(www\.)?github\.com$/i.test(parsed.hostname)) {
      return null;
    }

    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length < 2) {
      return null;
    }

    return {
      owner: segments[0],
      repo: segments[1].replace(/\.git$/i, ''),
    };
  } catch {
    return null;
  }
}

export function getGitHubStarsBadgeUrl(owner: string, repo: string): string {
  return `https://img.shields.io/github/stars/${owner}/${repo}?style=social&cacheSeconds=86400`;
}

function formatStarCount(count: number): string {
  if (count < 1000) {
    return String(count);
  }

  if (count < 10000) {
    const formatted = (count / 1000).toFixed(1);
    return `${formatted.replace(/\.0$/, '')}k`;
  }

  return `${Math.round(count / 1000)}k`;
}

async function fetchRepoStars(owner: string, repo: string): Promise<string | undefined> {
  try {
    const headers: HeadersInit = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'PRISM-site',
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return undefined;
    }

    const data = await response.json() as { stargazers_count?: number };
    if (typeof data.stargazers_count !== 'number') {
      return undefined;
    }

    return formatStarCount(data.stargazers_count);
  } catch {
    return undefined;
  }
}

export async function enrichPublicationsWithGitHubStars(publications: Publication[]): Promise<Publication[]> {
  const repoEntries = publications
    .map((pub) => ({
      id: pub.id,
      existingStars: pub.stars,
      repoInfo: parseGitHubRepo(pub.code),
    }))
    .filter((entry) => !entry.existingStars && entry.repoInfo);

  const uniqueRepos = new Map<string, { owner: string; repo: string }>();
  for (const entry of repoEntries) {
    const repoInfo = entry.repoInfo!;
    const key = `${repoInfo.owner}/${repoInfo.repo}`;
    if (!uniqueRepos.has(key)) {
      uniqueRepos.set(key, repoInfo);
    }
  }

  const starResults = new Map<string, string>();

  await Promise.all(
    Array.from(uniqueRepos.entries()).map(async ([key, repoInfo]) => {
      const stars = await fetchRepoStars(repoInfo.owner, repoInfo.repo);
      if (stars) {
        starResults.set(key, stars);
      }
    })
  );

  return publications.map((pub) => {
    if (pub.stars) {
      return pub;
    }

    const repoInfo = parseGitHubRepo(pub.code);
    if (!repoInfo) {
      return pub;
    }

    const stars = starResults.get(`${repoInfo.owner}/${repoInfo.repo}`);
    return stars ? { ...pub, stars } : pub;
  });
}
