const { Client } = require("pg");
require("dotenv").config({ path: ".env.local" });

// Test both URLs
const urls = {
  "DATABASE_URL (Transaction Mode - 6543)": process.env.DATABASE_URL,
  "DIRECT_URL (Session Mode - 5432)": process.env.DIRECT_URL,
};

async function testConnection(name, url) {
  console.log(`\n--- Testing ${name} ---`);
  console.log("URL:", url.replace(/:[^@]+@/, ":***@"));

  const client = new Client({
    connectionString: url,
  });

  try {
    await client.connect();
    console.log("✅ Connection SUCCESSFUL!");

    const res = await client.query("SELECT NOW()");
    console.log("✅ Query successful! Server time:", res.rows[0].now);
  } catch (err) {
    console.error("❌ Connection FAILED:", err.message);
  } finally {
    await client.end();
  }
}

(async () => {
  for (const [name, url] of Object.entries(urls)) {
    await testConnection(name, url);
  }
})();
