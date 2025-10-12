export async function handler(event, context) {
  const res = await fetch("https://payhip.com/WillieInspiredbeats", {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  const html = await res.text();

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html" },
    body: html
  };
}
