var canvas;
var gl;

var direction = 0;
var points = [];
var colors = [];

var theta = [ 100, 100, 0 ];

var thetaLoc;

var flag = true;

var lightPosition = vec4(-1.0, 0, 0.0, 1.0 );
var lightAmbient = vec4(1.0, 1.0, 1.0, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialAmbient = vec4( 0.0, 0.5, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 1.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 1.0, 1.0 );
var materialShininess = 100.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var left = -1.0;
var right = 1.0;
var top = 1.0;
var bottom = -1.0
var near = -100;
var far = 100;
var ambientProduct;
var diffuseProduct;
var specularProduct;

var a_Position;
var a_Color;
var u_MvpMatrix;
var u_MvpMatrixFromLight;
var v_PositionFromLight;
var v_Color;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
	
	makeShape( 4, 5, 6, 7 );
	makeShape( 8, 5, 4, 8 );
	makeShape( 5, 6, 8, 5 );	
	makeShape( 7, 4, 8, 7 );
	makeShape( 6, 7, 8, 6 );
	makeShape( 0, 1, 2, 3 );
	makeShape( 8, 1, 0, 8 );
	makeShape( 1, 2, 8, 1 );
	makeShape( 2, 3, 8, 2 );
	makeShape( 3, 0, 8, 3 );
	
	makeShape( 9, 10, 11, 12 );
	
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	//Shadow Mapping Attepmt:
	// a_Position = gl.getAttribLocation(program,'a_Position');
	// a_Color = gl.getAttribLocation(program,'a_Color');
	// u_MvpMatrix = gl.getUniformLocation(program, 'u_MvpMatrix');
	// u_MvpMatrixFromLight = gl.getUniformLocation(program, 'u_MvpMatrixFromLight');
	// u_ShadowMap = gl.getUniformLocation(program, 'u_ShadowMap');
	// var fbo = initFramebufferObject(gl);
	// gl.activeTexture(gl.TEXTURE0);
	// gl.bindTexture(gl.TEXTURE_2D, fbo.texture);
	// var viewProjMatrixFromLight = new Matrix4();
	// viewProjMatrixFromLight.setPerspective(70.0, 1.0, 1.0, 100.0);
	// viewProjMatrixFromLight.lookAt(LIGHT_X, LIGHT_Y, LIGHT_Z, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
	// var g_mvpMatrix = new Matrix4();
	// g_mvpMatrix.set(viewProjMatrixFromLight);
	// g_mvpMatrix.multiply(u_MvpMatrix);
	// gl.uniformMatrix4fv(program.u_MvpMatrix, false, g_mvpMatrix.elements);
	
	//
	
	ambientProduct = mult(lightAmbient, materialAmbient);
	diffuseProduct = mult(lightDiffuse, materialDiffuse);
	specularProduct = mult(lightSpecular, materialSpecular);
	gl.uniform4fv(gl.getUniformLocation(program,"ambientProduct"), flatten(ambientProduct));
	gl.uniform4fv(gl.getUniformLocation(program,"diffuseProduct"), flatten(diffuseProduct) );
	gl.uniform4fv(gl.getUniformLocation(program,"specularProduct"), flatten(specularProduct) );
	gl.uniform4fv(gl.getUniformLocation(program,"lightPosition"), flatten(lightPosition) );
	gl.uniform1f(gl.getUniformLocation(program,"shininess"),materialShininess);
	
	var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
	
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
	
	// Load the data into the GPU
	
	var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );	
	
	thetaLoc = gl.getUniformLocation(program, "theta");
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    projectionMatrix = ortho(left, right, bottom, top, near, far);
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
	
    // Event Listener
	// document.addEventListener("keydown",function () {
		// if (event.keyCode == 37){ // Left - counterclockwise around Y axis
		// direction = 1;
		// }
		// else if (event.keyCode == 40){ // Down - clockwise around X axis
		// direction = 2;
		// }
		// else if (event.keyCode == 39){  // Right - clockwise around Y axis
		// direction = 3;
		// }
		// else if (event.keyCode == 38){ // Up - counterclockwise around X axis
		// direction = 4;
		// }
		// else {}
    // });
    
    render();
};

function makeShape(a,b,c,d){
    var vertices = [
        vec4( -0.25, -0.25,  0.5, 1.0 ),
        vec4( -0.25,  0.25,  0.5, 1.0 ),
        vec4(  0.25,  0.25,  0.5, 1.0 ),
        vec4(  0.25, -0.25,  0.5, 1.0 ),
        vec4( -0.25, -0.25, -0.25, 1.0 ),
        vec4( -0.25,  0.25, -0.25, 1.0 ),
        vec4(  0.25,  0.25, -0.25, 1.0 ),
        vec4(  0.25, -0.25, -0.25, 1.0 ),
		vec4(  0.0,  0.0,  0.25, 1.0),
		
		vec4(  -4.0,  1.0,  3.5, 1.0),
		vec4(  1.0,  0.25,  3.5, 1.0),
		vec4(  1.0,  1.0,  -3.5, 1.0),
		vec4(  -4.0,  1.0,  -3.5, 1.0)
    ];
	var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],
        [ 1.0, 0.0, 0.0, 1.0 ],
        [ 1.0, 1.0, 0.0, 1.0 ],
        [ 0.0, 1.0, 0.0, 1.0 ],
        [ 0.0, 0.0, 1.0, 1.0 ],
        [ 1.0, 0.0, 1.0, 1.0 ],
        [ 0.0, 1.0, 1.0, 1.0 ],
        [ 1.0, 1.0, 0.0, 1.0 ],
		[ 1.0, 0.5, 0.0, 1.0 ],
		[ 0.85, 0.85, 0.85, 1.0 ],
		[ 1.0, 0.5, 1.0, 1.0 ],
		[ 0.0, 0.5, 0.0, 1.0 ],
		[ 0.0, 0.5, 0.0, 1.0 ],
    ];

	var indices = [ a, b, c, a, c, d ];
	for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );        
		colors.push(vertexColors[a]);
	}
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	if (direction == 1){
	theta[1] += 2;
	}
	else if (direction == 2){
	theta[0] += 2;
	}
	else if (direction == 3){
	theta[1] -= 2;
	}
	else if (direction == 4){
	theta[0] -= 2;
	}
	else {}
	
	modelViewMatrix = mat4();
	modelView = mult(modelViewMatrix, rotate(theta[0], [1, 0, 0] ));
    modelView = mult(modelViewMatrix, rotate(theta[1], [0, 1, 0] ));
    modelView = mult(modelViewMatrix, rotate(theta[2], [0, 0, 1] ));
	gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
	gl.uniform3fv(thetaLoc, theta);
	gl.drawArrays( gl.TRIANGLES, 0, 66 );
	requestAnimFrame( render );
}
