// Based on http://www.openprocessing.org/visuals/?visualID=6910



var Boid = function() {

var vector = new THREE.Vector3(),
    _acceleration, _width = 500, _height = 500, _depth = 200, _goal, _neighborhoodRadius = 200,
    _maxSpeed = 4, _maxSteerForce = 0.1, _avoidWalls = false;

    var _bof_cutoff = 100;
    
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    _acceleration = new THREE.Vector3();
    
    this.setGoal = function ( target ) {
        
	_goal = target;
        
    };
    
    this.setAvoidWalls = function ( value ) {
        
	_avoidWalls = value;
        
    };
    
    this.setWorldSize = function ( width, height, depth ) {
        
	_width = width;
	_height = height;
	_depth = depth;
        
    };
    
    this.run = function ( boids ) {
        
	if ( _avoidWalls ) {
            
	    vector.set( - _width, this.position.y, this.position.z );
	    vector = this.avoid( vector );
	    vector.multiplyScalar( 5 );
	    _acceleration.add( vector );
            
	    vector.set( _width, this.position.y, this.position.z );
	    vector = this.avoid( vector );
	    vector.multiplyScalar( 5 );
	    _acceleration.add( vector );
            
	    vector.set( this.position.x, - _height, this.position.z );
	    vector = this.avoid( vector );
	    vector.multiplyScalar( 5 );
	    _acceleration.add( vector );
            
	    vector.set( this.position.x, _height, this.position.z );
	    vector = this.avoid( vector );
	    vector.multiplyScalar( 5 );
	    _acceleration.add( vector );
            
	    vector.set( this.position.x, this.position.y, - _depth );
	    vector = this.avoid( vector );
	    vector.multiplyScalar( 5 );
	    _acceleration.add( vector );
            
	    vector.set( this.position.x, this.position.y, _depth );
	    vector = this.avoid( vector );
	    vector.multiplyScalar( 5 );
	    _acceleration.add( vector );
            
	}/* else {
            
	    this.checkBounds();
            
	    }
	 */
        
	if ( Math.random() > 0.5 ) {
            
	    this.flock( boids );
            
	}
        
	this.move();
        
    };
    
    this.flock = function ( boids ) {
        
	if ( _goal ) {
            
	    _acceleration.add( this.reach( _goal, 0.005 ) );
            
	}
        
	_acceleration.add( this.alignment( boids ) );
	_acceleration.add( this.cohesion( boids ) );
	_acceleration.add( this.separation( boids ) );
        
    };
    
    this.move = function () {
        
	this.velocity.add( _acceleration );
        
	var l = this.velocity.length();
        
	if ( l > _maxSpeed ) {
            
	    this.velocity.divideScalar( l / _maxSpeed );
            
	}
        
	this.position.add( this.velocity );
	_acceleration.set( 0, 0, 0 );
        
    };
    
    this.checkBounds = function () {
        
	if ( this.position.x >   _width ) this.position.x = - _width;
	if ( this.position.x < - _width ) this.position.x =   _width;
	if ( this.position.y >   _height ) this.position.y = - _height;
	if ( this.position.y < - _height ) this.position.y =  _height;
	if ( this.position.z >  _depth ) this.position.z = - _depth;
	if ( this.position.z < - _depth ) this.position.z =  _depth;
        
    };
    
    //
    
    this.avoid = function ( target ) {
        
	var steer = new THREE.Vector3();
        
	steer.copy( this.position );
	steer.sub( target );
        
	steer.multiplyScalar( 1 / this.position.distanceToSquared( target ) );
        
	return steer;
        
    };
    
    this.repulse = function ( target ) {
        
	var distance = this.position.distanceTo( target );
        
	if ( distance < 150 ) {
            
	    var steer = new THREE.Vector3();
            
	    steer.subVectors( this.position, target );
	    steer.multiplyScalar( 0.5 / distance );
            
	    _acceleration.add( steer );
            
	}
        
    };
    
    this.reach = function ( target, amount ) {
        
	var steer = new THREE.Vector3();
        
	steer.subVectors( target, this.position );
	steer.multiplyScalar( amount );
        
	return steer;
        
    };
    
    this.alignment = function ( boids ) {
        
	var boid, velSum = new THREE.Vector3(),
	    count = 0;
        
	for ( var i = 0, il = boids.length; i < il; i++ ) {
            
	    if ( Math.random() > 0.6 ) continue;
            
	    boid = boids[ i ];
            
	    distance = boid.position.distanceTo( this.position );
            likeness = Math.abs(this.kind - boid.kind); 
	    if ( distance > 0 && distance <= _neighborhoodRadius && likeness < _bof_cutoff ) {
                
		velSum.add( boid.velocity );
		count++;
                
	    }
            
	}
        
	if ( count > 0 ) {
            
	    velSum.divideScalar( count );
            
	    var l = velSum.length();
            
	    if ( l > _maxSteerForce ) {
                
		velSum.divideScalar( l / _maxSteerForce );
                
	    }
            
	}
        
	return velSum;
        
    };
    
    this.cohesion = function ( boids ) {
        
	var boid, distance,
	    posSum = new THREE.Vector3(),
	    steer = new THREE.Vector3(),
	    count = 0;
        
	for ( var i = 0, il = boids.length; i < il; i ++ ) {
            
	    if ( Math.random() > 0.6 ) continue;
            
	    boid = boids[ i ];
	    distance = boid.position.distanceTo( this.position );
            likeness = Math.abs(boid.kind - this.kind);
	    if ( distance > 0 && distance <= _neighborhoodRadius  && likeness < _bof_cutoff ) {
                
		posSum.add( boid.position );
		count++;
                
	    }
            
	}
        
	if ( count > 0 ) {
            
	    posSum.divideScalar( count );
            
	}
        
	steer.subVectors( posSum, this.position );
        
	var l = steer.length();
        
	if ( l > _maxSteerForce ) {
            
	    steer.divideScalar( l / _maxSteerForce );
            
	}
        
	return steer;
        
    };
    
    this.separation = function ( boids ) {
        
	var boid, distance,
	    posSum = new THREE.Vector3(),
	    repulse = new THREE.Vector3();
        
	for ( var i = 0, il = boids.length; i < il; i ++ ) {
            
	    if ( Math.random() > 0.6 ) continue;
            
	    boid = boids[ i ];
	    distance = boid.position.distanceTo( this.position );
            
	    if ( distance > 0 && distance <= _neighborhoodRadius ) {
                
		repulse.subVectors( this.position, boid.position );
		repulse.normalize();
		repulse.divideScalar( distance );
		posSum.add( repulse );
                
	    }
            
	}
        
	return posSum;
        
    }
    
}

    
var SCREEN_WIDTH = 720,
    SCREEN_HEIGHT = 540,
    SCREEN_WIDTH_HALF = SCREEN_WIDTH  / 2,
    SCREEN_HEIGHT_HALF = SCREEN_HEIGHT / 2;

var camera, scene, renderer, birds, bird;

var boid, boids;
var flock;



function init() {
    
    camera = new THREE.PerspectiveCamera( 75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000 );
    camera.position.z = 450;
    
    scene = new THREE.Scene();

    flock = {
        birds: [],
        boids: []
    };
    
    for ( var i = 0; i < BOOKS.length; i ++ ) {
        add_bird(flock, scene, BOOKS[i].dd);        
    }
    
    renderer = new THREE.CanvasRenderer();
    renderer.setClearColor( 0xffffff );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.body.appendChild( renderer.domElement );
}


function add_bird(flock, scene, dd) {
    var r = 10;
    boid = new Boid();
    boid.position.x = Math.random() * 10 - 200;
    boid.position.y = Math.random() * 10 - 200;
    boid.position.z = Math.random() * 10 - 200;
    boid.velocity.x = Math.random() * 2 - 1;
    boid.velocity.y = Math.random() * 2 - 1;
    boid.velocity.z = Math.random() * 2 - 1;
    boid.kind = dd;
    boid.setAvoidWalls( true );
    boid.setWorldSize( 500, 500, 400 );

    flock.boids.push(boid);
    
    var c = new THREE.Color("#ff0000");
    c.setHSL(boid.kind * 0.001, 0.8, 0.5);
    bird = new THREE.Mesh(
        new Bird(),
        new THREE.MeshBasicMaterial( { color: c, side: THREE.DoubleSide } )
    );
    bird.phase = Math.floor( Math.random() * 62.83 );

    flock.birds.push(bird);
    scene.add( bird );
}




function onDocumentMouseMove( event ) {
    
    var vector = new THREE.Vector3( event.clientX - SCREEN_WIDTH_HALF, - event.clientY + SCREEN_HEIGHT_HALF, 0 );
    
    for ( var i = 0, il = flock.boids.length; i < il; i++ ) {
        
	boid = flock.boids[ i ];
        
	vector.z = boid.position.z;
        
	boid.repulse( vector );
        
    }
    
}

//

function animate() {
    
    requestAnimationFrame( animate );
    
    render();
    
}

function render() {
    
    for ( var i = 0, il = flock.birds.length; i < il; i++ ) {
        
	boid = flock.boids[ i ];
	boid.run( flock.boids );
        
	bird = flock.birds[ i ];
	bird.position.copy( boid.position );
        
//	color = bird.material.color;
//        fog = ( 500 - bird.position.z ) / 1000;
//	color.r = color.g = color.b = 
        
	bird.rotation.y = Math.atan2( - boid.velocity.z, boid.velocity.x );
	bird.rotation.z = Math.asin( boid.velocity.y / boid.velocity.length() );
        
	bird.phase = ( bird.phase + ( Math.max( 0, bird.rotation.z ) + 0.1 )  ) % 62.83;
        var yy = Math.sin( bird.phase ) * 5;
//        var xx = Math.cos( bird.phase ) * 5;
	bird.geometry.vertices[ 1 ].y = bird.geometry.vertices[ 2 ].y = yy;
	bird.geometry.vertices[ 4 ].y = bird.geometry.vertices[ 5 ].y = yy;
//	bird.geometry.vertices[ 1 ].x = bird.geometry.vertices[ 2 ].x = xx;
//	bird.geometry.vertices[ 4 ].x = bird.geometry.vertices[ 5 ].x = -xx;
        
    }
    
    renderer.render( scene, camera );
    
}

// live search callbacks

function reset_flock() {
    for ( i = 0, il = flock.birds.length; i < il; i++ ) {
        scene.remove(flock.birds[i]);
    }
    flock = {
        birds: [],
        boids: []
    };
}

function add_to_flock(dd) {
    add_bird(flock, scene, dd);
}
    




