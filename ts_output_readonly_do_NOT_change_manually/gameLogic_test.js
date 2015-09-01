describe("In Cheat", function () {
    function expectMoveOk(turnIndexBeforeMove, stateBeforeMove, move) {
        expect(gameLogic.isMoveOk({
            turnIndexBeforeMove: turnIndexBeforeMove,
            stateBeforeMove: stateBeforeMove,
            move: move
        })).toBe(true);
    }
    function expectIllegalMove(turnIndexBeforeMove, stateBeforeMove, move) {
        expect(gameLogic.isMoveOk({
            turnIndexBeforeMove: turnIndexBeforeMove,
            stateBeforeMove: stateBeforeMove,
            move: move
        })).toBe(false);
    }
    var initialMove = [
        { setTurn: { turnIndex: 0 } },
        {
            set: {
                key: 'white',
                value: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
            }
        },
        {
            set: {
                key: 'black',
                value: [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51]
            }
        },
        { set: { key: 'middle', value: [] } },
        { set: { key: 'stage', value: gameLogic.STAGE.DO_CLAIM } },
        { set: { key: 'card0', value: 'C2' } },
        { set: { key: 'card1', value: 'C3' } },
        { set: { key: 'card2', value: 'C4' } },
        { set: { key: 'card3', value: 'C5' } },
        { set: { key: 'card4', value: 'C6' } },
        { set: { key: 'card5', value: 'C7' } },
        { set: { key: 'card6', value: 'C8' } },
        { set: { key: 'card7', value: 'C9' } },
        { set: { key: 'card8', value: 'C10' } },
        { set: { key: 'card9', value: 'CJ' } },
        { set: { key: 'card10', value: 'CQ' } },
        { set: { key: 'card11', value: 'CK' } },
        { set: { key: 'card12', value: 'CA' } },
        { set: { key: 'card13', value: 'D2' } },
        { set: { key: 'card14', value: 'D3' } },
        { set: { key: 'card15', value: 'D4' } },
        { set: { key: 'card16', value: 'D5' } },
        { set: { key: 'card17', value: 'D6' } },
        { set: { key: 'card18', value: 'D7' } },
        { set: { key: 'card19', value: 'D8' } },
        { set: { key: 'card20', value: 'D9' } },
        { set: { key: 'card21', value: 'D10' } },
        { set: { key: 'card22', value: 'DJ' } },
        { set: { key: 'card23', value: 'DQ' } },
        { set: { key: 'card24', value: 'DK' } },
        { set: { key: 'card25', value: 'DA' } },
        { set: { key: 'card26', value: 'H2' } },
        { set: { key: 'card27', value: 'H3' } },
        { set: { key: 'card28', value: 'H4' } },
        { set: { key: 'card29', value: 'H5' } },
        { set: { key: 'card30', value: 'H6' } },
        { set: { key: 'card31', value: 'H7' } },
        { set: { key: 'card32', value: 'H8' } },
        { set: { key: 'card33', value: 'H9' } },
        { set: { key: 'card34', value: 'H10' } },
        { set: { key: 'card35', value: 'HJ' } },
        { set: { key: 'card36', value: 'HQ' } },
        { set: { key: 'card37', value: 'HK' } },
        { set: { key: 'card38', value: 'HA' } },
        { set: { key: 'card39', value: 'S2' } },
        { set: { key: 'card40', value: 'S3' } },
        { set: { key: 'card41', value: 'S4' } },
        { set: { key: 'card42', value: 'S5' } },
        { set: { key: 'card43', value: 'S6' } },
        { set: { key: 'card44', value: 'S7' } },
        { set: { key: 'card45', value: 'S8' } },
        { set: { key: 'card46', value: 'S9' } },
        { set: { key: 'card47', value: 'S10' } },
        { set: { key: 'card48', value: 'SJ' } },
        { set: { key: 'card49', value: 'SQ' } },
        { set: { key: 'card50', value: 'SK' } },
        { set: { key: 'card51', value: 'SA' } },
        { shuffle: { keys: ["card0", "card1", "card2", "card3", "card4", "card5", "card6", "card7", "card8", "card9", "card10", "card11", "card12", "card13", "card14", "card15", "card16", "card17", "card18", "card19", "card20", "card21", "card22", "card23", "card24", "card25", "card26", "card27", "card28", "card29", "card30", "card31", "card32", "card33", "card34", "card35", "card36", "card37", "card38", "card39", "card40", "card41", "card42", "card43", "card44", "card45", "card46", "card47", "card48", "card49", "card50", "card51"] } },
        { setVisibility: { key: 'card0', visibleToPlayerIndexes: [0] } },
        { setVisibility: { key: 'card1', visibleToPlayerIndexes: [0] } },
        { setVisibility: { key: 'card2', visibleToPlayerIndexes: [0] } },
        { setVisibility: { key: 'card3', visibleToPlayerIndexes: [0] } },
        { setVisibility: { key: 'card4', visibleToPlayerIndexes: [0] } },
        { setVisibility: { key: 'card5', visibleToPlayerIndexes: [0] } },
        { setVisibility: { key: 'card6', visibleToPlayerIndexes: [0] } },
        { setVisibility: { key: 'card7', visibleToPlayerIndexes: [0] } },
        { setVisibility: { key: 'card8', visibleToPlayerIndexes: [0] } },
        { setVisibility: { key: 'card9', visibleToPlayerIndexes: [0] } },
        { setVisibility: { key: 'card10', visibleToPlayerIndexes: [0] } },
        { setVisibility: { key: 'card11', visibleToPlayerIndexes: [0] } },
        { setVisibility: { key: 'card12', visibleToPlayerIndexes: [0] } },
        { setVisibility: { key: 'card13', visibleToPlayerIndexes: [0] } },
        { setVisibility: { key: 'card14', visibleToPlayerIndexes: [0] } },
        { setVisibility: { key: 'card15', visibleToPlayerIndexes: [0] } },
        { setVisibility: { key: 'card16', visibleToPlayerIndexes: [0] } },
        { setVisibility: { key: 'card17', visibleToPlayerIndexes: [0] } },
        { setVisibility: { key: 'card18', visibleToPlayerIndexes: [0] } },
        { setVisibility: { key: 'card19', visibleToPlayerIndexes: [0] } },
        { setVisibility: { key: 'card20', visibleToPlayerIndexes: [0] } },
        { setVisibility: { key: 'card21', visibleToPlayerIndexes: [0] } },
        { setVisibility: { key: 'card22', visibleToPlayerIndexes: [0] } },
        { setVisibility: { key: 'card23', visibleToPlayerIndexes: [0] } },
        { setVisibility: { key: 'card24', visibleToPlayerIndexes: [0] } },
        { setVisibility: { key: 'card25', visibleToPlayerIndexes: [0] } },
        { setVisibility: { key: 'card26', visibleToPlayerIndexes: [1] } },
        { setVisibility: { key: 'card27', visibleToPlayerIndexes: [1] } },
        { setVisibility: { key: 'card28', visibleToPlayerIndexes: [1] } },
        { setVisibility: { key: 'card29', visibleToPlayerIndexes: [1] } },
        { setVisibility: { key: 'card30', visibleToPlayerIndexes: [1] } },
        { setVisibility: { key: 'card31', visibleToPlayerIndexes: [1] } },
        { setVisibility: { key: 'card32', visibleToPlayerIndexes: [1] } },
        { setVisibility: { key: 'card33', visibleToPlayerIndexes: [1] } },
        { setVisibility: { key: 'card34', visibleToPlayerIndexes: [1] } },
        { setVisibility: { key: 'card35', visibleToPlayerIndexes: [1] } },
        { setVisibility: { key: 'card36', visibleToPlayerIndexes: [1] } },
        { setVisibility: { key: 'card37', visibleToPlayerIndexes: [1] } },
        { setVisibility: { key: 'card38', visibleToPlayerIndexes: [1] } },
        { setVisibility: { key: 'card39', visibleToPlayerIndexes: [1] } },
        { setVisibility: { key: 'card40', visibleToPlayerIndexes: [1] } },
        { setVisibility: { key: 'card41', visibleToPlayerIndexes: [1] } },
        { setVisibility: { key: 'card42', visibleToPlayerIndexes: [1] } },
        { setVisibility: { key: 'card43', visibleToPlayerIndexes: [1] } },
        { setVisibility: { key: 'card44', visibleToPlayerIndexes: [1] } },
        { setVisibility: { key: 'card45', visibleToPlayerIndexes: [1] } },
        { setVisibility: { key: 'card46', visibleToPlayerIndexes: [1] } },
        { setVisibility: { key: 'card47', visibleToPlayerIndexes: [1] } },
        { setVisibility: { key: 'card48', visibleToPlayerIndexes: [1] } },
        { setVisibility: { key: 'card49', visibleToPlayerIndexes: [1] } },
        { setVisibility: { key: 'card50', visibleToPlayerIndexes: [1] } },
        { setVisibility: { key: 'card51', visibleToPlayerIndexes: [1] } }
    ];
    beforeEach(function setCards() {
        defaultState = {};
        for (i = 0; i < 52; i++) {
            defaultState['card' + i] = gameLogic.getCard(i);
        }
    });
    it("White legally makes the initial move", function () {
        expectMoveOk(0, {}, initialMove);
    });
    it("Black illegally makes the initial move", function () {
        expectIllegalMove(1, {}, initialMove);
    });
    it("White legally makes a claim (No last claim)", function () {
        defaultState.white = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
        defaultState.black = [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51];
        defaultState.middle = [];
        defaultState.stage = gameLogic.STAGE.DO_CLAIM;
        expectMoveOk(0, defaultState, [
            { setTurn: { turnIndex: 1 } },
            { set: { key: 'white', value: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25] } },
            { set: { key: 'middle', value: [0, 13] } },
            { set: { key: 'claim', value: [2, 2] } },
            { set: { key: 'stage', value: gameLogic.STAGE.DECLARE_CHEATER } },
            { setVisibility: { key: 'card0', visibleToPlayerIndexes: [] } },
            { setVisibility: { key: 'card13', visibleToPlayerIndexes: [] } }
        ]);
    });
    it("White illegally makes a claim with wrong number of cards (No last claim)", function () {
        defaultState.white = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
        defaultState.black = [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51];
        defaultState.middle = [];
        defaultState.stage = gameLogic.STAGE.DO_CLAIM;
        expectIllegalMove(0, defaultState, [
            { setTurn: { turnIndex: 1 } },
            { set: { key: 'white', value: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25] } },
            { set: { key: 'middle', value: [0, 13] } },
            { set: { key: 'claim', value: [3, 2] } },
            { set: { key: 'stage', value: gameLogic.STAGE.DECLARE_CHEATER } },
            { setVisibility: { key: 'card0', visibleToPlayerIndexes: [] } },
            { setVisibility: { key: 'card13', visibleToPlayerIndexes: [] } }
        ]);
    });
    it("White legally makes a claim (last claim exists)", function () {
        defaultState.white = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
        defaultState.black = [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51];
        defaultState.middle = [];
        defaultState.stage = gameLogic.STAGE.DO_CLAIM;
        defaultState.lastClaim = [2, '3'];
        expectMoveOk(0, defaultState, [
            { setTurn: { turnIndex: 1 } },
            { set: { key: 'white', value: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25] } },
            { set: { key: 'middle', value: [0, 13] } },
            { set: { key: 'claim', value: [2, 2] } },
            { set: { key: 'stage', value: gameLogic.STAGE.DECLARE_CHEATER } },
            { setVisibility: { key: 'card0', visibleToPlayerIndexes: [] } },
            { setVisibility: { key: 'card13', visibleToPlayerIndexes: [] } }
        ]);
    });
    it("White illegally makes a claim with wrong rank (last claim exists)", function () {
        defaultState.white = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
        defaultState.black = [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51];
        defaultState.middle = [];
        defaultState.stage = gameLogic.STAGE.DO_CLAIM;
        defaultState.claim = [2, '6'];
        expectIllegalMove(0, defaultState, [
            { setTurn: { turnIndex: 1 } },
            { set: { key: 'white', value: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25] } },
            { set: { key: 'middle', value: [0, 13] } },
            { set: { key: 'claim', value: [2, 2] } },
            { set: { key: 'stage', value: gameLogic.STAGE.DECLARE_CHEATER } },
            { setVisibility: { key: 'card0', visibleToPlayerIndexes: [] } },
            { setVisibility: { key: 'card13', visibleToPlayerIndexes: [] } }
        ]);
    });
    it("Black legally makes a claim (No last claim)", function () {
        defaultState.white = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
        defaultState.black = [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51];
        defaultState.middle = [];
        defaultState.stage = gameLogic.STAGE.DO_CLAIM;
        expectMoveOk(1, defaultState, [
            { setTurn: { turnIndex: 0 } },
            { set: { key: 'black', value: [27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51] } },
            { set: { key: 'middle', value: [26, 39] } },
            { set: { key: 'claim', value: [2, 3] } },
            { set: { key: 'stage', value: gameLogic.STAGE.DECLARE_CHEATER } },
            { setVisibility: { key: 'card26', visibleToPlayerIndexes: [] } },
            { setVisibility: { key: 'card39', visibleToPlayerIndexes: [] } }
        ]);
    });
    it("White legally declare black a cheater", function () {
        defaultState.white = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
        defaultState.black = [27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51];
        defaultState.middle = [26, 39];
        defaultState.claim = [2, '2'];
        defaultState.stage = gameLogic.STAGE.DECLARE_CHEATER;
        expectMoveOk(0, defaultState, [
            { setTurn: { turnIndex: 0 } },
            { set: { key: 'stage', value: gameLogic.STAGE.CHECK_CLAIM } },
            { setVisibility: { key: 'card26', visibleToPlayerIndexes: [0] } },
            { setVisibility: { key: 'card39', visibleToPlayerIndexes: [0] } }
        ]);
    });
    it("White legally skips declaring black a cheater", function () {
        defaultState.white = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
        defaultState.black = [27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51];
        defaultState.middle = [26, 39];
        defaultState.claim = [2, '2'];
        defaultState.stage = gameLogic.STAGE.DECLARE_CHEATER;
        expectMoveOk(0, defaultState, [
            { setTurn: { turnIndex: 0 } },
            { set: { key: 'stage', value: gameLogic.STAGE.DO_CLAIM } }
        ]);
    });
    it("White illegally skips declaring black a cheater when black has no cards", function () {
        defaultState.white = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51];
        defaultState.black = [];
        defaultState.middle = [26, 39];
        defaultState.claim = [2, '2'];
        defaultState.stage = gameLogic.STAGE.DECLARE_CHEATER;
        expectIllegalMove(0, defaultState, [
            { setTurn: { turnIndex: 0 } },
            { set: { key: 'stage', value: gameLogic.STAGE.DO_CLAIM } }
        ]);
    });
    it("White check claim and win the challenge", function () {
        defaultState.white = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
        defaultState.black = [27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51];
        defaultState.middle = [26, 39];
        defaultState.claim = [2, '3'];
        defaultState.stage = gameLogic.STAGE.CHECK_CLAIM;
        expectMoveOk(0, defaultState, [
            { setTurn: { turnIndex: 0 } },
            { set: { key: 'black', value: [27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 26, 39] } },
            { set: { key: 'middle', value: [] } },
            { set: { key: 'stage', value: gameLogic.STAGE.DO_CLAIM } },
            { setVisibility: { key: 'card26', visibleToPlayerIndexes: [1] } },
            { setVisibility: { key: 'card39', visibleToPlayerIndexes: [1] } },
            { set: { key: 'claim', value: [] } }
        ]);
    });
    it("White check claim and lose the challenge", function () {
        defaultState.white = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
        defaultState.black = [27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51];
        defaultState.middle = [26, 39];
        defaultState.claim = [2, '2'];
        defaultState.stage = gameLogic.STAGE.CHECK_CLAIM;
        expectMoveOk(0, defaultState, [
            { setTurn: { turnIndex: 0 } },
            { set: { key: 'white', value: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 39] } },
            { set: { key: 'middle', value: [] } },
            { set: { key: 'stage', value: gameLogic.STAGE.DO_CLAIM } },
            { setVisibility: { key: 'card26', visibleToPlayerIndexes: [0] } },
            { setVisibility: { key: 'card39', visibleToPlayerIndexes: [0] } },
            { set: { key: 'claim', value: [] } }
        ]);
    });
    it("White wins!", function () {
        defaultState.white = [];
        defaultState.black = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51];
        defaultState.middle = [];
        defaultState.claim = [];
        defaultState.stage = gameLogic.STAGE.END;
        expectMoveOk(0, defaultState, [
            { endMatch: { endMatchScores: [1, 0] } },
            { set: { key: 'middle', value: [] } },
            { set: { key: 'stage', value: "END" } }
        ]);
    });
    it("White illegally wins!", function () {
        defaultState.white = [0, 1];
        defaultState.black = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51];
        defaultState.middle = [];
        defaultState.claim = [];
        defaultState.stage = gameLogic.STAGE.END;
        expectIllegalMove(0, defaultState, [
            { endMatch: { endMatchScores: [1, 0] } }
        ]);
    });
});
