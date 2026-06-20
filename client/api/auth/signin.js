export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const response = await fetch(
    "https://lgardeduc.onrender.com/api/auth/signin",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    return res.status(response.status).json(data);
  }

  res.setHeader(
    "Set-Cookie",
    `token=${data.token}; Path=/; HttpOnly; Secure; SameSite=Lax; Domain=lgardeduc.vercel.app; Max-Age=${48 * 60 * 60}`,
  );

  const meResponse = await fetch("https://lgardeduc.onrender.com/api/auth/me", {
    headers: { Authorization: `Bearer ${data.token}` },
  });
  const userData = await meResponse.json();

  res.json({ message: "Connexion réussie", user: userData });
}
