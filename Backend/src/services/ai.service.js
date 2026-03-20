import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages"; // ← fix

const GeminiModel = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.5-flash-lite",
});

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY
})

export async function generateResponse(messages) {
    console.log(messages)
    
    const formattedMessages = messages
        .map(msg => {
            if (msg.role === "user") return new HumanMessage(msg.content)
            if (msg.role === "ai") return new AIMessage(msg.content)
            return null
        })
        .filter(Boolean) // ← undefined entries hata do

    const response = await GeminiModel.invoke(formattedMessages);
    return response.text;
}

export async function generateChatTitle(message) {
  const response = await mistralModel.invoke([
    new SystemMessage(
      `You are a helpful assistant that generates concise and descriptive titles for chat conversations.
      
      user will provide you with the content of a chat conversation, and your task is to analyze the conversation and generate a title that accurately reflects the main topic or theme of the discussion. The title should be concise, ideally no more than 5 words, and should capture the essence of the conversation in a clear and engaging way. Please ensure that the title is relevant to the content of the conversation and provides a good summary of what was discussed.`),
    new HumanMessage(`generate a title for a chat conversation with the following content: "${message}"`)
  ]);
  return response.text;
}