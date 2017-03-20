/*
* boxes.cpp
* An exercise in positioning simple boxes using projection/modelview
* matrices and standard transforms.
*
* Adapted for WebGL by Alex Clarke, 2016.
*/


//----------------------------------------------------------------------------
// Variable Setup
//----------------------------------------------------------------------------

// This variable will store the WebGL rendering context
var gl;

//Data Buffers



var cubeVerts = 
[
	[ 0.5, 0.5, 0.5, 1], //0 b t r
	[ 0.5, 0.5,-0.5, 1], //1 f t r
	[ 0.5,-0.5, 0.5, 1], //2 b b r
	[ 0.5,-0.5,-0.5, 1], //3 f b r
	[-0.5, 0.5, 0.5, 1], //4 b t l
	[-0.5, 0.5,-0.5, 1], //5 f t l
	[-0.5,-0.5, 0.5, 1], //6 b b l
	[-0.5,-0.5,-0.5, 1], //7 f b l
];
var elements = [
	0,4,6, //front
	0,6,2,
	1,0,2, //right
	1,2,3, 
	5,1,3, //back
	5,3,7,
	4,5,7, //left
	4,7,6,
	4,0,1, //top
	4,1,5,
	6,7,3, //bottom
	6,3,2,
];
var points = [];
for (var i =0; i < elements.length; i++)
{
	points.push(cubeVerts[elements[i]]);
}

var red = 		 [1.0, 0.0, 0.0, 1.0];
var green = 	 [0.0, 1.0, 0.0, 1.0];
var blue = 		 [0.0, 0.0, 1.0, 1.0];
var lightred =   [1.0, 0.5, 0.5, 1.0];
var lightgreen = [0.5, 1.0, 0.5, 1.0];
var lightblue =  [0.5, 0.5, 1.0, 1.0];
var White = 	 [1.0, 1.0, 1.0, 1.0];

var colors = [
	red, red, red, 
	red, red, red, 
	White, White, White, 
	White, White, White, 
	blue, blue, blue,	
	blue, blue, blue,
	lightgreen, lightgreen, lightgreen, 
	lightgreen, lightgreen, lightgreen, 
	White, White, White, 
	blue, blue, blue,
	lightgreen, lightgreen, lightgreen, 	
	red, red, red,
	
];

//Variables for Transformation Matrices
var mv = new mat4();
var p  = new mat4();
var mvLoc, projLoc;

var program;
var canvas
var axesBuffer;
var elementBuffer;
//----------------------------------------------------------------------------
// Initialization Event Function
//----------------------------------------------------------------------------
window.onload = function init() {
	// Set up a WebGL Rendering Context in an HTML5 Canvas
	canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {
	alert("WebGL isn't available");
	}

	//  Configure WebGL
	//  eg. - set a clear color
	//      - turn on depth testing
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	//  Load shaders and initialize attribute buffers
	//ALEX: program was declared here
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);


	// Load the data into GPU data buffers and
	// Associate shader attributes with corresponding data buffers
	//***Vertices***
	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
	gl.bufferData( gl.ARRAY_BUFFER,  flatten(points), gl.STATIC_DRAW );
	program.vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer( program.vPosition, 4, gl.FLOAT, gl.FALSE, 0, 0 );
	gl.enableVertexAttribArray( program.vPosition );

	//***Colors***
	var colorBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer );
	gl.bufferData( gl.ARRAY_BUFFER,  flatten(colors), gl.STATIC_DRAW );
	program.vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer( program.vColor, 4, gl.FLOAT, gl.FALSE, 0, 0 );
	gl.enableVertexAttribArray( program.vColor );

	//***Elements***
	//Only one elements buffer may be active at once
	//It controls order of access to all array buffers
	//Details are specified at draw time rather than with a pointer call
	
	//---------------
	//DrawElements
	//---------------
	//elementBuffer = gl.createBuffer();
	//gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, elementBuffer );
	//gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(elements), gl.STATIC_DRAW );



	projLoc = gl.getUniformLocation(program, "p");
	mvLoc = gl.getUniformLocation(program, "mv");



	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	
	//p = perspective(45.0, canvas.clientWidth/canvas.clientHeight, 0.1, 1000.0);
	p = ortho(-4,4,-4,4,2,13)
	
	gl.uniformMatrix4fv(projLoc, gl.FALSE, flatten(p));

	document.onkeypress = keypress;//listen keyboard event
	document.onmousemove = mouseMove; //listen mouse coordinator
	
	requestAnimFrame(render);
	
};




var verticalMove = 0;
var horizontalMove = 0;
var mouseX = 0;
var mouseY = 0;




function render() 
{
	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);


/* 	var eye = vec3(horizontalMove, 0 , verticalMove);
	var at =  vec3(horizontalMove+mouseX, mouseY, 0.0);
	var up =  vec3(0.0, 1.0, 0.0); */
	
	var eye = vec3(0, 0 , 10);
	var at =  vec3(0, 0, 0.0);
	var up =  vec3(0.0, 1.0, 0.0);
	
	mv = lookAt(eye,at,up);
	
	
	var bar = mult(mv, translate(mouseX,0,0));
	bar = mult(bar, scale(1,0.3,1));
	gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(bar));	
	gl.drawArrays(gl.TRIANGLES, 0, 36);
	
	
	
	
	
	console.log(mouseX);
	//---------------
	//DrawElements
	//---------------
	//gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(mv));	
	//gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
	//gl.drawElements(gl.TRIANGLE_STRIP, 36, gl.UNSIGNED_SHORT, 0);
	//gl.drawArrays(gl.TRIANGLES, 0, 36);

	requestAnimFrame(render);
}

function keypress(e)
{
	var currKey=0,e=e||event;
	currKey=e.keyCode||e.which||e.charCode;
	
	console.log(e.keyCode);
	
	switch (currKey)
	{
	case 119://key w 
		
		verticalMove -= 0.5;
		break;
	case 115://key s
		
		verticalMove += 0.5;
		break;
	case 97://key a
		horizontalMove -= 0.5;
	
		break;
	case 100://key d
		horizontalMove += 0.5;

		break;
	}
}

function mouseMove(ev) 
{ 
Ev= ev || window.event; 
var mousePos = mouseCoords(ev); 
var myx = mousePos.x; 
var myy = mousePos.y; 

mouseX = Math.round((myx - canvas.clientWidth/2)/100);
mouseY = Math.round(-(myy - canvas.clientHeight/2)/6);
 
} 

function mouseCoords(ev) 
{ 
if(ev.pageX || ev.pageY)
{ 
return {x:ev.pageX, y:ev.pageY}; 
} 
return{ 
x:ev.clientX + document.body.scrollLeft - document.body.clientLeft, 
y:ev.clientY + document.body.scrollTop - document.body.clientTop 
}; 
}

