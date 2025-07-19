import { PrismaClient, CategoriaPrefijo, EscalaType, UnidadType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeding...');

  // Limpiar datos existentes
  await prisma.valorSeguimiento.deleteMany();
  await prisma.valorIndicadorEstrategico.deleteMany();
  await prisma.valorIndicadorGeneral.deleteMany();
  await prisma.indicadorSeguimiento.deleteMany();
  await prisma.indicadorEstrategico.deleteMany();
  await prisma.indicadorGeneral.deleteMany();
  await prisma.proyecto.deleteMany();

  console.log('🗑️ Datos existentes eliminados');

  // Crear proyecto de ejemplo
  const proyecto = await prisma.proyecto.create({
    data: {
      entidad: 'Ayuntamiento de Pinto',
      nif: '12345678A',
      nombre: 'Proyecto de Renaturalización Urbana Pinto 2024',
      comunidad_autonoma: 'Comunidad de Madrid',
      provincia: 'Madrid',
      municipio: 'Pinto',
      fecha_inicio: new Date('2024-01-01'),
      fecha_finalizacion: new Date('2025-12-31'),
      codigo_proyecto: 'PINTO-2024-REN',
      presupuesto_total: 250000.00,
      importe_ayuda: 175000.00,
      coordinador: 'María García López',
      descripcion: 'Proyecto integral de renaturalización de espacios urbanos en Pinto, incluyendo creación de corredores verdes, instalación de infraestructura verde y restauración de ecosistemas urbanos.',
    },
  });

  console.log('✅ Proyecto creado:', proyecto.nombre);

  // Indicadores Generales de ejemplo (SUP)
  const indicadoresGenerales = [
    {
      codigo: 'SUP-001',
      categoria_prefijo: CategoriaPrefijo.SUP,
      indicador: 'Superficie total de actuación (m²)',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.M2,
      origen_calculo: 'Medición directa sobre planos y levantamientos topográficos',
      objetivos_2025: 'Alcanzar 10.000 m² de superficie intervenida',
      observaciones: 'Incluye todas las áreas donde se realizan actuaciones de renaturalización',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'SUP-002',
      categoria_prefijo: CategoriaPrefijo.SUP,
      indicador: 'Superficie de zonas verdes creadas (m²)',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.M2,
      origen_calculo: 'Suma de superficies de nuevas zonas verdes según proyecto',
      objetivos_2025: 'Crear 5.000 m² de nuevas zonas verdes',
      observaciones: 'Solo se contabilizan espacios nuevos, no rehabilitaciones',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'BDU-001',
      categoria_prefijo: CategoriaPrefijo.BDU,
      indicador: 'Número de especies vegetales autóctonas plantadas',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Recuento directo según listado de plantaciones',
      objetivos_2025: 'Plantar al menos 25 especies autóctonas diferentes',
      observaciones: 'Se priorizan especies adaptadas al clima mediterráneo continental',
      proyecto_id: proyecto.id,
    },
  ];

  for (const indicadorData of indicadoresGenerales) {
    const indicador = await prisma.indicadorGeneral.create({
      data: indicadorData,
    });

    // Crear valores de ejemplo
    await prisma.valorIndicadorGeneral.create({
      data: {
        valor_linea_base: indicadorData.codigo === 'SUP-001' ? 0 : indicadorData.codigo === 'SUP-002' ? 0 : 15,
        valor_intermedio: indicadorData.codigo === 'SUP-001' ? 4500 : indicadorData.codigo === 'SUP-002' ? 2800 : 22,
        valor_final: indicadorData.codigo === 'SUP-001' ? 10000 : indicadorData.codigo === 'SUP-002' ? 5000 : 28,
        fecha_medicion: new Date('2024-06-15'),
        observaciones: 'Medición intermedia del proyecto',
        indicador_general_id: indicador.id,
      },
    });
  }

  console.log('✅ Indicadores generales creados:', indicadoresGenerales.length);

  // Indicadores Estratégicos de ejemplo (A)
  const indicadoresEstrategicos = [
    {
      codigo: 'A-001',
      indicador: '¿Existe un plan estratégico de infraestructura verde municipal?',
      escala: EscalaType.MUNICIPAL,
      unidad: UnidadType.SI_NO,
      origen_calculo: 'Verificación documental de la existencia del plan',
      objetivos_2025: 'Contar con plan aprobado y en vigor',
      observaciones: 'El plan debe estar oficialmente aprobado por el pleno municipal',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'A-002',
      indicador: 'Número de ordenanzas municipales que incluyen criterios de biodiversidad',
      escala: EscalaType.MUNICIPAL,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Revisión de normativa municipal vigente',
      objetivos_2025: 'Al menos 3 ordenanzas con criterios de biodiversidad',
      observaciones: 'Incluye ordenanzas de urbanismo, jardines y medio ambiente',
      proyecto_id: proyecto.id,
    },
  ];

  for (const indicadorData of indicadoresEstrategicos) {
    const indicador = await prisma.indicadorEstrategico.create({
      data: indicadorData,
    });

    // Crear valores de ejemplo
    await prisma.valorIndicadorEstrategico.create({
      data: {
        valor_si_no: indicadorData.codigo === 'A-001' ? true : null,
        valor_numerico: indicadorData.codigo === 'A-002' ? 2 : null,
        valor_texto: indicadorData.codigo === 'A-001' ? 'Plan de Infraestructura Verde aprobado en marzo 2024' : 'Ordenanzas: Urbanismo sostenible, Gestión de jardines',
        fecha_medicion: new Date('2024-03-15'),
        observaciones: 'Verificación realizada por equipo técnico municipal',
        indicador_estrategico_id: indicador.id,
      },
    });
  }

  console.log('✅ Indicadores estratégicos creados:', indicadoresEstrategicos.length);

  // Indicadores de Seguimiento de ejemplo (SEG)
  const indicadoresSeguimiento = [
    {
      codigo: 'SEG-001',
      indicador: 'Porcentaje de ejecución del proyecto (%)',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.PORCENTAJE,
      origen_calculo: 'Relación entre actividades ejecutadas y planificadas',
      objetivos_2025: 'Alcanzar 100% de ejecución',
      observaciones: 'Se actualiza trimestralmente',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'SEG-002',
      indicador: 'Número de actividades de participación ciudadana realizadas',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Recuento de talleres, reuniones y eventos participativos',
      objetivos_2025: 'Mínimo 12 actividades anuales',
      observaciones: 'Incluye talleres presenciales y online',
      proyecto_id: proyecto.id,
    },
  ];

  for (const indicadorData of indicadoresSeguimiento) {
    const indicador = await prisma.indicadorSeguimiento.create({
      data: indicadorData,
    });

    // Crear valores de seguimiento trimestrales
    const trimestres = [
      { periodo: 'T1-2024', fecha: new Date('2024-03-31'), valor_num: 15, valor_text: 'Inicio de actividades' },
      { periodo: 'T2-2024', fecha: new Date('2024-06-30'), valor_num: 45, valor_text: 'Desarrollo de plantaciones' },
      { periodo: 'T3-2024', fecha: new Date('2024-09-30'), valor_num: 75, valor_text: 'Instalación de infraestructuras' },
      { periodo: 'T4-2024', fecha: new Date('2024-12-31'), valor_num: 85, valor_text: 'Fase de consolidación' },
    ];

    for (const trimestre of trimestres) {
      await prisma.valorSeguimiento.create({
        data: {
          valor_numerico: indicadorData.codigo === 'SEG-001' ? trimestre.valor_num : Math.floor(trimestre.valor_num / 25),
          valor_texto: trimestre.valor_text,
          fecha_medicion: trimestre.fecha,
          periodo_seguimiento: trimestre.periodo,
          observaciones: `Seguimiento ${trimestre.periodo} - Proyecto en desarrollo`,
          indicador_seguimiento_id: indicador.id,
        },
      });
    }
  }

  console.log('✅ Indicadores de seguimiento creados:', indicadoresSeguimiento.length);

  // Crear usuario de ejemplo para el proyecto
  await prisma.user.create({
    data: {
      name: 'Admin Pinto',
      email: 'admin@pinto.es',
      role: 'AYUNTAMIENTO',
      proyectoId: proyecto.id,
    },
  });

  console.log('✅ Usuario de ejemplo creado');

  console.log('🌟 Seeding completado exitosamente!');
  console.log(`📊 Resumen:`);
  console.log(`   • 1 Proyecto: ${proyecto.nombre}`);
  console.log(`   • ${indicadoresGenerales.length} Indicadores Generales`);
  console.log(`   • ${indicadoresEstrategicos.length} Indicadores Estratégicos`);
  console.log(`   • ${indicadoresSeguimiento.length} Indicadores de Seguimiento`);
  console.log(`   • ${indicadoresSeguimiento.length * 4} Valores de seguimiento`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });