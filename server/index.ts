import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local BEFORE any other imports that depend on env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

// Dynamic imports AFTER env is loaded
async function main() {
    const express = (await import('express')).default;
    const cors = (await import('cors')).default;
    const { default: contactsRouter } = await import('./routes/contacts.js');
    const { default: aiRouter } = await import('./routes/ai.js');

    const app = express();
    const PORT = process.env.PORT || 3001;

    // Middleware
    app.use(cors());
    app.use(express.json({ limit: '50mb' }));

    // API Routes
    app.use('/api/contacts', contactsRouter);
    app.use('/api/ai', aiRouter);

    // Health check
    app.get('/api/health', (_req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Serve static files from dist (Production support)
    const distPath = path.resolve(__dirname, '..', 'dist');
    app.use(express.static(distPath));

    // Handle SPA routing for non-API requests
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(distPath, 'index.html'));
        }
    });

    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

main().catch(console.error);
