import { PrismaClient, CategoriaPrefijo, EscalaType, UnidadType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌿 Implementando indicadores RES (Resiliencia)...');

  // Buscar el proyecto existente
  const proyecto = await prisma.proyecto.findFirst();
  if (!proyecto) {
    console.error('❌ No se encontró ningún proyecto. Ejecute primero el seed principal.');
    process.exit(1);
  }

  console.log('📋 Proyecto encontrado:', proyecto.nombre);

  // Definir los 12 indicadores RES según JSON oficial
  const indicadoresRES = [
    {
      codigo: 'RES-001',
      categoria_prefijo: CategoriaPrefijo.RES,
      indicador: 'Especies adaptadas al clima futuro',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.PORCENTAJE,
      origen_calculo: 'Porcentaje de especies vegetales plantadas que están adaptadas a las proyecciones climáticas 2050',
      objetivos_2025: 'Al menos 70% de especies plantadas adaptadas al clima futuro',
      observaciones: 'Se consideran especies resistentes a sequía, altas temperaturas y fenómenos extremos',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'RES-002',
      categoria_prefijo: CategoriaPrefijo.RES,
      indicador: 'Población protegida frente al riesgo de inundación',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de habitantes que se benefician de las infraestructuras de drenaje sostenible implementadas',
      objetivos_2025: 'Proteger a 15.000 habitantes del riesgo de inundación',
      observaciones: 'Incluye población directamente beneficiada por jardines de lluvia, pavimentos permeables y sistemas SUDS',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'RES-003',
      categoria_prefijo: CategoriaPrefijo.RES,
      indicador: 'Volumen de agua de lluvia interceptada',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.OTRO, // m3
      origen_calculo: 'Volumen anual de agua pluvial captada por cubiertas verdes, jardines de lluvia y sistemas de infiltración',
      objetivos_2025: 'Interceptar 8.500 m³ anuales de agua pluvial',
      observaciones: 'Medición basada en superficie captadora y precipitación media anual (450mm)',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'RES-004',
      categoria_prefijo: CategoriaPrefijo.RES,
      indicador: 'Volumen de agua de lluvia interceptada redirigida a suelo fértil',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.PORCENTAJE,
      origen_calculo: 'Porcentaje del agua interceptada que se infiltra en suelo con capacidad de retención y biodiversidad',
      objetivos_2025: 'Redirigir 80% del agua interceptada a suelo fértil',
      observaciones: 'Excluye agua dirigida a sistemas de drenaje convencional o superficies impermeables',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'RES-005',
      categoria_prefijo: CategoriaPrefijo.RES,
      indicador: 'Volumen anual de agua empleada en riego municipal',
      escala: EscalaType.MUNICIPAL,
      unidad: UnidadType.OTRO, // m3 por m2 área verde
      origen_calculo: 'Metros cúbicos de agua empleados anualmente para riego por cada metro cuadrado de área verde municipal',
      objetivos_2025: 'Reducir el consumo a 0.8 m³/m² área verde mediante especies resistentes',
      observaciones: 'Incluye agua potable y reutilizada para mantenimiento de jardines públicos',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'RES-006',
      categoria_prefijo: CategoriaPrefijo.RES,
      indicador: 'Volumen anual de agua reutilizada en riego municipal',
      escala: EscalaType.MUNICIPAL,
      unidad: UnidadType.OTRO, // m3 por m2 área verde
      origen_calculo: 'Metros cúbicos de agua reutilizada (grises, pluviales, regeneradas) por metro cuadrado de área verde',
      objetivos_2025: 'Alcanzar 0.4 m³/m² de agua reutilizada (50% del riego total)',
      observaciones: 'Incluye sistemas de recogida pluvial, reutilización de aguas grises y regeneración de aguas residuales',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'RES-007',
      categoria_prefijo: CategoriaPrefijo.RES,
      indicador: 'Superficie con estado erosión grave o muy grave',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.M2,
      origen_calculo: 'Superficie en metros cuadrados afectada por procesos erosivos severos antes y después de la intervención',
      objetivos_2025: 'Reducir superficie erosionada a menos de 500 m²',
      observaciones: 'Se mide mediante índices de erosión del suelo y cobertura vegetal protectora',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'RES-008',
      categoria_prefijo: CategoriaPrefijo.RES,
      indicador: 'Superficie anual afectada por incendios',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.M2,
      origen_calculo: 'Superficie en metros cuadrados afectada anualmente por incendios en áreas del proyecto',
      objetivos_2025: 'Mantener superficie afectada por fuego menor a 100 m² anuales',
      observaciones: 'Incluye medidas preventivas: cortafuegos verdes, especies ignífugas, mantenimiento preventivo',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'RES-009',
      categoria_prefijo: CategoriaPrefijo.RES,
      indicador: 'Daños materiales anuales generados por fenómenos meteorológicos extremos',
      escala: EscalaType.MUNICIPAL,
      unidad: UnidadType.EURO,
      origen_calculo: 'Valoración económica anual de daños causados por tormentas, granizo, vientos fuertes y sequías',
      objetivos_2025: 'Reducir daños meteorológicos a menos de 50.000€ anuales',
      observaciones: 'Se incluyen daños a infraestructuras verdes, mobiliario urbano y espacios públicos',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'RES-010',
      categoria_prefijo: CategoriaPrefijo.RES,
      indicador: 'Ingresos anuales hospitalarios por efectos de calor',
      escala: EscalaType.MUNICIPAL,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de ingresos hospitalarios anuales relacionados con golpes de calor, deshidratación e hipertermia',
      objetivos_2025: 'Reducir ingresos por calor a menos de 25 casos anuales',
      observaciones: 'Coordinación con sistema sanitario para seguimiento epidemiológico en población vulnerable',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'RES-011',
      categoria_prefijo: CategoriaPrefijo.RES,
      indicador: 'Presencia o establecimiento del mosquito Aedes albopictus',
      escala: EscalaType.MUNICIPAL,
      unidad: UnidadType.OTRO, // Reporte de presencia (Si/No) / Casos de transmisión de enfermedad
      origen_calculo: 'Monitoreo de presencia del mosquito tigre y casos de enfermedades transmitidas',
      objetivos_2025: 'Mantener ausencia de Aedes albopictus y cero casos de transmisión',
      observaciones: 'Control mediante gestión de agua estancada y seguimiento entomológico especializado',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'RES-012',
      categoria_prefijo: CategoriaPrefijo.RES,
      indicador: 'Concentración atmosférica de polen potencialmente alergénico',
      escala: EscalaType.MUNICIPAL,
      unidad: UnidadType.OTRO, // granos de polen / m3 de aire
      origen_calculo: 'Medición de granos de polen por metro cúbico de aire de especies con alta capacidad alergénica',
      objetivos_2025: 'Mantener concentración polínica <50 granos/m³ en periodo crítico',
      observaciones: 'Monitoreo específico de Platanus, Olea, Cupressus y gramíneas durante primavera',
      proyecto_id: proyecto.id,
    },
  ];

  console.log('📝 Creando indicadores RES...');

  // Crear cada indicador RES
  for (const indicadorData of indicadoresRES) {
    console.log(`   → Creando ${indicadorData.codigo}: ${indicadorData.indicador}`);
    
    const indicador = await prisma.indicadorGeneral.create({
      data: indicadorData,
    });

    // Crear valores de ejemplo realistas para cada indicador
    const valoresEjemplo = {
      'RES-001': { base: 45, intermedio: 62, final: 75, obs: 'Incremento progresivo de especies climáticamente resilientes: encinas, lavanda, romero' },
      'RES-002': { base: 8500, intermedio: 12000, final: 15000, obs: 'Extensión gradual de sistemas SUDS: jardines de lluvia en 5 barrios' },
      'RES-003': { base: 3200, intermedio: 6100, final: 8500, obs: '15 cubiertas verdes + 8 jardines de lluvia captando 450mm precipitación anual' },
      'RES-004': { base: 65, intermedio: 72, final: 82, obs: 'Mejora en diseño de infiltración: suelos enmendados con compost y gravilla' },
      'RES-005': { base: 1.4, intermedio: 1.1, final: 0.8, obs: 'Reducción por xerojardinería: sustitución césped por praderas naturales' },
      'RES-006': { base: 0.1, intermedio: 0.25, final: 0.4, obs: 'Sistema municipal de reutilización: cisterna pluvial 500m³ + aguas grises' },
      'RES-007': { base: 2800, intermedio: 1200, final: 450, obs: 'Revegetación con especies tapizantes: Festuca, Stipa, Thymus en taludes' },
      'RES-008': { base: 0, intermedio: 35, final: 80, obs: 'Incidente verano 2024: mejora de cortafuegos y eliminación especies pirófitas' },
      'RES-009': { base: 125000, intermedio: 78000, final: 45000, obs: 'Reducción daños por tormentas: arbolado resistente + drenaje mejorado' },
      'RES-010': { base: 42, intermedio: 31, final: 22, obs: 'Reducción por efecto isla de calor: 3°C menos en zonas renaturalizadas' },
      'RES-011': { base: 0, intermedio: 0, final: 0, obs: 'Sin detección Aedes albopictus: control estanques + eliminación agua estancada' },
      'RES-012': { base: 78, intermedio: 65, final: 45, obs: 'Reducción por sustitución Platanus por Quercus ilex en avenidas principales' },
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

  console.log('🌊 Indicadores RES implementados exitosamente!');
  console.log(`📊 Resumen:`);
  console.log(`   • ${indicadoresRES.length} Indicadores de Resiliencia (RES) creados`);
  console.log(`   • ${indicadoresRES.length} Conjuntos de valores de ejemplo`);
  console.log(`   • Proyecto asociado: ${proyecto.nombre}`);
  console.log('');
  console.log('🔍 Indicadores creados:');
  indicadoresRES.forEach((ind, index) => {
    console.log(`   ${index + 1}. ${ind.codigo} - ${ind.indicador}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error al implementar indicadores RES:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });