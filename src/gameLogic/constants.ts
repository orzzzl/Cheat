module gameLogic {
  // Stage
  export var STAGE = {
    SET_UP: "SET_UP",
    DO_CLAIM: "DO_CLAIM",
    DECLARE_CHEATER: "DECLARE_CHEATER",
    CHECK_CLAIM: "CHECK_CLAIM",
    END: "END"
  };

  // Suit
  export var SUIT = {
    DIAMONDS: "D", //♦
    HEARTS: "H", //♥
    SPADES: "S", //♠
    CLUBS: "C" //♣
  };

  // Rank
  export var RANK = {
    TWO: '2',
    THREE: '3',
    FOUR: '4',
    FIVE: '5',
    SIX: '6',
    SEVEN: '7',
    EIGHT: '8',
    NINE: '9',
    TEN: '10',
    JACK: 'J',
    QUEEN: 'Q',
    KING: 'K',
    ACE: 'A'
  };
}
