"use client";

import type { StartAvatarResponse } from "@heygen/streaming-avatar";
import {
  UnifrakturMaguntia,
} from "next/font/google";
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskMode,
  TaskType,
  VoiceEmotion,
} from "@heygen/streaming-avatar";
import {
  Button,
  Card,
  CardBody,
  Spinner,
  Select,
  SelectItem,
  Link,
} from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import '@fortawesome/fontawesome-free/css/all.min.css';
import Lottie from 'lottie-react';
import loadingAnimation from '@/public/loading_animation_3.json';

import { AVATARS, STT_LANGUAGE_LIST } from "@/app/lib/constants";

// Move font loader to module scope
const unifrakturMaguntia = UnifrakturMaguntia({
  subsets: ["latin"],
  variable: "--font-unifraktur-maguntia",
  weight: "400",
});

export default function InteractiveAvatar() {
  const { theme } = useTheme();
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [knowledgeId, setKnowledgeId] = useState<string>("5c1de5a6cf5d47c890c8c1f6b3f2adbb");
  const [debug, setDebug] = useState<string>();
  const [avatarId, setAvatarId] = useState<string>("Marianne_Chair_Sitting_public");
  const [language, setLanguage] = useState<string>("en");
  const [data, setData] = useState<StartAvatarResponse>();
  const [text, setText] = useState<string>("");
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);
  const [chatMode, setChatMode] = useState("text_mode");
  const [isUserTalking, setIsUserTalking] = useState(false);
  let sessionTimeout: NodeJS.Timeout | null = null; 

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();
      console.log("Access Token:", token); 
      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
    }
    return "";
  }

  async function startSession() {
    setIsLoadingSession(true);
    const newToken = await fetchAccessToken();

    avatar.current = new StreamingAvatar({
      token: newToken,
    });
    avatar.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
      console.log("Stream disconnected");
      endSession();
    });
    avatar.current?.on(StreamingEvents.STREAM_READY, (event) => {
      console.log(">>>>> Stream ready:", event.detail);
      setStream(event.detail);
    });
    avatar.current?.on(StreamingEvents.USER_START, (event) => {
      console.log(">>>>> User started talking:", event);
      setIsUserTalking(true);
    });
    avatar.current?.on(StreamingEvents.USER_STOP, (event) => {
      console.log(">>>>> User stopped talking:", event);
      setIsUserTalking(false);
    });
    try {
      const res = await avatar.current.createStartAvatar({
        quality: AvatarQuality.Medium,
        knowledgeId: knowledgeId,
        avatarName: avatarId,
        voice: {
          rate: 1.5,
          emotion: VoiceEmotion.EXCITED,
        },
        language: language,
        disableIdleTimeout: true,
      });

      setData(res);
      await avatar.current?.startVoiceChat({
        isInputAudioMuted: false,
      });
      setChatMode("voice_mode");

      sessionTimeout = setTimeout(() => {
        endSession();
      }, 10 * 60 * 1000); 
    } catch (error) {
      console.error("Error starting avatar session:", error);
    } finally {
      setIsLoadingSession(false);
    }
  }

  async function endSession() {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      sessionTimeout = null; 
    }
    await avatar.current?.stopAvatar();
    setStream(undefined);
  }

  useEffect(() => {
    return () => {
      endSession();
    };
  }, []);

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
        setDebug("Playing");
      };
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
          onChange={(e) => {
            setLanguage(e.target.value);
          }}
        >
          {STT_LANGUAGE_LIST.map((lang) => (
            <SelectItem key={lang.key}>{lang.label}</SelectItem>
          ))}
        </Select>
 
        <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.8em", textAlign: "right" }} className="md:w-[20%]">
          <i>BETA</i>
        </p>
      </div>
      <Card>
        <CardBody className="h-[300px] md:h-[500px] flex p-0 overflow-hidden">
          {stream ? (
            <div className="relative w-full h-full flex justify-center items-center rounded-lg overflow-hidden">
              <video
                ref={mediaStream}
                autoPlay
                playsInline
                className="w-full h-full object-contain md:object-cover max-h-[300px] md:max-h-[500px]"
              >
                <track kind="captions" />
              </video>
            </div>
          ) : isLoadingSession ? (
            <div className="flex justify-center items-center w-full h-full">
           <Lottie
  style={{
    width: '200px',  
    height: '200px', 
    maxWidth: '100%',
  }}
  className="max-w-full md:w-[250px] md:h-[250px]" 
  animationData={loadingAnimation}
  loop={true}
/>

            </div>
          ) : <div>
            <div className="relative w-full h-full flex justify-center items-center rounded-lg overflow-hidden">
            
            </div>
          </div>}
        </CardBody>
      </Card>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
        <p
          className="text-white text-center md:text-left font-sans text-xl md:text-2xl font-semibold"
    
        >

        </p>
        <Button
  className="bg-white text-black hover:opacity-90 transition-opacity rounded-lg flex flex-col items-start w-full md:w-auto"
  size="lg"
          variant="shadow"
          onPress={isLoadingSession ? () => { } : stream ? endSession : startSession}
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


