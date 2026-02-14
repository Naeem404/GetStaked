import { useState, useCallback } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView,
  Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { C, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import {
  useFriends, useSearchProfiles, sendFriendRequest,
  acceptFriendRequest, removeFriend, FriendProfile,
} from '@/hooks/use-friends';

export default function FriendsScreen() {
  const { user } = useAuth();
  const { friends, pendingRequests, loading, refetch } = useFriends();
  const { results, searching, search } = useSearchProfiles();
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<'friends' | 'requests' | 'search'>('friends');

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    if (text.length >= 2) {
      setTab('search');
      search(text);
    } else if (text.length === 0) {
      setTab('friends');
    }
  }, [search]);

  async function handleSendRequest(profile: FriendProfile) {
    if (!user) return;
    const { error } = await sendFriendRequest(user.id, profile.id);
    if (error) {
      Alert.alert('Info', (error as any).message || 'Could not send request');
    } else {
      Alert.alert('Sent!', `Friend request sent to ${profile.display_name || 'user'}`);
    }
  }

  async function handleAccept(friendshipId: string) {
    const { error } = await acceptFriendRequest(friendshipId);
    if (error) {
      Alert.alert('Error', 'Could not accept request');
    } else {
      refetch();
    }
  }

  async function handleRemove(friendshipId: string, name: string) {
    Alert.alert('Remove Friend', `Remove ${name} from friends?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          await removeFriend(friendshipId);
          refetch();
        },
      },
    ]);
  }

  // Check if a profile is already a friend or has pending request
  const friendIds = new Set(friends.map(f => f.friend.id));
  const pendingIds = new Set(pendingRequests.map(f => f.friend.id));

  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      {/* Header */}
      <View style={st.header}>
        <Pressable onPress={() => router.back()} style={st.backBtn}>
          <Ionicons name="arrow-back" size={24} color={C.textPrimary} />
        </Pressable>
        <Text style={st.title}>Friends</Text>
        {pendingRequests.length > 0 && (
          <View style={st.badge}>
            <Text style={st.badgeText}>{pendingRequests.length}</Text>
          </View>
        )}
      </View>

      {/* Search Bar */}
      <View style={st.searchWrap}>
        <Ionicons name="search" size={18} color={C.textMuted} />
        <TextInput
          style={st.searchInput}
          placeholder="Search by name or username..."
          placeholderTextColor={C.textMuted}
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => { setSearchQuery(''); setTab('friends'); }}>
            <Ionicons name="close-circle" size={20} color={C.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Tabs */}
      <View style={st.tabs}>
        <Pressable
          style={[st.tab, tab === 'friends' && st.tabActive]}
          onPress={() => setTab('friends')}
        >
          <Text style={[st.tabText, tab === 'friends' && st.tabTextActive]}>
            Friends ({friends.length})
          </Text>
        </Pressable>
        <Pressable
          style={[st.tab, tab === 'requests' && st.tabActive]}
          onPress={() => setTab('requests')}
        >
          <Text style={[st.tabText, tab === 'requests' && st.tabTextActive]}>
            Requests {pendingRequests.length > 0 ? `(${pendingRequests.length})` : ''}
          </Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll}>
        {/* Search Results */}
        {tab === 'search' && (
          <>
            {searching ? (
              <ActivityIndicator color={C.brandFire} style={{ marginTop: 40 }} />
            ) : results.length === 0 ? (
              <View style={st.emptyState}>
                <Ionicons name="search-outline" size={48} color={C.textMuted} />
                <Text style={st.emptyTitle}>
                  {searchQuery.length < 2 ? 'Type to search' : 'No users found'}
                </Text>
                <Text style={st.emptySubtitle}>Search by name or username</Text>
              </View>
            ) : (
              results.map(profile => (
                <View key={profile.id} style={st.personRow}>
                  <View style={st.avatar}>
                    <Text style={st.avatarText}>
                      {(profile.display_name || '?')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={st.personInfo}>
                    <Text style={st.personName}>{profile.display_name || 'Unknown'}</Text>
                    {profile.username && (
                      <Text style={st.personUsername}>@{profile.username}</Text>
                    )}
                  </View>
                  {friendIds.has(profile.id) ? (
                    <View style={st.statusBadge}>
                      <Ionicons name="checkmark" size={14} color={C.success} />
                      <Text style={st.statusText}>Friends</Text>
                    </View>
                  ) : pendingIds.has(profile.id) ? (
                    <View style={st.statusBadge}>
                      <Ionicons name="time" size={14} color={C.warning} />
                      <Text style={[st.statusText, { color: C.warning }]}>Pending</Text>
                    </View>
                  ) : (
                    <Pressable style={st.addBtn} onPress={() => handleSendRequest(profile)}>
                      <Ionicons name="person-add" size={16} color={C.brandFire} />
                      <Text style={st.addBtnText}>Add</Text>
                    </Pressable>
                  )}
                </View>
              ))
            )}
          </>
        )}

        {/* Pending Requests */}
        {tab === 'requests' && (
          <>
            {pendingRequests.length === 0 ? (
              <View style={st.emptyState}>
                <Ionicons name="mail-outline" size={48} color={C.textMuted} />
                <Text style={st.emptyTitle}>No pending requests</Text>
                <Text style={st.emptySubtitle}>When someone adds you, it'll show up here</Text>
              </View>
            ) : (
              pendingRequests.map(req => (
                <View key={req.id} style={st.personRow}>
                  <View style={st.avatar}>
                    <Text style={st.avatarText}>
                      {(req.friend.display_name || '?')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={st.personInfo}>
                    <Text style={st.personName}>{req.friend.display_name || 'Unknown'}</Text>
                    {req.friend.username && (
                      <Text style={st.personUsername}>@{req.friend.username}</Text>
                    )}
                  </View>
                  <View style={st.actionBtns}>
                    <Pressable style={st.acceptBtn} onPress={() => handleAccept(req.id)}>
                      <Ionicons name="checkmark" size={18} color={C.white} />
                    </Pressable>
                    <Pressable
                      style={st.declineBtn}
                      onPress={() => handleRemove(req.id, req.friend.display_name || 'this user')}
                    >
                      <Ionicons name="close" size={18} color={C.danger} />
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* Friends List */}
        {tab === 'friends' && (
          <>
            {loading ? (
              <ActivityIndicator color={C.brandFire} style={{ marginTop: 40 }} />
            ) : friends.length === 0 ? (
              <View style={st.emptyState}>
                <Ionicons name="people-outline" size={48} color={C.textMuted} />
                <Text style={st.emptyTitle}>No friends yet</Text>
                <Text style={st.emptySubtitle}>Search for people above to add them!</Text>
              </View>
            ) : (
              friends.map(f => (
                <Pressable key={f.id} style={st.personRow}>
                  <View style={st.avatar}>
                    <Text style={st.avatarText}>
                      {(f.friend.display_name || '?')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={st.personInfo}>
                    <Text style={st.personName}>{f.friend.display_name || 'Unknown'}</Text>
                    {f.friend.username && (
                      <Text style={st.personUsername}>@{f.friend.username}</Text>
                    )}
                    {(f.friend.current_streak ?? 0) > 0 && (
                      <View style={st.streakRow}>
                        <Text style={st.streakIcon}>🔥</Text>
                        <Text style={st.streakText}>{f.friend.current_streak} day streak</Text>
                      </View>
                    )}
                  </View>
                  <Pressable
                    style={st.moreBtn}
                    onPress={() => handleRemove(f.id, f.friend.display_name || 'this user')}
                  >
                    <Ionicons name="ellipsis-horizontal" size={20} color={C.textMuted} />
                  </Pressable>
                </Pressable>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bgPrimary },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 24, fontWeight: '800', color: C.textPrimary, flex: 1 },
  badge: {
    backgroundColor: C.danger, borderRadius: 12,
    minWidth: 24, height: 24, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: C.white },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.bgSurface, borderRadius: Radius.md,
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, marginHorizontal: Spacing.xl, marginBottom: Spacing.md,
  },
  searchInput: { flex: 1, height: 48, fontSize: 15, color: C.textPrimary },

  tabs: {
    flexDirection: 'row', marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md, gap: 8,
  },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: Radius.md,
    backgroundColor: C.bgSurface, alignItems: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  tabActive: { borderColor: C.brandFire, backgroundColor: C.fireLight },
  tabText: { fontSize: 13, fontWeight: '600', color: C.textSecondary },
  tabTextActive: { color: C.brandFire },

  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },

  personRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: Spacing.md, backgroundColor: C.bgSurface, borderRadius: Radius.md,
    marginBottom: 8, borderWidth: 1, borderColor: C.border,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: C.bgElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: C.textPrimary },
  personInfo: { flex: 1 },
  personName: { fontSize: 15, fontWeight: '600', color: C.textPrimary },
  personUsername: { fontSize: 12, color: C.textMuted, marginTop: 1 },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  streakIcon: { fontSize: 12 },
  streakText: { fontSize: 11, color: C.brandFire, fontWeight: '600' },

  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.md,
    backgroundColor: C.fireLight, borderWidth: 1, borderColor: C.brandFire,
  },
  addBtnText: { fontSize: 13, fontWeight: '600', color: C.brandFire },

  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  statusText: { fontSize: 12, color: C.success, fontWeight: '600' },

  actionBtns: { flexDirection: 'row', gap: 8 },
  acceptBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: C.success,
    alignItems: 'center', justifyContent: 'center',
  },
  declineBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: C.bgElevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  moreBtn: { padding: 8 },

  emptyState: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: C.textSecondary },
  emptySubtitle: { fontSize: 13, color: C.textMuted },
});
