import React, { useState, useEffect } from 'react';
import { Contact, GreetingType } from '../types';
import { Button } from './Button';

interface PreviewScreenProps {
  contact: Contact;
  onSave: (updatedContact: Contact) => void;
  onMarkAsBlessed: (id: string) => void;
}

export const PreviewScreen: React.FC<PreviewScreenProps> = ({ contact, onSave, onMarkAsBlessed }) => {
  const [activeTab, setActiveTab] = useState<GreetingType>(GreetingType.FORMAL);
  const [creativeIndex, setCreativeIndex] = useState(0);
  const [editableText, setEditableText] = useState('');

  if (!contact.generatedGreetings) return null;

  // Update text when tab changes
  useEffect(() => {
    let text = '';
    switch (activeTab) {
      case GreetingType.FORMAL:
        text = contact.generatedGreetings?.formal || '';
        break;
      case GreetingType.CASUAL:
        text = contact.generatedGreetings?.casual || '';
        break;
      case GreetingType.CREATIVE:
        text = contact.generatedGreetings?.creative[creativeIndex]?.content || '';
        break;
    }
    setEditableText(text);
  }, [activeTab, creativeIndex, contact]);

  const handleCopy = () => {
    if (editableText) {
      navigator.clipboard.writeText(editableText);
      onMarkAsBlessed(contact.id);
      alert('已复制到剪贴板！好友已移入“已祝福”列表');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      {/* Tabs */}
      <div className="flex bg-white rounded-xl p-1 mb-6 shadow-sm border border-gray-100">
        <button
          onClick={() => setActiveTab(GreetingType.FORMAL)}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${activeTab === GreetingType.FORMAL ? 'bg-festive-red text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          正式书面
        </button>
        <button
          onClick={() => setActiveTab(GreetingType.CASUAL)}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${activeTab === GreetingType.CASUAL ? 'bg-festive-red text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          日常口语
        </button>
        <button
          onClick={() => setActiveTab(GreetingType.CREATIVE)}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${activeTab === GreetingType.CREATIVE ? 'bg-festive-red text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          花式创意
        </button>
      </div>

      {/* Creative Sub-selector */}
      {activeTab === GreetingType.CREATIVE && contact.generatedGreetings.creative.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
          {contact.generatedGreetings.creative.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setCreativeIndex(idx)}
              className={`whitespace-nowrap px-3 py-1 rounded-full text-xs border ${creativeIndex === idx
                  ? 'bg-festive-gold text-festive-dark border-festive-gold font-bold'
                  : 'bg-white text-gray-500 border-gray-200'
                }`}
            >
              {item.title}
            </button>
          ))}
        </div>
      )}

      {/* Editable Card Area */}
      <div className="mb-6 relative">
        <div
          className="w-full bg-[#E63946] rounded-xl shadow-xl overflow-hidden p-6"
          style={{
            backgroundImage: `url("https://www.transparenttextures.com/patterns/black-scales.png"), linear-gradient(135deg, #D92525 0%, #B91C1C 100%)`
          }}
        >
          <div className="mb-2 text-yellow-300 font-serif italic text-sm text-center">To: {contact.name}</div>

          <textarea
            value={editableText}
            onChange={(e) => setEditableText(e.target.value)}
            className="w-full min-h-[250px] bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 text-white font-serif text-lg leading-relaxed resize-none focus:outline-none focus:bg-white/20 focus:border-yellow-300/50 transition"
          />

          <div className="mt-4 text-center text-yellow-300/80 text-xs font-medium uppercase tracking-widest">
            2026 · 马年大吉
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button variant="secondary" onClick={handleCopy} className="w-full py-3 text-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
          一键复制祝福
        </Button>
        <p className="text-center text-xs text-gray-400">点击上方文字可直接修改，复制后可粘贴至微信发送</p>
      </div>
    </div>
  );
};