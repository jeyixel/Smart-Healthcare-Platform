"use client"; // This tells Next.js to render this in the browser, not on the server

import { JitsiMeeting } from "@jitsi/react-sdk";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { completeSession } from "@/app/lib/telemedicine/api";

interface VideoCallProps {
  meetingUrl: string;
  userName: string;
  sessionId: string;
}

function extractRoomName(meetingUrl: string): string {
  try {
    const parsedUrl = new URL(meetingUrl);
    return decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ""));
  } catch {
    return "";
  }
}

export default function JitsiVideoCall({ meetingUrl, userName, sessionId }: VideoCallProps) {
  const router = useRouter();
  const roomName = extractRoomName(meetingUrl);
  const [jwt, setJwt] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!roomName) return;

    const fetchToken = async () => {
      try {
        const userToken = typeof window !== "undefined" ? localStorage.getItem("token") : "";
        const response = await fetch(`http://localhost:8080/api/v1/telemedicine/meet/token?room=${encodeURIComponent(roomName)}`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch meeting token");
        }
        const data = await response.json();
        setJwt(data.token);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchToken();
  }, [roomName]);

  if (!roomName) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9f9ff] p-6">
        <div className="max-w-lg rounded-xl bg-white p-6 text-center shadow-[0_8px_32px_rgba(0,95,175,0.04)]">
          <h2 className="text-xl font-semibold text-[#181c21]">Invalid meeting link</h2>
          <p className="mt-2 text-sm text-[#4f5c6a]">
            Meeting room could not be created from the telemedicine session response.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9f9ff] p-6">
        <div className="max-w-lg rounded-xl bg-white p-6 text-center shadow-[0_8px_32px_rgba(0,95,175,0.04)] text-red-500">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!jwt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9f9ff] p-6">
        <div className="text-gray-500">Connecting to secure meeting...</div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <JitsiMeeting
        domain="8x8.vc"
        roomName={roomName}
        jwt={jwt}
        configOverwrite={{
          startWithAudioMuted: true,
          startWithVideoMuted: true,
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
        }}
        userInfo={{
          displayName: userName,
          email: "",
        }}
        onApiReady={(externalApi) => {
          // This event fires when the user clicks the red "Hang Up" button
          externalApi.addListener("videoConferenceLeft", async () => {
            console.log("Call ended by user.");
            try {
              await completeSession(sessionId);
              console.log("Session marked as COMPLETED.");
            } catch (err) {
              console.error("Failed to mark session as completed:", err);
            }
            router.push("/telemedicine");
          });
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = "100%";
          iframeRef.style.width = "100%";
        }}
      />
    </div>
  );
}