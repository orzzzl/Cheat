describe("In TicTacToe", function() {

  'use strict';

  var _gameLogic;

  beforeEach(module("myApp"));

  beforeEach(inject(function (gameLogic) {
    _gameLogic = gameLogic;
  }));

  function expectMoveOk(turnIndexBeforeMove, stateBeforeMove, move) {
    expect(_gameLogic.isMoveOk({turnIndexBeforeMove: turnIndexBeforeMove,
      stateBeforeMove: stateBeforeMove,
      move: move})).toBe(true);
  }

  function expectIllegalMove(turnIndexBeforeMove, stateBeforeMove, move) {
    expect(_gameLogic.isMoveOk({turnIndexBeforeMove: turnIndexBeforeMove,
      stateBeforeMove: stateBeforeMove,
      move: move})).toBe(false);
  }

  it("example of checking whether a move is ok", function() {
    // TODO: have tests for normal moves and for moves that end the match.
    expectMoveOk(0, {},
      [{setTurn: {turnIndex : 1}}, {set: {key: 'someKey', value: {}}}]);
  });

  it("example of checking whether a move is illegal", function() {
    expectIllegalMove(0, {},
      [{setTurn: {turnIndex : 0}}]);
  });

});
