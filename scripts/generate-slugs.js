const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

(async () => {
  try {
    console.log('📝 Generando slugs para productos existentes...');
    
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true
      }
    });
    
    console.log(`📦 Procesando ${products.length} productos...`);
    
    let processed = 0;
    for (const product of products) {
      const baseSlug = generateSlug(product.name);
      let slug = baseSlug;
      let counter = 1;
      
      // Verificar si el slug ya existe
      while (true) {
        const existing = await prisma.product.findFirst({
          where: { slug: slug },
          select: { id: true }
        });
        
        if (!existing) break;
        
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      await prisma.product.update({
        where: { id: product.id },
        data: { slug: slug }
      });
      
      processed++;
      if (processed % 100 === 0) {
        console.log(`  ✅ Procesados ${processed} productos...`);
      }
    }
    
    console.log(`✅ Completado: ${processed} productos con slugs generados`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();