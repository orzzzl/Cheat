module game {
  export function createClaimEnv() {
    createButton (translate('CANCEL'), 400, bottomPos - 100, resetAll);
    createButton(translate('MKCLAIM'), 200, bottomPos - 100, Claim);
    hideButton(translate('MKCLAIM'));
    createOpts ();
    hideButton("ops");
    showButton(translate('CANCEL'));
    updateStage();
  };


  export function createDecEnv () {
    createDecPanel ();
    //clearEverything ();
    //showSelectionPanel ();
  }

  export function createDecPanel () {
    var panel = new createjs.Container();
    var background = new createjs.Shape ();
    background.graphics.beginFill("#006400").drawRect(0, 600, 600, 800);

    var message = state.claim [0] + translate('M1') + state.claim [1] + translate('M2');
    var label = new createjs.Text (message, "bold 40px 'Shadows Into Light'", "#FFFFFF");
    label.textAlign = "center";
    label.textBaseline = "middle";
    label.x = 300;
    label.y = 650;

    panel.addChild(background, label);
    stage.addChild(panel);

    createButton (translate('BULLSHIT'), 100, 800, function () {
      declare(true);
    });

    createButton (translate('PASS'), 350, 800, function () {declare (false);});
    updateStage()
  }
  export function showPlayerIndex (turnIndex : number) {
    var message = translate('PTI') + " " + turnIndex;
    var label = new createjs.Text (message, "bold 35px 'Shadows Into Light'", "#FFFFFF");
    label.x = 20;
    label.y = 20;
    var c = (state.claim === undefined || state.claim [1] === undefined ? "" : state.claim [1]);
    var claimMessage = translate('LAST') + " " + c;
    var label2 = new createjs.Text (claimMessage, "bold 35px 'Shadows Into Light'", "#FFFFFF");
    label2.x = 300;
    label2.y = 20;
    stage.addChild(label, label2);
  }

  export function showButton (message : string) {
    buttons [message].visible = true;
    updateStage();
  }

  export function hideButton (message : string) {
    buttons [message].visible = false;
    updateStage();
  }

  export function createOpts () {
    var shape = new createjs.Shape();
    shape.graphics.beginFill("#006400").drawRect(0, 0, 800, 800);
    shape.x = 0;
    shape.y = 660;
    stage.addChild (shape);
    buttons["ops"] = shape;
  }

  export function Claim () {
    cardsClickable = 0;
    hideButton(translate('MKCLAIM'));
    showButton("ops");
    console.log (claimCards);
    showSelectionPanel ();
    updateStage();
  }

  export function showSelectionPanel () {
    for (var i = 0; i < claimCards.length; i ++)
    showButton(claimCards [i]);
  }

  export function createBall () {
    ball = new createjs.Shape();
    ball.graphics.beginFill("orange").drawCircle(0, 0, 10);
    ball.visible = false;
    ball.on ("pressmove", function (evt : any){
      this.y = evt.stageY;
      this.x = evt.stageX;
      stage.update();
    });
    stage.on ("pressup", function () {
      ball.visible = false;
      for (var i = 0; i < mycards.length; i ++) {
        if (mycards [i].alpha === 0.2)
        selectCard(mycards [i]);
      }
      updateStage();
    });
    stage.addChild(ball);
  }

  export function createSelectionPanel () {
    var currentClaim = state.claim === undefined ? undefined : state.claim [1];
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

  export function callback () {
    claimBuffer = this;
    console.log (claimBuffer);
    if (isACheat()) {
      sureToClaim = true;
      //updateUI ();
       $rootScope.$apply();
    } else {
      makeACheat();
      clearEverything();
    }
  }

  export function isACheat () {
    for (var i = 0; i < middleCards.length; i ++) {
      var tmp = gameLogic.getCard(middleCards [i]);
      if (tmp.length === 3 && claimBuffer === "10")    //if they are both "10";
      continue;
      if (tmp [1] !== claimBuffer [0])
      return true;
    }
    return false;
  }

  export function makeACheat () {
    var rank = ""  + claimBuffer;
    console.log (middle.clone ());
    var claim = [middle.length - state.middle.length, rank];
    var diffM = middle.clone();
    diffM.selfSubtract(state.middle);
    var operations = gameLogic.getClaimMove(state, turnIndex, claim, diffM);
    gameService.makeMove(operations);
  }

  export function hideSelctionPanel () {
    for (var i = 0; i < claimCards.length; i ++)
    hideButton(claimCards [i]);
  }

  export function displayCards (limit : number) {
    var n = mycardsVal.length;
    var start = 10;
    var end = 480;
    interPos = (end - start) / (n > limit ? limit : n);
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
      if (i + limit < n + cardLength && (parseInt( "" + (n - 1) / limit) !== parseInt( "" + i / limit))) {
        cardType = 3;
      }
      if (tmpi === limit || tmpi === limit * 2 || tmpi === limit * 3 || i === n - 1) {
        cardType = 2;
      }
      addpic(mycardsVal [i], x, y, cardType, limit, i);
    }
  }

  export function displayOppCards (limit : number) {
    var n = playerTwoCards.length;
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
      addpic("qb1fv", x, y, 1, limit, i);
    }
  }

  export function displayMiddle (limit : number) {
    if (gameOngoing === 0)    return;
    var n = middle.length;
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
      addpic("qb1fh", x, y, 1, limit, i);
    }
  }

  export function createSmallButton (message : string, _x : number, _y : number, func : any) {
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


  export function createButton (message : string, _x : number, _y : number, func : any) {
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


  export function nameToInd (i : any) {
    var strval = gameLogic.getCard(parseInt(i));
    for (var j = 0; j < 52; j ++) {
      if (state ["card" + j] === strval)
      return j;
    }
    return -1;
  }

  export function resetAll () {
    cardsClickable = 1;
    for (var i = 0; i < mycards.length; i ++)
    clearcard(mycards [i]);
    updateStage();
  }

  export function setcard (image : any) {
    cardsCnt ++;
    if (cardsCnt > 4) {
      cardsCnt --;
      return;
    }
    showButton(translate('MKCLAIM'));
    hideButton("ops");
    hideSelctionPanel ();
    image.y -= 30;
    image.clicked = 1;
    middleCards.push (image.name);
    middle.push (nameToInd(image.name));
    console.log (middleCards);
  }

  export function clearcard (image : any) {
    if (image.clicked === 0)
    return;
    hideButton("ops");
    hideSelctionPanel ()
    cardsCnt --;
    if (cardsCnt === 0)
    hideButton(translate('MKCLAIM'));
    else
    showButton(translate('MKCLAIM'));
    image.y += 30;
    image.clicked = 0;
    rmFromMiddle(image.name);
  }

  export function rmFromMiddle (i : any) {
    var t = nameToInd(i);
    for (var j = 0; j < middle.length; j ++) {
      if (middle [j] === t)    middle.splice(j, 1);
      if (middleCards [j] === i)    middleCards.splice(j, 1);
    }
    console.log (middle);
  }


  export function selectCard (card : any) {
    if (cardsClickable === 0)    return;
    if (card.clicked === 0) {
      setcard(card);
    } else {
      clearcard(card);
    }
  }

  export function addpic (i : any, _x : any, _y : any, cardType : any, limit : any, ind : any) {
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
      updateStage();
    });

    image.on ("tick", function () {
      if (image.name === "qb1fv" || image.name === "qb1fh")  return;
      if (ball === undefined)    return;
      if (ball.visible === false) {
        image.alpha = 1;
        return;
      }
      if (image.cardType === 3) {
        var cardBelowHeight;
        var targetInd = ind + limit;
        if (targetInd >= mycardsVal.length && targetInd < mycardsVal.length + cardLength)
        targetInd = mycardsVal.length - 1;
        var cardBelow = stage.getChildByName ("" + mycardsVal [targetInd]);
        if (cardBelow === undefined || cardBelow === null || cardBelow.clicked === 0) {
          cardBelowHeight = 50;
        } else {
          cardBelowHeight = 20;
        }
        if (ball.y > image.y && ball.y < image.y + cardBelowHeight && Math.abs (image.x - ball.x) <= interPos / 2) {
          image.alpha = 0.2;
        }
        else
        image.alpha = 1;
        return;
      }
      if ((ball.y >= image.y && Math.abs (image.x - ball.x) <= interPos / 2) || (image.cardType === 2 &&
        ball.y >= image.y && ball.x > image.x && Math.abs(ball.x - image.x) <= 140)) {
          image.alpha = 0.2;
        } else {
          image.alpha = 1;
        }
      });
      mycards.push (image);
      stage.addChild(image);
    }

  }
