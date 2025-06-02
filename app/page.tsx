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
  };

  const handleReviseCard = async () => {
    if (!summary || !revisionText) return;
    await postToZapier({ summary, revision: revisionText });
    setRevisionMode(false);
    setRevisionText('');
    setImage(null);
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch('/api/receive-image');
      const data = await res.json();
      if (data.url && !image) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Here’s your generated card!', action: null },
        ]);
        setImage(data.url);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [image]);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <div className="border rounded p-4 h-[500px] overflow-y-scroll bg-gray-50 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`mb-3 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block px-3 py-2 rounded-lg ${m.role === 'user' ? 'bg-blue-200' : 'bg-green-200'}`}>
              {m.content}
            </span>
          </div>
        ))}
        {loading && <div className="text-left text-gray-400">Typing...</div>}
        {image && (
          <div className="text-center mt-4">
            <img src={image} alt="Generated greeting card" className="max-w-full mx-auto rounded shadow mb-4" />
            {!revisionMode && (
              <button
                onClick={() => setRevisionMode(true)}
                className="bg-yellow-500 text-white px-4 py-2 rounded"
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
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 border p-2 rounded"
          placeholder="Type your message..."
        />
        <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
      </div>
    </div>
  );
}
