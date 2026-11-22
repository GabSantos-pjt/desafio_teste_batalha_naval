# desafio_teste_batalha_naval

## Batalha Naval (10 x 10)

Desafio proposto por **Cayque**: casos de teste para o tabuleiro **10 x 10** da **Batalha Naval**, em JavaScript para testar JavaScript.

### Frota de cada jogador
| Navio | Casas |
|---|---|
| 1 Porta-aviões | 5 |
| 1 Encouraçado | 4 |
| 1 Submarino | 3 |
| 1 Destroier ou Hidroavião | 2 |

### Regras implementadas (`src/batalhaNaval.js`)
- Navios posicionados na horizontal (`H`) ou vertical (`V`), sem sair do tabuleiro e sem sobreposição.
- Cada tipo de navio só pode ser posicionado uma vez; a frota completa ocupa 14 casas.
- Tiros retornam `agua`, `acerto` ou `afundou`; não se atira duas vezes na mesma casa.
- Conversão de coordenadas `A1` a `J10`.
- Partida para 2 jogadores com turnos alternados; vence quem afundar toda a frota adversária.

---

## Estrutura

```
desafio_teste_batalha_naval/
├── src/batalhaNaval.js          # implementação do jogo
├── test/batalhaNaval.test.js   # casos de teste
└── package.json
```

## Como executar os testes

Requisito: **Node.js 18 ou superior** (os testes usam o executor nativo `node:test` e `node:assert` — não há dependências para instalar).

```bash
npm test
```

ou diretamente:

```bash
node --test
```

## Funcionamento dos casos de teste

- Os testes ficam em `test/batalhaNaval.test.js` e usam `describe`/`it` do módulo nativo `node:test`, com asserções de `node:assert/strict`.
- Cada caso de teste tem um identificador (`CTxx`) e está agrupado por funcionalidade.
- Onde o jogo usa sorteio, os testes injetam um **gerador pseudoaleatório com semente** ou uma **configuração fixa**, para que os resultados sejam sempre reproduzíveis.
- Casos de erro verificam que a exceção correta é lançada (`assert.throws`).
- Ao rodar `npm test`, o Node lista cada caso como `ok` (passou) ou `not ok` (falhou) e mostra o total no final.

### Lista de casos de teste (23 casos)

| ID | Grupo | O que é verificado |
|---|---|---|
| CT01 | Tabuleiro e frota | tabuleiro é 10 x 10 e começa vazio |
| CT02 | Tabuleiro e frota | frota tem 4 navios com tamanhos 5, 4, 3 e 2 |
| CT03 | Tabuleiro e frota | frota completa ocupa 14 casas |
| CT04 | Tabuleiro e frota | navio na horizontal ocupa casas para a direita |
| CT05 | Tabuleiro e frota | navio na vertical ocupa casas para baixo |
| CT06 | Tabuleiro e frota | porta-aviões cabe exatamente encostado na borda (coluna 5 a 9) |
| CT07 | Tabuleiro e frota | navio que ultrapassa a borda é rejeitado |
| CT08 | Tabuleiro e frota | navios não podem se sobrepor |
| CT09 | Tabuleiro e frota | cada tipo de navio só pode ser posicionado uma vez |
| CT10 | Tabuleiro e frota | tipo e orientação inválidos são rejeitados |
| CT11 | Tiros | tiro na água retorna "agua" |
| CT12 | Tiros | tiro em navio retorna "acerto" |
| CT13 | Tiros | último acerto no navio retorna "afundou" |
| CT14 | Tiros | porta-aviões precisa de 5 acertos para afundar |
| CT15 | Tiros | não é permitido atirar duas vezes na mesma casa |
| CT16 | Tiros | tiro fora do tabuleiro lança erro |
| CT17 | Tiros | não é permitido atirar antes da frota completa |
| CT18 | Tiros | todos afundados somente após as 14 casas atingidas |
| CT19 | Coordenadas A1..J10 | converte coordenadas válidas |
| CT20 | Coordenadas A1..J10 | rejeita coordenadas inválidas |
| CT21 | Partida entre 2 jogadores | partida só começa com as duas frotas completas |
| CT22 | Partida entre 2 jogadores | turnos se alternam entre os jogadores |
| CT23 | Partida entre 2 jogadores | jogador que afunda toda a frota adversária vence |

## Colaborador(es)

| Nome | R.A. | GitHub |
|---|---|---|
| Gabriel Santos Furlanette | 24000873-2 | [@GabSantos-pjt](https://github.com/GabSantos-pjt) |
