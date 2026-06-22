import axios from "axios"
import Chat from "../models/Chat.js"
import User from "../models/User.js"
import imagekit from "../configs/imageKit.js"
import openai from '../configs/openai.js'

const getGeminiErrorPayload = (error) => {
    return error?.error || error?.response?.data?.error || error?.response?.data || error
}

const getRetryDelay = (payload) => {
    const details = Array.isArray(payload?.details) ? payload.details : []
    const retryInfo = details.find((detail) => detail?.retryDelay)
    return retryInfo?.retryDelay
}

const sendAiError = (res, error) => {
    const payload = getGeminiErrorPayload(error)
    const status = error?.status || error?.response?.status || payload?.code || 500
    const retryDelay = getRetryDelay(payload)
    const providerMessage = payload?.message || error?.message || "AI request failed"

    console.error("Gemini API error:", {
        status,
        code: payload?.code,
        providerStatus: payload?.status,
        message: providerMessage,
        retryDelay,
    })

    if (status === 429) {
        return res.status(429).json({
            success: false,
            message: `Gemini quota/rate limit hit. Please wait${retryDelay ? ` ${retryDelay}` : " a minute"} and try again, or check billing/quota in Google AI Studio.`,
            details: providerMessage,
        })
    }

    return res.status(status >= 400 && status < 600 ? status : 500).json({
        success: false,
        message: providerMessage,
    })
}


// Text-based AI Chat Message Controller
export const textMessageController = async (req, res) => {
    try {
        const userId = req.user._id

         // Check credits
        if(req.user.credits < 1){
            return res.json({success: false, message: "You don't have enough credits to use this feature"})
        }

        const {chatId, prompt} = req.body

        const chat = await Chat.findOne({userId, _id: chatId})
        if(!chat){
            return res.status(404).json({success: false, message: "Chat not found"})
        }

        chat.messages.push({role: "user", content: prompt, timestamp: Date.now(), isImage: false})

        const { choices } = await openai.chat.completions.create({
        model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
    });

    const reply = {...choices[0].message, timestamp: Date.now(), isImage: false}
    res.json({success: true, reply})

    chat.messages.push(reply)
    await chat.save()
    await User.updateOne({_id: userId}, {$inc: {credits: -1}})

    } catch (error) {
        sendAiError(res, error)
    }
}

// Image Generation Message Controller
export const imageMessageController = async (req, res) => {
    try {
        const userId = req.user._id;
        // Check credits
        if(req.user.credits < 2){
            return res.json({success: false, message: "You don't have enough credits to use this feature"})
        }
        const {prompt, chatId, isPublished} = req.body
        // Find chat
        const chat = await Chat.findOne({userId, _id: chatId})
        if(!chat){
            return res.status(404).json({success: false, message: "Chat not found"})
        }

         // Push user message
         chat.messages.push({
            role: "user", 
            content: prompt, 
            timestamp: Date.now(), 
            isImage: false});

        // Encode the prompt
        const encodedPrompt = encodeURIComponent(prompt)

        // Construct ImageKit AI generation URL
        const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;

        // Trigger generation by fetching from ImageKit
        const aiImageResponse = await axios.get(generatedImageUrl, {responseType: "arraybuffer"})

        // Convert to Base64
        const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data,"binary").toString('base64')}`;

        // Upload to ImageKit Media Library
        const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: `${Date.now()}.png`,
            folder: "quickgpt"
        })

        const reply = {
                role: 'assistant',
                content: uploadResponse.url,
                timestamp: Date.now(), 
                isImage: true,
                isPublished
        }

         res.json({success: true, reply})

         chat.messages.push(reply)
         await chat.save()

          await User.updateOne({_id: userId}, {$inc: {credits: -2}})

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
