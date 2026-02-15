import { useState, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import { File, Paths } from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

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
  const tempFileRef = useRef<File | null>(null);

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

      if (!token) {
        console.warn('Voice coach: no auth token available');
        return null;
      }

      const persona = personaOverride || (profile?.coach_persona as CoachPersona) || 'drill_sergeant';

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/voice-coach`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'apikey': SUPABASE_ANON_KEY,
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

      // Clean up previous temp file
      if (tempFileRef.current?.exists) {
        try { tempFileRef.current.delete(); } catch { /* ignore */ }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Decode base64 → bytes → write to temp file (expo-file-system v19 API)
      const arrayBuffer = decode(base64Audio);
      const bytes = new Uint8Array(arrayBuffer);

      const tempFile = new File(Paths.cache, `coach_audio_${Date.now()}.mp3`);
      tempFile.write(bytes);
      tempFileRef.current = tempFile;

      const fileUri = tempFile.uri;
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true }
      );

      soundRef.current = newSound;
      setPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if ('didJustFinish' in status && status.didJustFinish) {
          setPlaying(false);
          // Clean up temp file in background
          try { tempFile.delete(); } catch { /* ignore */ }
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
