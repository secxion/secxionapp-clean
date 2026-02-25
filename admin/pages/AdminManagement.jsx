import React, { useState, useEffect } from 'react';
import { 
  FaUserShield, 
  FaPlus, 
  FaTrash, 
  FaToggleOn, 
  FaToggleOff,
  FaSync,
  FaSearch,
  FaTimes,
  FaUserPlus,
  FaBuilding
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import SummaryApi, { authFetch } from '../common/index.js';

const AdminManagement = () => {
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [byDepartment, setByDepartment] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  
  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    email: '',
    department: '',
    note: '',
  });
  const [adding, setAdding] = useState(false);
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await authFetch(SummaryApi.authorizedAdminsList.url);
      const data = await res.json();
      
      if (data.success) {
        setAdmins(data.data.list);
        setDepartments(data.data.departments);
        setByDepartment(data.data.byDepartment);
      } else {
        toast.error(data.message || 'Failed to fetch admins');
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    
    if (!addForm.email || !addForm.department) {
      toast.error('Please enter email and select department');
      return;
    }
    
    setAdding(true);
    try {
      const res = await authFetch(SummaryApi.authorizeNewAdmin.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message);
        setAddForm({ email: '', department: '', note: '' });
        setShowAddForm(false);
        fetchAdmins();
      } else {
        toast.error(data.message || 'Failed to authorize admin');
      }
    } catch (error) {
      console.error('Error adding admin:', error);
      toast.error('Failed to authorize admin');
    } finally {
      setAdding(false);
    }
  };

  const handleRevoke = async (admin) => {
    if (!confirm(`Revoke ${admin.email} from ${admin.department}?`)) {
      return;
    }
    
    try {
      const res = await authFetch(SummaryApi.revokeAdminAuth.url(admin._id), {
        method: 'DELETE',
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchAdmins();
      } else {
        toast.error(data.message || 'Failed to revoke');
      }
    } catch (error) {
      console.error('Error revoking:', error);
      toast.error('Failed to revoke authorization');
    }
  };

  const handleToggle = async (admin) => {
    try {
      const res = await authFetch(SummaryApi.toggleAdminAuth.url(admin._id), {
        method: 'PUT',
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchAdmins();
      } else {
        toast.error(data.message || 'Failed to toggle');
      }
    } catch (error) {
      console.error('Error toggling:', error);
      toast.error('Failed to toggle status');
    }
  };

  const handleMigrate = async () => {
    if (!confirm('Migrate all hardcoded admins to database? This will add any missing admins from the config file.')) {
      return;
    }
    
    setMigrating(true);
    try {
      const res = await authFetch(SummaryApi.migrateAdmins.url, {
        method: 'POST',
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchAdmins();
      } else {
        toast.error(data.message || 'Failed to migrate');
      }
    } catch (error) {
      console.error('Error migrating:', error);
      toast.error('Failed to migrate admins');
    } finally {
      setMigrating(false);
    }
  };

  // Filter admins
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch = admin.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDept === 'all' || admin.department === filterDept;
    return matchesSearch && matchesDept;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/10 rounded-xl">
            <FaUserShield className="text-purple-500 text-xl" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white">Admin Management</h1>
            <p className="text-slate-400 text-xs sm:text-sm">Authorize and manage admin access</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="px-3 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 flex items-center gap-2 disabled:opacity-50"
          >
            <FaSync className={migrating ? 'animate-spin' : ''} />
            Migrate
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-yellow-500 text-slate-900 rounded-lg text-sm font-semibold hover:bg-yellow-400 flex items-center gap-2"
          >
            <FaUserPlus />
            Add Admin
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Total Admins</p>
          <p className="text-2xl font-bold text-white">{admins.length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Active</p>
          <p className="text-2xl font-bold text-green-400">{admins.filter(a => a.isActive).length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Inactive</p>
          <p className="text-2xl font-bold text-red-400">{admins.filter(a => !a.isActive).length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Departments</p>
          <p className="text-2xl font-bold text-purple-400">{Object.keys(byDepartment).length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500/50"
          />
        </div>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500/50"
        >
          <option value="all">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </select>
      </div>

      {/* Admins Table */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Email</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Department</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Added</th>
                <th className="p-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-500 border-t-transparent"></div>
                      <span className="text-slate-400">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    {admins.length === 0 ? (
                      <div>
                        <p>No authorized admins in database.</p>
                        <button
                          onClick={handleMigrate}
                          className="mt-2 text-yellow-500 hover:underline"
                        >
                          Click to migrate from config file
                        </button>
                      </div>
                    ) : (
                      'No admins match your filters.'
                    )}
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr key={admin._id} className="border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <p className="text-white font-medium">{admin.email}</p>
                      {admin.note && (
                        <p className="text-slate-400 text-xs mt-1">{admin.note}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        admin.department === 'SUPER'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-slate-700 text-slate-300'
                      }`}>
                        {departments.find(d => d.id === admin.department)?.name || admin.department}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        admin.isActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                      {formatDate(admin.createdAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggle(admin)}
                          className={`p-2 rounded-lg transition-colors ${
                            admin.isActive
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                          }`}
                          title={admin.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {admin.isActive ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                        <button
                          onClick={() => handleRevoke(admin)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          title="Revoke Access"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FaUserPlus className="text-yellow-500" />
                Authorize New Admin
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Email Address</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-yellow-500/50"
                  placeholder="admin@example.com"
                  required
                />
                <p className="text-slate-500 text-xs mt-1">User must be registered first</p>
              </div>
              
              <div>
                <label className="block text-slate-400 text-sm mb-2">Department</label>
                <select
                  value={addForm.department}
                  onChange={(e) => setAddForm(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-yellow-500/50"
                  required
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} - {dept.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-slate-400 text-sm mb-2">Note (optional)</label>
                <input
                  type="text"
                  value={addForm.note}
                  onChange={(e) => setAddForm(prev => ({ ...prev, note: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-yellow-500/50"
                  placeholder="e.g., Hired Jan 2026"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 px-4 py-3 bg-yellow-500 text-slate-900 rounded-lg font-semibold hover:bg-yellow-400 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {adding ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-900 border-t-transparent"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Authorize
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
