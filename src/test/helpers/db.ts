import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configuración para tests
export const createTestPrismaClient = () => {
  const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: ['query', 'error', 'warn'],
    datasources: {
      db: {
        url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
      }
    }
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
  }

  return prisma
}

export const cleanupTestDatabase = async (prisma: PrismaClient) => {
  // Clean up test data - using generic table cleanup
  try {
    // Comment out specific models until schema is defined
    // await prisma.indicatorValue.deleteMany()
    // await prisma.indicator.deleteMany()
    // await prisma.project.deleteMany()
    // await prisma.user.deleteMany()
    
    await prisma.$disconnect()
  } catch (error) {
    console.warn('Database cleanup failed:', error);
    await prisma.$disconnect()
  }
}

export const seedTestData = async (prisma: PrismaClient) => {
  try {
    // Comment out test data creation until schema is defined
    /*
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        id: 'test-user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'FUNDACION',
      },
    })

    // Create test project
    const testProject = await prisma.project.create({
      data: {
        id: 'test-project-1',
        name: 'Test Project',
        description: 'Test project for testing',
        userId: testUser.id,
      },
    })
    */
    
    return null;
  } catch (error) {
    console.warn('Test data seeding failed:', error);
    return null;
  }
}