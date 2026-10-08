// Trợ lý ảo Cinevo (khung). Gọi /api/ai/chat, hiện đang trả lời theo từ khóa.
import { useState } from "react";
import { aiService } from "../services/aiService";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState([{ from: "bot", text: "Xin chào, mình là trợ lý Cinevo. Bạn cần hỗ trợ gì?" }]);

  const send = async (e) => {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    setText("");
    setMsgs((m) => [...m, { from: "me", text: content }]);
    try {
      const d = await aiService.chat(content, msgs);
      setMsgs((m) => [...m, { from: "bot", text: d.reply }]);
    } catch (err) {
      setMsgs((m) => [...m, { from: "bot", text: err.message }]);
    }
  };

  return (
    <div className="chatbot">
      {open && (
        <div className="chat-window">
          <div className="chat-head">Trợ lý Cinevo<button onClick={() => setOpen(false)} aria-label="Đóng">×</button></div>
          <div className="chat-body">{msgs.map((m, i) => <p key={i} className={`bubble ${m.from}`}>{m.text}</p>)}</div>
          <form className="chat-form" onSubmit={send}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Nhập câu hỏi..." />
            <button className="btn btn-red btn-sm">Gửi</button>
          </form>
        </div>
      )}
      <button className="chat-fab" onClick={() => setOpen((o) => !o)} aria-label="Mở trợ lý ảo">AI</button>
    </div>
  );
}
