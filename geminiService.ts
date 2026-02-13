
import { GoogleGenAI, Modality, Type, LiveServerMessage } from "@google/genai";
import { SYSTEM_PROMPT } from "./constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function sendMessageToGemini(
  history: { role: string, parts: { text: string }[] }[], 
  message: string,
  options: { 
    useSearch?: boolean, 
    useMaps?: boolean, 
    useThinking?: boolean,
    useFast?: boolean 
  } = {}
) {
  try {
    let model = 'gemini-2.5-flash';
    const config: any = {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 1,
    };

    if (options.useThinking) {
      config.thinkingConfig = { thinkingBudget: 32768 };
    } else if (options.useFast) {
      // Correct model name for gemini lite as per guidelines
      model = 'gemini-flash-lite-latest';
    } else if (options.useSearch) {
      model = 'gemini-2.5-flash';
      config.tools = [{ googleSearch: {} }];
    } else if (options.useMaps) {
      // Maps grounding is supported in Gemini 2.5 series
      model = 'gemini-flash-lite-latest';
      config.tools = [{ googleMaps: {} }];
      
      // Try to get location for toolConfig
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => 
          navigator.geolocation.getCurrentPosition(res, rej)
        );
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude
            }
          }
        };
      } catch (e) {
        console.warn("Location access denied for Maps grounding");
      }
    }

    const response = await ai.models.generateContent({
      model,
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config,
    });

    // Directly access text property as per guidelines
    const text = response.text || "׳׳¦׳˜׳¢׳¨, ׳”׳׳¢׳¨׳›׳× ׳׳ ׳”׳—׳–׳™׳¨׳” ׳×׳©׳•׳‘׳”.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks.map((chunk: any) => {
      if (chunk.web) return { title: chunk.web.title, uri: chunk.web.uri };
      if (chunk.maps) return { title: chunk.maps.title, uri: chunk.maps.uri };
      return null;
    }).filter(Boolean);

    return { text, sources };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "׳׳¦׳˜׳¢׳¨, ׳”׳™׳™׳×׳” ׳©׳’׳™׳׳” ׳‘׳—׳™׳‘׳•׳¨ ׳׳׳¢׳¨׳›׳×. ׳‘׳•׳ ׳ ׳ ׳¡׳” ׳©׳•׳‘ '׳×׳›׳׳¡'.", sources: [] };
  }
}

export async function generateTTS(text: string): Promise<string | undefined> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly in Hebrew: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    // PCM data is returned in inlineData.data
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (e) {
    console.error("TTS Error", e);
    return undefined;
  }
}

// Audio Utilities
export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function encodeAudio(data: Float32Array): string {
  const int16 = new Int16Array(data.length);
  for (let i = 0; i < data.length; i++) {
    int16[i] = Math.max(-1, Math.min(1, data[i])) * 32767;
  }
  const bytes = new Uint8Array(int16.buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}



