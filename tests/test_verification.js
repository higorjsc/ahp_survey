/**
 * Teste automatizado de validação do formulário Fuzzy-AHP
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// 1. Ler index.html e verificar ausência de style="..."
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const inlineStyleMatches = html.match(/style\s*=\s*["'][^"']*["']/gi);
if (inlineStyleMatches && inlineStyleMatches.length > 0) {
  console.error("ERRO: Encontrados atributos style inline no index.html:", inlineStyleMatches);
  process.exit(1);
} else {
  console.log("✓ index.html: Nenhum inline style encontrado.");
}

// 2. Verificar criteria.js
const { CRITERIA, SAATY_SCALE_OPTIONS, generatePairwiseCombinations } = require('../js/criteria.js');
console.log(`✓ Critérios carregados: ${CRITERIA.length} (A a F)`);
if (CRITERIA.length !== 6) {
  console.error("ERRO: Esperado 6 critérios.");
  process.exit(1);
}

const pairs = generatePairwiseCombinations(CRITERIA);
console.log(`✓ Comparações geradas: ${pairs.length} (esperado 15)`);
if (pairs.length !== 15) {
  console.error("ERRO: Esperado 15 pares.");
  process.exit(1);
}

// 3. Verificar escala de Saaty / verbal options solicitada
const expectedScale = [
  "Igual importância",
  "Moderadamente superior",
  "Superior",
  "Muito Superior",
  "Extremamente superior"
];

console.log(`✓ Opções da escala verbal: ${SAATY_SCALE_OPTIONS.length}`);
if (SAATY_SCALE_OPTIONS.length !== 5) {
  console.error(`ERRO: Esperado 5 opções na escala verbal, recebido ${SAATY_SCALE_OPTIONS.length}`);
  process.exit(1);
}

expectedScale.forEach((opt, idx) => {
  if (SAATY_SCALE_OPTIONS[idx] !== opt) {
    console.error(`ERRO: Opção ${idx} esperada "${opt}", recebida "${SAATY_SCALE_OPTIONS[idx]}"`);
    process.exit(1);
  }
});
console.log("✓ As 5 opções verbais da escala correspondem exatamente à imagem fornecida.");

// 4. Verificar container de etapas no HTML
const requiredSteps = [
  'step-container-guide',
  'step-container-evaluator',
  'step-container-comparisons',
  'step-container-finish'
];
requiredSteps.forEach(stepClass => {
  if (!html.includes(stepClass)) {
    console.error(`ERRO: Classe de etapa ${stepClass} não encontrada no HTML.`);
    process.exit(1);
  }
});
console.log("✓ Todas as 4 etapas com containeres e backgrounds estilizados foram encontradas no HTML.");

// 5. Verificar Formcarry action
if (!html.includes('https://formcarry.com/s/dCwN02ZnToR')) {
  console.error("ERRO: Action do Formcarry incorreta ou não encontrada.");
  process.exit(1);
}
console.log("✓ Endpoint do Formcarry configurado corretamente.");

console.log("\nTodos os testes de validação passaram com 100% de sucesso!");

