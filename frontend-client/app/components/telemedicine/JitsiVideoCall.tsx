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

/**
 * Extracts the JaaS App ID and room name from a meeting URL.
 * JaaS URLs follow the format: https://8x8.vc/{appId}/{roomName}
 * The @jitsi/react-sdk requires roomName to include the appId prefix
 * (e.g. "vpaas-magic-cookie-xxx/smarthealth-room") so the SDK loads
 * the correct tenant-scoped external_api.js.
 */
function parseMeetingUrl(meetingUrl: string): { appId: string; roomName: string } {
  try {
    const parsedUrl = new URL(meetingUrl);
    const pathSegments = parsedUrl.pathname
      .replace(/^\/+/, "")
      .split("/")
      .map(decodeURIComponent)
      .filter(Boolean);

    if (pathSegments.length >= 2) {
      // JaaS URL: first segment is appId, rest is room name
      const appId = pathSegments[0];
      const room = pathSegments.slice(1).join("/");
      return { appId, roomName: `${appId}/${room}` };
    }
    // Fallback: treat entire path as the room name (self-hosted Jitsi)
    return { appId: "", roomName: pathSegments.join("/") };
  } catch {
    return { appId: "", roomName: "" };
  }
}

export default function JitsiVideoCall({ meetingUrl, userName, sessionId }: VideoCallProps) {
  const router = useRouter();
  const { appId, roomName } = parseMeetingUrl(meetingUrl);
  const [jwt, setJwt] = useState<string>("");
  const [error, setError] = useState<string>("");

  // The domain for JitsiMeeting must be "8x8.vc" for JaaS tenants.
  // For self-hosted fallback (no appId), use the original URL hostname.
  const jitsiDomain = appId ? "8x8.vc" : (() => { try { return new URL(meetingUrl).hostname; } catch { return "8x8.vc"; } })();

  useEffect(() => {
    if (!roomName) return;

    const fetchToken = async () => {
      try {
        const userToken = typeof window !== "undefined" ? localStorage.getItem("smart_admin_token") : null;
        if (!userToken || userToken.trim().length === 0) {
          throw new Error("Authentication required. Please sign in again.");
        }

        // Send the raw room name (without appId prefix) to the backend token endpoint
        const rawRoom = appId ? roomName.replace(`${appId}/`, "") : roomName;
        const response = await fetch(`http://localhost:8080/api/v1/telemedicine/meet/token?room=${encodeURIComponent(rawRoom)}`, {
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
  }, [roomName, appId]);

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
        domain={jitsiDomain}
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