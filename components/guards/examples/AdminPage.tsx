import { PermissionGuard } from "@/components/guards/PermissionGuard";

/**
 * Example admin page that requires admin role to access
 */
export default function AdminPage() {
	return (
		<PermissionGuard requiredRole='admin' redirectTo='/login'>
			<div className='p-8'>
				<h1 className='text-3xl font-bold mb-6'>Admin Dashboard</h1>

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					<div className='bg-white p-6 rounded-lg shadow'>
						<h2 className='text-xl font-semibold mb-4'>
							User Management
						</h2>
						<p className='text-gray-600 mb-4'>
							Manage user accounts and permissions
						</p>
						<button className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'>
							Manage Users
						</button>
					</div>

					<div className='bg-white p-6 rounded-lg shadow'>
						<h2 className='text-xl font-semibold mb-4'>
							Payment Reports
						</h2>
						<p className='text-gray-600 mb-4'>
							View and export payment reports
						</p>
						<button className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600'>
							View Reports
						</button>
					</div>

					<div className='bg-white p-6 rounded-lg shadow'>
						<h2 className='text-xl font-semibold mb-4'>
							System Settings
						</h2>
						<p className='text-gray-600 mb-4'>
							Configure system preferences
						</p>
						<button className='bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600'>
							Settings
						</button>
					</div>
				</div>
			</div>
		</PermissionGuard>
	);
}
