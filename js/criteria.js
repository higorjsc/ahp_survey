/**
 * Definições dos Critérios, Subcritérios e Escala de Saaty para o método Fuzzy-AHP
 * Seleção de sítios para armazenamento de CO2 em cavernas de sal
 * Baseado na estrutura hierárquica do projeto (Critérios A a F e seus subcritérios)
 */

const CRITERIA = [
  {
    id: "A",
    code: "A",
    name: "Formação Geológica",
    fullName: "A. Formação Geológica",
    badgeColor: "#6f42c1",
    description: "Profundidade da formação, espessura útil, continuidade lateral e vertical, volume de intercamadas e heterogeneidades estratigráficas.",
    subcriteria: [
      {
        id: "A1",
        code: "A1",
        parentCode: "A",
        name: "Profundidade da formação",
        fullName: "A1. Profundidade da formação",
        description: "Profundidade do pacote salino para contenção e condições termodinâmicas adequadas."
      },
      {
        id: "A2",
        code: "A2",
        parentCode: "A",
        name: "Espessura útil",
        fullName: "A2. Espessura útil",
        description: "Espessura de sal disponível para a construção segura das cavernas de armazenamento."
      },
      {
        id: "A3",
        code: "A3",
        parentCode: "A",
        name: "Continuidade lateral e vertical",
        fullName: "A3. Continuidade lateral e vertical",
        description: "Extensão lateral e persistência vertical da unidade evaporítica."
      },
      {
        id: "A4",
        code: "A4",
        parentCode: "A",
        name: "Volume de intercamadas e heterogeneidades estratigráficas",
        fullName: "A4. Volume de intercamadas e heterogeneidades estratigráficas",
        description: "Presença e proporção volumétrica de litologias não-salinas intercaladas."
      }
    ]
  },
  {
    id: "B",
    code: "B",
    name: "Reações Química",
    fullName: "B. Reações Química",
    badgeColor: "#b02a37",
    description: "Teor de halita, impurezas insolúveis, sais altamente solúveis / baixa densidade, heterogeneidade composicional.",
    subcriteria: [
      {
        id: "B1",
        code: "B1",
        parentCode: "B",
        name: "Teor de halita",
        fullName: "B1. Teor de halita",
        description: "Grau de pureza mineral de NaCl essencial para a dissolução controlada e estabilidade."
      },
      {
        id: "B2",
        code: "B2",
        parentCode: "B",
        name: "Impurezas insolúveis",
        fullName: "B2. Impurezas insolúveis",
        description: "Teores de anidrita, folhelhos e insolúveis que afetam lixiviação e acúmulo no fundo da caverna."
      },
      {
        id: "B3",
        code: "B3",
        parentCode: "B",
        name: "Sais altamente solúveis / baixa densidade",
        fullName: "B3. Sais altamente solúveis / baixa densidade",
        description: "Presença de carnalita, taquidrita e sais de potássio/magnésio de rápida dissolução."
      },
      {
        id: "B4",
        code: "B4",
        parentCode: "B",
        name: "Heterogeneidade composicional",
        fullName: "B4. Heterogeneidade composicional",
        description: "Variação química e mineralógica ao longo do corpo salino."
      }
    ]
  },
  {
    id: "C",
    code: "C",
    name: "Geomecânica da Formação",
    fullName: "C. Geomecânica da Formação",
    badgeColor: "#997404",
    description: "Regime de tensões in situ, distância a falhas e bordas da camada, fraturamento e permeabilidade, gradiente geotermal e influência da temperatura.",
    subcriteria: [
      {
        id: "C1",
        code: "C1",
        parentCode: "C",
        name: "Regime de tensões in situ",
        fullName: "C1. Regime de tensões in situ",
        description: "Estado de tensões tridimensionais (tensão vertical e horizontais) atuantes na camada de sal."
      },
      {
        id: "C2",
        code: "C2",
        parentCode: "C",
        name: "Distância a falhas e bordas da camada",
        fullName: "C2. Distância a falhas e bordas da camada",
        description: "Afastamento de zonas de falhas ativas/críticas e limites laterais do domo/camada."
      },
      {
        id: "C3",
        code: "C3",
        parentCode: "C",
        name: "Fraturamento e permeabilidade",
        fullName: "C3. Fraturamento e permeabilidade",
        description: "Grau de micro/macrofraturamento e permeabilidade efetiva da rocha salina hospedeira."
      },
      {
        id: "C4",
        code: "C4",
        parentCode: "C",
        name: "Gradiente geotermal e influência da temperatura",
        fullName: "C4. Gradiente geotermal e influência da temperatura",
        description: "Temperatura in situ e sua influência na taxa de fluência (creep) e integridade da caverna."
      }
    ]
  },
  {
    id: "D",
    code: "D",
    name: "Características das Intercamadas",
    fullName: "D. Características das Intercamadas",
    badgeColor: "#087990",
    description: "Continuidade lateral, espessura, fraturamento e permeabilidade, resistência da rocha.",
    subcriteria: [
      {
        id: "D1",
        code: "D1",
        parentCode: "D",
        name: "Continuidade lateral",
        fullName: "D1. Continuidade lateral",
        description: "Extensão e persistência das intercalações não salinas ao longo do maciço."
      },
      {
        id: "D2",
        code: "D2",
        parentCode: "D",
        name: "Espessura",
        fullName: "D2. Espessura",
        description: "Dimensão vertical das camadas interestratificadas de anidrita, carbonatos ou folhelhos."
      },
      {
        id: "D3",
        code: "D3",
        parentCode: "D",
        name: "Fraturamento e permeabilidade",
        fullName: "D3. Fraturamento e permeabilidade",
        description: "Propensidade a fraturas e rotas preferenciais de escape nas intercamadas."
      },
      {
        id: "D4",
        code: "D4",
        parentCode: "D",
        name: "Resistência da rocha",
        fullName: "D4. Resistência da rocha",
        description: "Propriedades de resistência mecânica e contraste de rigidez com o sal circundante."
      }
    ]
  },
  {
    id: "E",
    code: "E",
    name: "Rocha selante secundária",
    fullName: "E. Rocha selante secundária",
    badgeColor: "#495057",
    description: "Continuidade lateral, espessura, fraturamento e permeabilidade, resistência da rocha.",
    subcriteria: [
      {
        id: "E1",
        code: "E1",
        parentCode: "E",
        name: "Continuidade lateral",
        fullName: "E1. Continuidade lateral",
        description: "Continuidade geográfica e integridade da formação selante sobrejacente/secundária."
      },
      {
        id: "E2",
        code: "E2",
        parentCode: "E",
        name: "Espessura",
        fullName: "E2. Espessura",
        description: "Espessura total do capeamento secundário para garantir barreira de segurança adicional."
      },
      {
        id: "E3",
        code: "E3",
        parentCode: "E",
        name: "Fraturamento e permeabilidade",
        fullName: "E3. Fraturamento e permeabilidade",
        description: "Condição de vedação, ausência de falhas abertas e baixíssima permeabilidade do selo."
      },
      {
        id: "E4",
        code: "E4",
        parentCode: "E",
        name: "Resistência da rocha",
        fullName: "E4. Resistência da rocha",
        description: "Capacidade mecânica do selante secundário de resistir a sobrepressões e deformações."
      }
    ]
  },
  {
    id: "F",
    code: "F",
    name: "Logística e condições do sítio",
    fullName: "F. Logística e condições do sítio",
    badgeColor: "#146c43",
    description: "Distância às fontes de CO2, infraestrutura de transporte, infraestrutura para construção/operação.",
    subcriteria: [
      {
        id: "F1",
        code: "F1",
        parentCode: "F",
        name: "Distância às fontes de CO₂",
        fullName: "F1. Distância às fontes de CO₂",
        description: "Proximidade de polos industriais e fontes concentradas de emissão de CO₂."
      },
      {
        id: "F2",
        code: "F2",
        parentCode: "F",
        name: "Infraestrutura de transporte",
        fullName: "F2. Infraestrutura de transporte",
        description: "Disponibilidade de malha de dutovias (pipelines), rodovias ou terminais marítimos."
      },
      {
        id: "F3",
        code: "F3",
        parentCode: "F",
        name: "Infraestrutura para construção/operação",
        fullName: "F3. Infraestrutura para construção/operação",
        description: "Acesso a água para dissolução salina, energia elétrica, descarte de salmoura e suporte operacional."
      }
    ]
  }
];

/**
 * Escala Fundamental de Saaty em formato textual (sem conversão numérica prévia)
 */
const SAATY_SCALE_OPTIONS = [
  "Igual importância",
  "Moderadamente superior",
  "Superior",
  "Muito Superior",
  "Extremamente superior"
];

/**
 * Gera todas as combinações paritárias únicas para uma lista de elementos (critérios ou subcritérios)
 */
function generatePairwiseCombinations(itemsList) {
  const pairs = [];
  let index = 1;
  for (let i = 0; i < itemsList.length; i++) {
    for (let j = i + 1; j < itemsList.length; j++) {
      pairs.push({
        index: index++,
        crit1: itemsList[i],
        crit2: itemsList[j],
        pairKey: `${itemsList[i].code}_vs_${itemsList[j].code}`
      });
    }
  }
  return pairs;
}

/**
 * Definição centralizada de todas as 9 etapas com nomes descritivos dos critérios e subcritérios
 */
const SURVEY_STEPS = [
  {
    stepIndex: 1,
    id: "step_intro_evaluator",
    type: "intro_evaluator",
    codeBadge: "1",
    badgeClass: "badge-criteria-global",
    category: "Etapa 1",
    navTitle: "Identificação",
    shortTitle: "Dados do Especialista",
    title: "Contexto & Identificação do Especialista",
    subtitle: "Objetivo da pesquisa, metodologia e informações para validação técnica",
    icon: "bi-person-badge-fill"
  },
  {
    stepIndex: 2,
    id: "step_criteria_global",
    type: "comparisons",
    groupKey: "GLOBAL",
    criterionCode: "GLOBAL",
    codeBadge: "A–F",
    badgeClass: "badge-criteria-global",
    category: "Macrocritérios",
    navTitle: "Critérios Gerais (A–F)",
    shortTitle: "Critérios Gerais (A a F)",
    badgeColor: "#0f4c81",
    title: "Julgamento dos Critérios Principais (A a F)",
    subtitle: "Avalie a importância relativa entre os 6 macrocritérios fundamentais",
    items: CRITERIA,
    pairs: generatePairwiseCombinations(CRITERIA),
    icon: "bi-diagram-3-fill"
  },
  {
    stepIndex: 3,
    id: "step_subcriteria_A",
    type: "comparisons",
    groupKey: "A",
    criterionCode: "A",
    codeBadge: "A",
    badgeClass: "badge-criteria-a",
    category: "Subcritérios",
    navTitle: "Formação Geológica",
    shortTitle: "Subcritérios: Formação Geológica",
    badgeColor: "#6f42c1",
    title: "Subcritérios do Critério A: Formação Geológica",
    subtitle: "Avalie a importância relativa entre os 4 subcritérios da Formação Geológica",
    criterionObj: CRITERIA[0],
    items: CRITERIA[0].subcriteria,
    pairs: generatePairwiseCombinations(CRITERIA[0].subcriteria),
    icon: "bi-layers-fill"
  },
  {
    stepIndex: 4,
    id: "step_subcriteria_B",
    type: "comparisons",
    groupKey: "B",
    criterionCode: "B",
    codeBadge: "B",
    badgeClass: "badge-criteria-b",
    category: "Subcritérios",
    navTitle: "Reações Químicas",
    shortTitle: "Subcritérios: Reações Químicas",
    badgeColor: "#b02a37",
    title: "Subcritérios do Critério B: Reações Química",
    subtitle: "Avalie a importância relativa entre os 4 subcritérios de Reações Químicas",
    criterionObj: CRITERIA[1],
    items: CRITERIA[1].subcriteria,
    pairs: generatePairwiseCombinations(CRITERIA[1].subcriteria),
    icon: "bi-droplet-half"
  },
  {
    stepIndex: 5,
    id: "step_subcriteria_C",
    type: "comparisons",
    groupKey: "C",
    criterionCode: "C",
    codeBadge: "C",
    badgeClass: "badge-criteria-c",
    category: "Subcritérios",
    navTitle: "Geomecânica",
    shortTitle: "Subcritérios: Geomecânica",
    badgeColor: "#997404",
    title: "Subcritérios do Critério C: Geomecânica da Formação",
    subtitle: "Avalie a importância relativa entre os 4 subcritérios da Geomecânica",
    criterionObj: CRITERIA[2],
    items: CRITERIA[2].subcriteria,
    pairs: generatePairwiseCombinations(CRITERIA[2].subcriteria),
    icon: "bi-activity"
  },
  {
    stepIndex: 6,
    id: "step_subcriteria_D",
    type: "comparisons",
    groupKey: "D",
    criterionCode: "D",
    codeBadge: "D",
    badgeClass: "badge-criteria-d",
    category: "Subcritérios",
    navTitle: "Intercamadas",
    shortTitle: "Subcritérios: Intercamadas",
    badgeColor: "#087990",
    title: "Subcritérios do Critério D: Características das Intercamadas",
    subtitle: "Avalie a importância relativa entre os 4 subcritérios das Intercamadas",
    criterionObj: CRITERIA[3],
    items: CRITERIA[3].subcriteria,
    pairs: generatePairwiseCombinations(CRITERIA[3].subcriteria),
    icon: "bi-segmented-nav"
  },
  {
    stepIndex: 7,
    id: "step_subcriteria_E",
    type: "comparisons",
    groupKey: "E",
    criterionCode: "E",
    codeBadge: "E",
    badgeClass: "badge-criteria-e",
    category: "Subcritérios",
    navTitle: "Rocha Selante",
    shortTitle: "Subcritérios: Rocha Selante",
    badgeColor: "#495057",
    title: "Subcritérios do Critério E: Rocha selante secundária",
    subtitle: "Avalie a importância relativa entre os 4 subcritérios da Rocha Selante",
    criterionObj: CRITERIA[4],
    items: CRITERIA[4].subcriteria,
    pairs: generatePairwiseCombinations(CRITERIA[4].subcriteria),
    icon: "bi-shield-check"
  },
  {
    stepIndex: 8,
    id: "step_subcriteria_F",
    type: "comparisons",
    groupKey: "F",
    criterionCode: "F",
    codeBadge: "F",
    badgeClass: "badge-criteria-f",
    category: "Subcritérios",
    navTitle: "Logística e Sítio",
    shortTitle: "Subcritérios: Logística",
    badgeColor: "#146c43",
    title: "Subcritérios do Critério F: Logística e condições do sítio",
    subtitle: "Avalie a importância relativa entre os 3 subcritérios de Logística",
    criterionObj: CRITERIA[5],
    items: CRITERIA[5].subcriteria,
    pairs: generatePairwiseCombinations(CRITERIA[5].subcriteria),
    icon: "bi-geo-alt-fill"
  },
  {
    stepIndex: 9,
    id: "step_review_submit",
    type: "review_submit",
    codeBadge: "✓",
    badgeClass: "badge-criteria-finish",
    category: "Etapa Final",
    navTitle: "Revisão e Envio",
    shortTitle: "Revisão e Envio",
    title: "Revisão Geral e Submissão",
    subtitle: "Resumo das respostas, considerações técnicas opcionais e envio",
    icon: "bi-send-check-fill"
  }
];

/**
 * Retorna todos os pares de comparação de todos os steps combinados (48 pares no total)
 */
function getAllSurveyPairs() {
  const allPairs = [];
  SURVEY_STEPS.forEach((step) => {
    if (step.type === "comparisons" && Array.isArray(step.pairs)) {
      step.pairs.forEach((pair) => {
        allPairs.push({
          ...pair,
          stepIndex: step.stepIndex,
          stepGroup: step.groupKey,
          stepTitle: step.title
        });
      });
    }
  });
  return allPairs;
}

// Exportação compatível com navegador e Node.js
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    CRITERIA,
    SAATY_SCALE_OPTIONS,
    SURVEY_STEPS,
    generatePairwiseCombinations,
    getAllSurveyPairs
  };
}
