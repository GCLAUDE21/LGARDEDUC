export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  res.setHeader(
    "Set-Cookie",
    "token=; Path=/; HttpOnly; Secure; SameSite=Lax; Domain=lgardeduc.vercel.app; Max-Age=0",
  );
  res.json({ message: "Déconnecté" });
}
