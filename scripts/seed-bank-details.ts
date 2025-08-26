import { db } from '@/db/drizzle'
import { bankDetails } from '@/db/schema'

/**
 * Seed script for bank details
 * Adding some traditional banking vibes! 🏦✨
 */
async function seedBankDetails() {
  try {
    console.log('🏦 Seeding bank details...')

    // Check if bank details already exist
    const existingBankDetails = await db.select().from(bankDetails).limit(1)

    if (existingBankDetails.length > 0) {
      console.log('📋 Bank details already exist, skipping seed')
      return
    }

    // Insert default bank details
    const result = await db
      .insert(bankDetails)
      .values({
        bankName: 'BANK OF BARODA',
        branchName: 'JUHAPURA',
        accountHolderName: 'sukun-3 co.op.hou.soc.ltd.',
        accountNumber: '39560100022854',
        ifscCode: 'BARB0JUHAPU',
        additionalInfo: '(FIFTH CHARACTER IS ZERO)',
        isActive: true,
      })
      .returning()

    console.log('✅ Bank details seeded successfully:', result[0])
  } catch (error) {
    console.error('❌ Error seeding bank details:', error)
    process.exit(1)
  }
}

// Run the seed if this file is executed directly
if (require.main === module) {
  seedBankDetails()
    .then(() => {
      console.log('🎉 Bank details seed completed!')
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 Seed failed:', error)
      process.exit(1)
    })
}

export { seedBankDetails }
