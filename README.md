# Desafio: testes de Truco Paulista

## Colaboradores

- Matheus Goulart de Alencar 24131995-2
- Miguel Falcão Costacurta 24011302-2

## Especificação adotada

Partida de **quatro jogadores em duas duplas**: jogadores `0` e `2` contra `1` e `3`. Usa baralho de 40 cartas (valores `4,5,6,7,Q,J,K,A,2,3`; naipes `ouros,espadas,copas,paus`), três cartas por jogador e uma vira. A próxima carta na sequência circular `4,5,6,7,Q,J,K,A,2,3` determina as manilhas. Entre elas, a força é `paus > copas > espadas > ouros`; entre cartas comuns, a força é `3 > 2 > A > K > J > Q > 7 > 6 > 5 > 4`, sem desempate por naipe.

Cada mão tem até três vazas. Cada jogador joga uma carta por vaza, seguindo a ordem circular. A vaza é ganha pela dupla da carta mais forte; cartas comuns de mesmo valor em duplas opostas empatam. Duas vitórias de vaza encerram a mão. Se a primeira empatar, vence a mão quem ganhar primeiro a segunda ou terceira. Se uma dupla ganhar a primeira e a segunda ou terceira empatar, essa dupla vence. Com uma vitória para cada dupla e empate na terceira, vence quem ganhou a primeira. Três vazas empatadas deixam a mão sem pontuação. O valor inicial da mão é 1; pedidos aceitos elevam a 3, 6, 9 e 12. Se a dupla adversária recusar, a dupla que pediu recebe o valor anterior. A partida termina quando uma dupla atinge ou ultrapassa 12 pontos.

Para referência das regras, consulte o [regulamento da CAASP](https://www.caasp.org.br/ESP/Tabelas/Truco/Regulamento.pdf). Onde houver variação regional, prevalece a especificação descrita aqui.

## API implementada em `src/jogo.js`

Exportações CommonJS:

- `manilhaDaVira(vira)`: retorna o valor da manilha.
- `compararCartas(a, b, vira)`: retorna `1`, `0` ou `-1` conforme `a` ganhe, empate ou perca para `b`. Carta é `{ valor, naipe }`.
- `vencedorDaVaza(jogadas, vira)`: `jogadas` é lista de quatro objetos `{ jogador, carta }`; retorna `0`, `1` (índice da dupla) ou `null` (empate).
- `vencedorDaMao(vazas)`: lista de até três resultados de `vencedorDaVaza`; retorna `0`, `1`, `null` se a mão terminou empatada ou `undefined` se ainda não terminou.
- `proximoValor(valor)`: retorna `3`, `6`, `9`, `12` para valores `1`, `3`, `6`, `9`; no valor `12`, retorna `null`.
- `resolverPedido({ valorAtual, duplaSolicitante, resposta })`: `resposta` é `aceitar` ou `correr`; retorna `{ valor, encerrada, pontosPara }`, em que `pontosPara` é `null` se aceita ou o índice da dupla solicitante se recusada.
- `pontuarMao(pontos, duplaVencedora, valor)`: retorna novo placar `[dupla0, dupla1]`, sem alterar o argumento; `duplaVencedora: null` não pontua.
- `criarMao({ maos, vira, jogadorInicial })`: `maos` é lista de quatro mãos com três cartas cada, sem cartas repetidas nem carta igual à vira; retorna estado com `{ maos, jogadorAtual, vazas, vencedor }`. `vazas` começa como `[]`; `vencedor` começa como `undefined`.
- `jogarCarta(estado, jogador, carta)`: joga carta da mão do jogador da vez e retorna o estado atualizado; carta ausente ou jogador fora da vez lança `Error`. Após quatro jogadas, registra o resultado da vaza em `vazas`. A próxima vaza começa pelo jogador da carta mais forte da vaza; em empate de força dentro da dupla vencedora, começa quem a jogou primeiro. Se a vaza empatar entre duplas, começa quem iniciou a vaza. Ao decidir a mão, `vencedor` passa a `0`, `1` ou `null`.

## Casos de teste

| ID | Cenário e resultado esperado |
| --- | --- |
| TR01 | Vira `3` produz manilha `4`; vira `7` produz `Q`. |
| TR02 | Manilha vence qualquer carta comum; naipes de manilha seguem a ordem especificada. |
| TR03 | Cartas comuns de mesmo valor empatam apesar do naipe; `3` vence `2`. |
| TR04 | Vaza atribui vitória à dupla do jogador mais forte ou empate entre duplas. |
| TR05 | Duas vazas vencidas pela mesma dupla encerram a mão. |
| TR06 | Empates na primeira, segunda ou terceira vaza seguem as regras descritas. |
| TR07 | Três empates não pontuam. |
| TR08 | Escada de pedidos 1→3→6→9→12; não há pedido acima de 12. |
| TR09 | Aceite altera valor; recusa dá ao solicitante o valor anterior. |
| TR10 | Pontuação acumula até 12 e mantém o placar de entrada intacto. |
| TR11 | Quatro jogadores recebem três cartas; carta repetida e vira na mão são rejeitadas. |
| TR12 | Apenas jogador da vez joga carta própria; após quatro jogadas, vaza é registrada e o próximo líder é definido. |
| TR13 | Duas vazas vencidas pela mesma dupla fecham a mão. |

## Como os testes funcionam

`tests/jogo.test.js` executa `src/jogo.js` com cartas fixas, resultados de vazas e duas rodadas completas. Execute `npm test` com Node.js 20 ou superior. **Resultado verificado: 13 testes aprovados.**
