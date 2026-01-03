const fs = require('fs');

// Ler os arquivos JSON
const airtableData = JSON.parse(fs.readFileSync('./airtable_startups.json', 'utf8'));
const empresasData = JSON.parse(fs.readFileSync('./empresas_tech_uberlandia.json.backup', 'utf8'));

console.log(`Total de startups no Airtable: ${airtableData.length}`);
console.log(`Total de empresas tech: ${empresasData.length}`);

// Definir categorias e cores dos pins
const CATEGORIES = {
  TECH_COMPANY: {
    name: 'Empresas de base tecnológica',
    emoji: '🏢',
    color: '#4A90E2', // Azul
    icon: 'building'
  },
  STARTUP: {
    name: 'Startups',
    emoji: '🚀',
    color: '#FF6B6B', // Vermelho
    icon: 'rocket'
  },
  COWORKING: {
    name: 'Coworkings, salas empresariais e espaços de inovação',
    emoji: '🏠',
    color: '#FFA07A', // Laranja claro
    icon: 'home'
  },
  TECH_POLE: {
    name: 'Polos de Tecnologia & ICT´s',
    emoji: '🏦',
    color: '#9B59B6', // Roxo
    icon: 'landmark'
  },
  ACCELERATOR: {
    name: 'Aceleradoras, Incubadoras e ventures (VC, VB e outros)',
    emoji: '🔥',
    color: '#E74C3C', // Vermelho forte
    icon: 'fire'
  },
  SUPPORT_ENTITY: {
    name: 'Entidades/iniciativas de representação e apoio',
    emoji: '🤝',
    color: '#3498DB', // Azul claro
    icon: 'handshake'
  },
  ACADEMY: {
    name: 'Academia/Instituições de ensino',
    emoji: '📚',
    color: '#2ECC71', // Verde
    icon: 'book'
  },
  TRAINING: {
    name: 'Programas de Capacitação / Formação de talentos',
    emoji: '👩🏻‍💻',
    color: '#F39C12', // Amarelo/Laranja
    icon: 'laptop-code'
  },
  CORPORATE: {
    name: 'Corporates/Grandes empresas que relacionam com ecossistema',
    emoji: '👔',
    color: '#34495E', // Cinza escuro
    icon: 'briefcase'
  }
};

// Função para classificar baseada em palavras-chave e dados
function categorizeEntity(entity, isFromAirtable = false) {
  const name = (entity.name || entity.STARTUP || '').toLowerCase();
  const types = (entity.types || '').toLowerCase();
  const address = (entity.address || entity["Qual o local ou endereço da sua startup?"] || '').toLowerCase();
  const solution = (entity.solucao || entity.SOLUÇÃO || '').toLowerCase();
  const businessModel = (entity.modelo_negocio || entity["Modelo de negócio da startup"] || '').toLowerCase();
  const phase = (entity.fase_atual || entity["Fase atual da sua startup"] || '').toLowerCase();

  // Academia/Instituições de ensino
  if (
    name.includes('universidade') ||
    name.includes('faculdade') ||
    name.includes('escola') ||
    name.includes('centro universitário') ||
    name.includes('ufu') ||
    name.includes('uniube') ||
    name.includes('unitri') ||
    name.includes('senai') ||
    name.includes('senac') ||
    name.includes('sesi') ||
    types.includes('university') ||
    types.includes('school')
  ) {
    return 'ACADEMY';
  }

  // Programas de Capacitação
  if (
    name.includes('curso') ||
    name.includes('treinamento') ||
    name.includes('capacitação') ||
    name.includes('formação') ||
    name.includes('bootcamp') ||
    solution.includes('capacitação') ||
    solution.includes('treinamento') ||
    solution.includes('educação')
  ) {
    return 'TRAINING';
  }

  // Coworkings e Espaços
  if (
    name.includes('coworking') ||
    name.includes('co-working') ||
    name.includes('espaço') ||
    name.includes('hub') && !name.includes('uber') ||
    name.includes('labs') ||
    name.includes('innovation center') ||
    types.includes('coworking')
  ) {
    return 'COWORKING';
  }

  // Aceleradoras, Incubadoras e VCs
  if (
    name.includes('aceleradora') ||
    name.includes('incubadora') ||
    name.includes('venture') ||
    name.includes('capital') ||
    name.includes('investimento') ||
    name.includes('vc') ||
    name.includes('fundo')
  ) {
    return 'ACCELERATOR';
  }

  // Entidades de Apoio
  if (
    name.includes('associação') ||
    name.includes('federação') ||
    name.includes('sindicato') ||
    name.includes('sebrae') ||
    name.includes('acim') ||
    name.includes('CDL') ||
    name.includes('fiemg') ||
    name.includes('entidade') ||
    name.includes('apoio')
  ) {
    return 'SUPPORT_ENTITY';
  }

  // Polos de Tecnologia
  if (
    name.includes('polo') ||
    name.includes('parque tecnológico') ||
    name.includes('parque científico') ||
    name.includes('ict') ||
    name.includes('instituto de ciência')
  ) {
    return 'TECH_POLE';
  }

  // Corporates/Grandes empresas
  if (
    name.includes('s.a.') ||
    name.includes('s/a') ||
    entity.colaboradores?.includes('100+') ||
    entity.colaboradores?.includes('500+') ||
    entity.Colaboradores?.includes('100+') ||
    entity.Colaboradores?.includes('500+') ||
    (entity.total_ratings && entity.total_ratings > 100)
  ) {
    return 'CORPORATE';
  }

  // Startups (do Airtable ou com características de startup)
  if (
    isFromAirtable ||
    phase.includes('validação') ||
    phase.includes('traction') ||
    phase.includes('escala') ||
    phase.includes('operação') ||
    businessModel.includes('saas') ||
    businessModel.includes('marketplace') ||
    businessModel.includes('plataforma') ||
    (entity.recebeu_investimento && entity.recebeu_investimento !== 'Nenhum')
  ) {
    return 'STARTUP';
  }

  // Empresas de base tecnológica (padrão)
  return 'TECH_COMPANY';
}

// Função para normalizar nomes
function normalizeName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/gi, '');
}

// Criar mapa de empresas por nome normalizado
const empresasMap = new Map();
empresasData.forEach(empresa => {
  const normalizedName = normalizeName(empresa.name);
  empresasMap.set(normalizedName, empresa);
});

// Criar mapa de startups por nome normalizado
const startupsMap = new Map();
airtableData.forEach(startup => {
  const normalizedName = normalizeName(startup.STARTUP || '');
  startupsMap.set(normalizedName, startup);
});

console.log('\n=== ANÁLISE DE CORRESPONDÊNCIAS ===\n');

// Encontrar correspondências
const matches = [];
const empresasSemMatch = [];
const startupsSemMatch = [];

empresasData.forEach(empresa => {
  const normalizedName = normalizeName(empresa.name);
  const startup = startupsMap.get(normalizedName);

  if (startup) {
    matches.push({ empresa, startup });
  } else {
    empresasSemMatch.push(empresa);
  }
});

airtableData.forEach(startup => {
  const normalizedName = normalizeName(startup.STARTUP || '');
  const empresa = empresasMap.get(normalizedName);

  if (!empresa) {
    startupsSemMatch.push(startup);
  }
});

console.log(`✓ Correspondências encontradas: ${matches.length}`);
console.log(`✗ Empresas sem match no Airtable: ${empresasSemMatch.length}`);
console.log(`✗ Startups sem match em Empresas Tech: ${startupsSemMatch.length}`);

// Fazer merge dos dados com categorização
console.log('\n=== REALIZANDO MERGE COM CATEGORIZAÇÃO ===\n');

const mergedData = empresasData.map(empresa => {
  const normalizedName = normalizeName(empresa.name);
  const startup = startupsMap.get(normalizedName);

  if (startup) {
    // Merge: adiciona dados do Airtable à empresa
    const merged = {
      ...empresa,
      solucao: startup.SOLUÇÃO || empresa.solucao,
      segmento_principal: startup["Segmento principal"] || empresa.segmento_principal,
      segmento_copy: startup["Segmento principal copy"] || empresa.segmento_copy,
      fase_atual: startup["Fase atual da sua startup"] || empresa.fase_atual,
      colaboradores: startup.Colaboradores || empresa.colaboradores,
      publico_alvo: startup["Público-alvo"] || empresa.publico_alvo,
      modelo_negocio: startup["Modelo de negócio da startup"] || empresa.modelo_negocio,
      recebeu_investimento: startup["A startup já recebeu investimento?"] || empresa.recebeu_investimento,
      investidor_local: startup["O investidor foi de Uberlândia ou de fora?"] || empresa.investidor_local,
      latitude: empresa.latitude || startup.latitude,
      longitude: empresa.longitude || startup.longitude,
      website: empresa.website || startup.Site,
      imagem: startup.Imagem || empresa.imagem,
      data_source: 'merged'
    };

    // Categorizar
    const category = categorizeEntity(merged, true);
    merged.categoria = CATEGORIES[category].name;
    merged.categoria_emoji = CATEGORIES[category].emoji;
    merged.pin_color = CATEGORIES[category].color;
    merged.icon = CATEGORIES[category].icon;

    return merged;
  }

  // Categorizar empresa sem merge
  const category = categorizeEntity(empresa, false);
  return {
    ...empresa,
    data_source: 'empresas_tech_only',
    categoria: CATEGORIES[category].name,
    categoria_emoji: CATEGORIES[category].emoji,
    pin_color: CATEGORIES[category].color,
    icon: CATEGORIES[category].icon
  };
});

// Adicionar startups que não estão nas empresas
const startupsToAdd = startupsSemMatch
  .filter(startup => startup.latitude && startup.longitude)
  .map(startup => {
    const entity = {
      name: startup.STARTUP,
      address: startup["Qual o local ou endereço da sua startup?"] || '',
      latitude: startup.latitude,
      longitude: startup.longitude,
      rating: null,
      total_ratings: null,
      phone: null,
      website: startup.Site || null,
      types: 'startup',
      place_id: null,
      maps_url: null,
      opening_hours: null,
      solucao: startup.SOLUÇÃO,
      segmento_principal: startup["Segmento principal"],
      segmento_copy: startup["Segmento principal copy"],
      fase_atual: startup["Fase atual da sua startup"],
      colaboradores: startup.Colaboradores,
      publico_alvo: startup["Público-alvo"],
      modelo_negocio: startup["Modelo de negócio da startup"],
      recebeu_investimento: startup["A startup já recebeu investimento?"],
      investidor_local: startup["O investidor foi de Uberlândia ou de fora?"],
      imagem: startup.Imagem,
      data_source: 'airtable_only'
    };

    // Categorizar
    const category = categorizeEntity(entity, true);
    entity.categoria = CATEGORIES[category].name;
    entity.categoria_emoji = CATEGORIES[category].emoji;
    entity.pin_color = CATEGORIES[category].color;
    entity.icon = CATEGORIES[category].icon;

    return entity;
  });

const finalData = [...mergedData, ...startupsToAdd];

// Estatísticas por categoria
console.log('\n=== ESTATÍSTICAS POR CATEGORIA ===\n');
const categoryStats = {};
Object.keys(CATEGORIES).forEach(key => {
  const count = finalData.filter(e => e.categoria === CATEGORIES[key].name).length;
  categoryStats[CATEGORIES[key].emoji + ' ' + CATEGORIES[key].name] = count;
  console.log(`${CATEGORIES[key].emoji} ${CATEGORIES[key].name}: ${count}`);
});

console.log(`\n✅ Total de registros após merge: ${finalData.length}`);
console.log(`- Registros com dados mesclados: ${mergedData.filter(e => e.data_source === 'merged').length}`);
console.log(`- Registros apenas de empresas_tech: ${mergedData.filter(e => e.data_source === 'empresas_tech_only').length}`);
console.log(`- Registros adicionados do Airtable: ${startupsToAdd.length}`);

// Salvar o resultado
fs.writeFileSync('./empresas_tech_uberlandia_categorized.json', JSON.stringify(finalData, null, 2));
console.log('\n✓ Arquivo salvo: empresas_tech_uberlandia_categorized.json');

// Gerar relatório detalhado
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    total_records: finalData.length,
    merged_records: mergedData.filter(e => e.data_source === 'merged').length,
    empresas_tech_only: mergedData.filter(e => e.data_source === 'empresas_tech_only').length,
    airtable_only: startupsToAdd.length
  },
  categories: categoryStats,
  color_legend: Object.keys(CATEGORIES).map(key => ({
    categoria: CATEGORIES[key].emoji + ' ' + CATEGORIES[key].name,
    cor: CATEGORIES[key].color,
    icon: CATEGORIES[key].icon
  })),
  matches: matches.map(m => ({
    nome_empresa: m.empresa.name,
    nome_startup: m.startup.STARTUP
  }))
};

fs.writeFileSync('./merge-categorized-report.json', JSON.stringify(report, null, 2));
console.log('✓ Relatório salvo: merge-categorized-report.json\n');
