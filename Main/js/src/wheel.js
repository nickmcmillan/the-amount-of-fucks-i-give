var app = app || {};

app = (function() {
  'use strict';
  
  var wheel = function() {

    // set up all our vars which are shared across functions

    var containerEl = document.getElementById('container'),

    wedgeColors = [
      '#2980B9', // dark blue
      '#2ecc71', // green
      '#3498db', // blue
      '#34495e', // metal blue
      '#f1c40f', // yellow
      '#e74c3c', // red
      '#16A085', // fern
      //'#95a5a6',  // grey
      '#34495E', // wet ashpalt
      '#C0392B', // pomegranate
      '#e98b39' // orange
    ],

    numOfWedges = 10,
    wheelRadius = 230,
    maxAngularVelocity = 360 * 1.5,
    angularFriction = 0.75,
    angularVelocity = 360,
    lastRotation = 0,
    controlled = false, // set true for no autospin

    target,
    activeWedge,
    stage,
    layer,
    wheel,
    pointer,
    pointerTween,
    startRotation,
    startX,
    startY;

    function addWedge(n) {
      
      var angle = 360 / numOfWedges;

      var wedge = new Kinetic.Group({
        rotation: n * 360 / numOfWedges,
      });

      var wedgeBackground = new Kinetic.Wedge({
        radius: wheelRadius,
        angle: angle,
        fill: wedgeColors[Math.round(Math.random() * (wedgeColors.length - 1))],
        //stroke: '#fff',
        //strokeWidth: 2,
        rotation: (90 + angle/2) * -1
      });

      wedge.add(wedgeBackground);

      var text = new Kinetic.Text({
        text: '0',
        fontFamily: 'Fredoka One',
        fontSize: 30,
        fill: '#fff',
        align: 'center',
        //stroke: '#fff',
        //strokeWidth: 2,
        opacity: 0.95,
        listening: false

      });
      
      text.offsetX(text.width()/2);
      text.offsetY(wheelRadius - 15);
      
      wedge.add(text);
      wheel.add(wedge);

    }

    function animate(frame) {
      // wheel
      var angularVelocityChange = angularVelocity * frame.timeDiff * (1 - angularFriction) / 1000;
      angularVelocity -= angularVelocityChange;

      if(controlled) {
        angularVelocity = ((wheel.getRotation() - lastRotation) * 1000 / frame.timeDiff);
      }
      else {
        wheel.rotate(frame.timeDiff * angularVelocity / 1000);
      }
      lastRotation = wheel.getRotation();
      
      // pointer
      var intersectedWedge = layer.getIntersection({
        x: stage.width()/2, 
        y: 50
      });
      
      if (intersectedWedge && (!activeWedge || activeWedge._id !== intersectedWedge._id)) {
        pointerTween.reset();
        pointerTween.play();
        activeWedge = intersectedWedge; 
        
       //$('#winner').text(activeWedge.parent.children[1].partialText);

      }
    }

    function init() {
      stage = new Kinetic.Stage({
        container: 'container',
        width: wheelRadius * 2,
        height: wheelRadius * 2 + 20 // plus 20 is for the pointer
      });
      layer = new Kinetic.Layer();
      wheel = new Kinetic.Group({
        x: stage.getWidth() / 2 ,
        y: wheelRadius + 20
      });

      for (var n = 0; n < numOfWedges; n++) {
        addWedge(n);
      }
      
      pointer = new Kinetic.Wedge({
        fill: '#dedede',
        //stroke: '#fff',
        //strokeWidth: 0,
        lineJoin: 'round',
        angle: 35,
        radius: 20,
        x: stage.getWidth() / 2,
        y: 22,
        rotation: -105
      });

      // add components to the stage
      layer.add(wheel);
      layer.add(pointer);
      stage.add(layer);
      
      pointerTween = new Kinetic.Tween({
        node: pointer,
        duration: 0.1,
        easing: Kinetic.Easings.EaseInOut,
        y: 30
      });
      
      pointerTween.finish();
      
      var radiusPlus2 = wheelRadius + 2;
      
      /*wheel.cache({
        x: -1* radiusPlus2,
        y: -1* radiusPlus2,
        width: radiusPlus2 * 2,
        height: radiusPlus2 * 2
      }).offset({
        x: radiusPlus2,
        y: radiusPlus2
      });*/
      
      layer.draw();


      // Time to start adding the event listeners
      
      function handleMovement(e) {
        e.preventDefault();

        var touchPosition = stage.getPointerPosition(),
            x1 = touchPosition.x - wheel.x(),
            y1 = touchPosition.y - wheel.y();         
      
        if (controlled && target) {

          var x2 = startX - wheel.x(),
              y2 = startY - wheel.y(),
              angle1 = Math.atan(y1 / x1) * 180 / Math.PI,
              angle2 = Math.atan(y2 / x2) * 180 / Math.PI,
              angleDiff = angle2 - angle1;
          
          if ((x1 < 0 && x2 >=0) || (x2 < 0 && x1 >=0)) {
            angleDiff += 180;
          }

          wheel.setRotation(startRotation - angleDiff);

        }
      };


      wheel.on('mousedown touchstart', function(e) {
        e.preventDefault();
        
        angularVelocity = 0;
        controlled = true;
        target = e.targetNode;
        startRotation = this.rotation();
        
        var touchPosition = stage.getPointerPosition();

        startX = touchPosition.x;
        startY = touchPosition.y;

        // only track the movement if the mouse/finger is down

        document.addEventListener('mousemove', handleMovement );
        document.addEventListener('touchmove', handleMovement );
        
      });
      

      function releaseTheWheel(e) {

        e.preventDefault();
        
        controlled = false;

        if (angularVelocity > maxAngularVelocity) {
          angularVelocity = maxAngularVelocity;

        } else if (angularVelocity < -1 * maxAngularVelocity) {
          angularVelocity = -1 * maxAngularVelocity;
        }

        // REMOVE event listeners once the wheel has been released, otherwise console errors

        document.removeEventListener('mousemove', handleMovement );
        document.removeEventListener('touchmove', handleMovement );

      };

      document.addEventListener('mouseup', releaseTheWheel );
      document.addEventListener('touchend', releaseTheWheel );
      

      var anim = new Kinetic.Animation(animate, layer);
      //document.getElementById('debug').appendChild(layer.hitCanvas._canvas);

      anim.start();
  
    }

    init();
    containerEl.className = 'visible';
    
  }

  return {
    wheel: wheel
  };


})();