import timers from "node:timers/promises";

const OC_API_URL = process.env.OPENCOLLECTIVE_API_KEY
  ? `https://api.opencollective.com/graphql/v2?personalToken=${process.env.OPENCOLLECTIVE_API_KEY}`
  : "https://api.opencollective.com/graphql/v2";

const transactionsGraphqlQuery = /* GraphQL */ `
  query transactions($dateFrom: DateTime, $limit: Int, $offset: Int) {
    transactions(
      account: { slug: "prettier" }
      dateFrom: $dateFrom
      limit: $limit
      offset: $offset
      includeIncognitoTransactions: false
    ) {
      nodes {
        amountInHostCurrency {
          value
        }
        fromAccount {
          name
          slug
          website
          imageUrl
        }
        createdAt
      }
    }
  }
`;

const pageSize = 1000;
async function fetchTransactions() {
  const body = {
    query: transactionsGraphqlQuery,
    variables: {
      limit: 1000,
      offset: 0,
      dateFrom: new Date(
        new Date().setFullYear(new Date().getFullYear() - 1),
      ).toISOString(), // data from last year
    },
  };

  const allTransactionNodes = [];

  let limit = 10;
  let remaining = 10;
  let reset;

  while (true) {
    if (remaining === 0) {
      await timers.setTimeout(reset - Date.now() + 100);
    }

    const response = await fetch(OC_API_URL, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });

    let result;
    if (response.headers.get("content-type").includes("json")) {
      const json = await response.json();
      if (json.error) {
        remaining = 0;
        reset = Date.now() + 1000 * 60; // 1 minute
      } else {
        limit = response.headers.get("x-ratelimit-limit") * 1;
        remaining = response.headers.get("x-ratelimit-remaining") * 1;
        reset = response.headers.get("x-ratelimit-reset") * 1000;
      }
      result = json;
    } else {
      throw new Error(await response.text());
    }

    const { nodes } = result.data.transactions;
    for (const node of nodes) {
      allTransactionNodes.push(node);
    }
    body.variables.offset += pageSize;
    if (nodes.length < pageSize) {
      return allTransactionNodes;
    } else {
      // more nodes to fetch
    }
  }
}

export async function fetchSponsors() {
  const sponsorsMonthlyDonations = new Map();
  const transactions = await fetchTransactions();
  for (const transaction of transactions) {
    if (!transaction.amountInHostCurrency) {
      continue;
    }
    const amount = transaction.amountInHostCurrency.value;
    if (!amount || amount <= 0) {
      continue;
    }
    const sponsor = sponsorsMonthlyDonations.get(transaction.fromAccount.slug);
    const monthlyDonations = (amount * 100) / 12;
    if (!sponsor) {
      sponsorsMonthlyDonations.set(transaction.fromAccount.slug, {
        slug: transaction.fromAccount.slug,
        name: transaction.fromAccount.name,
        website: transaction.fromAccount.website,
        avatar: transaction.fromAccount.imageUrl,
        monthlyDonations,
      });
    } else {
      sponsor.monthlyDonations += monthlyDonations;
    }
  }
  const sponsors = {
    gold: [],
    silver: [],
    bronze: [],
    backers: [],
  };
  const sortedSponsors = Array.from(sponsorsMonthlyDonations).sort(
    (a, b) => b[1].monthlyDonations - a[1].monthlyDonations,
  );
  for (const [, sponsor] of sortedSponsors) {
    sponsor.monthlyDonations = Math.round(sponsor.monthlyDonations);
    if (sponsor.monthlyDonations >= 50000) {
      sponsors.gold.push(sponsor);
    } else if (sponsor.monthlyDonations >= 30000) {
      sponsors.silver.push(sponsor);
    } else if (sponsor.monthlyDonations >= 10000) {
      sponsors.bronze.push(sponsor);
    } else {
      sponsors.backers.push(sponsor);
    }
  }
  return sponsors;
}

const sponsors = await fetchSponsors();
console.log(JSON.stringify(sponsors, null, 2));
