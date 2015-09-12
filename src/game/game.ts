module game {
  export var canMakeMove = false;
  export var isComputerTurn = false;
  export var state : any = null;
  export var turnIndex: number = null;
  export var gameOngoing : number;
  export var isHelpModalShown: boolean = false;
  export var stage : any;
  export var middle : any[] = [];
  export var playerOneCards : any [];
  export var playerTwoCards : any [];
  export var cardsCnt : number;
  export var mycards : any[];
  export var buttons : any;
  export var mycardsVal : any[];
  export var middleCards : any[];
  export var cardsClickable : number;
  export var claimCards : any[];
  export var STAGE : any;
  export var ifCheat : any;
  export var resultMessage : string;
  export var ball : any;
  export var claimBuffer : any;
  export var sureToClaim : any;
  export var interPos : number;
  export var bottomPos = 700;
  export var middlePos = 400;
  export var upperPos = 100;
  export var cardLength = 5;
  export var mutex : number;

  export function init() {
    console.log("initing");
    resizeGameAreaService.setWidthToHeight(0.6);
    gameService.setGame({
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      isMoveOk: gameLogic.isMoveOk,
      updateUI: updateUI
    });
  }

  function updateUI(params: IUpdateUI): void {
    stage = new createjs.Stage("demoCanvas");
    state = params.stateAfterMove;
    STAGE = gameLogic.STAGE;

    if (gameLogic.isEmptyObj(state)) {
      if (params.yourPlayerIndex === 0) {
        gameService.makeMove(gameLogic.getInitialMove());
        gameOngoing = 1;
      }
      return;
    }
    canMakeMove = params.turnIndexAfterMove >= 0 && // game is ongoing
    params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
    turnIndex = params.turnIndexAfterMove;
    clearEverything ();
    middle = state.middle.clone ();

    if ( turnIndex === 0) {
      playerOneCards = state.white.clone();
      playerTwoCards = state.black.clone();
    } else if ( turnIndex === 1) {
      playerOneCards = state.black.clone();
      playerTwoCards = state.white.clone();
    } else {
      if (params.yourPlayerIndex === 0) {
        playerOneCards =  state.white.clone();
        playerTwoCards = state.black.clone();
      } else {
        playerOneCards =  state.black.clone();
        playerTwoCards = state.white.clone();
      }
    }
    initUI ();
    var isComputerTurn = canMakeMove &&
    params.playersInfo[params.yourPlayerIndex].playerId === '';

    if (params.playMode === 'playAgainstTheComputer' && (turnIndex != 0))
    canMakeMove = false;
    if (canMakeMove) {
      switch(state.stage) {
        case STAGE.DO_CLAIM:
        console.log ("Do Claim");
        displayCards(20);
        createClaimEnv ();
        createSelectionPanel ();
        updateClaimRanks();
        createBall ();
        break;
        case STAGE.DECLARE_CHEATER:
        mutex = 0;
        createDecEnv ();
        console.log ("declare cheater");
        break;
        case STAGE.CHECK_CLAIM:
        console.log ("check claim");
        ifCheat = true;
        resultMessage = translate('PLAYER') + turnIndex + ": ";
        resultMessage += gameLogic.didCheat(state) ? translate('SUC') : translate('FAIL');
        checkDeclaration();
        break;
      }
    }

    if (isComputerTurn) {
      canMakeMove = false;
      if (state.stage === STAGE.CHECK_CLAIM) {
        ifCheat = true;
        resultMessage = translate('PLAYER') + turnIndex + ": ";
        resultMessage += gameLogic.didCheat(state) ? translate('SUC') : translate('FAIL');
      }
      sendComputerMove();
    }
  }


  angular.module('myApp', ['ngTouch', 'ui.bootstrap'])
  .run(['initGameServices', function (initGameServices: any) {
    $rootScope['game'] = game;
    translate.setLanguage('en', {
      "RULES_SLIDE1":"Cheat is a deception card game where the players aim to get rid of all of there cards.",
      "RULES_SLIDE2":"On their turn a player must select from their hand 1~4 cards to make a claim as what those cards are.",
      "RULES_SLIDE3":"For each claim a player can only claim the cards whose rank is 1 rank higher or 1 lower or the same as the card at last claim.",
      "NEW_TO_CHEAT":"New to Cheat(Bullshit) ?",
      "RULES_SLIDE4":"For each opposite's claim, a player can call it a cheat(bullshit) or pass.",
      "RULES_SLIDE5":"If a cheat is called, then the opposite will get all the cards in the middle if he did cheat. Otherwise, the player will get all these cards.",
      "CANCEL":"Cancel",
      "SURE":"Sure",
      "RESULT":"Result",
      "MKCLAIM":"Make Claim",
      "CHEAT":"Cheat ",
      "SURE2":"This is a Cheat!",
      "AREYOUSURE":"Are you sure that you want to cheat?",
      "PTI":"Player index:",
      "M1":" cards claimed to be ",
      "M2":"\n\n What do you think ?",
      "LAST":"Last Claim:",
      "BULLSHIT":"BullSh ! t",
      "PASS":"Pass",
      "PLAYER":"Player  ",
      "SUC":"Cheat call success!",
      "FAIL":"Cheat call fails!",
      "CLOSE":"Close"
    });
    game.init();
  }]);
