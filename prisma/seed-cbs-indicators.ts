import { PrismaClient, CategoriaPrefijo, EscalaType, UnidadType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('👥 Implementando indicadores CBS (Cobeneficios Sociales)...');

  // Buscar el proyecto existente
  const proyecto = await prisma.proyecto.findFirst();
  if (!proyecto) {
    console.error('❌ No se encontró ningún proyecto. Ejecute primero el seed principal.');
    process.exit(1);
  }

  console.log('📋 Proyecto encontrado:', proyecto.nombre);

  // Definir los 17 indicadores CBS según JSON oficial
  const indicadoresCBS = [
    {
      codigo: 'CBS-001',
      categoria_prefijo: CategoriaPrefijo.CBS,
      indicador: 'Dotación de áreas verdes',
      escala: EscalaType.MUNICIPAL,
      unidad: UnidadType.OTRO, // m2 / habitante
      origen_calculo: 'Superficie total de áreas verdes municipales dividida por número de habitantes',
      objetivos_2025: 'Alcanzar 15 m²/habitante de área verde (estándar OMS)',
      observaciones: 'Incluye parques, jardines, zonas deportivas al aire libre y espacios naturales urbanos',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'CBS-002',
      categoria_prefijo: CategoriaPrefijo.CBS,
      indicador: 'Proximidad de áreas verdes',
      escala: EscalaType.MUNICIPAL,
      unidad: UnidadType.PORCENTAJE,
      origen_calculo: 'Porcentaje de población que vive a menos de 300m de un área verde de al menos 0.5 ha',
      objetivos_2025: 'Que 80% de la población tenga acceso próximo a áreas verdes',
      observaciones: 'Distancia medida por red peatonal, no línea recta. Áreas verdes mínimo 5.000 m²',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'CBS-003',
      categoria_prefijo: CategoriaPrefijo.CBS,
      indicador: 'Proximidad simultánea a espacios verdes',
      escala: EscalaType.MUNICIPAL,
      unidad: UnidadType.PORCENTAJE,
      origen_calculo: 'Porcentaje de población con acceso a diferentes tipologías de espacios verdes (parque, jardín, natural)',
      objetivos_2025: 'Que 60% población tenga acceso a al menos 3 tipologías diferentes',
      observaciones: 'Considera diversidad de espacios: parques urbanos, jardines de barrio, espacios naturales',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'CBS-004',
      categoria_prefijo: CategoriaPrefijo.CBS,
      indicador: 'Percepción del espacio',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.OTRO, // Encuesta
      origen_calculo: 'Encuesta de satisfacción ciudadana sobre calidad percibida de espacios renaturalizados',
      objetivos_2025: 'Alcanzar 80% de valoración positiva en encuestas de percepción',
      observaciones: 'Encuesta anual con mínimo 200 respuestas. Escala 1-10 sobre estética, confort, seguridad',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'CBS-005',
      categoria_prefijo: CategoriaPrefijo.CBS,
      indicador: 'Percepción de bienestar',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.OTRO, // Encuesta
      origen_calculo: 'Encuesta sobre bienestar psicológico y calidad de vida asociada a espacios verdes',
      objetivos_2025: 'Que 75% usuarios reporten mejora en bienestar tras uso de espacios',
      observaciones: 'Cuestionario específico sobre estrés, relajación, conexión con naturaleza',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'CBS-006',
      categoria_prefijo: CategoriaPrefijo.CBS,
      indicador: 'Actividad física inducida',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de usuarios que realizan actividad física en espacios renaturalizados',
      objetivos_2025: 'Registrar 2.500 usuarios regulares de actividad física',
      observaciones: 'Incluye running, caminatas, ejercicio al aire libre, yoga. Conteo mediante sensores y observación',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'CBS-007',
      categoria_prefijo: CategoriaPrefijo.CBS,
      indicador: 'Movilidad activa inducida',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de usuarios anuales que utilizan modos activos (peatonal, ciclista) hacia espacios verdes',
      objetivos_2025: 'Registrar 15.000 usuarios anuales de movilidad activa',
      observaciones: 'Medición en sendas peatonales y carriles bici que conectan con áreas renaturalizadas',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'CBS-008',
      categoria_prefijo: CategoriaPrefijo.CBS,
      indicador: 'Actividad económica municipal inducida',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.EURO,
      origen_calculo: 'Valor económico anual generado por comercios y servicios vinculados a espacios verdes',
      objetivos_2025: 'Generar 120.000€/año en actividad económica local',
      observaciones: 'Incluye cafeterías, tiendas deportivas, servicios turísticos, eventos en espacios verdes',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'CBS-009',
      categoria_prefijo: CategoriaPrefijo.CBS,
      indicador: 'Incremento de actividades de proximidad',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de nuevas actividades comerciales y sociales establecidas cerca de espacios renaturalizados',
      objetivos_2025: 'Registrar 12 nuevas actividades de proximidad',
      observaciones: 'Radio de influencia 500m. Incluye comercios, asociaciones, servicios comunitarios',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'CBS-010',
      categoria_prefijo: CategoriaPrefijo.CBS,
      indicador: 'Empleos directos',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de empleos directos generados por ejecución y mantenimiento del proyecto',
      objetivos_2025: 'Generar 8 empleos directos equivalentes tiempo completo',
      observaciones: 'Incluye jardineros, técnicos ambientales, personal mantenimiento. Medido en FTE',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'CBS-011',
      categoria_prefijo: CategoriaPrefijo.CBS,
      indicador: 'Empleos indirectos',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de empleos indirectos en cadena de valor (viveros, transportes, suministros)',
      objetivos_2025: 'Generar 15 empleos indirectos en cadena de valor regional',
      observaciones: 'Empleos en viveros locales, transportes, proveedores materiales, servicios especializados',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'CBS-012',
      categoria_prefijo: CategoriaPrefijo.CBS,
      indicador: 'Empleos temporales',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de empleos temporales durante fase de construcción y establecimiento',
      objetivos_2025: 'Generar 25 empleos temporales durante ejecución',
      observaciones: 'Empleos construcción, plantación, instalaciones. Duración media 6 meses',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'CBS-013',
      categoria_prefijo: CategoriaPrefijo.CBS,
      indicador: 'Empleos permanentes',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de empleos permanentes para operación y mantenimiento a largo plazo',
      objetivos_2025: 'Consolidar 5 empleos permanentes para mantenimiento',
      observaciones: 'Personal fijo municipal o contratado para mantenimiento, vigilancia, gestión espacios',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'CBS-014',
      categoria_prefijo: CategoriaPrefijo.CBS,
      indicador: 'Accesibilidad universal',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.PORCENTAJE,
      origen_calculo: 'Porcentaje de espacios renaturalizados accesibles para personas con movilidad reducida',
      objetivos_2025: 'Lograr 90% de espacios con accesibilidad universal',
      observaciones: 'Cumplimiento normativa accesibilidad: rampas, pavimentos, señalización táctil, mobiliario adaptado',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'CBS-015',
      categoria_prefijo: CategoriaPrefijo.CBS,
      indicador: 'Superficie ocupada por huertos urbanos',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.M2,
      origen_calculo: 'Superficie total destinada a huertos urbanos comunitarios dentro del proyecto',
      objetivos_2025: 'Establecer 800 m² de huertos urbanos comunitarios',
      observaciones: 'Incluye parcelas individuales y espacios comunes. Gestión comunitaria o municipal',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'CBS-016',
      categoria_prefijo: CategoriaPrefijo.CBS,
      indicador: 'Dotación de huertos urbanos por habitante',
      escala: EscalaType.MUNICIPAL,
      unidad: UnidadType.OTRO, // m2 por habitante
      origen_calculo: 'Superficie total de huertos urbanos municipales dividida por número de habitantes',
      objetivos_2025: 'Alcanzar 0.02 m²/habitante de huertos urbanos',
      observaciones: 'Incluye todos los huertos comunitarios del municipio, no solo del proyecto',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'CBS-017',
      categoria_prefijo: CategoriaPrefijo.CBS,
      indicador: 'Seguridad ciudadana en áreas verdes',
      escala: EscalaType.MUNICIPAL,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de incidentes de seguridad reportados anualmente en áreas verdes municipales',
      objetivos_2025: 'Reducir incidentes de seguridad a menos de 15 anuales',
      observaciones: 'Incluye robos, vandalismo, agresiones. Mejora por iluminación, vigilancia, uso ciudadano',
      proyecto_id: proyecto.id,
    },
  ];

  console.log('📝 Creando indicadores CBS...');

  // Crear cada indicador CBS
  for (const indicadorData of indicadoresCBS) {
    console.log(`   → Creando ${indicadorData.codigo}: ${indicadorData.indicador}`);
    
    const indicador = await prisma.indicadorGeneral.create({
      data: indicadorData,
    });

    // Crear valores de ejemplo realistas para cada indicador
    const valoresEjemplo = {
      'CBS-001': { base: 8.2, intermedio: 11.5, final: 14.8, obs: 'Incremento dotación verde: nuevos parques + corredores + espacios naturalizados' },
      'CBS-002': { base: 62, intermedio: 71, final: 82, obs: 'Mejora accesibilidad: nuevos espacios verdes en barrios déficit verde' },
      'CBS-003': { base: 35, intermedio: 48, final: 63, obs: 'Diversificación espacios: parques, jardines, huertos, espacios naturales' },
      'CBS-004': { base: 6.2, intermedio: 7.1, final: 8.3, obs: 'Mejora percepción: diseño participativo + mantenimiento + seguridad' },
      'CBS-005': { base: 68, intermedio: 73, final: 78, obs: 'Incremento bienestar: reducción estrés + conexión naturaleza + ejercicio' },
      'CBS-006': { base: 850, intermedio: 1650, final: 2580, obs: 'Aumento usuarios deportivos: sendas running + circuitos ejercicio + yoga' },
      'CBS-007': { base: 5200, intermedio: 9800, final: 15400, obs: 'Incremento movilidad activa: nuevos carriles bici + sendas peatonales' },
      'CBS-008': { base: 35000, intermedio: 78000, final: 125000, obs: 'Dinamización económica: cafetería parque + alquiler bicis + eventos' },
      'CBS-009': { base: 2, intermedio: 7, final: 13, obs: 'Nuevos negocios: cafetería, tienda deporte, asociación vecinal, escuela yoga' },
      'CBS-010': { base: 0, intermedio: 5, final: 8, obs: 'Empleos directos: 3 jardineros + 2 técnicos ambientales + 3 mantenimiento' },
      'CBS-011': { base: 3, intermedio: 9, final: 16, obs: 'Empleos indirectos: viveros locales + transportes + proveedores materiales' },
      'CBS-012': { base: 12, intermedio: 25, final: 8, obs: 'Pico empleos temporales durante construcción, reducción en fase operativa' },
      'CBS-013': { base: 1, intermedio: 3, final: 5, obs: 'Consolidación empleos permanentes: jardinero municipal + vigilante + coordinador' },
      'CBS-014': { base: 45, intermedio: 68, final: 92, obs: 'Mejora accesibilidad: rampas + pavimentos adaptados + mobiliario universal' },
      'CBS-015': { base: 120, intermedio: 450, final: 820, obs: 'Expansión huertos urbanos: 24 parcelas familiares + zona comunitaria' },
      'CBS-016': { base: 0.008, intermedio: 0.014, final: 0.021, obs: 'Incremento dotación huertos: nuevas parcelas + aprovechamiento solares' },
      'CBS-017': { base: 28, intermedio: 19, final: 12, obs: 'Reducción incidentes: mejor iluminación + vigilancia natural + uso ciudadano' },
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

  console.log('👥 Indicadores CBS implementados exitosamente!');
  console.log(`📊 Resumen:`);
  console.log(`   • ${indicadoresCBS.length} Indicadores de Cobeneficios Sociales (CBS) creados`);
  console.log(`   • ${indicadoresCBS.length} Conjuntos de valores de ejemplo`);
  console.log(`   • Proyecto asociado: ${proyecto.nombre}`);
  console.log('');
  console.log('🔍 Indicadores creados:');
  indicadoresCBS.forEach((ind, index) => {
    console.log(`   ${index + 1}. ${ind.codigo} - ${ind.indicador}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error al implementar indicadores CBS:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });