var Bird = function () {

	var scope = this;

	THREE.Geometry.call( this );


	v(   5,   0,   0 );
	v(   5,   0,   4 );
	v(   -5,   0,   4 );
	v(   -5,   0,   0 );
	v(   -5,   0,   -4 );
	v(   5,   0,   -4 );


	f3( 0, 1, 2 );
	f3( 0, 2, 3 );
	f3( 0, 3, 4 );
	f3( 0, 4, 5 );

	this.computeFaceNormals();

	function v( x, y, z ) {

		scope.vertices.push( new THREE.Vector3( x, y, z ) );

	}

       function f3( a, b, c ) {

		scope.faces.push( new THREE.Face3( a, b, c ) );

	}

}

Bird.prototype = Object.create( THREE.Geometry.prototype );
Bird.prototype.constructor = Bird;
