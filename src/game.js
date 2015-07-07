angular.module('myApp')
.controller('Ctrl',
['$scope', '$log', '$timeout',
  'gameService', 'gameLogic',
  'resizeGameAreaService', '$translate',
  function ($scope, $log, $timeout,
            gameService, gameLogic,
            resizeGameAreaService, $translate) {
    'use strict';


    $log.info($translate('RULES_OF_TICTACTOE')); // Example of using $translate

    // TODO: choose your width-to-height ratio (1 means the board is square).
    resizeGameAreaService.setWidthToHeight(0.6);

    var bottomPos = 750;
    var middlePos = 400;
    var upperPos = 100;
    var interPos =  25;
    var interPosOpp = 15;
    var cardlength = 50;
    var canMakeMove = false;
    var state = null;
    var stage = new createjs.Stage("demoCanvas");
    var turnIndex = null;
    var cardsCnt = 0;
    var mycards = [];
    var buttons = {};
    var mycardsVal= [];
    var cardsClickable = 1;
    var claimCards = [];
    var STAGE = gameLogic.STAGE;


    function updateUI(params) {
      $scope.state = params.stateAfterMove;
      // If the state is empty, first initialize the board...
      if (gameLogic.isEmptyObj($scope.state)) {
        if (params.yourPlayerIndex === 0) {
          gameService.makeMove(gameLogic.getInitialMove());
        }
        return;
      }
      console.log (params.stateAfterMove);
      // Get the new state
      // Get the current player index (For creating computer move...)
      $scope.currIndex = params.turnIndexAfterMove;
      $scope.isYourTurn = params.turnIndexAfterMove >= 0 && // game is ongoing
      params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
      $scope.isAiMode = $scope.isYourTurn

      && params.playersInfo[params.yourPlayerIndex].playerId === '';
      $scope.playMode = params.playMode;

      // Get the cards for player one area, player two area and middle area
      $scope.middle = $scope.state.middle.clone();
      turnIndex = params.turnIndexAfterMove;


      if (params.playMode === 'playAgainstTheComputer' || ($scope.currIndex === 0 && params.playMode === 'passAndPlay')) {
        // If the game is played in the same device, use the default setting
        $scope.playerOneCards = $scope.state.white.clone();
        $scope.playerTwoCards = $scope.state.black.clone();
      } else if (params.playMode === 'passAndPlay' && $scope.currIndex === 1) {
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
      stage.removeAllChildren ();
      displayOppCards (35);
      displayCards(20);
      $scope.initGame ();
      createSelectionPanel ();
      // Is it the computer's turn?
      var isComputerTurn = canMakeMove &&
      params.playersInfo[params.yourPlayerIndex].playerId === '';

      // In case the board is not updated
      if (!$scope.$$phase) {
        $scope.$apply();
      }

      // If the game ends, send the end game operation directly
      checkEndGame();
      console.log ("is your turn is: " + $scope.isYourTurn);
      if ($scope.isYourTurn) {
        switch($scope.state.stage) {
          case STAGE.DO_CLAIM:
          console.log ("Do Claim");
            updateClaimRanks();
            break;
          case STAGE.DECLARE_CHEATER:
            console.log ("declare cheater");
            break;
          case STAGE.CHECK_CLAIM:
          console.log ("check claim");
            checkDeclaration();
            break;
          default:
        }
      }

      if (isComputerTurn) {
        canMakeMove = false;
        sendComputerMove();
      }
      console.log (gameLogic.getInitialMove());
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

    $scope.initGame = function () {
      createButton ("Cancel", 400, bottomPos - 100, resetAll);
      createButton("Make Claim", 200, bottomPos - 100, Claim);
      hideButton("Make Claim");
      createOpts ();
      hideButton("ops");
      updateStage();
    };

    /*************** My Helper functions ***************/
    // Update the ranks for claiming
    function updateClaimRanks () {
      if (angular.isUndefined($scope.state.claim)) {
        $scope.claimRanks = gameLogic.getRankArray();
      } else {
        var rank = $scope.state.claim[1];
        $scope.claimRanks = gameLogic.getRankArray(rank);
      }
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
      if (hasWinner() && $scope.stage === STAGE.DO_CLAIM) {
        // Only send end game operations in DO_CLAIM stage
        var operation = gameLogic.getWinMove($scope.state);
        gameService.makeMove(operation);
      }
    }



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
      shape.graphics.beginFill("#006400").drawRect(0, 0, 600, 400);
      shape.x = 0;
      shape.y = 710;
      stage.addChild (shape);
      buttons["ops"] = shape;
    }

    function Claim () {
      cardsClickable = 0;
      hideButton("Make Claim");
      showButton("ops");

      console.log (claimCards);
      //createSmallButton("1", 80, bottomPos, function () {alert("1")});
      //createSmallButton("2", 180, bottomPos, function () {alert("2")});
      //createSmallButton("3", 280, bottomPos, function () {alert("3")});
      //showButton("1");
      //showButton("2");
      //showButton("3");
      showSelectionPanel ();
      updateStage();
    }
    function showSelectionPanel () {
      for (var i = 0; i < claimCards.length; i ++)
        showButton(claimCards [i]);
    }

    function createSelectionPanel () {
      //console.log(claimCards);
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
          col += 80;
        }
      }
      hideSelctionPanel();
    }

    function callback () {
      var rank = ""  + this;
      displayMiddle (35);
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
      var N;
      if (n > limit)
        N = limit;
      else
        N = n;
      var start = (600 - N * interPos) / 2;
      for (var i = 1; i <= n; i ++) {
        var x = interPos * (i - 1) + start - cardlength;
        var y = bottomPos;
        if (i > limit)
          y += 50;
        if (i > limit)
          x -= (interPos * limit + start - cardlength);
        addpic(mycardsVal [i - 1], x, y);
      }
    }

    function displayOppCards (limit) {
      var n = $scope.playerTwoCards.length;
      var N;
      if (n > limit)
        N = limit;
      else
        N = n;
      var start = (600 - N * interPos) / 2;
      for (var i = 1; i <= n; i ++) {
        var x = interPosOpp * (i - 1) + start - cardlength;
        var y = upperPos;
        if (i > limit)
          y += 50;
        if (i > limit)
          x -= (interPos * limit + start - cardlength);
        addpic("qb2fv", x, y);
      }
    }

    function displayMiddle (limit) {
      var n = $scope.middle.length;
      var N;
      if (n > limit)
        N = limit;
      else
        N = n;
      var start = (600 - N * interPos) / 2;
      for (var i = 1; i <= n; i ++) {
        var x = interPosOpp * (i - 1) + start - cardlength - 100;
        var y = middlePos;
        if (i > limit)
          y += 50;
        if (i > limit)
          x -= (interPos * limit + start - cardlength);
        addpic("qb2fh", x, y);
      }
    }


    function updateStage() {
      stage.update();
    }

    function createSmallButton (message, _x, _y, func) {
      console.log ("creating" + message);
      var reset = new createjs.Shape();
      reset.graphics.beginFill("DeepSkyBlue").drawRoundRect(0, 0, 60, 60, 10);
      var label = new createjs.Text (message, "bold 24px Arial", "#FFFFFF");
      label.textAlign = "center";
      label.textBaseline = "middle";
      label.x = 60/2;
      label.y = 60/2;

      var button = new createjs.Container();
      button.name = message;
      button.x = _x;
      button.y = _y;
      button.addChild(reset, label);
      button.on("click", func, message);
      buttons[message] = button;
      button.z = 2;
      stage.addChild(button);
    }

    function createButton (message, _x, _y, func) {
      var reset = new createjs.Shape();
      reset.graphics.beginFill("DeepSkyBlue").drawRoundRect(0, 0, 150, 60, 10);
      var label = new createjs.Text (message, "bold 24px Arial", "#FFFFFF");
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
      $scope.middle = $scope.state.middle;
      cardsClickable = 1;
      for (var i = 0; i < mycards.length; i ++)
          clearcard(mycards [i]);
      updateStage();
    }

    function setcard (image) {
      showButton("Make Claim");
      hideButton("ops");
      hideSelctionPanel ();
      $scope.middle.push (nameToInd(image.name));
      cardsCnt ++;
      if (cardsCnt > 4) {
        cardsCnt --;
        return;
      }
      console.log ($scope.middle);
      image.y -= 30;
      image.clicked = 1;
    }

    function clearcard (image) {
      hideButton("ops");
      hideSelctionPanel ()
      if (image.clicked === 0)
          return;
      cardsCnt --;
      if (cardsCnt === 0)
        hideButton("Make Claim");
      else
        showButton("Make Claim");
      image.y += 30;
      image.clicked = 0;
      rmFromMiddle(image.name);
    }

    function rmFromMiddle (i) {
      var t = nameToInd(i);
      for (var j = 0; j < $scope.middle.length; j ++) {
        if ($scope.middle [j] === t)    $scope.middle.splice(j, 1);
      }
      console.log ($scope.middle);
    }



    function addpic (i, _x, _y) {
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
      image.clicked = 0;
      image.on("click", function (){
        if (image.name === "qb2fv")  return;
        if (cardsClickable === 0)    return;
        if (image.clicked === 0) {
          setcard(image);
        } else {
          clearcard(image);
        }
        updateStage();
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
