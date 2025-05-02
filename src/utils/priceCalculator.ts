// IMPORTANTE: Estes valores de referência agora são apenas fallbacks
// Os preços reais vêm do Supabase e são armazenados via localStorage
export const ALBUM_BASE_REFERENCE = {
  "Luxo Total": 163.85,
  "Napa Total": 163.85,
  "Estilo": 204.80,
  "Lapela": 221.19,
  "Premium": 446.30,
  "Vision": 216.27
};

// Proporção por Tamanho (relativa ao 10x15)
export const SIZE_PROPORTIONS = {
  "10x15": 1.000,
  "15x10": 1.000,
  "15x15": 1.034,
  "15x20": 1.075,
  "20x15": 1.075,
  "20x20": 1.699,
  "20x25": 1.743,
  "25x20": 1.743,
  "25x25": 1.987,
  "20x30": 1.816,
  "30x20": 1.816,
  "25x30": 2.209,
  "30x25": 2.209,
  "30x30": 2.577,
  "30x35": 2.872,
  "30x40": 2.946,
  "30x45": 3.093,
  "35x25": 3.242,
  "35x30": 3.316,
  "35x35": 4.423,
  "40x30": 3.462,
  "40x40": 4.585,
  "45x30": 3.685
};

/**
 * Cálculo do Valor das Lâminas
 * 
 * Cada tamanho de álbum tem um valor fixo por lâmina:
 * - 10x15 e 15x10: R$ 4,84
 * - 15x15, 15x20 e 20x15: R$ 7,26
 * - 20x20: R$ 8,74
 * - 20x25 e 25x20: R$ 9,20
 * - 25x25: R$ 11,49
 * - 20x30 e 30x20: R$ 10,89
 * - 25x30 e 30x25: R$ 12,10
 * - 30x30: R$ 13,55
 * - 30x35: R$ 14,52
 * - 30x40: R$ 18,15
 * - 30x45: R$ 22,38
 * - 35x25: R$ 24,20
 * - 35x30: R$ 25,41
 * - 35x35: R$ 41,14
 * - 40x30: R$ 26,62
 * - 40x40: R$ 43,56
 * - 45x30: R$ 30,25
 * 
 * Estes valores são fixos e serão multiplicados pelo
 * número de lâminas escolhido pelo cliente.
 */

// Valor base por lâmina para cada tamanho (valores fixos)
export const BASE_SHEET_PRICES = {
  "10x15": 4.84,
  "15x10": 4.84,
  "15x15": 7.26,
  "15x20": 7.26,
  "20x15": 7.26,
  "20x20": 8.74,
  "20x25": 9.20,
  "25x20": 9.20,
  "25x25": 11.49,
  "20x30": 10.89,
  "30x20": 10.89,
  "25x30": 12.10,
  "30x25": 12.10,
  "30x30": 13.55,
  "30x35": 14.52,
  "30x40": 18.15,
  "30x45": 22.38,
  "35x25": 24.20,
  "35x30": 25.41,
  "35x35": 41.14,
  "40x30": 26.62,
  "40x40": 43.56,
  "45x30": 30.25
};

interface AlbumPricing {
  valor_base: number;
  reajuste_base: number;
  reajuste_lamina: number;
}

/**
 * Calcula o preço ajustado do tamanho com base na proporção e reajuste
 * @param basePrice Valor base do álbum
 * @param proportion Proporção do tamanho
 * @param reajusteBase Percentual de reajuste sobre a proporção
 * @returns Preço ajustado
 */
const calculateAdjustedSizePrice = (
  basePrice: number,
  proportion: number,
  reajusteBase: number
): number => {
  // Primeiro aplica a proporção ao valor base
  const precoComProporcao = basePrice * proportion;
  
  // Depois aplica o reajuste sobre o preço proporcional
  const precoFinal = precoComProporcao * (1 + reajusteBase / 100);
  
  // Retorna o preço final arredondado para 2 casas decimais
  return Number(precoFinal.toFixed(2));
};

/**
 * Calcula o preço ajustado das lâminas com base no reajuste
 * @param baseSheetPrice Valor base da lâmina
 * @param numberOfSheets Quantidade de lâminas
 * @param reajusteLamina Percentual de reajuste sobre as lâminas
 * @returns Preço ajustado das lâminas
 */
const calculateAdjustedSheetPrice = (
  baseSheetPrice: number,
  numberOfSheets: number,
  reajusteLamina: number
): number => {
  // Log para depuração: Verificar argumentos recebidos
  console.log(`   -> [priceCalculator] calculateAdjustedSheetPrice: BaseSheetPrice=${baseSheetPrice}, Sheets=${numberOfSheets}, ReajusteLamina=${reajusteLamina}%`);
  
  // Calcula o valor ajustado da lâmina
  const valorLaminaAjustado = baseSheetPrice * (1 + reajusteLamina / 100);
  
  // Retorna o preço total das lâminas
  return Number((valorLaminaAjustado * numberOfSheets).toFixed(2));
};

/**
 * Fluxo de Preços Atualizado
 * 
 * 1. Na página inicial, o usuário seleciona um álbum cujo preço vem do Supabase
 * 2. Esse preço base é salvo no localStorage
 * 3. Na página de tamanho, usamos esse preço base dinâmico (não mais a constante)
 *    para calcular os preços dos diferentes tamanhos
 * 4. Na página de lâminas/páginas, calculamos o valor adicional por lâmina
 *    com base nos preços fixos de lâmina para cada tamanho
 */

// Função para calcular o preço baseado no modelo e tamanho
export const calculateSizePrice = (
  albumModel: string, 
  size: string, 
  customBasePrice?: number,
  reajusteBase: number = 0
): number => {
  // Obter o valor base do modelo (usar customBasePrice se fornecido)
  const basePrice = customBasePrice !== undefined 
    ? customBasePrice 
    : (ALBUM_BASE_REFERENCE[albumModel as keyof typeof ALBUM_BASE_REFERENCE] || 0);
  
  // Obter a proporção do tamanho
  const proportion = SIZE_PROPORTIONS[size as keyof typeof SIZE_PROPORTIONS] || 1;
  
  // Calcular o preço com o reajuste
  return calculateAdjustedSizePrice(basePrice, proportion, reajusteBase);
};

// Função para calcular o preço das lâminas adicionais
export const calculateSheetPrice = (
  size: string, 
  numberOfSheets: number,
  reajusteLamina: number = 0
): number => {
  // Log para depuração: Verificar argumentos recebidos pela função exportada
  console.log(`  -> [priceCalculator] calculateSheetPrice chamado com: Size=${size}, Sheets=${numberOfSheets}, ReajusteLamina=${reajusteLamina}%`);
  
  // Obter o valor base da lâmina para o tamanho específico
  const baseSheetPrice = BASE_SHEET_PRICES[size as keyof typeof BASE_SHEET_PRICES] || 0;
  
  // Calcular o preço com o reajuste (chamando a função interna)
  return calculateAdjustedSheetPrice(baseSheetPrice, numberOfSheets, reajusteLamina);
};

// Função para calcular o preço total do álbum
export const calculateTotalPrice = (
  sizePrice: number,
  sheetsPrice: number,
  laminationPrice: number = 0,
  casePrice: number = 0
): number => {
  return Number((sizePrice + sheetsPrice + laminationPrice + casePrice).toFixed(2));
};
