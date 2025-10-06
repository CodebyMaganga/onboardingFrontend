import { useFormStore } from "../store/context";

const Overview = () => {
  const { state } = useFormStore();

  // Safe access to notifications with fallback
  const notifications = state?.notifications || [];

 

  const getDate = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
  };

  return (
    <div className="space-y-8 mt-8 mx-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
            <p className="text-slate-600">Latest form submissions and system events</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {notifications.length > 0 ? (
                notifications.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'submission' ? 'bg-blue-500' : 'bg-green-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {activity.action === 'SUBMIT' ? 'New Submission' : 
                           activity.action === 'CREATE' ? 'Form Created' : 
                           activity.action === 'NOTIFY' ? 'Notification' : 
                           'System Event'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {activity.message} • {getDate(activity.created_at)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">{activity.time}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 text-sm">No recent activity</p>
                  <p className="text-slate-400 text-xs mt-1">Activity will appear here as forms are submitted</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Health Card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">System Health</h3>
            <p className="text-slate-600">Platform performance and status</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Form Processing</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Document Storage</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Notification System</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">API Response Time</span>
                <span className="text-sm font-medium text-slate-900">142ms avg</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Overview;