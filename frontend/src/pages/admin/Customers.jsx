import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineSearch, HiOutlinePlus, HiX } from 'react-icons/hi';
import { StatusBadge } from '@/components/admin/StatCard';
import adminApi from '@/services/adminApi';

const ROLES = ['customer', 'employee', 'admin'];
const emptyStaffForm = { name: '', email: '', password: '', role: 'employee' };

export default function AdminCustomers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffForm, setStaffForm] = useState(emptyStaffForm);
  const [creatingStaff, setCreatingStaff] = useState(false);

  const load = () => {
    adminApi
      .listCustomers({ q: search || undefined, role: roleFilter || undefined, limit: 50 })
      .then((d) => setUsers(d.users))
      .catch(() => toast.error('Could not load users'));
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter]);

  const changeRole = async (user, role) => {
    try {
      await adminApi.updateUserRole(user._id, role);
      toast.success(`${user.name} is now ${role}`);
      load();
    } catch {
      toast.error('Could not update role');
    }
  };

  const toggleActive = async (user) => {
    try {
      await adminApi.toggleUserActive(user._id);
      toast.success(`${user.name} ${user.isActive ? 'deactivated' : 'reactivated'}`);
      load();
    } catch {
      toast.error('Could not update status');
    }
  };

  const submitStaffForm = async (e) => {
    e.preventDefault();
    if (staffForm.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setCreatingStaff(true);
    try {
      await adminApi.createStaffMember(staffForm);
      toast.success(`${staffForm.name} added as ${staffForm.role}`);
      setStaffForm(emptyStaffForm);
      setShowStaffForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create staff account');
    } finally {
      setCreatingStaff(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow mb-2">People</p>
          <h1 className="heading-display text-3xl">Customers & Staff</h1>
        </div>
        <button
          onClick={() => setShowStaffForm((v) => !v)}
          className="flex items-center gap-2 px-5 py-3 bg-gold text-obsidian text-xs tracking-widest2 uppercase font-semibold"
        >
          <HiOutlinePlus /> Add Staff Member
        </button>
      </div>

      {showStaffForm && (
        <form onSubmit={submitStaffForm} className="glass p-5 space-y-4 max-w-md">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gold">New Admin or Employee Account</p>
            <button type="button" onClick={() => setShowStaffForm(false)}><HiX /></button>
          </div>
          <p className="text-xs text-ivory/40 -mt-2">
            This creates a working login immediately — no signup or email verification needed.
          </p>

          <input
            required
            placeholder="Full name"
            value={staffForm.name}
            onChange={(e) => setStaffForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full bg-transparent border border-gold/25 px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
          <input
            required
            type="email"
            placeholder="Email address"
            value={staffForm.email}
            onChange={(e) => setStaffForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full bg-transparent border border-gold/25 px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
          <input
            required
            type="password"
            placeholder="Password (min. 8 characters)"
            value={staffForm.password}
            onChange={(e) => setStaffForm((f) => ({ ...f, password: e.target.value }))}
            className="w-full bg-transparent border border-gold/25 px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
          <div>
            <p className="text-[11px] tracking-widest2 uppercase text-ivory/50 mb-2">Role</p>
            <div className="flex gap-3">
              {['employee', 'admin'].map((r) => (
                <label
                  key={r}
                  className={`flex-1 text-center py-2.5 border text-xs uppercase tracking-wide cursor-pointer transition-colors capitalize ${
                    staffForm.role === r ? 'bg-gold text-obsidian border-gold font-semibold' : 'border-gold/25 text-ivory/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="staffRole"
                    value={r}
                    checked={staffForm.role === r}
                    onChange={(e) => setStaffForm((f) => ({ ...f, role: e.target.value }))}
                    className="sr-only"
                  />
                  {r}
                </label>
              ))}
            </div>
            <p className="text-xs text-ivory/40 mt-2">
              {staffForm.role === 'admin'
                ? 'Full access: products, orders, staff, settings — everything.'
                : 'Can manage products, orders, and reviews, but not staff accounts or settings.'}
            </p>
          </div>

          <button
            type="submit"
            disabled={creatingStaff}
            className="w-full py-2.5 bg-gold text-obsidian text-xs tracking-widest2 uppercase font-semibold disabled:opacity-50"
          >
            {creatingStaff ? 'Creating…' : 'Create Account'}
          </button>
        </form>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full bg-transparent border border-gold/25 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-obsidian border border-gold/25 px-4 py-2.5 text-sm"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="glass rounded-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-xs text-ivory/40 border-b border-gold/10">
              <th className="px-6 py-3 font-normal">Name</th>
              <th className="px-6 py-3 font-normal">Email</th>
              <th className="px-6 py-3 font-normal">Role</th>
              <th className="px-6 py-3 font-normal">Status</th>
              <th className="px-6 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b border-gold/5 last:border-0 hover:bg-gold/5">
                <td className="px-6 py-3">{user.name}</td>
                <td className="px-6 py-3 text-ivory/60">{user.email}</td>
                <td className="px-6 py-3">
                  <select
                    value={user.role}
                    onChange={(e) => changeRole(user, e.target.value)}
                    className="bg-obsidian border border-gold/20 px-2 py-1 text-xs capitalize"
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-6 py-3"><StatusBadge status={user.isActive ? 'active' : 'inactive'} /></td>
                <td className="px-6 py-3 text-right">
                  <button onClick={() => toggleActive(user)} className="text-xs text-gold hover:underline">
                    {user.isActive ? 'Deactivate' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-ivory/40">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
