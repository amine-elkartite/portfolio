const X_API_BASE = "https://api.twitter.com/2";
const USER_FIELDS = "name,username,description,profile_image_url,public_metrics,verified,verified_type,url";
const TWEET_FIELDS = "created_at,public_metrics,text,entities";

async function callX(path, token) {
  const response = await fetch(`${X_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    const error = new Error(`X API ${response.status} ${response.statusText}: ${text}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export default async (req) => {
  const token = Netlify.env.get("X_BEARER_TOKEN");

  if (!token) {
    return Response.json(
      {
        error: "missing_token",
        message: "X_BEARER_TOKEN environment variable is not configured.",
      },
      { status: 503 }
    );
  }

  const url = new URL(req.url);
  const username = (url.searchParams.get("username") || "Amine_Elkartite").replace(/^@/, "");
  const tweetCount = Math.min(Number.parseInt(url.searchParams.get("tweets") || "5", 10) || 5, 10);

  try {
    const userResponse = await callX(
      `/users/by/username/${encodeURIComponent(username)}?user.fields=${USER_FIELDS}`,
      token
    );

    const user = userResponse?.data;

    if (!user) {
      return Response.json({ error: "user_not_found" }, { status: 404 });
    }

    let tweets = [];

    try {
      const tweetsResponse = await callX(
        `/users/${user.id}/tweets?max_results=${tweetCount}&exclude=replies,retweets&tweet.fields=${TWEET_FIELDS}`,
        token
      );
      tweets = Array.isArray(tweetsResponse?.data) ? tweetsResponse.data : [];
    } catch (tweetsError) {
      console.error("X tweets fetch failed", tweetsError);
    }

    const payload = {
      fetchedAt: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        description: user.description ?? "",
        url: `https://x.com/${user.username}`,
        avatar: (user.profile_image_url || "").replace("_normal", "_400x400"),
        verified: Boolean(user.verified),
        metrics: user.public_metrics ?? null,
      },
      tweets: tweets.map((tweet) => ({
        id: tweet.id,
        text: tweet.text,
        createdAt: tweet.created_at,
        metrics: tweet.public_metrics ?? null,
        url: `https://x.com/${user.username}/status/${tweet.id}`,
      })),
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Netlify-CDN-Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error) {
    console.error("X profile fetch failed", error);

    const status = error.status === 429 ? 429 : 502;

    return Response.json(
      {
        error: status === 429 ? "rate_limited" : "upstream_error",
        message: "Unable to fetch live X data right now.",
      },
      { status }
    );
  }
};

export const config = {
  path: "/api/x-profile",
};
