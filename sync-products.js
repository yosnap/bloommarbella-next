const { execSync } = require('child_process');

async function syncProducts() {
  try {
    console.log('🔄 Iniciando sincronización de productos...');
    
    // Ejecutar la sincronización usando npx
    const result = execSync('npx tsx lib/nieuwkoop/sync-script.ts', { 
      encoding: 'utf8',
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    
    console.log('✅ Sincronización completada:', result);
  } catch (error) {
    console.error('❌ Error en sincronización:', error.message);
    console.error('Output:', error.stdout?.toString());
    console.error('Error:', error.stderr?.toString());
  }
}

syncProducts();