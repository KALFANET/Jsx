import React, { useState } from 'react';
import { Shield, Power, RefreshCw, Activity, Lock } from 'lucide-react';

const AgentInterface = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isSecure, setIsSecure] = useState(true);
  const [showLogs, setShowLogs] = useState(false);
  
  // Mock system stats
  const stats = {
    cpuUsage: 45,
    memoryUsage: 60,
    networkSpeed: '5.2 MB/s',
    lastUpdate: new Date().toLocaleTimeString()
  };

  return (
    <div className="w-96 bg-white shadow-lg rounded-lg">
      {/* Header */}
      <div className="p-4 bg-gray-50 border-b rounded-t-lg flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          <span className="font-medium">Network Agent</span>
        </div>
        <div className="flex gap-2">
          {isSecure && <Lock className="h-4 w-4 text-green-500" />}
          <span className={`px-2 py-0.5 rounded-full text-sm ${
            isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b">
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-1 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">
            <RefreshCw className="h-4 w-4" />
            Sync
          </button>
          <button className="flex-1 flex items-center justify-center gap-1 bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600">
            <Power className="h-4 w-4" />
            Restart
          </button>
        </div>
      </div>

      {/* System Stats */}
      <div className="p-4 border-b">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">CPU Usage</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${stats.cpuUsage}%` }}
                ></div>
              </div>
              <span className="text-sm">{stats.cpuUsage}%</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Memory</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${stats.memoryUsage}%` }}
                ></div>
              </div>
              <span className="text-sm">{stats.memoryUsage}%</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Network</span>
            <span className="text-sm">{stats.networkSpeed}</span>
          </div>
        </div>
      </div>

      {/* Logs Section */}
      <div className="p-4">
        <button 
          onClick={() => setShowLogs(!showLogs)}
          className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <Activity className="h-4 w-4" />
          {showLogs ? 'Hide' : 'Show'} Logs
        </button>
        
        {showLogs && (
          <div className="mt-2 bg-gray-50 rounded p-2 text-sm font-mono h-32 overflow-y-auto">
            <div className="text-gray-600">
              [${stats.lastUpdate}] System connected successfully
            </div>
            <div className="text-gray-600">
              [${stats.lastUpdate}] Security protocols active
            </div>
            <div className="text-gray-600">
              [${stats.lastUpdate}] Monitoring services running
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentInterface;