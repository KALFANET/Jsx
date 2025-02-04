import React, { useState } from 'react';
const validatedUser = validate.userData(userData);
await endpoints.createUser(validatedUser);
import { 
  UserPlus, 
  Shield, 
  Search,
  Edit,
  Trash2,
  User
} from 'lucide-react';

const UserManagement = () => {
  const [selectedRole, setSelectedRole] = useState('all');

  const users = [
    {
      id: 1,
      name: 'David Cohen',
      email: 'david@company.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2 hours ago'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      role: 'technician',
      status: 'active',
      lastLogin: '1 day ago'
    },
    {
      id: 3,
      name: 'Mike Smith',
      email: 'mike@company.com',
      role: 'viewer',
      status: 'inactive',
      lastLogin: '1 week ago'
    }
  ];

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'technician':
        return 'bg-green-100 text-green-800';
      case 'viewer':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">User Management</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            <UserPlus className="h-4 w-4" />
            Add New User
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Search and Filters */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="technician">Technicians</option>
            <option value="viewer">Viewers</option>
          </select>
        </div>

        {/* Role Summary */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {['admin', 'technician', 'viewer'].map(role => (
            <div key={role} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getRoleColor(role)}`}>
                    {role === 'admin' ? <Shield className="h-6 w-6" /> : <User className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="font-medium capitalize">{role}s</h3>
                    <p className="text-sm text-gray-500">
                      {role === 'admin' ? 'Full access' : role === 'technician' ? 'Control access' : 'View only'}
                    </p>
                  </div>
                </div>
                <span className="text-2xl font-semibold">
                  {users.filter(u => u.role === role).length}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{user.lastLogin}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;