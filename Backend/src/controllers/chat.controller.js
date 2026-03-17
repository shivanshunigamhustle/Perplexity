import { generateResponse } from "../services/ai.service.js";
export async function sendMessage(req, res) {
    const { message } = req.body;
    // Logic for sending message

    const result= await generateResponse(message);  
 res.json({
    message: result
 })

}