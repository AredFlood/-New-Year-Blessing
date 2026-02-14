import OpenAI from 'openai';

const apiKey = process.env.DEEPSEEK_API_KEY;
if (!apiKey) {
    throw new Error('Missing DEEPSEEK_API_KEY environment variable');
}

const client = new OpenAI({
    apiKey,
    baseURL: 'https://api.deepseek.com',
});

/**
 * Parses contact names from an uploaded image (screenshot of a contact list).
 * Note: DeepSeek does not support vision/image input, so we parse text-described images.
 * For image parsing, we'll need to use a different approach.
 */
export const parseContactsFromImage = async (base64Image: string): Promise<string[]> => {
    try {
        // DeepSeek doesn't support image input directly.
        // We send the base64 as a vision message (deepseek-chat supports vision in some versions)
        // If not supported, return empty and let user use text import instead.
        const response = await client.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`,
                            },
                        },
                        {
                            type: 'text',
                            text: 'Extract all the names of people visible in this contact list screenshot. Return ONLY a valid JSON array of strings, e.g., ["张三", "李四"]. Do not include phone numbers or other text.',
                        },
                    ],
                },
            ],
        });

        let jsonText = response.choices[0]?.message?.content || '[]';
        jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();

        const names = JSON.parse(jsonText);
        return Array.isArray(names) ? names : [];
    } catch (error) {
        console.error('Error parsing contacts:', error);
        return [];
    }
};

/**
 * Transcribes audio input.
 * Note: DeepSeek does not support audio input natively.
 * Returns empty string - user should type instead.
 */
export const transcribeAudio = async (_base64Audio: string): Promise<string> => {
    console.warn('DeepSeek does not support audio transcription. Please use text input.');
    return '';
};

/**
 * Generates personalized greetings based on input.
 */
export const generateGreetings = async (
    name: string,
    relationship: string,
    memories: string
): Promise<any> => {
    const safeRelationship = relationship?.trim() ? relationship : '朋友';
    const safeMemories = memories?.trim()
        ? memories
        : '感谢过去一年的陪伴与支持，祝新年快乐';

    const prompt = `你是一位中国新年祝福和社交礼仪大师。

重要背景信息:
- 当前年份: 2026年
- 生肖年: 马年（丙午年）
- 所有祝福必须围绕2026马年来写，多使用与"马"相关的成语和吉祥话，如：马到成功、龙马精神、一马当先、万马奔腾、马上有福等。

收信人姓名: ${name}
与收信人的关系: ${safeRelationship}
特别回忆/背景: ${safeMemories}

任务: 根据提供的回忆，为此人生成3种不同类型的2026马年新年祝福（中文）。

1. "formal" (正式书面版): 优雅、尊敬、适合长辈或专业联系人。融入马年元素和相关成语。
2. "casual" (日常口语版): 温暖、友好、真实，适合微信发给亲密朋友。自然地融入马年元素。
3. "creative" (花式创意版): 提供3个不同的创意选项。
   - 重要: 其中一个选项必须是使用"${name}"的字作为每行开头的"姓名藏头诗"，并融入马年主题。
   - 其他两个可以是马年主题短诗、幽默段子或与马相关的谐音祝福。

请严格按照以下JSON格式输出，不要包含任何其他文字或markdown代码块：
{
  "formal": "正式祝福内容",
  "casual": "日常祝福内容",
  "creative": [
    {"id": "1", "title": "创意标题1", "content": "创意内容1", "tags": ["标签1"]},
    {"id": "2", "title": "创意标题2", "content": "创意内容2", "tags": ["标签2"]},
    {"id": "3", "title": "姓名藏头诗", "content": "藏头诗内容", "tags": ["藏头诗"]}
  ]
}`;

    try {
        const response = await client.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                {
                    role: 'system',
                    content: '你是一位2026马年新年祝福生成助手。今年是2026年，马年（丙午年），所有祝福都应围绕马年主题来写。请严格按照用户要求的JSON格式输出，不要包含任何额外文字、解释或markdown代码块。只输出纯JSON。',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.8,
        });

        const text = response.choices[0]?.message?.content || '{}';
        return JSON.parse(text);
    } catch (error) {
        console.error('Error generating greetings:', error);
        throw new Error('Failed to generate greetings.');
    }
};
