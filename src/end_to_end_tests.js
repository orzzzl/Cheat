/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('TicTacToe', function() {

  'use strict';

  beforeEach(function() {
    browser.get('http://localhost:9000/game.min.html');
  });

  it('should have a title', function () {
    expect(browser.getTitle()).toEqual('Game');
  });
});
