import { withPermissionGuard } from '@/components/guards/PermissionGuard'

/**
 * Profile management component
 * This component is automatically wrapped with permission guard using HOC
 */
function ProfileManagement() {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-3xl font-bold">Profile Management</h1>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">Edit Profile</h2>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter your phone number"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
            >
              Update Profile
            </button>

            <button
              type="button"
              className="rounded bg-gray-500 px-6 py-2 text-white hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Export the component wrapped with permission guard
// Only users with profile update permission can access this component
export default withPermissionGuard(ProfileManagement, {
  requiredPermission: {
    resource: 'profile',
    action: 'update',
  },
  redirectTo: '/dashboard',
})
