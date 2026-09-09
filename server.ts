import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent storage path
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'links.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;
  provider: 'traditional' | 'google';
  createdAt: string;
}

interface LinkDestination {
  id: string;
  url: string;
  title: string;
  weight: number;
  clicks: number;
  lastClickedAt?: string;
  isActive: boolean;
}

interface ClickLog {
  id: string;
  timestamp: string;
  destinationId: string;
  destinationTitle: string;
  destinationUrl: string;
}

interface RotaLinkItem {
  id: string;
  slug: string;
  title: string;
  description?: string;
  type: 'single' | 'rotator';
  rotationMode: 'round_robin' | 'weighted' | 'random';
  destinations: LinkDestination[];
  currentRotationIndex: number;
  totalClicks: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  recentClicks: ClickLog[];
  userId?: string;
  userEmail?: string;
}

// Initial sample data highlighting the user's exact use case (WhatsApp links 50/50 rotator)
const INITIAL_LINKS: RotaLinkItem[] = [
  {
    id: 'sample-whatsapp-rotator',
    slug: 'zap-vendas',
    title: 'Atendimento Comercial WhatsApp (50% / 50%)',
    description: 'Distribui os leads igualmente entre dois atendentes no WhatsApp',
    type: 'rotator',
    rotationMode: 'round_robin',
    currentRotationIndex: 0,
    totalClicks: 24,
    isActive: true,
    createdAt: new Date(Date.now() - 3600 * 24 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    destinations: [
      {
        id: 'dest-1',
        title: 'WhatsApp Atendente Júlia (Plantão A)',
        url: 'https://wa.me/5511988881111?text=Ol%C3%A1%20J%C3%BAlia%2C%20quero%20saber%20mais%20sobre%20o%20produto',
        weight: 50,
        clicks: 12,
        lastClickedAt: new Date(Date.now() - 600000).toISOString(),
        isActive: true,
      },
      {
        id: 'dest-2',
        title: 'WhatsApp Atendente Marcos (Plantão B)',
        url: 'https://wa.me/5511977772222?text=Ol%C3%A1%20Marcos%2C%20quero%20saber%20mais%20sobre%20o%20produto',
        weight: 50,
        clicks: 12,
        lastClickedAt: new Date(Date.now() - 1200000).toISOString(),
        isActive: true,
      },
    ],
    recentClicks: [
      {
        id: 'log-1',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        destinationId: 'dest-1',
        destinationTitle: 'WhatsApp Atendente Júlia (Plantão A)',
        destinationUrl: 'https://wa.me/5511988881111?text=Ol%C3%A1%20J%C3%BAlia%2C%20quero%20saber%20mais%20sobre%20o%20produto',
      },
      {
        id: 'log-2',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        destinationId: 'dest-2',
        destinationTitle: 'WhatsApp Atendente Marcos (Plantão B)',
        destinationUrl: 'https://wa.me/5511977772222?text=Ol%C3%A1%20Marcos%2C%20quero%20saber%20mais%20sobre%20o%20produto',
      },
    ],
  },
  {
    id: 'sample-simple-link',
    slug: 'catalogo',
    title: 'Catálogo de Produtos 2026',
    description: 'Encurtador simples direcionando para a loja',
    type: 'single',
    rotationMode: 'round_robin',
    currentRotationIndex: 0,
    totalClicks: 47,
    isActive: true,
    createdAt: new Date(Date.now() - 3600 * 48 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    destinations: [
      {
        id: 'dest-single-1',
        title: 'Loja Principal',
        url: 'https://google.com',
        weight: 100,
        clicks: 47,
        lastClickedAt: new Date(Date.now() - 300000).toISOString(),
        isActive: true,
      },
    ],
    recentClicks: [],
  },
];

function loadLinks(): RotaLinkItem[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_LINKS, null, 2), 'utf-8');
      return INITIAL_LINKS;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_LINKS;
  } catch (err) {
    console.error('Error loading links from file:', err);
    return INITIAL_LINKS;
  }
}

function saveLinks(links: RotaLinkItem[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(links, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving links to file:', err);
  }
}

let linksStore: RotaLinkItem[] = loadLinks();

function loadUsers(): CustomerUser[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error loading users:', err);
    return [];
  }
}

function saveUsers(users: CustomerUser[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users:', err);
  }
}

let usersStore: CustomerUser[] = loadUsers();

// Helper to select destination according to rotation rules
function pickDestination(link: RotaLinkItem): { destination: LinkDestination; nextIndex: number } | null {
  const activeDests = link.destinations.filter((d) => d.isActive && d.url.trim().length > 0);
  if (activeDests.length === 0) return null;

  if (activeDests.length === 1 || link.type === 'single') {
    return { destination: activeDests[0], nextIndex: link.currentRotationIndex };
  }

  if (link.rotationMode === 'round_robin') {
    const currentIndex = (link.currentRotationIndex || 0) % activeDests.length;
    const chosen = activeDests[currentIndex];
    const nextIndex = (currentIndex + 1) % activeDests.length;
    return { destination: chosen, nextIndex };
  }

  if (link.rotationMode === 'random') {
    const randomIndex = Math.floor(Math.random() * activeDests.length);
    return { destination: activeDests[randomIndex], nextIndex: link.currentRotationIndex };
  }

  if (link.rotationMode === 'weighted') {
    const totalWeight = activeDests.reduce((sum, d) => sum + (d.weight > 0 ? d.weight : 1), 0);
    const randomVal = Math.random() * totalWeight;
    let accumulated = 0;
    for (const dest of activeDests) {
      accumulated += dest.weight > 0 ? dest.weight : 1;
      if (randomVal <= accumulated) {
        return { destination: dest, nextIndex: link.currentRotationIndex };
      }
    }
    return { destination: activeDests[0], nextIndex: link.currentRotationIndex };
  }

  return { destination: activeDests[0], nextIndex: link.currentRotationIndex };
}

// Generate unique slug if not provided
function generateSlug(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let slug = '';
  for (let i = 0; i < 6; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

// Clean slug format
function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ======================== AUTH ROUTES ========================

// Customer Registration (Traditional)
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Nome completo é obrigatório.' });
  }
  if (!email || !email.trim() || !email.includes('@')) {
    return res.status(400).json({ error: 'E-mail válido é obrigatório.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'A senha deve conter pelo menos 6 caracteres.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = usersStore.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return res.status(400).json({ error: 'Este e-mail já está cadastrado. Faça login ou use outro.' });
  }

  const newUser: CustomerUser = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: name.trim(),
    email: normalizedEmail,
    password: password,
    phone: phone ? phone.trim() : undefined,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=7c3aed,ea580c`,
    provider: 'traditional',
    createdAt: new Date().toISOString(),
  };

  usersStore.push(newUser);
  saveUsers(usersStore);

  const { password: _, ...safeUser } = newUser;
  res.status(201).json({ user: safeUser, token: 'token_' + newUser.id });
});

// Customer Login (Traditional)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = usersStore.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  }

  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, token: 'token_' + user.id });
});

// Customer Sign In / Sign Up with Google Account
app.post('/api/auth/google', (req, res) => {
  const { email, name, avatar, googleId } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'E-mail Google inválido.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  let user = usersStore.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    const displayName = name ? name.trim() : normalizedEmail.split('@')[0];
    user = {
      id: 'google_' + (googleId || Date.now()) + '_' + Math.random().toString(36).substring(2, 7),
      name: displayName,
      email: normalizedEmail,
      avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=ea580c,7c3aed`,
      provider: 'google',
      createdAt: new Date().toISOString(),
    };
    usersStore.push(user);
    saveUsers(usersStore);
  } else {
    // If existing, update avatar if provided
    if (avatar && !user.avatar?.includes('googleusercontent.com')) {
      user.avatar = avatar;
    }
    saveUsers(usersStore);
  }

  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, token: 'token_' + user.id });
});

// Current Authenticated User profile
app.get('/api/auth/me', (req, res) => {
  const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
  if (!userId) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  const user = usersStore.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

// OAuth Callback handler for Google Popup
app.get(['/auth/callback', '/auth/callback/'], (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Autenticado com Google</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #0f0a1c; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
          .box { background: #1c1433; border: 1px solid #7c3aed; border-radius: 16px; padding: 32px; max-width: 400px; }
          h2 { color: #f97316; margin: 0 0 8px; font-size: 20px; }
          p { color: #cbd5e1; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="box">
          <h2>Conta Google conectada com sucesso!</h2>
          <p>Concluindo autenticação e retornando ao RotaLink...</p>
        </div>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'google' }, '*');
            window.close();
          } else {
            window.location.href = '/';
          }
        </script>
      </body>
    </html>
  `);
});

// ======================== API ROUTES ========================

// List all links
app.get('/api/links', (req, res) => {
  res.json(linksStore);
});

// Create new link
app.post('/api/links', (req, res) => {
  const { title, slug: requestedSlug, type, rotationMode, destinations, userId, userEmail } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'O título do link é obrigatório.' });
  }

  let finalSlug = requestedSlug ? sanitizeSlug(requestedSlug) : generateSlug();
  if (!finalSlug) finalSlug = generateSlug();

  // Check collision
  const existing = linksStore.find((l) => l.slug.toLowerCase() === finalSlug.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: `O link personalizado "${finalSlug}" já está em uso. Escolha outro.` });
  }

  if (!destinations || !Array.isArray(destinations) || destinations.length === 0) {
    return res.status(400).json({ error: 'Forneça pelo menos um link de destino.' });
  }

  const validDests: LinkDestination[] = destinations.map((d: any, idx: number) => {
    let url = (d.url || '').trim();
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return {
      id: 'dest_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substring(2, 6),
      url,
      title: (d.title || `Destino ${idx + 1}`).trim(),
      weight: Number(d.weight) || (100 / destinations.length),
      clicks: 0,
      isActive: true,
    };
  });

  const newLink: RotaLinkItem = {
    id: 'link_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
    slug: finalSlug,
    title: title.trim(),
    type: type === 'single' ? 'single' : 'rotator',
    rotationMode: rotationMode || 'round_robin',
    destinations: validDests,
    currentRotationIndex: 0,
    totalClicks: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    recentClicks: [],
    userId: userId || undefined,
    userEmail: userEmail || undefined,
  };

  linksStore.unshift(newLink);
  saveLinks(linksStore);

  res.status(201).json(newLink);
});

// Update link
app.put('/api/links/:slug', (req, res) => {
  const { slug } = req.params;
  const linkIndex = linksStore.findIndex((l) => l.slug.toLowerCase() === slug.toLowerCase());

  if (linkIndex === -1) {
    return res.status(404).json({ error: 'Link não encontrado.' });
  }

  const existingLink = linksStore[linkIndex];
  const { title, isActive, rotationMode, destinations } = req.body;

  if (title !== undefined) existingLink.title = title.trim();
  if (isActive !== undefined) existingLink.isActive = Boolean(isActive);
  if (rotationMode !== undefined) existingLink.rotationMode = rotationMode;

  if (destinations && Array.isArray(destinations)) {
    existingLink.destinations = destinations.map((d: any, idx: number) => {
      let url = (d.url || '').trim();
      if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      return {
        id: d.id || ('dest_' + Date.now() + '_' + idx),
        url,
        title: (d.title || `Destino ${idx + 1}`).trim(),
        weight: Number(d.weight) || 50,
        clicks: Number(d.clicks) || 0,
        lastClickedAt: d.lastClickedAt,
        isActive: d.isActive !== undefined ? Boolean(d.isActive) : true,
      };
    });
  }

  existingLink.updatedAt = new Date().toISOString();
  linksStore[linkIndex] = existingLink;
  saveLinks(linksStore);

  res.json(existingLink);
});

// Delete link
app.delete('/api/links/:slug', (req, res) => {
  const { slug } = req.params;
  const initialLength = linksStore.length;
  linksStore = linksStore.filter((l) => l.slug.toLowerCase() !== slug.toLowerCase());

  if (linksStore.length === initialLength) {
    return res.status(404).json({ error: 'Link não encontrado.' });
  }

  saveLinks(linksStore);
  res.json({ success: true, message: 'Link removido com sucesso.' });
});

// Reset link stats
app.post('/api/links/:slug/reset-stats', (req, res) => {
  const { slug } = req.params;
  const link = linksStore.find((l) => l.slug.toLowerCase() === slug.toLowerCase());

  if (!link) {
    return res.status(404).json({ error: 'Link não encontrado.' });
  }

  link.totalClicks = 0;
  link.currentRotationIndex = 0;
  link.recentClicks = [];
  link.destinations.forEach((d) => {
    d.clicks = 0;
    d.lastClickedAt = undefined;
  });
  link.updatedAt = new Date().toISOString();

  saveLinks(linksStore);
  res.json(link);
});

// Simulate a click (returns chosen destination without full page redirect, perfect for in-app testing)
app.post('/api/links/:slug/simulate', (req, res) => {
  const { slug } = req.params;
  const link = linksStore.find((l) => l.slug.toLowerCase() === slug.toLowerCase());

  if (!link) {
    return res.status(404).json({ error: 'Link não encontrado.' });
  }

  if (!link.isActive) {
    return res.status(400).json({ error: 'Este link está desativado.' });
  }

  const pick = pickDestination(link);
  if (!pick) {
    return res.status(400).json({ error: 'Nenhum destino ativo configurado neste link.' });
  }

  const { destination, nextIndex } = pick;

  destination.clicks += 1;
  destination.lastClickedAt = new Date().toISOString();
  link.currentRotationIndex = nextIndex;
  link.totalClicks += 1;
  link.updatedAt = new Date().toISOString();

  const log: ClickLog = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    destinationId: destination.id,
    destinationTitle: destination.title,
    destinationUrl: destination.url,
  };

  link.recentClicks = [log, ...link.recentClicks.slice(0, 49)];
  saveLinks(linksStore);

  res.json({
    success: true,
    chosenDestination: destination,
    updatedLink: link,
  });
});

// ======================== REDIRECTION ENGINE ========================

// Handle redirect for /r/:slug
app.get('/r/:slug', (req, res) => {
  const { slug } = req.params;
  const link = linksStore.find((l) => l.slug.toLowerCase() === slug.toLowerCase());

  // Prevent caching of rotation
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (!link) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Link não encontrado | RotaLink</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #0f0a1c; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; text-align: center; }
          .card { background: #1c1433; border: 1px solid #7c3aed; border-radius: 16px; padding: 40px 30px; max-width: 440px; box-shadow: 0 10px 30px rgba(124, 58, 237, 0.2); }
          h1 { color: #f97316; font-size: 24px; margin-bottom: 12px; }
          p { color: #cbd5e1; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
          a { background: linear-gradient(135deg, #7c3aed, #f97316); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Link não encontrado</h1>
          <p>O link curto <strong>/r/${slug}</strong> não existe ou foi removido no <strong>RotaLink</strong>.</p>
          <a href="/">Ir para o RotaLink</a>
        </div>
      </body>
      </html>
    `);
  }

  if (!link.isActive) {
    return res.status(403).send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Link Pausado | RotaLink</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #0f0a1c; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; text-align: center; }
          .card { background: #1c1433; border: 1px solid #ea580c; border-radius: 16px; padding: 40px 30px; max-width: 440px; }
          h1 { color: #f97316; font-size: 24px; margin-bottom: 12px; }
          p { color: #cbd5e1; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
          a { background: #7c3aed; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Link Temporariamente Pausado</h1>
          <p>O link <strong>${link.title}</strong> foi pausado pelo administrador.</p>
          <a href="/">Ir para o RotaLink</a>
        </div>
      </body>
      </html>
    `);
  }

  const pick = pickDestination(link);
  if (!pick) {
    return res.status(500).send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sem destinos ativos | RotaLink</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #0f0a1c; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; text-align: center; }
          .card { background: #1c1433; border: 1px solid #7c3aed; border-radius: 16px; padding: 40px 30px; max-width: 440px; }
          h1 { color: #f97316; }
          a { background: #7c3aed; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Nenhum destino ativo</h1>
          <p>Não há nenhum endereço de destino ativo configurado para este link.</p>
          <a href="/">Ir para o RotaLink</a>
        </div>
      </body>
      </html>
    `);
  }

  const { destination, nextIndex } = pick;

  // Record metrics
  destination.clicks += 1;
  destination.lastClickedAt = new Date().toISOString();
  link.currentRotationIndex = nextIndex;
  link.totalClicks += 1;
  link.updatedAt = new Date().toISOString();

  const log: ClickLog = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    destinationId: destination.id,
    destinationTitle: destination.title,
    destinationUrl: destination.url,
  };
  link.recentClicks = [log, ...link.recentClicks.slice(0, 49)];

  saveLinks(linksStore);

  // If the query ?preview=true is passed or browser asks for preview, show interstitial redirect
  if (req.query.preview === 'true') {
    return res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="refresh" content="2;url=${destination.url}">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redirecionando... | RotaLink</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #0b0717; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; }
          .card { background: #160f29; border: 2px solid #7c3aed; border-radius: 20px; padding: 36px; max-width: 460px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
          .badge { display: inline-block; background: #ea580c; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em; }
          .spinner { border: 4px solid rgba(255,255,255,0.1); border-top: 4px solid #f97316; border-radius: 50%; width: 36px; height: 36px; animation: spin 0.8s linear infinite; margin: 20px auto; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          h2 { margin: 0 0 10px; font-size: 22px; color: #fff; }
          p { color: #94a3b8; font-size: 14px; margin-bottom: 20px; }
          .dest-box { background: #231642; border-radius: 10px; padding: 12px; font-size: 13px; color: #f97316; word-break: break-all; margin-bottom: 20px; }
          a.btn { background: #7c3aed; color: white; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">RotaLink em Ação</div>
          <h2>Redirecionando você...</h2>
          <div class="spinner"></div>
          <p>Destino selecionado pela rotação:</p>
          <div class="dest-box"><strong>${destination.title}</strong><br/>${destination.url}</div>
          <a class="btn" href="${destination.url}">Clique aqui se não for redirecionado</a>
        </div>
      </body>
      </html>
    `);
  }

  // Direct HTTP 307 temporary redirect
  res.redirect(307, destination.url);
});

// Initialize server and Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RotaLink Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
