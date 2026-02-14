import React, { useState } from 'react';
import { Button } from './Button';
import { parseContactsImage } from '../services/api';

interface ImportScreenProps {
  onImportComplete: (names: string[]) => void;
  onCancel: () => void;
}

export const ImportScreen: React.FC<ImportScreenProps> = ({ onImportComplete, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeMethod, setActiveMethod] = useState<'image' | 'text'>('image');
  const [textInput, setTextInput] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("图片过大，请上传5MB以内的图片");
      return;
    }

    setIsProcessing(true);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = (reader.result as string).split(',')[1];
        const names = await parseContactsImage(base64String);
        if (names.length === 0) {
          setError("未识别到姓名，请尝试更清晰的截图");
        } else {
          onImportComplete(names);
        }
      } catch (err) {
        setError("图片处理失败，请重试");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTextSubmit = () => {
    const names = textInput.split(/[\n,，、]/)
      .map(n => n.trim())
      .filter(n => n.length > 0);

    if (names.length === 0) {
      setError("请输入至少一个名字");
      return;
    }
    onImportComplete(names);
  };

  return (
    <div className="p-6 max-w-md mx-auto h-auto min-h-[80vh] flex flex-col items-center justify-center text-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full border border-gray-100">
        <div className="w-16 h-16 bg-red-100 text-festive-red rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-6">导入好友列表</h2>

        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveMethod('image')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${activeMethod === 'image' ? 'bg-white shadow text-festive-red' : 'text-gray-500'}`}
          >
            截图识别
          </button>
          <button
            onClick={() => setActiveMethod('text')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${activeMethod === 'text' ? 'bg-white shadow text-festive-red' : 'text-gray-500'}`}
          >
            文本粘贴
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {activeMethod === 'image' ? (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">上传微信/通讯录的好友列表截图</p>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={isProcessing}
              />
              <label htmlFor="file-upload" className="block w-full">
                <Button variant="primary" className="w-full justify-center" isLoading={isProcessing} disabled={isProcessing} onClick={() => document.getElementById('file-upload')?.click()}>
                  {isProcessing ? '正在分析...' : '选择图片'}
                </Button>
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">直接粘贴名字，用逗号或换行分隔</p>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="例如：&#10;张三&#10;李四&#10;王五"
              className="w-full p-3 h-32 bg-gray-50 rounded-xl border border-gray-200 focus:border-festive-red focus:ring-1 focus:ring-festive-red outline-none transition resize-none text-sm"
            />
            <Button variant="primary" className="w-full justify-center" onClick={handleTextSubmit}>
              确认导入
            </Button>
          </div>
        )}

        <button onClick={onCancel} className="mt-6 text-gray-400 text-sm hover:text-gray-600">
          取消
        </button>
      </div>
    </div>
  );
};