import React, { useState } from 'react';
const validatedSoftware = validate.software(softwareData);
await endpoints.installSoftware(deviceId, validatedSoftware);
import { 
  PackageIcon,
  DownloadIcon,
  TrashIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon
} from 'lucide-react';

const SoftwareManagement = () => {
  const [activeTab, setActiveTab] = useState('installed');
  
  const software = [
    {
      id: 1,
      name: 'Chrome Browser',
      version: '120.0.6099.129',
      platform: 'Windows',
      status: 'installed',
      lastUpdate: '2 days ago',
      size: '285 MB'
    },
    {
      id: 2,
      name: 'Visual Studio Code',
      version: '1.85.1',
      platform: 'Mac',
      status: 'update-available',
      lastUpdate: '1 week ago',
      size: '380 MB'
    },
    {
      id: 3,
      name: 'Node.js',
      version: '20.10.0',
      platform: 'Windows',
      status: 'installing',
      lastUpdate: 'Just now',
      size: '32 MB'
    }
  ];

  return (
    <div className="h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Software Management</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            <PlusIcon className="h-4 w-4" />
            Install New Software
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Search and Filter */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <SearchIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search software..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <select className="px-4 py-2 border rounded-lg bg-white">
            <option value="all">All Platforms</option>
            <option value="windows">Windows</option>
            <option value="mac">Mac</option>
          </select>
        </div>

        {/* Software List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Software
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Version
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Platform
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Last Update
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {software.map(app => (
                <tr key={app.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <PackageIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">{app.name}</div>
                        <div className="text-sm text-gray-500">{app.size}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {app.version}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      app.platform === 'Windows' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {app.platform}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      app.status === 'installed'
                        ? 'bg-green-100 text-green-800'
                        : app.status === 'update-available'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {app.lastUpdate}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center space-x-2">
                      {app.status === 'update-available' && (
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <RefreshCwIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <TrashIcon className="h-4 w-4" />
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

export default SoftwareManagement;