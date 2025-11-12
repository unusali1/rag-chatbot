"use client";

import React, { Fragment, useState } from "react";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
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
import { Button } from "@/components/ui/button";
import Link from "next/link";

const RAGChatbot = () => {
  const [input, setInput] = useState<string>("");
  const { messages, sendMessage, status } = useChat();

  const handleSubmit = async (message: PromptInputMessage) => {
    if (!message.text) return;
    sendMessage({ text: message.text });
    setInput("");
  };

  // Disable input and send while processing or streaming
  const isDisabled = status === "submitted" || status === "streaming";

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full h-[calc(100vh-4rem)]">
      <Link href="/">
        <Button className="mb-2">Back</Button>
      </Link>

      <div className="flex flex-col h-full border rounded-2xl p-2">
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => (
              <div key={message.id}>
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <Fragment key={i}>
                          <Message from={message.role}>
                            <MessageContent>
                              <Response>{part.text}</Response>
                            </MessageContent>
                          </Message>
                        </Fragment>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            ))}

            {isDisabled && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput onSubmit={handleSubmit} className="mt-4" globalDrop multiple>
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
              disabled={isDisabled} // disable textarea
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger disabled={isDisabled} />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
            </PromptInputTools>
            <PromptInputSubmit
              disabled={isDisabled || !input}
              status={status}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};

export default RAGChatbot;
