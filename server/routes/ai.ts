import { Router, Request, Response } from 'express';
import {
    generateGreetings,
    parseContactsFromImage,
    transcribeAudio,
} from '../lib/gemini.js';

const router = Router();

// POST /api/ai/generate-greetings
router.post('/generate-greetings', async (req: Request, res: Response) => {
    try {
        const { name, relationship, memories } = req.body;

        if (!name) {
            res.status(400).json({ error: 'name is required' });
            return;
        }

        const greetings = await generateGreetings(name, relationship || '', memories || '');
        res.json(greetings);
    } catch (error: any) {
        console.error('Error generating greetings:', error);
        res.status(500).json({ error: error.message || 'Failed to generate greetings' });
    }
});

// POST /api/ai/parse-contacts-image
router.post('/parse-contacts-image', async (req: Request, res: Response) => {
    try {
        const { base64Image } = req.body;

        if (!base64Image) {
            res.status(400).json({ error: 'base64Image is required' });
            return;
        }

        const names = await parseContactsFromImage(base64Image);
        res.json({ names });
    } catch (error: any) {
        console.error('Error parsing contacts image:', error);
        res.status(500).json({ error: error.message || 'Failed to parse image' });
    }
});

// POST /api/ai/transcribe-audio
router.post('/transcribe-audio', async (req: Request, res: Response) => {
    try {
        const { base64Audio } = req.body;

        if (!base64Audio) {
            res.status(400).json({ error: 'base64Audio is required' });
            return;
        }

        const text = await transcribeAudio(base64Audio);
        res.json({ text });
    } catch (error: any) {
        console.error('Error transcribing audio:', error);
        res.status(500).json({ error: error.message || 'Failed to transcribe audio' });
    }
});

export default router;
