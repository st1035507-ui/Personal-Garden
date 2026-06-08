import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 靜態官方角色資料庫（產品規格書 7~10 頁規格）
const characterDatabase: Record<string, any> = {
  "1": {
    characterName: "小刺球 🦔",
    whyAppeared: "小刺球會出現,通常是因為你其實很在意這件事,但又不想讓自己太快受傷。你可能不是不想面對,而是還沒有找到一個讓自己安心靠近的方法。",
    reminder: "Momo 發現今天花園裡出現了小刺球呢! 看來是你很擔心接下來會發生什麼事呢! 不過沒關係,不用每件事都做到完美,也不用每一個時刻都很勇敢。今天的你,只要往前滾一小段路,也是一種前進喔~",
    dailyTask: "做一件你想做很久但遲遲不敢做的事。不用做到完美,只要開始做就好！"
  },
  "2": {
    characterName: "牽牽藤 🌿",
    whyAppeared: "牽牽藤會出現是因為你很捨不得這件事,你不是不願意前進,只是這些故事對你來說太重要。沒關係的!捨不得本來就是「珍惜」的一種表現,不用急著讓自己放下。",
    reminder: "Momo 發現今天花園裡出現了牽牽藤呢! 今天就再多陪這段故事一下吧~",
    dailyTask: "回想一件自己遲遲放不下的事,並問問自己:「如果我再給這件事一次機會,我會希望它變成什麼樣子?」並且把答案記下來。"
  },
  "3": {
    characterName: "向陽葵 🌻",
    whyAppeared: "今天會有向陽葵的出現,看起來是你最近心裡有很多的想法在不停打轉,你希望被別人理解,同時也很願意聆聽其他人的想法,這是一件很難能可貴的事。",
    reminder: "Momo 發現今天花園裡出現了向陽葵呢! 或許,今天的答案不是在於說服誰,而是在你們的交流中慢慢長出來!",
    dailyTask: "找一個你信任的人,和他/她分享最近你很猶豫、迷茫的一件事,試著認真聽完他/慢的想法,不急著反駁或是下結論。"
  },
  "4": {
    characterName: "慢慢龜 🐢",
    whyAppeared: "今天慢慢龜會出現,是因為你很為他人著想呢!為別人著想是一件很體貼的事,可是啊~要時刻記得你的感受也跟他人的感受一樣重要喔!",
    reminder: "Momo 發現今天花園裡出現了慢慢龜呢! 今天也試著把自己的需求放進選項裡看看吧!",
    dailyTask: "對一件小事表達自己的想法吧!可以是自己晚餐比較想吃什麼,或是自己其實不喜歡做什麼事。只要先表達自己的想法一次試試就可以了!"
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { worryTypeId, moodIndex, emotionText } = body;

    const searchKey = String(moodIndex).trim();
    const baseCharacter = characterDatabase[searchKey];

    if (!baseCharacter) {
      throw new Error("找不到對應的心境角色選項");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn("尚未偵測到 GEMINI_API_KEY，目前以靜態官方文案保底回傳。");
      return NextResponse.json(baseCharacter);
    }

    // 初始化 Google 官方 SDK (自動處理端點與安全連線)
    const ai = new GoogleGenerativeAI(apiKey);
    
    // 使用最新、最穩定的 1.5 Flash 模型
    const model = ai.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7
      }
    });

    // 建立提示詞
    const systemInstruction = `
You are Momo, the wise and warm owl guide of "Persona Garden".
Your personality is gentle, empathetic, and never judgmental. You help users understand their current emotional state based on their scenario and choices.

The user has triggered a specific core character in the garden: "${baseCharacter.characterName}".
Official base context for this character:
- Why appeared: ${baseCharacter.whyAppeared}
- Momo's reminder: ${baseCharacter.reminder}
- Daily task: ${baseCharacter.dailyTask}

Current User Input Data:
- Worry Category: ${worryTypeId}
- Chosen Mood Option Number: ${moodIndex}
- Specific User Emotion/Text: "${emotionText || 'User did not write extra text.'}"

Your Task:
Based on the official base context, rewrite and fine-tune the fields ("whyAppeared", "reminder", "dailyTask") to closely align with the user's specific worry and custom emotion text, while strictly maintaining the original soul, character name, and the core message of the official documentation. Keep the tone comforting, poetic, and supportive in Traditional Chinese (zh-TW).

Respond ONLY with a valid JSON object matching this structure (do not include markdown block formatting):
{
  "characterName": "${baseCharacter.characterName}",
  "whyAppeared": "Tailored explanation incorporating user's worry and text...",
  "reminder": "Momo's tailored comforting reminder...",
  "dailyTask": "A specific, low-pressure task tailored to their situation..."
}
`;

    // 呼叫官方 SDK 生成內容
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemInstruction }] }]
    });

    const aiResponseText = result.response.text();

    if (aiResponseText) {
      const parsedResult = JSON.parse(aiResponseText.trim());
      return NextResponse.json(parsedResult);
    }

    return NextResponse.json(baseCharacter);

  } catch (error: any) {
    console.error("Gemini SDK 處理失敗，走保底機制：", error);
    try {
      const body = await request.json();
      const searchKey = String(body.moodIndex).trim();
      return NextResponse.json(characterDatabase[searchKey] || characterDatabase["1"]);
    } catch {
      return NextResponse.json(characterDatabase["1"]);
    }
  }
}