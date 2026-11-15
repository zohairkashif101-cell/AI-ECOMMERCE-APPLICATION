import React, { useEffect, useRef, useState } from "react";
import { createComplaint, sendChatMessage } from "../services/api";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [complaintFlow, setComplaintFlow] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! Ask me about our products, prices, stock, delivery, or return policy.",
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const messageListRef = useRef(null);
  const inputRef = useRef(null);

  const appendAssistantMessage = (content) => {
    setMessages((current) => [...current, { role: "assistant", content }]);
  };

  const startComplaint = (initialDescription = "") => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!localStorage.getItem("token") || user?.role !== "customer") {
      appendAssistantMessage("To submit a complaint, please log in with your customer account first.");
      return;
    }

    setError("");
    setComplaintFlow({ stage: "product", productName: "", description: initialDescription });
    appendAssistantMessage(
      initialDescription
        ? "I can send this to the store owner. Which product is the complaint about? If it is not about a specific product, type General."
        : "I can send your complaint to the store owner. Which product is it about? If it is not about a specific product, type General."
    );
  };

  const cancelComplaint = () => {
    setComplaintFlow(null);
    appendAssistantMessage("Complaint submission cancelled. You can still ask me any store question.");
  };

  const submitComplaint = async () => {
    if (!complaintFlow || isSending) return;

    setIsSending(true);
    setError("");
    try {
      await createComplaint({
        productName: complaintFlow.productName,
        category: "General",
        description: complaintFlow.description,
      });
      setComplaintFlow(null);
      appendAssistantMessage("Your complaint has been submitted to the store owner and is now waiting for review. You can check its status on the Complaints page.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Your complaint could not be submitted. Please log in and try again."
      );
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      messageListRef.current?.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: "smooth",
      });
      inputRef.current?.focus();
    }
  }, [isOpen, messages, isSending]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const question = message.trim();
    if (!question || isSending) return;

    setMessage("");
    setError("");
    setMessages((current) => [...current, { role: "user", content: question }]);

    if (complaintFlow?.stage === "product") {
      const nextFlow = { ...complaintFlow, productName: question };
      if (nextFlow.description) {
        setComplaintFlow({ ...nextFlow, stage: "confirm" });
        appendAssistantMessage(`Please review your complaint:\nProduct: ${question}\nIssue: ${nextFlow.description}\n\nShould I submit it to the owner?`);
      } else {
        setComplaintFlow({ ...nextFlow, stage: "description" });
        appendAssistantMessage("Please describe the issue. This description will be included in the complaint sent to the owner.");
      }
      return;
    }

    if (complaintFlow?.stage === "description") {
      setComplaintFlow({ ...complaintFlow, stage: "confirm", description: question });
      appendAssistantMessage(`Please review your complaint:\nProduct: ${complaintFlow.productName}\nIssue: ${question}\n\nShould I submit it to the owner?`);
      return;
    }

    if (/\b(complaint|complain|shikayat)\b/i.test(question)) {
      const hasIssueDetails =
        question.length >= 24 &&
        /\b(broken|damaged|wrong|late|issue|problem|defective|not working|refund|received|delivery|complaint|complain|shikayat)\b/i.test(question);
      startComplaint(hasIssueDetails ? question : "");
      return;
    }

    setIsSending(true);

    try {
      const response = await sendChatMessage(question);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: response.data.answer,
          sources: response.data.sources,
        },
      ]);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "Could not reach the chatbot. Please try again in a moment."
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="chat-widget">
      {isOpen && (
        <section className="chat-panel" aria-label="Store customer support chat">
          <header className="chat-header">
            <div>
              <strong>Store Assistant</strong>
              <span>Product and policy help</span>
            </div>
            <button
              className="chat-close"
              type="button"
              aria-label="Close chat"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </header>

          <div className="chat-messages" ref={messageListRef} aria-live="polite">
            {messages.map((item, index) => (
              <article className={`chat-message chat-${item.role}`} key={`${item.role}-${index}`}>
                <p>{item.content}</p>
                {item.sources?.length > 0 && (
                  <small>Sources: {item.sources.map((source) => source.title).join(", ")}</small>
                )}
              </article>
            ))}
            {complaintFlow?.stage === "confirm" && (
              <div className="chat-complaint-actions">
                <button type="button" className="chat-confirm" onClick={submitComplaint} disabled={isSending}>
                  {isSending ? "Submitting..." : "Submit complaint"}
                </button>
                <button type="button" className="chat-cancel" onClick={cancelComplaint} disabled={isSending}>
                  Cancel
                </button>
              </div>
            )}
            {isSending && <p className="chat-status">Assistant is thinking...</p>}
            {error && <p className="chat-error" role="alert">{error}</p>}
          </div>

          {!complaintFlow && (
            <button type="button" className="chat-complaint-trigger" onClick={startComplaint}>
              Submit a complaint
            </button>
          )}

          <form className="chat-form" onSubmit={handleSubmit}>
            <label className="chat-sr-only" htmlFor="chat-message">Your message</label>
            <input
              id="chat-message"
              ref={inputRef}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={
                complaintFlow?.stage === "product"
                  ? "Enter product name or General..."
                  : complaintFlow?.stage === "description"
                    ? "Describe your issue..."
                    : complaintFlow?.stage === "confirm"
                      ? "Use the buttons above..."
                      : "Ask a question..."
              }
              maxLength={2000}
              disabled={isSending || complaintFlow?.stage === "confirm"}
            />
            <button type="submit" disabled={isSending || !message.trim() || complaintFlow?.stage === "confirm"}>
              Send
            </button>
          </form>
        </section>
      )}

      <button
        className="chat-launcher"
        type="button"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close customer support chat" : "Open customer support chat"}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "Close chat" : "Chat with us"}
      </button>
    </div>
  );
}
