import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 靜態官方角色資料庫
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
  // 1. 先處理並暫存 body，避免重複讀取造成的錯誤
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "無效的請求格式" }, { status: 400 });
  }

  const { worryTypeId, moodIndex, emotionText } = body;
  console.log("前端傳來的資料:", { worryTypeId, moodIndex, emotionText });

  const searchKey = String(moodIndex || "1").trim();
  const baseCharacter = characterDatabase[searchKey] || characterDatabase["1"];

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key 未設定");

    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ 
      model: 'gemini-3.5-flash',
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7
      }
    });

    const systemInstruction = `
You are Momo, the wise and warm owl guide of "Persona Garden".
Your personality is gentle, empathetic, and never judgmental. 

Current User Context:
- Character Triggered: ${baseCharacter.characterName}
- Official Base Context: ${JSON.stringify(baseCharacter)}
- User Emotion Text: "${emotionText || 'User did not write extra text.'}"

Task: Rewrite the "whyAppeared", "reminder", and "dailyTask" fields to be deeply tailored to the user's emotion text, while keeping the character's soul and name intact. Output ONLY valid JSON.
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemInstruction }] }]
    });

    const aiResponseText = result.response.text();
    const parsedResult = JSON.parse(aiResponseText.trim());
    return NextResponse.json(parsedResult);

  } catch (error: any) {
    console.error("AI 生成失敗詳細資訊:", error);
    // 發生任何錯誤時，直接回傳原本設定好的靜態資料
    return NextResponse.json(baseCharacter);
  }
}