
// Global variables
var vertices = [];

var graphicsLibrary = document.getElementById('graphicsLibrary').getContext('webgl') || 
                      // Support Internet Explorer, Edge, Safari
                      document.getElementById('graphicsLibrary').getContext('experimental-webgl');

var mouseX = 0 
var mouseY = 0;
var angle = [ 0.0, 0.0, 0.0, 1.0 ];
var angleGL = 0;


document.getElementById('graphicsLibrary').addEventListener(
    'mousemove', function(moveEvent) {
        if (moveEvent.buttons == 1)
        {
            // Left mouse button pressed
            angle[0] -= (mouseY - moveEvent.y) * 0.01;
            angle[1] += (mouseX - moveEvent.x) * 0.01;

            graphicsLibrary.uniform4fv(angleGL, new Float32Array(angle));
            Render();
        }
        mouseX = moveEvent.x;
        mouseY = moveEvent.y;
});

function InitWebGL()
{
    if (!graphicsLibrary)
    {
        alert('WebGL is not supported');
        return;
    }

    let canvas = document.getElementById('graphicsLibrary');
    if (canvas.width != canvas.clientWidth || canvas.height != canvas.clientHeight)
    {
        // Make canvas fit client(Windows OS) canvas
        // Client canvas exist on graphics card and can not be changed
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }
    InitViewport();
}

function InitViewport()
{
    // Initialize WebGL viewport
    graphicsLibrary.viewport(0, // X
                             0, // Y
                             graphicsLibrary.canvas.width, // Width
                             graphicsLibrary.canvas.height); // Height

    // Initialize pixel buffer properties
    graphicsLibrary.clearColor(0.0, 0.4, 0.6, 1.0);
    graphicsLibrary.enable(graphicsLibrary.DEPTH_TEST);
    graphicsLibrary.enable(graphicsLibrary.CULL_FACE);
    graphicsLibrary.cullFace(graphicsLibrary.BACK);
    InitShaders();
}

function InitShaders()
{
    // Compile vertex & fragment shaders
    const vertex = InitVertexShader();
    const fragment = InitFragmentShader();
    // Link two shaders in a shader program
    let program = InitShaderProgram(vertex, fragment);

    if (!ValidateShaderProgram(program))
    {
        return false;
    }

    // Create GPU buffers for geometry
    return CreateGeometryBuffers(program);
}

function InitVertexShader()
{
    let vertexElement = document.getElementById('vertexShader');
    let vertexShader = graphicsLibrary.createShader(graphicsLibrary.VERTEX_SHADER);
    graphicsLibrary.shaderSource(vertexShader, vertexElement.value);
    graphicsLibrary.compileShader(vertexShader);

    // Check if shader was compiled successfully
    if (!graphicsLibrary.getShaderParameter(vertexShader, graphicsLibrary.COMPILE_STATUS))
    {
        // Write error to console
        let error = graphicsLibrary.getShaderInfoLog(vertexShader);
        console.error('Failed init vertex shader: ', error);
        return;
    }

    return vertexShader;
}

function InitFragmentShader()
{
    let fragmentElement = document.getElementById('fragmentShader');
    let fragmentShader = graphicsLibrary.createShader(graphicsLibrary.FRAGMENT_SHADER);
    graphicsLibrary.shaderSource(fragmentShader, fragmentElement.value);
    graphicsLibrary.compileShader(fragmentShader);

    // Check if shader was compiled successfully
    if (!graphicsLibrary.getShaderParameter(fragmentShader, graphicsLibrary.COMPILE_STATUS))
    {
        // Write error to console
        let error = graphicsLibrary.getShaderInfoLog(fragmentShader);
        console.error('Failed init fragmentshader:', error);
        return;
    }

    return fragmentShader;
}

function InitShaderProgram(vertexShader, fragmentShader)
{
    let shaderProgram = graphicsLibrary.createProgram();
    graphicsLibrary.attachShader(shaderProgram, vertexShader);
    graphicsLibrary.attachShader(shaderProgram, fragmentShader);
    graphicsLibrary.linkProgram(shaderProgram);

    // Check if shaders were linked successfully
    if (!graphicsLibrary.getProgramParameter(shaderProgram, graphicsLibrary.LINK_STATUS))
    {
        // Write error to console
        console.error(graphicsLibrary.getProgramInfoLog(shaderProgram));
        alert('Failed linking program');
        return;
    }

    return shaderProgram;
}

function ValidateShaderProgram(shaderProgram)
{
    graphicsLibrary.validateProgram(shaderProgram);

    // Check if validation was successful
    if (!graphicsLibrary.getProgramParameter(shaderProgram, graphicsLibrary.VALIDATE_STATUS))
    {
        // Write error to console
        console.error(graphicsLibrary.getProgramInfoLog(shaderProgram));
        alert('Errors found validating shader program');
        return false;
    }

    return true;
}

function AddVertex(x, y, z, r, g, b)
{
    const index = vertices.length;
    vertices.length += 6;
    vertices[index + 0] = x;
    vertices[index + 1] = y;
    vertices[index + 2] = z;
    vertices[index + 3] = r;
    vertices[index + 4] = g;
    vertices[index + 5] = b;
}

function AddTriangle(x1, y1, z1, r1, g1, b1,
                     x2, y2, z2, r2, g2, b2,
                     x3, y3, z3, r3, g3, b3)
{
    AddVertex(x1, y1, z1, r1, g1, b1);
    AddVertex(x2, y2, z2, r2, g2, b2);
    AddVertex(x3, y3, z3, r3, g3, b3);
}

function AddQuad(x1, y1, z1, r1, g1, b1,
                 x2, y2, z2, r2, g2, b2,
                 x3, y3, z3, r3, g3, b3,
                 x4, y4, z4, r4, g4, b4)
{
    AddTriangle(x1, y1, z1, r1, g1, b1,
                x2, y2, z2, r2, g2, b2,
                x3, y3, z3, r3, g3, b3);

    AddTriangle(x3, y3, z3, r3, g3, b3,
                x4, y4, z4, r4, g4, b4,
                x1, y1, z1, r1, g1, b1);
}

function AddDynamicTriangle(width, height)
{
    const w = width * 0.5;
    const h = height * 0.5;
    AddTriangle(0.0, h, 0.0, 1.0, 0.0, 0.0,
                -w, -h, 0.0, 0.0, 1.0, 0.0,
                 w, -h, 0.0, 0.0, 0.0, 1.0);
}

function AddDynamicQuad(width, height)
{
    const w = width * 0.5;
    const h = height * 0.5;
    AddQuad(-w, h, 0.0, 1.0, 0.0, 0.0,
            -w,-h, 0.0, 0.0, 1.0, 0.0,
             w,-h, 0.0, 0.0, 0.0, 1.0,
             w, h, 0.0, 1.0, 1.0, 0.0);
}

function AddDynamicQuadBox(width, height, depth) 
{
    const w = width * 0.5;
    const h = height * 0.5;
    const d = depth * 0.5;

    // Front
    AddQuad(-w, h, d, 1.0, 0.0, 0.0,
            -w,-h, d, 1.0, 0.0, 0.0,
             w,-h, d, 1.0, 0.0, 0.0,
             w, h, d, 1.0, 0.0, 0.0);

    // Back
    AddQuad( w, h, -d, 0.0, 1.0, 0.0,
             w,-h, -d, 0.0, 1.0, 0.0,
            -w,-h, -d, 0.0, 1.0, 0.0,
            -w, h, -d, 0.0, 1.0, 0.0);

    // Top
    AddQuad(-w, h,-d, 0.0, 0.0, 1.0,
            -w, h, d, 0.0, 0.0, 1.0,
             w, h, d, 0.0, 0.0, 1.0,
             w, h,-d, 0.0, 0.0, 1.0);

    // Bottom
    AddQuad(-w,-h, d, 0.0, 1.0, 1.0,
            -w,-h,-d, 0.0, 1.0, 1.0,
             w,-h,-d, 0.0, 1.0, 1.0,
             w,-h, d, 0.0, 1.0, 1.0);

    // Left
    AddQuad(-w, h, d, 1.0, 0.5, 0.0,
            -w, h,-d, 1.0, 0.5, 0.0,
            -w,-h,-d, 1.0, 0.5, 0.0,
            -w,-h, d, 1.0, 0.5, 0.0);
    
    // Right
    AddQuad( w, h,-d, 0.5, 0.0, 0.5,
             w, h, d, 0.5, 0.0, 0.5,
             w,-h, d, 0.5, 0.0, 0.5,
             w,-h,-d, 0.5, 0.0, 0.5);
}

function ClearVertices()
{
    vertices.length = 0;
}

function CreateGeometryUI() {
    const widthElement = document.getElementById('width');
    const width = widthElement ? widthElement.value : 1.0;
    const heightElement = document.getElementById('height');
    const height = heightElement ? heightElement.value : 1.0;
    const depthElement = document.getElementById('depth');
    const depth = depthElement ? depthElement.value : 1.0;

    document.getElementById('ui').innerHTML =
    'Width: <input type="number" id="width" value="'+ width +'"onchange= "InitShaders();"><br>' +
    'Height: <input type="number" id="height" value="'+ height +'"onchange= "InitShaders();"><br>' +
    'Depth: <input type="number" id="depth" value="'+ depth +'"onchange= "InitShaders();">';

    let selecter = document.getElementById('shape');
    switch (selecter.selectedIndex) {
        case 0: AddDynamicTriangle(width, height); break;
        case 1: AddDynamicQuad(width, height); break;
        case 2: AddDynamicQuadBox(width, height, depth); break;
    }
}

function CreateGeometryBuffers(shaderProgram)
{
    // Triangle  X    Y    Z    R    G    B
    /*AddQuad(-0.5, 0.5, 0.0, 1.0, 0.0, 0.0,
            -0.5,-0.5, 0.0, 0.0, 1.0, 0.0,
             0.5,-0.5, 0.0, 0.0, 0.0, 1.0,
             0.5, 0.5, 0.0, 1.0, 1.0, 0.0);*/
    ClearVertices();

    CreateGeometryUI();

    // Create GPU buffer (VBO)
    CreateVBO(shaderProgram, new Float32Array(vertices));

    // Get shader uniform: Angle
    angleGL = graphicsLibrary.getUniformLocation(shaderProgram, 'Angle');

    // Activate shader program
    graphicsLibrary.useProgram(shaderProgram);

    // Display geometri on screen
    Render();
}

function CreateVBO(ShaderProgram, vertices)
{
    let virtualBufferObject = graphicsLibrary.createBuffer();
    graphicsLibrary.bindBuffer(graphicsLibrary.ARRAY_BUFFER, virtualBufferObject);
    graphicsLibrary.bufferData(graphicsLibrary.ARRAY_BUFFER, vertices, graphicsLibrary.STATIC_DRAW);
    const vertexPoints = 6 * Float32Array.BYTES_PER_ELEMENT;

    // Create shader attribute: Pos
    let position = graphicsLibrary.getAttribLocation(ShaderProgram, 'Pos');
    graphicsLibrary.vertexAttribPointer(position, 3, graphicsLibrary.FLOAT, graphicsLibrary.FALSE, vertexPoints, 0);
    graphicsLibrary.enableVertexAttribArray(position);

    // Create shader attribute: Color
    const offset = 3 * Float32Array.BYTES_PER_ELEMENT;
    let color = graphicsLibrary.getAttribLocation(ShaderProgram, 'Color');
    graphicsLibrary.vertexAttribPointer(color, 3, graphicsLibrary.FLOAT, graphicsLibrary.FALSE, vertexPoints, offset);
    graphicsLibrary.enableVertexAttribArray(color);
}

function Render()
{
    graphicsLibrary.clearColor(0.0, 0.4, 0.6, 1.0);
    graphicsLibrary.clear(graphicsLibrary.COLOR_BUFFER_BIT | graphicsLibrary.DEPTH_BUFFER_BIT);
    graphicsLibrary.drawArrays(graphicsLibrary.TRIANGLES, 0, vertices.length / 6);
}