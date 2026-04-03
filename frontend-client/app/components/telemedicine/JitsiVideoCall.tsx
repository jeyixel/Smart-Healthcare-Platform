"use client"; // This tells Next.js to render this in the browser, not on the server

import { JitsiMeeting } from "@jitsi/react-sdk";
import { useRouter } from "next/navigation";

interface VideoCallProps {
  meetingUrl: string;
  userName: string;
}

function extractRoomName(meetingUrl: string): string {
  try {
    const parsedUrl = new URL(meetingUrl);
    return decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ""));
  } catch {
    return "";
  }
}

export default function JitsiVideoCall({ meetingUrl, userName }: VideoCallProps) {
  const router = useRouter();
  const roomName = extractRoomName(meetingUrl);

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

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={roomName}
        configOverwrite={{
          startWithAudioMuted: true,
          startWithVideoMuted: true,
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
        }}
        userInfo={{
          displayName: userName,
        }}
        onApiReady={(externalApi) => {
          // This event fires when the user clicks the red "Hang Up" button
          externalApi.addListener("videoConferenceLeft", () => {
            console.log("Call ended by user.");
            // In the future, this is where we will call your PATCH /status endpoint!
            alert("Consultation completed!");
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