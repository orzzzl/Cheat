angular.module('myApp')
  .run(
      ['$rootScope', '$log', '$timeout',
        'realTimeService', 'gameLogic',
       'resizeGameAreaService', '$translate', 'randomService',
      function ($rootScope, $log, $timeout,
        realTimeService, gameLogic,
        resizeGameAreaService, $translate, randomService) {
    'use strict';
// Constants
        var canvasWidth = 300;
        var canvasHeight = 300;
//Lets save the cell width in a variable for easy control
        var cellWidth = 10;
        var cellHeight = 10;
        var rowsNum = canvasWidth / cellWidth;
        var colsNum = canvasHeight / cellHeight;
        var drawEveryMilliseconds = 120;
        var isGameOngoing = false;
        var isSinglePlayer = false;

// There are 1-8 players.
// Colors:
// black: canvas borders
// white: canvas background
// green: food
        var playerSnakeColor = [
          'blue', 'red', 'brown', 'purple',
          'pink', 'yellow', 'orange', 'silver',
        ];

        $rootScope.pause = function() {
          if(isSinglePlayer){
            isGameOngoing = false;
          }
          return true;
        };

        $rootScope.unPause = function() {
          if(isSinglePlayer){
            isGameOngoing = true;
          }
          return false;
        };

        function createCanvasController(canvas) {

          $log.info("createCanvasController for canvas.id=" + canvas.id);

          var playersInfo = null;
          var yourPlayerIndex = null;
          var matchController = null;

          // Game state
          var allSnakes; // allSnakes[playerIndex]  is the snake of playerIndex
          var snake_array; // points to allSnakes[yourPlayerIndex]
          var allScores;
          var foodCreatedNum; // Number of food pieces that were created (a food piece should be eaten by one player only).
          var d; //Direction: "right", "left", "up", "down"
          var food; // {x: ..., y: ...}
          var startMatchTime; // For displaying a countdown.




          function gotStartMatch(params) {
            yourPlayerIndex = params.yourPlayerIndex;
            playersInfo = params.playersInfo;
            matchController = params.matchController;
            isGameOngoing = true;
            isSinglePlayer = playersInfo.length === 1;

            foodCreatedNum = 0;
            allSnakes = [];
            allScores = [];
            for (var index = 0; index < playersInfo.length; index++) {
              allSnakes[index] = create_snake(index);
              allScores[index] = 0;
            }
            snake_array = allSnakes[yourPlayerIndex];
            create_food();
            d = "right"; //default direction
            startMatchTime = new Date().getTime();
            setDrawInterval();
          }

          function gotMessage(params) {
            var fromPlayerIndex = params.fromPlayerIndex;
            var messageString = params.message;
            // {f: foodCreatedNum, s: score, a: snake_array}
            // The array representing the cells of a player's snake.
            var messageObject = angular.fromJson(messageString);
            allSnakes[fromPlayerIndex] = messageObject.a;
            allScores[fromPlayerIndex] = messageObject.s;
            while (foodCreatedNum < messageObject.f) {
              create_food();
            }
          }

          function gotEndMatch(endMatchScores) {
            // Note that endMatchScores can be null if the game was cancelled (e.g., someone disconnected).
            allScores = endMatchScores;
            isGameOngoing = false;
            stopDrawInterval();
          }

          function sendMessage(isReliable) {
            if (isSinglePlayer || !isGameOngoing) {
              return; // No need to send messages if you're the only player or game is over.
            }
            var messageString = angular.toJson(
            {f: foodCreatedNum, s: allScores[yourPlayerIndex], a: snake_array});
            if (isReliable) {
              matchController.sendReliableMessage(messageString);
            } else {
              matchController.sendUnreliableMessage(messageString);
            }
          }

          function lostMatch() {
            if (!isGameOngoing) {
              return;
            }
            isGameOngoing = false;
            matchController.endMatch(allScores);
          }

          //Canvas stuff
          var ctx = canvas.getContext("2d");

          var drawInterval;

          function setDrawInterval() {
            stopDrawInterval();
            // Every 2 food pieces we increase the snake speed (to a max speed of 50ms interval).
            var intervalMillis = Math.max(50, drawEveryMilliseconds - 10 * Math.floor(foodCreatedNum / 2));
            drawInterval = setInterval(updateAndDraw, intervalMillis);
          }

          function stopDrawInterval() {
            clearInterval(drawInterval);
          }

          function create_snake(playerIndex)
          {
            var length = 5; // Initial length of the snake
            var arr = []; //Empty array to start with
            for(var i = length-1; i>=0; i--) {
              //This will create a horizontal snake starting from the top left
              arr.push({x: i, y: playerIndex - Math.floor(playersInfo.length / 2) + canvasWidth / cellWidth / 2});
            }
            return arr;
          }

          //Lets create the food now
          function create_food()
          {
            food = {
              x: randomService.randomFromTo(foodCreatedNum * 2, 0, colsNum),
              y: randomService.randomFromTo(foodCreatedNum * 2 + 1, 0, rowsNum)
            };
            foodCreatedNum++;
            setDrawInterval();
          }

          function updateAndDraw()
          {
            if (!isGameOngoing) {
              return;
            }
            var secondsFromStart =
            Math.floor((new Date().getTime() - startMatchTime) / 1000);
            if (secondsFromStart < 3) {
              // Countdown to really start
              changeDirQueue = []; // Clear any direction changes in the queue
              draw();
              // Draw countdown
              var secondsToReallyStart = 3 - secondsFromStart;

              // Gives you a hint what is your color
              var yourColor = playerSnakeColor[yourPlayerIndex];
              ctx.fillStyle = yourColor;
              ctx.font = '80px sans-serif';
              ctx.fillText("" + secondsToReallyStart, canvasWidth / 2, canvasHeight / 2);

              ctx.font = '20px sans-serif';
              var msg = $translate("YOUR_SNAKE_COLOR_IS",
              {color: $translate(yourColor.toUpperCase())});
              ctx.fillText(msg, canvasWidth / 4 - 30, canvasHeight / 4 - 30);
              return;
            }

            changeDirection();

            //The movement code for the snake to come here.
            //The logic is simple
            //Pop out the tail cell and place it infront of the head cell
            var nx = snake_array[0].x;
            var ny = snake_array[0].y;
            //These were the position of the head cell.
            //We will increment it to get the new head position
            //Lets add proper direction based movement now
            if (d === "right") {
              nx++;
            } else if (d === "left") {
              nx--;
            } else if (d === "up") {
              ny--;
            } else if (d === "down") {
              ny++;
            }

            //Lets add the game over clauses now
            //This will restart the game if the snake hits the wall
            //Lets add the code for body collision
            //Now if the head of the snake bumps into its body, the game will restart
            if (nx === -1 || nx === colsNum || ny === -1 || ny === rowsNum ||
            check_collision(nx, ny, snake_array)) {
              lostMatch();
              return;
            }

            //Lets write the code to make the snake eat the food
            //The logic is simple
            //If the new head position matches with that of the food,
            //Create a new head instead of moving the tail
            var isReliable = false; // Passing unreliable messages is faster
            var tail;
            if(nx === food.x && ny === food.y) {
              isReliable = true; // If creating food (and increasing score), I want to pass the message reliably.
              tail = {x: nx, y: ny};
              allScores[yourPlayerIndex]++;
              //Create new food
              create_food();
            } else {
              tail = snake_array.pop(); //pops out the last cell
              tail.x = nx; tail.y = ny;
            }
            //The snake can now eat the food.

            snake_array.unshift(tail); //puts back the tail as the first cell

            sendMessage(isReliable);
            draw();
          }

          function draw() {
            //To avoid the snake trail we need to paint the BG on every frame
            //Lets paint the canvas now
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            ctx.strokeStyle = "black";
            ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

            var i;
            for (i = 0; i < allSnakes.length; i++) {
              if (i !== yourPlayerIndex) {
                drawSnake(allSnakes[i], i);
              }
            }
            // Your snake is always drawn last (so it will be completely visible).
            drawSnake(snake_array, yourPlayerIndex);

            //Lets paint the food
            paint_cell(food.x, food.y, 'green');
            //Lets paint the score
            for (i = 0; i < allScores.length; i++) {
              ctx.font = '12px sans-serif';
              var color = playerSnakeColor[i];
              ctx.fillStyle = color;
              var msg = $translate("COLOR_SCORE_IS",
              {color: $translate(color.toUpperCase()), score: "" + allScores[i]});
              ctx.fillText(msg,
              5 + i * canvasWidth / playersInfo.length, canvasHeight - 5);
            }
          }

          function drawSnake(snake, playerIndex) {
            for(var i = 0; i < snake.length; i++) {
              var c = snake[i];
              paint_cell(c.x, c.y, playerSnakeColor[playerIndex]);
            }
          }

          function paint_cell(x, y, color)
          {
            ctx.fillStyle = color;
            ctx.fillRect(x*cellWidth, y*cellHeight, cellWidth, cellHeight);
            ctx.strokeStyle = "white";
            ctx.strokeRect(x*cellWidth, y*cellHeight, cellWidth, cellHeight);
          }

          function check_collision(x, y, array)
          {
            //This function will check if the provided x/y coordinates exist
            //in an array of cells or not
            for(var i = 0; i < array.length; i++) {
              if(array[i].x === x && array[i].y === y) {
                return true;
              }
            }
            return false;
          }


          function changeDirection() {
            var key = changeDirQueue.shift();
            if (!key) {
              return;
            }
            if(key === "left" && d !== "right") {
              d = "left";
            } else if(key === "up" && d !== "down") {
              d = "up";
            } else if(key === "right" && d !== "left") {
              d = "right";
            } else if(key === "down" && d !== "up") {
              d = "down";
            }
          }

          var changeDirQueue = [];
          function addChangeDir(dir) {
            if (changeDirQueue.length > 0 && changeDirQueue[changeDirQueue.length - 1] === dir) {
              return;
            }
            changeDirQueue.push(dir);
          }

          //Lets add the keyboard controls now
          document.addEventListener("keydown", function(e){
            var key = e.which;
            var dir = key === 37 ? "left"
            : key === 38 ? "up"
            : key === 39 ? "right"
            : key === 40 ? "down" : null;
            if (dir !== null) {
              addChangeDir(dir);
            }
          }, false);

          var lastX = null, lastY = null;
          function processTouch(e) {
            e.preventDefault(); // prevent scrolling and dispatching mouse events.
            var touchobj = e.targetTouches[0]; // targetTouches includes only touch points in this canvas.
            if (!touchobj) {
              return;
            }
            if (lastX === null) {
              lastX = touchobj.pageX;
              lastY = touchobj.pageY;
              return;
            }
            var distX = touchobj.pageX - lastX; // get horizontal dist traveled by finger while in contact with surface
            var distY = touchobj.pageY - lastY; // get vertical dist traveled by finger while in contact with surface
            var swipedir = null;
            var absDistX = Math.abs(distX);
            var absDistY = Math.abs(distY);
            if (absDistX >= 20 || absDistY >= 20) {
              lastX = touchobj.pageX;
              lastY = touchobj.pageY;
              if (absDistX > absDistY) {
                swipedir = distX < 0 ? 'left' : 'right';
              } else {
                swipedir = distY < 0 ? 'up' : 'down';
              }
              addChangeDir(swipedir);
            }
          }
          canvas.addEventListener('touchstart', function(e) {
            lastX = null;
            lastY = null;
            processTouch(e);
          }, false);
          canvas.addEventListener('touchmove', function(e) {
            processTouch(e);
          }, false);
          canvas.addEventListener('touchend', function(e) {
            processTouch(e);
          }, false);

          return {
            gotStartMatch: gotStartMatch,
            gotMessage: gotMessage,
            gotEndMatch: gotEndMatch
          };
        } // end of createCanvasController

        realTimeService.init({
          createCanvasController: createCanvasController,
          canvasWidth: canvasWidth,
          canvasHeight: canvasHeight
        });


      }]);
