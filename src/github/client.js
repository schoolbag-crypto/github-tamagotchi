const REST_BASE = "https://api.github.com";
const GRAPHQL_URL = "https://api.github.com/graphql";

/**
 * Thin wrapper around GitHub's REST + GraphQL APIs.
 * Uses global fetch (Node 20+), so this ships with zero dependencies.
 */
export class GitHubClient {
  constructor(token) {
    if (!token) {
      throw new Error(
        "GitHubClient requires a token. Pass GITHUB_TOKEN (Actions provides this automatically)."
      );
    }
    this.token = token;
  }

  async rest(path, { params } = {}) {
    const url = new URL(`${REST_BASE}${path}`);
    if (params) {
      for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    }
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "github-tamagotchi",
      },
    });
    if (!res.ok) {
      throw new Error(`GitHub REST ${path} failed: ${res.status} ${await res.text()}`);
    }
    return res.json();
  }

  async graphql(query, variables) {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        "User-Agent": "github-tamagotchi",
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) {
      throw new Error(`GitHub GraphQL failed: ${res.status} ${await res.text()}`);
    }
    const json = await res.json();
    if (json.errors) {
      throw new Error(`GitHub GraphQL errors: ${JSON.stringify(json.errors)}`);
    }
    return json.data;
  }
}
