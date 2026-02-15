"use client"

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

export interface LeaderboardEntry {
  user_id: string
  display_name: string | null
  username: string | null
  avatar_url: string | null
  wallet_address: string | null
  current_streak: number
  best_streak: number
  total_pools_joined: number
  total_pools_won: number
  total_sol_earned: number
  total_proofs_submitted: number
  rank: number
}

export function useGlobalLeaderboard(limit: number = 50) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true)

      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'get_global_leaderboard',
        { p_limit: limit }
      )

      if (!rpcError && rpcData && rpcData.length > 0) {
        setEntries(rpcData)
        if (user) {
          const me = rpcData.find((e: any) => e.user_id === user.id)
          setMyRank(me || null)
        }
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, username, avatar_url, wallet_address, current_streak, best_streak, total_pools_joined, total_pools_won, total_sol_earned, total_proofs_submitted')
          .or('current_streak.gt.0,total_pools_joined.gt.0')
          .order('current_streak', { ascending: false, nullsFirst: false })
          .order('best_streak', { ascending: false, nullsFirst: false })
          .order('total_proofs_submitted', { ascending: false, nullsFirst: false })
          .limit(limit)

        if (error) throw error

        const ranked: LeaderboardEntry[] = (data || []).map((p: any, idx: number) => ({
          user_id: p.id,
          display_name: p.display_name,
          username: p.username,
          avatar_url: p.avatar_url,
          wallet_address: p.wallet_address,
          current_streak: p.current_streak ?? 0,
          best_streak: p.best_streak ?? 0,
          total_pools_joined: p.total_pools_joined ?? 0,
          total_pools_won: p.total_pools_won ?? 0,
          total_sol_earned: p.total_sol_earned ?? 0,
          total_proofs_submitted: p.total_proofs_submitted ?? 0,
          rank: idx + 1,
        }))

        setEntries(ranked)
        if (user) {
          const me = ranked.find(e => e.user_id === user.id)
          setMyRank(me || null)
        }
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }, [user, limit])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  return { entries, myRank, loading, refetch: fetchLeaderboard }
}
