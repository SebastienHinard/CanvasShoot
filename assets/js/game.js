var game={ state: 'start', timer1:0 }; //objet jeu
//tableau des etoiles
var nbStars=100;
var stars=new Array(nbStars);
for (var s=0; s<nbStars; s++){
  stars[s]=new Object();
  stars[s].x=Math.random()*340-20;
  stars[s].y=Math.random()*260-20;
  stars[s].size=Math.random()*2+1;
}
//variables des input player
var keyUp=0, keyDown=0, keyLeft=0, keyRight=0, keyShoot=0;
//contexte du canvas
var c = document.getElementById('game');
var ctx = c.getContext('2d');
//refresh rate
window.setInterval(updateGame,20);
document.addEventListener('keydown',keydownHandler,false);
document.addEventListener('keyup',keyupHandler,false);
//on initialise le jeu
initGame();
////////////////////////////
//main loop
function updateGame(){
    switch (game.state){
        case 'start':   //ecran de demarrage
            ctx.clearRect(0,0,320,240);
            drawBackground();
            updatePlayer();
            ctx.beginPath();
            ctx.fillStyle='white';
            ctx.fillText('- -  PRESS \' SPACE \' TO START  - -',80,120);
            ctx.closePath();
            if(keyShoot && game.timer1>30){
                game.state='play';
                game.timer1=0;
            }else{
                game.timer1++;
            }
        break;
        case 'play':    //scene de jeu
            ctx.clearRect(0,0,320,240);
            drawBackground();
            updatePlayer();
            updateBullets();
            updateEnemies();
            updateParticles();
            drawUI();
            updateDifficulty();
        break;
        case 'gameover':    //ecran gameover
            ctx.clearRect(0,0,320,240);
            drawBackground();
            ctx.beginPath();
            ctx.fillStyle='white';
            ctx.fillText('- -  GAMEOVER  - -',120,120);
            ctx.fillText('SCORE: '+score,140,140);
            ctx.fillText('press \' space \' to restart',115,180);
            ctx.closePath();
            if(keyShoot && game.timer1>50){
                game.state='start';
                game.timer1=0;
                initGame();
            }else{
                game.timer1++;
            }
        break;
    }
}
////////////////////////////
//cette fonction réinitialise le jeu
function initGame(){
    bullets=[]; //tableau des bullets
    enemies=[]; //tableau des enemies
    enemyBullets=[]; //bullets enemies
    particles=[]; //tableau des particules
    //vatiables player
    player={ x:160,y:220,shootTimer:0,bboxSize:4,state:'free',timer1:0}
    life=3,score=0;
    fps=0;
    spawnTimer=0;
    spawnSpeed=80;
}
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
    switch (player.state){
        case 'init':
            player.x=160;
            player.y=220;
            player.shootTimer=0;
            player.state='free';
            for (var e=0; e<enemies.length; e++){
                enemies[e].life=0;
            }
            enemyBullets=[];
            spawnSpeed+=5;
            if (spawnSpeed>80){
                spawnSpeed=80;
            }
        break;
        case 'free':
            //deplacements du joueur
            if (keyUp && player.y>0){    player.y-=2.5;  }
            if (keyDown && player.y<240){  player.y+=2.5;  }
            if (keyLeft && player.x>0){  player.x-=2.5;  }
            if (keyRight && player.x<320){  player.x+=2.5;  }
            //mise à jour des collisionBox
            player.bboxTop=player.y-player.bboxSize;
            player.bboxBottom=player.y+player.bboxSize;
            player.bboxLeft=player.x-player.bboxSize;
            player.bboxRight=player.x+player.bboxSize;
            //tir
            if (keyShoot && player.shootTimer <=0){
              player.shootTimer=8;
              shootBullet();
            }
            player.shootTimer--; //cooldown pour le tir du joueur
            //collision avec les enemies
            for (var e=0; e<enemies.length; e++){
                if( collision (player,enemies[e])){
                    life--;
                    enemies[e].life=0;
                    player.state='dying';
                    player.timer1=0;
                    for (var p=0; p<6.3; p+=.3){
                        addParticle(player.x+Math.cos(p)*16,player.y+Math.sin(p)*16,Math.cos(p)/2,Math.sin(p)/2,30);
                        addParticle(player.x+Math.cos(p)*16,player.y+Math.sin(p)*16,Math.cos(p),Math.sin(p),20);
                    }
                }
            }
            //collision avec les bullets enemies
            for (var b=0; b<enemyBullets.length; b++){
                if( collision (player,enemyBullets[b])){
                    life--;
                    enemyBullets.splice(b,1);
                    player.state='dying';
                    player.timer1=0;
                    for (var p=0; p<6.3; p+=.3){
                        addParticle(player.x+Math.cos(p)*16,player.y+Math.sin(p)*16,Math.cos(p)/2,Math.sin(p)/2,30);
                        addParticle(player.x+Math.cos(p)*16,player.y+Math.sin(p)*16,Math.cos(p),Math.sin(p),20);
                    }
                }
            }
            //dessin du joueur
            ctx.beginPath();
            ctx.fillStyle='white';
            ctx.moveTo(player.x-8,player.y+8);
            ctx.lineTo(player.x,player.y-8);
            ctx.lineTo(player.x+8,player.y+8);
            ctx.lineTo(player.x-8,player.y+8);
            ctx.fill();
            ctx.closePath();
        break;
        case 'dying':
            player.timer1++;
            if (player.timer1>50){
                if (life>0){
                    player.state='init';
                }else{
                    game.state='gameover';
                    game.timer1=0;
                }
            }
        break;
    }
}
//dessine l'interface
function drawUI(){
  ctx.beginPath();
  ctx.fillStyle="white";
  ctx.fillText("SCORE: "+score,5,12);
  ctx.fillText("LIFE: "+life,5,22);
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
  thisBullet.x=player.x;
  thisBullet.y=player.y-10;
  //collisionBox
  thisBullet.bboxSize=2;
  thisBullet.bboxTop=thisBullet.y-thisBullet.bboxSize;
  thisBullet.bboxBottom=thisBullet.y+thisBullet.bboxSize;
  thisBullet.bboxLeft=thisBullet.y-thisBullet.bboxSize;
  thisBullet.bboxRight=thisBullet.y+thisBullet.bboxSize;
  bullets.push(thisBullet);
}
function updateBullets(){
    //bullets du joueur
  for (var b=0; b<bullets.length; b++){
    bullets[b].y-=5;
    bullets[b].bboxTop=bullets[b].y-bullets[b].bboxSize;
    bullets[b].bboxBottom=bullets[b].y+bullets[b].bboxSize;
    bullets[b].bboxLeft=bullets[b].x-bullets[b].bboxSize;
    bullets[b].bboxRight=bullets[b].x+bullets[b].bboxSize;
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
  //bullets enemies
  for (var b=0; b<enemyBullets.length; b++){
      enemyBullets[b].x+=enemyBullets[b].xinc;
      enemyBullets[b].y+=enemyBullets[b].yinc;
      enemyBullets[b].bboxTop=enemyBullets[b].y-enemyBullets[b].bboxSize;
      enemyBullets[b].bboxBottom=enemyBullets[b].y+enemyBullets[b].bboxSize;
      enemyBullets[b].bboxLeft=enemyBullets[b].x-enemyBullets[b].bboxSize;
      enemyBullets[b].bboxRight=enemyBullets[b].x+enemyBullets[b].bboxSize;

      //si la bullet sort de l'ecran
      if (enemyBullets[b].x>340 || enemyBullets[b].x<-20 || enemyBullets[b].y<-20 || enemyBullets[b].y>260){
          enemyBullets.splice(b,1);
      }else{
          ctx.beginPath();
          ctx.strokeStyle='white';
          ctx.strokeRect(enemyBullets[b].x-1,enemyBullets[b].y-1,2,2);
      }
  }
}
//ajout d'un ennemi
function addEnemy(x,y,type){
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
            //collision box
            thisEnemy.bboxSize=8;
            thisEnemy.bboxTop=thisEnemy.y-thisEnemy.bboxSize;
            thisEnemy.bboxBottom=thisEnemy.y+thisEnemy.bboxSize;
            thisEnemy.bboxLeft=thisEnemy.x-thisEnemy.bboxSize;
            thisEnemy.bboxRight=thisEnemy.x+thisEnemy.bboxSize;
            enemies.push(thisEnemy);
        break;
    }
}
//mise à jour des enemies
function updateEnemies(){
    if (spawnTimer>spawnSpeed){
        addEnemy(Math.random()*280+20,0,1);
        spawnTimer=0;
    }else{
        spawnTimer++;
    }
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
//enemy de type1
function updateEnemyT01(e){
    //on deplace l'enemi vers le bas
    enemies[e].y+=.8;
    //mise à jour de la collisionBox
    enemies[e].bboxTop=enemies[e].y-enemies[e].bboxSize;
    enemies[e].bboxBottom=enemies[e].y+enemies[e].bboxSize;
    enemies[e].bboxLeft=enemies[e].x-enemies[e].bboxSize;
    enemies[e].bboxRight=enemies[e].x+enemies[e].bboxSize;
    //on recupere les coordonnées
    let x=enemies[e].x;
    let y=enemies[e].y;
    //tir de l'enemy
    enemies[e].timer1++;
    if (enemies[e].timer1>100){
        for (a=0; a<6.3; a+=.8){
            enemies[e].timer1=0;
            addEnemyBullet(enemies[e].x+Math.cos(a)*8,enemies[e].y+Math.sin(a)*8+16,Math.cos(a),Math.sin(a));
        }
    }
    //collision avec les bullets
    for (var b=0; b<bullets.length; b++){
        if (collision(bullets[b],enemies[e])){
            enemies[e].life-=1;
            if (enemies[e].life<=0){
                score+=10+80-spawnSpeed;
            }
            for(var p=0;p<5;p++){
                addParticle(bullets[b].x,bullets[b].y,Math.random()*4-2 ,Math.random()*4,20);
            }
            bullets.splice(b,1);
        }
    }
    //si il atteint le bas de l'ecran il disparait
    if (enemies[e].y> 270 || enemies[e].life<=0){
        if (enemies[e].life<=0){
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
//fonction gerant les collisions
function collision(obj1,obj2){
    var collideX=false;
    var collideY=false;
    if ( obj1.bboxRight>obj2.bboxLeft && obj1.bboxRight<obj2.bboxRight) { collideX=true; }
    if ( obj1.bboxLeft<obj2.bboxRight && obj1.bboxLeft>obj2.bboxLeft) { collideX=true; }
    if ( obj1.bboxTop>obj2.bboxTop && obj1.bboxTop<obj2.bboxBottom) { collideY=true; }
    if ( obj1.bboxBottom>obj2.bboxTop && obj1.bboxBottom<obj2.bboxBottom) { collideY=true; }
    return ( collideX==true && collideY==true )
}
//augmente la difficulté
function updateDifficulty(){
    game.timer1++;
    if (game.timer1>100){
        if(spawnSpeed>0){
            game.timer1=0;
            spawnSpeed--;
        }
    }
}
function addEnemyBullet(x,y,xinc,yinc){
    let thisBullet={ x : x, y : y, xinc: xinc, yinc: yinc, bboxSize: 2 };
    enemyBullets.push(thisBullet);
}
