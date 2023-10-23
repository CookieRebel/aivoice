// AudioStream.tsx
import debug from "debug";
import React, { useEffect, useState } from "react";

const log = debug("app:component:layouts.AudioStream");

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
}

interface AudioStreamProps {
  apiKey: string;
  text: string;
}

const AudioStream: React.FC<AudioStreamProps> = ({ text, apiKey }) => {
  // Elevenlabs settings
  const voiceId = "TxGEqnHWrfWFTfGW9XjX";
  const voiceSettings = {
    stability: 0,
    similarity_boost: 0,
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Split sentences on period,exclamation point, and question mark
  // We send each sentence separately to ElevenLabs API, because of the lag: the longer the text is, the more lag you have before the audio plays
  const sentences = text.split(/(?<=[.!?,:])\s*/);

  const startStreaming = async (sentence: string) => {
    setLoading(true);
    setError("");

    const baseUrl = "https://api.elevenlabs.io/v1/text-to-speech";
    const headers = {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
      accept: "audio/mpeg",
    };

    const requestBody = {
      text: sentence,
      voice_settings: voiceSettings,
    };

    try {
      const response = await fetch(`${baseUrl}/${voiceId}`, {
        method: "POST",
        headers: headers,
        body: requestBody ? JSON.stringify(requestBody) : null,
      });
      // eslint-disable-next-line no-async-promise-executor
      return new Promise<void>(async (resolve, reject) => {
        try {
          if (response.ok) {
            const blob = await response.blob();
            const audio = new Audio(URL.createObjectURL(blob));
            audio.onended = () => resolve(); // Resolve the promise when audio ends
            audio.onerror = () => reject(new Error("Audio playback failed")); // Reject on error
            audio.play();
          } else {
            reject(new Error("HTTP error"));
          }
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      setError("Error: Unable to stream audio.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const startStreamingIfNecessary = async () => {
    if (text) {
      for (const sentence of sentences) {
        log("sentence", sentence);
        try {
          await startStreaming(sentence); // Await the promise
        } catch (error) {
          setError("Error: Unable to stream audio.");
          break; // Exit the loop on error, adjust as needed
        }
      }
    }
  };

  useEffect(() => {
    startStreamingIfNecessary().catch((err) => console.error(err));
  }, [text]);

  return <div>{error && <p>{error}</p>}</div>;
};

export default AudioStream;
