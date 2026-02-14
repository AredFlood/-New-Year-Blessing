import React, { useState, useEffect } from 'react';
import { AppView, Contact } from './types';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ImportScreen } from './components/ImportScreen';
import { MemoryInput } from './components/MemoryInput';
import { PreviewScreen } from './components/PreviewScreen';
import * as api from './services/api';

const COLORS = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-pink-500', 'bg-purple-500'];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });
  const [processingContactId, setProcessingContactId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load contacts from Supabase on mount
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const data = await api.fetchContacts();
        setContacts(data);
      } catch (error) {
        console.error('Failed to load contacts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadContacts();
  }, []);

  const handleAddContact = async (name: string) => {
    if (name) {
      try {
        const avatarColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        const newContact = await api.createContact({
          name,
          relationship: '朋友',
          avatarColor,
        });

        setContacts(prev => [...prev, newContact]);
        setSelectedContactId(newContact.id);
        setCurrentView(AppView.MEMORY_INPUT);
      } catch (error: any) {
        alert(`添加失败: ${error.message || '请稍后重试'}`);
      }
    }
  };

  const handleImportComplete = async (names: string[]) => {
    try {
      const contactsInput = names.map(name => ({
        name,
        relationship: '朋友',
        avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));

      const newContacts = await api.createContactsBatch(contactsInput);
      setContacts(prev => [...prev, ...newContacts]);
      setCurrentView(AppView.DASHBOARD);
    } catch (error: any) {
      alert(`导入失败: ${error.message || '请稍后重试'}`);
    }
  };

  const handleSelectContact = (contact: Contact) => {
    setSelectedContactId(contact.id);
    if (contact.generatedGreetings) {
      setCurrentView(AppView.PREVIEW);
    } else {
      setCurrentView(AppView.MEMORY_INPUT);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (window.confirm("确定要删除这位联系人吗？")) {
      try {
        await api.deleteContact(id);
        setContacts(prev => prev.filter(c => c.id !== id));
        if (selectedContactId === id) {
          setSelectedContactId(null);
          setCurrentView(AppView.DASHBOARD);
        }
      } catch (error: any) {
        alert(`删除失败: ${error.message || '请稍后重试'}`);
      }
    }
  };

  const handleMarkAsBlessed = async (id: string) => {
    try {
      await api.updateContact(id, { isBlessed: true });
      setContacts(prev => prev.map(c => c.id === id ? { ...c, isBlessed: true } : c));
    } catch (error) {
      console.error('Failed to mark as blessed:', error);
    }
  };

  const handleGenerate = async (data: { relationship: string; memories: string }) => {
    const contact = contacts.find(c => c.id === selectedContactId);
    if (!contact) return;

    setIsGenerating(true);
    try {
      const greetings = await api.generateGreetings(contact.name, data.relationship, data.memories);

      const updatedContact = {
        ...contact,
        relationship: data.relationship,
        memories: data.memories,
        generatedGreetings: greetings,
      };

      // Persist to backend
      await api.updateContact(contact.id, {
        relationship: data.relationship,
        memories: data.memories,
        generatedGreetings: greetings,
      });

      setContacts(prev => prev.map(c => c.id === contact.id ? updatedContact : c));
      setCurrentView(AppView.PREVIEW);
    } catch (error: any) {
      alert(`生成失败: ${error.message || '请稍后重试'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAll = async () => {
    if (contacts.length === 0) return;

    const pendingContacts = contacts.filter(c => !c.generatedGreetings);
    const hasPending = pendingContacts.length > 0;
    const targets = hasPending ? pendingContacts : contacts;

    const confirmMessage = hasPending
      ? `发现 ${targets.length} 位好友还未生成祝福，准备开始生成。确定继续吗？`
      : `所有好友都已生成祝福。是否要为所有 ${targets.length} 位好友重新生成？`;

    if (!window.confirm(confirmMessage)) return;

    setIsGeneratingAll(true);
    setGenerationProgress({ current: 0, total: targets.length });

    let processedCount = 0;

    for (const contact of targets) {
      setProcessingContactId(contact.id);

      const rel = contact.relationship?.trim() ? contact.relationship : '朋友';
      const mem = contact.memories?.trim() ? contact.memories : '感谢过去一年的陪伴与支持，祝新年快乐';

      try {
        const greetings = await api.generateGreetings(contact.name, rel, mem);

        // Persist to backend
        await api.updateContact(contact.id, {
          relationship: rel,
          memories: mem,
          generatedGreetings: greetings,
        });

        setContacts(prev => prev.map(c => c.id === contact.id ? {
          ...c,
          relationship: rel,
          memories: mem,
          generatedGreetings: greetings
        } : c));

      } catch (e) {
        console.error(`Failed to generate for ${contact.name}`, e);
      } finally {
        processedCount++;
        setGenerationProgress({ current: processedCount, total: targets.length });
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setProcessingContactId(null);
    setIsGeneratingAll(false);
    if (processedCount > 0) {
      setTimeout(() => alert("🎉 批量生成完成！"), 300);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-festive-red mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500">正在加载...</p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case AppView.DASHBOARD:
        return (
          <Dashboard
            contacts={contacts}
            onAddContact={handleAddContact}
            onImportContacts={() => setCurrentView(AppView.IMPORT)}
            onSelectContact={handleSelectContact}
            onDeleteContact={handleDeleteContact}
            onGenerateAll={handleGenerateAll}
            isGeneratingAll={isGeneratingAll}
            generationProgress={generationProgress}
            processingContactId={processingContactId}
            onMarkAsBlessed={handleMarkAsBlessed}
          />
        );
      case AppView.IMPORT:
        return (
          <ImportScreen
            onImportComplete={handleImportComplete}
            onCancel={() => setCurrentView(AppView.DASHBOARD)}
          />
        );
      case AppView.MEMORY_INPUT:
        const inputContact = contacts.find(c => c.id === selectedContactId);
        return inputContact ? (
          <MemoryInput
            contact={inputContact}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        ) : null;
      case AppView.PREVIEW:
        const previewContact = contacts.find(c => c.id === selectedContactId);
        return previewContact ? (
          <PreviewScreen
            contact={previewContact}
            onSave={async (updated) => {
              try {
                await api.updateContact(updated.id, updated);
                setContacts(prev => prev.map(c => c.id === updated.id ? updated : c));
              } catch (error) {
                console.error('Failed to save contact:', error);
              }
            }}
            onMarkAsBlessed={handleMarkAsBlessed}
          />
        ) : null;
      default:
        return <div>Not found</div>;
    }
  };

  return (
    <div className="min-h-screen text-gray-800 font-sans">
      <Header
        currentView={currentView}
        onBack={() => {
          if (currentView === AppView.PREVIEW) {
            const contact = contacts.find(c => c.id === selectedContactId);
            if (contact?.generatedGreetings) {
              setCurrentView(AppView.DASHBOARD);
            } else {
              setCurrentView(AppView.MEMORY_INPUT);
            }
          } else if (currentView === AppView.MEMORY_INPUT) {
            setCurrentView(AppView.DASHBOARD);
          } else {
            setCurrentView(AppView.DASHBOARD);
          }
        }}
      />
      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;