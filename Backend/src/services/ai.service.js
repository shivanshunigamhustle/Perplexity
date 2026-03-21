import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { tavily } from "@tavily/core";

const GeminiModel = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-2.5-flash-lite",
});

const mistralModel = new ChatMistralAI({
    model: "mistral-small-latest",
    apiKey: process.env.MISTRAL_API_KEY
})

const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });

export async function generateImageDescription(base64Image, mimeType, userPrompt) {
    console.log("Generating image description...")

    const message = new HumanMessage({
        content: [
            {
                type: "image_url",
                image_url: {
                    url: `data:${mimeType};base64,${base64Image}`
                }
            },
            {
                type: "text",
                text: userPrompt || "Please describe this image in detail. What do you see? Include objects, colors, context, and any text visible in the image."
            }
        ]
    })

    const response = await GeminiModel.invoke([message])
    return response.text
}

export async function generateResponse(messages) {
    console.log("Generating response for messages:", messages.length)

    const lastUserMessage = [...messages].reverse().find(m => m.role === "user")

    let searchContext = ""

    try {
        console.log("Searching web with Tavily:", lastUserMessage?.content)
        const searchResult = await tavilyClient.search(lastUserMessage?.content || "", {
            searchDepth: "basic",
            maxResults: 5,
        })

        searchContext = searchResult.results
            .map(r => `Source: ${r.url}\nTitle: ${r.title}\nContent: ${r.content}`)
            .join("\n\n---\n\n")

        console.log("Tavily search done, results:", searchResult.results.length)
    } catch (error) {
        console.error("Tavily search failed:", error.message)
    }

    const systemPrompt = searchContext
        ? `You are a helpful AI assistant like Perplexity. You have access to real-time web search results.
        
Use the following web search results to answer the user's question accurately. 
Always cite your sources with the URL when using information from search results.
Format your response clearly with proper markdown.

Web Search Results:
${searchContext}`
        : `You are a helpful AI assistant. Answer the user's question accurately and clearly using markdown formatting.`

    const formattedMessages = [
        new SystemMessage(systemPrompt),
        ...messages
            .map(msg => {
                if (msg.role === "user") return new HumanMessage(msg.content)
                if (msg.role === "ai") return new AIMessage(msg.content)
                return null
            })
            .filter(Boolean)
    ]

    const response = await GeminiModel.invoke(formattedMessages)
    return response.text
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