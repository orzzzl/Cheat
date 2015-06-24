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
    resizeGameAreaService.setWidthToHeight(1);

    var canMakeMove = false;
    var state = null;
    var stage = new createjs.Stage("demoCanvas");
    var turnIndex = null;
    var cardsCnt = 0;

    function sendComputerMove() {
      gameService.makeMove(gameLogic.getRandomMove(state, turnIndex));
    }

    function updateUI(params) {
      state = params.stateAfterMove;
      if (state.board === undefined) {
        state.board = gameLogic.getInitialBoard();
      }
      canMakeMove = params.turnIndexAfterMove >= 0 && // game is ongoing
      params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
      turnIndex = params.turnIndexAfterMove;

      // Is it the computer's turn?
      var isComputerTurn = canMakeMove &&
      params.playersInfo[params.yourPlayerIndex].playerId === '';
      if (isComputerTurn) {
        canMakeMove = false;
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
      console.log("Clicked");
      sendUserMove(gameLogic.createMove(state, turnIndex, userChoices));
    }

    $scope.initGame = function () {
      for (var i = 1; i <= 13; i ++) {
        var x = 40 * i;
        var y = 800;
        addpic(i, x, y);
      }
      updateStage();
    };

    /*************** My Helper functions ***************/
    function updateStage() {
      stage.update();
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
        if (image.clicked === 0) {
          cardsCnt ++;
          if (cardsCnt > 4) {
            cardsCnt --;
            return;
          }
          image.y -= 30;
          image.clicked = 1;
        } else {
          cardsCnt --;
          image.y += 30;
          image.clicked = 0;
        }
        updateStage();
      })
      stage.addChild(image);
    }


    gameService.setGame({
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      isMoveOk: gameLogic.isMoveOk,
      updateUI: updateUI
    });
  }]);
