import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';

const router = Router();

// GET /api/contacts — Fetch all contacts
router.get('/', async (_req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Map snake_case DB fields to camelCase for frontend
        const contacts = (data || []).map((row: any) => ({
            id: row.id,
            name: row.name,
            relationship: row.relationship,
            memories: row.memories,
            avatarColor: row.avatar_color,
            generatedGreetings: row.generated_greetings,
            isBlessed: row.is_blessed,
        }));

        res.json(contacts);
    } catch (error: any) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/contacts — Create a single contact
router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, relationship, avatarColor } = req.body;

        const { data, error } = await supabase
            .from('contacts')
            .insert({
                name,
                relationship: relationship || '朋友',
                avatar_color: avatarColor,
                is_blessed: false,
            })
            .select()
            .single();

        if (error) throw error;

        res.json({
            id: data.id,
            name: data.name,
            relationship: data.relationship,
            memories: data.memories,
            avatarColor: data.avatar_color,
            generatedGreetings: data.generated_greetings,
            isBlessed: data.is_blessed,
        });
    } catch (error: any) {
        console.error('Error creating contact:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/contacts/batch — Batch create contacts
router.post('/batch', async (req: Request, res: Response) => {
    try {
        const { contacts: contactsInput } = req.body;
        // contactsInput is an array of { name, relationship, avatarColor }

        const rows = contactsInput.map((c: any) => ({
            name: c.name,
            relationship: c.relationship || '朋友',
            avatar_color: c.avatarColor,
            is_blessed: false,
        }));

        const { data, error } = await supabase
            .from('contacts')
            .insert(rows)
            .select();

        if (error) throw error;

        const contacts = (data || []).map((row: any) => ({
            id: row.id,
            name: row.name,
            relationship: row.relationship,
            memories: row.memories,
            avatarColor: row.avatar_color,
            generatedGreetings: row.generated_greetings,
            isBlessed: row.is_blessed,
        }));

        res.json(contacts);
    } catch (error: any) {
        console.error('Error batch creating contacts:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/contacts/:id — Update a contact
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Map camelCase to snake_case for DB
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.relationship !== undefined) dbUpdates.relationship = updates.relationship;
        if (updates.memories !== undefined) dbUpdates.memories = updates.memories;
        if (updates.avatarColor !== undefined) dbUpdates.avatar_color = updates.avatarColor;
        if (updates.generatedGreetings !== undefined) dbUpdates.generated_greetings = updates.generatedGreetings;
        if (updates.isBlessed !== undefined) dbUpdates.is_blessed = updates.isBlessed;

        const { data, error } = await supabase
            .from('contacts')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            id: data.id,
            name: data.name,
            relationship: data.relationship,
            memories: data.memories,
            avatarColor: data.avatar_color,
            generatedGreetings: data.generated_greetings,
            isBlessed: data.is_blessed,
        });
    } catch (error: any) {
        console.error('Error updating contact:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/contacts/:id — Delete a contact
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('contacts')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
