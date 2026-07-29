// RoomSwitcher — left rail of the /chat page.
// RLS decides which rooms come back; we just render whatever the API returns.
// Owner: mia · TS-009 Push C2
'use client'

import { Hash, Users } from 'lucide-react'
import type { ChatRoom } from '@/app/api/chat/rooms/route'

interface RoomSwitcherProps {
  rooms: ChatRoom[]
  activeRoomId: string | null
  onSelect: (roomId: string) => void
  loading?: boolean
}

export function RoomSwitcher({ rooms, activeRoomId, onSelect, loading }: RoomSwitcherProps) {
  const wholeTeam = rooms.find((r) => r.kind === 'whole_team')
  const departments = rooms.filter((r) => r.kind === 'department')

  return (
    <div className="flex h-full flex-col overflow-y-auto no-scrollbar">
      {loading && (
        <div className="px-4 py-8 text-center text-[12px] text-on-surface-variant">
          Loading rooms…
        </div>
      )}

      {wholeTeam && (
        <section className="px-2 py-3">
          <div className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/70">
            All hands
          </div>
          <RoomItem
            room={wholeTeam}
            active={activeRoomId === wholeTeam.id}
            onSelect={onSelect}
            icon={<Users className="h-4 w-4" />}
          />
        </section>
      )}

      {departments.length > 0 && (
        <section className="px-2 py-3">
          <div className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/70">
            Departments
          </div>
          <ul className="space-y-0.5">
            {departments.map((r) => (
              <li key={r.id}>
                <RoomItem
                  room={r}
                  active={activeRoomId === r.id}
                  onSelect={onSelect}
                  icon={<Hash className="h-4 w-4" />}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {!loading && rooms.length === 0 && (
        <div className="px-4 py-8 text-center text-[12px] text-on-surface-variant/60">
          No rooms available.
          <br />
          Ask the owner to assign a department to you.
        </div>
      )}
    </div>
  )
}

function RoomItem({
  room,
  active,
  onSelect,
  icon,
}: {
  room: ChatRoom
  active: boolean
  onSelect: (roomId: string) => void
  icon: React.ReactNode
}) {
  return (
    <button
      onClick={() => onSelect(room.id)}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition ${
        active
          ? 'bg-white/[0.08] text-on-surface'
          : 'text-on-surface-variant hover:bg-white/[0.04] hover:text-on-surface'
      }`}
    >
      <span className={active ? 'text-on-surface' : 'text-on-surface-variant/70'}>{icon}</span>
      <span className="flex-1 truncate">{room.label}</span>
    </button>
  )
}
