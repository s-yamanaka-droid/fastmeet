'use client'

import { useState } from 'react'
import Link from 'next/link'

type MeetingType = {
  id: string
  name: string
  slug: string
  duration_minutes: number
  color: string
  is_active: boolean
}

type Booking = {
  id: string
  guest_name: string
  guest_email: string
  guest_company: string | null
  start_time: string
  end_time: string
  fastmeet_meeting_types: { name: string; color: string } | null
}

type Props = {
  username: string
  initialMeetingTypes: MeetingType[]
  initialBookings: Booking[]
}

export default function DashboardClient({ username, initialMeetingTypes, initialBookings }: Props) {
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>(initialMeetingTypes)
  const [copied, setCopied] = useState<string | null>(null)

  function copyLink(slug: string) {
    const url = `${window.location.origin}/book/${username}/${slug}`
    navigator.clipboard.writeText(url)
    setCopied(slug)
    setTimeout(() => setCopied(null), 2000)
  }

  async function deleteType(id: string) {
    await fetch(`/api/meeting-types?id=${id}`, { method: 'DELETE' })
    setMeetingTypes((prev) => prev.filter((t) => t.id !== id))
  }

  function formatDateTime(iso: string) {
    return new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  }

  function formatEndTime(iso: string) {
    return new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e0e0e5', padding: '0 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#0066CC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="16" y1="2" x2="16" y2="6" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 17, color: '#1d1d1f' }}>FASTMeet</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {username && (
              <span style={{ fontSize: 13, color: '#4b5563' }}>@{username}</span>
            )}
            <Link
              href="/api/auth/signout?callbackUrl=/"
              style={{ padding: '6px 14px', borderRadius: 8, background: '#f0f0f5', color: '#4b5563', textDecoration: 'none', fontSize: 14 }}
            >
              ログアウト
            </Link>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        {/* Meeting Types */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1d1d1f', margin: 0 }}>ミーティング種別</h2>
          <Link href="/dashboard/types/new" style={{
            padding: '8px 18px', borderRadius: 10, background: '#0066CC', color: '#fff',
            textDecoration: 'none', fontSize: 14, fontWeight: 600
          }}>
            + 新規作成
          </Link>
        </div>

        <div style={{ display: 'grid', gap: 12, marginBottom: 40 }}>
          {meetingTypes.length === 0 && (
            <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', color: '#4b5563', fontSize: 15 }}>
              まだ種別がありません。「+ 新規作成」から追加してください。
            </div>
          )}
          {meetingTypes.map((type) => (
            <div key={type.id} style={{
              background: '#fff', borderRadius: 14, padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}>
              <div style={{ width: 10, height: 10, borderRadius: 5, background: type.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: '#1d1d1f' }}>{type.name}</div>
                <div style={{ fontSize: 13, color: '#4b5563', marginTop: 2 }}>{type.duration_minutes}分</div>
                {username && (
                  <div style={{ fontSize: 12, color: '#0066CC', marginTop: 2 }}>
                    /book/{username}/{type.slug}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => copyLink(type.slug)}
                  style={{
                    padding: '7px 14px', borderRadius: 8, border: '1px solid #e0e0e5',
                    background: copied === type.slug ? '#e8f0fe' : '#fff',
                    color: copied === type.slug ? '#0066CC' : '#3a3a3c',
                    fontSize: 13, fontWeight: 500, cursor: 'pointer'
                  }}
                >
                  {copied === type.slug ? 'コピー済' : 'URLコピー'}
                </button>
                <Link
                  href={`/book/${username}/${type.slug}`}
                  target="_blank"
                  style={{ padding: '7px 14px', borderRadius: 8, background: '#f0f0f5', color: '#1d1d1f', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}
                >
                  プレビュー
                </Link>
                <button
                  onClick={() => deleteType(type.id)}
                  style={{ padding: '7px 10px', borderRadius: 8, background: '#fff0f0', color: '#c0392b', border: 'none', fontSize: 13, cursor: 'pointer' }}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming Bookings */}
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1d1d1f', marginBottom: 16 }}>今後の予定</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {initialBookings.length === 0 && (
            <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', color: '#4b5563', fontSize: 15 }}>
              まだ予約はありません。
            </div>
          )}
          {initialBookings.map((b) => (
            <div key={b.id} style={{
              background: '#fff', borderRadius: 14, padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: 14,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}>
              {b.fastmeet_meeting_types && (
                <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 2, background: b.fastmeet_meeting_types.color, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: '#1d1d1f' }}>
                  {b.guest_name}{b.guest_company && ` (${b.guest_company})`}
                </div>
                <div style={{ fontSize: 13, color: '#4b5563', marginTop: 3 }}>
                  {formatDateTime(b.start_time)} 〜 {formatEndTime(b.end_time)}
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#4b5563' }}>{b.guest_email}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
