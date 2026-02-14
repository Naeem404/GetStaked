import { useState, useCallback } from 'react';
import { Audio } from 'expo-av';
import { supabase, SUPABASE_URL } from '@/lib/supabase';
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
  | 'idle_reminder';

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
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const getCoachMessage = useCallback(async (
    trigger: CoachTrigger,
    context?: Record<string, any>
  ): Promise<CoachResponse | null> => {
    if (!user) return null;

    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const persona = (profile?.coach_persona as CoachPersona) || 'drill_sergeant';

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

      const data: CoachResponse = await response.json();
      setMessage(data.message);

      // Play audio if available and voice is enabled
      if (data.audio && profile?.coach_voice_enabled !== false) {
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
      if (sound) {
        await sound.unloadAsync();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Convert base64 to a data URI for playback
      const uri = `data:audio/mpeg;base64,${base64Audio}`;
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if ('didJustFinish' in status && status.didJustFinish) {
          setPlaying(false);
        }
      });
    } catch (err) {
      console.error('Audio playback error:', err);
      setPlaying(false);
    }
  };

  const stopAudio = useCallback(async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setPlaying(false);
    }
  }, [sound]);

  return {
    message,
    loading,
    playing,
    getCoachMessage,
    stopAudio,
  };
}
