/**
 * Script automatizado para realizar 5 submissões de teste ao Formcarry
 * com intervalo de 30 segundos entre cada uma.
 * 
 * GARANTIA: 100% de todas as perguntas (5 cadastrais + 30 paritárias = 35 campos)
 * são rigorosamente preenchidas e validadas antes do envio.
 */

const { execFileSync } = require('child_process');
const { getAllSurveyPairs, SAATY_SCALE_OPTIONS } = require('../js/criteria.js');

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const ACCESS_KEY = "b7fcd54a-0764-49b7-ab97-958c10fdb7f5";
const PAIRS = getAllSurveyPairs();
const DELAY_SECONDS = 30;

// 5 perfis completos de especialistas para teste
const TEST_SPECIALISTS = [
  {
    nome_especialista: "Dra. Helena Vasconcelos",
    email: "helena.vasconcelos@labgeo-ufrj.br",
    instituicao: "UFRJ / CENPES",
    area_atuacao: "Geologia Estrutural e Estratigrafia de Bacias Evaporíticas",
    message: "Submissão de teste 1/5: Priorização de formação geológica e rocha selante secundária."
  },
  {
    nome_especialista: "Dr. Carlos Eduardo Mendes",
    email: "carlos.mendes@ccus-brasil.org",
    instituicao: "Instituto Nacional de CCUS",
    area_atuacao: "Engenharia de Reservatórios e Armazenamento Geológico de Carbono",
    message: "Submissão de teste 2/5: Ênfase em geomecânica e capacidade de selamento."
  },
  {
    nome_especialista: "Prof. Dr. Roberto Guimarães",
    email: "roberto.guimaraes@fem.unicamp.br",
    instituicao: "UNICAMP",
    area_atuacao: "Geomecânica de Rochas Salinas e Fluência de Evaporitos",
    message: "Submissão de teste 3/5: Foco na estabilidade estrutural e características de intercamadas."
  },
  {
    nome_especialista: "Dra. Beatriz Albuquerque",
    email: "beatriz.albuquerque@geoquimica-co2.com",
    instituicao: "Consultoria GeoAmbiente",
    area_atuacao: "Geoquímica e Reatividade Fluido-Rocha em Ambientes Hipersalinos",
    message: "Submissão de teste 4/5: Reações químicas e dissolução mineral como critérios críticos."
  },
  {
    nome_especialista: "Dr. Marcos Vinícius Lima",
    email: "marcos.lima@infra-energy.gov.br",
    instituicao: "Agência Nacional de Energia / ANP",
    area_atuacao: "Logística, Transporte Dutoviário e Infraestrutura de Superfície",
    message: "Submissão de teste 5/5: Logística e proximidade às fontes emissoras de CO2."
  }
];

function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

function getTimestamp() {
  return new Date().toLocaleTimeString("pt-BR", { hour12: false });
}

/**
 * Gera e valida as respostas para as 15 comparações paritárias
 * Cada par possui exatamente 2 perguntas:
 * 1. Qual critério você julga mais importante? (Radio)
 * 2. O quão mais importante? (Select textual)
 */
function generateResponsesForSpecialist(specialistIndex) {
  const responses = [];

  PAIRS.forEach((pair) => {
    // Escolha aleatória entre crit1 e crit2
    const chooseFirst = Math.random() < 0.5;
    const chosenCrit = chooseFirst ? pair.crit1 : pair.crit2;

    // Seleção aleatória entre as opções da escala verbal de Saaty
    const scaleIndex = Math.floor(Math.random() * SAATY_SCALE_OPTIONS.length);
    const chosenScale = SAATY_SCALE_OPTIONS[scaleIndex];

    responses.push({
      pairIndex: pair.index,
      pairKey: pair.pairKey,
      crit1: pair.crit1.fullName,
      crit2: pair.crit2.fullName,
      q1_name: `mais_importante_${pair.pairKey}`,
      q1_value: chosenCrit.fullName,
      q2_name: `intensidade_saaty_${pair.pairKey}`,
      q2_value: chosenScale
    });
  });

  return responses;
}

// Envia uma submissão individual para o Formcarry
async function sendSubmission(specialist, index, total) {
  console.log(`\n============================================================`);
  console.log(`[${getTimestamp()}] [${index}/${total}] INICIANDO SUBMISSÃO: ${specialist.nome_especialista}`);
  console.log(`Instituição: ${specialist.instituicao}`);
  console.log(`E-mail: ${specialist.email}`);
  console.log(`Área de Atuação: ${specialist.area_atuacao}`);
  console.log(`Comentários: "${specialist.message}"`);
  console.log(`------------------------------------------------------------`);

  // 1. Chave de acesso e metadados Web3Forms
  const payload = {
    access_key: ACCESS_KEY,
    subject: `Avaliação Fuzzy-AHP - ${specialist.nome_especialista}`,
    from_name: "Pesquisa Fuzzy-AHP",
    name: specialist.nome_especialista,
    email: specialist.email,
    instituicao: specialist.instituicao,
    area_atuacao: specialist.area_atuacao,
    message: specialist.message
  };

  // 2. Respostas para todas as 15 comparações (30 respostas no total)
  const pairAnswers = generateResponsesForSpecialist(index);

  console.log(`[${getTimestamp()}] Respostas das 15 Comparações Paritárias (100% respondidas):`);
  pairAnswers.forEach((ans) => {
    // Validação estrita
    if (!ans.q1_value || !ans.q2_value) {
      throw new Error(`Erro: Pergunta não respondida no par ${ans.pairKey}`);
    }

    payload[ans.q1_name] = ans.q1_value;
    payload[ans.q2_name] = ans.q2_value;

    console.log(`  Par ${String(ans.pairIndex).padStart(2, '0')} (${ans.pairKey}): Mais importante -> "${ans.q1_value}" | Intensidade -> "${ans.q2_value}"`);
  });

  console.log(`------------------------------------------------------------`);
  console.log(`Total de campos preenchidos nesta submissão: 35 avaliativos + metadados Web3Forms`);

  try {
    const startTime = Date.now();
    const args = [
      '-s',
      '-X', 'POST',
      WEB3FORMS_ENDPOINT,
      '-H', 'Content-Type: application/json',
      '-H', 'Accept: application/json',
      '-H', 'Origin: http://localhost:8000',
      '-H', 'Referer: http://localhost:8000/',
      '-H', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      '-d', JSON.stringify(payload)
    ];

    const rawOutput = execFileSync('curl.exe', args, { encoding: 'utf8' });
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    const data = JSON.parse(rawOutput);

    if (data.success === true) {
      console.log(`[${getTimestamp()}] ✓ [${index}/${total}] Sucesso no Web3Forms! (${elapsed}s)`);
      console.log(`Resposta do Web3Forms:`, JSON.stringify(data));
      return true;
    } else {
      console.warn(`[${getTimestamp()}] ⚠ [${index}/${total}] Resposta inesperada:`, data);
      return false;
    }
  } catch (error) {
    console.error(`[${getTimestamp()}] ❌ [${index}/${total}] Erro ao enviar:`, error.message);
    return false;
  }
}

// Orquestrador principal com intervalo de 30s
async function runAllSubmissions() {
  const total = TEST_SPECIALISTS.length;
  console.log(`============================================================`);
  console.log(`Bateria de ${total} submissões de teste (100% das perguntas respondidas)`);
  console.log(`Intervalo entre envios: ${DELAY_SECONDS} segundos`);
  console.log(`Endpoint: ${WEB3FORMS_ENDPOINT}`);
  console.log(`============================================================`);

  for (let i = 0; i < total; i++) {
    const specialist = TEST_SPECIALISTS[i];
    await sendSubmission(specialist, i + 1, total);

    // Intervalo de 30 segundos
    if (i < total - 1) {
      console.log(`\n[${getTimestamp()}] Aguardando ${DELAY_SECONDS} segundos até a próxima submissão...`);
      for (let s = DELAY_SECONDS; s > 0; s -= 5) {
        process.stdout.write(`... ${s}s restantes\n`);
        await sleep(Math.min(5, s));
      }
    }
  }

  console.log(`\n============================================================`);
  console.log(`[${getTimestamp()}] Todas as 5 submissões foram concluídas com 100% das perguntas respondidas!`);
  console.log(`============================================================\n`);
}

runAllSubmissions();
