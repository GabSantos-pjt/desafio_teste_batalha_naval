'use strict';

const TAMANHO = 10;

/** Frota obrigatória de cada jogador. */
const NAVIOS = Object.freeze({
  PORTA_AVIOES: { nome: 'Porta-aviões', tamanho: 5 },
  ENCOURACADO: { nome: 'Encouraçado', tamanho: 4 },
  SUBMARINO: { nome: 'Submarino', tamanho: 3 },
  DESTROIER: { nome: 'Destroier/Hidroavião', tamanho: 2 },
});

const RESULTADO = Object.freeze({ AGUA: 'agua', ACERTO: 'acerto', AFUNDOU: 'afundou' });

/** Converte coordenada estilo "A1".."J10" em [linha, coluna]. */
function coordenada(texto) {
  const m = /^([A-Ja-j])(10|[1-9])$/.exec(String(texto).trim());
  if (!m) throw new RangeError(`Coordenada inválida: ${texto}`);
  return [m[1].toUpperCase().charCodeAt(0) - 65, Number(m[2]) - 1];
}

class Tabuleiro {
  constructor() {
    this.grade = Array.from({ length: TAMANHO }, () => Array(TAMANHO).fill(null)); // id do navio ou null
    this.tiros = Array.from({ length: TAMANHO }, () => Array(TAMANHO).fill(false));
    this.navios = new Map(); // tipo -> { tipo, tamanho, casas:[[l,c]], acertos }
  }

  static validarPosicao(l, c) {
    if (!Number.isInteger(l) || !Number.isInteger(c) || l < 0 || c < 0 || l >= TAMANHO || c >= TAMANHO) {
      throw new RangeError(`Posição fora do tabuleiro: (${l}, ${c})`);
    }
  }

  /**
   * Posiciona um navio.
   * @param {keyof NAVIOS} tipo
   * @param {number} linha  linha inicial (0-9)
   * @param {number} coluna coluna inicial (0-9)
   * @param {'H'|'V'} orientacao H = para a direita, V = para baixo
   */
  posicionar(tipo, linha, coluna, orientacao) {
    const def = NAVIOS[tipo];
    if (!def) throw new Error(`Tipo de navio inválido: ${tipo}`);
    if (this.navios.has(tipo)) throw new Error(`${def.nome} já foi posicionado`);
    if (orientacao !== 'H' && orientacao !== 'V') throw new Error('Orientação deve ser H ou V');

    const casas = [];
    for (let i = 0; i < def.tamanho; i++) {
      const l = orientacao === 'V' ? linha + i : linha;
      const c = orientacao === 'H' ? coluna + i : coluna;
      Tabuleiro.validarPosicao(l, c);
      if (this.grade[l][c] !== null) throw new Error(`Sobreposição com ${NAVIOS[this.grade[l][c]].nome}`);
      casas.push([l, c]);
    }
    casas.forEach(([l, c]) => (this.grade[l][c] = tipo));
    this.navios.set(tipo, { tipo, tamanho: def.tamanho, casas, acertos: 0 });
    return casas;
  }

  frotaCompleta() {
    return Object.keys(NAVIOS).every((t) => this.navios.has(t));
  }

  /** Recebe um tiro. Retorna 'agua', 'acerto' ou 'afundou'. */
  receberTiro(l, c) {
    Tabuleiro.validarPosicao(l, c);
    if (!this.frotaCompleta()) throw new Error('A frota ainda não está completa');
    if (this.tiros[l][c]) throw new Error('Essa posição já foi atacada');
    this.tiros[l][c] = true;
    const tipo = this.grade[l][c];
    if (tipo === null) return RESULTADO.AGUA;
    const navio = this.navios.get(tipo);
    navio.acertos++;
    return navio.acertos === navio.tamanho ? RESULTADO.AFUNDOU : RESULTADO.ACERTO;
  }

  afundado(tipo) {
    const n = this.navios.get(tipo);
    return !!n && n.acertos === n.tamanho;
  }

  todosAfundados() {
    return this.frotaCompleta() && [...this.navios.keys()].every((t) => this.afundado(t));
  }

  casasOcupadas() {
    return this.grade.flat().filter((x) => x !== null).length;
  }
}

/** Partida entre 2 jogadores com turnos alternados. */
class Partida {
  constructor() {
    this.tabuleiros = [new Tabuleiro(), new Tabuleiro()];
    this.vez = 0;
    this.vencedor = null;
  }

  iniciada() {
    return this.tabuleiros.every((t) => t.frotaCompleta());
  }

  atirar(jogador, l, c) {
    if (this.vencedor !== null) throw new Error('A partida já terminou');
    if (!this.iniciada()) throw new Error('Ambos os jogadores devem posicionar a frota');
    if (jogador !== this.vez) throw new Error('Não é a vez deste jogador');
    const alvo = this.tabuleiros[1 - jogador];
    const resultado = alvo.receberTiro(l, c);
    if (alvo.todosAfundados()) this.vencedor = jogador;
    else this.vez = 1 - jogador;
    return resultado;
  }
}

module.exports = { Tabuleiro, Partida, NAVIOS, RESULTADO, TAMANHO, coordenada };
