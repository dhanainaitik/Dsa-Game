import { useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import './VoicePanel.css';

/**
 * VoicePanel — Shows all players in the room with mic status and speaking indicator.
 */
export default function VoicePanel({
  players,          // [{ userId, username, team }]
  myUserId,
  isMuted,
  toggleMute,
  speakingStates,   // { userId: bool }
  voiceMuted,       // { userId: bool } from server
  voiceEnabled,
  voiceError,
  startVoice,
  remoteStreams,    // { userId: MediaStream }
}) {
  const audioRefs = useRef({});

  // Auto-play remote streams
  useEffect(() => {
    Object.entries(remoteStreams || {}).forEach(([userId, stream]) => {
      const el = audioRefs.current[userId];
      if (el && el.srcObject !== stream) {
        el.srcObject = stream;
        el.play().catch(() => {});
      }
    });
  }, [remoteStreams]);

  return (
    <div className="voice-panel">
      {/* Hidden audio elements for remote streams */}
      {Object.keys(remoteStreams || {}).map(userId => (
        <audio
          key={userId}
          ref={el => { audioRefs.current[userId] = el; }}
          autoPlay
          playsInline
        />
      ))}

      <div className="voice-panel-header">
        <Volume2 size={14} />
        <span>VOICE COMM</span>
        {!voiceEnabled && !voiceError && (
          <button className="voice-join-btn" onClick={startVoice}>
            Join Voice
          </button>
        )}
        {voiceError && (
          <span className="voice-error-badge">No Mic</span>
        )}
      </div>

      <div className="voice-players">
        {(players || []).map(player => {
          const isSpeaking = speakingStates?.[player.userId] && !voiceMuted?.[player.userId];
          const isServerMuted = voiceMuted?.[player.userId];
          const isMe = player.userId === myUserId;
          const myMuted = isMe && isMuted;

          return (
            <div
              key={player.userId}
              className={`voice-player ${isSpeaking ? 'speaking' : ''} ${player.team === 'A' ? 'team-a' : 'team-b'}`}
            >
              <div className={`voice-avatar ${isSpeaking ? 'pulse' : ''}`}>
                {(player.username || 'P')[0].toUpperCase()}
              </div>
              <div className="voice-player-info">
                <span className="voice-username">
                  {isMe ? 'YOU' : player.username}
                </span>
                <span className="voice-team-badge">{player.team}</span>
              </div>
              <div className="voice-mic-icon">
                {(myMuted || isServerMuted)
                  ? <MicOff size={14} className="text-red-400" />
                  : <Mic size={14} className={isSpeaking ? 'text-green-400' : 'text-gray-400'} />
                }
              </div>
            </div>
          );
        })}
      </div>

      {voiceEnabled && (
        <button
          className={`voice-mute-btn ${isMuted ? 'muted' : ''}`}
          onClick={toggleMute}
        >
          {isMuted ? <><MicOff size={14} /> Unmute</> : <><Mic size={14} /> Mute</>}
        </button>
      )}
    </div>
  );
}
