export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const cookie = req.headers.cookie || "";

  const response = await fetch("https://lgardeduc.onrender.com/api/auth/me", {
    headers: { cookie },
  });

  const data = await response.json();

  if (!response.ok) {
    return res.status(response.status).json(data);
  }

  res.json(data);
}
