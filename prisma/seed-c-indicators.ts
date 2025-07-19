import { PrismaClient, CategoriaPrefijo, EscalaType, UnidadType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📢 Implementando indicadores C (Comunicación y Gobernanza) - ¡CATEGORÍA FINAL!');

  // Buscar el proyecto existente
  const proyecto = await prisma.proyecto.findFirst();
  if (!proyecto) {
    console.error('❌ No se encontró ningún proyecto. Ejecute primero el seed principal.');
    process.exit(1);
  }

  console.log('📋 Proyecto encontrado:', proyecto.nombre);

  // Definir los 23 indicadores C según JSON oficial (excluyendo entradas duplicadas/categóricas)
  const indicadoresC = [
    // GOBERNANZA Y PARTICIPACIÓN (C-101 a C-110)
    {
      codigo: 'C-101',
      categoria_prefijo: CategoriaPrefijo.C,
      indicador: 'Coordinación multinivel con organismos competentes en el proyecto',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de organismos públicos de diferentes niveles que participan activamente en el proyecto',
      objetivos_2025: 'Establecer coordinación con al menos 8 organismos (local, autonómico, estatal)',
      observaciones: 'Incluye ayuntamiento, diputación, comunidad autónoma, ministerios, organismos autónomos',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'C-102',
      categoria_prefijo: CategoriaPrefijo.C,
      indicador: 'Participación-colaboración de agentes clave en proyecto',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de entidades privadas, ONGs, asociaciones y agentes sociales colaboradores',
      objetivos_2025: 'Involucrar 15 agentes clave del territorio en el proyecto',
      observaciones: 'Incluye empresas locales, asociaciones vecinales, ONGs ambientales, centros educativos',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'C-103',
      categoria_prefijo: CategoriaPrefijo.C,
      indicador: 'Participación ciudadana activa al amparo del proyecto',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de ciudadanos que participan activamente en actividades del proyecto',
      objetivos_2025: 'Lograr participación activa de 500 ciudadanos',
      observaciones: 'Incluye talleres, reuniones, jornadas, actividades de voluntariado ambiental',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'C-104',
      categoria_prefijo: CategoriaPrefijo.C,
      indicador: 'Recogida de percepción y opinión ciudadana',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de procesos formales de consulta y recogida de opinión implementados',
      objetivos_2025: 'Realizar 4 procesos anuales de consulta ciudadana',
      observaciones: 'Incluye encuestas, buzones de sugerencias, plataformas online, grupos focales',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'C-105',
      categoria_prefijo: CategoriaPrefijo.C,
      indicador: 'Órganos permanentes creados a partir de las entidades implicadas en el proyecto',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de comisiones, consejos u órganos estables de gestión creados',
      objetivos_2025: 'Crear 2 órganos permanentes de seguimiento y gestión',
      observaciones: 'Ej: Comisión Verde Municipal, Consejo Participativo de Biodiversidad',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'C-106',
      categoria_prefijo: CategoriaPrefijo.C,
      indicador: 'Sistemas regulatorios creados',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de normativas, ordenanzas o reglamentos aprobados vinculados al proyecto',
      objetivos_2025: 'Aprobar 3 sistemas regulatorios para conservación urbana',
      observaciones: 'Incluye ordenanzas de arbolado, normativas de jardines, reglamentos de uso',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'C-107',
      categoria_prefijo: CategoriaPrefijo.C,
      indicador: 'Mecanismos incentivadores creados',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de incentivos económicos o fiscales establecidos para promocionar naturalización',
      objetivos_2025: 'Establecer 4 mecanismos de incentivo para ciudadanos y empresas',
      observaciones: 'Ej: bonificaciones IBI, subvenciones cubiertas verdes, premios jardines sostenibles',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'C-108',
      categoria_prefijo: CategoriaPrefijo.C,
      indicador: 'Transparencia en el proceso',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.SI_NO,
      origen_calculo: 'Existencia de portal web público con información completa y actualizada del proyecto',
      objetivos_2025: 'Mantener transparencia total con información pública accesible',
      observaciones: 'Portal debe incluir presupuestos, cronogramas, resultados, participación ciudadana',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'C-109',
      categoria_prefijo: CategoriaPrefijo.C,
      indicador: 'Alianzas y colaboraciones internacionales',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de colaboraciones con proyectos, ciudades o organismos internacionales',
      objetivos_2025: 'Establecer 3 alianzas internacionales de intercambio de experiencias',
      observaciones: 'Incluye hermanamientos, redes de ciudades, proyectos europeos, intercambios técnicos',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'C-110',
      categoria_prefijo: CategoriaPrefijo.C,
      indicador: 'Fondos públicos y privados movilizados para la renaturalización',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.EURO,
      origen_calculo: 'Valor económico total de fondos adicionales conseguidos gracias al proyecto',
      objetivos_2025: 'Movilizar 400.000€ adicionales en cofinanciación y fondos complementarios',
      observaciones: 'Incluye fondos europeos, patrocinios privados, crowdfunding, donaciones',
      proyecto_id: proyecto.id,
    },

    // COMUNICACIÓN Y SENSIBILIZACIÓN (C-201 a C-211)
    {
      codigo: 'C-201',
      categoria_prefijo: CategoriaPrefijo.C,
      indicador: 'Difusión general del proyecto en medios',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de apariciones en medios de comunicación (prensa, radio, TV)',
      objetivos_2025: 'Conseguir 50 apariciones anuales en medios de comunicación',
      observaciones: 'Incluye noticias, reportajes, entrevistas en medios locales, regionales y nacionales',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'C-202',
      categoria_prefijo: CategoriaPrefijo.C,
      indicador: 'Difusión general del proyecto en redes sociales',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de publicaciones sobre el proyecto en redes sociales institucionales',
      objetivos_2025: 'Realizar 200 publicaciones anuales en redes sociales',
      observaciones: 'Incluye posts Facebook, tweets, Instagram, LinkedIn con alcance y engagement medidos',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'C-203',
      categoria_prefijo: CategoriaPrefijo.C,
      indicador: 'Difusión general del proyecto en la web municipal',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de contenidos publicados en web municipal sobre avances del proyecto',
      objetivos_2025: 'Publicar 24 contenidos anuales (2 mensuales) en web municipal',
      observaciones: 'Incluye noticias, galería fotos, informes de seguimiento, eventos',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'C-204',
      categoria_prefijo: CategoriaPrefijo.C,
      indicador: 'Divulgación de los contenidos del proyecto',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de materiales divulgativos específicos creados (folletos, vídeos, infografías)',
      objetivos_2025: 'Crear 15 materiales divulgativos especializados',
      observaciones: 'Incluye folletos técnicos, vídeos explicativos, infografías, presentaciones',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'C-205',
      categoria_prefijo: CategoriaPrefijo.C,
      indicador: 'Divulgación y sensibilización general presencial',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de eventos presenciales de divulgación realizados',
      objetivos_2025: 'Organizar 12 eventos anuales de sensibilización presencial',
      observaciones: 'Incluye charlas, talleres, jornadas, ferias, exposiciones, rutas guiadas',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'C-206',
      categoria_prefijo: CategoriaPrefijo.C,
      indicador: 'Difusión especializada del proyecto en medios',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de apariciones en medios especializados (revistas técnicas, congresos)',
      objetivos_2025: 'Conseguir 8 apariciones anuales en medios especializados',
      observaciones: 'Incluye revistas científicas, boletines técnicos, conferencias especializadas',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'C-207',
      categoria_prefijo: CategoriaPrefijo.C,
      indicador: 'Formación y capacitación en el ámbito de la renaturalización',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de cursos, talleres o programas formativos específicos impartidos',
      objetivos_2025: 'Impartir 6 cursos anuales de capacitación técnica',
      observaciones: 'Incluye cursos para técnicos municipales, jardineros, ciudadanos, escolares',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'C-208',
      categoria_prefijo: CategoriaPrefijo.C,
      indicador: 'Contribución de las plataformas de ciencia ciudadana al conocimiento de la biodiversidad',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de registros de biodiversidad aportados por ciudadanos a plataformas científicas',
      objetivos_2025: 'Conseguir 500 registros anuales de ciencia ciudadana',
      observaciones: 'Incluye eBird, iNaturalist, Biodiversidad Virtual, proyectos de seguimiento',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'C-209',
      categoria_prefijo: CategoriaPrefijo.C,
      indicador: 'Percepción ciudadana ante la naturalización',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de estudios de percepción ciudadana realizados sobre renaturalización urbana',
      objetivos_2025: 'Realizar 2 estudios anuales de percepción ciudadana',
      observaciones: 'Incluye encuestas específicas, grupos focales, estudios sociológicos sobre aceptación',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'C-210',
      categoria_prefijo: CategoriaPrefijo.C,
      indicador: 'Transferencia de conocimiento',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de acciones de transferencia a otros municipios o entidades',
      objetivos_2025: 'Realizar 8 acciones anuales de transferencia de conocimiento',
      observaciones: 'Incluye visitas técnicas, intercambios, asesorías, publicaciones metodológicas',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'C-211',
      categoria_prefijo: CategoriaPrefijo.C,
      indicador: 'Participación en actividades programadas durante la ejecución del proyecto',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número total de participantes en todas las actividades programadas del proyecto',
      objetivos_2025: 'Conseguir 3.000 participaciones anuales en actividades del proyecto',
      observaciones: 'Suma de asistentes a talleres, eventos, jornadas, voluntariados (una persona puede contar varias veces)',
      proyecto_id: proyecto.id,
    },

    // MEDICIÓN Y SEGUIMIENTO (C-301 a C-303)
    {
      codigo: 'C-301',
      categoria_prefijo: CategoriaPrefijo.C,
      indicador: 'Seguimiento de informes',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de informes de seguimiento técnico elaborados y publicados',
      objetivos_2025: 'Elaborar 4 informes anuales de seguimiento técnico completo',
      observaciones: 'Incluye informes trimestrales de avance, evaluación intermedia, informe final',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'C-302',
      categoria_prefijo: CategoriaPrefijo.C,
      indicador: 'Evaluación de impacto',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de evaluaciones de impacto ambiental y social realizadas',
      objetivos_2025: 'Realizar 2 evaluaciones de impacto completas durante el proyecto',
      observaciones: 'Incluye evaluación inicial, intermedia y final con metodología estandarizada',
      proyecto_id: proyecto.id,
    },
    {
      codigo: 'C-303',
      categoria_prefijo: CategoriaPrefijo.C,
      indicador: 'Gestión adaptativa',
      escala: EscalaType.PROYECTO,
      unidad: UnidadType.NUMERO,
      origen_calculo: 'Número de adaptaciones o mejoras implementadas basadas en seguimiento y evaluación',
      objetivos_2025: 'Implementar 6 mejoras adaptativas basadas en seguimiento',
      observaciones: 'Incluye cambios de diseño, nuevas especies, modificaciones de mantenimiento',
      proyecto_id: proyecto.id,
    },
  ];

  console.log('📝 Creando indicadores C...');

  // Crear cada indicador C
  for (const indicadorData of indicadoresC) {
    console.log(`   → Creando ${indicadorData.codigo}: ${indicadorData.indicador}`);
    
    const indicador = await prisma.indicadorGeneral.create({
      data: indicadorData,
    });

    // Crear valores de ejemplo realistas para cada indicador
    const valoresEjemplo = {
      'C-101': { base: 3, intermedio: 6, final: 9, obs: 'Coordinación: Ayuntamiento + Comunidad Madrid + Diputación + MITECO + CHT + AEMET + Fundación Biodiversidad + SEO/BirdLife + Universidad' },
      'C-102': { base: 5, intermedio: 11, final: 16, obs: 'Agentes: 4 asociaciones vecinales + 3 centros educativos + 2 empresas locales + 4 ONGs + 3 entidades culturales' },
      'C-103': { base: 85, intermedio: 280, final: 520, obs: 'Participación creciente: talleres participativos + voluntariado ambiental + asambleas de seguimiento' },
      'C-104': { base: 1, intermedio: 3, final: 4, obs: 'Consultas: encuesta inicial + buzón sugerencias + plataforma digital + grupos focales' },
      'C-105': { base: 0, intermedio: 1, final: 2, obs: 'Órganos creados: Comisión Verde Municipal + Consejo Participativo Biodiversidad' },
      'C-106': { base: 1, intermedio: 2, final: 3, obs: 'Normativa: Ordenanza Arbolado + Reglamento Huertos + Normativa Jardines Privados' },
      'C-107': { base: 0, intermedio: 2, final: 4, obs: 'Incentivos: Bonificación IBI cubiertas verdes + Subvención jardines + Premio huerto sostenible + Ayuda compostaje' },
      'C-108': { base: 1, intermedio: 1, final: 1, obs: 'Portal transparencia activo: presupuestos + cronograma + resultados + participación' },
      'C-109': { base: 0, intermedio: 1, final: 3, obs: 'Alianzas: Red Ciudades Sostenibles + Proyecto LIFE+ europeo + Intercambio Portugal' },
      'C-110': { base: 25000, intermedio: 180000, final: 425000, obs: 'Fondos movilizados: LIFE+ (200k) + Patrocinio Caja Rural (50k) + Diputación (100k) + Crowdfunding (75k)' },
      'C-201': { base: 8, intermedio: 28, final: 52, obs: 'Medios: prensa local (30) + radio regional (12) + TV autonómica (6) + prensa nacional (4)' },
      'C-202': { base: 24, intermedio: 110, final: 205, obs: 'RRSS: Facebook (80) + Instagram (60) + Twitter (45) + LinkedIn (20) publicaciones anuales' },
      'C-203': { base: 6, intermedio: 15, final: 26, obs: 'Web municipal: noticias mensuales + galería trimestral + informes semestrales' },
      'C-204': { base: 3, intermedio: 9, final: 16, obs: 'Materiales: 5 folletos + 4 vídeos + 3 infografías + 2 presentaciones + 2 exposiciones' },
      'C-205': { base: 2, intermedio: 7, final: 13, obs: 'Eventos: talleres familiares + charlas escolares + jornadas técnicas + rutas guiadas + ferias' },
      'C-206': { base: 1, intermedio: 4, final: 8, obs: 'Medios especializados: Revista Quercus + Congreso CONAMA + Boletín REDRURAL + Ecosostenible' },
      'C-207': { base: 1, intermedio: 3, final: 6, obs: 'Formación: Curso jardinería ecológica + Taller compostaje + Capacitación técnicos + Escuela sostenibilidad' },
      'C-208': { base: 45, intermedio: 220, final: 515, obs: 'Ciencia ciudadana: iNaturalist (300) + eBird (150) + Biodiversidad Virtual (65) registros' },
      'C-209': { base: 1, intermedio: 1, final: 2, obs: 'Estudios percepción: Encuesta inicial + Estudio sociológico final sobre aceptación social' },
      'C-210': { base: 2, intermedio: 5, final: 8, obs: 'Transferencia: Visitas Alcalá + Asesoría Aranjuez + Intercambio Leganés + Metodología publicada' },
      'C-211': { base: 180, intermedio: 1200, final: 3150, obs: 'Participación total: suma asistentes talleres + eventos + voluntariado + actividades escolares' },
      'C-301': { base: 1, intermedio: 2, final: 4, obs: 'Informes: 4 informes trimestrales + evaluación intermedia + informe final' },
      'C-302': { base: 1, intermedio: 1, final: 2, obs: 'Evaluaciones: Evaluación inicial LCA + Evaluación final impacto social y ambiental' },
      'C-303': { base: 0, intermedio: 3, final: 7, obs: 'Adaptaciones: cambio especies secas + mejora riego + nuevo sistema compostaje + señalización' },
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

  console.log('🎉 ¡INDICADORES C IMPLEMENTADOS EXITOSAMENTE - 100% COMPLETADO!');
  console.log(`📊 Resumen:`);
  console.log(`   • ${indicadoresC.length} Indicadores de Comunicación y Gobernanza (C) creados`);
  console.log(`   • ${indicadoresC.length} Conjuntos de valores de ejemplo`);
  console.log(`   • Proyecto asociado: ${proyecto.nombre}`);
  console.log('');
  console.log('🔍 Indicadores creados:');
  indicadoresC.forEach((ind, index) => {
    console.log(`   ${index + 1}. ${ind.codigo} - ${ind.indicador}`);
  });
  console.log('');
  console.log('🏆 ¡FELICIDADES! TODOS LOS INDICADORES DE LA FUNDACIÓN BIODIVERSIDAD HAN SIDO IMPLEMENTADOS');
}

main()
  .catch((e) => {
    console.error('❌ Error al implementar indicadores C:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });