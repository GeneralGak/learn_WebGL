
// Global variable
var graphicsLibrary = document.getElementById('graphicsLibrary').getContext('webgl') || 
                      // Support Internet Explorer, Edge, Safari
                      document.getElementById('graphicsLibrary').getContext('experimental-webgl');

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

function CreateGeometryBuffers(shaderProgram)
{
        // Triangle    X    Y    Z    R    G    B
    const vertices = [0.0, 0.5, 0.0, 1.0, 0.0, 0.0,
                     -0.5,-0.5, 0.0, 0.0, 1.0, 0.0,
                      0.5,-0.5, 0.0, 0.0, 0.0, 1.0];

    // Create GPU buffer (VBO)
    CreateVBO(shaderProgram, new Float32Array(vertices));

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
    graphicsLibrary.drawArrays(graphicsLibrary.TRIANGLES, 0, 3);
}