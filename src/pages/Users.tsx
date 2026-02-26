import React, { useState } from 'react';
import { User, Mail, Shield, Trash2, Edit } from 'lucide-react';

const MOCK_USERS = [
  { id: 1, name: 'John Doe', email: 'john@autoparts.com', role: 'Admin', department: 'Management', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@autoparts.com', role: 'Manager', department: 'Production', status: 'Active' },
  { id: 3, name: 'Mike Johnson', email: 'mike@autoparts.com', role: 'Worker', department: 'Assembly', status: 'Inactive' },
  { id: 4, name: 'Sarah Wilson', email: 'sarah@autoparts.com', role: 'Inspector', department: 'Quality', status: 'Active' },
];

export default function UsersPage() {
  const [users, setUsers] = useState(MOCK_USERS);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
          <User size={20} />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium">Department</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail size={12} /> {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1 text-gray-700">
                    <Shield size={14} className="text-blue-500" />
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{user.department}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="text-gray-400 hover:text-blue-600 transition-colors">
                    <Edit size={18} />
                  </button>
                  <button className="text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
