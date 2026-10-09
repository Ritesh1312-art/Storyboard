import express from 'express';
import { createServer as createViteServer } from 'vite';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const PASSWORD = "695683";

async function startServer() {
  const app = express();

  app.set('trust proxy', 1); // Trust first proxy (nginx)
  app.use(express.json());
  app.use(cookieParser());
  app.use(session({
    secret: 'storyboard-secret-key',
    resave: true,
    saveUninitialized: true,
    name: 'storyboard.sid',
    cookie: {
      secure: true,
      sameSite: 'none',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    }
  }));

  // Debug middleware
  app.use((req: any, res, next) => {
    console.log(`${req.method} ${req.url} - Session ID: ${req.sessionID}`);
    next();
  });

  // API Routes
  app.get('/api/auth/status', (req: any, res) => {
    res.json({
      passwordVerified: !!req.session.passwordVerified
    });
  });

  // Password Verification
  app.post('/api/auth/password', (req: any, res) => {
    const { password } = req.body;
    if (password === PASSWORD) {
      req.session.passwordVerified = true;
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Incorrect password' });
    }
  });

  app.post('/api/auth/logout', (req: any, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
