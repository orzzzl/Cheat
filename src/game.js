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
    var interPos =  25;
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
    function sendComputerMove() {
      gameService.makeMove(gameLogic.getRandomMove(state, turnIndex));
    }

    function updateUI(params) {
      state = params.stateAfterMove;
      // If the state is empty, first initialize the board...
      if (gameLogic.isEmptyObj(state)) {
        if (params.yourPlayerIndex === 0) {
          gameService.makeMove(gameLogic.getInitialMove());
        }
        return;
      }
      console.log (params.stateAfterMove);
      // Get the new state
      $scope.state = params.stateAfterMove;
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

      $scope.playerOneCards = $scope.state.white.clone();
      $scope.playerTwoCards = $scope.state.black.clone();
      sortRanks();
      mycardsVal = [];
      for (var i = 0; i < $scope.playerOneCards.length; i ++) {
        var tmp = "card" + $scope.playerOneCards[i];
        mycardsVal.push($scope.state [tmp]);
      }
      displayCards(20);
      // Is it the computer's turn?
      var isComputerTurn = canMakeMove &&
      params.playersInfo[params.yourPlayerIndex].playerId === '';
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
      createSmallButton("1", 80, bottomPos, function () {alert("1")});
      createSmallButton("2", 180, bottomPos, function () {alert("2")});
      createSmallButton("3", 280, bottomPos, function () {alert("3")});
      hideButton("1");
      hideButton("2");
      hideButton("3");
      hideButton("ops");
      updateStage();
    };

    /*************** My Helper functions ***************/

    // Sort the cards according to the ranks
    function sortRanks() {
      var sortFunction = function(cardA, cardB) {
        if ($scope.state["card" + cardA] !== null) {
          // Only sort the cards while they are not hidden
          var rankA = $scope.state["card" + cardA];
          var rankB = $scope.state["card" + cardB];
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
      showButton("1");
      showButton("2");
      showButton("3");
      updateStage();
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


    function updateStage() {
      stage.update();
    }

    function createSmallButton (message, _x, _y, func) {
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
      button.on("click", func);
      buttons[message] = button;
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
      stage.addChild(button);
    }



    function resetAll () {
      cardsClickable = 1;
      for (var i = 0; i < mycards.length; i ++)
          clearcard(mycards [i]);
      updateStage();
    }

    function setcard (image) {
      showButton("Make Claim");
      hideButton("1");
      hideButton("2");
      hideButton("3");
      hideButton("ops");
      cardsCnt ++;
      if (cardsCnt > 4) {
        cardsCnt --;
        return;
      }
      console.log (image.name);
      image.y -= 30;
      image.clicked = 1;
    }

    function clearcard (image) {
      hideButton("1");
      hideButton("2");
      hideButton("3");
      hideButton("ops");
      if (image.clicked === 0)
          return;
      cardsCnt --;
      if (cardsCnt === 0)
        hideButton("Make Claim");
      else
        showButton("Make Claim");
      image.y += 30;
      image.clicked = 0;
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
      image.set({x: _x, y: _y});
      image.scaleX = 2.0;
      image.scaleY = 2.0;
      image.name = i;
      image.clicked = 0;
      image.on("click", function (){
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
