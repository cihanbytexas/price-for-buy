import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

const filePath = path.join(process.cwd(), 'data', 'users.json');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed });
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

  res.status(201).json({ message: 'User registered successfully' });
}
