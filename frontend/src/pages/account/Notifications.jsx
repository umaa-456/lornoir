import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { HiOutlineBell } from 'react-icons/hi';
import api from '@/services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState(null);

  const load = () =>
    api
      .get('/notifications')
      .then(({ data }) => setNotifications(data.notifications))
      .catch(() => toast.error('Could not load notifications'));

  useEffect(() => { load(); }, []);

  const markRead = async (n) => {
    if (n.isRead) return;
    await api.patch(`/notifications/${n._id}/read`);
    load();
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    load();
  };

  return (
    <div>
      <Helmet><title>Notifications — L'Or Noir</title></Helmet>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gold">Notifications</p>
        {notifications?.some((n) => !n.isRead) && (
          <button onClick={markAllRead} className="text-xs text-ivory/50 hover:text-gold">Mark all as read</button>
        )}
      </div>

      {notifications?.length === 0 && (
        <div className="glass p-10 text-center text-ivory/50">
          <HiOutlineBell className="text-2xl mx-auto mb-3 text-gold/50" />
          Nothing here yet.
        </div>
      )}

      <div className="space-y-2">
        {notifications?.map((n) => {
          const content = (
            <div
              onClick={() => markRead(n)}
              className={`glass p-4 flex gap-3 cursor-pointer transition-opacity ${n.isRead ? 'opacity-60' : ''}`}
            >
              {!n.isRead && <span className="w-2 h-2 rounded-full bg-gold mt-1.5 shrink-0" />}
              <div>
                <p className="text-sm">{n.title}</p>
                <p className="text-xs text-ivory/50 mt-1">{n.message}</p>
                <p className="text-[10px] text-ivory/30 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </div>
          );
          return n.link ? <Link key={n._id} to={n.link}>{content}</Link> : <div key={n._id}>{content}</div>;
        })}
      </div>
    </div>
  );
}
