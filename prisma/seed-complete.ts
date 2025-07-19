import { PrismaClient, CategoriaPrefijo, EscalaType, UnidadType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Mapeo de unidades del JSON a enums Prisma
const unidadMapping: { [key: string]: UnidadType } = {
  'm2': UnidadType.M2,
  'm²': UnidadType.M2,
  'Número': UnidadType.NUMERO,
  'Nº': UnidadType.NUMERO,
  'numero': UnidadType.NUMERO,
  '%': UnidadType.PORCENTAJE,
  'Nº y %': UnidadType.NUMERO_Y_PORCENTAJE,
  '€': UnidadType.EURO,
  'euro': UnidadType.EURO,
  'ha': UnidadType.HECTAREA,
  'km': UnidadType.KILOMETROS,
  'ml': UnidadType.KILOMETROS,
  'años': UnidadType.ANOS,
  'meses': UnidadType.MESES,
  'días': UnidadType.DIAS,
  'Si/No': UnidadType.SI_NO,
  'Puntuación': UnidadType.PUNTUACION,
  'puntuacion': UnidadType.PUNTUACION,
  'Índice': UnidadType.INDICE,
  'indice': UnidadType.INDICE,
  'µg/m³': UnidadType.OTRO,
  'dBA': UnidadType.OTRO,
  'Ton CO2/año': UnidadType.OTRO,
  'm³': UnidadType.OTRO,
  'L': UnidadType.OTRO,
  'kW': UnidadType.OTRO,
  'GEI': UnidadType.OTRO,
  '': UnidadType.OTRO
};

// Mapeo de escalas del JSON a enums Prisma  
const escalaMapping: { [key: string]: EscalaType } = {
  'Proyectos (B1, B2 y B3)': EscalaType.PROYECTO,
  'Proyecto (B2)': EscalaType.PROYECTO,
  'Proyecto (B1)': EscalaType.PROYECTO,
  'Proyecto (B3)': EscalaType.PROYECTO,
  'Proyecto (B4)': EscalaType.PROYECTO,
  'Proyecto (B1, B2, B3 y B4)': EscalaType.PROYECTO,
  'Proyectos (B1 y B2)': EscalaType.PROYECTO,
  'Proyectos (B2 y B3)': EscalaType.PROYECTO,
  'Proyectos (B1, B2 y B4)': EscalaType.PROYECTO,
  'Proyectos (B1, B3 y B4)': EscalaType.PROYECTO,
  'Municipal': EscalaType.MUNICIPAL,
  'Submunicipal': EscalaType.SUBMUNICIPAL,
  'Distrito': EscalaType.DISTRITO,
  'Barrio': EscalaType.BARRIO,
  '': EscalaType.PROYECTO
};

// Mapeo de categorías del JSON a enums Prisma
const categoriaMapping: { [key: string]: CategoriaPrefijo } = {
  'SUP': CategoriaPrefijo.SUP,
  'BDU': CategoriaPrefijo.BDU,
  'CON': CategoriaPrefijo.CON,
  'RES': CategoriaPrefijo.RES,
  'CBA': CategoriaPrefijo.CBA,
  'CBS': CategoriaPrefijo.CBS,
  'GEN': CategoriaPrefijo.GEN,
  'C': CategoriaPrefijo.C,
  'A': CategoriaPrefijo.A,
  'SEG': CategoriaPrefijo.SEG
};

interface IndicadorJSON {
  codigo: string;
  nombre: string;
  escala?: string;
  unidad?: string;
  origen_calculo?: string;
  categoria?: string;
}

async function main() {
  console.log('🌱 Iniciando seed completo con todos los indicadores oficiales...');

  // Leer el archivo JSON
  const jsonPath = path.join(process.cwd(), 'indicadores_fundacion_biodiversidad.json');
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // Limpiar datos existentes
  await prisma.valorSeguimiento.deleteMany();
  await prisma.valorIndicadorEstrategico.deleteMany();
  await prisma.valorIndicadorGeneral.deleteMany();
  await prisma.indicadorSeguimiento.deleteMany();
  await prisma.indicadorEstrategico.deleteMany();
  await prisma.indicadorGeneral.deleteMany();
  await prisma.proyecto.deleteMany();

  console.log('🗑️ Datos existentes eliminados');

  // Crear proyecto principal
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
      descripcion: 'Proyecto integral de renaturalización de espacios urbanos en Pinto según indicadores oficiales de la Fundación Biodiversidad.',
    },
  });

  console.log('✅ Proyecto creado:', proyecto.nombre);

  let contadores = {
    generales: 0,
    estrategicos: 0,
    seguimiento: 0,
    errores: 0
  };

  // Procesar indicadores generales
  console.log('📊 Procesando indicadores generales...');
  for (const indicador of jsonData.indicadores_generales.indicadores) {
    try {
      // Saltar indicadores sin código válido o duplicados
      if (!indicador.codigo || indicador.codigo.includes('SIN_CATEGORIA') || 
          indicador.nombre.includes('---') || indicador.nombre.includes('SEPARADOR')) {
        continue;
      }

      // Determinar categoría
      let categoria: CategoriaPrefijo = CategoriaPrefijo.SUP; // Default
      const codigoPartes = indicador.codigo.split('-');
      if (codigoPartes.length >= 2) {
        const prefijo = codigoPartes[0].trim() as keyof typeof categoriaMapping;
        if (categoriaMapping[prefijo]) {
          categoria = categoriaMapping[prefijo];
        }
      }

      // Si es categoría A, va a estratégicos
      if (categoria === CategoriaPrefijo.A) {
        await prisma.indicadorEstrategico.create({
          data: {
            codigo: indicador.codigo,
            indicador: indicador.nombre,
            escala: escalaMapping[indicador.escala || ''] || EscalaType.PROYECTO,
            unidad: unidadMapping[indicador.unidad || ''] || UnidadType.OTRO,
            origen_calculo: indicador.origen_calculo || null,
            objetivos_2025: null,
            observaciones: null,
            proyecto_id: proyecto.id,
          },
        });
        contadores.estrategicos++;
      } else {
        await prisma.indicadorGeneral.create({
          data: {
            codigo: indicador.codigo,
            categoria_prefijo: categoria,
            indicador: indicador.nombre,
            escala: escalaMapping[indicador.escala || ''] || EscalaType.PROYECTO,
            unidad: unidadMapping[indicador.unidad || ''] || UnidadType.OTRO,
            origen_calculo: indicador.origen_calculo || null,
            objetivos_2025: null,
            observaciones: null,
            proyecto_id: proyecto.id,
          },
        });
        contadores.generales++;
      }
    } catch (error) {
      console.error(`❌ Error procesando indicador ${indicador.codigo}:`, error);
      contadores.errores++;
    }
  }

  // Procesar indicadores estratégicos específicos
  console.log('🎯 Procesando indicadores estratégicos específicos...');
  for (const indicador of jsonData.indicadores_estrategicos.indicadores) {
    try {
      await prisma.indicadorEstrategico.create({
        data: {
          codigo: indicador.codigo,
          indicador: indicador.nombre,
          escala: EscalaType.MUNICIPAL,
          unidad: unidadMapping[indicador.unidad || 'Si/No'] || UnidadType.SI_NO,
          origen_calculo: indicador.origen_calculo || null,
          objetivos_2025: null,
          observaciones: null,
          proyecto_id: proyecto.id,
        },
      });
      contadores.estrategicos++;
    } catch (error) {
      console.error(`❌ Error procesando indicador estratégico ${indicador.codigo}:`, error);
      contadores.errores++;
    }
  }

  // Crear algunos indicadores de seguimiento de ejemplo
  console.log('📈 Creando indicadores de seguimiento de ejemplo...');
  const indicadoresSeguimiento = [
    {
      codigo: 'SEG-001',
      indicador: 'Porcentaje de ejecución del proyecto (%)',
      unidad: UnidadType.PORCENTAJE,
    },
    {
      codigo: 'SEG-002',
      indicador: 'Número de actividades de participación ciudadana realizadas',
      unidad: UnidadType.NUMERO,
    },
    {
      codigo: 'SEG-003',
      indicador: 'Presupuesto ejecutado acumulado',
      unidad: UnidadType.EURO,
    }
  ];

  for (const indicadorSeg of indicadoresSeguimiento) {
    try {
      const indicador = await prisma.indicadorSeguimiento.create({
        data: {
          codigo: indicadorSeg.codigo,
          indicador: indicadorSeg.indicador,
          escala: EscalaType.PROYECTO,
          unidad: indicadorSeg.unidad,
          origen_calculo: 'Seguimiento trimestral del proyecto',
          objetivos_2025: 'Cumplimiento de objetivos temporales',
          observaciones: 'Indicador de seguimiento generado automáticamente',
          proyecto_id: proyecto.id,
        },
      });

      // Crear valores de seguimiento trimestrales
      const trimestres = [
        { periodo: 'T1-2024', fecha: new Date('2024-03-31'), porcentaje: 25 },
        { periodo: 'T2-2024', fecha: new Date('2024-06-30'), porcentaje: 50 },
        { periodo: 'T3-2024', fecha: new Date('2024-09-30'), porcentaje: 75 },
        { periodo: 'T4-2024', fecha: new Date('2024-12-31'), porcentaje: 90 },
      ];

      for (const trimestre of trimestres) {
        await prisma.valorSeguimiento.create({
          data: {
            valor_numerico: indicadorSeg.codigo === 'SEG-001' ? trimestre.porcentaje : 
                           indicadorSeg.codigo === 'SEG-002' ? Math.floor(trimestre.porcentaje / 25) :
                           Math.floor(trimestre.porcentaje * 1000), // Presupuesto
            valor_texto: `Seguimiento ${trimestre.periodo} - Avance según cronograma`,
            fecha_medicion: trimestre.fecha,
            periodo_seguimiento: trimestre.periodo,
            observaciones: `Datos del trimestre ${trimestre.periodo}`,
            indicador_seguimiento_id: indicador.id,
          },
        });
      }

      contadores.seguimiento++;
    } catch (error) {
      console.error(`❌ Error procesando indicador de seguimiento:`, error);
      contadores.errores++;
    }
  }

  // Crear algunos valores de ejemplo para indicadores generales y estratégicos
  console.log('💾 Creando valores de ejemplo...');
  
  // Obtener algunos indicadores para crear valores
  const indicadoresGenerales = await prisma.indicadorGeneral.findMany({ take: 5 });
  const indicadoresEstrategicos = await prisma.indicadorEstrategico.findMany({ take: 3 });

  // Valores para indicadores generales
  for (const indGen of indicadoresGenerales) {
    await prisma.valorIndicadorGeneral.create({
      data: {
        valor_linea_base: Math.random() * 1000,
        valor_intermedio: Math.random() * 1500,
        valor_final: Math.random() * 2000,
        fecha_medicion: new Date('2024-06-15'),
        observaciones: `Valores de ejemplo para ${indGen.codigo}`,
        indicador_general_id: indGen.id,
      },
    });
  }

  // Valores para indicadores estratégicos
  for (const indEst of indicadoresEstrategicos) {
    await prisma.valorIndicadorEstrategico.create({
      data: {
        valor_si_no: Math.random() > 0.5,
        valor_numerico: Math.floor(Math.random() * 10),
        valor_texto: `Valor de ejemplo para ${indEst.codigo}`,
        fecha_medicion: new Date('2024-06-15'),
        observaciones: `Datos estratégicos de ${indEst.codigo}`,
        indicador_estrategico_id: indEst.id,
      },
    });
  }

  // Actualizar usuario existente
  const usuario = await prisma.user.findFirst({
    where: { email: 'admin@pinto.es' }
  });

  if (usuario) {
    await prisma.user.update({
      where: { id: usuario.id },
      data: { proyectoId: proyecto.id }
    });
    console.log('✅ Usuario actualizado con nuevo proyecto');
  }

  console.log('🌟 Seed completo exitoso!');
  console.log(`📊 Resumen de indicadores creados:`);
  console.log(`   • ${contadores.generales} Indicadores Generales`);
  console.log(`   • ${contadores.estrategicos} Indicadores Estratégicos`);
  console.log(`   • ${contadores.seguimiento} Indicadores de Seguimiento`);
  console.log(`   • ${contadores.errores} Errores encontrados`);
  console.log(`   • Total: ${contadores.generales + contadores.estrategicos + contadores.seguimiento} indicadores`);
  console.log(`   • Proyecto: ${proyecto.nombre}`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seeding completo:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });