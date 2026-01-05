"use client";

import React, { Fragment, useState, useEffect, useRef } from "react";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Response } from "@/components/ai-elements/response";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { useChat } from "@ai-sdk/react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";

import AppSidebar from "@/components/Sidebar/AppSidebar";
import Navbar from "@/components/Sidebar/Navbar";

const RAGChatbot = () => {
  const [input, setInput] = useState<string>("");
  const { messages, sendMessage, status } = useChat();
  const conversationEndRef = useRef<HTMLDivElement>(null);

  const isLoading = status === "submitted" || status === "streaming";
  const isDisabled = isLoading || !input.trim();

  const handleSubmit = async (message: PromptInputMessage) => {
    if (!message.text?.trim()) return;
    sendMessage({ text: message.text.trim() });
    setInput("");
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-full flex h-screen">
      <AppSidebar />

      <div className="w-full flex-1 flex flex-col">
        <Navbar />

        <div className="flex-1 relative flex flex-col max-w-4xl mx-auto w-full px-4 pt-4 pb-24 md:pb-32">
          <Conversation className="flex-1">
            <ConversationContent className="space-y-6 pb-8">
              {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center mt-16">
                  <div className="text-center">
                    <h2 className="text-3xl font-semibold text-gray-800 mb-2">
                      How can I help you today?
                    </h2>
                    <p className="text-gray-500">Ask me anything about studying abroad — I'm here to assist!</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div key={message.id} className="w-full">
                      {message.parts.map((part, i) => {
                        if (part.type === "text") {
                          return (
                            <Message
                              key={i}
                              from={message.role}
                              className={
                                message.role === "assistant"
                                  ? "bg-white border-gray-200 rounded-2xl"
                                  : "rounded-2xl"
                              }
                            >
                              <MessageContent className="mt-8">
                                <Response className="prose prose-sm max-w-none">
                                  {part.text}
                                </Response>
                              </MessageContent>
                            </Message>
                          );
                        }
                        return null;
                      })}
                    </div>
                  ))}

                  {/* Loading Indicator */}
                  {isLoading && (
                    <Message from="assistant">
                      <MessageContent>
                        <Loader />
                      </MessageContent>
                    </Message>
                  )}

                  {/* Scroll Anchor */}
                  <div ref={conversationEndRef} />
                </>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="bottom-4 absolute left-1/2 transform -translate-x-1/2 w-full max-w-7xl pointer-events-auto">
            <div className="bg-white backdrop-blur-sm bg-opacity-95">
              <PromptInput
                onSubmit={handleSubmit}
                globalDrop
                multiple
                className="border-0"
              >
                <PromptInputBody>
                  <PromptInputTextarea
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    className="min-h-12 max-h-48 resize-none border-0 focus:ring-0 placeholder:text-gray-400"
                  />
                </PromptInputBody>

                <PromptInputFooter className="px-3 pb-3 pt-1">
                  <PromptInputTools>
                    <PromptInputActionMenu>
                      <PromptInputActionMenuTrigger disabled={isLoading} />
                      <PromptInputActionMenuContent>
                        <PromptInputActionAddAttachments />
                      </PromptInputActionMenuContent>
                    </PromptInputActionMenu>
                  </PromptInputTools>

                  <PromptInputSubmit
                    disabled={isDisabled}
                    status={status}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5"
                  />
                </PromptInputFooter>
              </PromptInput>
            </div>

            {/* Subtle hint */}
            <p className="text-center text-xs text-gray-400 mt-2">
              I can answer questions, analyze files, and help with research.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RAGChatbot;