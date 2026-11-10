const valores = ['4','5','6','7','Q','J','K','A','2','3'];
const naipes = ['ouros','espadas','copas','paus'];
const id = carta => `${carta.valor}:${carta.naipe}`;
const cartaValida = carta => carta && valores.includes(carta.valor) && naipes.includes(carta.naipe);

function manilhaDaVira(vira) {
  if (!cartaValida(vira)) throw new TypeError('Vira inválida');
  return valores[(valores.indexOf(vira.valor) + 1) % valores.length];
}

function forca(carta, vira) {
  if (!cartaValida(carta)) throw new TypeError('Carta inválida');
  return carta.valor === manilhaDaVira(vira) ? 10 + naipes.indexOf(carta.naipe) : valores.indexOf(carta.valor);
}

function compararCartas(a, b, vira) { return Math.sign(forca(a, vira) - forca(b, vira)); }

function vencedorDaVaza(jogadas, vira) {
  if (!Array.isArray(jogadas) || jogadas.length !== 4 || new Set(jogadas.map(j => j.jogador)).size !== 4 || jogadas.some(j => !Number.isInteger(j.jogador) || j.jogador < 0 || j.jogador > 3)) throw new RangeError('A vaza exige quatro jogadores');
  const maior = Math.max(...jogadas.map(j => forca(j.carta, vira)));
  const duplas = new Set(jogadas.filter(j => forca(j.carta, vira) === maior).map(j => j.jogador % 2));
  return duplas.size === 1 ? [...duplas][0] : null;
}

function vencedorDaMao(vazas) {
  if (!Array.isArray(vazas) || vazas.length > 3 || vazas.some(v => v !== 0 && v !== 1 && v !== null)) throw new TypeError('Resultados de vazas inválidos');
  if (vazas.length < 2) return undefined;
  const [a, b, c] = vazas;
  if (a !== null && (a === b || b === null)) return a;
  if (a === null && b !== null) return b;
  if (vazas.length < 3) return undefined;
  if (a !== null && c === null) return a;
  return c;
}

function proximoValor(valor) { return ({ 1: 3, 3: 6, 6: 9, 9: 12, 12: null })[valor] ?? null; }

function resolverPedido({ valorAtual, duplaSolicitante, resposta }) {
  if (![0,1].includes(duplaSolicitante) || !['aceitar','correr'].includes(resposta) || ![1,3,6,9].includes(valorAtual)) throw new Error('Pedido inválido');
  return resposta === 'aceitar'
    ? { valor: proximoValor(valorAtual), encerrada: false, pontosPara: null }
    : { valor: valorAtual, encerrada: true, pontosPara: duplaSolicitante };
}

function pontuarMao(pontos, duplaVencedora, valor) {
  if (!Array.isArray(pontos) || pontos.length !== 2 || pontos.some(p => !Number.isInteger(p) || p < 0) || ![0,1,null].includes(duplaVencedora) || ![1,3,6,9,12].includes(valor)) throw new TypeError('Pontuação inválida');
  const novo = [...pontos];
  if (duplaVencedora !== null) novo[duplaVencedora] += valor;
  return novo;
}

function criarMao({ maos, vira, jogadorInicial }) {
  if (!cartaValida(vira) || !Array.isArray(maos) || maos.length !== 4 || maos.some(m => !Array.isArray(m) || m.length !== 3) || !Number.isInteger(jogadorInicial) || jogadorInicial < 0 || jogadorInicial > 3) throw new RangeError('Mão inválida');
  const cartas = [vira, ...maos.flat()];
  if (cartas.some(c => !cartaValida(c)) || new Set(cartas.map(id)).size !== 13) throw new RangeError('Cartas repetidas ou inválidas');
  return { maos: maos.map(m => m.map(c => ({ ...c }))), vira: { ...vira }, jogadorAtual: jogadorInicial, inicioVaza: jogadorInicial, jogadasAtuais: [], vazas: [], vencedor: undefined };
}

function jogarCarta(jogo, jogador, carta) {
  if (jogo.vencedor !== undefined || jogo.jogadorAtual !== jogador || !cartaValida(carta)) throw new Error('Jogada fora do turno ou mão encerrada');
  const indice = jogo.maos[jogador].findIndex(c => id(c) === id(carta));
  if (indice < 0) throw new Error('Carta não pertence à mão');
  jogo.jogadasAtuais.push({ jogador, carta: jogo.maos[jogador].splice(indice, 1)[0] });
  if (jogo.jogadasAtuais.length < 4) { jogo.jogadorAtual = (jogador + 1) % 4; return jogo; }
  const resultado = vencedorDaVaza(jogo.jogadasAtuais, jogo.vira);
  jogo.vazas.push(resultado);
  const maior = Math.max(...jogo.jogadasAtuais.map(j => forca(j.carta, jogo.vira)));
  const lider = resultado === null ? jogo.inicioVaza : jogo.jogadasAtuais.find(j => j.jogador % 2 === resultado && forca(j.carta, jogo.vira) === maior).jogador;
  jogo.jogadasAtuais = [];
  jogo.vencedor = vencedorDaMao(jogo.vazas);
  jogo.inicioVaza = lider;
  jogo.jogadorAtual = lider;
  return jogo;
}

module.exports = { manilhaDaVira, compararCartas, vencedorDaVaza, vencedorDaMao, proximoValor, resolverPedido, pontuarMao, criarMao, jogarCarta };
