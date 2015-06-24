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

    var bottomPos = 800;
    var interPos =  20;
    var cardlength = 100;
    var canMakeMove = false;
    var state = null;
    var stage = new createjs.Stage("demoCanvas");
    var turnIndex = null;
    var cardsCnt = 0;
    var mycards = [];
    var mycardsVal = [3,1,2,4,5,6,7,8,9,10,41,42,43,44,45,46,47,48,49,50];
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

      var n = mycardsVal.length;
      var start = (600 - n * interPos) / 2;
      for (var i = 1; i <= n; i ++) {
        var x = interPos * (i - 1) + start - cardlength;
        var y = bottomPos;
        addpic(mycardsVal [i - 1], x, y);
      }
      createButton ("Cancel", 400, 700, resetAll);
      updateStage();
    };

    /*************** My Helper functions ***************/
    function updateStage() {
      stage.update();
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
