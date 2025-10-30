const fs = require('fs');
const path = require('path');

// Coordenadas de Uberlândia, MG
const UBERLANDIA_CENTER = {
  lat: -18.9186,
  lng: -48.2772
};

// Raio aproximado de Uberlândia (em graus)
const RADIUS = 0.05; // aproximadamente 5.5 km

// Função para gerar coordenadas aleatórias dentro de Uberlândia
function generateRandomCoordinate() {
  const randomAngle = Math.random() * 2 * Math.PI;
  const randomRadius = Math.random() * RADIUS;

  const lat = UBERLANDIA_CENTER.lat + (randomRadius * Math.cos(randomAngle));
  const lng = UBERLANDIA_CENTER.lng + (randomRadius * Math.sin(randomAngle));

  return {
    lat: parseFloat(lat.toFixed(6)),
    lng: parseFloat(lng.toFixed(6))
  };
}

// Caminho para o arquivo JSON
const jsonPath = path.join(__dirname, '..', 'src', 'assets', 'data', 'airtable_startups.json');

// Ler o arquivo JSON
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// Adicionar coordenadas a cada startup
const updatedData = data.map(startup => {
  // Se já tiver coordenadas, mantém
  if (startup.latitude && startup.longitude) {
    return startup;
  }

  // Caso contrário, gera novas coordenadas
  const coords = generateRandomCoordinate();
  return {
    ...startup,
    latitude: coords.lat,
    longitude: coords.lng
  };
});

// Salvar o arquivo atualizado
fs.writeFileSync(jsonPath, JSON.stringify(updatedData, null, 2), 'utf-8');

console.log(`✅ Coordenadas adicionadas a ${updatedData.length} startups!`);
console.log(`📍 Arquivo atualizado: ${jsonPath}`);
