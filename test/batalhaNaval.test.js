'use strict';

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { Tabuleiro, Partida, NAVIOS, RESULTADO, TAMANHO, coordenada } = require('../src/batalhaNaval');

/** Frota padrão usada nos testes:
 *  Porta-aviões A1..A5 | Encouraçado C1..C4 | Submarino E1..E3 | Destroier J9..J10 */
function montarFrota(t) {
  t.posicionar('PORTA_AVIOES', 0, 0, 'H');
  t.posicionar('ENCOURACADO', 2, 0, 'H');
  t.posicionar('SUBMARINO', 4, 0, 'H');
  t.posicionar('DESTROIER', 9, 8, 'H');
  return t;
}

describe('Tabuleiro e frota', () => {
  it('CT01 - tabuleiro é 10 x 10 e começa vazio', () => {
    const t = new Tabuleiro();
    assert.equal(TAMANHO, 10);
    assert.equal(t.grade.length, 10);
    t.grade.forEach((l) => assert.equal(l.length, 10));
    assert.equal(t.casasOcupadas(), 0);
  });

  it('CT02 - frota tem 4 navios com tamanhos 5, 4, 3 e 2', () => {
    assert.deepEqual(
      Object.values(NAVIOS).map((n) => n.tamanho),
      [5, 4, 3, 2]
    );
  });

  it('CT03 - frota completa ocupa 14 casas', () => {
    const t = montarFrota(new Tabuleiro());
    assert.ok(t.frotaCompleta());
    assert.equal(t.casasOcupadas(), 14);
  });

  it('CT04 - navio na horizontal ocupa casas para a direita', () => {
    const t = new Tabuleiro();
    assert.deepEqual(t.posicionar('SUBMARINO', 3, 2, 'H'), [[3, 2], [3, 3], [3, 4]]);
  });

  it('CT05 - navio na vertical ocupa casas para baixo', () => {
    const t = new Tabuleiro();
    assert.deepEqual(t.posicionar('DESTROIER', 5, 7, 'V'), [[5, 7], [6, 7]]);
  });

  it('CT06 - porta-aviões cabe exatamente encostado na borda (coluna 5 a 9)', () => {
    const t = new Tabuleiro();
    assert.doesNotThrow(() => t.posicionar('PORTA_AVIOES', 0, 5, 'H'));
  });

  it('CT07 - navio que ultrapassa a borda é rejeitado', () => {
    const t = new Tabuleiro();
    assert.throws(() => t.posicionar('PORTA_AVIOES', 0, 6, 'H'), RangeError);
    assert.throws(() => t.posicionar('ENCOURACADO', 7, 0, 'V'), RangeError);
    assert.equal(t.casasOcupadas(), 0, 'nenhuma casa deve ficar ocupada após erro');
  });

  it('CT08 - navios não podem se sobrepor', () => {
    const t = new Tabuleiro();
    t.posicionar('PORTA_AVIOES', 2, 0, 'H');
    assert.throws(() => t.posicionar('SUBMARINO', 0, 2, 'V'), /Sobreposição/);
  });

  it('CT09 - cada tipo de navio só pode ser posicionado uma vez', () => {
    const t = new Tabuleiro();
    t.posicionar('SUBMARINO', 0, 0, 'H');
    assert.throws(() => t.posicionar('SUBMARINO', 5, 5, 'H'), /já foi posicionado/);
  });

  it('CT10 - tipo e orientação inválidos são rejeitados', () => {
    const t = new Tabuleiro();
    assert.throws(() => t.posicionar('CANOA', 0, 0, 'H'), /Tipo de navio inválido/);
    assert.throws(() => t.posicionar('SUBMARINO', 0, 0, 'D'), /Orientação/);
  });
});

describe('Tiros', () => {
  let t;
  beforeEach(() => (t = montarFrota(new Tabuleiro())));

  it('CT11 - tiro na água retorna "agua"', () => {
    assert.equal(t.receberTiro(7, 7), RESULTADO.AGUA);
  });

  it('CT12 - tiro em navio retorna "acerto"', () => {
    assert.equal(t.receberTiro(0, 0), RESULTADO.ACERTO);
  });

  it('CT13 - último acerto no navio retorna "afundou"', () => {
    assert.equal(t.receberTiro(9, 8), RESULTADO.ACERTO);
    assert.equal(t.receberTiro(9, 9), RESULTADO.AFUNDOU);
    assert.ok(t.afundado('DESTROIER'));
  });

  it('CT14 - porta-aviões precisa de 5 acertos para afundar', () => {
    for (let c = 0; c < 4; c++) assert.equal(t.receberTiro(0, c), RESULTADO.ACERTO);
    assert.equal(t.afundado('PORTA_AVIOES'), false);
    assert.equal(t.receberTiro(0, 4), RESULTADO.AFUNDOU);
  });

  it('CT15 - não é permitido atirar duas vezes na mesma casa', () => {
    t.receberTiro(5, 5);
    assert.throws(() => t.receberTiro(5, 5), /já foi atacada/);
  });

  it('CT16 - tiro fora do tabuleiro lança erro', () => {
    assert.throws(() => t.receberTiro(10, 0), RangeError);
    assert.throws(() => t.receberTiro(0, -1), RangeError);
  });

  it('CT17 - não é permitido atirar antes da frota completa', () => {
    const vazio = new Tabuleiro();
    vazio.posicionar('SUBMARINO', 0, 0, 'H');
    assert.throws(() => vazio.receberTiro(0, 0), /frota ainda não está completa/);
  });

  it('CT18 - todos afundados somente após as 14 casas atingidas', () => {
    const alvos = [];
    for (const n of t.navios.values()) alvos.push(...n.casas);
    alvos.slice(0, -1).forEach(([l, c]) => t.receberTiro(l, c));
    assert.equal(t.todosAfundados(), false);
    const [l, c] = alvos.at(-1);
    t.receberTiro(l, c);
    assert.equal(t.todosAfundados(), true);
  });
});

describe('Coordenadas A1..J10', () => {
  it('CT19 - converte coordenadas válidas', () => {
    assert.deepEqual(coordenada('A1'), [0, 0]);
    assert.deepEqual(coordenada('j10'), [9, 9]);
    assert.deepEqual(coordenada('E7'), [4, 6]);
  });

  it('CT20 - rejeita coordenadas inválidas', () => {
    for (const x of ['K1', 'A0', 'A11', '', '1A']) assert.throws(() => coordenada(x), RangeError);
  });
});

describe('Partida entre 2 jogadores', () => {
  let p;
  beforeEach(() => {
    p = new Partida();
    p.tabuleiros.forEach(montarFrota);
  });

  it('CT21 - partida só começa com as duas frotas completas', () => {
    const nova = new Partida();
    montarFrota(nova.tabuleiros[0]);
    assert.throws(() => nova.atirar(0, 0, 0), /Ambos os jogadores/);
  });

  it('CT22 - turnos se alternam entre os jogadores', () => {
    assert.equal(p.vez, 0);
    p.atirar(0, 7, 7);
    assert.equal(p.vez, 1);
    assert.throws(() => p.atirar(0, 7, 8), /Não é a vez/);
    p.atirar(1, 7, 7);
    assert.equal(p.vez, 0);
  });

  it('CT23 - jogador que afunda toda a frota adversária vence', () => {
    const alvos = [];
    for (const n of p.tabuleiros[1].navios.values()) alvos.push(...n.casas);
    let agua = 0;
    for (const [l, c] of alvos) {
      p.atirar(0, l, c);
      if (p.vencedor !== null) break;
      p.atirar(1, 6 + Math.floor(agua / 10), agua++ % 10); // jogador 1 erra nas linhas vazias 6-8
    }
    assert.equal(p.vencedor, 0);
    assert.throws(() => p.atirar(1, 8, 9), /já terminou/);
  });
});
