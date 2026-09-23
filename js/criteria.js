/**
 * Definições dos Critérios e Escala de Saaty para o método Fuzzy-AHP
 * Seleção de sítios para armazenamento de CO2 em cavernas de sal
 */

const CRITERIA = [
  {
    id: "A",
    code: "A",
    name: "Formação Geológica",
    fullName: "A. Formação Geológica",
    badgeColor: "#6f42c1",
    description: "Profundidade da formação, espessura útil, continuidade lateral e vertical, volume de intercamadas e heterogeneidades estratigráficas."
  },
  {
    id: "B",
    code: "B",
    name: "Reações Química",
    fullName: "B. Reações Química",
    badgeColor: "#b02a37",
    description: "Teor de halita, impurezas insolúveis, sais altamente solúveis / baixa densidade, heterogeneidade composicional."
  },
  {
    id: "C",
    code: "C",
    name: "Geomecânica da Formação",
    fullName: "C. Geomecânica da Formação",
    badgeColor: "#997404",
    description: "Regime de tensões in situ, distância a falhas e bordas da camada, fraturamento e permeabilidade, gradiente geotermal e influência da temperatura."
  },
  {
    id: "D",
    code: "D",
    name: "Características das Intercamadas",
    fullName: "D. Características das Intercamadas",
    badgeColor: "#087990",
    description: "Continuidade lateral, espessura, fraturamento e permeabilidade, resistência da rocha."
  },
  {
    id: "E",
    code: "E",
    name: "Rocha selante secundária",
    fullName: "E. Rocha selante secundária",
    badgeColor: "#495057",
    description: "Continuidade lateral, espessura, fraturamento e permeabilidade, resistência da rocha."
  },
  {
    id: "F",
    code: "F",
    name: "Logística e condições do sítio",
    fullName: "F. Logística e condições do sítio",
    badgeColor: "#146c43",
    description: "Distância às fontes de CO2, infraestrutura de transporte, infraestrutura para construção/operação."
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
 * Gera todas as combinações paritárias únicas (15 pares para 6 critérios: A vs B, A vs C, etc.)
 */
function generatePairwiseCombinations(criteriaList) {
  const pairs = [];
  let index = 1;
  for (let i = 0; i < criteriaList.length; i++) {
    for (let j = i + 1; j < criteriaList.length; j++) {
      pairs.push({
        index: index++,
        crit1: criteriaList[i],
        crit2: criteriaList[j],
        pairKey: `${criteriaList[i].code}_vs_${criteriaList[j].code}`
      });
    }
  }
  return pairs;
}

// Exportação compatível com navegador e Node.js
if (typeof module !== "undefined" && module.exports) {
  module.exports = { CRITERIA, SAATY_SCALE_OPTIONS, generatePairwiseCombinations };
}
