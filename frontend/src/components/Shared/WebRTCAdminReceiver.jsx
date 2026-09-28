import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import { PhoneIncoming, PhoneOff, PhoneCall, Mic, MicOff } from 'lucide-react';

const WebRTCAdminReceiver = () => {
  const [peer, setPeer] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    // Admin always connects with a static known ID 'eminence-admin'
    const newPeer = new Peer('eminence-admin', {
      host: window.location.hostname,
      port: 3000,
      path: '/peerjs'
    });

    newPeer.on('open', (id) => {
      console.log('Admin WebRTC Receiver Ready. ID:', id);
    });

    newPeer.on('call', (call) => {
      console.log('Incoming call from:', call.peer);
      setIncomingCall(call);
    });

    newPeer.on('error', (err) => {
      console.error('Peer error:', err);
    });

    setPeer(newPeer);

    return () => {
      endCall();
      newPeer.destroy();
    };
  }, []);

  const acceptCall = async () => {
    if (!incomingCall) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      
      incomingCall.answer(stream);
      
      incomingCall.on('stream', (remoteStream) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
          remoteAudioRef.current.play();
        }
      });

      incomingCall.on('close', () => {
        endCall();
      });

      setActiveCall(incomingCall);
      setIncomingCall(null);
    } catch (err) {
      console.error('Microphone access denied:', err);
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      incomingCall.close();
      setIncomingCall(null);
    }
  };

  const endCall = () => {
    if (activeCall) activeCall.close();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setActiveCall(null);
    setIncomingCall(null);
    setIsMuted(false);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  if (!incomingCall && !activeCall) return null; // Hide if no activity

  return (
    <div className="fixed top-20 right-6 z-50">
      <audio ref={remoteAudioRef} className="hidden" />

      {incomingCall && !activeCall && (
        <div className="bg-loft-900 border-2 border-loft-500 rounded-xl shadow-2xl p-4 flex flex-col items-center gap-4 w-72 text-white animate-pulse">
          <div className="flex items-center gap-2 text-loft-400 font-bold">
            <PhoneIncoming className="animate-bounce" />
            INCOMING HELPLINE CALL
          </div>
          <div className="text-xs text-loft-200">Customer is calling via WebRTC...</div>
          
          <div className="flex gap-4 w-full mt-2">
            <button 
              onClick={rejectCall}
              className="flex-1 py-2 rounded-lg bg-red-900/50 hover:bg-red-600 border border-red-700 transition-colors"
            >
              Reject
            </button>
            <button 
              onClick={acceptCall}
              className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors flex justify-center items-center gap-2 font-bold"
            >
              <PhoneCall size={18} /> Answer
            </button>
          </div>
        </div>
      )}

      {activeCall && (
        <div className="bg-loft-900 border border-green-500 rounded-xl shadow-2xl p-4 flex flex-col items-center gap-4 w-72 text-white">
          <div className="flex items-center gap-2 text-green-400 font-bold">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            LIVE HELPLINE CONNECTED
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={toggleMute}
              className={`p-3 rounded-full ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-loft-800 hover:bg-loft-700'}`}
              title="Toggle Mute"
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button 
              onClick={endCall}
              className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white"
              title="End Call"
            >
              <PhoneOff size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebRTCAdminReceiver;
