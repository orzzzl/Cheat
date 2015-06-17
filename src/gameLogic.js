/**
 * This is the logic service for Cheat. The game state is represented by the
 * following elements:
 *      white, black, middle, claim, stage, "cards"
 *
 * White (player 0): It's an array and its elements are indexes of Cards indicating
 * the cards the white player are holding on.
 *
 * Black (player 1): It's an array and its elements are indexes of Cards indicating
 * the cards the black player are holding on.
 *
 * Middle: It's an array and its elements are indexes of Cards indicating
 * the cards in the middle area.
 *
 * Claim: An array with the following format [int, string] where the
 * first element is the number of cards and the second element is the rank of
 * the cards.
 *
 * Stage: "setUp", "doClaim", "claimCheater", "checkClaim", "endGame"
 *
 * "Cards": 52 objects representing 52 cards (no jokers) such as:
 * {key: "Card0", value: "C2"}
 * {key: "Card10", value: "DQ"}
 * {key: "Card20", value: "HK"}
 * {key: "Card30", value: "S6"}
 * {key: "Card40", value: null} // This card is not visible to the player...
 *
 * Here is the table of representation of suits and ranks in the game state:
 * Suits: CLUBS ---- C
 *        DIAMONDS - D
 *        HEARTS --- H
 *        SPADES --- S
 * Ranks: TWO ------ 2
 *        THREE ---- 3
 *        FOUR ----- 4
 *        FIVE ----- 5
 *        SIX ------ 6
 *        SEVEN ---- 7
 *        EIGHT ---- 8
 *        NINE ----- 9
 *        TEN ------ 10
 *        JACK ----- J
 *        QUEEN ---- Q
 *        KING ----- K
 *        ACE ------ A
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * There're four types of operations:
 *
 * (If there's a last claim, then the claimed rank must be close to or equal
 * to the last claimed rank...)
 * I. Doing a claim
 *      setTurn:
 *          0 - {setTurn: {turnIndex: 1}}
 *      setBoard:
 *          1 - {set: {key: 'white', value: [0, 1, 2, ..., 21] }}
 *          2 - {set: {key: 'middle', value: [22, 23, 24, 25] }}
 *      setClaim:
 *          3 - {set: {key: 'claim', value: [4, A] }}
 *      setState:
 *          4 - {set: {key: 'stage', value: STAGE.DECLARE_CHEATER }}
 *      setVisibility to all claimed cards:
 *          5 - 8  {setVisibility: {key: 'card22', visibleToPlayerIndexes: []}...
   *
   * (Must claim a cheater if the opponent has no cards in his hand...)
   * II. Claiming a cheater
   *    a. Claiming player 0 cheater
   *      setTurn:
   *          0 - {setTurn: {turnIndex: 1}}
   *      setState:
   *          1 - {set: {key: 'stage', value: STAGE.CHECK_CLAIM }}
   *      setVisibility of each card in the middle area to player 0:
   *          2 - 5 {setVisibility: {key: 'card22', visibleToPlayerIndexes: [0]}...
   *    b. Not claiming player 0 cheater
   *      setTurn:
   *          0 - {setTurn: {turnIndex: 1}}
   *      setState:
   *          1 - {set: {key: 'stage', value: STAGE.DO_CLAIM }}
   *
   * III. Check if we had a cheater (Can be skipped by not claiming a cheater)
   *    a. Player 0 is cheater
   *      setTurn:
   *          0 - {setTurn: {turnIndex: 1}}
   *      setBoard:
   *          1 - {set: {key: 'white', value: [0, 1, 2, ..., 25] }}
   *          2 - {set: {key: 'middle', value: [] }}
   *      setState:
   *          3 - {set: {key: 'stage', value: STAGE.DO_CLAIM }}
   *      setVisibility of each card in the middle area to player 0:
   *          4 - 7 {setVisibility: {key: 'card22', visibleToPlayerIndexes: [0]}...
   *    b. Player 0 is not cheater
   *      setTurn:
   *          0 - {setTurn: {turnIndex: 1}}
   *      setBoard:
   *          1 - {set: {key: 'black', value: [22, 23,..., 51] }}
   *          2 - {set: {key: 'middle', value: [] }}
   *      setState:
   *          3 - {set: {key: 'stage', value: STAGE.DO_CLAIM }}
   *      setVisibility of each card in the middle area to player 0:
   *          4 - 7 {setVisibility: {key: 'card22', visibleToPlayerIndexes: [1]}...
   *
   * IV. Win the game by get rid of all cards. (White player wins)
   *      endMatch:
   *          0 - {endMatch: {endMatchScores: [1, 0]}}
   *
   * V. Initial move
   *      setTurn:
   *          0 - {setTurn: {turnIndex: 0}}
   *      setBoard:
   *          1 - {set: {key: 'white', value: [0, 1, 2, ..., 25] }}
   *          2 - {set: {key: 'black', value: [26, 27, ..., 51] }}
   *          3 - {set: {key: 'middle', value: [] }}
   *      setStage:
   *          4 - {set: {key: 'stage', value: STAGE.DO_CLAIM }}
   *      setCards:
   *          6 - {set: {key: 'card0', value: "C2" }}...
   *          57 - {set: {key: 'card51', value: "SA" }}
   *      shuffle
   *          5 - {shuffle: ["card0", ..., "card51"]}
   *      setVisibility:
   *          58 - {setVisibility: {key: 'card0', value: []}...
   *          109 - {setVisibility: {key: 'card52', value: []}
   *
   *
*/

angular.module('myApp', ['ngTouch', 'ui.bootstrap'])
.factory('gameLogic', function() {

  'use strict';

  function isObjEmpty (obj) {
      var name;
      for (name in obj) {
          if (obj.hasOwnProperty (name)) {
              return false;
          }
      }
      return true;
  }

  var STAGE = {
      SET_UP: "SET_UP",
      DO_CLAIM: "DO_CLAIM",
      DECLARE_CHEATER: "DECLARE_CHEATER",
      CHECK_CLAIM: "CHECK_CLAIM",
      END: "END"
  };


  var SUIT = {
      DIAMONDS: "D",
      HEARTS: "H",
      SPADES: "S",
      CLUBS: "C"
  };

  var RANK = {
      TWO: "2",
      THREE: "3",
      FOUR: "4",
      FIVE: "5",
      SIX: "6",
      SEVEN: "7",
      EIGHT: "8",
      NINE: "9",
      TEN: "10",
      JACK: "J",
      QUEEN: "Q",
      KING: "K",
      ACE: "A"
  };



  /** Returns the initial board. */
  function getInitialBoard() {
    // TODO: return the initial board.
    return {};
  }

  function getRandomMove(state, turnIndexBeforeMove) {
    // TODO: return a random move which the computer will do.
    return [{setTurn: {turnIndex: 1 - turnIndexBeforeMove}}];
  }

  function createMove(state, turnIndexBeforeMove, userChoices) {
    if (state.board === undefined) {
      // Initially (at the beginning of the match), the board in state is undefined.
      state.board = getInitialBoard();
    }
    // TODO: create move.
    // Example operations:
    // {endMatch: {endMatchScores: [1, 0]}}
    // {set: {key: 'someKey', value: 'anyValue'}}
    return [
        {setTurn: {turnIndex: 1 - turnIndexBeforeMove}}, 
        {set: {key: 'someKey', value: userChoices}}
    ];
  }

  function isMoveOk(params) {
    var move = params.move;
    var turnIndexBeforeMove = params.turnIndexBeforeMove;
    var stateBeforeMove = params.stateBeforeMove;
    // The state and turn after move are not needed in any game where all state is public.
    //var turnIndexAfterMove = params.turnIndexAfterMove;
    //var stateAfterMove = params.stateAfterMove;
    try {
      // TODO: extract userChoices from move.
      var userChoices = {};
      var expectedMove = createMove(stateBeforeMove, turnIndexBeforeMove, userChoices);
      if (!angular.equals(move, expectedMove)) {
        return false;
      }
    } catch (e) {
      // if there are any exceptions then the move is illegal
      return false;
    }
    return true;
  }

  return {
      getInitialBoard: getInitialBoard,
      getRandomMove: getRandomMove,
      createMove: createMove,
      isMoveOk: isMoveOk
  };
});
