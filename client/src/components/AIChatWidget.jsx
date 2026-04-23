import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm the ScamRadar Safety Assistant. Got a suspicious text, call, or email? Paste it here or ask me anything!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isOpen]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const { data } = await axios.post('/api/ai/chat', { query: userMessage });
      setMessages((prev) => [...prev, { role: 'ai', text: data.text }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'ai', text: '⚠️ Connection error. Please try checking the network or try again later.' }]);
    }
    setLoading(false);
  };

  const renderText = (text) => {
    return text.split('\n').map((line, i) => {
      if (!line.trim()) return null;
      return (
        <span key={i} className="block mb-2 last:mb-0">
          {line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              const inner = part.slice(2, -2);
              if (inner.includes('1930') || inner.includes('Found:')) {
                return <strong key={j} className="text-red font-black bg-red/10 px-1 rounded">{inner}</strong>;
              }
              return <strong key={j} className="text-white font-semibold">{inner}</strong>;
            }
            return part;
          })}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-red rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,45,85,0.4)] hover:scale-110 transition-transform z-50 group hover:shadow-[0_0_30px_rgba(255,45,85,0.6)]"
        >
          <div className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:animate-ping-slow" />
          <MessageSquare className="w-6 h-6 relative z-10" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] bg-navy-lighter rounded-2xl shadow-2xl border border-white/10 flex flex-col z-50 overflow-hidden animate-fade-up">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-navy border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-red" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">ScamRadar AI</h3>
                <div className="flex items-center gap-1.5 text-xs text-white/40">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Online
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors p-1 bg-white/5 rounded-lg hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="flex gap-2 max-w-[85%]">
                  {msg.role === 'ai' && (
                    <div className="w-6 h-6 rounded-full bg-red/20 flex-shrink-0 flex items-center justify-center mt-1">
                      <Bot className="w-3.5 h-3.5 text-red" />
                    </div>
                  )}
                  
                  <div
                    className={`p-3 text-sm rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-red text-white rounded-tr-sm'
                        : 'bg-white/5 text-white/80 border border-white/5 rounded-tl-sm'
                    }`}
                  >
                    {renderText(msg.text)}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center mt-1">
                      <User className="w-3.5 h-3.5 text-white/50" />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[80%]">
                  <div className="w-6 h-6 rounded-full bg-red/20 flex-shrink-0 flex items-center justify-center mt-1">
                    <Bot className="w-3.5 h-3.5 text-red" />
                  </div>
                  <div className="p-4 text-sm rounded-2xl bg-white/5 border border-white/5 rounded-tl-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-navy border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a number or scam..."
              className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-red/50 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-red text-white p-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-light transition-colors"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
