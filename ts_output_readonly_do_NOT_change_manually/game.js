var game;
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
        }
        else {
            makeACheat();
            game.clearEverything();
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
    function sendComputerMove() {
    }
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
            sendComputerMove();
        }
    }
    angular.module('myApp', ['ngTouch', 'ui.bootstrap'])
        .run(['initGameServices', function (initGameServices) {
            $rootScope['game'] = game;
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
        var operations = gameLogic.getDeclareCheaterMove(game.state, game.turnIndex, declareCheater);
        gameService.makeMove(operations);
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
