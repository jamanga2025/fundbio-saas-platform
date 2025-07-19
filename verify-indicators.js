const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyIndicators() {
  console.log('🔍 Verificando indicadores en la base de datos...\n');

  // Contar indicadores por tipo
  const generalesCount = await prisma.indicadorGeneral.count();
  const estrategicosCount = await prisma.indicadorEstrategico.count();
  const seguimientoCount = await prisma.indicadorSeguimiento.count();

  console.log(`📊 Resumen de indicadores:`);
  console.log(`   • Generales: ${generalesCount}`);
  console.log(`   • Estratégicos: ${estrategicosCount}`);
  console.log(`   • Seguimiento: ${seguimientoCount}`);
  console.log(`   • TOTAL: ${generalesCount + estrategicosCount + seguimientoCount}`);

  // Contar por categoría
  const categorias = await prisma.indicadorGeneral.groupBy({
    by: ['categoria_prefijo'],
    _count: {
      categoria_prefijo: true
    }
  });

  console.log(`\n📋 Indicadores por categoría:`);
  for (const cat of categorias) {
    console.log(`   • ${cat.categoria_prefijo}: ${cat._count.categoria_prefijo}`);
  }

  // Verificar algunos códigos específicos
  const ejemplos = await prisma.indicadorGeneral.findMany({
    take: 5,
    select: {
      codigo: true,
      categoria_prefijo: true,
      indicador: true
    }
  });

  console.log(`\n🎯 Ejemplos de indicadores creados:`);
  for (const ej of ejemplos) {
    console.log(`   • ${ej.codigo} (${ej.categoria_prefijo}): ${ej.indicador.substring(0, 50)}...`);
  }

  // Verificar el progreso hacia 140
  const total = generalesCount + estrategicosCount + seguimientoCount;
  const progreso = Math.round((total / 140) * 100);
  
  console.log(`\n🚀 Progreso hacia 140 indicadores:`);
  console.log(`   • Actual: ${total}/140 (${progreso}%)`);
  console.log(`   • Gap restante: ${140 - total} indicadores`);

  await prisma.$disconnect();
}

verifyIndicators().catch(console.error);