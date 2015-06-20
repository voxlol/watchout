function initialization() {
  window.scores = {
    maxScore: 0,
    currentScore: 0,
    collisionCounter: 0
  }
  window.gameOptions = {
    nEnemies: 25,
    nChasers : 5,
    boardHeight: window.innerHeight,//450,
    boardWidth: window.innerWidth,//700,
    boardColor : "rgb(223, 223, 223)",
    radius : 12.5,
    gameSpeedTime : 1000,
    timeBetweenCollisions: 200,
    gravitation: 0.9
  }
  window.player = {};
  player.x = gameOptions.boardWidth/2;
  player.y = gameOptions.boardHeight/2;

  window.enemies = [];
  window.chasers = [];
}

// Program Logic

initialization();
var board = d3.select('.board');
generateEnemies(gameOptions.nEnemies, gameOptions.nChasers);
var chasers
renderBoard();
timeBasedMethods();

// Makes the enemies
function generateEnemies(nOfEnemies, nOfChasers){
  var makeEnemy = function(id) {
    var enemy = {};
    enemy.id = id;
    enemy.x = Math.random() * gameOptions.boardWidth;
    enemy.y = Math.random() * gameOptions.boardHeight;

    enemy.updatePosition = function(){
      this.x = Math.random() * gameOptions.boardWidth;
      this.y = Math.random() * gameOptions.boardHeight;
    }

    return enemy;
  }

  for(var i = 0; i < nOfEnemies; i++){
    enemies.push(makeEnemy(i+1));
  }

  for(var i = 0; i < nOfChasers; i++){
    chasers.push(makeEnemy(i+1));
  }
}


// D3 Stuff --------- --------- --------- --------- --------- --------- ---------
// Create the SVG inside the div board

function renderBoard() {
    board.append('svg:svg').attr({
      'class' : 'gameBoard',
      'height' : gameOptions.boardHeight,
      'width' : gameOptions.boardWidth
    }).style('background-color', gameOptions.boardColor)

  // Populate the SVG with our Enemies
  d3.select("svg").selectAll('polygon.enemy')
    .data(enemies).enter().append("svg:polygon")
    .attr({
      'class':"enemy",
      'cx': function(d) { return d.x },
      'cy': function(d) { return d.y },
      'r': gameOptions.radius,
      'id': function(d) { return 'i'+ d.id },
      'fill': function(d){
              var num1 = Math.floor(Math.random()*255)
              var num2 = Math.floor(Math.random()*255)
              var num3 = Math.floor(Math.random()*255)
              return 'rgb('+num1+','+num2+','+num3+')'},
      'points' : "0 50, 40 40, 50 0, 60 40, 100 50, 60 60, 50 100, 40 60",
      'transform' : function(d) {return "translate("+d.x+","+d.y+")" + " scale(0.25)" }
    })

  d3.select("svg").selectAll('polygon.chaser')
    .data(chasers).enter().append("svg:polygon")
    .attr({
      'class':"chaser",
      'cx': function(d) { return d.x },
      'cy': function(d) { return d.y },
      'r': gameOptions.radius,
      'id': function(d) { return 'c'+ d.id },
      'fill': function(d){
              var num1 = Math.floor(Math.random()*255)
              var num2 = Math.floor(Math.random()*255)
              var num3 = Math.floor(Math.random()*255)
              return 'rgb('+num1+','+num2+','+num3+')'},
      'points' : "0 50, 40 40, 50 0, 60 40, 100 50, 60 60, 50 100, 40 60",
      'transform' : function(d) {return "translate("+d.x+","+d.y+")" + " scale(0.25)" }
    })

  // Initial render of the player
  d3.select('svg').selectAll("circle .player").data([player]).enter().append("svg:circle")
    .attr({
      'cx' : player.x,
      'cy' : player.y,
      'r'  : gameOptions.radius,
      'class': 'player',
      'fill' : 'red'
    })

  board.on('mousemove', function(){
    var loc =d3.mouse(this)
    d3.select('.player').attr({
      'cx': loc[0],
      'cy': loc[1]
    })
  })
}

 // --------- --------- --------- --------- --------- --------- --------- ---------

function timeBasedMethods() {
  // Randomizes the enemy position based off the gameOption timeInterval setting
  var randomizeEnemyPosition = function(){
    for (var i = 0; i < enemies.length;i++) {
      enemies[i].updatePosition()
    }

    var rotationAmount = 0;
    d3.selectAll('.enemy').data(enemies).transition()
      .attrTween('transform', function(enemy){
        var oldX = d3.select('#i'+enemy.id).attr('cx');
        var oldY = d3.select('#i'+enemy.id).attr('cy');
        return d3.interpolateString(
          "translate(" + oldX +  ','+  oldY+ ') ' + "scale(0.25) rotate(0)",
          "translate(" + enemy.x+','+enemy.y+') ' + "scale(0.25) rotate(1080)");
      })
      .duration(gameOptions.gameSpeedTime)
      .attr({
        cx : function(enemy) { return enemy.x+12.5 }, //
        cy : function(enemy) { return enemy.y+12.5 }
      }).each("end", function() {
        randomizeEnemyPosition()
      })
  }
  randomizeEnemyPosition();

  var updateChaserPosition = function(){
    for (var i = 0 ; i < chasers.length; i++) {
      gravitate(i)
    }
    function gravitate(i) {
      var player = d3.select('.player');
      var chaser = d3.select('#c'+(i+1));
      var playerX = +player.attr('cx');
      var playerY = +player.attr('cy');
      var chaserX = +chaser.attr('cx');
      var chaserY = +chaser.attr('cy');

      var newX = gameOptions.gravitation*(playerX-chaserX)+chaserX+(Math.random()*150)-75;
      var newY = gameOptions.gravitation*(playerY-chaserY)+chaserY+(Math.random()*150)-75;

      chaser.transition().duration(gameOptions.gameSpeedTime)
        .attr({
          'cx' : newX,
          'cy' : newY
        })
        .attrTween('transform', function(enemy){
          return d3.interpolateString(
            "translate(" + chaserX +  ','+  chaserY+ ') ' + "scale(0.25) rotate(0)",
            "translate(" + newX +','+ newY +') ' + "scale(0.25) rotate(1080)");
         })
        .each('end', function(){
          updateChaserPosition();
        })
    }
  }

  updateChaserPosition();


  // Updates the score every 50ms
  // Manages collisions
  var lastCollisionTime = 0;
  var collisionDetection = function() {
    scores.currentScore++;

    if(anyCollision()) {
      var currentCollisionTime = Date.now();
      if (currentCollisionTime - lastCollisionTime > gameOptions.timeBetweenCollisions) {
        scores.collisionCounter++;
      }
      lastCollisionTime = currentCollisionTime;

      // Updating Score
      if (scores.currentScore > scores.maxScore) {
        scores.maxScore = scores.currentScore;
        d3.select(".high span").text(scores.currentScore);
      }
      d3.select(".collisions span").text(scores.collisionCounter);
      scores.currentScore = 0;
    }

    d3.select('.current span').text(scores.currentScore);

    function anyCollision(){
      var playercx = d3.select('.player').attr('cx');
      var playercy = d3.select('.player').attr('cy');

      for (var i = 0; i < enemies.length; i++){
        var cx = d3.select('#i' + (i+1)).attr('cx');
        var cy = d3.select('#i' + (i+1)).attr('cy');
        var distance = Math.sqrt(Math.pow(playercx - cx,2) + Math.pow(playercy - cy,2));
        var totalRadius = gameOptions.radius * 2;
        if(distance < totalRadius)
          return true;
      }
      return false;
    }
  }
  d3.timer(collisionDetection);

  // Randomizes the background color every 1s
  // Inverts the players color w/ the background color every 1s
  setInterval(function(){
    var num1 = Math.floor(Math.random()*255);
    var num3 = Math.floor(Math.random()*255);
    var num2 = Math.floor(Math.random()*255);
    d3.select('.gameBoard').style('background-color', function(d){
      return 'rgb('+num1+','+num2+','+num3+')'
    })
    d3.select('.player').attr('fill', function(){
      return 'rgb('+(255-num1)+','+(255-num2)+','+(255-num3)+')'
    })
  },1000)

}

  // // Drag behavior
  // var dragCallback = function() {
  //   player.x += d3.event.dx;
  //   player.y += d3.event.dy;

  //   if (player.x > gameOptions.boardWidth) { player.x = gameOptions.boardWidth }
  //   if (player.y > gameOptions.boardHeight) { player.y = gameOptions.boardHeight }

  //   if(player.x < 0) player.x = 0;
  //   if(player.y < 0) player.y = 0;

  //   d3.selectAll('.player').data([player])
  //     .attr({
  //       cx : player.x,
  //       cy : player.y
  //     })
  // }
  // var drag = d3.behavior.drag().on('drag',dragCallback)
  // d3.select(".player").call(drag);
