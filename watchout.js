// 1. How does Select() work vs SelectAll()


// Board initialization
var enemies = [];
var gameOptions = {
  nEnemies: 30,
  boardHeight: 600,//450,
  boardWidth: 900,//700,
  boardColor : "rgb(223, 223, 223)",
  radius : 12.5,
  gameSpeedTime : 10000
}

// Initializing the score
var scores = {
  maxScore: 0,
  currentScore: 0,
  collisionCounter: 0
}


// Initializing the player
var player = {};
player.x = gameOptions.boardWidth/2;
player.y = gameOptions.boardHeight/2;


// Enemy Maker Function
var makeEnemy = function(id) {
  var enemy = Object.create(makeEnemy.prototype);
  enemy.id = id;
  enemy.x = Math.random() * gameOptions.boardWidth;
  enemy.y = Math.random() * gameOptions.boardHeight;

  // Function to generate a new position
  enemy.updatePosition = function(){
    this.x = Math.random() * gameOptions.boardWidth;
    this.y = Math.random() * gameOptions.boardHeight;
  }
  return enemy;
}

// Makes the enemies
for(var i = 0; i < gameOptions.nEnemies; i++){
  enemies.push(makeEnemy(i+1));
}

// D3 Stuff --------- --------- --------- --------- --------- --------- ---------
// Create the SVG inside the div board
d3.select('.board').append('svg:svg')
  .attr({
    class : 'gameBoard',
    height : gameOptions.boardHeight,
    width : gameOptions.boardWidth
  }).style('background-color', gameOptions.boardColor)

// Populate the SVG with our Enemies
// var debug = d3.select("svg").selectAll('circle').data(enemies).enter()

d3.select("svg").selectAll('polygon')
  .data(enemies).enter().append("svg:polygon").attr("class","enemy")
  .attr('cx', function(d) { return d.x })
  .attr('cy', function(d) { return d.y })
  .attr('r', gameOptions.radius)
  .attr('id', function(d) { return 'i'+ d.id })
  .attr('fill', function(d){
    var num1 = Math.floor(Math.random()*255)
    var num2 = Math.floor(Math.random()*255)
    var num3 = Math.floor(Math.random()*255)
    return 'rgb('+num1+','+num2+','+num3+')'
  })
  .attr('points', "0 50, 40 40, 50 0, 60 40, 100 50, 60 60, 50 100, 40 60")
  .attr("transform", function(d) {
    return "translate("+d.x+","+d.y+")" + " scale(0.25)";
  })

// SVG Shuriken Maker




// Initial render of the player
d3.select('svg').selectAll("circle .player").data([player]).enter().append("svg:circle")
  .attr({
    'cx' : player.x,
    'cy' : player.y,
    'r'  : gameOptions.radius,
    'class': 'player',
    'fill' : 'red'
  })

// Drag behavior

var dragCallback = function() {
  // Update the player's internal javascript x,y locations
  player.x += d3.event.dx;
  player.y += d3.event.dy;

  if (player.x > gameOptions.boardWidth) { player.x = gameOptions.boardWidth }
  if (player.y > gameOptions.boardHeight) { player.y = gameOptions.boardHeight }

  if(player.x < 0) player.x = 0;
  if(player.y < 0) player.y = 0;

  // Re-render him to the page
  d3.selectAll('.player').data([player])
    .attr({
      cx : player.x,
      cy : player.y
    })
}
var drag = d3.behavior.drag().on('drag',dragCallback)
d3.select(".player").call(drag);
 // --------- --------- --------- --------- --------- --------- --------- ---------


// TIME-based methods ========== ============================================================
//
// Update the enemies every 1 second
setInterval(function(){
  // Need some way to update all the positions of the enemies in here
  // for loop that runs some UpdatePosition method
  for (var i = 0; i < enemies.length;i++) {
    enemies[i].updatePosition()
  }
  // Render to the page
  d3.selectAll('.enemy').data(enemies).transition().duration(gameOptions.gameSpeedTime)
    .attr({
      cx : function(enemy) { return enemy.x+12.5 }, //
      cy : function(enemy) { return enemy.y+12.5 },
      transform : function(enemy) { return "translate("+enemy.x+","+enemy.y+")"}
    })
}, gameOptions.gameSpeedTime)

// Updates the score every 50ms
setInterval(function() {
  // Increment the score in the variable
  scores.currentScore++;
  // Updating the maxscore if current score is above it

  // Check collision
  if(anyCollision()) {
    // debugger;
    scores.collisionCounter++;
    if (scores.currentScore > scores.maxScore) {
      scores.maxScore = scores.currentScore;
      d3.select(".high span").text(scores.currentScore);
    }
    d3.select(".collisions span").text(scores.collisionCounter);
    scores.currentScore = 0;
  }

  // Render this to the page
  d3.select('.current span').text(scores.currentScore);

  function anyCollision(){
    // for each enemy
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
}, 50)

//
setInterval(function(){
  var num1 = Math.floor(Math.random()*255);

  d3.select('.gameBoard').style('background-color', function(d){
    return 'rgb('+num1+','+num1+','+num1+')'
  })
  d3.select('.player').attr('fill', function(){
    return 'rgb('+(255-num1)+','+(255-num1)+','+(255-num1)+')'
  })
},1000)

// setTimeout(function(){
//   debugger;
// },5000)
