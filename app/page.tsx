'use client';
import { useState, useEffect } from 'react';

export default function Page() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I’m your AI greeting card designer. What kind of card would you like to create today?', action: null }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [latestAction, setLatestAction] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [revisionMode, setRevisionMode] = useState(false);
  const [revisionText, setRevisionText] = useState('');
  const [imageRequested, setImageRequested] = useState(false);

  const sendMessage = async () => {
    const newMessages = [...messages, { role: 'user', content: input, action: null }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const res = await fetch('/api/chat-designer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages.map(({ role, content }) => ({ role, content })) }),
    });

    const data = await res.json();

    setMessages([...newMessages, { role: 'assistant', content: data.reply, action: data.action || null }]);
    setLatestAction(data.action || null);
    setSummary(data.summary || null);
    setLoading(false);
  };

  const postToZapier = async (payload: Record<string, any>) => {
    const res = await fetch('/api/trigger-zap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok) {
      alert('Zapier webhook failed.');
      console.error(result);
    } else {
      alert('Request sent to Zapier!');
    }
  };

  const handleGenerateCard = async () => {
    if (!summary) return;
    await postToZapier({ summary });
    setImageRequested(true);
  };

  const handleReviseCard = async () => {
    if (!summary || !revisionText || !image) return;
    await postToZapier({ summary, revision: revisionText, image });
    setRevisionMode(false);
    setRevisionText('');
    setImage(null);
    setImageRequested(true);
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!imageRequested) return;
      const res = await fetch('/api/receive-image');
      const data = await res.json();
      if (data.url && data.url !== image) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Here’s your generated card!', action: null },
        ]);
        setImage(data.url);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [image, imageRequested]);

  return (
    <div className="min-h-screen flex flex-col bg-pink-50 font-sans">
      <header className="bg-white shadow p-4 text-center text-xl font-bold text-pink-600">
        💌 PaperHugs Chat
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto p-4">
        <div className="flex flex-col space-y-3 overflow-y-auto max-h-[70vh] bg-white p-4 rounded-lg shadow-inner">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-2 rounded-2xl max-w-xs text-sm whitespace-pre-line ${m.role === 'user' ? 'bg-pink-100 text-right' : 'bg-pink-200 text-left'}`}>
                {m.content}
              </div>
            </div>
          ))}

          {loading && <div className="text-gray-400">✍️ Thinking...</div>}

          {image && (
            <div className="text-center mt-4">
              <img src={image} alt="Generated greeting card" className="rounded-xl shadow max-w-full mx-auto" />
              {!revisionMode && (
                <button
                  onClick={() => setRevisionMode(true)}
                  className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded shadow"
                >
                  ✏️ Revise This Image
                </button>
              )}
              {revisionMode && (
                <div className="mt-4">
                  <textarea
                    value={revisionText}
                    onChange={(e) => setRevisionText(e.target.value)}
                    placeholder="Describe what you'd like to change"
                    className="w-full border p-2 mb-2 rounded"
                  />
                  <button
                    onClick={handleReviseCard}
                    className="bg-purple-600 text-white px-4 py-2 rounded"
                  >
                    🔁 Submit Revision
                  </button>
                </div>
              )}
            </div>
          )}

          {latestAction === 'ready_to_generate' && summary && !image && (
            <div className="text-center mt-4">
              <button
                onClick={handleGenerateCard}
                className="bg-purple-600 text-white px-6 py-3 rounded shadow"
              >
                🎨 Generate Card
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2 items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 border border-pink-300 p-3 rounded-full shadow-sm"
            placeholder="Type your message..."
          />
          <button
            onClick={sendMessage}
            className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-full shadow"
          >
            Send
          </button>
        </div>
      </main>

      <footer className="text-center text-xs text-pink-400 py-4">
        &copy; {new Date().getFullYear()} PaperHugs.ai — crafted with ❤️
      </footer>
    </div>
  );
}
