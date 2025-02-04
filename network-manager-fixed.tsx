import React, { useState } from 'react';
import { 
  MonitorIcon,
  RefreshCwIcon,
  SearchIcon,
  FilterIcon,
  PowerIcon,
  SettingsIcon
} from 'lucide-react';

const NetworkManager = () => {
  const [selectedView, setSelectedView] = useState('list');
  
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
      lastSeen: '1 hour ago',
      location: 'Design Dept'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r">
        <div className="p-4">
          <h1 className="text-xl font-semibold">Network Manager</h1>
        </div>
        
        <nav className="mt-4">
          <button className="w-full p-4 flex items-center text-blue-600 bg-blue-50">
            <MonitorIcon className="h-5 w-5 mr-3" />
            Devices
          </button>
          <button className="w-full p-4 flex items-center text-gray-600 hover:bg-gray-50">
            <SettingsIcon className="h-5 w-5 mr-3" />
            Settings
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b p-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <SearchIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search devices..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-64"
                />
              </div>
              <button className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50">
                <FilterIcon className="h-4 w-4" />
                Filter
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              <RefreshCwIcon className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Devices Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map(device => (
              <div key={device.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{device.name}</h3>
                    <p className="text-sm text-gray-500">{device.os}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    device.status === 'online' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {device.status}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU Usage</span>
                      <span>{device.cpu}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${device.cpu}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>RAM Usage</span>
                      <span>{device.ram}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${device.ram}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <p>{device.ip}</p>
                      <p>Last seen: {device.lastSeen}</p>
                    </div>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                      <PowerIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkManager;