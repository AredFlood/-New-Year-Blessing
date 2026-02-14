import React, { useState } from 'react';
import { Contact, GreetingType } from '../types';
import { Button } from './Button';

interface DashboardProps {
  contacts: Contact[];
  onAddContact: (name: string) => void;
  onImportContacts: () => void;
  onSelectContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
  onGenerateAll: () => void;
  isGeneratingAll: boolean;
  generationProgress: { current: number; total: number };
  processingContactId?: string | null;
  onMarkAsBlessed: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  contacts, 
  onAddContact, 
  onImportContacts, 
  onSelectContact,
  onDeleteContact,
  onGenerateAll,
  isGeneratingAll,
  generationProgress,
  processingContactId,
  onMarkAsBlessed
}) => {
  // Local state to track which greeting style is showing for each contact
  const [activeStyles, setActiveStyles] = useState<Record<string, GreetingType>>({});
  const [listTab, setListTab] = useState<'pending' | 'blessed'>('pending');
  
  // Modal state for adding contact
  const [showAddModal, setShowAddModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');

  const getActiveStyle = (id: string) => activeStyles[id] || GreetingType.FORMAL;

  const handleStyleChange = (id: string, type: GreetingType, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveStyles(prev => ({ ...prev, [id]: type }));
  };

  const getGreetingContent = (contact: Contact) => {
    if (!contact.generatedGreetings) return null;
    const type = getActiveStyle(contact.id);
    switch (type) {
      case GreetingType.FORMAL: return contact.generatedGreetings.formal;
      case GreetingType.CASUAL: return contact.generatedGreetings.casual;
      case GreetingType.CREATIVE: return contact.generatedGreetings.creative[0]?.content || '';
      default: return '';
    }
  };

  const copyGreeting = (text: string, contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    if (!contact.isBlessed) {
      onMarkAsBlessed(contact.id);
      alert('已复制！好友已移入“已祝福”列表');
    } else {
      alert('已复制！');
    }
  };

  const handleConfirmAdd = () => {
    if (newContactName.trim()) {
      onAddContact(newContactName.trim());
      setNewContactName('');
      setShowAddModal(false);
    }
  };

  const pendingContacts = contacts.filter(c => !c.isBlessed);
  const blessedContacts = contacts.filter(c => c.isBlessed);
  
  const displayedContacts = listTab === 'pending' ? pendingContacts : blessedContacts;

  const renderContactCard = (contact: Contact) => {
    const greetingText = getGreetingContent(contact);
    const activeStyle = getActiveStyle(contact.id);
    const isProcessing = contact.id === processingContactId;

    return (
      <div 
        key={contact.id} 
        className={`group bg-white rounded-xl shadow-sm hover:shadow-md transition border ${isProcessing ? 'border-orange-200 ring-1 ring-orange-100' : 'border-transparent hover:border-red-100'} overflow-hidden mb-4`}
      >
        {/* Header Row: Clickable to go to detail */}
        <div 
          onClick={() => onSelectContact(contact)}
          className="p-4 flex justify-between items-center cursor-pointer border-b border-gray-50 bg-gray-50/50"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${contact.avatarColor || 'bg-festive-red'} transition-transform group-hover:scale-105`}>
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm">{contact.name}</h4>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
                  {contact.relationship || '朋友'}
                </span>
                {!contact.generatedGreetings && (
                  isProcessing ? (
                      <span className="text-[10px] text-orange-500 font-bold flex items-center">
                        <svg className="animate-spin w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        生成中...
                      </span>
                  ) : (
                      <span className="text-[10px] text-red-400 font-medium">
                        {isGeneratingAll ? '等待生成...' : '待生成'}
                      </span>
                  )
                )}
                {contact.isBlessed && (
                  <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-bold flex items-center">
                     <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polyline points="20 6 9 17 4 12"/></svg>
                     已祝福
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteContact(contact.id); }}
              className="p-2 text-gray-300 hover:text-red-500 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>

        {/* Body: Greeting Content */}
        {contact.generatedGreetings ? (
          <div className="p-4 bg-white animate-in fade-in duration-500">
            {/* Style Tabs */}
            <div className="flex gap-2 mb-3">
               <button 
                 onClick={(e) => handleStyleChange(contact.id, GreetingType.FORMAL, e)}
                 className={`px-3 py-1 rounded-full text-xs transition ${activeStyle === GreetingType.FORMAL ? 'bg-red-50 text-red-600 font-bold border border-red-100' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 正式
               </button>
               <button 
                 onClick={(e) => handleStyleChange(contact.id, GreetingType.CASUAL, e)}
                 className={`px-3 py-1 rounded-full text-xs transition ${activeStyle === GreetingType.CASUAL ? 'bg-red-50 text-red-600 font-bold border border-red-100' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 日常
               </button>
               <button 
                 onClick={(e) => handleStyleChange(contact.id, GreetingType.CREATIVE, e)}
                 className={`px-3 py-1 rounded-full text-xs transition ${activeStyle === GreetingType.CREATIVE ? 'bg-red-50 text-red-600 font-bold border border-red-100' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 创意
               </button>
            </div>

            {/* Text Content */}
            <div className="relative bg-paper-cream p-3 rounded-lg border border-yellow-100 mb-2">
              <p className="text-sm text-gray-700 font-serif leading-relaxed min-h-[60px]">
                {greetingText}
              </p>
            </div>

            {/* Copy Action */}
            <div className="flex justify-end">
              <button 
                onClick={(e) => copyGreeting(greetingText || '', contact, e)}
                className={`flex items-center text-xs transition px-3 py-1.5 rounded-full ${
                  contact.isBlessed 
                  ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                  : 'bg-red-50 text-festive-red hover:bg-red-100'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                {contact.isBlessed ? '已复制' : '复制'}
              </button>
            </div>
          </div>
        ) : (
          /* Placeholder for ungenerated contacts */
          <div 
             onClick={() => onSelectContact(contact)}
             className="px-4 py-6 text-center cursor-pointer hover:bg-gray-50 transition"
          >
            <p className="text-sm text-gray-400 mb-2">
              {isProcessing ? '✨ 正在为您撰写中...' : '✨ 还没生成祝福哦'}
            </p>
            <span className="text-xs text-festive-red font-medium border-b border-festive-red/30 pb-0.5">
               {isProcessing ? '请稍候' : '点击去生成'}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto pb-24 relative">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-50 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400"></div>
        <h2 className="text-2xl font-serif text-festive-dark mb-1 font-bold">新年大吉!</h2>
        <p className="text-xs text-gray-500 mb-5">你的新年祝福灵感帮手</p>
        
        <div className="space-y-3">
          {isGeneratingAll ? (
            <div className="w-full bg-white p-3 rounded-lg border border-red-100">
               <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span className="font-bold text-festive-red">正在生成祝福...</span>
                <span>{generationProgress.current} / {generationProgress.total}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-festive-red h-2.5 rounded-full transition-all duration-300 ease-out relative" 
                  style={{ width: `${generationProgress.total > 0 ? (generationProgress.current / generationProgress.total) * 100 : 0}%` }}
                >
                   <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 text-center">
                 {generationProgress.current < generationProgress.total ? 'AI正在为您撰写中...' : '即将完成...'}
              </p>
            </div>
          ) : (
            <Button 
              onClick={onGenerateAll} 
              isLoading={isGeneratingAll}
              disabled={contacts.length === 0}
              className="w-full shadow-md bg-festive-red border-none text-white font-bold"
            >
              ✨ 一键生成所有祝福
            </Button>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={onImportContacts} 
              disabled={isGeneratingAll}
              className="w-full text-xs py-2 h-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              批量导入
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setShowAddModal(true)} 
              disabled={isGeneratingAll}
              className="w-full text-xs py-2 h-10 bg-orange-100 text-orange-700 border border-orange-200 shadow-none hover:bg-orange-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              手动添加
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
        <button
            onClick={() => setListTab('pending')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${listTab === 'pending' ? 'bg-white text-festive-dark shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
            待祝福
            <span className={`ml-1.5 text-xs font-normal px-1.5 py-0.5 rounded-full ${listTab === 'pending' ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-500'}`}>
                {pendingContacts.length}
            </span>
        </button>
        <button
            onClick={() => setListTab('blessed')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${listTab === 'blessed' ? 'bg-white text-festive-dark shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
            已祝福
            <span className={`ml-1.5 text-xs font-normal px-1.5 py-0.5 rounded-full ${listTab === 'blessed' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                {blessedContacts.length}
            </span>
        </button>
      </div>

      {/* Contact List */}
      <div>
        <div className="space-y-4">
          {displayedContacts.length === 0 ? (
             <div className="text-center py-10 bg-white/50 rounded-xl border-dashed border-2 border-gray-200">
                <p className="text-gray-400 text-sm">
                   {listTab === 'pending' 
                        ? (contacts.length === 0 ? "暂无联系人，快去添加吧" : "🎉 所有好友都已收到祝福！") 
                        : "还没有已祝福的好友"}
                </p>
             </div>
          ) : (
             displayedContacts.map(renderContactCard)
          )}
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl scale-100 transform transition-all">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">添加好友</h3>
            <input 
              type="text" 
              placeholder="请输入好友名字"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl mb-6 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
              autoFocus
            />
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowAddModal(false)} className="flex-1">
                取消
              </Button>
              <Button onClick={handleConfirmAdd} className="flex-1">
                确认
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};