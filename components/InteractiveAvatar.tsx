"use client";

import type { StartAvatarResponse } from "@heygen/streaming-avatar";
import { UnifrakturMaguntia } from "next/font/google";
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType,
  TaskMode,
} from "@heygen/streaming-avatar";
import {
  Button,
  Card,
  CardBody,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import '@fortawesome/fontawesome-free/css/all.min.css';
import Lottie from 'lottie-react';
import loadingAnimation from '@/public/loading_animation_3.json';

import { AVATARS, STT_LANGUAGE_LIST } from "@/app/lib/constants";

const unifrakturMaguntia = UnifrakturMaguntia({
  subsets: ["latin"],
  variable: "--font-unifraktur-maguntia",
  weight: "400",
});

export default function InteractiveAvatar() {
  const { theme } = useTheme();
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [avatarId, setAvatarId] = useState<string>("Marianne_Chair_Sitting_public");
  const [language, setLanguage] = useState<string>("en");
  const [data, setData] = useState<StartAvatarResponse>();
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);
  const [chatMode, setChatMode] = useState("text_mode");
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const spokenTextRef = useRef("");
  const userMessageRef = useRef("");
  let sessionTimeout: NodeJS.Timeout | null = null;

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();
      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
    }
    return "";
  }

async function startSession() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(() => console.log("✅ Microphone access granted"))
    .catch(err => console.error("❌ Microphone access denied:", err));

  setIsLoadingSession(true);
  const newToken = await fetchAccessToken();

  avatar.current = new StreamingAvatar({ token: newToken });

  avatar.current.on(StreamingEvents.STREAM_DISCONNECTED, () => endSession());
  avatar.current.on(StreamingEvents.STREAM_READY, (event: any) => setStream(event.detail));
  avatar.current.on(StreamingEvents.USER_START, () => {
    setIsUserTalking(true);
    userMessageRef.current = "";
  });
  avatar.current.on(StreamingEvents.USER_STOP, () => setIsUserTalking(false));

  avatar.current.on(StreamingEvents.USER_TALKING_MESSAGE, (event: any) => {
    const chunk = event?.detail?.message ?? "";
    userMessageRef.current += chunk + " ";
    console.log("🗣️ USER_TALKING_MESSAGE chunk:", chunk);
  });

  avatar.current.on(StreamingEvents.USER_END_MESSAGE, async (event: any) => {
    const query = event.message?.text?.trim();
    if (!query) return;

    const timestamp = new Date().toISOString();
    console.log(`🟢 [${timestamp}] User said: ${query}`);
    console.log("🟣 User full message:", userMessageRef.current.trim());
    userMessageRef.current = "";

    try {
      const res = await fetch("https://cmc96ca5yh91rhrxigrhplkle.agent.a.smyth.ai/api/Answer_Questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Query: query })
      });

      const result = await res.json();
      const reply = result?.results?.[0] ?? result?.data?.answer ?? result?.answer ?? "Sorry, I couldn’t find an answer.";

      const replyTimestamp = new Date().toISOString();
      console.log(`🔵 [${replyTimestamp}] Avatar replied: ${reply}`);

      const sentences = reply.match(/[^.!?]+[.!?]+/g) || [reply];

      for (const sentence of sentences) {
        await avatar.current?.speak({
          text: sentence.trim(),
          task_type: TaskType.REPEAT,
          taskMode: TaskMode.SYNC,
        });
      }


    } catch (error) {
      console.error("🔴 Error talking to AI agent:", error);
      await avatar.current?.speak({
        text: "Sorry, I had trouble reaching the answer service.",
        task_type: TaskType.TALK,
        taskMode: TaskMode.SYNC
      });
    }
  });

  avatar.current.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (event: any) => {
    const chunk = event?.detail?.message ?? "";
    spokenTextRef.current += chunk + " ";
    setSpokenText(spokenTextRef.current);
  });

  avatar.current.on(StreamingEvents.AVATAR_END_MESSAGE, () => {
    const finalText = spokenTextRef.current.trim();
    console.log("🟣 Avatar full message:", finalText);
    spokenTextRef.current = "";
    setTimeout(() => setSpokenText(""), 1000);
  });

  try {
    const res = await avatar.current.createStartAvatar({
      quality: AvatarQuality.Medium,
      avatarName: avatarId,
      language: "en-US",
      disableIdleTimeout: true,
      knowledgeBase: "You are a helpful AI assistant. You only respond based on the user input and return the result from their own AI agent."
    });

    setData(res);
    await avatar.current.startVoiceChat({ isInputAudioMuted: false });
    setChatMode("voice_mode");
    sessionTimeout = setTimeout(() => endSession(), 10 * 60 * 1000);
  } catch (error) {
    console.error("Error starting avatar session:", error);
  } finally {
    setIsLoadingSession(false);
  }
}


  async function endSession() {
    if (sessionTimeout) clearTimeout(sessionTimeout);
    await avatar.current?.stopAvatar();
    setStream(undefined);
    spokenTextRef.current = "";
    setSpokenText("");
    userMessageRef.current = "";
  }

  useEffect(() => {
    return () => {
      endSession();
    };
  }, []);

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => mediaStream.current!.play();
    }
  }, [mediaStream, stream]);

  return (
    <div className="w-full flex flex-col gap-4 p-4 md:p-0">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
        <Select
          label="Select language"
          placeholder="Select language"
          className="w-full md:w-[20%]"
          selectedKeys={[language]}
          onChange={(e: any) => setLanguage(e.target.value)}
        >
          {STT_LANGUAGE_LIST.map((lang) => (
            <SelectItem key={lang.key}>{lang.label}</SelectItem>
          ))}
        </Select>
        <p className="md:w-[20%] text-xs text-right text-white/50">
          <i>BETA</i>
        </p>
      </div>

      <Card>
        <CardBody className="h-[300px] md:h-[500px] flex p-0 overflow-hidden">
          {stream ? (
            <div className="relative w-full h-full flex flex-col justify-center items-center rounded-lg overflow-hidden">
              <video
                ref={mediaStream}
                autoPlay
                playsInline
                className="w-full h-full object-contain md:object-cover max-h-[300px] md:max-h-[500px]"
              >
                <track kind="captions" />
              </video>
              {spokenText && (
                <p className="absolute bottom-4 left-4 bg-white/80 text-black text-sm p-2 rounded-xl max-w-[90%]">
                  {spokenText}
                </p>
              )}
            </div>
          ) : isLoadingSession ? (
            <div className="flex justify-center items-center w-full h-full">
              <Lottie
                style={{ width: '200px', height: '200px', maxWidth: '100%' }}
                className="max-w-full md:w-[250px] md:h-[250px]"
                animationData={loadingAnimation}
                loop={true}
              />
            </div>
          ) : (
            <div className="relative w-full h-full flex justify-center items-center rounded-lg overflow-hidden"></div>
          )}
        </CardBody>
      </Card>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
        <Button
          className="bg-white text-black hover:opacity-90 transition-opacity rounded-lg flex flex-col items-start w-full md:w-auto"
          size="lg"
          variant="shadow"
          onPress={isLoadingSession ? () => {} : stream ? endSession : startSession}
        >
          {isLoadingSession ? "Loading..." : stream ? "End session" : (
            <div className="flex items-center justify-center w-full">
              <i className="fas fa-microphone text-black mr-2" style={{ fontSize: "1.5em" }}></i>
              <span className="text-center md:text-left">
                <b style={{ fontSize: "0.9em" }}>START SESSION</b>
              </span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
