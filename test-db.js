const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testDatabase() {
  try {
    // Get distinct categories
    const categories = await prisma.product.findMany({
      select: {
        category: true,
        subcategory: true
      },
      distinct: ['category'],
      take: 20
    })
    
    console.log('Sample categories from database:')
    console.log(JSON.stringify(categories, null, 2))
    
    // Check if there are any translations
    const translationCount = await prisma.translation.count()
    console.log('\nTotal translations in database:', translationCount)
    
    if (translationCount > 0) {
      const sampleTranslations = await prisma.translation.findMany({
        take: 10
      })
      console.log('\nSample translations:')
      console.log(JSON.stringify(sampleTranslations, null, 2))
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()