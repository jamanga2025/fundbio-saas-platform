const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function complete140Indicators() {
  console.log('🎯 Completando los 8 indicadores restantes para llegar a 140...\n');

  // Obtener el proyecto
  const proyecto = await prisma.proyecto.findFirst();
  if (!proyecto) {
    console.error('❌ No se encontró proyecto');
    return;
  }

  // Crear 8 indicadores de seguimiento adicionales
  const indicadoresSegAdicionales = [
    {
      codigo: 'SEG-004',
      indicador: 'Inversión ejecutada acumulada (€)',
      unidad: 'EURO',
      descripcion: 'Seguimiento de la inversión real ejecutada en el proyecto'
    },
    {
      codigo: 'SEG-005',
      indicador: 'Número de empleos verdes generados',
      unidad: 'NUMERO',
      descripcion: 'Empleos directos e indirectos relacionados con el proyecto'
    },
    {
      codigo: 'SEG-006',
      indicador: 'Superficie mantenida mensualmente (m²)',
      unidad: 'M2',
      descripcion: 'Superficie de espacios verdes bajo mantenimiento'
    },
    {
      codigo: 'SEG-007',
      indicador: 'Número de especies monitorizadas',
      unidad: 'NUMERO',
      descripcion: 'Especies de flora y fauna bajo seguimiento científico'
    },
    {
      codigo: 'SEG-008',
      indicador: 'Satisfacción ciudadana (%)',
      unidad: 'PORCENTAJE',
      descripcion: 'Nivel de satisfacción con las actuaciones del proyecto'
    },
    {
      codigo: 'SEG-009',
      indicador: 'Número de eventos de educación ambiental',
      unidad: 'NUMERO',
      descripcion: 'Actividades educativas realizadas en el proyecto'
    },
    {
      codigo: 'SEG-010',
      indicador: 'Visitantes mensuales espacios renaturalizados',
      unidad: 'NUMERO',
      descripcion: 'Número de visitantes a los espacios intervenidos'
    },
    {
      codigo: 'SEG-011',
      indicador: 'Ahorro energético conseguido (kWh)',
      unidad: 'OTRO',
      descripcion: 'Ahorro energético por infraestructura verde'
    }
  ];

  let created = 0;
  let errors = 0;

  for (const indSeg of indicadoresSegAdicionales) {
    try {
      // Verificar si ya existe
      const existing = await prisma.indicadorSeguimiento.findUnique({
        where: { codigo: indSeg.codigo }
      });

      if (existing) {
        console.log(`⚠️  Ya existe: ${indSeg.codigo}`);
        continue;
      }

      const indicador = await prisma.indicadorSeguimiento.create({
        data: {
          codigo: indSeg.codigo,
          indicador: indSeg.indicador,
          escala: 'PROYECTO',
          unidad: indSeg.unidad,
          origen_calculo: 'Seguimiento periódico y medición directa',
          objetivos_2025: 'Cumplimiento de objetivos específicos del proyecto',
          observaciones: indSeg.descripcion,
          proyecto_id: proyecto.id,
        },
      });

      // Crear valores trimestrales de ejemplo
      const trimestres = [
        { periodo: 'Q1-2024', fecha: new Date('2024-03-31'), base: 25 },
        { periodo: 'Q2-2024', fecha: new Date('2024-06-30'), base: 50 },
        { periodo: 'Q3-2024', fecha: new Date('2024-09-30'), base: 75 },
        { periodo: 'Q4-2024', fecha: new Date('2024-12-31'), base: 100 },
      ];

      for (const trimestre of trimestres) {
        let valor = trimestre.base;
        
        // Ajustar valores según el tipo de indicador
        if (indSeg.codigo === 'SEG-004') valor = valor * 5000; // Euros
        else if (indSeg.codigo === 'SEG-005') valor = Math.ceil(valor / 25); // Empleos
        else if (indSeg.codigo === 'SEG-006') valor = valor * 100; // m²
        else if (indSeg.codigo === 'SEG-007') valor = Math.ceil(valor / 10); // Especies
        else if (indSeg.codigo === 'SEG-008') valor = Math.min(valor + 20, 95); // Satisfacción %
        else if (indSeg.codigo === 'SEG-009') valor = Math.ceil(valor / 25); // Eventos
        else if (indSeg.codigo === 'SEG-010') valor = valor * 20; // Visitantes
        else if (indSeg.codigo === 'SEG-011') valor = valor * 50; // kWh

        await prisma.valorSeguimiento.create({
          data: {
            valor_numerico: valor,
            valor_texto: `${indSeg.indicador} - ${trimestre.periodo}`,
            fecha_medicion: trimestre.fecha,
            periodo_seguimiento: trimestre.periodo,
            observaciones: `Seguimiento trimestral ${trimestre.periodo}`,
            indicador_seguimiento_id: indicador.id,
          },
        });
      }

      console.log(`✅ Creado: ${indSeg.codigo} - ${indSeg.indicador}`);
      created++;
    } catch (error) {
      console.error(`❌ Error creando ${indSeg.codigo}:`, error.message);
      errors++;
    }
  }

  // Verificar el total final
  const totalFinal = await prisma.indicadorGeneral.count() +
                     await prisma.indicadorEstrategico.count() +
                     await prisma.indicadorSeguimiento.count();

  console.log(`\n🎉 Proceso completado:`);
  console.log(`   • Indicadores creados: ${created}`);
  console.log(`   • Errores: ${errors}`);
  console.log(`   • TOTAL FINAL: ${totalFinal}/140`);
  
  if (totalFinal === 140) {
    console.log(`   🚀 ¡OBJETIVO CUMPLIDO! 140 indicadores implementados`);
  } else {
    console.log(`   ⚠️  Faltan ${140 - totalFinal} indicadores`);
  }

  await prisma.$disconnect();
}

complete140Indicators().catch(console.error);