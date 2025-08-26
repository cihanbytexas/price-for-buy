import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const filePath = path.join(process.cwd(), 'data', 'users.json');
const SECRET = 'YOUR_SECRET_KEY'; // Vercel’de Environment Variable yapabilirsin

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ username }, SECRET, { expiresIn: '1d' });
  res.status(200).json({ token });
}
