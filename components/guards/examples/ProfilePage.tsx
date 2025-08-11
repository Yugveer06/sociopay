import { withPermissionGuard } from "@/components/guards/PermissionGuard";

/**
 * Profile management component
 * This component is automatically wrapped with permission guard using HOC
 */
function ProfileManagement() {
	return (
		<div className='p-8'>
			<h1 className='text-3xl font-bold mb-6'>Profile Management</h1>

			<div className='bg-white p-6 rounded-lg shadow'>
				<h2 className='text-xl font-semibold mb-4'>Edit Profile</h2>

				<form className='space-y-4'>
					<div>
						<label className='block text-sm font-medium text-gray-700'>
							Name
						</label>
						<input
							type='text'
							className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
							placeholder='Enter your name'
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700'>
							Email
						</label>
						<input
							type='email'
							className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
							placeholder='Enter your email'
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700'>
							Phone
						</label>
						<input
							type='tel'
							className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
							placeholder='Enter your phone number'
						/>
					</div>

					<div className='flex space-x-4'>
						<button
							type='submit'
							className='bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600'
						>
							Update Profile
						</button>

						<button
							type='button'
							className='bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600'
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

// Export the component wrapped with permission guard
// Only users with profile update permission can access this component
export default withPermissionGuard(ProfileManagement, {
	requiredPermission: {
		resource: "profile",
		action: "update",
	},
	redirectTo: "/dashboard",
});
