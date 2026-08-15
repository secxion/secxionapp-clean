import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import SummaryApi, { authFetch } from '../common';
import moment from 'moment';
import { MdModeEdit } from 'react-icons/md';
import {
  FaTrashAlt,
  FaUsers,
  FaSearch,
  FaUserShield,
  FaUser,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import ChangeUserRole from '../components/ChangeUserRole';
import AdminPageLayout from '../components/layout/AdminPageLayout';
import AdminTableShell from '../components/ui/AdminTableShell';

const fetchAllUsers = async () => {
  const response = await authFetch(SummaryApi.allUser.url, {
    method: SummaryApi.allUser.method,
  });
  const dataResponse = await response.json();

  if (!response.ok)
    throw new Error(dataResponse.message || 'Failed to fetch users');

  return dataResponse.data;
};

const deleteUsers = async (userIds, refetch, setSelectedUsers) => {
  if (userIds.length === 0) {
    toast.warn('No users selected.');
    return;
  }

  if (!window.confirm('Are you sure you want to delete the selected users?'))
    return;

  try {
    const response = await authFetch(SummaryApi.deleteUser.url, {
      method: SummaryApi.deleteUser.method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userIds }),
    });

    const responseData = await response.json();

    if (responseData.success) {
      toast.success('Selected users deleted successfully.');
      refetch();
      setSelectedUsers([]);
    } else {
      toast.error(responseData.message || 'Failed to delete users.');
    }
  } catch (error) {
    toast.error('An error occurred while deleting users.');
  }
};

const AllUsers = () => {
  const [openUpdateRole, setOpenUpdateRole] = useState(false);
  const [updateUserDetails, setUpdateUserDetails] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const {
    data: allUser = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['allUsers'],
    queryFn: fetchAllUsers,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const filteredUsers = useMemo(() => {
    return allUser.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [allUser, searchTerm, roleFilter]);

  const stats = useMemo(() => {
    const admins = allUser.filter((u) => u.role === 'ADMIN').length;
    const users = allUser.filter((u) => u.role === 'GENERAL').length;
    return { total: allUser.length, admins, users };
  }, [allUser]);

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user._id));
    }
  };

  return (
    <AdminPageLayout
      title="All Users"
      subtitle="Manage platform users and roles"
      icon={FaUsers}
    >

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="admin-card p-2.5 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-1">
            <div>
              <p className="text-slate-400 text-[10px] sm:text-xs uppercase tracking-wide">
                Total
              </p>
              <p className="text-lg sm:text-2xl font-bold text-white mt-0.5 sm:mt-1">
                {stats.total}
              </p>
            </div>
            <FaUsers className="hidden sm:block text-slate-600 text-2xl" />
          </div>
        </div>
        <div className="admin-card p-2.5 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-1">
            <div>
              <p className="text-slate-400 text-[10px] sm:text-xs uppercase tracking-wide">
                Admins
              </p>
              <p className="text-lg sm:text-2xl font-bold text-yellow-500 mt-0.5 sm:mt-1">
                {stats.admins}
              </p>
            </div>
            <FaUserShield className="hidden sm:block text-yellow-500/30 text-2xl" />
          </div>
        </div>
        <div className="admin-card p-2.5 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-1">
            <div>
              <p className="text-slate-400 text-[10px] sm:text-xs uppercase tracking-wide">
                Regular
              </p>
              <p className="text-lg sm:text-2xl font-bold text-white mt-0.5 sm:mt-1">
                {stats.users}
              </p>
            </div>
            <FaUser className="hidden sm:block text-slate-600 text-2xl" />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-input w-full pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="admin-input flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base"
          >
            <option value="all">All</option>
            <option value="ADMIN">Admins</option>
            <option value="GENERAL">General</option>
          </select>
          <button
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center space-x-1.5 sm:space-x-2 transition-all ${
              selectedUsers.length === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
            }`}
            onClick={() => deleteUsers(selectedUsers, refetch, setSelectedUsers)}
            disabled={selectedUsers.length === 0}
          >
            <FaTrashAlt />
            <span className="hidden sm:inline">Delete </span>({selectedUsers.length})
          </button>
        </div>
      </div>

      {/* Table */}
      <AdminTableShell>
          <table className="w-full min-w-full sm:min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="p-2.5 text-left sm:p-4">
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={
                      selectedUsers.length === filteredUsers.length &&
                      filteredUsers.length > 0
                    }
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-yellow-500 focus:ring-yellow-500/50 focus:ring-offset-0"
                  />
                </th>
                <th className="p-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide sm:p-4">
                  #
                </th>
                <th className="p-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide sm:p-4">
                  User
                </th>
                <th className="p-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide sm:p-4">
                  Role
                </th>
                <th className="hidden p-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide md:table-cell sm:p-4">
                  Joined
                </th>
                <th className="p-2.5 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide sm:p-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-500 border-t-transparent"></div>
                      <span className="text-slate-400">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-red-400">
                    Error loading users. Please try again.
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr
                    key={user._id}
                    className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-2.5 sm:p-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => toggleUserSelection(user._id)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-yellow-500 focus:ring-yellow-500/50 focus:ring-offset-0"
                      />
                    </td>
                    <td className="p-2.5 text-slate-500 text-sm sm:p-4">{index + 1}</td>
                    <td className="p-2.5 sm:p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-slate-900 font-bold text-sm flex-shrink-0">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate capitalize">
                            {user.name}
                          </p>
                          <p className="text-slate-400 text-sm truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-2.5 sm:p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                          user.role === 'ADMIN'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-slate-700/50 text-slate-300 border border-slate-600/50'
                        }`}
                      >
                        {user.role === 'ADMIN' && (
                          <FaUserShield className="mr-1.5" />
                        )}
                        {user.role}
                      </span>
                    </td>
                    <td className="hidden p-2.5 text-slate-400 text-sm md:table-cell sm:p-4">
                      {moment(user.createdAt).format('MMM D, YYYY')}
                    </td>
                    <td className="p-2.5 sm:p-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            setUpdateUserDetails(user);
                            setOpenUpdateRole(true);
                          }}
                          className="p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-yellow-500/20 hover:text-yellow-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                          title="Edit Role"
                          aria-label="Edit user role"
                        >
                          <MdModeEdit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            deleteUsers([user._id], refetch, setSelectedUsers)
                          }
                          className="p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                          title="Delete User"
                          aria-label="Delete user"
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    {searchTerm || roleFilter !== 'all'
                      ? 'No users match your search criteria.'
                      : 'No users found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
      </AdminTableShell>

      {/* Results count */}
      {!isLoading && !error && (
        <div className="mt-4 text-sm text-slate-500">
          Showing {filteredUsers.length} of {allUser.length} users
        </div>
      )}

      {openUpdateRole && updateUserDetails && (
        <ChangeUserRole
          onClose={() => setOpenUpdateRole(false)}
          name={updateUserDetails.name}
          email={updateUserDetails.email}
          role={updateUserDetails.role}
          userId={updateUserDetails._id}
          callFunc={refetch}
        />
      )}
    </AdminPageLayout>
  );
};

export default AllUsers;