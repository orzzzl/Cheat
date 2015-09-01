module game {
  export function updateStage () {
    stage.update ();
  }

  // Check the declaration
  export function checkDeclaration() {
    var operations = gameLogic.getMoveCheckIfCheated(state, turnIndex);
    gameService.makeMove(operations);
  }


  // Check if there's a winner
  export function hasWinner() {
    return gameLogic.getWinner(state) !== -1;
  }

  // Send computer move
  export function sendComputerMove() {
    var operations = gameLogic.createComputerMove(state, turnIndex);
    if (turnIndex === 1) {
      gameService.makeMove(operations);
    }
  }

  // Check if the game ends, and if so, send the end game operations
  export function checkEndGame() {
    if (hasWinner() && state.stage === gameLogic.STAGE.DO_CLAIM) {
      // Only send end game operations in DO_CLAIM stage
      clearEverything();
      gameOngoing = 0;
      var operation = gameLogic.getWinMove(state);
      gameService.makeMove(operation);
    }
  }

  // Declare a cheater or pass
  export function declare (declareCheater : any) {
    var operations = gameLogic.getDeclareCheaterMove(state, turnIndex, declareCheater);
    gameService.makeMove(operations)
  };


  // Sort the cards according to the ranks
  export function sortRanks() {
    var sortFunction = function(cardA : any, cardB : any) {
      if (state["card" + cardA] !== null) {
        // Only sort the cards while they are not hidden
        var rankA = state["card" + cardA].substring(1);
        var rankB = state["card" + cardB].substring(1);
        var scoreA = gameLogic.getRankScore(rankA);
        var scoreB = gameLogic.getRankScore(rankB);
        return scoreA - scoreB;
      }
      return 1;
    };
    playerOneCards.sort(sortFunction);
    playerTwoCards.sort(sortFunction);
  }

  // Update the ranks for claiming
  export function updateClaimRanks () {
    if (angular.isUndefined(state.claim)) {
      claimRanks = gameLogic.getRankArray();
    } else {
      var rank = state.claim[1];
      claimRanks = gameLogic.getRankArray(rank);
    }
  }

  export function clearEverything () {
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

  export function initUI() {
    sortRanks();
    for (var i = 0; i < playerOneCards.length; i ++) {
      var tmp = "card" + playerOneCards[i];
      var tmpCard = gameLogic.getCardReverse(state [tmp]);
      mycardsVal.push(tmpCard);
    }
    checkEndGame();
    if (gameOngoing === 0)    return;
    showPlayerIndex (turnIndex);
    displayOppCards (35);
    displayMiddle (35);
    updateStage();
  }

}
