import {
	PermissionGuard,
	usePermissions,
} from "@/components/guards/PermissionGuard";

/**
 * Example payment page with granular permission checks
 */
export default function PaymentPage() {
	const { hasPermission } = usePermissions();

	return (
		<div className='p-8'>
			<h1 className='text-3xl font-bold mb-6'>Payment Management</h1>

			{/* Anyone authenticated can view this section */}
			<div className='bg-white p-6 rounded-lg shadow mb-6'>
				<h2 className='text-xl font-semibold mb-4'>Payment History</h2>
				<p className='text-gray-600'>View your payment history</p>
			</div>

			{/* Only users with payment creation permission can see this */}
			<PermissionGuard
				requiredPermission={{
					resource: "payment",
					action: "create",
				}}
				fallback={
					<div className='bg-gray-100 p-6 rounded-lg text-center'>
						<p className='text-gray-600'>
							You don't have permission to create payments
						</p>
					</div>
				}
			>
				<div className='bg-white p-6 rounded-lg shadow mb-6'>
					<h2 className='text-xl font-semibold mb-4'>
						Create New Payment
					</h2>
					<form className='space-y-4'>
						<div>
							<label className='block text-sm font-medium text-gray-700'>
								Amount
							</label>
							<input
								type='number'
								className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
								placeholder='Enter amount'
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-700'>
								Recipient
							</label>
							<input
								type='text'
								className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
								placeholder='Enter recipient'
							/>
						</div>
						<button
							type='submit'
							className='bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600'
						>
							Create Payment
						</button>
					</form>
				</div>
			</PermissionGuard>

			{/* Conditional rendering based on permissions */}
			<div className='flex space-x-4'>
				{hasPermission("payment", "view") && (
					<button className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600'>
						View Payments
					</button>
				)}

				{hasPermission("payment", "refund") && (
					<button className='bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600'>
						Process Refund
					</button>
				)}

				{hasPermission("payment", "cancel") && (
					<button className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'>
						Cancel Payment
					</button>
				)}
			</div>
		</div>
	);
}
