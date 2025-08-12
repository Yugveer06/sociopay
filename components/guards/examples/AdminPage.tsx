import { PermissionGuard } from '@/components/guards/PermissionGuard'

/**
 * Example admin page that requires admin role to access
 */
export default function AdminPage() {
  return (
    <PermissionGuard requiredRole="admin" redirectTo="/login">
      <div className="p-8">
        <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">User Management</h2>
            <p className="mb-4 text-gray-600">
              Manage user accounts and permissions
            </p>
            <button className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
              Manage Users
            </button>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">Payment Reports</h2>
            <p className="mb-4 text-gray-600">
              View and export payment reports
            </p>
            <button className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">
              View Reports
            </button>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">System Settings</h2>
            <p className="mb-4 text-gray-600">Configure system preferences</p>
            <button className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600">
              Settings
            </button>
          </div>
        </div>
      </div>
    </PermissionGuard>
  )
}
