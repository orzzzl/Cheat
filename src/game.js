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
      console.log("hhh");
      var circle = new createjs.Shape();
      circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 50);
      circle.x = 500;
      circle.y = 500;
      stage.addChild(circle);
      addpic("imgs/cards/1.png");
      updateStage();
      //sendUserMove(gameLogic.createMove(state, turnIndex, userChoices));
    };

    /*************** My Helper functions ***************/
    function updateStage() {
      stage.update();
    }

    function addpic (src) {
      var tmpImg = new Image();
      tmpImg.onload = updateStage;
      tmpImg.src = src;
      var image = new createjs.Bitmap(tmpImg);
      stage.addChild(image);
    }


    gameService.setGame({
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      isMoveOk: gameLogic.isMoveOk,
      updateUI: updateUI
    });
  }]);
