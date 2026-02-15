import { useState, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import { supabase, SUPABASE_URL } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

// expo-file-system v19+ moved the classic API to /legacy
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FileSystem = require('expo-file-system/legacy') as {
  cacheDirectory: string | null;
  writeAsStringAsync: (uri: string, contents: string, options?: { encoding: string }) => Promise<void>;
  deleteAsync: (uri: string, options?: { idempotent: boolean }) => Promise<void>;
};

export type CoachPersona = 'drill_sergeant' | 'hype_beast' | 'gentle_guide';
export type CoachTrigger =
  | 'morning_reminder'
  | 'streak_broken'
  | 'proof_verified'
  | 'proof_rejected'
  | 'pool_won'
  | 'pool_joined'
  | 'milestone_streak'
  | 'idle_reminder'
  | 'someone_failed';

interface CoachResponse {
  message: string;
  audio: string | null;
  persona: CoachPersona;
  trigger: string;
}

export function useCoach() {
  const { user, profile } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const getCoachMessage = useCallback(async (
    trigger: CoachTrigger,
    context?: Record<string, any>,
    personaOverride?: CoachPersona,
  ): Promise<CoachResponse | null> => {
    if (!user) return null;

    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const persona = personaOverride || (profile?.coach_persona as CoachPersona) || 'drill_sergeant';

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/voice-coach`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            persona,
            trigger,
            context,
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error('Voice coach HTTP error:', response.status, errText);
        return null;
      }

      const data: CoachResponse = await response.json();
      setMessage(data.message);

      // Play audio if available and voice is enabled
      if (data.audio && (profile as any)?.coach_voice_enabled !== false) {
        await playAudio(data.audio);
      }

      return data;
    } catch (err) {
      console.error('Coach error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  const playAudio = async (base64Audio: string) => {
    try {
      // Stop any currently playing audio
      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
        } catch {
          // ignore cleanup errors
        }
        soundRef.current = null;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Write base64 audio to a temp file — expo-av cannot play data: URIs on native
      const tempFile = `${FileSystem.cacheDirectory}coach_audio_${Date.now()}.mp3`;
      await FileSystem.writeAsStringAsync(tempFile, base64Audio, {
        encoding: 'base64',
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: tempFile },
        { shouldPlay: true }
      );

      soundRef.current = newSound;
      setPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if ('didJustFinish' in status && status.didJustFinish) {
          setPlaying(false);
          // Clean up temp file in background
          FileSystem.deleteAsync(tempFile, { idempotent: true }).catch(() => {});
        }
      });
    } catch (err) {
      console.error('Audio playback error:', err);
      setPlaying(false);
    }
  };

  const stopAudio = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {
        // ignore
      }
      soundRef.current = null;
      setPlaying(false);
    }
  }, []);

  return {
    message,
    loading,
    playing,
    getCoachMessage,
    stopAudio,
  };
}
