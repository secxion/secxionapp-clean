import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import SummaryApi from '../common';
import moment from 'moment';
import { MdModeEdit } from 'react-icons/md';
import { FaTrashAlt} from 'react-icons/fa';
import { toast } from 'react-toastify';
import ChangeUserRole from '../Components/ChangeUserRole';

const fetchAllUsers = async () => {
    const response = await fetch(SummaryApi.allUser.url, {
        method: SummaryApi.allUser.method,
        credentials: 'include'
    });
    const dataResponse = await response.json();

    if (!response.ok) throw new Error(dataResponse.message || "Failed to fetch users");

    return dataResponse.data;
};

const deleteUsers = async (userIds, refetch, setSelectedUsers) => {
    if (userIds.length === 0) {
        toast.warn("No users selected.");
        return;
    }

    if (!window.confirm("Are you sure you want to delete the selected users?")) return;

    try {
        const response = await fetch(SummaryApi.deleteUser.url, {
            method: SummaryApi.deleteUser.method,
            credentials: 'include',
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ userIds })
        });

        const responseData = await response.json();

        if (responseData.success) {
            toast.success("Selected users deleted successfully.");
            refetch();
            setSelectedUsers([]);
        } else {
            toast.error(responseData.message || "Failed to delete users.");
        }
    } catch (error) {
        toast.error("An error occurred while deleting users.");
    }
};

const AllUsers = () => {
    const [openUpdateRole, setOpenUpdateRole] = useState(false);
    const [updateUserDetails, setUpdateUserDetails] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);

    const { data: allUser = [], isLoading, error, refetch } = useQuery({
        queryKey: ["allUsers"],
        queryFn: fetchAllUsers,
        staleTime: 1000 * 60 * 5,
        retry: 2,
    });

    const toggleUserSelection = (userId) => {
        setSelectedUsers((prev) =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedUsers.length === allUser.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(allUser.map(user => user._id));
        }
    };

    return (
        <div className='container pt-6 pb-4 h-full flex flex-col'>
            {/* Bulk Actions */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-end items-center">
                <button
                    className={`inline-flex  items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${selectedUsers.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => deleteUsers(selectedUsers, refetch, setSelectedUsers)}
                    disabled={selectedUsers.length === 0}
                >
                    <FaTrashAlt className="mr-2" /> Delete Selected
                </button>
            </div>

            {/* Scrollable Table Container */}
            <div className="flex-1 overflow-auto">
                <table className='w-full border-collapse min-w-[900px]'>
                    <thead className="sticky top-0 bg-gray-100 border-b border-gray-200 text-left z-10">
                        <tr>
                            <th className="p-3 text-sm font-semibold text-gray-700">
                                <input
                                    type="checkbox"
                                    onChange={toggleSelectAll}
                                    checked={selectedUsers.length === allUser.length && allUser.length > 0}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                />
                            </th>
                            <th className="p-3 text-sm font-semibold text-gray-700">#</th>
                            <th className="p-3 text-sm font-semibold text-gray-700">Name</th>
                            <th className="p-3 text-sm font-semibold text-gray-700">Email</th>
                            <th className="p-3 text-sm font-semibold text-gray-700">Role</th>
                            <th className="p-3 text-sm font-semibold text-gray-700">Created Date</th>
                            <th className="p-3 text-sm font-semibold text-gray-700 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="7" className="text-center py-5 text-gray-500 italic">Loading users...</td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan="7" className="text-center py-5 text-red-500">Error loading users.</td>
                            </tr>
                        ) : allUser.length > 0 ? (
                            allUser.map((el, index) => (
                                <tr key={el._id} className="hover:bg-gray-50 border-b">
                                    <td className="p-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(el._id)}
                                            onChange={() => toggleUserSelection(el._id)}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                        />
                                    </td>
                                    <td className="p-3 text-sm text-gray-500">{index + 1}</td>
                                    <td className="p-3 text-sm text-gray-700 capitalize">{el?.name}</td>
                                    <td className="p-3 text-sm text-gray-700">{el?.email}</td>
                                    <td className="p-3 text-sm text-gray-700">{el?.role}</td>
                                    <td className="p-3 text-sm text-gray-500">{moment(el?.createdAt).format('LL')}</td>
                                    <td className="p-3 text-center flex justify-center gap-2">
                                        <button
                                            className='inline-flex items-center px-3 py-1.5 border border-green-300 rounded-md shadow-sm text-xs font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                                            onClick={() => {
                                                setUpdateUserDetails(el);
                                                setOpenUpdateRole(true);
                                            }}
                                            aria-label="Edit User Role"
                                        >
                                            <MdModeEdit size={16} className="mr-1" /> Edit Role
                                        </button>
                                        <button
                                            className='inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md shadow-sm text-xs font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                                            onClick={() => deleteUsers([el._id], refetch, setSelectedUsers)}
                                            aria-label="Delete User"
                                        >
                                            <FaTrashAlt size={14} className="mr-1" /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-5 text-gray-500 italic">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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