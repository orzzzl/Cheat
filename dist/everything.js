var gameLogic;
(function (gameLogic) {
    /**
  * Concat two array by appending the later one to the former one...
  */
    Array.prototype.selfConcat = function (append) {
        gameLogic.check(append.constructor === Array);
        for (var i = 0; i < append.length; i++) {
            this.push(append[i]);
        }
    };
    /**
    * Subtract elements from original arrays
    */
    Array.prototype.selfSubtract = function (elementsToRemove) {
        var originalLength = this.length;
        this.removeAll(elementsToRemove);
        gameLogic.check(originalLength === this.length + elementsToRemove.length, "The elements are not proper removed...", this, elementsToRemove);
    };
    /**
    * Check if the array contains all the elements.
    */
    Array.prototype.containsAll = function (elementsToCheck) {
        gameLogic.check(elementsToCheck.constructor === Array, "The argument is not an array!");
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
    Array.prototype.removeAll = function (elementsToRemove) {
        gameLogic.check(elementsToRemove.constructor === Array, "The argument is not an array!");
        gameLogic.check(this.containsAll(elementsToRemove), "The array does not contain all the elements.", this, elementsToRemove);
        for (var i = 0; i < elementsToRemove.length; i++) {
            var index = this.indexOf(elementsToRemove[i]);
            this.splice(index, 1);
        }
    };
    /**
    * Return a clone array
    */
    Array.prototype.clone = function () {
        return this.slice(0);
    };
})(gameLogic || (gameLogic = {}));
var gameLogic;
(function (gameLogic) {
    // Stage
    gameLogic.STAGE = {
        SET_UP: "SET_UP",
        DO_CLAIM: "DO_CLAIM",
        DECLARE_CHEATER: "DECLARE_CHEATER",
        CHECK_CLAIM: "CHECK_CLAIM",
        END: "END"
    };
    // Suit
    gameLogic.SUIT = {
        DIAMONDS: "D",
        HEARTS: "H",
        SPADES: "S",
        CLUBS: "C" //♣
    };
    // Rank
    gameLogic.RANK = {
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
})(gameLogic || (gameLogic = {}));
var gameLogic;
(function (gameLogic) {
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
    gameLogic.isEmptyObj = isEmptyObj;
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
        for (var index in gameLogic.RANK) {
            if (angular.isUndefined(rank)) {
                // Return all ranks
                res.push(gameLogic.RANK[index]);
            }
            else {
                // Return 1 close ranks and itself
                if (isCloseRank(rank, gameLogic.RANK[index])) {
                    res.push(gameLogic.RANK[index]);
                }
            }
        }
        return res;
    }
    gameLogic.getRankArray = getRankArray;
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
    gameLogic.getRankScore = getRankScore;
    function check(val, description) {
        if (!val) {
            console.log(description);
            for (var i = 2; i < arguments.length; i++) {
                console.log(arguments[i]);
            }
            throw new Error('Fails!');
        }
    }
    gameLogic.check = check;
    /**
     * Get a card string according the index
     * @param i
     * @returns {*}
     */
    function getCard(i) {
        check(i >= 0 && i < 52, "Illegal index");
        var suit, rank;
        if (i < 13) {
            suit = gameLogic.SUIT.CLUBS;
        }
        else if (i < 26) {
            suit = gameLogic.SUIT.DIAMONDS;
        }
        else if (i < 39) {
            suit = gameLogic.SUIT.HEARTS;
        }
        else if (i < 52) {
            suit = gameLogic.SUIT.SPADES;
        }
        switch (i % 13) {
            case 0:
                rank = gameLogic.RANK.TWO;
                break;
            case 1:
                rank = gameLogic.RANK.THREE;
                break;
            case 2:
                rank = gameLogic.RANK.FOUR;
                break;
            case 3:
                rank = gameLogic.RANK.FIVE;
                break;
            case 4:
                rank = gameLogic.RANK.SIX;
                break;
            case 5:
                rank = gameLogic.RANK.SEVEN;
                break;
            case 6:
                rank = gameLogic.RANK.EIGHT;
                break;
            case 7:
                rank = gameLogic.RANK.NINE;
                break;
            case 8:
                rank = gameLogic.RANK.TEN;
                break;
            case 9:
                rank = gameLogic.RANK.JACK;
                break;
            case 10:
                rank = gameLogic.RANK.QUEEN;
                break;
            case 11:
                rank = gameLogic.RANK.KING;
                break;
            case 12:
                rank = gameLogic.RANK.ACE;
                break;
        }
        return suit + rank;
    }
    gameLogic.getCard = getCard;
    function getCardReverse(strVal) {
        var suit = strVal.substring(0, 1);
        var rank = strVal.substring(1);
        var tmp = getRankScore(rank) - 1;
        if (suit === gameLogic.SUIT.DIAMONDS)
            tmp += 13;
        if (suit === gameLogic.SUIT.HEARTS)
            tmp += 26;
        if (suit === gameLogic.SUIT.SPADES)
            tmp += 39;
        return tmp;
    }
    gameLogic.getCardReverse = getCardReverse;
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
    gameLogic.isCloseRank = isCloseRank;
    /**
     * Ref: http://stackoverflow.com/questions/18806210/generating-non-repeating-random-numbers-in-js
     * Shuffle an array
     */
    function shuffle(array) {
        console.log("shuffled");
        var i = array.length, j = 0, temp;
        while (i--) {
            j = Math.floor(Math.random() * (i + 1));
            // swap randomly chosen element with current element
            temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }
    gameLogic.shuffle = shuffle;
    /**
     * Create computer move operations.
     */
    function createComputerMove(state, turnIndexBeforeMove) {
        var possibleMove = [];
        switch (state.stage) {
            case gameLogic.STAGE.DO_CLAIM:
                var claimedCardNum = state.black.length >= 4 ?
                    (Math.floor(Math.random() * 4 + 1)) :
                    (Math.floor(Math.random() * state.black.length + 1));
                var possibleClaimRanks = getRankArray(state.claim[1]);
                var claim = [claimedCardNum, possibleClaimRanks[Math.floor(Math.random() * possibleClaimRanks.length)]];
                var aiCards = state.black.clone();
                shuffle(aiCards);
                var claimedCards = aiCards.slice(0, claimedCardNum);
                possibleMove = getClaimMove(state, turnIndexBeforeMove, claim, claimedCards);
                break;
            case gameLogic.STAGE.DECLARE_CHEATER:
                var declareCheater = Math.random() > 0.5;
                if (getWinner(state) !== -1) {
                    // Must declare cheater if the opponent empties all cards...
                    declareCheater = true;
                }
                possibleMove = getDeclareCheaterMove(state, turnIndexBeforeMove, declareCheater);
                break;
            case gameLogic.STAGE.CHECK_CLAIM:
                possibleMove = getMoveCheckIfCheated(state, turnIndexBeforeMove);
                break;
        }
        return possibleMove;
    }
    gameLogic.createComputerMove = createComputerMove;
    /**
     * Return the winner's index, if no winner is present, return -1;
     */
    function getWinner(state) {
        if (state.white.length === 0) {
            return 0;
        }
        else if (state.black.length === 0) {
            return 1;
        }
        else {
            return -1;
        }
    }
    gameLogic.getWinner = getWinner;
    /**
     * Get the initial move which shuffles and deals all the cards.
     * @returns {Array}
     */
    function getInitialMove() {
        console.log("initial");
        var operations = [], white = [], black = [], setCards = [], setVisibilities = [], shuffleKeys = [], i;
        for (i = 0; i < 26; i++) {
            white[i] = i;
        }
        for (i = 26; i < 52; i++) {
            black[i - 26] = i;
        }
        for (i = 0; i < 52; i++) {
            setCards[i] = { set: { key: 'card' + i, value: getCard(i) } };
            if (i < 26) {
                setVisibilities[i] = { setVisibility: { key: 'card' + i, visibleToPlayerIndexes: [0] } };
            }
            else {
                setVisibilities[i] = { setVisibility: { key: 'card' + i, visibleToPlayerIndexes: [1] } };
            }
            shuffleKeys[i] = 'card' + i;
        }
        operations.selfConcat([{ setTurn: { turnIndex: 0 } }]);
        operations.selfConcat([{ set: { key: 'white', value: white } }]);
        operations.selfConcat([{ set: { key: 'black', value: black } }]);
        operations.selfConcat([{ set: { key: 'middle', value: [] } }]);
        operations.selfConcat([{ set: { key: 'stage', value: gameLogic.STAGE.DO_CLAIM } }]);
        operations.selfConcat(setCards);
        operations.selfConcat([{ shuffle: { keys: shuffleKeys } }]);
        operations.selfConcat(setVisibilities);
        return operations;
    }
    gameLogic.getInitialMove = getInitialMove;
    /**
     * Get the move operations for declaring cheat
     */
    function getDeclareCheaterMove(state, turnIndexBeforeMove, declareCheater) {
        var operations = [];
        if (declareCheater) {
            // No skipping
            operations.selfConcat([{ setTurn: { turnIndex: turnIndexBeforeMove } }]);
            operations.selfConcat([{ set: { key: 'stage', value: gameLogic.STAGE.CHECK_CLAIM } }]);
            var setVisibilities = [];
            for (var i = 0; i < state.middle.length; i++) {
                setVisibilities.selfConcat([{ setVisibility: { key: 'card' + state.middle[i], visibleToPlayerIndexes: [turnIndexBeforeMove] } }]);
            }
            operations.selfConcat(setVisibilities);
        }
        else {
            // Skip declaring cheater if the opponent does not empty all cards
            //if (turnIndexBeforeMove === 0) {
            //  // White
            //  check(state.black.length !== 0);
            //} else {
            //  check(state.white.length !== 0);
            //}
            operations.selfConcat([{ setTurn: { turnIndex: turnIndexBeforeMove } }]);
            if (getWinner(state) === -1)
                operations.selfConcat([{ set: { key: 'stage', value: gameLogic.STAGE.DO_CLAIM } }]);
            else
                operations.selfConcat([{ set: { key: 'stage', value: gameLogic.STAGE.END } }]);
        }
        return operations;
    }
    gameLogic.getDeclareCheaterMove = getDeclareCheaterMove;
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
    gameLogic.didCheat = didCheat;
    function getMoveCheckIfCheated(state, turnIndexBeforeMove) {
        var loserIndex = didCheat(state) ? 1 - turnIndexBeforeMove : turnIndexBeforeMove, loserCards = [], loserNewCards, operations = [], setVisibilities = [];
        if (loserIndex === 0) {
            loserCards = state.white;
        }
        else {
            loserCards = state.black;
        }
        loserNewCards = loserCards.concat(state.middle);
        operations.selfConcat([{ setTurn: { turnIndex: turnIndexBeforeMove } }]);
        if (loserIndex === 0) {
            operations.selfConcat([{ set: { key: 'white', value: loserNewCards } }]);
        }
        else {
            operations.selfConcat([{ set: { key: 'black', value: loserNewCards } }]);
        }
        operations.selfConcat([{ set: { key: 'middle', value: [] } }]);
        operations.selfConcat([{ set: { key: 'stage', value: gameLogic.STAGE.DO_CLAIM } }]);
        for (var i = 0; i < state.middle.length; i++) {
            if (loserIndex === 0) {
                setVisibilities.selfConcat([{ setVisibility: { key: 'card' + state.middle[i], visibleToPlayerIndexes: [0] } }]);
            }
            else {
                setVisibilities.selfConcat([{ setVisibility: { key: 'card' + state.middle[i], visibleToPlayerIndexes: [1] } }]);
            }
        }
        operations.selfConcat(setVisibilities);
        operations.selfConcat([{ set: { key: 'claim', value: [] } }]);
        return operations;
    }
    gameLogic.getMoveCheckIfCheated = getMoveCheckIfCheated;
    function getClaimMove(state, turnIndexBeforeMove, claim, cardsToMoveToMiddle) {
        // First check if number of cards claimed is legal and the number of
        // cards move to middle match the number of cards claimed
        check(cardsToMoveToMiddle.length >= 1 && cardsToMoveToMiddle.length <= 4);
        check(cardsToMoveToMiddle.length === claim[0]);
        var lastClaim = state.claim, lastWorB, newWorB, lastM, newM;
        if (!angular.isUndefined(lastClaim) && !angular.isUndefined(lastClaim[0])) {
            // If the last claim exists, the rank of the latest claim must be
            // close or equal to the last claim.
            check(isCloseRank(lastClaim[1], claim[1]));
        }
        // Get the cards of the player who makes the claim
        if (turnIndexBeforeMove === 0) {
            lastWorB = state.white;
        }
        else {
            lastWorB = state.black;
        }
        newWorB = lastWorB.clone();
        newWorB.selfSubtract(cardsToMoveToMiddle);
        lastM = state.middle;
        newM = lastM.concat(cardsToMoveToMiddle);
        var operations = [];
        operations.selfConcat([{ setTurn: { turnIndex: 1 - turnIndexBeforeMove } }]);
        if (turnIndexBeforeMove === 0) {
            operations.selfConcat([{ set: { key: 'white', value: newWorB } }]);
            operations.selfConcat([{ set: { key: 'middle', value: newM } }]);
        }
        else {
            operations.selfConcat([{ set: { key: 'black', value: newWorB } }]);
            operations.selfConcat([{ set: { key: 'middle', value: newM } }]);
        }
        var setVisibilities = [];
        for (var i = 0; i < cardsToMoveToMiddle.length; i++) {
            setVisibilities.selfConcat([{ setVisibility: { key: 'card' + cardsToMoveToMiddle[i], visibleToPlayerIndexes: [] } }]);
        }
        operations.selfConcat([{ set: { key: 'claim', value: claim } }]);
        operations.selfConcat([{ set: { key: 'stage', value: gameLogic.STAGE.DECLARE_CHEATER } }]);
        operations.selfConcat(setVisibilities);
        return operations;
    }
    gameLogic.getClaimMove = getClaimMove;
    function getWinMove(state) {
        var operations = [];
        var winner = getWinner(state);
        if (winner === 0) {
            operations.selfConcat([{ endMatch: { endMatchScores: [1, 0] } }]);
        }
        else if (winner === 1) {
            operations.selfConcat([{ endMatch: { endMatchScores: [0, 1] } }]);
        }
        operations.selfConcat([{ set: { key: 'middle', value: [] } }]);
        operations.selfConcat([{ set: { key: 'stage', value: gameLogic.STAGE.END } }]);
        return operations;
    }
    gameLogic.getWinMove = getWinMove;
    /**
     * Check if the move is OK.
     *
     * @param params the match info which contains stateBeforeMove,
     *              stateAfterMove, turnIndexBeforeMove, turnIndexAfterMove,
     *              move.
     * @returns return true if the move is ok, otherwise false.
     */
    function isMoveOk(params) {
        var stateBeforeMove = params.stateBeforeMove, turnIndexBeforeMove = params.turnIndexBeforeMove, move = params.move, expectedMove;
        /*********************************************************************
         * 1. If the stateBeforeMove is empty, then it should be the first
         *    move, set the board of stateBeforeMove to be the initial board.
         *    If the stateBeforeMove is not empty, then the move operations
         *    array should have a length of 4.
         ********************************************************************/
        try {
            switch (params.stateBeforeMove.stage) {
                case gameLogic.STAGE.DO_CLAIM:
                    var claim = move[3].set.value;
                    var lastM = stateBeforeMove.middle;
                    var newM = move[2].set.value;
                    var diffM = newM.clone();
                    diffM.selfSubtract(lastM);
                    expectedMove = getClaimMove(stateBeforeMove, turnIndexBeforeMove, claim, diffM);
                    break;
                case gameLogic.STAGE.DECLARE_CHEATER:
                    //   check(move[1].set.value === STAGE.DO_CLAIM || move[1].set.value === STAGE.CHECK_CLAIM);
                    var declareCheater = move[1].set.value === gameLogic.STAGE.CHECK_CLAIM;
                    expectedMove = getDeclareCheaterMove(stateBeforeMove, turnIndexBeforeMove, declareCheater);
                    break;
                case gameLogic.STAGE.CHECK_CLAIM:
                    expectedMove = getMoveCheckIfCheated(stateBeforeMove, turnIndexBeforeMove);
                    break;
                case gameLogic.STAGE.END:
                    expectedMove = getWinMove(stateBeforeMove);
                    break;
                default:
                    if (turnIndexBeforeMove != 0 || angular.isUndefined(stateBeforeMove)) {
                        throw new Error("Illegal initial move!");
                    }
                    expectedMove = getInitialMove();
                    break;
            }
        }
        catch (e) {
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
    gameLogic.isMoveOk = isMoveOk;
})(gameLogic || (gameLogic = {}));
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
;var game;
(function (game) {
    function createClaimEnv() {
        createButton(translate('CANCEL'), 400, game.bottomPos - 100, resetAll);
        createButton(translate('MKCLAIM'), 200, game.bottomPos - 100, Claim);
        hideButton(translate('MKCLAIM'));
        createOpts();
        hideButton("ops");
        showButton(translate('CANCEL'));
        game.updateStage();
    }
    game.createClaimEnv = createClaimEnv;
    ;
    function createDecEnv() {
        createDecPanel();
        //clearEverything ();
        //showSelectionPanel ();
    }
    game.createDecEnv = createDecEnv;
    function createDecPanel() {
        var panel = new createjs.Container();
        var background = new createjs.Shape();
        background.graphics.beginFill("#006400").drawRect(0, 600, 600, 800);
        var message = game.state.claim[0] + translate('M1') + game.state.claim[1] + translate('M2');
        var label = new createjs.Text(message, "bold 40px 'Shadows Into Light'", "#FFFFFF");
        label.textAlign = "center";
        label.textBaseline = "middle";
        label.x = 300;
        label.y = 650;
        panel.addChild(background, label);
        game.stage.addChild(panel);
        createButton(translate('BULLSHIT'), 100, 800, function () {
            game.declare(true);
        });
        createButton(translate('PASS'), 350, 800, function () { game.declare(false); });
        game.updateStage();
    }
    game.createDecPanel = createDecPanel;
    function showPlayerIndex(turnIndex) {
        var message = translate('PTI') + " " + turnIndex;
        var label = new createjs.Text(message, "bold 35px 'Shadows Into Light'", "#FFFFFF");
        label.x = 20;
        label.y = 20;
        var c = (game.state.claim === undefined || game.state.claim[1] === undefined ? "" : game.state.claim[1]);
        var claimMessage = translate('LAST') + " " + c;
        var label2 = new createjs.Text(claimMessage, "bold 35px 'Shadows Into Light'", "#FFFFFF");
        label2.x = 300;
        label2.y = 20;
        game.stage.addChild(label, label2);
    }
    game.showPlayerIndex = showPlayerIndex;
    function showButton(message) {
        game.buttons[message].visible = true;
        game.updateStage();
    }
    game.showButton = showButton;
    function hideButton(message) {
        game.buttons[message].visible = false;
        game.updateStage();
    }
    game.hideButton = hideButton;
    function createOpts() {
        var shape = new createjs.Shape();
        shape.graphics.beginFill("#006400").drawRect(0, 0, 800, 800);
        shape.x = 0;
        shape.y = 660;
        game.stage.addChild(shape);
        game.buttons["ops"] = shape;
    }
    game.createOpts = createOpts;
    function Claim() {
        game.cardsClickable = 0;
        hideButton(translate('MKCLAIM'));
        showButton("ops");
        console.log(game.claimCards);
        showSelectionPanel();
        game.updateStage();
    }
    game.Claim = Claim;
    function showSelectionPanel() {
        for (var i = 0; i < game.claimCards.length; i++)
            showButton(game.claimCards[i]);
    }
    game.showSelectionPanel = showSelectionPanel;
    function createBall() {
        game.ball = new createjs.Shape();
        game.ball.graphics.beginFill("orange").drawCircle(0, 0, 10);
        game.ball.visible = false;
        game.ball.on("pressmove", function (evt) {
            this.y = evt.stageY;
            this.x = evt.stageX;
            game.stage.update();
        });
        game.stage.on("pressup", function () {
            game.ball.visible = false;
            for (var i = 0; i < game.mycards.length; i++) {
                if (game.mycards[i].alpha === 0.2)
                    selectCard(game.mycards[i]);
            }
            game.updateStage();
        });
        game.stage.addChild(game.ball);
    }
    game.createBall = createBall;
    function createSelectionPanel() {
        var currentClaim = game.state.claim === undefined ? undefined : game.state.claim[1];
        game.claimCards = gameLogic.getRankArray(currentClaim);
        var row = 80;
        var col = game.bottomPos;
        for (var i = 0; i < game.claimCards.length; i++) {
            var text = game.claimCards[i];
            createSmallButton(text, row, col, callback);
            row += 100;
            if (i == 4 || i == 9) {
                row = 80;
                col += 100;
            }
        }
        hideSelctionPanel();
    }
    game.createSelectionPanel = createSelectionPanel;
    function callback() {
        game.claimBuffer = this;
        console.log(game.claimBuffer);
        if (isACheat()) {
            game.sureToClaim = true;
            //updateUI ();
            $rootScope.$apply();
        }
        else {
            makeACheat();
        }
    }
    game.callback = callback;
    function isACheat() {
        for (var i = 0; i < game.middleCards.length; i++) {
            var tmp = gameLogic.getCard(game.middleCards[i]);
            if (tmp.length === 3 && game.claimBuffer === "10")
                continue;
            if (tmp[1] !== game.claimBuffer[0])
                return true;
        }
        return false;
    }
    game.isACheat = isACheat;
    function makeACheat() {
        game.clearEverything();
        var rank = "" + game.claimBuffer;
        console.log(game.middle.clone());
        var claim = [game.middle.length - game.state.middle.length, rank];
        var diffM = game.middle.clone();
        diffM.selfSubtract(game.state.middle);
        var operations = gameLogic.getClaimMove(game.state, game.turnIndex, claim, diffM);
        gameService.makeMove(operations);
    }
    game.makeACheat = makeACheat;
    function hideSelctionPanel() {
        for (var i = 0; i < game.claimCards.length; i++)
            hideButton(game.claimCards[i]);
    }
    game.hideSelctionPanel = hideSelctionPanel;
    function displayCards(limit) {
        var n = game.mycardsVal.length;
        var start = 10;
        var end = 480;
        game.interPos = (end - start) / (n > limit ? limit : n);
        var x = start - game.interPos;
        var y = game.bottomPos;
        for (var i = 0; i < n; i++) {
            var cardType = 1;
            x += game.interPos;
            if (i === limit || i === limit * 2 || i === limit * 3) {
                x = start;
                y += 50;
            }
            var tmpi = i + 1;
            if (i + limit < n + game.cardLength && (parseInt("" + (n - 1) / limit) !== parseInt("" + i / limit))) {
                cardType = 3;
            }
            if (tmpi === limit || tmpi === limit * 2 || tmpi === limit * 3 || i === n - 1) {
                cardType = 2;
            }
            addpic(game.mycardsVal[i], x, y, cardType, limit, i);
        }
    }
    game.displayCards = displayCards;
    function displayOppCards(limit) {
        var n = game.playerTwoCards.length;
        var start = 10;
        var end = 480;
        var interPos = (end - start) / (n > limit ? limit : n);
        var x = start - interPos;
        var y = game.upperPos;
        for (var i = 0; i < n; i++) {
            x += interPos;
            if (i === limit || i === limit * 2 || i === limit * 3) {
                x = start;
                y += 50;
            }
            addpic("qb1fv", x, y, 1, limit, i);
        }
    }
    game.displayOppCards = displayOppCards;
    function displayMiddle(limit) {
        if (game.gameOngoing === 0)
            return;
        var n = game.middle.length;
        var start = 10;
        var end = 480;
        var interPos = (end - start) / (n > limit ? limit : n);
        var x = start - interPos;
        var y = game.middlePos;
        for (var i = 0; i < n; i++) {
            x += interPos;
            if (i === limit || i === limit * 2 || i === limit * 3) {
                x = start;
                y += 50;
            }
            addpic("qb1fh", x, y, 1, limit, i);
        }
    }
    game.displayMiddle = displayMiddle;
    function createSmallButton(message, _x, _y, func) {
        console.log("creating" + message);
        var reset = new createjs.Shape();
        reset.graphics.beginFill("white").drawRect(0, 0, 60, 80);
        var rec = new createjs.Shape();
        rec.graphics.beginStroke("black").drawRect(20, 20, 25, 35);
        var label = new createjs.Text(message, "15px Arial'", "black");
        label.textAlign = "left";
        label.textBaseline = "top";
        label.x = 5;
        label.y = 5;
        var labelr = new createjs.Text(message, "15px Arial'", "black");
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
        game.buttons[message] = button;
        button.z = 2;
        game.stage.addChild(button);
    }
    game.createSmallButton = createSmallButton;
    function createButton(message, _x, _y, func) {
        var reset = new createjs.Shape();
        reset.graphics.beginFill("#FA8072").drawRoundRect(0, 0, 150, 60, 10);
        var label = new createjs.Text(message, "bold 24px 'Shadows Into Light'", "#FFFFFF");
        label.textAlign = "center";
        label.textBaseline = "middle";
        label.x = 150 / 2;
        label.y = 60 / 2;
        var button = new createjs.Container();
        button.name = message;
        button.x = _x;
        button.y = _y;
        button.addChild(reset, label);
        button.on("click", func);
        game.buttons[message] = button;
        button.z = 1;
        game.stage.addChild(button);
    }
    game.createButton = createButton;
    function nameToInd(i) {
        var strval = gameLogic.getCard(parseInt(i));
        for (var j = 0; j < 52; j++) {
            if (game.state["card" + j] === strval)
                return j;
        }
        return -1;
    }
    game.nameToInd = nameToInd;
    function resetAll() {
        game.cardsClickable = 1;
        for (var i = 0; i < game.mycards.length; i++)
            clearcard(game.mycards[i]);
        game.updateStage();
    }
    game.resetAll = resetAll;
    function setcard(image) {
        game.cardsCnt++;
        if (game.cardsCnt > 4) {
            game.cardsCnt--;
            return;
        }
        showButton(translate('MKCLAIM'));
        hideButton("ops");
        hideSelctionPanel();
        image.y -= 30;
        image.clicked = 1;
        game.middleCards.push(image.name);
        game.middle.push(nameToInd(image.name));
        console.log(game.middleCards);
    }
    game.setcard = setcard;
    function clearcard(image) {
        if (image.clicked === 0)
            return;
        hideButton("ops");
        hideSelctionPanel();
        game.cardsCnt--;
        if (game.cardsCnt === 0)
            hideButton(translate('MKCLAIM'));
        else
            showButton(translate('MKCLAIM'));
        image.y += 30;
        image.clicked = 0;
        rmFromMiddle(image.name);
    }
    game.clearcard = clearcard;
    function rmFromMiddle(i) {
        var t = nameToInd(i);
        for (var j = 0; j < game.middle.length; j++) {
            if (game.middle[j] === t)
                game.middle.splice(j, 1);
            if (game.middleCards[j] === i)
                game.middleCards.splice(j, 1);
        }
        console.log(game.middle);
    }
    game.rmFromMiddle = rmFromMiddle;
    function selectCard(card) {
        if (game.cardsClickable === 0)
            return;
        if (card.clicked === 0) {
            setcard(card);
        }
        else {
            clearcard(card);
        }
    }
    game.selectCard = selectCard;
    function addpic(i, _x, _y, cardType, limit, ind) {
        var tmpImg = new Image();
        var baseHead = "imgs/cards/";
        var baseTail = ".png";
        var src = baseHead + i + baseTail;
        tmpImg.onload = game.updateStage;
        tmpImg.src = src;
        tmpImg.height = 200;
        var image = new createjs.Bitmap(tmpImg);
        image.z = -1;
        image.set({ x: _x, y: _y });
        image.scaleX = 2.0;
        image.scaleY = 2.0;
        image.name = i;
        image.cardType = cardType;
        image.clicked = 0;
        image.on("click", function () {
            if (image.name === "qb1fv" || image.name === "qb1fh")
                return;
            selectCard(image);
        });
        image.on("pressmove", function (evt) {
            if (image.name === "qb1fv" || image.name === "qb1fh")
                return;
            game.ball.x = evt.stageX;
            game.ball.y = evt.stageY;
            game.ball.visible = true;
            image.alpha = 0.2;
            game.updateStage();
        });
        image.on("tick", function () {
            if (image.name === "qb1fv" || image.name === "qb1fh")
                return;
            if (game.ball === undefined)
                return;
            if (game.ball.visible === false) {
                image.alpha = 1;
                return;
            }
            if (image.cardType === 3) {
                var cardBelowHeight;
                var targetInd = ind + limit;
                if (targetInd >= game.mycardsVal.length && targetInd < game.mycardsVal.length + game.cardLength)
                    targetInd = game.mycardsVal.length - 1;
                var cardBelow = game.stage.getChildByName("" + game.mycardsVal[targetInd]);
                if (cardBelow === undefined || cardBelow === null || cardBelow.clicked === 0) {
                    cardBelowHeight = 50;
                }
                else {
                    cardBelowHeight = 20;
                }
                if (game.ball.y > image.y && game.ball.y < image.y + cardBelowHeight && Math.abs(image.x - game.ball.x) <= game.interPos / 2) {
                    image.alpha = 0.2;
                }
                else
                    image.alpha = 1;
                return;
            }
            if ((game.ball.y >= image.y && Math.abs(image.x - game.ball.x) <= game.interPos / 2) || (image.cardType === 2 &&
                game.ball.y >= image.y && game.ball.x > image.x && Math.abs(game.ball.x - image.x) <= 140)) {
                image.alpha = 0.2;
            }
            else {
                image.alpha = 1;
            }
        });
        game.mycards.push(image);
        game.stage.addChild(image);
    }
    game.addpic = addpic;
})(game || (game = {}));
var game;
(function (game) {
    game.canMakeMove = false;
    game.isComputerTurn = false;
    game.state = null;
    game.turnIndex = null;
    game.isHelpModalShown = false;
    game.middle = [];
    game.bottomPos = 700;
    game.middlePos = 400;
    game.upperPos = 100;
    game.cardLength = 5;
    function init() {
        console.log("initing");
        resizeGameAreaService.setWidthToHeight(0.6);
        gameService.setGame({
            minNumberOfPlayers: 2,
            maxNumberOfPlayers: 2,
            isMoveOk: gameLogic.isMoveOk,
            updateUI: updateUI
        });
    }
    game.init = init;
    function updateUI(params) {
        game.stage = new createjs.Stage("demoCanvas");
        game.state = params.stateAfterMove;
        game.STAGE = gameLogic.STAGE;
        if (gameLogic.isEmptyObj(game.state)) {
            if (params.yourPlayerIndex === 0) {
                gameService.makeMove(gameLogic.getInitialMove());
                game.gameOngoing = 1;
            }
            return;
        }
        game.canMakeMove = params.turnIndexAfterMove >= 0 &&
            params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
        game.turnIndex = params.turnIndexAfterMove;
        game.clearEverything();
        game.middle = game.state.middle.clone();
        if (game.turnIndex === 0) {
            game.playerOneCards = game.state.white.clone();
            game.playerTwoCards = game.state.black.clone();
        }
        else if (game.turnIndex === 1) {
            game.playerOneCards = game.state.black.clone();
            game.playerTwoCards = game.state.white.clone();
        }
        else {
            if (params.yourPlayerIndex === 0) {
                game.playerOneCards = game.state.white.clone();
                game.playerTwoCards = game.state.black.clone();
            }
            else {
                game.playerOneCards = game.state.black.clone();
                game.playerTwoCards = game.state.white.clone();
            }
        }
        game.initUI();
        var isComputerTurn = game.canMakeMove &&
            params.playersInfo[params.yourPlayerIndex].playerId === '';
        if (params.playMode === 'playAgainstTheComputer' && (game.turnIndex != 0))
            game.canMakeMove = false;
        if (game.canMakeMove) {
            switch (game.state.stage) {
                case game.STAGE.DO_CLAIM:
                    console.log("Do Claim");
                    game.displayCards(20);
                    game.createClaimEnv();
                    game.createSelectionPanel();
                    game.updateClaimRanks();
                    game.createBall();
                    break;
                case game.STAGE.DECLARE_CHEATER:
                    game.mutex = 0;
                    game.createDecEnv();
                    console.log("declare cheater");
                    break;
                case game.STAGE.CHECK_CLAIM:
                    console.log("check claim");
                    game.ifCheat = true;
                    game.resultMessage = translate('PLAYER') + game.turnIndex + ": ";
                    game.resultMessage += gameLogic.didCheat(game.state) ? translate('SUC') : translate('FAIL');
                    game.checkDeclaration();
                    break;
            }
        }
        if (isComputerTurn) {
            game.canMakeMove = false;
            if (game.state.stage === game.STAGE.CHECK_CLAIM) {
                game.ifCheat = true;
                game.resultMessage = translate('PLAYER') + game.turnIndex + ": ";
                game.resultMessage += gameLogic.didCheat(game.state) ? translate('SUC') : translate('FAIL');
            }
            game.sendComputerMove();
        }
    }
    angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
        .run(['initGameServices', function (initGameServices) {
            $rootScope['game'] = game;
            translate.setLanguage('en', {
                "RULES_SLIDE1": "Cheat is a deception card game where the players aim to get rid of all of there cards.",
                "RULES_SLIDE2": "On their turn a player must select from their hand 1~4 cards to make a claim as what those cards are.",
                "RULES_SLIDE3": "For each claim a player can only claim the cards whose rank is 1 rank higher or 1 lower or the same as the card at last claim.",
                "NEW_TO_CHEAT": "New to Cheat(Bullshit) ?",
                "RULES_SLIDE4": "For each opposite's claim, a player can call it a cheat(bullshit) or pass.",
                "RULES_SLIDE5": "If a cheat is called, then the opposite will get all the cards in the middle if he did cheat. Otherwise, the player will get all these cards.",
                "CANCEL": "Cancel",
                "SURE": "Sure",
                "RESULT": "Result",
                "MKCLAIM": "Make Claim",
                "CHEAT": "Cheat ",
                "SURE2": "This is a Cheat!",
                "AREYOUSURE": "Are you sure that you want to cheat?",
                "PTI": "Player index:",
                "M1": " cards claimed to be ",
                "M2": "\n\n What do you think ?",
                "LAST": "Last Claim:",
                "BULLSHIT": "BullSh ! t",
                "PASS": "Pass",
                "PLAYER": "Player  ",
                "SUC": "Cheat call success!",
                "FAIL": "Cheat call fails!",
                "CLOSE": "Close"
            });
            game.init();
        }]);
})(game || (game = {}));
var game;
(function (game) {
    function updateStage() {
        game.stage.update();
    }
    game.updateStage = updateStage;
    // Check the declaration
    function checkDeclaration() {
        var operations = gameLogic.getMoveCheckIfCheated(game.state, game.turnIndex);
        gameService.makeMove(operations);
    }
    game.checkDeclaration = checkDeclaration;
    // Check if there's a winner
    function hasWinner() {
        return gameLogic.getWinner(game.state) !== -1;
    }
    game.hasWinner = hasWinner;
    // Send computer move
    function sendComputerMove() {
        var operations = gameLogic.createComputerMove(game.state, game.turnIndex);
        if (game.turnIndex === 1) {
            gameService.makeMove(operations);
        }
    }
    game.sendComputerMove = sendComputerMove;
    // Check if the game ends, and if so, send the end game operations
    function checkEndGame() {
        if (hasWinner() && game.state.stage === gameLogic.STAGE.DO_CLAIM) {
            // Only send end game operations in DO_CLAIM stage
            clearEverything();
            game.gameOngoing = 0;
            var operation = gameLogic.getWinMove(game.state);
            gameService.makeMove(operation);
        }
    }
    game.checkEndGame = checkEndGame;
    // Declare a cheater or pass
    function declare(declareCheater) {
        if (game.mutex === 1) {
            return;
        }
        var operations = gameLogic.getDeclareCheaterMove(game.state, game.turnIndex, declareCheater);
        gameService.makeMove(operations);
        game.mutex = 1;
    }
    game.declare = declare;
    ;
    // Sort the cards according to the ranks
    function sortRanks() {
        var sortFunction = function (cardA, cardB) {
            if (game.state["card" + cardA] !== null) {
                // Only sort the cards while they are not hidden
                var rankA = game.state["card" + cardA].substring(1);
                var rankB = game.state["card" + cardB].substring(1);
                var scoreA = gameLogic.getRankScore(rankA);
                var scoreB = gameLogic.getRankScore(rankB);
                return scoreA - scoreB;
            }
            return 1;
        };
        game.playerOneCards.sort(sortFunction);
        game.playerTwoCards.sort(sortFunction);
    }
    game.sortRanks = sortRanks;
    // Update the ranks for claiming
    function updateClaimRanks() {
        if (angular.isUndefined(game.state.claim)) {
            claimRanks = gameLogic.getRankArray();
        }
        else {
            var rank = game.state.claim[1];
            claimRanks = gameLogic.getRankArray(rank);
        }
    }
    game.updateClaimRanks = updateClaimRanks;
    function clearEverything() {
        game.cardsCnt = 0;
        game.mycards = [];
        game.buttons = {};
        game.mycardsVal = [];
        game.middleCards = [];
        game.cardsClickable = 1;
        game.claimCards = [];
        game.stage.removeAllChildren();
        updateStage();
    }
    game.clearEverything = clearEverything;
    function initUI() {
        sortRanks();
        for (var i = 0; i < game.playerOneCards.length; i++) {
            var tmp = "card" + game.playerOneCards[i];
            var tmpCard = gameLogic.getCardReverse(game.state[tmp]);
            game.mycardsVal.push(tmpCard);
        }
        checkEndGame();
        if (game.gameOngoing === 0)
            return;
        game.showPlayerIndex(game.turnIndex);
        game.displayOppCards(35);
        game.displayMiddle(35);
        updateStage();
    }
    game.initUI = initUI;
})(game || (game = {}));
