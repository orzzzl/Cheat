module gameLogic {
  /**
 * Check if the object is empty
 */
export function isEmptyObj(obj : any) {
  var prop;

  for (prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }

  return true;
}



  /**
  * Get possible ranks for claiming.
  * If the rank passed in is undefined, then there's no previous claim
  * and all ranks are selectable, otherwise only ranks 1 close to or
  * equal to the rank of the previous claim are selectable.
  * @param rank
  * @returns {Array}
  */
 export function getRankArray(rank) {
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
 export function getRankScore(rank) {
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
 export function check(val, description) {
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
  export function getCard(i) {
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

  export function getCardReverse (strVal) {
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
  export function isCloseRank(rank, rankToCompare) {
    var diff = Math.abs(getRankScore(rank) - getRankScore(rankToCompare));
    return diff <= 1 || diff === 12;
  }

  /**
   * Ref: http://stackoverflow.com/questions/18806210/generating-non-repeating-random-numbers-in-js
   * Shuffle an array
   */
  export function shuffle(array) {
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
  export function createComputerMove(state, turnIndexBeforeMove) {
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
  export function getWinner(state) {
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
  export function getInitialMove() {
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
  export function getDeclareCheaterMove(state, turnIndexBeforeMove, declareCheater) {
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
  export function didCheat(state) {
    var lastClaim = state.claim;
    var lastM = state.middle;
    for (var i = lastM.length - 1; i >= lastM.length - lastClaim[0]; i--) {
      if (state['card' + lastM[i]].substring(1) !== lastClaim[1]) {
        return true;
      }
    }
    return false;
  }

  export function getMoveCheckIfCheated(state, turnIndexBeforeMove) {
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

  export function getClaimMove(state, turnIndexBeforeMove, claim, cardsToMoveToMiddle) {
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

  export function getWinMove(state) {
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
  export function isMoveOk(params) {
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

}
