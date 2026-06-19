import { getGitHubStarsBadgeUrl, parseGitHubRepo } from '@/lib/githubStars';

interface GitHubStarsBadgeProps {
    codeUrl?: string;
}

export default function GitHubStarsBadge({ codeUrl }: GitHubStarsBadgeProps) {
    const repoInfo = parseGitHubRepo(codeUrl);

    if (!repoInfo || !codeUrl) {
        return null;
    }

    return (
        <a
            href={codeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center"
            aria-label={`GitHub stars for ${repoInfo.owner}/${repoInfo.repo}`}
        >
            <img
                src={getGitHubStarsBadgeUrl(repoInfo.owner, repoInfo.repo)}
                alt="GitHub stars"
                className="block h-6 w-auto"
                loading="lazy"
            />
        </a>
    );
}
