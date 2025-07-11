const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Ejecutando sincronización directa...');
    
    // Simular obtención de productos reales
    const username = process.env.NIEUWKOOP_API_USER;
    const password = process.env.NIEUWKOOP_API_PASSWORD;
    
    if (!username || !password) {
      console.error('❌ Credenciales de Nieuwkoop no configuradas');
      return;
    }
    
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');
    const response = await fetch('https://customerapi.nieuwkoop-europe.com/items?sysmodified=2020-01-01&limit=10', {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`❌ Error API: ${response.status} ${response.statusText}`);
      return;
    }
    
    const products = await response.json();
    console.log(`📦 Obtenidos ${products.length} productos de Nieuwkoop`);
    
    let processed = 0;
    for (const product of products) {
      try {
        // Procesar datos del producto con traducción básica
        const category = product.MainGroupDescription_EN || product.MainGroupDescription_NL || 'Sin categoría';
        const subcategory = product.ProductGroupDescription_EN || product.ProductGroupDescription_NL || 'Sin subcategoría';
        
        const specifications = {
          material: product.MaterialGroupDescription_EN || product.MaterialGroupDescription_NL,
          variety: product.ItemVariety_EN || product.ItemVariety_NL,
          dimensions: {
            height: product.Height,
            width: product.Width,
            depth: product.Depth,
            diameter: product.Diameter
          },
          weight: product.Weight,
          deliveryTime: product.DeliveryTimeInDays,
          countryOfOrigin: product.CountryOfOrigin,
          tags: product.Tags || []
        };
        
        const images = product.ItemPictureName 
          ? [`https://customerapi.nieuwkoop-europe.com/images/${product.ItemPictureName}`]
          : [];
        
        // Crear producto en base de datos
        await prisma.product.create({
          data: {
            nieuwkoopId: product.Itemcode,
            sku: product.Itemcode,
            name: product.Description,
            description: product.ItemDescription_EN || product.ItemDescription_NL,
            category,
            subcategory,
            basePrice: product.Salesprice || 0,
            stock: 0,
            images,
            specifications,
            active: product.ShowOnWebsite && product.ItemStatus === 'A'
          }
        });
        
        processed++;
        console.log(`✅ Procesado: ${product.Itemcode} - ${product.Description}`);
        
      } catch (error) {
        console.error(`❌ Error procesando ${product.Itemcode}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Sincronización completa: ${processed} productos procesados`);
    
  } catch (error) {
    console.error('❌ Error en sincronización:', error);
  } finally {
    await prisma.$disconnect();
  }
})();