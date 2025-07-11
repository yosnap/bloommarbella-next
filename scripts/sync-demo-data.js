const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mock data for demo
const mockProducts = [
  {
    nieuwkoopId: 'demo_001',
    sku: 'PLT-FICUS-001',
    name: 'Ficus Benjamina Premium',
    description: 'Hermoso ficus benjamina ideal para interiores. Planta resistente y fácil de cuidar.',
    category: 'Plantas',
    subcategory: 'Interior',
    basePrice: 45.00,
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1591958063670-a17859c19f3c?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&auto=format&fit=crop&q=80'
    ],
    specifications: {
      light: 'Luz indirecta',
      water: 'Moderado',
      humidity: 'Media-Alta',
      temperature: '18-24°C'
    },
    active: true
  },
  {
    nieuwkoopId: 'demo_002',
    sku: 'POT-CER-002',
    name: 'Maceta Cerámica Mediterránea',
    description: 'Elegante maceta de cerámica con diseño mediterráneo. Perfecta para plantas de interior y exterior.',
    category: 'Macetas',
    subcategory: 'Cerámica',
    basePrice: 32.50,
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586953811686-0c2f4b7f4bc1?w=400&auto=format&fit=crop&q=80'
    ],
    specifications: {
      material: 'Cerámica esmaltada',
      drainage: 'Con agujero de drenaje',
      frost_resistant: 'Sí'
    },
    active: true
  },
  {
    nieuwkoopId: 'demo_003',
    sku: 'PLT-SUCC-003',
    name: 'Colección Suculentas Mix',
    description: 'Set de 6 suculentas variadas perfectas para principiantes. Incluye macetas individuales.',
    category: 'Plantas',
    subcategory: 'Suculentas',
    basePrice: 28.90,
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1416024576156-4bf68ea06caa?w=400&auto=format&fit=crop&q=80'
    ],
    specifications: {
      light: 'Luz directa',
      water: 'Poco frecuente',
      humidity: 'Baja',
      temperature: '15-30°C'
    },
    active: true
  },
  {
    nieuwkoopId: 'demo_004',
    sku: 'GDN-TOOL-004',
    name: 'Kit Herramientas Jardinería Premium',
    description: 'Set completo de herramientas profesionales para jardinería. Incluye pala, rastrillo, tijeras y más.',
    category: 'Jardín',
    subcategory: 'Herramientas',
    basePrice: 89.99,
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&auto=format&fit=crop&q=80'
    ],
    specifications: {
      material: 'Acero inoxidable',
      handle: 'Mango ergonómico',
      warranty: '2 años'
    },
    active: true
  },
  {
    nieuwkoopId: 'demo_005',
    sku: 'PLT-ORCH-005',
    name: 'Orquídea Phalaenopsis Blanca',
    description: 'Elegante orquídea blanca de la variedad Phalaenopsis. Floración prolongada y cuidado moderado.',
    category: 'Plantas',
    subcategory: 'Florales',
    basePrice: 65.00,
    stock: 8,
    images: [
      'https://images.unsplash.com/photo-1583515557027-28535ec5d9b5?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=400&auto=format&fit=crop&q=80'
    ],
    specifications: {
      light: 'Luz indirecta brillante',
      water: 'Semanal por inmersión',
      humidity: 'Alta (60-80%)',
      temperature: '20-25°C'
    },
    active: true
  },
  {
    nieuwkoopId: 'demo_006',
    sku: 'POT-FIB-006',
    name: 'Maceta Fibra Natural Grande',
    description: 'Maceta ecológica de fibra natural. Ligera, resistente y perfecta para plantas grandes.',
    category: 'Macetas',
    subcategory: 'Fibra',
    basePrice: 48.75,
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&auto=format&fit=crop&q=80'
    ],
    specifications: {
      material: 'Fibra natural reciclada',
      drainage: 'Excelente drenaje',
      uv_resistant: 'Sí'
    },
    active: true
  }
];

async function syncDemoData() {
  try {
    console.log('🌱 Iniciando sincronización de datos demo...');
    
    let created = 0;
    let updated = 0;
    
    for (const productData of mockProducts) {
      try {
        const existingProduct = await prisma.product.findUnique({
          where: { nieuwkoopId: productData.nieuwkoopId }
        });

        if (existingProduct) {
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: {
              ...productData,
              updatedAt: new Date()
            }
          });
          updated++;
          console.log(`   🔄 Actualizado: ${productData.name}`);
        } else {
          await prisma.product.create({
            data: {
              ...productData,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          created++;
          console.log(`   ✅ Creado: ${productData.name}`);
        }
      } catch (error) {
        console.error(`   ❌ Error con ${productData.name}:`, error.message);
      }
    }

    console.log('\n📊 Resultado de la sincronización:');
    console.log(`   ✅ Productos creados: ${created}`);
    console.log(`   🔄 Productos actualizados: ${updated}`);
    console.log(`   📈 Total procesados: ${mockProducts.length}`);

    // Show some stats
    const totalProducts = await prisma.product.count();
    const activeProducts = await prisma.product.count({ where: { active: true } });
    const categories = await prisma.product.groupBy({
      by: ['category'],
      _count: { _all: true }
    });

    console.log('\n📈 Estadísticas de la base de datos:');
    console.log(`   📦 Total productos: ${totalProducts}`);
    console.log(`   ✅ Productos activos: ${activeProducts}`);
    console.log('   📂 Por categorías:');
    categories.forEach(cat => {
      console.log(`      - ${cat.category}: ${cat._count._all} productos`);
    });

    // Update sync metadata
    await prisma.configuration.upsert({
      where: { key: 'nieuwkoop_last_sync' },
      update: {
        value: {
          timestamp: new Date().toISOString(),
          result: { created, updated, totalProcessed: mockProducts.length, success: true, errors: [] },
        },
        updatedAt: new Date()
      },
      create: {
        key: 'nieuwkoop_last_sync',
        value: {
          timestamp: new Date().toISOString(),
          result: { created, updated, totalProcessed: mockProducts.length, success: true, errors: [] },
        },
        description: 'Last Nieuwkoop product sync result'
      }
    });

    console.log('\n✅ Sincronización completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync
syncDemoData()
  .then(() => {
    console.log('🎉 Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });