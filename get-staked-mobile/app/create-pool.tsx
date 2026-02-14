import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView,
  Alert, Switch, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { C, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { createPool } from '@/hooks/use-pools';
import { useFriends, FriendProfile } from '@/hooks/use-friends';
import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  { key: 'fitness', emoji: '💪', label: 'Fitness' },
  { key: 'health', emoji: '🍎', label: 'Health' },
  { key: 'education', emoji: '📚', label: 'Education' },
  { key: 'wellness', emoji: '🧘', label: 'Wellness' },
  { key: 'productivity', emoji: '💻', label: 'Productivity' },
  { key: 'creative', emoji: '🎨', label: 'Creative' },
  { key: 'other', emoji: '🎯', label: 'Other' },
];

const FREQUENCIES = [
  { key: 'daily', label: 'Daily' },
  { key: '5x_week', label: '5x/week' },
  { key: '3x_week', label: '3x/week' },
];

const EMOJIS = ['🏃', '💪', '📚', '🧘', '💻', '🎸', '🥗', '🥶', '🎯', '🔥', '🧠', '🏋️', '🚴', '🏊', '✍️', '🎨'];

export default function CreatePoolScreen() {
  const { user } = useAuth();
  const { friends } = useFriends();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [proofDescription, setProofDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('fitness');
  const [selectedEmoji, setSelectedEmoji] = useState('🎯');
  const [stakeAmount, setStakeAmount] = useState('0.5');
  const [durationDays, setDurationDays] = useState('7');
  const [frequency, setFrequency] = useState('daily');
  const [maxPlayers, setMaxPlayers] = useState('10');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function toggleFriend(friendId: string) {
    setSelectedFriends(prev =>
      prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]
    );
  }

  async function handleCreate() {
    if (!user) return;
    if (!name.trim()) { Alert.alert('Error', 'Pool name is required'); return; }
    if (!proofDescription.trim()) { Alert.alert('Error', 'Proof description is required'); return; }

    const stake = parseFloat(stakeAmount);
    if (isNaN(stake) || stake <= 0) { Alert.alert('Error', 'Invalid stake amount'); return; }

    const days = parseInt(durationDays);
    if (isNaN(days) || days <= 0) { Alert.alert('Error', 'Invalid duration'); return; }

    const max = parseInt(maxPlayers);
    if (isNaN(max) || max < 2 || max > 50) { Alert.alert('Error', 'Max players must be 2-50'); return; }

    setLoading(true);
    try {
      const { data: pool, error } = await createPool({
        creator_id: user.id,
        name: name.trim(),
        description: description.trim() || null,
        proof_description: proofDescription.trim(),
        emoji: selectedEmoji,
        category: selectedCategory as any,
        stake_amount: stake,
        duration_days: days,
        frequency: frequency as any,
        max_players: max,
        is_private: isPrivate,
      });

      if (error) throw error;

      // Send invites to selected friends for private pools
      if (isPrivate && selectedFriends.length > 0 && pool) {
        const invites = selectedFriends.map(friendId => ({
          pool_id: pool.id,
          invited_by: user.id,
          invited_user_id: friendId,
        }));

        await supabase.from('pool_invites').insert(invites);
      }

      Alert.alert('Success', 'Pool created!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create pool');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          {/* Header */}
          <View style={s.header}>
            <Pressable onPress={() => router.back()} style={s.backBtn}>
              <Ionicons name="arrow-back" size={24} color={C.textPrimary} />
            </Pressable>
            <Text style={s.title}>Create Pool</Text>
          </View>

          {/* Pool Name */}
          <Text style={s.label}>POOL NAME</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. Morning Run Club"
            placeholderTextColor={C.textMuted}
            value={name}
            onChangeText={setName}
            maxLength={50}
          />

          {/* Emoji Picker */}
          <Text style={s.label}>EMOJI</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.emojiRow}>
            {EMOJIS.map(e => (
              <Pressable
                key={e}
                style={[s.emojiBtn, selectedEmoji === e && s.emojiBtnSelected]}
                onPress={() => setSelectedEmoji(e)}
              >
                <Text style={s.emojiText}>{e}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Category */}
          <Text style={s.label}>CATEGORY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catRow}>
            {CATEGORIES.map(cat => (
              <Pressable
                key={cat.key}
                style={[s.catBtn, selectedCategory === cat.key && s.catBtnSelected]}
                onPress={() => setSelectedCategory(cat.key)}
              >
                <Text style={s.catEmoji}>{cat.emoji}</Text>
                <Text style={[s.catLabel, selectedCategory === cat.key && s.catLabelSelected]}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Description */}
          <Text style={s.label}>DESCRIPTION (OPTIONAL)</Text>
          <TextInput
            style={[s.input, s.textArea]}
            placeholder="What's this pool about?"
            placeholderTextColor={C.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={200}
          />

          {/* Proof Description */}
          <Text style={s.label}>PROOF REQUIRED</Text>
          <TextInput
            style={[s.input, s.textArea]}
            placeholder="What proof must members submit? e.g. Photo of running app showing distance"
            placeholderTextColor={C.textMuted}
            value={proofDescription}
            onChangeText={setProofDescription}
            multiline
            numberOfLines={3}
            maxLength={300}
          />

          {/* Stake + Duration Row */}
          <View style={s.row}>
            <View style={s.halfCol}>
              <Text style={s.label}>STAKE (SOL)</Text>
              <TextInput
                style={s.input}
                placeholder="0.5"
                placeholderTextColor={C.textMuted}
                value={stakeAmount}
                onChangeText={setStakeAmount}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={s.halfCol}>
              <Text style={s.label}>DURATION (DAYS)</Text>
              <TextInput
                style={s.input}
                placeholder="7"
                placeholderTextColor={C.textMuted}
                value={durationDays}
                onChangeText={setDurationDays}
                keyboardType="number-pad"
              />
            </View>
          </View>

          {/* Frequency */}
          <Text style={s.label}>FREQUENCY</Text>
          <View style={s.freqRow}>
            {FREQUENCIES.map(f => (
              <Pressable
                key={f.key}
                style={[s.freqBtn, frequency === f.key && s.freqBtnSelected]}
                onPress={() => setFrequency(f.key)}
              >
                <Text style={[s.freqLabel, frequency === f.key && s.freqLabelSelected]}>
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Max Players */}
          <Text style={s.label}>MAX PLAYERS</Text>
          <TextInput
            style={s.input}
            placeholder="10"
            placeholderTextColor={C.textMuted}
            value={maxPlayers}
            onChangeText={setMaxPlayers}
            keyboardType="number-pad"
          />

          {/* Private Toggle */}
          <View style={s.toggleRow}>
            <View style={s.toggleInfo}>
              <Ionicons name={isPrivate ? 'lock-closed' : 'globe-outline'} size={20} color={isPrivate ? C.primary : C.textMuted} />
              <View style={s.toggleText}>
                <Text style={s.toggleTitle}>{isPrivate ? 'Private Pool' : 'Public Pool'}</Text>
                <Text style={s.toggleSubtitle}>
                  {isPrivate ? 'Only invited friends can join' : 'Anyone can discover and join'}
                </Text>
              </View>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: C.bgSurface, true: C.primaryDim }}
              thumbColor={isPrivate ? C.primary : C.textMuted}
            />
          </View>

          {/* Friend Invites (for private pools) */}
          {isPrivate && (
            <View style={s.friendsSection}>
              <Text style={s.label}>INVITE FRIENDS</Text>
              {friends.length === 0 ? (
                <Text style={s.emptyText}>
                  No friends yet. Add friends from the Friends tab to invite them!
                </Text>
              ) : (
                friends.map(f => (
                  <Pressable
                    key={f.id}
                    style={[s.friendRow, selectedFriends.includes(f.friend.id) && s.friendRowSelected]}
                    onPress={() => toggleFriend(f.friend.id)}
                  >
                    <View style={s.friendAvatar}>
                      <Text style={s.friendAvatarText}>
                        {(f.friend.display_name || '?')[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={s.friendInfo}>
                      <Text style={s.friendName}>{f.friend.display_name || 'Unknown'}</Text>
                      {f.friend.username && (
                        <Text style={s.friendUsername}>@{f.friend.username}</Text>
                      )}
                    </View>
                    <Ionicons
                      name={selectedFriends.includes(f.friend.id) ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={selectedFriends.includes(f.friend.id) ? C.success : C.textMuted}
                    />
                  </Pressable>
                ))
              )}
            </View>
          )}

          {/* Create Button */}
          <Pressable style={s.createBtn} onPress={handleCreate} disabled={loading}>
            <LinearGradient
              colors={[C.primary, '#16A34A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.createGradient}
            >
              <Text style={s.createText}>
                {loading ? 'Creating...' : `Create ${isPrivate ? 'Private' : 'Public'} Pool`}
              </Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: Spacing.md, marginBottom: Spacing.xl },
  backBtn: { padding: 4 },
  title: { fontSize: 24, fontWeight: '800', color: C.textPrimary },

  label: {
    fontSize: 11, fontWeight: '700', color: C.textMuted,
    letterSpacing: 1, marginBottom: Spacing.sm, marginTop: Spacing.lg,
  },
  input: {
    backgroundColor: C.bgSurface, borderRadius: Radius.md,
    borderWidth: 1, borderColor: C.border,
    padding: 14, fontSize: 15, color: C.textPrimary,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },

  emojiRow: { flexDirection: 'row', marginBottom: 4 },
  emojiBtn: {
    width: 44, height: 44, borderRadius: Radius.sm,
    backgroundColor: C.bgSurface, alignItems: 'center', justifyContent: 'center',
    marginRight: 8, borderWidth: 1, borderColor: C.border,
  },
  emojiBtnSelected: { borderColor: C.primary, backgroundColor: C.primaryLight },
  emojiText: { fontSize: 22 },

  catRow: { flexDirection: 'row', marginBottom: 4 },
  catBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.full,
    backgroundColor: C.bgSurface, borderWidth: 1, borderColor: C.border, marginRight: 8,
  },
  catBtnSelected: { borderColor: C.primary, backgroundColor: C.primaryLight },
  catEmoji: { fontSize: 14 },
  catLabel: { fontSize: 13, color: C.textSecondary, fontWeight: '600' },
  catLabelSelected: { color: C.primary },

  row: { flexDirection: 'row', gap: 12 },
  halfCol: { flex: 1 },

  freqRow: { flexDirection: 'row', gap: 8 },
  freqBtn: {
    flex: 1, paddingVertical: 12, borderRadius: Radius.md,
    backgroundColor: C.bgSurface, alignItems: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  freqBtnSelected: { borderColor: C.primary, backgroundColor: C.primaryLight },
  freqLabel: { fontSize: 13, fontWeight: '600', color: C.textSecondary },
  freqLabelSelected: { color: C.primary },

  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.bgSurface, borderRadius: Radius.md,
    padding: Spacing.md, marginTop: Spacing.xl,
    borderWidth: 1, borderColor: C.border,
  },
  toggleInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  toggleText: { flex: 1 },
  toggleTitle: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  toggleSubtitle: { fontSize: 12, color: C.textMuted, marginTop: 2 },

  friendsSection: { marginTop: Spacing.sm },
  emptyText: { fontSize: 13, color: C.textMuted, textAlign: 'center', paddingVertical: 16 },
  friendRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: Spacing.md, backgroundColor: C.bgSurface, borderRadius: Radius.md,
    marginBottom: 8, borderWidth: 1, borderColor: C.border,
  },
  friendRowSelected: { borderColor: C.success, backgroundColor: C.primaryLight },
  friendAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: C.bgElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  friendAvatarText: { fontSize: 16, fontWeight: '700', color: C.textPrimary },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 14, fontWeight: '600', color: C.textPrimary },
  friendUsername: { fontSize: 12, color: C.textMuted },

  createBtn: { marginTop: Spacing.xl },
  createGradient: {
    paddingVertical: 16, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  createText: { fontSize: 16, fontWeight: '700', color: C.white },
});
