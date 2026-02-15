import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import SummaryApi from '../common';
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
import ChangeUserRole from '../Components/ChangeUserRole';

const fetchAllUsers = async () => {
  const response = await fetch(SummaryApi.allUser.url, {
    method: SummaryApi.allUser.method,
    credentials: 'include',
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
    const response = await fetch(SummaryApi.deleteUser.url, {
      method: SummaryApi.deleteUser.method,
      credentials: 'include',
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
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-500/10 rounded-xl">
            <FaUsers className="text-yellow-500 text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">All Users</h1>
            <p className="text-slate-400 text-sm">
              Manage platform users and roles
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide">
                Total Users
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.total}
              </p>
            </div>
            <FaUsers className="text-slate-600 text-2xl" />
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide">
                Admins
              </p>
              <p className="text-2xl font-bold text-yellow-500 mt-1">
                {stats.admins}
              </p>
            </div>
            <FaUserShield className="text-yellow-500/30 text-2xl" />
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide">
                Regular
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.users}
              </p>
            </div>
            <FaUser className="text-slate-600 text-2xl" />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-colors"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
        >
          <option value="all">All Roles</option>
          <option value="ADMIN">Admins</option>
          <option value="GENERAL">General</option>
        </select>
        <button
          className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center space-x-2 transition-all ${
            selectedUsers.length === 0
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
          }`}
          onClick={() => deleteUsers(selectedUsers, refetch, setSelectedUsers)}
          disabled={selectedUsers.length === 0}
        >
          <FaTrashAlt />
          <span>Delete ({selectedUsers.length})</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="p-4 text-left">
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
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  #
                </th>
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  User
                </th>
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Role
                </th>
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Joined
                </th>
                <th className="p-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">
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
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => toggleUserSelection(user._id)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-yellow-500 focus:ring-yellow-500/50 focus:ring-offset-0"
                      />
                    </td>
                    <td className="p-4 text-slate-500 text-sm">{index + 1}</td>
                    <td className="p-4">
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
                    <td className="p-4">
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
                    <td className="p-4 text-slate-400 text-sm">
                      {moment(user.createdAt).format('MMM D, YYYY')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            setUpdateUserDetails(user);
                            setOpenUpdateRole(true);
                          }}
                          className="p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-yellow-500/20 hover:text-yellow-400 transition-colors"
                          title="Edit Role"
                        >
                          <MdModeEdit size={16} />
                        </button>
                        <button
                          onClick={() =>
                            deleteUsers([user._id], refetch, setSelectedUsers)
                          }
                          className="p-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                          title="Delete User"
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
        </div>
      </div>

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
    </div>
  );
};

export default AllUsers;
