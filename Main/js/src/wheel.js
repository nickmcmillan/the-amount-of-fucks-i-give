var app = app || {};


app.pubMaps = (function() {
  'use strict';

  var wheel = function() {

    // lots of shit to clean up here.


    var foodPlaces = ['pub', 'strippers', 'dogs', 'birmy', 'meatballs', 'katsu', 'bag of dicks', 'megashnitzel', 'alexs mums house'];
    var foodPlacesIncrement = 0;

    var wedgeColors = ['#334d5c', '#45b29d', '#efc94c', '#e27a3f', '#df5a49', '#334d5c', '#45b29d', '#efc94c', '#e27a3f', '#df5a49'];
    var wedgeColorsIncrement = 0;


    var NUM_WEDGES = foodPlaces.length;
    var WHEEL_RADIUS = 250;
    
    var MAX_ANGULAR_VELOCITY = 360 * 1.5;
    var ANGULAR_FRICTION = 0.75;

    // globals
    var angularVelocity = 360;
    var lastRotation = 0;
    var controlled = true;
    var target, 
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
      
      var wedgeTitle = foodPlaces[foodPlacesIncrement];
      foodPlacesIncrement++;
      
      var angle = 360 / NUM_WEDGES;

      

      var wedge = new Kinetic.Group({
        rotation: n * 360 / NUM_WEDGES,
      });
      

      var wedgeBackground = new Kinetic.Wedge({
        radius: WHEEL_RADIUS,
        angle: angle,
        fill: wedgeColors[wedgeColorsIncrement],
        stroke: '#fff',
        strokeWidth: 2,
        rotation: (90 + angle/2) * -1
      });

      wedgeColorsIncrement++;

      wedge.add(wedgeBackground);

      var text = new Kinetic.Text({
        text: wedgeTitle,
        //fontFamily: 'Calibri',
        fontSize: 20,
        fill: '#fff',
        //align: 'center',
        //stroke: 'yellow',
        //strokeWidth: 1,
        listening: false

      });
      
      text.offsetX(text.width()/2);
      text.offsetY(WHEEL_RADIUS - 15);
      
      wedge.add(text);
      wheel.add(wedge);

    }

    var activeWedge;

    function animate(frame) {
      // wheel
      var angularVelocityChange = angularVelocity * frame.timeDiff * (1 - ANGULAR_FRICTION) / 1000;
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
        
       $('#winner').text(activeWedge.parent.children[1].partialText);

      }

    }

    function init() {
      stage = new Kinetic.Stage({
        container: 'container',
        width: WHEEL_RADIUS * 2.5,
        height: WHEEL_RADIUS * 2.5
      });
      layer = new Kinetic.Layer();
      wheel = new Kinetic.Group({
        x: stage.getWidth() / 2,
        y: WHEEL_RADIUS + 20
      });

      for(var n = 0; n < NUM_WEDGES; n++) {
        addWedge(n);
      }
      
      pointer = new Kinetic.Wedge({
        stroke: '#777',
        fill: '#efefef',
        strokeWidth: 1,
        //lineJoin: 'round',
        angle: 30,
        radius: 30,
        x: stage.getWidth() / 2,
        y: 20,
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
      
      var radiusPlus2 = WHEEL_RADIUS + 2;
      
      wheel.cache({
        x: -1* radiusPlus2,
        y: -1* radiusPlus2,
        width: radiusPlus2 * 2,
        height: radiusPlus2 * 2
      }).offset({
        x: radiusPlus2,
        y: radiusPlus2
      });
      
      layer.draw();

      // bind events
      wheel.on('mousedown touchstart', function(e) {
        e.preventDefault();
        
        angularVelocity = 0;
        controlled = true;
        target = e.targetNode;
        startRotation = this.rotation();


        if (e.type === 'touchstart') {

          startX = e.targetTouches[0].pageX;
          startY = e.targetTouches[0].pageY;

        } else {

          startX = e.pageX;
          startY = e.pageY;

        }
        
      });
      
      
      // add listeners to container
      $(document).on('mouseup touchend', function(e) {
        
        e.preventDefault();
        
        controlled = false;

        if (angularVelocity > MAX_ANGULAR_VELOCITY) {
          angularVelocity = MAX_ANGULAR_VELOCITY;

        } else if (angularVelocity < -1 * MAX_ANGULAR_VELOCITY) {
          angularVelocity = -1 * MAX_ANGULAR_VELOCITY;
        }

        //angularVelocities = [];

      });




      $(document).on('mousemove touchmove', function(e) {
        e.preventDefault();

        
        if (e.type === 'touchmove') {
          
          var x1 = e.originalEvent.changedTouches[0].pageX - wheel.x();
          var y1 = e.originalEvent.changedTouches[0].pageY - wheel.y();

        } else {
          var x1 = e.pageX - wheel.x();
          var y1 = e.pageY - wheel.y();
            
        }


        if (controlled && target) {
          var x2 = startX - wheel.x();
          var y2 = startY - wheel.y();
          var angle1 = Math.atan(y1 / x1) * 180 / Math.PI;
          var angle2 = Math.atan(y2 / x2) * 180 / Math.PI;
          var angleDiff = angle2 - angle1;
          
          if ((x1 < 0 && x2 >=0) || (x2 < 0 && x1 >=0)) {
            angleDiff += 180;
          }

          wheel.setRotation(startRotation - angleDiff);
        }
      });

      var anim = new Kinetic.Animation(animate, layer);
      //document.getElementById('debug').appendChild(layer.hitCanvas._canvas);

      anim.start();

    }

    init();

  }


  return {
    wheel: wheel
  };


})();