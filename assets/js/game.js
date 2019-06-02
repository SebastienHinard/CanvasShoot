//vatiables player
var playerX=160,playerY=220,shootTimer=0;
var keyUp=0, keyDown=0, keyLeft=0, keyRight=0, keyShoot=0;
var life=3,score=0;
//tableau des etoiles
var nbStars=100;
var stars=new Array(nbStars);
for (var s=0; s<nbStars; s++){
  stars[s]=new Array(3);
  stars[s][0]=Math.random()*340-20;
  stars[s][1]=Math.random()*260-20;
  stars[s][2]=Math.random()*2+1;
}
//tableau des bullets
var bullets=new Array();
//contexte du canvas
var c = document.getElementById('game');
var ctx = c.getContext('2d');
//refresh rate
window.setInterval(updateGame,20);
document.addEventListener('keydown',keydownHandler,false);
document.addEventListener('keyup',keyupHandler,false);
//main loop
function updateGame(){
  ctx.clearRect(0,0,320,240);
  drawBackground();
  updatePlayer();
  updateBullets();
  drawUI();
}
//draw background
function drawBackground(){
  ctx.beginPath();
  ctx.fillStyle="black";
  ctx.fillRect(0,0,320,240);
  ctx.closePath();
  //on dessine les etoiles
  for (var v=0; v<nbStars; v++){
    ctx.beginPath();
    ctx.fillStyle="white";
    ctx.fillRect(stars[v][0],stars[v][1],stars[v][2]/2,stars[v][2]/2);
    stars[v][1]+=stars[v][2];
    stars[v][0]+=(keyLeft-keyRight)/3*(stars[v][2]/2);
    if (stars[v][1]>240){
      stars[v][1]=0;
      stars[v][0]=Math.random()*340-20;
    }
  }
}
//draw player sprite
function updatePlayer(){
  //deplacements du joueur
  if (keyUp && playerY>0){    playerY-=2.5;  }
  if (keyDown && playerY<240){  playerY+=2.5;  }
  if (keyLeft && playerX>0){  playerX-=2.5;  }
  if (keyRight && playerX<320){  playerX+=2.5;  }
  if (keyShoot && shootTimer <=0){
    shootTimer=10;
    shootBullet();
  }
  shootTimer--;
  //dessin du joueur
  ctx.beginPath();
  ctx.fillStyle='white';
  ctx.moveTo(playerX-8,playerY+8);
  ctx.lineTo(playerX,playerY-8);
  ctx.lineTo(playerX+8,playerY+8);
  ctx.lineTo(playerX-8,playerY+8);
  ctx.fill();
  ctx.closePath();
}
function drawUI(){
  ctx.beginPath();
  ctx.fillStyle="white";
  ctx.fillText("SCORE: "+score,5,12);
  ctx.fillText("LIFE: "+life,5,22);
}
//lorsqu'une touche est enfoncée
function keydownHandler(e){
  switch(e.keyCode){
    case 37:  keyLeft=1;  break;
    case 38:  keyUp=1;  break;
    case 39:  keyRight=1;  break;
    case 40:  keyDown=1;  break;
    case 32:  keyShoot=1;  break;
  }
}
//lorsqu'une touche est relachée
function keyupHandler(e){
  switch(e.keyCode){
    case 37:  keyLeft=0;  break;
    case 38:  keyUp=0;  break;
    case 39:  keyRight=0;  break;
    case 40:  keyDown=0;  break;
    case 32:  keyShoot=0;  break;
  }
}
//ajout d'une bullet
function shootBullet(){
  let thisBullet=[playerX,playerY-10];
  bullets.push(thisBullet);
}
function updateBullets(){
  for (var i=0; i<bullets.length; i++){
    bullets[i][1]-=5;
    //remove out-of-sight updateBullets
    if (bullets[i][1]<0){
      bullets.splice(i,1);
    }else {
      //drawbullet
      ctx.beginPath();
      ctx.fillStyle='white';
      ctx.fillRect(bullets[i][0]-1,bullets[i][1],2,4);
      ctx.closePath();
    }
  }
}
