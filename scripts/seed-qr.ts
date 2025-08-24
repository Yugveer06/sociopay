import { db } from '@/db/drizzle'
import { qrCodes } from '@/db/schema'

/**
 * Seed script to create the initial QR code
 * Run this after database migration to set up the payment QR code
 */
async function seedQrCode() {
  try {
    console.log('🌱 Seeding QR code data...')

    // Check if QR code already exists
    const existingQrCodes = await db.select().from(qrCodes).limit(1)

    if (existingQrCodes.length > 0) {
      console.log('✅ QR code already exists, skipping seed')
      return
    }

    // Create the default QR code with the provided UPI ID
    await db.insert(qrCodes).values({
      upiId: 'sukoo98259@barodampay',
      merchantName: 'Sukun 3 Co. Op. Hsg. Soc. Ltd.',
      isActive: true,
    })

    console.log('✅ QR code seeded successfully!')
    console.log('📱 UPI ID: sukoo98259@barodampay')
    console.log('🏢 Merchant: Sukun 3 Co. Op. Hsg. Soc. Ltd.')
  } catch (error) {
    console.error('❌ Error seeding QR code:', error)
    process.exit(1)
  }
}

// Run the seed function
seedQrCode()
  .then(() => {
    console.log('🎉 Seed completed!')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Seed failed:', error)
    process.exit(1)
  })
