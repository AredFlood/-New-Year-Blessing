import React, { useState, useRef, useEffect } from 'react';
import { Contact } from '../types';
import { Button } from './Button';
import { transcribeAudio } from '../services/api';

interface MemoryInputProps {
  contact: Contact;
  onGenerate: (data: { relationship: string; memories: string }) => void;
  isGenerating: boolean;
}

const PRESET_RELATIONSHIPS = ['同事', '导师', '朋友', '领导', '亲戚'];

export const MemoryInput: React.FC<MemoryInputProps> = ({ contact, onGenerate, isGenerating }) => {
  const [relationship, setRelationship] = useState(contact.relationship || '');
  const [memories, setMemories] = useState(contact.memories || '');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Cleanup media recorder on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await handleTranscription(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("无法访问麦克风，请检查权限设置。");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscription = async (blob: Blob) => {
    setIsTranscribing(true);
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      const base64Audio = (reader.result as string).split(',')[1];
      const text = await transcribeAudio(base64Audio);
      setMemories(prev => (prev ? `${prev}\n${text}` : text));
      setIsTranscribing(false);
    };
  };

  const handleSubmit = () => {
    if (!relationship.trim()) {
      alert("请填写与对方的关系");
      return;
    }
    onGenerate({ relationship, memories });
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-24">
      <div className="bg-white rounded-2xl p-6 shadow-md mb-6 border border-gray-50">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8 pt-2">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold ${contact.avatarColor || 'bg-festive-red'} mb-3 shadow-md`}>
            {contact.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-serif text-gray-800 font-bold">{contact.name}</h2>
          <p className="text-sm text-gray-400">正在为他/她定制祝福...</p>
        </div>

        <div className="space-y-6">
          {/* Relationship Section with Blue Border */}
          <div className="p-4 border-2 border-blue-200/60 rounded-xl bg-blue-50/20">
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">关系 / 称呼</label>
            <input
              type="text"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="例如：导师、发小、重要客户"
              className="w-full p-3 bg-white rounded-lg border border-gray-200 focus:border-festive-red focus:ring-1 focus:ring-festive-red outline-none transition text-gray-700 text-sm"
            />
            {/* Chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              {PRESET_RELATIONSHIPS.map(rel => (
                <button
                  key={rel}
                  onClick={() => setRelationship(rel)}
                  className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-500 hover:border-festive-red hover:text-festive-red transition active:bg-gray-50"
                >
                  {rel}
                </button>
              ))}
            </div>
          </div>

          {/* Memory Section */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">过去一年的回忆 & 关键词</label>
            <div className="relative">
              <textarea
                value={memories}
                onChange={(e) => setMemories(e.target.value)}
                placeholder="这一年有什么特殊经历？例如：'感谢三月份项目上线时的帮助'..."
                className="w-full p-4 h-32 bg-gray-50 rounded-xl border border-gray-200 focus:border-festive-red focus:ring-1 focus:ring-festive-red outline-none transition resize-none text-sm text-gray-700"
              />

              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
                className={`absolute bottom-3 right-3 p-2 rounded-full transition-all shadow-sm ${isRecording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                  } ${isTranscribing ? 'opacity-50' : ''}`}
                title={isRecording ? "停止录音" : "语音输入"}
              >
                {isTranscribing ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" /></svg>
                )}
              </button>
            </div>
            {isRecording && <p className="text-xs text-red-500 mt-1 animate-pulse">正在录音... 再次点击停止</p>}
          </div>

          <Button
            onClick={handleSubmit}
            isLoading={isGenerating}
            className="w-full py-3.5 text-lg font-bold shadow-xl bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 border-none rounded-full"
          >
            生成祝福 ✨
          </Button>
        </div>
      </div>
    </div>
  );
};