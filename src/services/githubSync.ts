export const syncToGitHub = async (
  owner: string,
  repo: string,
  path: string,
  token: string,
  data: any,
  branch = 'main'
) => {
  if (!token?.trim()) {
    throw new Error('GitHub Personal Access Token is required to commit changes.');
  }
  if (!owner?.trim() || !repo?.trim()) {
    throw new Error('GitHub Owner and Repository name are required.');
  }

  const cleanToken = token.trim();
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  // 1. Fetch current file SHA
  let currentSha: string | undefined;
  try {
    const getRes = await fetch(`${url}?ref=${branch}`, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${cleanToken}`
      }
    });
    if (getRes.ok) {
      const getJson = await getRes.json();
      currentSha = getJson.sha;
    }
  } catch (e) {
    console.warn('Could not fetch existing file SHA:', e);
  }

  // 2. Base64 encode JSON content safely supporting UTF-8
  const jsonStr = JSON.stringify(data, null, 2);
  const base64Content = btoa(unescape(encodeURIComponent(jsonStr)));

  // 3. PUT commit to GitHub API
  const putRes = await fetch(url, {
    method: 'PUT',
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${cleanToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: `chore(cms): update portfolio-config.json via Admin console [${new Date().toISOString()}]`,
      content: base64Content,
      sha: currentSha,
      branch: branch
    })
  });

  if (!putRes.ok) {
    const errData = await putRes.json().catch(() => ({}));
    throw new Error(errData.message || `GitHub API returned HTTP status ${putRes.status}`);
  }

  return await putRes.json();
};
