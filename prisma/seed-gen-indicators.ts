import { PrismaClient, CategoriaPrefijo, EscalaType, UnidadType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎯 Implementando indicadores GEN (Género)...');

  // Buscar el proyecto existente
  const proyecto = await prisma.proyecto.findFirst();
  if (!proyecto) {
    console.error('❌ No se encontró ningún proyecto. Ejecute primero el seed principal.');
    process.exit(1);
  }

  console.log('📋 Proyecto encontrado:', proyecto.nombre);

  // Definir los 6 indicadores GEN según JSON oficial
  const indicadoresGEN = [
    {
      codigo: 'GEN-001',
      categoria_prefijo: CategoriaPrefijo.GEN,
      indicador: 'Presencia de mujeres en el equipo',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO_Y_PORCENTAJE,
      origen_calculo: 'Recuento del número total de mujeres en el equipo del proyecto y cálculo del porcentaje sobre el total',
      objetivos_2025: 'Alcanzar al menos 50% de presencia femenina en el equipo',
      observaciones: 'Incluye todo el personal técnico, coordinador y colaboradores directos del proyecto',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'GEN-002',
      categoria_prefijo: CategoriaPrefijo.GEN,
      indicador: 'Compromiso con la igualdad de género de entidades colaboradoras',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de entidades colaboradoras que tienen planes de igualdad o certificaciones de género',
      objetivos_2025: 'Que el 75% de entidades colaboradoras tengan compromiso formal con igualdad de género',
      observaciones: 'Se verifica mediante documentación oficial: planes de igualdad, certificaciones, políticas corporativas',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'GEN-003',
      categoria_prefijo: CategoriaPrefijo.GEN,
      indicador: 'Presencia de mujeres en procesos de participación del proyecto',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.PORCENTAJE,
      origen_calculo: 'Porcentaje de mujeres participantes en talleres, reuniones y actividades del proyecto',
      objetivos_2025: 'Alcanzar paridad de género en participación (45-55%)',
      observaciones: 'Se mide en cada actividad participativa y se calcula la media anual',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'GEN-004',
      categoria_prefijo: CategoriaPrefijo.GEN,
      indicador: 'Presencia de especialistas en género',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de profesionales con formación específica en género que participan en el proyecto',
      objetivos_2025: 'Contar con al menos 1 especialista en género en el equipo',
      observaciones: 'Incluye consultoras especializadas, técnicas municipales con formación específica, académicas',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'GEN-005',
      categoria_prefijo: CategoriaPrefijo.GEN,
      indicador: 'Análisis de género en el sector',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de estudios o análisis de género realizados específicamente para el sector de renaturalización',
      objetivos_2025: 'Realizar al menos 1 análisis de género sectorial completo',
      observaciones: 'Incluye diagnósticos de brechas de género, estudios de impacto diferencial, análisis de barreras',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'GEN-006',
      categoria_prefijo: CategoriaPrefijo.GEN,
      indicador: 'Comunicación y sensibilización sobre igualdad de género',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de acciones de comunicación específicas sobre igualdad de género en el proyecto',
      objetivos_2025: 'Realizar al menos 6 acciones anuales de sensibilización en género',
      observaciones: 'Incluye campañas, talleres, materiales divulgativos, eventos específicos sobre género y renaturalización',
      proyecto_id: proyecto.id,
    },
  ];

  console.log('📝 Creando indicadores GEN...');

  // Crear cada indicador GEN
  for (const indicadorData of indicadoresGEN) {
    console.log(`   → Creando ${indicadorData.codigo}: ${indicadorData.indicador}`);
    
    const indicador = await prisma.indicadorGeneral.create({
      data: indicadorData,
    });

    // Crear valores de ejemplo realistas para cada indicador
    const valoresEjemplo = {
      'GEN-001': { base: 3, intermedio: 4, final: 5, obs: 'Equipo inicial 3 mujeres, objetivo 5 mujeres de 10 total (50%)' },
      'GEN-002': { base: 1, intermedio: 2, final: 3, obs: '3 de 4 entidades colaboradoras con planes de igualdad formales' },
      'GEN-003': { base: 35, intermedio: 42, final: 48, obs: 'Incremento progresivo de participación femenina en actividades' },
      'GEN-004': { base: 0, intermedio: 1, final: 1, obs: 'Incorporación de consultora especializada en género y urbanismo' },
      'GEN-005': { base: 0, intermedio: 0, final: 1, obs: 'Análisis de género completado: "Mujeres y espacios verdes urbanos en Pinto"' },
      'GEN-006': { base: 2, intermedio: 4, final: 7, obs: 'Taller género y naturaleza, campaña redes sociales, jornada técnica' },
    };

    const valores = valoresEjemplo[indicadorData.codigo as keyof typeof valoresEjemplo];

    await prisma.valorIndicadorGeneral.create({
      data: {
        valor_linea_base: valores.base,
        valor_intermedio: valores.intermedio,
        valor_final: valores.final,
        fecha_medicion: new Date('2024-07-07'),
        observaciones: valores.obs,
        indicador_general_id: indicador.id,
      },
    });

    console.log(`   ✅ ${indicadorData.codigo} creado con valores de ejemplo`);
  }

  console.log('🎉 Indicadores GEN implementados exitosamente!');
  console.log(`📊 Resumen:`);
  console.log(`   • ${indicadoresGEN.length} Indicadores de Género (GEN) creados`);
  console.log(`   • ${indicadoresGEN.length} Conjuntos de valores de ejemplo`);
  console.log(`   • Proyecto asociado: ${proyecto.nombre}`);
  console.log('');
  console.log('🔍 Indicadores creados:');
  indicadoresGEN.forEach((ind, index) => {
    console.log(`   ${index + 1}. ${ind.codigo} - ${ind.indicador}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error al implementar indicadores GEN:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });