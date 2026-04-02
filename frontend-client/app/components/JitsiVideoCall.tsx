"use client"; // This tells Next.js to render this in the browser, not on the server

import { JitsiMeeting } from '@jitsi/react-sdk';
import { useRouter } from 'next/navigation';

interface VideoCallProps {
  roomName: string;
  userName: string;
}

export default function JitsiVideoCall({ roomName, userName }: VideoCallProps) {
  const router = useRouter();

  return (
    <div style={{ height: '100vh', width: '100%' }}>
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
          externalApi.addListener('videoConferenceLeft', () => {
            console.log("Call ended by user.");
            // In the future, this is where we will call your PATCH /status endpoint!
            alert("Consultation completed!");
            router.push('/'); // Redirect back to home
          });
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = '100%';
          iframeRef.style.width = '100%';
        }}
      />
    </div>
  );
}