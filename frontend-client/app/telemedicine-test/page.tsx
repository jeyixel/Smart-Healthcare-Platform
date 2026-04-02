"use client";

import { useState } from 'react';
import JitsiVideoCall from '../components/JitsiVideoCall';

export default function TelemedicineTestPage() {
  const [hasJoined, setHasJoined] = useState(false);
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');

  // Both roles MUST use this exact same room name to see each other
  const mockRoomName = "smarthealth-test-room-12345";

  // Dynamically set the display name based on the selected role
  const userName = role === 'PATIENT' ? 'Janith (Patient)' : 'Dr. Perera (Doctor)';

  if (hasJoined) {
    return <JitsiVideoCall roomName={mockRoomName} userName={userName} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Telemedicine Portal Test</h1>
        <p className="mb-6 text-gray-600">
          Select your role to join the mock consultation room.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
          <p className="text-sm font-semibold text-blue-800">Mock Environment Active</p>
          <p className="text-xs text-blue-600 mt-1">Room: {mockRoomName}</p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setRole('PATIENT')}
            className={`flex-1 py-2 px-4 rounded font-bold transition-colors ${
              role === 'PATIENT' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            I am a Patient
          </button>
          <button
            onClick={() => setRole('DOCTOR')}
            className={`flex-1 py-2 px-4 rounded font-bold transition-colors ${
              role === 'DOCTOR' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            I am a Doctor
          </button>
        </div>

        <button
          onClick={() => setHasJoined(true)}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition-colors"
        >
          Join as {userName}
        </button>
      </div>
    </div>
  );
}