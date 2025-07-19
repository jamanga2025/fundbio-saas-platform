import { PrismaClient, CategoriaPrefijo, EscalaType, UnidadType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌬️ Implementando indicadores CBA (Calidad Biofísica Ambiental)...');

  // Buscar el proyecto existente
  const proyecto = await prisma.proyecto.findFirst();
  if (!proyecto) {
    console.error('❌ No se encontró ningún proyecto. Ejecute primero el seed principal.');
    process.exit(1);
  }

  console.log('📋 Proyecto encontrado:', proyecto.nombre);

  // Definir los 11 indicadores CBA únicos (eliminando duplicados del JSON)
  const indicadoresCBA = [
    {
      codigo: 'CBA-001',
      categoria_prefijo: CategoriaPrefijo.CBA,
      indicador: 'Concentración de material particulado inferior a 2.5 micras (PM 2,5)',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.OTRO, // µg/m3
      origen_calculo: 'Medición mediante sensores de calidad del aire en puntos representativos del proyecto',
      objetivos_2025: 'Mantener concentración <15 µg/m³ (límite OMS 2021)',
      observaciones: 'Monitoreo continuo en estaciones meteorológicas urbanas y puntos críticos',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'CBA-002',
      categoria_prefijo: CategoriaPrefijo.CBA,
      indicador: 'Concentración de óxidos de nitrógeno (NO2 y NO)',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.OTRO, // µg/m3
      origen_calculo: 'Medición de NOx mediante analizadores químicos automáticos en tiempo real',
      objetivos_2025: 'Mantener NO2 <40 µg/m³ media anual (límite UE)',
      observaciones: 'Especial atención en zonas próximas a tráfico rodado y actividades industriales',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'CBA-003',
      categoria_prefijo: CategoriaPrefijo.CBA,
      indicador: 'Índice de Sensación térmica por calor',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.INDICE,
      origen_calculo: 'Cálculo de índice de confort térmico considerando temperatura, humedad, viento y radiación',
      objetivos_2025: 'Reducir índice de estrés térmico a <0.7 en verano',
      observaciones: 'Medición en zonas renaturalizadas vs espacios pavimentados como referencia',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'CBA-004',
      categoria_prefijo: CategoriaPrefijo.CBA,
      indicador: 'Nivel de presión sonora ambiental diurno',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.OTRO, // dBA
      origen_calculo: 'Medición de ruido ambiental con sonómetros clase 1 durante periodo diurno (7-23h)',
      objetivos_2025: 'Mantener nivel <55 dBA en zonas residenciales',
      observaciones: 'Las zonas verdes actúan como barreras acústicas naturales reduciendo ruido de tráfico',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'CBA-005',
      categoria_prefijo: CategoriaPrefijo.CBA,
      indicador: 'Oxígeno disuelto',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.OTRO, // mg/l y tasa de saturación en %
      origen_calculo: 'Medición de O2 disuelto en láminas de agua naturalizadas mediante sondas digitales',
      objetivos_2025: 'Mantener >6 mg/l (>75% saturación) en estanques y humedales',
      observaciones: 'Indicador de calidad ecológica en elementos acuáticos del proyecto',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'CBA-006',
      categoria_prefijo: CategoriaPrefijo.CBA,
      indicador: 'Carbono secuestrado',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.OTRO, // Ton CO2 /año
      origen_calculo: 'Cálculo de captura de CO2 por vegetación plantada según biomasa y tasas de crecimiento',
      objetivos_2025: 'Secuestrar 50 toneladas CO2/año mediante nueva vegetación',
      observaciones: 'Incluye arboles, arbustos y praderas. Metodología IPCC para inventarios de carbono',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'CBA-007',
      categoria_prefijo: CategoriaPrefijo.CBA,
      indicador: 'Uso de materiales reciclados o reutilizados',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.PORCENTAJE,
      origen_calculo: 'Porcentaje en volumen y presupuesto de materiales reciclados utilizados en la ejecución',
      objetivos_2025: 'Alcanzar 30% del presupuesto en materiales reciclados',
      observaciones: 'Incluye áridos reciclados, maderas certificadas FSC, mobiliario de materiales recuperados',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'CBA-008',
      categoria_prefijo: CategoriaPrefijo.CBA,
      indicador: 'Uso de materiales locales',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.PORCENTAJE,
      origen_calculo: 'Porcentaje del presupuesto invertido en materiales de origen local (<100km)',
      objetivos_2025: 'Alcanzar 60% del presupuesto en materiales locales',
      observaciones: 'Prioriza piedra natural local, plantas de viveros regionales, maderas de gestión forestal cercana',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'CBA-009',
      categoria_prefijo: CategoriaPrefijo.CBA,
      indicador: 'Uso de materiales de bajo impacto',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.PORCENTAJE,
      origen_calculo: 'Porcentaje del presupuesto en materiales con certificación ambiental o bajo impacto de ciclo de vida',
      objetivos_2025: 'Alcanzar 40% del presupuesto en materiales de bajo impacto',
      observaciones: 'Incluye materiales con etiquetas ecológicas, certificaciones LEED, Cradle to Cradle',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'CBA-010',
      categoria_prefijo: CategoriaPrefijo.CBA,
      indicador: 'Residuos de construcción y demolición gestionados',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.PORCENTAJE,
      origen_calculo: 'Porcentaje en peso de RCD separados selectivamente y enviados a valorización',
      objetivos_2025: 'Gestionar 90% de RCD mediante reutilización o reciclaje',
      observaciones: 'Separación en obra: hormigón, metales, maderas, tierras. Destino a plantas de valorización',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'CBA-011',
      categoria_prefijo: CategoriaPrefijo.CBA,
      indicador: 'Uso de compost',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.OTRO, // m3 y %
      origen_calculo: 'Volumen de compost utilizado como enmienda orgánica y porcentaje sobre total de sustratos',
      objetivos_2025: 'Utilizar 200 m³ de compost (40% del total de enmiendas)',
      observaciones: 'Compost de residuos verdes municipales y lodos EDAR compostados según normativa',
      proyecto_id: proyecto.id,
    },
  ];

  console.log('📝 Creando indicadores CBA...');

  // Crear cada indicador CBA
  for (const indicadorData of indicadoresCBA) {
    console.log(`   → Creando ${indicadorData.codigo}: ${indicadorData.indicador}`);
    
    const indicador = await prisma.indicadorGeneral.create({
      data: indicadorData,
    });

    // Crear valores de ejemplo realistas para cada indicador
    const valoresEjemplo = {
      'CBA-001': { base: 18.5, intermedio: 16.2, final: 14.1, obs: 'Reducción PM2.5 por barreras vegetales y menor tráfico en zona renaturalizada' },
      'CBA-002': { base: 42, intermedio: 38, final: 35, obs: 'Mejora por alejamiento tráfico y absorción vegetal de NOx' },
      'CBA-003': { base: 0.85, intermedio: 0.78, final: 0.68, obs: 'Reducción estrés térmico por sombra arbórea y evapotranspiración' },
      'CBA-004': { base: 61, intermedio: 58, final: 53, obs: 'Reducción ruido por pantallas vegetales de 3-8 dBA según densidad' },
      'CBA-005': { base: 4.2, intermedio: 5.8, final: 7.1, obs: 'Mejora calidad agua por oxigenación natural y reducción eutrofización' },
      'CBA-006': { base: 8, intermedio: 28, final: 52, obs: 'Incremento captura CO2: 150 árboles + 2.000 arbustos + 5.000m² pradera' },
      'CBA-007': { base: 12, intermedio: 22, final: 31, obs: 'Aumento uso materiales reciclados: áridos reciclados + mobiliario recuperado' },
      'CBA-008': { base: 35, intermedio: 48, final: 62, obs: 'Priorización materiales locales: piedra Colmenar + plantas viveros regionales' },
      'CBA-009': { base: 18, intermedio: 28, final: 41, obs: 'Incremento materiales certificados: maderas FSC + hormigones eco-eficientes' },
      'CBA-010': { base: 65, intermedio: 78, final: 92, obs: 'Mejora gestión RCD: separación selectiva + reutilización tierras excavación' },
      'CBA-011': { base: 45, intermedio: 120, final: 205, obs: 'Incremento uso compost: 40% enmiendas orgánicas de residuos verdes municipales' },
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

  console.log('🌬️ Indicadores CBA implementados exitosamente!');
  console.log(`📊 Resumen:`);
  console.log(`   • ${indicadoresCBA.length} Indicadores de Calidad Biofísica Ambiental (CBA) creados`);
  console.log(`   • ${indicadoresCBA.length} Conjuntos de valores de ejemplo`);
  console.log(`   • Proyecto asociado: ${proyecto.nombre}`);
  console.log('');
  console.log('🔍 Indicadores creados:');
  indicadoresCBA.forEach((ind, index) => {
    console.log(`   ${index + 1}. ${ind.codigo} - ${ind.indicador}`);
  });
  console.log('');
  console.log('📝 Nota: Se han eliminado duplicados del JSON original, implementando 11 indicadores únicos');
}

main()
  .catch((e) => {
    console.error('❌ Error al implementar indicadores CBA:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });