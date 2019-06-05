//vatiables player
var playerX=160,playerY=220,shootTimer=0;
var keyUp=0, keyDown=0, keyLeft=0, keyRight=0, keyShoot=0;
var life=3,score=0;
var fps=0;
var spawnTimer=0;
//tableau des etoiles
var nbStars=100;
var stars=new Array(nbStars);
for (var s=0; s<nbStars; s++){
  stars[s]=new Object();
  stars[s].x=Math.random()*340-20;
  stars[s].y=Math.random()*260-20;
  stars[s].size=Math.random()*2+1;
}
//tableau des bullets
var bullets=new Array();
//tableau des enemies
var enemies=new Array();
//tableau des particules
var particles=new Array();
//Test
add_enemy(160,40,1);
//contexte du canvas
var c = document.getElementById('game');
var ctx = c.getContext('2d');
//refresh rate
window.setInterval(updateGame,20);
document.addEventListener('keydown',keydownHandler,false);
document.addEventListener('keyup',keyupHandler,false);
////////////////////////////
//main loop
function updateGame(){
  ctx.clearRect(0,0,320,240);
  drawBackground();
  updatePlayer();
  updateBullets();
  updateEnemies();
  updateParticles();
  drawUI();
}
////////////////////////////
//draw background
function drawBackground(){
  ctx.beginPath();
  ctx.fillStyle="black";
  ctx.fillRect(0,0,320,240);
  ctx.closePath();
  //on dessine les etoiles
  for (var s=0; s<nbStars; s++){
    ctx.beginPath();
    ctx.fillStyle="white";
    ctx.fillRect(stars[s].x,stars[s].y,stars[s].size/2,stars[s].size/2);
    stars[s].y+=stars[s].size;
    stars[s].x+=(keyLeft-keyRight)/3*(stars[s].size/2);
    if (stars[s].y>240){
      stars[s].y=0;
      stars[s].x=Math.random()*340-20;
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
    shootTimer=8;
    shootBullet();
  }
  shootTimer--; //cooldown pour le tir du joueur
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
//dessine l'interface
function drawUI(){
  ctx.beginPath();
  ctx.fillStyle="white";
  ctx.fillText("SCORE: "+score,5,12);
  ctx.fillText("LIFE: "+life,5,22);
  //calcul du FPS
  ctx.fillText("FPS: "+((performance.now()-fps)/20*60).toFixed(),5,32);
  fps=performance.now();
  ctx.closePath();
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
  let thisBullet= new Object();
  thisBullet.x=playerX;
  thisBullet.y=playerY-10;
  bullets.push(thisBullet);
}
function updateBullets(){
  for (var b=0; b<bullets.length; b++){
    bullets[b].y-=5;
    //remove out-of-sight updateBullets
    if (bullets[b].y<0){
      bullets.splice(b,1);
    }else {
      //drawbullet
      ctx.beginPath();
      ctx.fillStyle='white';
      ctx.fillRect(bullets[b].x-1,bullets[b].y,2,4);
      ctx.closePath();
    }
  }
}
//ajout d'un ennemi
function add_enemy(x,y,type){
    switch(type){
        case 1:
            let thisEnemy= new Object();
            thisEnemy.x=x;
            thisEnemy.y=y;
            thisEnemy.type=1
            thisEnemy.life=3;
            thisEnemy.state=1;
            thisEnemy.timer1=0;
            thisEnemy.timer2=0;
            enemies.push(thisEnemy);
        break;
    }
}
//mise à jour des enemies
function updateEnemies(){
    if (spawnTimer>60){
        add_enemy(Math.random()*280+20,0,1);
        spawnTimer=0;
    }else{
        spawnTimer++;
    }
    if (enemies.length>0){
        //on boucle sur le tableau enemies
        for (var e=0;e<enemies.length;e++){
            // selon le type d'enemy
            switch(enemies[e].type){
                case 1:
                    updateEnemyT01(e);
                break;
            }
        }
    }
}
//enemy de type1
function updateEnemyT01(e){
    //on deplace l'enemi vers le bas
    enemies[e].y++;
    //on recupere les coordonnées
    let x=enemies[e].x;
    let y=enemies[e].y;
    //collision avec les bullets
    for (var b=0; b<bullets.length; b++){
        if (bullets[b].x>enemies[e].x-8 && bullets[b].x<enemies[e].x+8
        && bullets[b].y>enemies[e].y-8 && bullets[b].y<enemies[e].y+8){
            enemies[e].life-=1;
            for(var p=0;p<5;p++){
                addParticle(bullets[b].x,bullets[b].y,Math.random()*4-2 ,Math.random()*4,20);
            }
            bullets.splice(b,1);
        }
    }
    //si il atteint le bas de l'ecran il disparait
    if (enemies[e].y> 270 || enemies[e].life<=0){
        if (enemies[e].life<=0){
            score +=10;
            for (var p=0; p<6.3; p+=.3){
                addParticle(enemies[e].x+Math.cos(p)*16,enemies[e].y+Math.sin(p)*16,Math.cos(p)/2,Math.sin(p)/2,30);
                addParticle(enemies[e].x+Math.cos(p)*16,enemies[e].y+Math.sin(p)*16,Math.cos(p),Math.sin(p),20);
            }
        }
        enemies.splice(e,1);
    }else{
        //on dessine l'ennemi
        ctx.beginPath();
        ctx.fillStyle="white";
        ctx.strokeStyle="white";
        ctx.fillRect(x-8,y-8,16,16);
        ctx.fillRect(x-12,y-3,24,8);
        ctx.fillRect(x-6,y-10,4,2);
        ctx.fillRect(x+2,y-10,4,2);
        ctx.arc(x, y+6, 8, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
    }
}
//ajoute une particule lors d'un impact
function addParticle(x,y,xinc,yinc,life){
    let particle = new Object();
    particle.x=x;
    particle.y=y;
    particle.xinc=xinc;
    particle.yinc=yinc;
    particle.life=life;
    particle.lifeMax=life;
    particles.push(particle);
}
//met a jour les particules
function updateParticles(){
    for (var p=0; p< particles.length; p++){
        if (particles[p].life>0){
            particles[p].x+=particles[p].xinc;
            particles[p].y+=particles[p].yinc;
            particles[p].life--;
            let opacity = particles[p].life/particles[p].lifeMax;
            ctx.beginPath;
            ctx.fillStyle = "rgba(255,255,255,"+opacity+")";
            ctx.fillRect(particles[p].x,particles[p].y,2,2);
        }else{
            particles.splice(p,1);
        }
    }
}
