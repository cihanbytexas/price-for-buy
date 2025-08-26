import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

const messagesPath = path.join(process.cwd(), 'data', 'messages.json');
const SECRET = 'YOUR_SECRET_KEY';

export default function handler(req, res) {
  const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf-8'));

  if (req.method === 'GET') {
    return res.status(200).json(messages);
  }

  if (req.method === 'POST') {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token required' });

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, SECRET);
      const { message } = req.body;
      if (!message) return res.status(400).json({ error: 'Message required' });

      const newMsg = { id: Date.now(), user: decoded.username, message, timestamp: new Date().toISOString() };
      messages.push(newMsg);
      fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));
      return res.status(201).json(newMsg);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
