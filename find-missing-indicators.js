const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function findMissingIndicators() {
  console.log('🔍 Buscando indicadores faltantes...\n');

  // Leer el archivo JSON
  const jsonData = JSON.parse(fs.readFileSync('indicadores_fundacion_biodiversidad.json', 'utf8'));
  
  // Obtener todos los códigos de la BD
  const generalesDB = await prisma.indicadorGeneral.findMany({
    select: { codigo: true }
  });
  
  const estrategicosDB = await prisma.indicadorEstrategico.findMany({
    select: { codigo: true }
  });
  
  const seguimientoDB = await prisma.indicadorSeguimiento.findMany({
    select: { codigo: true }
  });

  const codigosDB = [
    ...generalesDB.map(i => i.codigo),
    ...estrategicosDB.map(i => i.codigo),
    ...seguimientoDB.map(i => i.codigo)
  ];

  console.log(`📊 Códigos en BD: ${codigosDB.length}`);

  // Revisar indicadores generales
  const generalesJSON = jsonData.indicadores_generales.indicadores;
  const faltantesGenerales = [];
  
  for (const ind of generalesJSON) {
    if (!codigosDB.includes(ind.codigo) && 
        !ind.codigo.includes('SIN_CATEGORIA') && 
        !ind.nombre.includes('---') && 
        !ind.nombre.includes('SEPARADOR')) {
      faltantesGenerales.push(ind);
    }
  }

  // Revisar indicadores estratégicos
  const estrategicosJSON = jsonData.indicadores_estrategicos.indicadores;
  const faltantesEstrategicos = [];
  
  for (const ind of estrategicosJSON) {
    if (!codigosDB.includes(ind.codigo)) {
      faltantesEstrategicos.push(ind);
    }
  }

  console.log(`❌ Indicadores faltantes:`);
  console.log(`   • Generales: ${faltantesGenerales.length}`);
  console.log(`   • Estratégicos: ${faltantesEstrategicos.length}`);

  if (faltantesGenerales.length > 0) {
    console.log(`\n📋 Indicadores generales faltantes:`);
    for (const ind of faltantesGenerales) {
      console.log(`   • ${ind.codigo}: ${ind.nombre}`);
    }
  }

  if (faltantesEstrategicos.length > 0) {
    console.log(`\n🎯 Indicadores estratégicos faltantes:`);
    for (const ind of faltantesEstrategicos) {
      console.log(`   • ${ind.codigo}: ${ind.nombre}`);
    }
  }

  // Análisis de duplicados CBA
  const cbaCodes = generalesJSON.filter(i => i.codigo.startsWith('CBA')).map(i => i.codigo);
  const cbaUnique = [...new Set(cbaCodes)];
  console.log(`\n🔍 Análisis categoría CBA:`);
  console.log(`   • Códigos totales: ${cbaCodes.length}`);
  console.log(`   • Códigos únicos: ${cbaUnique.length}`);
  console.log(`   • Duplicados: ${cbaCodes.length - cbaUnique.length}`);

  await prisma.$disconnect();
}

findMissingIndicators().catch(console.error);