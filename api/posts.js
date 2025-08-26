import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

const postsPath = path.join(process.cwd(), 'data', 'posts.json');
const SECRET = 'YOUR_SECRET_KEY';

export default function handler(req, res) {
  const posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));

  if (req.method === 'GET') {
    return res.status(200).json(posts);
  }

  if (req.method === 'POST') {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token required' });

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, SECRET);
      const { title, content } = req.body;
      if (!title || !content) return res.status(400).json({ error: 'Title and content required' });

      const newPost = { id: Date.now(), title, content, author: decoded.username };
      posts.push(newPost);
      fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));
      return res.status(201).json(newPost);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
