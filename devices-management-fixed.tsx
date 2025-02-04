import React, { useState } from 'react';
import { endpoints } from './services/api';
import { validate } from './services/validation';
import useSystemStore from './store';
import { 
  Search, Filter, List, Grid3X3, 
  Power, Monitor, HardDrive, Terminal,
  MoreVertical, RefreshCw, Download
} from 'lucide-react';

const DevicesManagement = () => {
  const [viewMode, setViewMode] = useState('table');
  const [selectedDevice, setSelectedDevice] = useState(null);
  
  // Mock devices data
  const devices = [
    {
      id: 1,
      name: 'PC-001',
      ip: '192.168.1.101',
      os: 'Windows 11 Pro',
      status: 'online',
      cpu: 45,
      ram: 60,
      disk: 75,
      network: 30,
      lastSeen: '2 minutes ago',
      location: 'Main Office'
    },
    {
      id: 2,
      name: 'MAC-002',
      ip: '192.168.1.102',
      os: 'macOS Sonoma',
      status: 'offline',
      cpu: 0,
      ram: 0,
      disk: 82,
      network: 0,
      lastSeen: '1 hour ago',
      location: 'Design Dept'
    },
    {
      id: 3,
      name: 'PC-003',
      ip: '192.168.1.103',
      os: 'Windows 10 Pro',
      status: 'heavy-load',
      cpu: 90,
      ram: 85,
      disk: 95,
      network: 70,
      lastSeen: 'Just now',
      location: 'Development'
    }
  ];

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      case 'heavy-load':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Devices Management</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2 rounded ${
                viewMode === 'table' ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded ${
                viewMode === 'cards' ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search devices..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Table View */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Seen
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {devices.map(device => (
                <tr key={device.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Monitor className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">{device.name}</div>
                        <div className="text-sm text-gray-500">{device.os}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(device.status)}`}>
                      {device.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{device.ip}</td>
                  <td className="px-6 py-4 text-gray-500">{device.location}</td>
                  <td className="px-6 py-4 text-gray-500">{device.lastSeen}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => setSelectedDevice(device)}
                        className="p-2 text-blue-600 hover:text-blue-700 rounded-full hover:bg-blue-50"
                      >
                        <Monitor className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-gray-700 rounded-full hover:bg-gray-50">
                        <Power className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-gray-700 rounded-full hover:bg-gray-50">
                        <Terminal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map(device => (
            <div key={device.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Monitor className="h-6 w-6 text-gray-400 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">{device.name}</h3>
                    <p className="text-sm text-gray-500">{device.os}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(device.status)}`}>
                  {device.status}
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">CPU Usage</span>
                    <span>{device.cpu}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${device.cpu}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Memory</span>
                    <span>{device.ram}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${device.ram}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Disk</span>
                    <span>{device.disk}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${device.disk}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between">
                <div className="text-sm text-gray-500">
                  <p>IP: {device.ip}</p>
                  <p>Last seen: {device.lastSeen}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-blue-600 hover:text-blue-700 rounded-full hover:bg-blue-50">
                    <Monitor className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-700 rounded-full hover:bg-gray-50">
                    <Power className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-700 rounded-full hover:bg-gray-50">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DevicesManagement;