const CONTRIBUTIONS_QUERY = `
query($login: String!) {
  user(login: $login) {
    createdAt
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}
`;

/** Fetch the public profile (used mainly for account age / sanity checks). */
export async function fetchProfile(client, username) {
  return client.rest(`/users/${username}`);
}

/** Fetch the last-year contribution calendar via GraphQL. */
export async function fetchContributions(client, username) {
  const data = await client.graphql(CONTRIBUTIONS_QUERY, { login: username });
  return data.user.contributionsCollection.contributionCalendar;
}

/** Fetch up to 100 of the user's repos, including stars + primary language. */
export async function fetchRepos(client, username) {
  const repos = await client.rest(`/users/${username}/repos`, {
    params: { per_page: "100", sort: "created", direction: "desc" },
  });
  return repos.map((r) => ({
    name: r.name,
    stars: r.stargazers_count,
    language: r.language,
    createdAt: r.created_at,
    pushedAt: r.pushed_at,
    fork: r.fork,
  }));
}

/**
 * Fetch recent public events (push events mostly). GitHub only retains ~90
 * days / 300 events here, which is plenty for "night owl" and "recent
 * activity" signals but NOT a full history — that's what the calendar is for.
 */
export async function fetchRecentEvents(client, username) {
  const events = await client.rest(`/users/${username}/events/public`, {
    params: { per_page: "100" },
  });
  return events.filter((e) => e.type === "PushEvent");
}
