import { generateResponse,generateChatTitle } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";


export const sendMessage = async (req, res) => {

    const { message,chat:chatId } = req.body;

   let title=null, chat=null;
   
  if(!chatId){
    title = await generateChatTitle(message);
    chat = await chatModel.create({
      user: req.user.id,
      title
    })

  }

  
  const userMessage = await messageModel.create({
    chat:chatId || chat._id,
    content: message,
    role: "user"
  })


  const messages = await messageModel.find({ chat: chatId });
      const result = await generateResponse(messages);


   
      const aiMessage = await messageModel.create({
        chat:chatId || chat._id,
        
        content: result,
        role: "ai"
      });

    res.status(201).json({
     
      title,
      chat,
      aiMessage

    });
  
};