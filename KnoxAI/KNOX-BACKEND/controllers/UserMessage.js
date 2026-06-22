import { GoogleGenAI } from "@google/genai";
import Message from "../models/Message.js";
import Character from "../models/character.js";

export const sendMessage = async (req, res) => {
  try {
    const { characterId, message } = req.body;
    const userId = req.user.id;

    await Message.create({
      characterId,
      userId,
      sender: "user",
      message,
    });

    const character = await Character.findById(characterId);

    if (!character) {
      return res.status(404).json({ error: "Character not found" });
    }

    const history = await Message.find({ userId, characterId })
      .sort({ createdAt: 1 })
      .limit(10);

    const conversationHistory = history
      .map((msg) => `${msg.sender}: ${msg.message}`)
      .join("\n");

    const prompt = `
${character.personalityPrompt}
Conversation History:
${conversationHistory}

User: ${message}
`;

    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const GEMINI_MODEL = "gemini-2.5-flash";

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const aiReply =
      response?.candidates?.[0]?.content?.parts?.[0]?.text || "No reply";

    await Message.create({
      characterId,
      userId,
      sender: "ai",
      message: aiReply,
    });

    res.status(200).json({ aiReply });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Chat error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { characterId } = req.params;
    const userId = req.user.id; 

    const messages = await Message.find({ userId, characterId }).sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching messages" });
  }
};