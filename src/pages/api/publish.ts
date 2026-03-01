import type { APIRoute } from 'astro';

export const prerender = false;

interface PublishBody {
  title: string;
  slug: string;
  description: string;
  content: string;
}

/** Sanitize a slug: lowercase, alphanumeric and hyphens only, no leading/trailing hyphens. */
function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Build the markdown file content with YAML frontmatter. */
function buildMarkdown(data: { title: string; slug: string; description: string; content: string }): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  // Escape double-quotes in strings that go into quoted YAML scalars
  const safeTitle = data.title.replace(/"/g, '\\"');
  const safeDescription = data.description.replace(/"/g, '\\"');

  return `---
title: "${safeTitle}"
description: "${safeDescription}"
date: "${date}"
slug: "${data.slug}"
draft: false
---

${data.content.trim()}
`;
}

/** Fetch the current SHA of a file in the repo (needed to update existing files). */
async function getFileSHA(
  path: string,
  headers: Record<string, string>,
  owner: string,
  repo: string,
  branch: string
): Promise<string | null> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  const res = await fetch(url, { headers });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub API error fetching SHA: ${res.status}`);
  const data = await res.json();
  return (data as { sha?: string }).sha ?? null;
}

export const POST: APIRoute = async ({ request }) => {
  let body: PublishBody;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Expected JSON body.' }, 400);
  }

  const { title, slug, description, content } = body;

  if (!title?.trim() || !slug?.trim() || !description?.trim() || !content?.trim()) {
    return json({ error: 'title, slug, description, and content are all required.' }, 400);
  }

  const safeSlug = sanitizeSlug(slug);
  if (!safeSlug) {
    return json({ error: 'Slug could not be sanitized — please use letters and numbers.' }, 400);
  }

  const {
    GITHUB_TOKEN,
    GITHUB_OWNER,
    GITHUB_REPO,
    GITHUB_BRANCH,
    SITE_URL,
  } = import.meta.env;

  const filePath = `src/content/posts/${safeSlug}.md`;
  const markdownContent = buildMarkdown({ title, slug: safeSlug, description, content });
  const contentBase64 = Buffer.from(markdownContent, 'utf-8').toString('base64');

  const githubHeaders: Record<string, string> = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'publishing-site',
  };

  let existingSHA: string | null = null;
  try {
    existingSHA = await getFileSHA(filePath, githubHeaders, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH);
  } catch (err) {
    console.error('[publish] Error fetching existing file SHA:', err);
    return json({ error: 'Failed to check GitHub for existing file.' }, 500);
  }

  const payload: Record<string, unknown> = {
    message: existingSHA ? `Update post: ${title}` : `Add post: ${title}`,
    content: contentBase64,
    branch: GITHUB_BRANCH,
  };

  // SHA is required when updating an existing file; omit it when creating
  if (existingSHA) {
    payload.sha = existingSHA;
  }

  const putURL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
  const putRes = await fetch(putURL, {
    method: 'PUT',
    headers: githubHeaders,
    body: JSON.stringify(payload),
  });

  if (!putRes.ok) {
    const errorBody = await putRes.json().catch(() => ({}));
    const message = (errorBody as { message?: string }).message ?? `GitHub API error: ${putRes.status}`;
    console.error('[publish] GitHub PUT error:', message);
    return json({ error: message }, 500);
  }

  const postURL = `${SITE_URL}/posts/${safeSlug}`;

  return json({
    success: true,
    url: postURL,
    slug: safeSlug,
    created: !existingSHA,
  });
};

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
