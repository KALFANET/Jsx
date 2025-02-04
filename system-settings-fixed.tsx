import React, { useState } from 'react';
import { 
  Settings,
  Network,
  Lock,
  Bell,
  Save,
  RefreshCw
} from 'lucide-react';

const SystemSettings = () => {
  const [activeSection, setActiveSection] = useState('general');
  
  const settings = {
    general: {
      language: 'en',
      theme: 'light',
      autoUpdate: true,
      retention: 30
    },
    network: {
      scanInterval: 5,
      timeout: 30,
      port: 8080,
      useSSL: true
    },
    security: {
      twoFactor: true,
      sessionTimeout: 60,
      passwordExpiry: 90,
      minPasswordLength: 12
    }
  };

  const MenuItem = ({ icon: Icon, title, section }) => (
    <button
      onClick={() => setActiveSection(section)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
        activeSection === section 
          ? 'bg-blue-50 text-blue-600' 
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{title}</span>
    </button>
  );

  return (
    <div className="h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">System Settings</h1>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <RefreshCw className="h-4 w-4" />
              Reset
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r p-4 space-y-2">
          <MenuItem icon={Settings} title="General" section="general" />
          <MenuItem icon={Network} title="Network" section="network" />
          <MenuItem icon={Lock} title="Security" section="security" />
          <MenuItem icon={Bell} title="Notifications" section="notifications" />
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {activeSection === 'general' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-medium mb-6">General Settings</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select className="w-full px-3 py-2 border rounded-lg bg-white">
                        <option value="en">English</option>
                        <option value="he">Hebrew</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme
                      </label>
                      <select className="w-full px-3 py-2 border rounded-lg bg-white">
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Retention Period (days)
                    </label>
                    <input 
                      type="number"
                      defaultValue={settings.general.retention}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        defaultChecked={settings.general.autoUpdate}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Enable automatic updates</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'network' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-medium mb-6">Network Settings</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Scan Interval (minutes)
                      </label>
                      <input 
                        type="number"
                        defaultValue={settings.network.scanInterval}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Connection Timeout (seconds)
                      </label>
                      <input 
                        type="number"
                        defaultValue={settings.network.timeout}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Port Number
                    </label>
                    <input 
                      type="number"
                      defaultValue={settings.network.port}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        defaultChecked={settings.network.useSSL}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Enable SSL/TLS encryption</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-medium mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input 
                        type="number"
                        defaultValue={settings.security.sessionTimeout}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password Expiry (days)
                      </label>
                      <input 
                        type="number"
                        defaultValue={settings.security.passwordExpiry}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Password Length
                    </label>
                    <input 
                      type="number"
                      defaultValue={settings.security.minPasswordLength}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        defaultChecked={settings.security.twoFactor}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Enable Two-Factor Authentication (2FA)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-medium mb-6">Notification Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm text-gray-700">Email notifications</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm text-gray-700">Desktop notifications</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm text-gray-700">Alert on system events</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;