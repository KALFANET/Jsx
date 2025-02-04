import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff,
  RefreshCw,
  Settings,
  AlertCircle,
  Check,
  X,
  Download,
  HardDrive,
  Activity,
  Info
} from 'lucide-react';

const NetworkManagerClient = () => {
  const [connectionStatus, setConnectionStatus] = useState('connected'); // 'connected', 'disconnected', 'updating', 'error'
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Check className="text-green-500" />;
      case 'disconnected':
        return <X className="text-red-500" />;
      case 'updating':
        return <Download className="text-blue-500" />;
      case 'error':
        return <AlertCircle className="text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-100">
      {/* Main Window */}
      {!isMinimized && (
        <div className="w-80 bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <h1 className="text-sm font-medium">Network Manager</h1>
            </div>
            <button 
              onClick={() => setIsMinimized(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Status Section */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className={`text-sm font-medium ${
                  connectionStatus === 'connected' ? 'text-green-600' :
                  connectionStatus === 'disconnected' ? 'text-red-600' :
                  connectionStatus === 'updating' ? 'text-blue-600' :
                  'text-yellow-600'
                }`}>
                  {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
                </span>
              </div>
              <button 
                className="p-1.5 hover:bg-gray-100 rounded-full"
                onClick={() => setConnectionStatus('connected')}
              >
                <RefreshCw className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            
            {/* Network Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Wifi className="h-4 w-4" />
                  <span>Network</span>
                </div>
                <span className="text-gray-900">WiFi (192.168.1.100)</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <HardDrive className="h-4 w-4" />
                  <span>Machine</span>
                </div>
                <span className="text-gray-900">DESKTOP-001</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Activity className="h-4 w-4" />
                  <span>Performance</span>
                </div>
                <span className="text-gray-900">Normal</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 space-y-2">
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
              <RefreshCw className="h-4 w-4" />
              Check Connection
            </button>
            
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
              <Download className="h-4 w-4" />
              Check for Updates
            </button>
            
            <button 
              onClick={() => setShowSettings(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>

          {/* Status Footer */}
          <div className="p-3 bg-gray-50 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Version 1.0.0</span>
              <div className="flex items-center gap-1">
                <Info className="h-3 w-3" />
                <span>Last Updated: 2 min ago</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Tray Icon (Minimized State) */}
      {isMinimized && (
        <div className="fixed bottom-4 right-4 flex flex-col items-end">
          <div className="mb-2 bg-white rounded-lg shadow-lg p-2 text-xs">
            Click to expand
          </div>
          <button 
            onClick={() => setIsMinimized(false)}
            className={`p-2 rounded-full shadow-lg ${
              connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'disconnected' ? 'bg-red-500' :
              connectionStatus === 'updating' ? 'bg-blue-500' :
              'bg-yellow-500'
            }`}
          >
            {getStatusIcon()}
          </button>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="w-96 bg-white rounded-lg shadow-xl">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-medium">Settings</h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Debug Mode</span>
                  <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-500" />
                </label>
              </div>
              
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Auto Start</span>
                  <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-500" checked />
                </label>
              </div>
              
              <div>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Show Notifications</span>
                  <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-500" checked />
                </label>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t flex justify-end">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkManagerClient;