import { useEffect, useState } from 'react';
import api from '@/services/api';
export default function AdminNotifications() {
  const [notes, setNotes] = useState(null);
  useEffect(() => { api.get('/notifications').then(({ data }) => setNotes(data.notifications || [])).catch(() => setNotes([])); }, []);
  return <div className="max-w-3xl"><p className="eyebrow mb-2">Updates</p><h1 className="heading-display text-3xl mb-6">Notifications</h1>{notes === null ? <p className="text-ivory/50">Loading…</p> : notes.length === 0 ? <p className="text-ivory/50">No notifications yet.</p> : <div className="space-y-3">{notes.map((note) => <button key={note._id} onClick={async () => { await api.patch(`/notifications/${note._id}/read`); setNotes((all) => all.map((n) => n._id === note._id ? { ...n, isRead: true } : n)); }} className={`w-full text-left glass p-4 ${note.isRead ? 'opacity-60' : 'border border-gold/40'}`}><p className="text-gold text-sm">{note.title}</p><p className="text-sm mt-1">{note.message}</p><p className="text-xs text-ivory/40 mt-2">{new Date(note.createdAt).toLocaleString()}</p></button>)}</div>}</div>;
}
