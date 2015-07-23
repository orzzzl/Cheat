angular.module('myApp')
.controller('Ctrl',
['$scope', '$log', '$timeout',
  'gameService', 'gameLogic',
  'resizeGameAreaService', '$translate',
  function ($scope, $log, $timeout,
            gameService, gameLogic,
            resizeGameAreaService, $translate) {
    'use strict';

    // TODO: choose your width-to-height ratio (1 means the board is square).
    resizeGameAreaService.setWidthToHeight(0.6);

    var bottomPos = 700;
    var middlePos = 400;
    var upperPos = 100;
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
      if ($scope.currIndex === 0) {// || ($scope.currIndex === 0 && params.playMode === 'passAndPlay')) {
        // If the game is played in the same device, use the default setting
        $scope.playerOneCards = $scope.state.white.clone();
        $scope.playerTwoCards = $scope.state.black.clone();
      } else if ($scope.currIndex === 1) {//if (params.playMode === 'passAndPlay' && $scope.currIndex === 1) {
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
      mycardsVal= [];
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
        $scope.sureToClaim = true;
        $scope.$apply();
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
      stage.on ("pressup", function (evt) {
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
      var rank = ""  + this;
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
        var interPos = (end - start) / (n > limit ? limit : n);
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
          if (tmpi === limit || i === limit * 2 || i === limit * 3) {
            cardType = 2;
          }
          if (i + limit < n) {
            cardType = 3;
          }
          addpic(mycardsVal [i], x, y, cardType);
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
        addpic("qb1fv", x, y, 1);
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
        addpic("qb1fh", x, y, 1);
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
   //   $scope.middle = $scope.state.middle;
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
      $scope.middle.push (nameToInd(image.name));
      console.log ($scope.middle);
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

    function addpic (i, _x, _y, cardType) {
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
        //if (cardsClickable === 0)    return;
        //if (image.clicked === 0) {
        //  setcard(image);
        //} else {
        //  clearcard(image);
        //}
        updateStage();
      });

      image.on ("tick", function (evt) {
        if (image.name === "qb1fv" || image.name === "qb1fh")  return;
        if (ball === undefined)    return;
        if (ball.visible === false) {
          image.alpha = 1;
          return;
        }
        if (image.cardType === 3) {
          if (ball.y > image.y && ball.y < image.y + 50 && Math.abs (image.x - ball.x) <= 10) {
            image.alpha = 0.2;
          }
          else
            image.alpha = 1;
          return;
        }
        if ((ball.y >= image.y && Math.abs (image.x - ball.x) <= 10) || (image.cardType === 2 && ball.x > image.x)) {
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
