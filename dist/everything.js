(function () {
  "use strict";
  /*global angular */

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
   * Note: Operation III, IV and V are automatically made in the right situation.
   */
    // For unit tests...
  angular.module('myApp', ['ngTouch', 'ui.bootstrap']).factory('gameLogic',
  //angular.module('myApp').factory('cheatLogicService',
  function () {
    /**
     * Check if the object is empty
     */
    function isEmptyObj(obj) {
      var prop;

      for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          return false;
        }
      }

      return true;
    }

    // Stage
    var STAGE = {
      SET_UP: "SET_UP",
      DO_CLAIM: "DO_CLAIM",
      DECLARE_CHEATER: "DECLARE_CHEATER",
      CHECK_CLAIM: "CHECK_CLAIM",
      END: "END"
    };

    // Suit
    var SUIT = {
      DIAMONDS: "D", //♦
      HEARTS: "H", //♥
      SPADES: "S", //♠
      CLUBS: "C" //♣
    };

    // Rank
    var RANK = {
      TWO: '2',
      THREE: '3',
      FOUR: '4',
      FIVE: '5',
      SIX: '6',
      SEVEN: '7',
      EIGHT: '8',
      NINE: '9',
      TEN: '10',
      JACK: 'J',
      QUEEN: 'Q',
      KING: 'K',
      ACE: 'A'
    };

    /**
     * Get possible ranks for claiming.
     * If the rank passed in is undefined, then there's no previous claim
     * and all ranks are selectable, otherwise only ranks 1 close to or
     * equal to the rank of the previous claim are selectable.
     * @param rank
     * @returns {Array}
     */
    function getRankArray(rank) {
      var res = [];

      for (var index in RANK) {
        if (angular.isUndefined(rank)) {
          // Return all ranks
          res.push(RANK[index]);
        } else {
          // Return 1 close ranks and itself
          if (isCloseRank(rank, RANK[index])) {
            res.push(RANK[index]);
          }
        }
      }

      return res;
    }

    /**
     * Get the rank score.
     * @param rank
     * @returns {number}
     */
    function getRankScore(rank) {
      switch (rank) {
        case '2':
          return 1;
        case '3':
          return 2;
        case '4':
          return 3;
        case '5':
          return 4;
        case '6':
          return 5;
        case '7':
          return 6;
        case '8':
          return 7;
        case '9':
          return 8;
        case '10':
          return 9;
        case 'J':
          return 10;
        case 'Q':
          return 11;
        case 'K':
          return 12;
        case 'A':
          return 13;
        default:
          throw new Error("Illegal rank!");
      }
    }

    /**
     * Concat two array by appending the later one to the former one...
     */
    Array.prototype.selfConcat = function(append) {
      check(append.constructor === Array);
      for (var i = 0; i < append.length; i++) {
        this.push(append[i]);
      }
    };

    /**
     * Subtract elements from original arrays
     */
    Array.prototype.selfSubtract = function(elementsToRemove) {
      var originalLength = this.length;
      this.removeAll(elementsToRemove);
      check(originalLength === this.length + elementsToRemove.length, "The elements are not proper removed...", this, elementsToRemove);
    };

    /**
     * Check if the array contains all the elements.
     */
    Array.prototype.containsAll = function(elementsToCheck) {
      check(elementsToCheck.constructor === Array, "The argument is not an array!");
      for (var i = 0; i < elementsToCheck.length; i++) {
        if (this.indexOf(elementsToCheck[i]) == -1) {
          return false;
        }
      }
      return true;
    };

    /**
     * Remove all elements from the array
     */
    Array.prototype.removeAll = function(elementsToRemove) {
      check(elementsToRemove.constructor === Array, "The argument is not an array!");
      check(this.containsAll(elementsToRemove), "The array does not contain all the elements.", this, elementsToRemove);
      for (var i = 0; i < elementsToRemove.length; i++) {
        var index = this.indexOf(elementsToRemove[i]);
        this.splice(index, 1);
      }
    };

    /**
     * Return a clone array
     */
    Array.prototype.clone = function() {
      return this.slice(0);
    };

    function check(val, description) {
      if (!val) {
        console.log(description);
        for (var i = 2; i < arguments.length; i++) {
          console.log(arguments[i]);
        }
        throw new Error('Fails!');
      }
    }

    /**
     * Get a card string according the index
     * @param i
     * @returns {*}
     */
    function getCard(i) {
      check(i >= 0 && i <52, "Illegal index");

      var suit,
      rank;

      if (i < 13) {
        suit = SUIT.CLUBS;
      } else if (i < 26) {
        suit = SUIT.DIAMONDS;
      } else if (i < 39) {
        suit = SUIT.HEARTS;
      } else if (i < 52) {
        suit = SUIT.SPADES;
      }

      switch (i % 13) {
        case 0:
          rank = RANK.TWO;
          break;
        case 1:
          rank = RANK.THREE;
          break;
        case 2:
          rank = RANK.FOUR;
          break;
        case 3:
          rank = RANK.FIVE;
          break;
        case 4:
          rank = RANK.SIX;
          break;
        case 5:
          rank = RANK.SEVEN;
          break;
        case 6:
          rank = RANK.EIGHT;
          break;
        case 7:
          rank = RANK.NINE;
          break;
        case 8:
          rank = RANK.TEN;
          break;
        case 9:
          rank = RANK.JACK;
          break;
        case 10:
          rank = RANK.QUEEN;
          break;
        case 11:
          rank = RANK.KING;
          break;
        case 12:
          rank = RANK.ACE;
          break;
      }

      return suit + rank;

    }

    function getCardReverse (strVal) {
      var suit = strVal.substring (0, 1);
      var rank = strVal.substring (1);
      var tmp = getRankScore(rank) - 1;
      if (suit === SUIT.DIAMONDS)    tmp += 13;
      if (suit === SUIT.HEARTS)    tmp += 26;
      if (suit === SUIT.SPADES)    tmp += 39;
      return tmp;
    }

    /**
     * Check if the two rank are close by 1 or equal
     * @param rank
     * @param rankToCompare
     * @returns {boolean}
     */
    function isCloseRank(rank, rankToCompare) {
      var diff = Math.abs(getRankScore(rank) - getRankScore(rankToCompare));
      return diff <= 1 || diff === 12;
    }

    /**
     * Ref: http://stackoverflow.com/questions/18806210/generating-non-repeating-random-numbers-in-js
     * Shuffle an array
     */
    function shuffle(array) {
      var i = array.length,
      j = 0,
      temp;

      while (i--) {

        j = Math.floor(Math.random() * (i+1));

        // swap randomly chosen element with current element
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;

      }

      return array;
    }

    /**
     * Create computer move operations.
     */
    function createComputerMove(state, turnIndexBeforeMove) {
      var possibleMove = [];

      switch(state.stage) {
        case STAGE.DO_CLAIM:
          var claimedCardNum = state.black.length >= 4 ?
          (Math.floor(Math.random() * 4 + 1)) :
          (Math.floor(Math.random() * state.black.length + 1));
          var possibleClaimRanks = getRankArray(state.claim[1]);
          var claim = [claimedCardNum,possibleClaimRanks[Math.floor(Math.random() * possibleClaimRanks.length)]];
          var aiCards = state.black.clone();
          shuffle(aiCards);
          var claimedCards = aiCards.slice(0, claimedCardNum);
          possibleMove = getClaimMove(state, turnIndexBeforeMove, claim, claimedCards);
          break;
        case STAGE.DECLARE_CHEATER:
          var declareCheater = Math.random() > 0.5;
          if (getWinner(state) !== -1) {
            // Must declare cheater if the opponent empties all cards...
            declareCheater = true;
          }
          possibleMove = getDeclareCheaterMove(state, turnIndexBeforeMove, declareCheater);
          break;
        case STAGE.CHECK_CLAIM:
          possibleMove = getMoveCheckIfCheated(state, turnIndexBeforeMove);
          break;
      }

      return possibleMove;
    }

    /**
     * Return the winner's index, if no winner is present, return -1;
     */
    function getWinner(state) {
      if (state.white.length === 0) {
        return 0;
      } else if (state.black.length === 0) {
        return 1;
      } else {
        return -1;
      }
    }

    /**
     * Get the initial move which shuffles and deals all the cards.
     * @returns {Array}
     */
    function getInitialMove() {
      var operations = [],
      white = [],
      black = [],
      setCards = [],
      setVisibilities = [],
      shuffleKeys = [],
      i;

      for (i = 0; i < 26; i++) {
        white[i] = i;
      }
      for (i = 26; i < 52; i++) {
        black[i - 26] = i;
      }

      for (i = 0; i < 52; i++) {
        setCards[i] = {set: {key: 'card' + i, value: getCard(i)}};
        if (i < 26) {
          setVisibilities[i] = {setVisibility: {key: 'card' + i, visibleToPlayerIndexes: [0]}};
        } else {
          setVisibilities[i] = {setVisibility: {key: 'card' + i, visibleToPlayerIndexes: [1]}};
        }
        shuffleKeys[i] = 'card' + i;
      }

      operations.selfConcat([{setTurn: {turnIndex: 0}}]);
      operations.selfConcat([{set: {key: 'white', value: white}}]);
      operations.selfConcat([{set: {key: 'black', value: black}}]);
      operations.selfConcat([{set: {key: 'middle', value: []}}]);
      operations.selfConcat([{set: {key: 'stage', value: STAGE.DO_CLAIM}}]);
      operations.selfConcat(setCards);
      operations.selfConcat([{shuffle: {keys: shuffleKeys}}]);
      operations.selfConcat(setVisibilities);
      return operations;
    }

    /**
     * Get the move operations for declaring cheat
     */
    function getDeclareCheaterMove(state, turnIndexBeforeMove, declareCheater) {
      var operations = [];

      if (declareCheater) {
        // No skipping
        operations.selfConcat([{setTurn: {turnIndex: turnIndexBeforeMove}}]);
        operations.selfConcat([{set: {key: 'stage', value: STAGE.CHECK_CLAIM }}]);

        var setVisibilities = [];
        for (var i = 0; i < state.middle.length; i++) {
          setVisibilities.selfConcat([{setVisibility: {key: 'card' + state.middle[i], visibleToPlayerIndexes: [turnIndexBeforeMove]}}]);
        }
        operations.selfConcat(setVisibilities);
      } else {
        // Skip declaring cheater if the opponent does not empty all cards
        //if (turnIndexBeforeMove === 0) {
        //  // White
        //  check(state.black.length !== 0);
        //} else {
        //  check(state.white.length !== 0);
        //}
        operations.selfConcat([{setTurn: {turnIndex: turnIndexBeforeMove}}]);
        if (getWinner(state) === -1)
            operations.selfConcat([{set: {key: 'stage', value: STAGE.DO_CLAIM }}]);
        else
            operations.selfConcat([{set: {key: 'stage', value: STAGE.END }}]);
      }

      return operations;
    }

    /**
     * Check if the claim is indeed a cheat...
     * @param state
     * @returns {boolean}
     */
    function didCheat(state) {
      var lastClaim = state.claim;
      var lastM = state.middle;
      for (var i = lastM.length - 1; i >= lastM.length - lastClaim[0]; i--) {
        if (state['card' + lastM[i]].substring(1) !== lastClaim[1]) {
          return true;
        }
      }
      return false;
    }

    function getMoveCheckIfCheated(state, turnIndexBeforeMove) {
      var loserIndex = didCheat(state) ? 1 - turnIndexBeforeMove : turnIndexBeforeMove,
      loserCards = [],
      loserNewCards,
      operations = [],
      setVisibilities = [];

      if (loserIndex === 0) {
        loserCards = state.white;
      } else {
        loserCards = state.black;
      }
      loserNewCards = loserCards.concat(state.middle);

      operations.selfConcat([{setTurn: {turnIndex: turnIndexBeforeMove}}]);

      if (loserIndex === 0) {
        operations.selfConcat([{set: {key: 'white', value: loserNewCards}}]);
      } else {
        operations.selfConcat([{set: {key: 'black', value: loserNewCards}}]);
      }

      operations.selfConcat([{set: {key: 'middle', value: []}}]);
      operations.selfConcat([{set: {key: 'stage', value: STAGE.DO_CLAIM}}]);

      for (var i = 0; i < state.middle.length; i++) {
        if (loserIndex === 0) {
          setVisibilities.selfConcat([{setVisibility: {key: 'card' + state.middle[i], visibleToPlayerIndexes: [0]}}]);
        } else {
          setVisibilities.selfConcat([{setVisibility: {key: 'card' + state.middle[i], visibleToPlayerIndexes: [1]}}]);
        }
      }

      operations.selfConcat(setVisibilities);
      operations.selfConcat([{set: {key: 'claim', value: []}}]);

      return operations;
    }

    function getClaimMove(state, turnIndexBeforeMove, claim, cardsToMoveToMiddle) {
      // First check if number of cards claimed is legal and the number of
      // cards move to middle match the number of cards claimed
      check(cardsToMoveToMiddle.length >= 1 && cardsToMoveToMiddle.length <= 4);
      check(cardsToMoveToMiddle.length === claim[0]);

      var lastClaim = state.claim,
      lastWorB,
      newWorB,
      lastM,
      newM;

      if (!angular.isUndefined(lastClaim) && !angular.isUndefined(lastClaim [0])) {
        // If the last claim exists, the rank of the latest claim must be
        // close or equal to the last claim.
        check(isCloseRank(lastClaim[1], claim[1]));
      }

      // Get the cards of the player who makes the claim
      if (turnIndexBeforeMove === 0) {
        lastWorB = state.white;
      } else {
        lastWorB = state.black;
      }

      newWorB = lastWorB.clone();
      newWorB.selfSubtract(cardsToMoveToMiddle);

      lastM = state.middle;
      newM = lastM.concat(cardsToMoveToMiddle);

      var operations = [];
      operations.selfConcat([{setTurn: {turnIndex: 1 - turnIndexBeforeMove}}]);
      if (turnIndexBeforeMove === 0) {
        operations.selfConcat([{set: {key: 'white', value: newWorB}}]);
        operations.selfConcat([{set: {key: 'middle', value: newM}}]);
      } else {
        operations.selfConcat([{set: {key: 'black', value: newWorB}}]);
        operations.selfConcat([{set: {key: 'middle', value: newM}}]);
      }
      var setVisibilities = [];
      for (var i = 0; i < cardsToMoveToMiddle.length; i++) {
        setVisibilities.selfConcat([{setVisibility: {key: 'card' + cardsToMoveToMiddle[i], visibleToPlayerIndexes: []}}]);
      }
      operations.selfConcat([{set: {key: 'claim', value: claim}}]);
      operations.selfConcat([{set: {key: 'stage', value: STAGE.DECLARE_CHEATER }}]);
      operations.selfConcat(setVisibilities);

      return operations;
    }

    function getWinMove(state) {
      var operations = [];
      var winner = getWinner(state);
      if (winner === 0) {
        operations.selfConcat([{endMatch: {endMatchScores: [1, 0]}}]);
      } else if (winner === 1) {
        operations.selfConcat([{endMatch: {endMatchScores: [0, 1]}}]);
      }
      operations.selfConcat([{set: {key: 'middle', value: [] }}]);
      operations.selfConcat([{set: {key: 'stage', value: STAGE.END }}]);
      return operations;
    }

    /**
     * Check if the move is OK.
     *
     * @param params the match info which contains stateBeforeMove,
     *              stateAfterMove, turnIndexBeforeMove, turnIndexAfterMove,
     *              move.
     * @returns return true if the move is ok, otherwise false.
     */
    function isMoveOk(params) {
      var stateBeforeMove = params.stateBeforeMove,
      turnIndexBeforeMove = params.turnIndexBeforeMove,
      move = params.move,
      expectedMove;

      /*********************************************************************
       * 1. If the stateBeforeMove is empty, then it should be the first
       *    move, set the board of stateBeforeMove to be the initial board.
       *    If the stateBeforeMove is not empty, then the move operations
       *    array should have a length of 4.
       ********************************************************************/

      try {
        switch (params.stateBeforeMove.stage) {
          case STAGE.DO_CLAIM:
            var claim = move[3].set.value;
            var lastM = stateBeforeMove.middle;
            var newM = move[2].set.value;
            var diffM = newM.clone();
            diffM.selfSubtract(lastM);
            expectedMove = getClaimMove(stateBeforeMove, turnIndexBeforeMove, claim, diffM);
            break;
          case STAGE.DECLARE_CHEATER:
         //   check(move[1].set.value === STAGE.DO_CLAIM || move[1].set.value === STAGE.CHECK_CLAIM);
            var declareCheater = move[1].set.value === STAGE.CHECK_CLAIM;
            expectedMove = getDeclareCheaterMove(stateBeforeMove, turnIndexBeforeMove, declareCheater);
            break;
          case STAGE.CHECK_CLAIM:
            expectedMove = getMoveCheckIfCheated(stateBeforeMove, turnIndexBeforeMove);
            break;
          case STAGE.END:
            expectedMove = getWinMove(stateBeforeMove);
            break;
          default:
            if (turnIndexBeforeMove != 0 || angular.isUndefined(stateBeforeMove)) {
              throw new Error("Illegal initial move!");
            }
            expectedMove = getInitialMove();
            break;
        }
      } catch (e) {
        return false;
      }

      if (!angular.equals(move, expectedMove)) {
        //console.log("=========MoveToCheck=========");
        //console.log(JSON.stringify(move));
        //console.log("=========ExpectMove=========");
        //console.log(JSON.stringify(expectedMove));
        //console.log("=========END=========");
        return false;
      }

      return true;
    }

    return {
      isMoveOk: isMoveOk,
      isEmptyObj: isEmptyObj,
      didCheat: didCheat,
      createComputerMove: createComputerMove,
      getInitialMove: getInitialMove,
      getClaimMove: getClaimMove,
      getDeclareCheaterMove: getDeclareCheaterMove,
      getMoveCheckIfCheated: getMoveCheckIfCheated,
      getWinMove: getWinMove,
      getRankScore: getRankScore,
      getCard: getCard,
      getWinner: getWinner,
      getRankArray: getRankArray,
      getCardReverse: getCardReverse,
      STAGE: STAGE
    };
  });
}());;angular.module('myApp')
.controller('Ctrl',
['$scope', '$log', '$timeout',
  'gameService', 'gameLogic',
  'resizeGameAreaService', '$translate',
  function ($scope, $log, $timeout,
            gameService, gameLogic,
            resizeGameAreaService, $translate) {
    'use strict';

    resizeGameAreaService.setWidthToHeight(0.6);

    var bottomPos = 700;
    var middlePos = 400;
    var upperPos = 100;
    var cardLength = 5;
    var canMakeMove = false;
    var state = null;
    var stage = new createjs.Stage("demoCanvas");
    var turnIndex = null;
    var gameOngoing;
    var cardsCnt = 0;
    var mycards = [];
    var buttons = {};
    var mycardsVal= [];
    var cardsClickable = 1;
    var claimCards = [];
    var STAGE = gameLogic.STAGE;
    var ball;
    var claimBuffer;
    var middleCards = [];
    var interPos;

    stage.enableDOMEvents(true);

    // enable touch interactions if supported on the current device:
    createjs.Touch.enable(stage);
    // enabled mouse over / out events
    stage.enableMouseOver(10);

    // this lets our drag continue to track the mouse even when it leaves the canvas:
    // play with commenting this out to see the difference.
    stage.mouseMoveOutside = true;

    function updateUI(params) {
      $scope.state = params.stateAfterMove;
      // If the state is empty, first initialize the board...
      if (gameLogic.isEmptyObj($scope.state)) {
        if (params.yourPlayerIndex === 0) {
          gameService.makeMove(gameLogic.getInitialMove());
          gameOngoing = 1;
        }
        return;
      }
      console.log (params.stateAfterMove);

      // Get the new state
      // Get the current player index (For creating computer move...)
      $scope.currIndex = params.turnIndexAfterMove;

      canMakeMove = params.turnIndexAfterMove >= 0 && // game is ongoing
      params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn


      $scope.playMode = params.playMode;

      // Get the cards for player one area, player two area and middle area
      $scope.middle = $scope.state.middle.clone();
      turnIndex = params.turnIndexAfterMove;
      clearEverything ();
      if ($scope.currIndex === 0) {
        // If the game is played in the same device, use the default setting
        $scope.playerOneCards = $scope.state.white.clone();
        $scope.playerTwoCards = $scope.state.black.clone();
      } else if ($scope.currIndex === 1) {
        $scope.playerOneCards = $scope.state.black.clone();
        $scope.playerTwoCards = $scope.state.white.clone();
      } else {
        // Otherwise, player one area holds the cards for the player self
        if (params.yourPlayerIndex === 0) {
          $scope.playerOneCards =  $scope.state.white.clone();
          $scope.playerTwoCards = $scope.state.black.clone();
        } else {
          $scope.playerOneCards =  $scope.state.black.clone();
          $scope.playerTwoCards = $scope.state.white.clone();
        }
      }

      $scope.middle = $scope.state.middle.clone();
      sortRanks();
      mycardsVal = [];
      for (var i = 0; i < $scope.playerOneCards.length; i ++) {
        var tmp = "card" + $scope.playerOneCards[i];
        var tmpCard = gameLogic.getCardReverse($scope.state [tmp]);
        mycardsVal.push(tmpCard);
      }
      // If the game ends, send the end game operation directly
      checkEndGame();
      if (gameOngoing === 0)    return;
      showPlayerIndex ($scope.currIndex);
      displayOppCards (35);
      displayMiddle (35);
      updateStage();
      // Is it the computer's turn?
      var isComputerTurn = canMakeMove &&
      params.playersInfo[params.yourPlayerIndex].playerId === '';


      if (params.playMode === 'playAgainstTheComputer' && ($scope.currIndex != 0))
          canMakeMove = false;

      console.log ("is your turn is: " + canMakeMove);
      if (canMakeMove) {
        switch($scope.state.stage) {
          case STAGE.DO_CLAIM:
          console.log ("Do Claim");
            displayCards(20);
            createClaimEnv ();
            createSelectionPanel ();
            updateClaimRanks();
            createBall ();
            break;
          case STAGE.DECLARE_CHEATER:
            createDecEnv ();
            console.log ("declare cheater");

            break;
          case STAGE.CHECK_CLAIM:
          console.log ("check claim");
          $scope.ifCheat = true;
          $scope.resultMessage = $translate('PLAYER') + $scope.currIndex + ": ";
          $scope.resultMessage += gameLogic.didCheat($scope.state) ? $translate('SUC') : $translate('FAIL');
            checkDeclaration();
            break;
          default:
        }
      }

      if (isComputerTurn) {
        canMakeMove = false;
        if ($scope.state.stage === STAGE.CHECK_CLAIM) {
          $scope.ifCheat = true;
          $scope.resultMessage = $translate('PLAYER') + $scope.currIndex + ": ";
          $scope.resultMessage += gameLogic.didCheat($scope.state) ? $translate('SUC') : $translate('FAIL');
        }
        sendComputerMove();
      }
    }



    function sendUserMove(move) {
      if (!canMakeMove) {
        $log.info('User cannot make a move now! move=', move);
        return;
      }
      gameService.makeMove(move);
    }

    $scope.userClickedSomething = function (userChoices) {
      alert("Clicked");
      sendUserMove(gameLogic.createMove(state, turnIndex, userChoices));
    }


    /*************** My Helper functions ***************/
    function clearEverything () {
      turnIndex = null;
      cardsCnt = 0;
      mycards = [];
      buttons = {};
      mycardsVal = [];
      middleCards = [];
      cardsClickable = 1;
      claimCards = [];
      stage.removeAllChildren ();
      updateStage();
    }



    function createClaimEnv() {
      createButton ($translate('CANCEL'), 400, bottomPos - 100, resetAll);
      createButton($translate('MKCLAIM'), 200, bottomPos - 100, Claim);
      hideButton($translate('MKCLAIM'));
      createOpts ();
      hideButton("ops");
      showButton($translate('CANCEL'));
      updateStage();
    };


    function createDecEnv () {
      createDecPanel ();
    }

    function createDecPanel () {
      var panel = new createjs.Container();
      var background = new createjs.Shape ();
      background.graphics.beginFill("#006400").drawRect(0, 600, 600, 800);

      var message = $scope.state.claim [0] + $translate('M1') + $scope.state.claim [1] + $translate('M2');
      var label = new createjs.Text (message, "bold 40px 'Shadows Into Light'", "#FFFFFF");
      label.textAlign = "center";
      label.textBaseline = "middle";
      label.x = 300;
      label.y = 650;

      panel.addChild(background, label);
      stage.addChild(panel);

      createButton ($translate('BULLSHIT'), 100, 800, function () {
        $scope.declare(true);
      });

      createButton ($translate('PASS'), 350, 800, function () {$scope.declare (false);});
      updateStage()
    }

    // Update the ranks for claiming
    function updateClaimRanks () {
      if (angular.isUndefined($scope.state.claim)) {
        $scope.claimRanks = gameLogic.getRankArray();
      } else {
        var rank = $scope.state.claim[1];
        $scope.claimRanks = gameLogic.getRankArray(rank);
      }
    }


    function showPlayerIndex (turnIndex) {
      var message = $translate('PTI') + " " + turnIndex;
      var label = new createjs.Text (message, "bold 35px 'Shadows Into Light'", "#FFFFFF");
      label.x = 20;
      label.y = 20;
      var c = ($scope.state.claim === undefined || $scope.state.claim [1] === undefined ? "" : $scope.state.claim [1]);
      var claimMessage = $translate('LAST') + " " + c;
      var label2 = new createjs.Text (claimMessage, "bold 35px 'Shadows Into Light'", "#FFFFFF");
      label2.x = 300;
      label2.y = 20;
      stage.addChild(label, label2);
    }

    // Check the declaration
    function checkDeclaration() {
      var operations = gameLogic.getMoveCheckIfCheated($scope.state, $scope.currIndex);
      gameService.makeMove(operations);
    }


    // Check if there's a winner
    function hasWinner() {
      return gameLogic.getWinner($scope.state) !== -1;
    }

    // Send computer move
    function sendComputerMove() {
      var operations = gameLogic.createComputerMove($scope.state, $scope.currIndex);
      if ($scope.currIndex === 1) {
        gameService.makeMove(operations);
      }
    }

    // Check if the game ends, and if so, send the end game operations
    function checkEndGame() {
      console.log (hasWinner() + "&&&&&&&&" + $scope.state.stage);
      if (hasWinner() && $scope.state.stage === STAGE.DO_CLAIM) {
        // Only send end game operations in DO_CLAIM stage
        console.log ("game is end!");
        clearEverything();
        gameOngoing = 0;
        var operation = gameLogic.getWinMove($scope.state);
        gameService.makeMove(operation);
      }
    }

    // Declare a cheater or pass
    $scope.declare = function (declareCheater) {
      var operations = gameLogic.getDeclareCheaterMove($scope.state, $scope.currIndex, declareCheater);
      gameService.makeMove(operations)
    };

    // Sort the cards according to the ranks
    function sortRanks() {
      var sortFunction = function(cardA, cardB) {
        if ($scope.state["card" + cardA] !== null) {
          // Only sort the cards while they are not hidden
          var rankA = $scope.state["card" + cardA].substring(1);
          var rankB = $scope.state["card" + cardB].substring(1);
          var scoreA = gameLogic.getRankScore(rankA);
          var scoreB = gameLogic.getRankScore(rankB);
          return scoreA - scoreB;
        }
        return 1;
      };
      $scope.playerOneCards.sort(sortFunction);
      $scope.playerTwoCards.sort(sortFunction);
    }

    function showButton (message) {
      buttons [message].visible = true;
      updateStage();
    }

    function hideButton (message) {
      buttons [message].visible = false;
      updateStage();
    }

    function createOpts () {
      var shape = new createjs.Shape();
      shape.graphics.beginFill("#006400").drawRect(0, 0, 800, 800);
      shape.x = 0;
      shape.y = 660;
      stage.addChild (shape);
      buttons["ops"] = shape;
    }

    function Claim () {
      cardsClickable = 0;
      hideButton($translate('MKCLAIM'));
      showButton("ops");
      console.log (claimCards);
      showSelectionPanel ();
      updateStage();
    }



    function showSelectionPanel () {
      for (var i = 0; i < claimCards.length; i ++)
        showButton(claimCards [i]);
    }

    function createBall () {
      ball = new createjs.Shape();
      ball.graphics.beginFill("orange").drawCircle(0, 0, 10);
      ball.visible = false;
      ball.on ("pressmove", function (evt){
        this.y = evt.stageY;
        this.x = evt.stageX;
        stage.update();
      });
      stage.on ("pressup", function () {
        ball.visible = false;
        for (var i = 0; i < mycards.length; i ++) {
            if (mycards [i].alpha === 0.2)
                selectCard(mycards [i]);
        }
        updateStage();
      });
      stage.addChild(ball);
    }

    function createSelectionPanel () {
      var currentClaim = $scope.state.claim === undefined ? undefined : $scope.state.claim [1];
      claimCards = gameLogic.getRankArray(currentClaim);
      var row = 80;
      var col = bottomPos;
      for (var i = 0; i < claimCards.length; i ++) {
        var text = claimCards [i];
        createSmallButton(text, row, col, callback);
        row += 100;
        if (i == 4 || i == 9) {
          row = 80;
          col += 100;
        }
      }
      hideSelctionPanel();
    }

    function callback () {
      claimBuffer = this;
      console.log (claimBuffer);
      if (isACheat()) {
        $scope.sureToClaim = true;
        $scope.$apply();
      } else {
        $scope.makeACheat();
      }
    }

    function isACheat () {
      for (var i = 0; i < middleCards.length; i ++) {
        var tmp = gameLogic.getCard(middleCards [i]);
        if (tmp.length === 3 && claimBuffer === "10")    //if they are both "10";
           continue;
        if (tmp [1] !== claimBuffer)
           return true;
      }
      return false;
    }

    $scope.makeACheat = function () {
      var rank = ""  + claimBuffer;
      console.log ($scope.middle.clone ());
      var claim = [$scope.middle.length - $scope.state.middle.length, rank];
      var diffM = $scope.middle.clone();
      diffM.selfSubtract($scope.state.middle);
      var operations = gameLogic.getClaimMove($scope.state, $scope.currIndex, claim, diffM);
      gameService.makeMove(operations);
    }

    function hideSelctionPanel () {
      for (var i = 0; i < claimCards.length; i ++)
          hideButton(claimCards [i]);
    }

    function displayCards (limit) {
        var n = mycardsVal.length;
        var start = 10;
        var end = 480;
        interPos = (end - start) / (n > limit ? limit : n);
        var x = start - interPos;
        var y = bottomPos;
        for (var i = 0; i < n; i ++) {
          var cardType = 1;
          x += interPos;
          if (i === limit || i === limit * 2 || i === limit * 3) {
            x = start;
            y += 50;
          }
          var tmpi = i + 1;
          if (i + limit < n + cardLength && (parseInt((n - 1) / limit) !== parseInt(i / limit))) {
            cardType = 3;
          }
          if (tmpi === limit || tmpi === limit * 2 || tmpi === limit * 3 || i === n - 1) {
            cardType = 2;
          }
          addpic(mycardsVal [i], x, y, cardType, limit, i);
        }
    }

    function displayOppCards (limit) {
      var n = $scope.playerTwoCards.length;
      var start = 10;
      var end = 480;
      var interPos = (end - start) / (n > limit ? limit : n);
      var x = start - interPos;
      var y = upperPos;
      for (var i = 0; i < n; i ++) {
        x += interPos;
        if (i === limit || i === limit * 2 || i === limit * 3) {
          x = start;
          y += 50;
        }
        addpic("qb1fv", x, y, 1, limit, i);
      }
    }

    function displayMiddle (limit) {
      if (gameOngoing === 0)    return;
      var n = $scope.middle.length;
      var start = 10;
      var end = 480;
      var interPos = (end - start) / (n > limit ? limit : n);
      var x = start - interPos;
      var y = middlePos;
      for (var i = 0; i < n; i ++) {
        x += interPos;
        if (i === limit || i === limit * 2 || i === limit * 3) {
          x = start;
          y += 50;
        }
        addpic("qb1fh", x, y, 1, limit, i);
      }
    }


    function updateStage() {
      stage.update();
    }

    function createSmallButton (message, _x, _y, func) {
      console.log ("creating" + message);
      var reset = new createjs.Shape();
      reset.graphics.beginFill("white").drawRect(0, 0, 60, 80);
      var rec = new createjs.Shape();
      rec.graphics.beginStroke("black").drawRect(20, 20, 25, 35);

      var label = new createjs.Text (message, "15px Arial'" , "black");
      label.textAlign = "left";
      label.textBaseline = "top";
      label.x = 5;
      label.y = 5;

      var labelr = new createjs.Text (message, "15px Arial'" , "black");
      labelr.textAlign = "left";
      labelr.textBaseline = "top";
      labelr.x = 55;
      labelr.y = 75;
      labelr.rotation = 180;
      var button = new createjs.Container();
      button.name = message;
      button.x = _x;
      button.y = _y;
      button.addChild(reset, label, labelr, rec);
      button.on("click", func, message);
      buttons[message] = button;
      button.z = 2;
      stage.addChild(button);
    }


    function createButton (message, _x, _y, func) {
      var reset = new createjs.Shape();
      reset.graphics.beginFill("#FA8072").drawRoundRect(0, 0, 150, 60, 10);
      var label = new createjs.Text (message, "bold 24px 'Shadows Into Light'", "#FFFFFF");
      label.textAlign = "center";
      label.textBaseline = "middle";
      label.x = 150/2;
      label.y = 60/2;

      var button = new createjs.Container();
      button.name = message;
      button.x = _x;
      button.y = _y;
      button.addChild(reset, label);
      button.on("click", func);
      buttons[message] = button;
      button.z = 1;
      stage.addChild(button);
    }


    function nameToInd (i) {
      var strval = gameLogic.getCard(parseInt(i));
      for (var j = 0; j < 52; j ++) {
        if ($scope.state ["card" + j] === strval)
            return j;
      }
      return -1;
    }

    function resetAll () {
      cardsClickable = 1;
      for (var i = 0; i < mycards.length; i ++)
          clearcard(mycards [i]);
      updateStage();
    }

    function setcard (image) {
      cardsCnt ++;
      if (cardsCnt > 4) {
        cardsCnt --;
        return;
      }
      showButton($translate('MKCLAIM'));
      hideButton("ops");
      hideSelctionPanel ();
      image.y -= 30;
      image.clicked = 1;
      middleCards.push (image.name);
      $scope.middle.push (nameToInd(image.name));
      console.log (middleCards);
    }

    function clearcard (image) {
      if (image.clicked === 0)
        return;
      hideButton("ops");
      hideSelctionPanel ()
      cardsCnt --;
      if (cardsCnt === 0)
        hideButton($translate('MKCLAIM'));
      else
        showButton($translate('MKCLAIM'));
      image.y += 30;
      image.clicked = 0;
      rmFromMiddle(image.name);
    }

    function rmFromMiddle (i) {
      var t = nameToInd(i);
      for (var j = 0; j < $scope.middle.length; j ++) {
        if ($scope.middle [j] === t)    $scope.middle.splice(j, 1);
        if (middleCards [j] === i)    middleCards.splice(j, 1);
      }
      console.log ($scope.middle);
    }


    function selectCard (card) {
      if (cardsClickable === 0)    return;
      if (card.clicked === 0) {
        setcard(card);
      } else {
        clearcard(card);
      }
    }

    function addpic (i, _x, _y, cardType, limit, ind) {
      var tmpImg = new Image();
      var baseHead = "imgs/cards/";
      var baseTail = ".png";
      var src = baseHead + i + baseTail;
      tmpImg.onload = updateStage;
      tmpImg.src = src;
      tmpImg.height = 200;
      var image = new createjs.Bitmap(tmpImg);
      image.z = -1;
      image.set({x: _x, y: _y});
      image.scaleX = 2.0;
      image.scaleY = 2.0;
      image.name = i;
      image.cardType = cardType;
      image.clicked = 0;
      image.on("click", function () {
        if (image.name === "qb1fv" || image.name === "qb1fh")  return;
        selectCard(image);
      });
      image.on("pressmove", function (evt){
        if (image.name === "qb1fv" || image.name === "qb1fh")  return;
        ball.x = evt.stageX;
        ball.y = evt.stageY;
        ball.visible = true;
        image.alpha = 0.2;
        updateStage();
      });

      image.on ("tick", function () {
        if (image.name === "qb1fv" || image.name === "qb1fh")  return;
        if (ball === undefined)    return;
        if (ball.visible === false) {
          image.alpha = 1;
          return;
        }
        if (image.cardType === 3) {
          var cardBelowHeight;
          var targetInd = ind + limit;
          if (targetInd >= mycardsVal.length && targetInd < mycardsVal.length + cardLength)
              targetInd = mycardsVal.length - 1;
          var cardBelow = stage.getChildByName ("" + mycardsVal [targetInd]);
          if (cardBelow === undefined || cardBelow === null || cardBelow.clicked === 0) {
            cardBelowHeight = 50;
          } else {
            cardBelowHeight = 20;
          }
          if (ball.y > image.y && ball.y < image.y + cardBelowHeight && Math.abs (image.x - ball.x) <= interPos / 2) {
            image.alpha = 0.2;
          }
          else
            image.alpha = 1;
          return;
        }
        if ((ball.y >= image.y && Math.abs (image.x - ball.x) <= interPos / 2) || (image.cardType === 2 &&
                            ball.y >= image.y && ball.x > image.x && Math.abs(ball.x - image.x) <= 140)) {
          image.alpha = 0.2;
        } else {
          image.alpha = 1;
        }
      });
      mycards.push (image);
      stage.addChild(image);
    }



    gameService.setGame({
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      isMoveOk: gameLogic.isMoveOk,
      updateUI: updateUI
    });
  }]);
