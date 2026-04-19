const fs = require('fs');

// Ler os arquivos JSON
const airtableData = JSON.parse(fs.readFileSync('./airtable_startups.json', 'utf8'));
const empresasData = JSON.parse(fs.readFileSync('./empresas_tech_uberlandia.json', 'utf8'));

console.log(`Total de startups no Airtable: ${airtableData.length}`);
console.log(`Total de empresas tech: ${empresasData.length}`);

// Função para normalizar nomes (remove espaços extras, caracteres especiais, deixa minúsculo)
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

// Mostrar algumas correspondências
if (matches.length > 0) {
  console.log('\n=== EXEMPLOS DE CORRESPONDÊNCIAS ===\n');
  matches.slice(0, 5).forEach(match => {
    console.log(`- "${match.empresa.name}" ↔ "${match.startup.STARTUP}"`);
  });
}

// Fazer merge dos dados
console.log('\n=== REALIZANDO MERGE ===\n');

const mergedData = empresasData.map(empresa => {
  const normalizedName = normalizeName(empresa.name);
  const startup = startupsMap.get(normalizedName);

  if (startup) {
    // Merge: adiciona dados do Airtable à empresa
    return {
      ...empresa,
      // Dados do Airtable
      solucao: startup.SOLUÇÃO || empresa.solucao,
      segmento_principal: startup["Segmento principal"] || empresa.segmento_principal,
      segmento_copy: startup["Segmento principal copy"] || empresa.segmento_copy,
      fase_atual: startup["Fase atual da sua startup"] || empresa.fase_atual,
      colaboradores: startup.Colaboradores || empresa.colaboradores,
      publico_alvo: startup["Público-alvo"] || empresa.publico_alvo,
      modelo_negocio: startup["Modelo de negócio da startup"] || empresa.modelo_negocio,
      recebeu_investimento: startup["A startup já recebeu investimento?"] || empresa.recebeu_investimento,
      investidor_local: startup["O investidor foi de Uberlândia ou de fora?"] || empresa.investidor_local,
      // Atualizar coordenadas se não existirem
      latitude: empresa.latitude || startup.latitude,
      longitude: empresa.longitude || startup.longitude,
      // Manter site existente ou adicionar do Airtable
      website: empresa.website || startup.Site,
      // Adicionar imagem se disponível
      imagem: startup.Imagem || empresa.imagem,
      // Marcar como merged
      data_source: 'merged'
    };
  }

  return {
    ...empresa,
    data_source: 'empresas_tech_only'
  };
});

// Adicionar startups que não estão nas empresas
const startupsToAdd = startupsSemMatch
  .filter(startup => startup.latitude && startup.longitude) // Só adiciona se tiver coordenadas
  .map(startup => ({
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
    // Dados exclusivos do Airtable
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
  }));

const finalData = [...mergedData, ...startupsToAdd];

console.log(`Total de registros após merge: ${finalData.length}`);
console.log(`- Registros com dados mesclados: ${mergedData.filter(e => e.data_source === 'merged').length}`);
console.log(`- Registros apenas de empresas_tech: ${mergedData.filter(e => e.data_source === 'empresas_tech_only').length}`);
console.log(`- Registros adicionados do Airtable: ${startupsToAdd.length}`);

// Salvar o resultado
fs.writeFileSync('./empresas_tech_uberlandia_merged.json', JSON.stringify(finalData, null, 2));
console.log('\n✓ Arquivo salvo: empresas_tech_uberlandia_merged.json');

// Gerar relatório detalhado
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    total_records: finalData.length,
    merged_records: mergedData.filter(e => e.data_source === 'merged').length,
    empresas_tech_only: mergedData.filter(e => e.data_source === 'empresas_tech_only').length,
    airtable_only: startupsToAdd.length
  },
  matches: matches.map(m => ({
    nome_empresa: m.empresa.name,
    nome_startup: m.startup.STARTUP
  })),
  empresas_sem_match: empresasSemMatch.map(e => e.name).slice(0, 20),
  startups_sem_match: startupsSemMatch.map(s => s.STARTUP).slice(0, 20)
};

fs.writeFileSync('./merge-report.json', JSON.stringify(report, null, 2));
console.log('✓ Relatório salvo: merge-report.json\n');
