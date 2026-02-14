import { Contact, GeneratedGreetings } from '../types';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${url}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(error.error || `Request failed: ${res.status}`);
    }

    return res.json();
}

// ─── Contacts ───

export const fetchContacts = (): Promise<Contact[]> =>
    request<Contact[]>('/contacts');

export const createContact = (data: {
    name: string;
    relationship?: string;
    avatarColor?: string;
}): Promise<Contact> =>
    request<Contact>('/contacts', {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const createContactsBatch = (
    contacts: { name: string; relationship?: string; avatarColor?: string }[]
): Promise<Contact[]> =>
    request<Contact[]>('/contacts/batch', {
        method: 'POST',
        body: JSON.stringify({ contacts }),
    });

export const updateContact = (
    id: string,
    data: Partial<Contact>
): Promise<Contact> =>
    request<Contact>(`/contacts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

export const deleteContact = (id: string): Promise<{ success: boolean }> =>
    request<{ success: boolean }>(`/contacts/${id}`, {
        method: 'DELETE',
    });

// ─── AI Services ───

export const generateGreetings = (
    name: string,
    relationship: string,
    memories: string
): Promise<GeneratedGreetings> =>
    request<GeneratedGreetings>('/ai/generate-greetings', {
        method: 'POST',
        body: JSON.stringify({ name, relationship, memories }),
    });

export const parseContactsImage = (base64Image: string): Promise<string[]> =>
    request<{ names: string[] }>('/ai/parse-contacts-image', {
        method: 'POST',
        body: JSON.stringify({ base64Image }),
    }).then((res) => res.names);

export const transcribeAudio = (base64Audio: string): Promise<string> =>
    request<{ text: string }>('/ai/transcribe-audio', {
        method: 'POST',
        body: JSON.stringify({ base64Audio }),
    }).then((res) => res.text);
