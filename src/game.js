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
    var mycards = [];
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
      alert("Clicked");
      sendUserMove(gameLogic.createMove(state, turnIndex, userChoices));
    }

    $scope.initGame = function () {
      for (var i = 1; i <= 13; i ++) {
        var x = 40 * i;
        var y = 800;
        addpic(i, x, y);
      }
      createResetButton ();
      updateStage();
    };

    /*************** My Helper functions ***************/
    function updateStage() {
      stage.update();
    }

    function createResetButton () {
      var reset = new createjs.Shape();
      reset.graphics.beginFill("DeepSkyBlue").drawRoundRect(0, 0, 150, 60, 10);
      var label = new createjs.Text ("Cancel", "bold 24px Arial", "#FFFFFF");
      label.textAlign = "center";
      label.textBaseline = "middle";
      label.x = 150/2;
      label.y = 60/2;


      var button = new createjs.Container();
      button.name = "Cancel";
      button.x = 800;
      button.y = 700;
      button.addChild(reset, label);

      button.on("click", function () {
        resetAll ();
      });

      stage.addChild(button);
    }

    function resetAll () {
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
      image.y -= 30;
      image.clicked = 1;
    }

    function clearcard (image) {
      if (image.clicked === 0)
          return;
      cardsCnt --;
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
