'use client';

import { useState } from 'react';

// 心情選項對照表（產品規格書 Page 3）
const moodOptionsData: Record<string, { index: number; text: string; emoji: string }[]> = {
  studies: [
    { index: 1, text: "我想先自己撐看看，不想太快麻煩別人", emoji: "🦔" },
    { index: 2, text: "我覺得再努力一下，應該還有機會變好", emoji: "🌸" },
    { index: 3, text: "我想知道其他人是不是也跟我一樣卡住", emoji: "🌻" },
    { index: 4, text: "我怕自己的狀態會影響到同組或身邊的人", emoji: "🐢" },
  ],
  work: [
    { index: 1, text: "我想先自己處理好，不太想讓別人看出我卡住", emoji: "🦔" },
    { index: 2, text: "我覺得再撐一下，也許事情就會有轉機", emoji: "🌸" },
    { index: 3, text: "我想找人聊聊，看是不是有其他做法", emoji: "🌻" },
    { index: 4, text: "我怕直接說出自己的想法，會造成別人困擾", emoji: "🐢" },
  ],
  love: [
    { index: 1, text: "我其實很在意，但不想讓自己看起來太受傷", emoji: "🦔" },
    { index: 2, text: "我知道可能該放下，但心裡還是捨不得", emoji: "🌸" },
    { index: 3, text: "我希望對方能懂我真正想說的是什麼", emoji: "🌻" },
    { index: 4, text: "我怕自己的決定會讓對方受傷", emoji: "🐢" },
  ],
  friendship: [
    { index: 1, text: "我其實有點受傷，但又不想表現得太在意", emoji: "🦔" },
    { index: 2, text: "我還是很珍惜這段關係，所以一直放不下", emoji: "🌸" },
    { index: 3, text: "我希望朋友能理解我真正介意的是什麼", emoji: "🌻" },
    { index: 4, text: "我怕說出來之後，會讓彼此變得尷尬", emoji: "🐢" },
  ]
};

export default function PersonaGarden() {
  // 流程步驟：1 = 首頁, 2 = 選擇煩惱類型, 3 = 選擇心情與情緒輸入, 4 = 結果卡片
  const [step, setStep] = useState<number>(1);
  
  // 使用者選擇的資料
  const [worryType, setWorryType] = useState<string | null>(null);
  const [selectedMoodIndex, setSelectedMoodIndex] = useState<number | null>(null);
  const [emotionText, setEmotionText] = useState<string>("");

  // API 回傳的角色資料
  const [character, setCharacter] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // 呼叫後端 API 生成小角色
  const handleGenerate = async () => {
    if (!selectedMoodIndex) {
      alert("請選擇一個最符合目前心情的選項喔！");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worryTypeId: worryType,
          moodIndex: selectedMoodIndex,
          emotionText: emotionText
        })
      });

      if (!response.ok) {
        throw new Error(`伺服器回應錯誤: ${response.status}`);
      }

      const data = await response.json();
      setCharacter(data);
      setStep(4); // 順利拿到結果，跳轉到第四步
    } catch (error) {
      console.error("詳細錯誤資訊:", error);
      alert("召喚過程被微風吹散了，請再試一次。");
    } finally {
      setLoading(false);
    }
  };

  // 重置花園狀態，回到選擇煩惱頁
  const handleReset = () => {
    setStep(2);
    setWorryType(null);
    setSelectedMoodIndex(null);
    setEmotionText("");
    setCharacter(null);
  };

  return (
    // 最外層容器：設定強制背景色，徹底解決 Next.js 全黑背景問題，並讓卡片完全置中
    <div style={{
      backgroundColor: '#faf8f5',
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {/* 中央主卡片容器 */}
      <div style={{
        width: '100%',
        maxWidth: '560px',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        padding: '36px',
        boxShadow: '0px 10px 30px rgba(122, 110, 93, 0.08)',
        border: '1px solid rgba(235, 230, 222, 0.5)',
        boxSizing: 'border-box'
      }}>
        
        {/* 頂部花園嚮導 Momo */}
        <div style={{ textAlign: 'center', marginBottom: '20px', fontSize: '36px' }}>🦉</div>

        {/* STEP 1: 首頁（Page 1） */}
        {step === 1 && (
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '28px', color: '#2c3e2f', marginBottom: '12px', fontWeight: 'bold' }}>
              Persona Garden
            </h1>
            <h2 style={{ fontSize: '18px', color: '#4a5d4e', marginBottom: '16px', fontWeight: '500' }}>
              今天的你，會長出哪一隻？
            </h2>
            <p style={{ color: '#6a7e6d', fontSize: '14px', lineHeight: '1.6', marginBottom: '32px' }}>
              選一個最近讓你猶豫的情境，讓花園嚮導 Momo 幫你看看，這個情境下的你長出了什麼樣的小角色。
            </p>
            <button 
              onClick={() => setStep(2)}
              style={{
                backgroundColor: '#3d4f41', color: '#fff', border: 'none',
                padding: '14px 48px', borderRadius: '24px', fontSize: '16px',
                cursor: 'pointer', fontWeight: '600', transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2c3a30'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3d4f41'}
            >
              開始探索
            </button>
          </div>
        )}

        {/* STEP 2: 選擇煩惱類型（Page 2） */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '20px', color: '#2c3e2f', marginBottom: '24px', textAlign: 'center', fontWeight: 'bold' }}>
              你最近有遇到什麼煩惱呢？
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { id: 'studies', label: '課業', desc: '面對學業、考試或未來的迷惘', icon: '📚', color: '#fffdf4', border: '#f6ebd2' },
                { id: 'work', label: '工作', desc: '職場人際、職涯瓶頸或緊繃節奏', icon: '💼', color: '#f5f9ff', border: '#dbe7f5' },
                { id: 'love', label: '愛情', desc: '情感盲區、捨不得或溝通的難題', icon: '❤️', color: '#fff5f5', border: '#f5dede' },
                { id: 'friendship', label: '友情', desc: '社交疲鄰、朋友圈的誤解與不安', icon: '👥', color: '#f4fbf7', border: '#daf2e6' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setWorryType(item.id);
                    setStep(3);
                  }}
                  style={{
                    padding: '20px 16px', borderRadius: '16px', border: `1px solid ${item.border}`,
                    backgroundColor: item.color, cursor: 'pointer', textAlign: 'center',
                    transition: 'transform 0.15s, box-shadow 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.03)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '26px', marginBottom: '8px' }}>{item.icon}</div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#333', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '12px', color: '#777', lineHeight: '1.4' }}>{item.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: 選擇心情與輸入情緒感受（Page 3） */}
        {step === 3 && worryType && (
          <div>
            <h2 style={{ fontSize: '18px', color: '#2c3e2f', marginBottom: '16px', fontWeight: 'bold' }}>
              想到這件事時，哪一句最像你現在的心情？
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {moodOptionsData[worryType].map((option) => (
                <label
                  key={option.index}
                  style={{
                    display: 'flex', alignItems: 'center', padding: '16px',
                    borderRadius: '12px', border: '1px solid',
                    borderColor: selectedMoodIndex === option.index ? '#3d4f41' : '#eaeaea',
                    backgroundColor: selectedMoodIndex === option.index ? '#f3f6f4' : '#ffffff',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="radio"
                    name="moodOption"
                    checked={selectedMoodIndex === option.index}
                    onChange={() => setSelectedMoodIndex(option.index)}
                    style={{ marginRight: '12px', accentColor: '#3d4f41' }}
                  />
                  <span style={{ fontSize: '14px', color: '#444', lineHeight: '1.4' }}>
                    {option.index}. {option.text}
                  </span>
                </label>
              ))}
            </div>

            <h2 style={{ fontSize: '16px', color: '#2c3e2f', marginBottom: '8px', fontWeight: 'bold' }}>
              最後，寫下這件事帶給你的情緒感受（選填）：
            </h2>
            <textarea
              value={emotionText}
              onChange={(e) => setEmotionText(e.target.value)}
              placeholder="例如：好累、很煩、怕後悔、不知道怎麼辦..."
              maxLength={200}
              style={{
                width: '100%', height: '90px', padding: '12px', borderRadius: '12px',
                border: '1px solid #eaeaea', marginBottom: '6px', fontSize: '14px',
                resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                color: '#333333',
                backgroundColor: '#ffffff'

              }}
            />
            <div style={{ textAlign: 'right', fontSize: '12px', color: '#aaa', marginBottom: '24px' }}>
              {emotionText.length}/200 字
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setStep(2)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '20px', border: '1px solid #ccc',
                  backgroundColor: '#fff', color: '#666', cursor: 'pointer', fontSize: '14px'
                }}
              >
                ⬅ 返回上一步
              </button>
              <button 
                onClick={handleGenerate}
                disabled={loading}
                style={{
                  flex: 1.5, padding: '12px', borderRadius: '20px', border: 'none',
                  backgroundColor: '#3d4f41', color: '#fff', fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                  fontSize: '14px'
                }}
              >
                {loading ? "正在聆聽花園的聲音..." : "看看今天長出誰 ✨"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: 結果卡片頁面（Page 4） */}
        {step === 4 && character && (
          <div>
            <div style={{ fontSize: '12px', color: '#999', letterSpacing: '1px', marginBottom: '4px', textAlign: 'center' }}>
              花園裡遇見的角色
            </div>
            <h2 style={{ fontSize: '26px', color: '#2c3e2f', marginTop: '0', marginBottom: '24px', fontWeight: 'bold', textAlign: 'center' }}>
              {character.characterName}
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <span style={{ backgroundColor: '#fdfaf2', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', color: '#7a6e5d' }}>
                👑 牠為什麼出現
              </span>
              <p style={{ fontSize: '14px', lineHeight: '1.6', marginTop: '8px', color: '#444' }}>
                {character.whyAppeared}
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <span style={{ backgroundColor: '#f4f8f5', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', color: '#3d5241' }}>
                🌿 牠想提醒你什麼
              </span>
              <p style={{ fontSize: '14px', lineHeight: '1.6', marginTop: '8px', color: '#444' }}>
                {character.reminder || character.reminderText}
              </p>
            </div>

            <div style={{ backgroundColor: '#fdfbfa', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #c9a054', marginBottom: '28px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#9c762b', marginBottom: '6px' }}>🎯 今日小任務</div>
              <p style={{ fontSize: '14px', margin: '0', color: '#555', lineHeight: '1.5' }}>
                {character.dailyTask}
              </p>
            </div>

            {/* 底部雙按鈕配置：完美排版，收藏在左、重來在右 */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => alert("小角色已經住進你的花園裡了。")}
                style={{
                  flex: 1, padding: '12px 20px', borderRadius: '20px',
                  border: '1px solid #ccc', backgroundColor: '#fff', color: '#444',
                  cursor: 'pointer', fontWeight: '500', fontSize: '14px'
                }}
              >
                收藏到我的花園
              </button>

              <button
                onClick={handleReset}
                style={{
                  flex: 1, padding: '12px 20px', borderRadius: '20px',
                  border: 'none', backgroundColor: '#e8e5de', color: '#444',
                  cursor: 'pointer', fontWeight: '500', fontSize: '14px'
                }}
              >
                再觀察一次
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}