$(window).on('load', function() { $('.loading').hide();
alert('from load') });
$(document).ready(() => {
  alert('from ready')
  let fps = 1000/24;
  let globalCounter = 0;
  let bgMusic = true;
  let soundEffects = true;
  let whichBG = parseInt(Math.random()*4 +1); // BG sound
  let stage = 1;
  let goal = 15;
  let healthToReach = 15;
  let healthStore = 0;
  let gameSpeed = 10;
  let needToAddBg = true;
  const keys = {};
  let hero = {
    left : 0,
    bottom : 0,
    health : 3,
    speed : 10,
    bulletPower : 1,
    bulletSpeed : 15,
    bulletInterval : 20,
    bulletFired : 0,
    element: $("#hero"),
    lavel : 0,
  };
  let skyMove;
  let planetsBg = [
    'planet.png', 'planet1.png', 'planet2.png', 'planet3.png', 'planet4.png', 'planet5.png', 'planet6.png', 'planet7.png', 'planet8.png',
    'planet9.png', 'planet10.png', 'planet11.png', 'planet12.png', 'planet13.png', 'planet14.png', 'planet15.png',
  ];
  let gotoNextStage = false;
  let nextStageInterval = 0;
  let enemyDirection = [];
  let pause = false;
  let specialPower;
  let powerTime;
  const powers = ['bulletSpeedUp', 'bulletSpeedDown', 'moveFaster', 'moveSlower', 'protectionOn', 'protectionOff'];
  let heroProtected = false;
  let missionCompleteCall = 0;
  let missionCompleteGoback = 0;
  let missionComplete = false;
  let missionCompleteGo = false;

  // start game
  $('#gameStart').click(function () {
    $('.introCont').hide();
    mainloop.resume();
    backgroundMusic(whichBG);
  });

  // game Help
  $('#gameHelp').click(function () {
    $('.help').fadeIn(500);
  });

  // game About
  $('#gameAbout').click(function () {
    $('.about').fadeIn(500);
  });

  // exit game
  $('#gameExit').click(function () {
    window.close();
  })

  // close popup
  $('.closeDailog').click(function () {
    $(this).closest('.popup').fadeOut(500);
  });

  // game pause
  $("#pause").click(() => {
    if (!pause) {
      pause = true;
      let gp = $('<div>', { class : 'gamePause', id: 'resume'}).appendTo('.gameArea');
      $(gp).prepend(`<img src="images/continue.png" >`);
      mainloop.pause();
      $('#bgMusic')[0].remove();
    }
  });

  // game resume
  $('body').on('click', '#resume', function () {
    if (hero.health > 0) {
      $('#resume').remove();
      mainloop.resume();
      backgroundMusic(whichBG);
      pause = false;
    }
  })

  // bg music
  let backgroundMusic = (bg) => {
    $(`<audio id="bgMusic" loop style="display:none">
      <source src="sounds/bg/bg${bg}.mp3" type="audio/mpeg">
      </audio>`).appendTo('body');
      $('#bgMusic')[0].play();
  }
  // backgroundMusic(whichBG);

  let refreshLavel = (stage) => {
    $("#stage").text(stage);
  }
  refreshLavel(stage);

  let refreshBulletPower = (power) => {
    $("#bulletPower").text(power);
  }
  refreshBulletPower(hero.bulletPower);

  let upgradePlane = (lvl) => {
    hero.element.find('img').attr('src', `images/flight${lvl}.png`);
  }

  let refreshHeroHelth = (health) => {
    let currentHealth = health - healthStore;
    $("#currentHealth").text(currentHealth);
    $("#healthToReach").text(healthToReach);
    const per = (currentHealth * 100) / healthToReach; // green
    const per1 = 100 - per; // red
    const greenVal = parseInt((255 * per) / 100);
    const redVal = parseInt((255 * per1) / 100);
    const forBulletInterval = parseInt((12 * per) / 100);

    $('.powerBar span').css({'width': `${per}%`, 'background': `rgba(${redVal},${greenVal},0,1)`});
    hero.bulletInterval = 20 - forBulletInterval;

    if (currentHealth >= healthToReach) {
      // play sound
      if (soundEffects){
        let id = globalCounter;
        $(`<audio id="powerUp${id}" controls style="display:none">
          <source src="sounds/hero/powerUp.mp3" type="audio/mpeg">
          </audio>`).appendTo('body');
          $(`#powerUp${id}`)[0].play();
          $(`#powerUp${id}`)[0].addEventListener("ended", function(){
               $(`#powerUp${id}`).remove();
          });
      }
      hero.lavel ++;
      hero.bulletPower ++;
      healthStore += healthToReach;
      healthToReach += goal;
      refreshHeroHelth(hero.health);

    }
    upgradePlane(hero.lavel+1);
    refreshBulletPower(hero.bulletPower);
  }
  refreshHeroHelth(hero.health);


  upgradePlane(hero.lavel+1);

  // BG music controller
  let soundController = (ele, status) => {
    if (status) {
      $(`#${ele}`)[0].play();
    } else {
      $(`#${ele}`)[0].pause();
    }
  }

  $('#music').click(() => {
    bgMusic = !bgMusic;
    soundController('bgMusic', bgMusic);
    if (bgMusic) {
      $('#music').css('background', `url('images/music.png')`);
    } else {
      $('#music').css('background', `url('images/musicMute.png')`);
    }
  });

  // game sound effect controller
  $('#sounds').click(() => {
    soundEffects = !soundEffects;
    if (soundEffects) {
      $('#sounds').css('background', `url('images/sound.png')`);
    } else {
      $('#sounds').css('background', `url('images/soundMute.png')`);
    }
  });

  // background music suffle
  $('#suffle').click(() => {
    $('#bgMusic').remove()
    whichBG = parseInt(Math.random()*4 +1);
    backgroundMusic(whichBG);
  });

  // key down logic
  /// store key codes and currently pressed ones
  keys.UP = 38;
  keys.LEFT = 37;
  keys.RIGHT = 39;
  keys.DOWN = 40;
  keys.SPACE = 32;

   /// key detection (better to use addEventListener, but this will do)
   document.body.onkeyup =
   document.body.onkeydown = function(e){
     if (e.preventDefault) {
       e.preventDefault();
     }
     else {
       e.returnValue = false;
     }
     let kc = e.keyCode || e.which;
     keys[kc] = e.type == 'keydown';
   };

   /// character movement update
   let moveCharacter = (dx, dy) => {
     hero.left += (dx||0) * hero.speed;
     hero.bottom += (dy||0) * hero.speed;
     hero.element.css("left", hero.left+'px');
     hero.element.css("bottom", hero.bottom+'px');
   };

   /// character control
   let detectCharacterMovement = () => {
     if ( keys[keys.LEFT] ) {
       if (hero.element.offset().left > $(".gameArea").offset().left) {
         moveCharacter(-1, 0);
       }
     }
     if ( keys[keys.RIGHT] ) {
       if ((hero.element.offset().left + hero.element.width()) < ($(".gameArea").offset().left + $(".gameArea").width())) {
         moveCharacter(1, 0);
       }
     }
     if ( keys[keys.UP] ) {
       if(hero.element.offset().top > hero.speed) {
         moveCharacter(0, 1);
       }
     }
     if ( keys[keys.DOWN] ) {
       if((hero.element.offset().top + hero.element.height()) < $(".gameArea").height()) {
         moveCharacter(0, -1);
       }
     }
     if ( keys[keys.SPACE] ) {
       // bullet fired
       if (globalCounter > hero.bulletFired ){
         hero.bulletFired = globalCounter + hero.bulletInterval;

         let bullet = $('<div>', {
            class: `heroBullet heroBullet bullet${hero.bulletPower}`,
            css : {
              width : `${heroData['hero'+hero.bulletPower].bulletWidth}px`,
              height : `${heroData['hero'+hero.bulletPower].bulletHeight}px`,
              background : `url(${heroData['hero'+hero.bulletPower].bulletBg})` ,
              left : hero.element.offset().left + (hero.element.width()/2 - (heroData['hero'+hero.bulletPower].bulletWidth / 2)) + "px",
              top : hero.element.offset().top + "px",
            }
          }).appendTo('body');

          // play sound
          if (soundEffects){
            let id = globalCounter;
            $(`<audio id="heroBullet_${id}" controls style="display:none">
              <source src="sounds/hero/bullet1.mp3" type="audio/mpeg">
              </audio>`).appendTo('body');
              $(`#heroBullet_${id}`)[0].play();
              $(`#heroBullet_${id}`)[0].addEventListener("ended", function(){
                   $(`#heroBullet_${id}`).remove();
              });
          }


        }
     }
   };

   let hitTestForHero = (ele) => {
     let enemyShip = $('.enemy');
     $.each(enemyShip, (index, enemy) => {
       let enemyEle = $(enemy);
       if (ele.offset().top <= (enemyEle.offset().top + enemyEle.height())
           && ele.offset().top > enemyEle.offset().top
           && ele.offset().left + ele.width() > enemyEle.offset().left
           && ele.offset().left < (enemyEle.offset().left + enemyEle.width())) {
             let top = ele.offset().top;
             let left = ele.offset().left
             refreshEnemyHelth(enemyEle);
             if (enemyEle.attr('powerServe') == 'true') { // checking is powerservable
               enemyEle.attr('powerServe', 'false');
               if (parseInt(Math.random() * 2)) { // again luck try will serve power or not
                 let whichPower = parseInt(Math.random() * 6);
                 powerBuilder(top, left, powers[whichPower]);
               }
             }
             ele.css('top', '-100px');
       }
     });

   }

   /// update current hero's position on screen
   moveCharacter();

   /// game loop
   let mainloop = new InvervalTimer(function () {
       globalCounter++;
       detectCharacterMovement();

       // movements of sky
       $('#sky img').animate({'bottom' : '-='+ gameSpeed+'px' }, 0);

       // remove sky from stage
       if($('#sky img:last-child').offset().top > $(".gameArea").height()) {
         $('#sky img:last-child').remove();
         needToAddBg = true;
       }
       // create new sky and attach
       if(($('#sky img:last-child').offset().top > (30 + gameSpeed) * -1) && needToAddBg) {
         const newImg = $("<img>", {src: "images/spaceBg.jpg", "style": `bottom:0px`}); //${$(".gameArea").height() + gameSpeed}
         $("#sky").prepend(newImg);
         needToAddBg = false;
       }

      //  movement of planets
      $('#planet1').css({'top' : '+='+ ($('#planet1').width()/300) * gameSpeed +'px' });
      if ($('#planet1').offset().top > ($(".gameArea").height() + $('#planet1').height()) +1000) {
        let planetInfo =  planetBuilder ();
        $('#planet1').css({
          width:+planetInfo.width+"px",
          height:planetInfo.height+"px",
          top: planetInfo.top,
          left:planetInfo.left,
          zIndex : parseInt(planetInfo.width),
          background:"url('images/"+planetInfo.bg+"')",
        })
      }

      $('#planet2').css({'top' : '+='+ ($('#planet2').width()/300) * gameSpeed +'px' });
      if ($('#planet2').offset().top > ($(".gameArea").height() + $('#planet2').height())+1000) {
        let planetInfo =  planetBuilder ();
        $('#planet2').css({
          width:+planetInfo.width+"px",
          height:planetInfo.height+"px",
          top: planetInfo.top,
          left:planetInfo.left,
          zIndex : parseInt(planetInfo.width),
          background:"url('images/"+planetInfo.bg+"')",
        })
      }

      if(gotoNextStage){
        if (gameSpeed < 50)
          gameSpeed ++;
        if (nextStageInterval < globalCounter)
          gotoNextStage = false;
      } else {
        if (gameSpeed > 10)
          gameSpeed --;
        if (gameSpeed === 11) {
          stage++;
          creatingEnemies(stage);
          refreshLavel(stage);
        }

      }


      // energy move start
      $('.energy').css({top: `+=5px`});
      let energies = $('.energy');
      $.each(energies, (index, energy) => {
        let energyEle = $(energy);
        if (energyEle.offset().top > $('.gameArea').height() + 200) {
          energyEle.remove();
        }

        if ( energyEle.offset().top + (energyEle.height() / 2) >= hero.element.offset().top
              && energyEle.offset().top <= (hero.element.offset().top + hero.element.height())
              && energyEle.offset().left + energyEle.width() > hero.element.offset().left
              && energyEle.offset().left < (hero.element.offset().left + hero.element.width()) ) {

            // play sound
            if (soundEffects){
              let id = globalCounter;
              $(`<audio id="gotEnergy${id}" controls style="display:none">
                <source src="sounds/hero/getEnergy.mp3" type="audio/mpeg">
                </audio>`).appendTo('body');
                $(`#gotEnergy${id}`)[0].play();
                $(`#gotEnergy${id}`)[0].addEventListener("ended", function(){
                     $(`#gotEnergy${id}`).remove();
                });
            }

            var gotEnergy = parseInt(energyEle.find('.energyVal').text());
            hero.health += gotEnergy;
            refreshHeroHelth(hero.health);
            energyEle.remove();
        }
      });// energy move end

      // hero's bullet move start
      let heroBullets = $('.heroBullet');
      $.each(heroBullets, (index, bullet) => {
        hitTestForHero($(bullet));
        $(bullet).css('top', `-=${hero.bulletSpeed}px`);
        if ($(bullet).offset().top < ($(bullet).height() + hero.bulletSpeed) * -1 ) {
          $(bullet).remove();
        }
      });  // hero's bullet move end

      // enemy's bullet move start
      let enemyBullets = $('.enemyBullet');
      $.each(enemyBullets, (index, bullet) => {
        $(bullet).css('top', `+=${enemyData[$(bullet).attr('enemyid')].bulletSpeed}px`);
        let checkHit = hitTestForEnemy($(bullet));
        if(($(bullet).offset().top > $(bullet).height() + $('.gameArea').height() + enemyData[$(bullet).attr('enemyid')].bulletSpeed) || checkHit ) {
          $(bullet).remove();
        }
      });  // enemy's bullet move end

      // enemy fire calculation start
      let enemys = $('.enemy');
      $.each(enemys, (index, enemy) => {
        let ele = $(enemy);
        if (ele.attr('fireInterval') < globalCounter && $(ele).length > 0) {
          ele.attr('fireInterval', parseInt(Math.random() * 50 ) + enemyData[ele.attr('enemyid')].fireInterval + globalCounter);
          let bullet = $('<div>', {
             class: `bullet enemyBullet bullet${enemyData[ele.attr('enemyid')].bulletPower}`,
             css : {
               width : enemyData[ele.attr('enemyid')].bulletWidth,
               height : enemyData[ele.attr('enemyid')].bulletHeight,
               background : `url(${enemyData[ele.attr('enemyid')].bulletBg})` ,
               left : ele.offset().left + (ele.width()/2 - 3) + "px",
               top : ele.offset().top + ele.height() + "px",
             },
             bulletPower : enemyData[ele.attr('enemyid')].bulletPower,
             enemyid : ele.attr('enemyid'),
           }).appendTo('body');
           if (soundEffects) {
             let id = globalCounter;
             $(`<audio id="enemyBullet1${id}" controls style="display:none">
               <source src="sounds/enemy/bullet1.mp3" type="audio/mpeg">
               </audio>`).appendTo('body');
               $(`#enemyBullet1${id}`)[0].play();
               $(`#enemyBullet1${id}`)[0].addEventListener("ended", function(){
                    $(`#enemyBullet1${id}`).remove();
               });
           }

        }

        // random movement for enemies
        const speed = ele.attr('enemySpeed');

        if (ele.attr('direction') === "") {
          ele.attr('direction','seted');
          enemyDirection[ele.attr('id')] = randomDirection(speed);
        } else {

          let direction = enemyDirection[ele.attr('id')];
          if (ele.offset().top <= 0 ) { //////////////////////////////////////////// top block
            enemyDirection[ele.attr('id')] = randomDirection(speed)
            ele.css('top', '1px');
          } else if (ele.offset().top >= ($('.gameArea').height() / 3)) { ///////// Bottom block
            enemyDirection[ele.attr('id')] = randomDirection(speed);
            ele.css('top', ($('.gameArea').height() / 3) - 2 +'px');
          } else if (ele.offset().left <= $(".gameArea").offset().left) { ////////// Left block
            enemyDirection[ele.attr('id')] = randomDirection(speed);
            ele.css('left', '2px');
          } else if (ele.offset().left >= ($('.gameArea').width() + $(".gameArea").offset().left) - ele.width()) { ///// right block
            enemyDirection[ele.attr('id')] = randomDirection(speed);
            ele.css('left', ($('.gameArea').width() - ele.width()) - 2 +'px');
          } else if (direction.changeDirection < globalCounter) {
            enemyDirection[ele.attr('id')] = randomDirection(speed);
          } else {  ////////////////////////////////////////////////////// movement
            if (direction.crossDirection) {
              ele.css(direction.side1, direction.movement1);
              ele.css(direction.side2, direction.movement2);
            } else {
              ele.css(direction.side1, direction.movement1);
            }
          }
      }
    }); // enemy fire calculation end

    // power move start
    let powerEles = $('.power');
    $.each(powerEles, (index, power) => {
      $(power).css('top', `+=6px`);
      // let checkHit = hitTestForEnemy($(bullet));
      if(($(power).offset().top > $(power).height() + $('.gameArea').height() + 6)) {
        $(power).remove();
      }
      if ($(power).offset().top + ($(power).height() / 2) >= hero.element.offset().top
          && $(power).offset().top <= (hero.element.offset().top + hero.element.height())
          && $(power).offset().left + $(power).width() > hero.element.offset().left
          && $(power).offset().left < (hero.element.offset().left + hero.element.width())) {
            let powerType = $(power).attr('powertype');
            powerGet(powerType);
            $(power).remove();

            // sound play
            if (soundEffects) {
              let id = globalCounter;
              $(`<audio id="splPower${id}" controls style="display:none">
                <source src="sounds/gotsplpower.mp3" type="audio/mpeg">
                </audio>`).appendTo('body');
                $(`#splPower${id}`)[0].play();
                $(`#splPower${id}`)[0].addEventListener("ended", function(){
                     $(`#splPower${id}`).remove();
                });
            }
      }
    });  // power move end

    // proction move
    $('#proction').css({left:`${$('#hero').offset().left - (($('#proction').width() - $('#hero').width()) / 2) - $('.gameArea').offset().left}px`,
    top: `${$('#hero').offset().top - (($('#proction').height() - $('#hero').height()) / 2)}px`});

    // special time over checking
    if ( specialPower) {
      if (globalCounter > powerTime) {
        specialPower = false;
        resetHero();
        $('.specialPowerSection').hide();
        // sound play
        if (soundEffects) {
          let id = globalCounter;
          $(`<audio id="splPowerGone${id}" controls style="display:none">
            <source src="sounds/splpowergone.mp3" type="audio/mpeg">
            </audio>`).appendTo('body');
            $(`#splPowerGone${id}`)[0].play();
            $(`#splPowerGone${id}`)[0].addEventListener("ended", function(){
                 $(`#splPowerGone${id}`).remove();
            });
        }
      } else {
        $('.specialPowerSection').show();
        let timeLeft = parseInt((powerTime - globalCounter) / fps) + 1;
        $('.timeLeft').text(timeLeft);
      }
    } // special time over checking end

    if (missionCompleteCall < globalCounter && missionComplete) {

      if (!missionCompleteGo) {
        // play sound
        if (soundEffects){
          $(`<audio id="matal_crash" controls style="display:none">
            <source src="sounds/matal_crash_2.mp3" type="audio/mpeg">
            </audio>`).appendTo('body');
            $(`#matal_crash`)[0].play();
            $(`#matal_crash`)[0].addEventListener("ended", function(){
                 $(`#matal_crash`).remove();
            });
        }
        $('#mission').animate({ top : '44%' }, 200);
        $('#complete').animate({top : '60%' }, 200);
        missionCompleteCall = globalCounter + (parseInt(fps * 2));
        missionCompleteGo = true;
      } else {
        // play sound
        if (soundEffects){
          $(`<audio id="matal_whoosh" controls style="display:none">
            <source src="sounds/whoosh.mp3" type="audio/mpeg">
            </audio>`).appendTo('body');
            $(`#matal_whoosh`)[0].play();
            $(`#matal_whoosh`)[0].addEventListener("ended", function(){
                 $(`#matal_whoosh`).remove();
            });
        }
        $('#mission').animate({ top : '-44%' }, 200);
        $('#complete').animate({top : '160%' }, 200);
        missionComplete = missionCompleteGo = false;
      }


    }

  }, fps);
  // game main loop end
  mainloop.pause();


   let isStageComplete = () => {
     if($('.enemy').length === 0) {
       missionComplete = true;
       missionCompleteCall = globalCounter + (parseInt(fps * 2));
      // sound play
      if (soundEffects) {
        let id = globalCounter;
        $(`<audio id="claps${id}" controls style="display:none">
          <source src="sounds/claps.mp3" type="audio/mpeg">
          </audio>`).appendTo('body');
          $(`#claps${id}`)[0].play();
          $(`#claps${id}`)[0].addEventListener("ended", function(){
               $(`#claps${id}`).remove();
          });
      }

    //    $('#mission').delay(2000).animate({
    //      top : '44%'
    //    }, 200).delay(9000).animate({
    //      top : '-44%'
    //    }, 200);
    //    $('#complete').delay(2000).animate({
    //      top : '60%'
    //    }, 200).delay(9000).animate({
    //      top : '160%'
    //    }, 200);
       gotoNextStage = true;
       nextStageInterval = globalCounter + 200;
     }
   }

  function planetBuilder () {
    const planetWidth = Math.random()*250 + 50;
    const bg = parseInt(Math.random()*15);
    return {
      width : planetWidth,
      height: planetWidth,
      top : (Math.random()*1000 + planetWidth) * -1 ,
      left: Math.random() * ($(".gameArea").width() - (planetWidth/2)) ,
      bg : planetsBg[bg],
    }
  }

  // create planet
  function createPlanet (planetName) {

    let planetInfo =  planetBuilder ();
     const planet = $("<div>", {
      class: "planet",
      id : planetName,
      css: {
        width:+planetInfo.width+"px",
        height:planetInfo.height+"px",
        top: planetInfo.top,
        left:planetInfo.left,
        zIndex : parseInt(planetInfo.width),
        background:"url('images/"+planetInfo.bg+"')",
      },
    })

    $(".gameArea").append(planet);
  }

  createPlanet ('planet1');
  createPlanet ('planet2');

  let randomDirection = (speed) => {
    const side = ['left', 'top'];
    const move = [`+=${speed}px`, `-=${speed}px`];
    const changeDirection = parseInt(Math.random() * 100) + globalCounter;
    const side1 = `${side[parseInt(Math.random() * 2)]}`;
    const side2 = `${side[parseInt(Math.random() * 2)]}`;
    const movement1 = `${move[parseInt(Math.random() * 2)]}`;
    const movement2 = `${move[parseInt(Math.random() * 2)]}`;
    if (side1 === side2) {
      return {
        side1,
        movement1,
        changeDirection,
        crossDirection : false,
      };
    } else {
      return {
        side1,
        movement1,
        side2,
        movement2,
        changeDirection,
        crossDirection : true,
      };
    }

  }



  let hitTestForEnemy = (ele) => {

    if (ele.offset().top + ele.height() >= hero.element.offset().top
        && ele.offset().top <= (hero.element.offset().top + hero.element.height())
        && ele.offset().left + ele.width() >= hero.element.offset().left
        && ele.offset().left < (hero.element.offset().left + hero.element.width()) && !heroProtected) {
          hero.health -= parseInt(ele.attr('bulletPower'));
          if (hero.health < healthStore) {
            // play sound
            if (soundEffects){
              let id = globalCounter;
              $(`<audio id="powerDown${id}" controls style="display:none">
                <source src="sounds/hero/powerDown.mp3" type="audio/mpeg">
                </audio>`).appendTo('body');
                $(`#powerDown${id}`)[0].play();
                $(`#powerDown${id}`)[0].addEventListener("ended", function(){
                     $(`#powerDown${id}`).remove();
                });
            }

            hero.lavel --;
            hero.bulletPower --;
            healthToReach -= 15;
            healthStore -= healthToReach;
          }
          if (hero.health <= 0){
            if (soundEffects) {
              let id = globalCounter;
              $(`<audio id="gameOver" controls style="display:none" onloadeddata="var audioPlayer = this; setTimeout(function() { audioPlayer.play(); }, 900)">
                <source src="sounds/gameover.mp3" type="audio/mpeg">
                </audio>`).appendTo('body');

                $(`#gameOver`)[0].addEventListener("ended", function(){
                     $(`#gameOver`).remove();
                });
            }
            mainloop.pause();
            $('#bgMusic')[0].remove();
            let gameOver = $('<div>', {
            class: 'gameOver', }).appendTo('body')
            $(gameOver).animate({
              width:'100%',
              height:'100%',
            }, 1000);
          }
          refreshHeroHelth(hero.health);
          refreshBulletPower(hero.bulletPower);
          if (soundEffects) {
            let id = globalCounter;
            $(`<audio id="bulletHitToHero${id}" controls style="display:none">
              <source src="sounds/bulletHit.mp3" type="audio/mpeg">
              </audio>`).appendTo('body');
              $(`#bulletHitToHero${id}`)[0].play();
              $(`#bulletHitToHero${id}`)[0].addEventListener("ended", function(){
                   $(`#bulletHitToHero${id}`).remove();
              });
          }

          return true;
    }

  }


  let refreshEnemyHelth = (enemy) => {
    let currentHealth = enemy.attr('health');
    enemy.attr('health', currentHealth - hero.bulletPower);
    let totalHealth = enemyData[enemy.attr('enemyid')].health;
    let per = (enemy.attr('health') * 100 ) / totalHealth;
    enemy.find('.enemyHealthBar span').css('width', per+'%');
    if(enemy.attr('health') <= 0) {
      clearInterval(enemy.attr('intervalId'));
      blust(enemy);
      energy(enemy);
      enemy.remove();
      isStageComplete();
    }
  }

  let blust = (ele) => {
    let x = ele.offset().left + (ele.width() / 2);
    let y = ele.offset().top + (ele.height() / 2);
    $('<img>', { css: {  width : '10px', height: '10px', zIndex: 9999, position:'absolute', top: y, left: x }, src:'images/blust.png', })
    .appendTo('body')
    .animate({width: '100px', height: '100px', top: `${y-50}px`, left: `${x-50}px`}, 200, function() {
      $(this).remove();
    });

    // play sound
    if (soundEffects){
      let id = globalCounter;
      $(`<audio id="enemyDestroy${id}" controls style="display:none">
        <source src="sounds/enemy/enemyDestroy.mp3" type="audio/mpeg">
        </audio>`).appendTo('body');
        $(`#enemyDestroy${id}`)[0].play();
        $(`#enemyDestroy${id}`)[0].addEventListener("ended", function(){
             $(`#enemyDestroy${id}`).remove();
        });
    }

  }

  // power builder
  let powerBuilder = (top, left, powertype) => {
    let x = left;
    let y = top;
    let power = $('<div>', { css: { top: y, left: x},
    class : 'power', powertype,});
    power.appendTo('body');
    $(power).prepend(`<img src="images/${powertype}.png" >`);
  }

  // energy builder

  let energy = (ele) => {
    let x = ele.offset().left + (ele.width() / 2) - 25;
    let y = ele.offset().top + (ele.height() / 2);
    let energy = $('<div>', { css: { top: y, left: x},
    class : 'energy'});
    energy.appendTo('body');
    $(energy).prepend(`<div class="energyVal">${ele.attr('energy')}</div>`);
    $(energy).prepend(`<div class="energyBg"><img src="${enemyData[ele.attr('enemyid')].energyCont}" ></div>`);
  }

  // Creating enemies
  let creatingEnemies = (stage) => {
    if (!gameData[`stage${stage}`]) {
      alert('R koto khelbe? ebaar kaaj koro... :P');
      alert('This is a demo version. You can only play upto 11 stages.');
    }

    for (let i = 0; i < gameData[`stage${stage}`].enemies.length; i++) {
      let powerServe = parseInt(Math.random() * 2);
      if (powerServe) {
        powerServe = true;
      } else {
        powerServe = false;
      }
      let enemy = $('<div>', {
         class: `enemy ${gameData['stage'+stage].enemies[i]}`,
         id : `enemy${i}`,
         css : {
           width : enemyData[gameData[`stage${stage}`].enemies[i]].width,
           left : `${Math.random() * ($('.gameArea').width() - 50)}px`,
           top : `${Math.random() * ($('.gameArea').height() / 3)}px`,
         },
         enemySpeed : enemyData[gameData[`stage${stage}`].enemies[i]].speed,
         fireInterval : parseInt(Math.random() * 50 ) + enemyData[gameData[`stage${stage}`].enemies[i]].fireInterval + globalCounter,
         health: enemyData[gameData[`stage${stage}`].enemies[i]].health,
         energy: enemyData[gameData[`stage${stage}`].enemies[i]].energy,
         enemyid : gameData['stage'+stage].enemies[i],
         direction : '',
         powerServe : powerServe,
       }).appendTo('.gameArea');
       $('<img>', { css: {  width : '100%', }, src: enemyData[gameData[`stage${stage}`].enemies[i]].bg, }).appendTo(enemy);
       $('<div class="enemyHealthBar"><span></span></div>').appendTo(enemy);

      //  (function( e ){
      //    randomMovement ($(this));
      //  }).call(enemy);
    }
  }
  creatingEnemies(stage);

  // hero back to special power to normal life
  let resetHero = () => {
    hero.speed = 10;
    hero.bulletSpeed = 15;
    $('#proction').remove();
    specialPower = false;
    heroProtected = false;
  }

  // bullet pruff protection for hero
  let protectionOn = () => {
    $('<div>', { id : 'proction'}).appendTo('.gameArea');
    heroProtected = true;
  }

  // hero got special powers
  let powerGet = (powerType) => {
    resetHero();
    if (powerType == 'moveSlower') {
      powerTime = globalCounter + 416;
      hero.speed /= 2;
      specialPower = true;
      $('.displayPower').css({'background': `url('./images/${powerType}.png') no-repeat center`});
    }

    if (powerType == 'moveFaster') {
      resetHero();
      powerTime = globalCounter + 416;
      hero.speed *= 2;
      specialPower = true;
      $('.displayPower').css({'background': `url('./images/${powerType}.png') no-repeat center`});
    }

    if (powerType == 'bulletSpeedUp') {
      resetHero();
      powerTime = globalCounter + 416;
      hero.bulletSpeed *= 2;
      specialPower = true;
      $('.displayPower').css({'background': `url('./images/${powerType}.png') no-repeat center`});
    }

    if (powerType == 'bulletSpeedDown') {
      resetHero();
      powerTime = globalCounter + 416;
      hero.bulletSpeed /= 2;
      specialPower = true;
      $('.displayPower').css({'background': `url('./images/${powerType}.png') no-repeat center`});
    }

    if (powerType == 'protectionOn') {
      powerTime = globalCounter + 416;
      resetHero();
      protectionOn();
      specialPower = true;
      $('.displayPower').css({'background': `url('./images/${powerType}.png') no-repeat center`});
    }

    if (powerType == 'protectionOff') {
      specialPower = true;
      powerTime = globalCounter - 1;
    }

  }

})
