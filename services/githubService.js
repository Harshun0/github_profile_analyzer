const axios = require('axios');

const GITHUB_API = 'https://api.github.com';

function createClient() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return axios.create({ baseURL: GITHUB_API, headers, timeout: 15000 });
}

async function fetchUserProfile(username) {
  const client = createClient();

  try {
    const { data } = await client.get(`/users/${encodeURIComponent(username)}`);
    return data;
  } catch (err) {
    if (err.response?.status === 404) {
      const error = new Error(`GitHub user "${username}" not found.`);
      error.statusCode = 404;
      throw error;
    }
    if (err.response?.status === 403) {
      const error = new Error('GitHub API rate limit exceeded. Try again later or add GITHUB_TOKEN.');
      error.statusCode = 429;
      throw error;
    }
    const error = new Error('Failed to fetch data from GitHub API.');
    error.statusCode = 502;
    throw error;
  }
}

async function fetchUserRepos(username) {
  const client = createClient();
  const repos = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    try {
      const { data } = await client.get(`/users/${encodeURIComponent(username)}/repos`, {
        params: {
          per_page: perPage,
          page,
          sort: 'updated',
          direction: 'desc',
        },
      });

      if (!data.length) break;

      repos.push(...data);

      if (data.length < perPage) break;
      page += 1;
    } catch (err) {
      if (err.response?.status === 404) {
        const error = new Error(`GitHub user "${username}" not found.`);
        error.statusCode = 404;
        throw error;
      }
      if (err.response?.status === 403) {
        const error = new Error('GitHub API rate limit exceeded. Try again later or add GITHUB_TOKEN.');
        error.statusCode = 429;
        throw error;
      }
      const error = new Error('Failed to fetch repositories from GitHub API.');
      error.statusCode = 502;
      throw error;
    }
  }

  return repos;
}

function computeInsights(repos) {
  const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);

  const languageCounts = {};
  for (const repo of repos) {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }
  }

  let topLanguage = null;
  let maxCount = 0;
  for (const [lang, count] of Object.entries(languageCounts)) {
    if (count > maxCount) {
      maxCount = count;
      topLanguage = lang;
    }
  }

  return { totalStars, topLanguage };
}

module.exports = {
  fetchUserProfile,
  fetchUserRepos,
  computeInsights,
};
