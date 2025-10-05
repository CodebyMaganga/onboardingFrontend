

import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Select from '@radix-ui/react-select';
import { 
  FiBell, 
  FiCheckCircle, 
  FiClock, 
  FiAlertTriangle, 
  FiUser, 
  FiFileText, 
  FiSettings, 
  FiSearch, 
  FiFilter, 
  FiMoreHorizontal 
} from 'react-icons/fi';
import { useFormStore } from "../store/context";

export default function NotificationDashBoard() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    weeklyDigest: true,
    instantAlerts: true
  });
  const { state } = useFormStore();

  // Mock notifications data
 const notifications = state?.notifications || [];

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || notification.action === filter;
    const matchesSearch = notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'submission':
        return <FiFileText className="h-5 w-5 text-blue-600" />;
      case 'review_required':
        return <FiAlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'approval':
        return <FiCheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <FiAlertTriangle className="h-5 w-5 text-red-600" />;
      case 'system':
        return <FiSettings className="h-5 w-5 text-slate-600" />;
      default:
        return <FiBell className="h-5 w-5 text-slate-600" />;
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-orange-100 text-orange-800 border-orange-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[priority]}`}>
        {priority}
      </span>
    );
  };

  const markAsRead = (notificationId) => {
    console.log('Marking notification as read:', notificationId);
  };

  const markAllAsRead = () => {
    console.log('Marking all notifications as read');
  };

  const deleteNotification = (notificationId) => {
    console.log('Deleting notification:', notificationId);
  };

  // Custom Select Component
  const CustomSelect = ({ value, onValueChange, items, placeholder }) => (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger className="flex items-center justify-between w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <Select.Value placeholder={placeholder} />
        <Select.Icon className="text-slate-400">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M4 6H11L7.5 10.5L4 6Z" fill="currentColor"/>
          </svg>
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="bg-white border border-slate-200 rounded-md shadow-lg z-50">
          <Select.Viewport className="p-1">
            {items.map((item) => (
              <Select.Item 
                key={item.value} 
                value={item.value}
                className="relative flex items-center px-3 py-2 text-sm rounded-md cursor-pointer select-none data-[highlighted]:bg-blue-500 data-[highlighted]:text-white data-[highlighted]:outline-none"
              >
                <Select.ItemText>{item.label}</Select.ItemText>
                <Select.ItemIndicator className="absolute left-1">
                  <FiCheckCircle className="w-4 h-4" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );

  // Switch Component
  const Switch = ({ checked, onCheckedChange }) => (
    <button
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked ? 'bg-blue-600' : 'bg-slate-200'
      }`}
      onClick={() => onCheckedChange(!checked)}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Notification Center</h3>
          <p className="text-slate-600">Monitor system alerts and form submissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
            {unreadCount} unread
          </span>
          <button 
            onClick={markAllAsRead}
            className="px-4 py-2 text-sm border border-slate-300 rounded-md bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Mark all as read
          </button>
        </div>
      </div>

      <Tabs.Root defaultValue="notifications" className="space-y-6">
        <Tabs.List className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
          <Tabs.Trigger 
            value="notifications"
            className="flex-1 px-3 py-2 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-600 transition-colors"
          >
            Notifications
          </Tabs.Trigger>
          <Tabs.Trigger 
            value="settings"
            className="flex-1 px-3 py-2 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-600 transition-colors"
          >
            Settings
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="notifications" className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search notifications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <CustomSelect
                  value={filter}
                  onValueChange={setFilter}
                  placeholder="Filter by type"
                  items={
                    [
                    { value: 'all', label: 'All' },
                    { value: 'CLIENTSUBMISSION', label: 'Client Submissions' },
                    { value: 'CREATE', label: 'Form Created' },
                    { value: 'NOTIFY', label: 'Notification' },
                    { value: 'SYSTEM', label: 'System' }
                    
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h4 className="text-lg font-semibold text-slate-900">Recent Notifications</h4>
              <p className="text-slate-600">{filteredNotifications.length} notifications found</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <FiBell className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>No notifications found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start space-x-4 p-4 rounded-lg border ${
                        notification.read ? 'bg-white' : 'bg-blue-50 border-blue-200'
                      } hover:shadow-sm transition-shadow`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className={`font-medium ${
                              notification.read ? 'text-slate-900' : 'text-slate-900 font-semibold'
                            }`}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-slate-600 mt-1">
                              {notification.message}
                            </p>
                          </div>
                          {/* <div className="flex items-center space-x-2">
                            {getPriorityBadge(notification.priority)}
                            <DropdownMenu.Root>
                              <DropdownMenu.Trigger asChild>
                                <button className="inline-flex items-center justify-center p-1 rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                  <FiMoreHorizontal className="h-4 w-4" />
                                </button>
                              </DropdownMenu.Trigger>
                              <DropdownMenu.Portal>
                                <DropdownMenu.Content 
                                  className="bg-white border border-slate-200 rounded-md shadow-lg p-1 min-w-[150px] z-50"
                                  sideOffset={5}
                                >
                                  {!notification.read && (
                                    <DropdownMenu.Item 
                                      className="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-slate-100 focus:outline-none focus:bg-slate-100"
                                      onClick={() => markAsRead(notification.id)}
                                    >
                                      Mark as read
                                    </DropdownMenu.Item>
                                  )}
                                  <DropdownMenu.Item 
                                    className="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-slate-100 focus:outline-none focus:bg-slate-100"
                                    onClick={() => deleteNotification(notification.id)}
                                  >
                                    Delete
                                  </DropdownMenu.Item>
                                </DropdownMenu.Content>
                              </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                          </div> */}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4 text-slate-500">
                            {notification.formName && (
                              <span>Form: {notification.formName}</span>
                            )}
                            {notification.clientName && (
                              <span>Client: {notification.clientName}</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 text-slate-500">
                            <FiClock className="h-3 w-3" />
                            <span>{notification.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Tabs.Content>

        <Tabs.Content value="settings" className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h4 className="text-lg font-semibold text-slate-900">Notification Preferences</h4>
              <p className="text-slate-600">Configure how and when you receive notifications</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-base font-medium text-slate-900">Email Notifications</label>
                    <p className="text-sm text-slate-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-base font-medium text-slate-900">SMS Notifications</label>
                    <p className="text-sm text-slate-500">Receive urgent notifications via SMS</p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-base font-medium text-slate-900">Push Notifications</label>
                    <p className="text-sm text-slate-500">Receive browser push notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-base font-medium text-slate-900">Weekly Digest</label>
                    <p className="text-sm text-slate-500">Receive weekly summary reports</p>
                  </div>
                  <Switch
                    checked={notificationSettings.weeklyDigest}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, weeklyDigest: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-base font-medium text-slate-900">Instant Alerts</label>
                    <p className="text-sm text-slate-500">Real-time notifications for urgent matters</p>
                  </div>
                  <Switch
                    checked={notificationSettings.instantAlerts}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, instantAlerts: checked }))
                    }
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <h5 className="font-medium text-slate-900 mb-4">Notification Triggers</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <FiCheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-slate-900">Form Submissions</p>
                        <p className="text-sm text-slate-500">When new forms are submitted</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <FiAlertTriangle className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-slate-900">Review Required</p>
                        <p className="text-sm text-slate-500">When manual review is needed</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <FiClock className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-slate-900">Abandoned Forms</p>
                        <p className="text-sm text-slate-500">When users abandon forms</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <FiSettings className="h-5 w-5 text-slate-600" />
                      <div>
                        <p className="font-medium text-slate-900">System Events</p>
                        <p className="text-sm text-slate-500">System maintenance and updates</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}