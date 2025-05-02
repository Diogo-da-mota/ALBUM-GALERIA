# Lógica de Cálculo de Preços - Álbuns Fotográficos

## Visão Geral
Este documento descreve a lógica completa de cálculo de preços para os álbuns fotográficos, seguindo o fluxo de navegação do site: Galeria → Tamanho → Páginas.

## Valor Base Inicial: R$ 163,85
## 1. Etapa: Galeria (`/galeria`)

### Valor Base
- Cada modelo de álbum possui um **valor base fixo**
- Este valor representa o preço do álbum no tamanho padrão (15x15) com 15 lâminas (30 páginas)
- O valor base é exibido no card do modelo e armazenado para cálculos subsequentes
- **Este valor base DEVE ser mantido e usado como ponto de partida para todos os cálculos seguintes**

**Exemplo:**
- Modelo "Luxo Total" → Valor base: R$ 163,85

## 2. Etapa: Tamanho (`/tamanho`)

### Cálculo por Tamanho
- O usuário seleciona o tamanho físico do álbum (20x20, 25x25, 30x30, etc.)
- Cada tamanho possui um **fator de proporção** em relação ao tamanho padrão (15x15)
- O novo valor é calculado multiplicando o valor base (definido na galeria) pelo fator de proporção do tamanho escolhido
- **IMPORTANTE**: Sempre usar o valor base do álbum escolhido na galeria, nunca um valor diferente

**Fórmula:**
```
valor do tamanho = valor base da galeria × fator de proporção do tamanho
```

**Exemplo com Luxo Total:**
- Valor base da galeria: R$ 163,85
- Tamanho: 25x25
- Fator de proporção: 1.922
- Cálculo: 163,85 × 1.922 = R$ 315,05

**Exemplos de valores calculados para Luxo Total:**
- 15x15 (padrão): R$ 163,85 (valor base)
- 20x20: R$ 163,85 × 1.643 = R$ 269,21
- 25x25: R$ 163,85 × 1.922 = R$ 315,05
- 30x30: R$ 163,85 × 2.201 = R$ 360,63

## 3. Etapa: Páginas (`/paginas`)

### Cálculo de Páginas Extras
- Todo álbum inclui 15 lâminas (30 páginas) no valor base
- Páginas adicionais são calculadas com base no número de lâminas extras
- Cada lâmina extra tem um preço fixo, variando conforme o tamanho do álbum

**Fórmulas:**
```
lâminas extras = (páginas selecionadas / 2) - 15
custo adicional = lâminas extras × valor da lâmina (para o tamanho escolhido)
preço final = valor base com tamanho + custo adicional
```

**Exemplo:**
- Tamanho: 25x25
- Valor da lâmina: R$ 11,50
- Páginas escolhidas: 38
- Cálculo:
  - Lâminas extras: (38/2) - 15 = 4
  - Custo adicional: 4 × 11,50 = R$ 46,00
  - Valor anterior: R$ 315,05
  - Preço final: R$ 315,05 + R$ 46,00 = R$ 361,05

## Resumo do Fluxo de Cálculo

1. **Valor Base**: Definido na galeria (R$ 163,85 para Luxo Total), nunca muda
2. **Ajuste por Tamanho**: Multiplicação do valor base da galeria pelo fator de proporção
3. **Ajuste por Páginas**: Adição de custo para páginas extras
4. **Cálculo Progressivo**: Cada etapa usa o valor da etapa anterior como base

## Observações Importantes

- O valor base do álbum escolhido na galeria DEVE ser mantido como ponto de partida para todos os cálculos
- O sistema mantém o valor anterior como base para o próximo cálculo
- Todos os cálculos são feitos de forma progressiva
- O preço final reflete todas as escolhas do usuário ao longo do fluxo 