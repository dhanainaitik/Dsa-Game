import { useEffect, useRef, useState, useCallback } from 'react';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

/**
 * useVoiceChat — WebRTC peer-to-peer voice for multiplayer rooms.
 * Manages peer connections for each remote player in the room.
 *
 * @param {object} socket - socket.io instance from MultiplayerContext
 * @param {string} roomId
 * @param {string} myUserId
 * @param {string[]} peerUserIds - list of OTHER player userIds to connect to
 */
export function useVoiceChat(socket, roomId, myUserId, peerUserIds) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // { userId: MediaStream }
  const [isMuted, setIsMuted] = useState(false);
  const [speakingStates, setSpeakingStates] = useState({}); // { userId: bool }
  const [voiceError, setVoiceError] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const peerConnections = useRef({}); // { userId: RTCPeerConnection }
  const localStreamRef = useRef(null);
  const speakingTimers = useRef({});

  // ── Get mic access ────────────────────────────────────────────────────────
  const startVoice = useCallback(async () => {
    if (!socket || !roomId || !myUserId) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      setLocalStream(stream);
      setVoiceEnabled(true);
      setVoiceError(null);

      // Setup local speaking detection
      setupSpeakingDetection(stream, myUserId, true);

      // Initiate connections to all existing peers (caller role)
      for (const peerId of (peerUserIds || [])) {
        await createPeerConnection(peerId, true, stream);
      }
    } catch (err) {
      console.warn('[Voice] getUserMedia failed:', err.message);
      setVoiceError('Microphone access denied. Voice chat unavailable.');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, roomId, myUserId]);

  // ── Setup volume analyser for speaking indicator ──────────────────────────
  const setupSpeakingDetection = (stream, userId, isLocal = false) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);
      let wasSpeaking = false;

      const check = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        const speaking = avg > 15;

        if (speaking !== wasSpeaking) {
          wasSpeaking = speaking;
          setSpeakingStates(prev => ({ ...prev, [userId]: speaking }));
          if (isLocal && socket) {
            socket.emit('voice:speaking', { roomId, userId, isSpeaking: speaking });
          }
        }
        speakingTimers.current[userId] = requestAnimationFrame(check);
      };

      check();
    } catch (e) {
      // Audio context not available — silent fail
    }
  };

  // ── Create RTCPeerConnection for a peer ───────────────────────────────────
  const createPeerConnection = async (peerId, isInitiator, stream) => {
    if (peerConnections.current[peerId]) return peerConnections.current[peerId];

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnections.current[peerId] = pc;

    // Add local tracks
    if (stream) {
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
    }

    // Receive remote stream
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams(prev => ({ ...prev, [peerId]: remoteStream }));
      setupSpeakingDetection(remoteStream, peerId, false);
    };

    // Relay ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('voice:ice', {
          roomId,
          targetUserId: peerId,
          candidate: event.candidate,
          fromUserId: myUserId,
        });
      }
    };

    // Initiator creates the offer
    if (isInitiator) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('voice:offer', {
          roomId,
          targetUserId: peerId,
          offer: pc.localDescription,
          fromUserId: myUserId,
        });
      } catch (err) {
        console.warn('[Voice] createOffer failed:', err);
      }
    }

    return pc;
  };

  // ── Socket event handlers ─────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !voiceEnabled) return;

    const handleOffer = async ({ offer, fromUserId }) => {
      const stream = localStreamRef.current;
      const pc = await createPeerConnection(fromUserId, false, stream);
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('voice:answer', {
          roomId,
          targetUserId: fromUserId,
          answer: pc.localDescription,
          fromUserId: myUserId,
        });
      } catch (err) {
        console.warn('[Voice] handle offer error:', err);
      }
    };

    const handleAnswer = async ({ answer, fromUserId }) => {
      const pc = peerConnections.current[fromUserId];
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        console.warn('[Voice] handle answer error:', err);
      }
    };

    const handleIce = async ({ candidate, fromUserId }) => {
      const pc = peerConnections.current[fromUserId];
      if (!pc) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('[Voice] add ICE candidate error:', err);
      }
    };

    socket.on('voice:offer', handleOffer);
    socket.on('voice:answer', handleAnswer);
    socket.on('voice:ice', handleIce);

    return () => {
      socket.off('voice:offer', handleOffer);
      socket.off('voice:answer', handleAnswer);
      socket.off('voice:ice', handleIce);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, voiceEnabled, roomId, myUserId]);

  // ── Mute toggle ───────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach(track => {
      track.enabled = isMuted; // flip: if currently muted, enable
    });
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (socket) {
      socket.emit('voice:mute', { roomId, userId: myUserId, isMuted: newMuted });
    }
  }, [isMuted, socket, roomId, myUserId]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      Object.values(peerConnections.current).forEach(pc => pc.close());
      peerConnections.current = {};
      Object.values(speakingTimers.current).forEach(cancelAnimationFrame);
    };
  }, []);

  return {
    localStream,
    remoteStreams,
    isMuted,
    toggleMute,
    speakingStates,
    voiceError,
    voiceEnabled,
    startVoice,
  };
}
