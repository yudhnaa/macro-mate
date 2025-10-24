"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatbotPage() {
  const [messages, setMessages] = useState<
    Array<{
      role: "user" | "assistant";
      content: string;
      timestamp: Date;
      imageUrl?: string;
    }>
  >([
    {
      role: "assistant",
      content:
        "Hello! I'm your Macro Mate assistant. How can I help you with your nutrition and meal planning today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.removeItem("chatbot_thread_id");
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Xử lý chọn ảnh
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Xóa ảnh đã chọn
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() && !imageFile) return;

    const userMessage = {
      role: "user" as const,
      content: inputMessage,
      timestamp: new Date(),
      imageUrl: selectedImage || undefined, // Thêm ảnh vào message
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentQuery = inputMessage;
    const currentImageFile = imageFile;
    setInputMessage("");
    setIsTyping(true);

    // Tạo message rỗng cho assistant để stream vào
    const assistantMessageIndex = messages.length + 1;
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant" as const,
        content: "",
        timestamp: new Date(),
      },
    ]);

    try {
      // Lấy thread_id từ localStorage (nếu có)
      const threadId = localStorage.getItem("chatbot_thread_id") || "";

      // Tạo FormData để upload file theo đúng API
      const formData = new FormData();
      formData.append("thread_id", threadId);
      formData.append("user_query", currentQuery);

      if (currentImageFile) {
        formData.append("img_file", currentImageFile);
      }

      // Reset image sau khi gửi
      if (currentImageFile) {
        handleRemoveImage();
      }

      // Use fetch for streaming instead of axios
      const accessToken = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/advice/stream`,
        {
          method: "POST",
          headers: {
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      // Đọc stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            // Kiểm tra thread_id ở dòng đầu tiên
            if (line.startsWith("thread_id:")) {
              const newThreadId = line.replace("thread_id:", "").trim();
              localStorage.setItem("chatbot_thread_id", newThreadId);
              console.log("Thread ID saved:", newThreadId);
              continue;
            }

            if (line.startsWith("data: ")) {
              const data = line.slice(6); // Remove "data: " prefix

              if (data === "[DONE]") {
                continue;
              }

              try {
                const parsed = JSON.parse(data);

                if (parsed.type === "token") {
                  accumulatedContent += parsed.content;

                  // Update message content
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[assistantMessageIndex] = {
                      ...newMessages[assistantMessageIndex],
                      content: accumulatedContent,
                    };
                    return newMessages;
                  });
                } else if (parsed.type === "progress") {
                  console.log("Progress:", parsed.message);
                } else if (parsed.type === "complete") {
                  console.log("Stream complete");
                }
              } catch {
                // Ignore JSON parse errors for non-JSON lines
              }
            }
          }
        }
      }

      if (!accumulatedContent) {
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[assistantMessageIndex] = {
            ...newMessages[assistantMessageIndex],
            content:
              "I apologize, but I couldn't generate a response. Please try again.",
          };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);

      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[assistantMessageIndex] = {
          ...newMessages[assistantMessageIndex],
          content: "Sorry, I encountered an error. Please try again later.",
        };
        return newMessages;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const quickActions = [
    "Suggest a meal plan",
    "Calculate my macros",
    "Healthy snack ideas",
    "Track today's calories",
  ];

  // Hàm để bắt đầu chat mới
  const handleNewChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hello! I'm your Macro Mate assistant. How can I help you with your nutrition and meal planning today?",
        timestamp: new Date(),
      },
    ]);
    setInputMessage("");
    setSelectedImage(null);
    setImageFile(null);
    localStorage.removeItem("chatbot_thread_id");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">
              Macro Mate Assistant
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 truncate">
              Your personal nutrition and meal planning assistant
            </p>
          </div>
          <button
            onClick={handleNewChat}
            className="flex-shrink-0 px-3 sm:px-4 py-2 sm:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-1.5 sm:gap-2 text-sm"
            title="Start a new chat"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="hidden xs:inline">New Chat</span>
            <span className="xs:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`flex gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%] ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                    message.role === "user"
                      ? "bg-orange-500 text-white"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {message.role === "user" ? (
                    <svg
                      className="w-4 h-4 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`rounded-lg px-3 sm:px-4 py-2 sm:py-3 ${
                    message.role === "user"
                      ? "bg-orange-500 text-white"
                      : "bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  {/* Hiển thị ảnh nếu có */}
                  {message.imageUrl && (
                    <div className="mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={message.imageUrl}
                        alt="Uploaded"
                        className="max-w-full max-h-48 sm:max-h-64 rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="text-xs sm:text-sm leading-relaxed markdown-content">
                    {message.role === "assistant" ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h2: ({ children }) => (
                            <h2 className="text-base font-bold mb-2 mt-3 text-gray-800">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-sm font-semibold mb-1 mt-2 text-gray-700">
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => (
                            <p className="my-1 text-gray-700">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="my-1 ml-4 list-disc space-y-0.5">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="my-1 ml-4 list-decimal space-y-0.5">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="text-gray-700">{children}</li>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-gray-900">
                              {children}
                            </strong>
                          ),
                          code: ({ children }) => (
                            <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>
                  <p
                    className={`text-xs mt-2 ${message.role === "user"
                      ? "text-orange-100"
                      : "text-gray-500"
                      }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-2 sm:gap-3">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                  <svg
                    className="w-4 h-4 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="px-3 sm:px-6 pb-3 sm:pb-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Quick actions:</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(action)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-full text-xs sm:text-sm text-gray-700 hover:border-orange-500 hover:text-orange-500 transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto">
          {/* Image Preview */}
          {selectedImage && (
            <div className="mb-2 sm:mb-3 relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage}
                alt="Selected"
                className="max-h-24 sm:max-h-32 rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-red-600 text-sm"
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Image Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isTyping}
              className="flex-shrink-0 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              title="Upload image"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about nutrition, meals, or your diet..."
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={isTyping || (!inputMessage.trim() && !imageFile)}
              className="flex-shrink-0 px-3 sm:px-6 py-2 sm:py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 sm:gap-2 text-sm"
            >
              <span className="hidden xs:inline">Send</span>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-1.5 sm:mt-2 text-center">
            Macro Mate AI can make mistakes. Please verify important
            information.
          </p>
        </div>
      </div>
    </div>
  );
}
