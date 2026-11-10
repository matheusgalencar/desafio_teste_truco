const test = require('node:test');
const assert = require('node:assert/strict');
const { manilhaDaVira, compararCartas, vencedorDaVaza, vencedorDaMao, proximoValor, resolverPedido, pontuarMao, criarMao, jogarCarta } = require('../src/jogo.js');

const carta = (valor, naipe) => ({ valor, naipe });
const vira = carta('7', 'ouros'); // Q é a manilha

test('TR01: manilha circular da vira', () => {
  assert.equal(manilhaDaVira(carta('3', 'paus')), '4');
  assert.equal(manilhaDaVira(vira), 'Q');
});

test('TR02: manilhas vencem cartas comuns e seguem a ordem de naipes', () => {
  assert.equal(compararCartas(carta('Q', 'ouros'), carta('3', 'paus'), vira), 1);
  assert.equal(compararCartas(carta('Q', 'paus'), carta('Q', 'copas'), vira), 1);
  assert.equal(compararCartas(carta('Q', 'espadas'), carta('Q', 'ouros'), vira), 1);
});

test('TR03: cartas comuns iguais empatam; 3 vence 2', () => {
  assert.equal(compararCartas(carta('3', 'paus'), carta('3', 'ouros'), vira), 0);
  assert.equal(compararCartas(carta('3', 'ouros'), carta('2', 'paus'), vira), 1);
  assert.equal(compararCartas(carta('4', 'paus'), carta('A', 'ouros'), vira), -1);
});

test('TR04: vitória de vaza por dupla e empate entre duplas', () => {
  const jogadas = [
    { jogador: 0, carta: carta('3', 'ouros') },
    { jogador: 1, carta: carta('2', 'ouros') },
    { jogador: 2, carta: carta('4', 'ouros') },
    { jogador: 3, carta: carta('5', 'ouros') }
  ];
  assert.equal(vencedorDaVaza(jogadas, vira), 0);
  jogadas[1].carta = carta('3', 'copas');
  assert.equal(vencedorDaVaza(jogadas, vira), null);
});

test('TR05: duas vazas da mesma dupla encerram a mão', () => {
  assert.equal(vencedorDaMao([0]), undefined);
  assert.equal(vencedorDaMao([0, 0]), 0);
  assert.equal(vencedorDaMao([1, 1]), 1);
});

test('TR06: empates nas três posições obedecem ao desempate', () => {
  assert.equal(vencedorDaMao([null, 1]), 1);
  assert.equal(vencedorDaMao([null, null, 0]), 0);
  assert.equal(vencedorDaMao([0, null]), 0);
  assert.equal(vencedorDaMao([0, 1, null]), 0);
  assert.equal(vencedorDaMao([1, 0, null]), 1);
});

test('TR07: três empates não dão pontos', () => {
  assert.equal(vencedorDaMao([null, null, null]), null);
  assert.deepEqual(pontuarMao([4, 5], null, 3), [4, 5]);
});

test('TR08: escada de valores termina em 12', () => {
  assert.deepEqual([1, 3, 6, 9, 12].map(proximoValor), [3, 6, 9, 12, null]);
});

test('TR09: aceite sobe a aposta; recusa dá o valor anterior', () => {
  assert.deepEqual(resolverPedido({ valorAtual: 3, duplaSolicitante: 1, resposta: 'aceitar' }), { valor: 6, encerrada: false, pontosPara: null });
  assert.deepEqual(resolverPedido({ valorAtual: 3, duplaSolicitante: 1, resposta: 'correr' }), { valor: 3, encerrada: true, pontosPara: 1 });
});

test('TR10: pontuação soma sem alterar o placar original', () => {
  const pontos = [11, 2];
  assert.deepEqual(pontuarMao(pontos, 0, 3), [14, 2]);
  assert.deepEqual(pontos, [11, 2]);
});

const maos = () => [
  [carta('3','ouros'), carta('2','ouros'), carta('4','ouros')],
  [carta('2','copas'), carta('A','ouros'), carta('5','ouros')],
  [carta('3','espadas'), carta('K','ouros'), carta('6','ouros')],
  [carta('7','paus'), carta('J','ouros'), carta('4','paus')]
];

test('TR11: quatro mãos válidas; repetição e vira nas mãos são recusadas', () => {
  const jogo = criarMao({ maos: maos(), vira, jogadorInicial: 0 });
  assert.deepEqual(jogo.maos.map(m => m.length), [3,3,3,3]);
  assert.equal(jogo.jogadorAtual, 0);
  const repetidas = maos(); repetidas[1][0] = carta('3','ouros');
  assert.throws(() => criarMao({ maos: repetidas, vira, jogadorInicial: 0 }));
  const comVira = maos(); comVira[1][0] = carta('7','ouros');
  assert.throws(() => criarMao({ maos: comVira, vira, jogadorInicial: 0 }));
});

test('TR12: turno, posse da carta e liderança da vaza', () => {
  let jogo = criarMao({ maos: maos(), vira, jogadorInicial: 0 });
  assert.throws(() => jogarCarta(jogo, 1, carta('2','copas')));
  assert.throws(() => jogarCarta(jogo, 0, carta('6','paus')));
  for (const [jogador, jogada] of [[0,carta('3','ouros')],[1,carta('2','copas')],[2,carta('3','espadas')],[3,carta('7','paus')]]) {
    jogo = jogarCarta(jogo, jogador, jogada);
  }
  assert.deepEqual(jogo.vazas, [0]);
  assert.equal(jogo.jogadorAtual, 0);
  assert.equal(jogo.maos[0].length, 2);
});

test('TR13: duas vazas da dupla 0 encerram a mão', () => {
  let jogo = criarMao({ maos: maos(), vira, jogadorInicial: 0 });
  for (const [jogador, jogada] of [[0,carta('3','ouros')],[1,carta('2','copas')],[2,carta('3','espadas')],[3,carta('7','paus')],
    [0,carta('2','ouros')],[1,carta('A','ouros')],[2,carta('K','ouros')],[3,carta('J','ouros')]]) {
    jogo = jogarCarta(jogo, jogador, jogada);
  }
  assert.deepEqual(jogo.vazas, [0,0]);
  assert.equal(jogo.vencedor, 0);
});
