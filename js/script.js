
// Global variables
var vertices = [];

var graphicsLibrary = document.getElementById('graphicsLibrary').getContext('webgl') || 
                      // Support Internet Explorer, Edge, Safari
                      document.getElementById('graphicsLibrary').getContext('experimental-webgl');

var mouseX = 0 
var mouseY = 0;
var angle = [ 0.0, 0.0, 0.0, 1.0 ];
var angleUniformLocation = 0;

var textureUniformLocation = 0;
var display = [ 0.0, 0.0, 0.0, 0.0 ];
var displayUniformLocation = 0;



document.getElementById('graphicsLibrary').addEventListener(
    'mousemove', function(moveEvent) {
        if (moveEvent.buttons == 1)
        {
            // Left mouse button pressed
            angle[0] -= (mouseY - moveEvent.y) * 0.01;
            angle[1] += (mouseX - moveEvent.x) * 0.01;

            graphicsLibrary.uniform4fv(angleUniformLocation, new Float32Array(angle));
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

function AddVertex(x, y, z, r, g, b, u, v, nx, ny, nz)
{
    const index = vertices.length;
    vertices.length += 11;
    vertices[index + 0] = x;
    vertices[index + 1] = y;
    vertices[index + 2] = z;
    vertices[index + 3] = r;
    vertices[index + 4] = g;
    vertices[index + 5] = b;
    vertices[index + 6] = u;
    vertices[index + 7] = v;
    vertices[index + 8] = nx;
    vertices[index + 9] = ny;
    vertices[index + 10] = nz;
}

function AddTriangle(x1, y1, z1, r1, g1, b1, u1, v1, n1x, n1y, n1z,
                     x2, y2, z2, r2, g2, b2, u2, v2, n2x, n2y, n2z,
                     x3, y3, z3, r3, g3, b3, u3, v3, n3x, n3y, n3z)
{
    AddVertex(x1, y1, z1, r1, g1, b1, u1, v1, n1x, n1y, n1z);
    AddVertex(x2, y2, z2, r2, g2, b2, u2, v2, n2x, n2y, n2z);
    AddVertex(x3, y3, z3, r3, g3, b3, u3, v3, n3x, n3y, n3z);
}

function AddQuad(x1, y1, z1, r1, g1, b1, u1, v1, n1x, n1y, n1z,
                 x2, y2, z2, r2, g2, b2, u2, v2, n2x, n2y, n2z,
                 x3, y3, z3, r3, g3, b3, u3, v3, n3x, n3y, n3z,
                 x4, y4, z4, r4, g4, b4, u4, v4, n4x, n4y, n4z)
{
    AddTriangle(x1, y1, z1, r1, g1, b1, u1, v1, n1x, n1y, n1z,
                x2, y2, z2, r2, g2, b2, u2, v2, n2x, n2y, n2z,
                x3, y3, z3, r3, g3, b3, u3, v3, n3x, n3y, n3z);

    AddTriangle(x3, y3, z3, r3, g3, b3, u3, v3, n3x, n3y, n3z,
                x4, y4, z4, r4, g4, b4, u4, v4, n4x, n4y, n4z,
                x1, y1, z1, r1, g1, b1, u1, v1, n1x, n1y, n1z);
}

function AddDynamicTriangle(width, height)
{
    const w = width * 0.5;
    const h = height * 0.5;
    AddTriangle(0.0, h, 0.0, 1.0, 0.0, 0.0, 0.5, 1.0, 0.0, 0.0, 1.0,
                -w, -h, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0,
                 w, -h, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0);
}

function AddDynamicQuad(width, height) 
{
    const w = width * 0.5;
    const h = height * 0.5;
    AddQuad(-w, h, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
            -w,-h, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0,
             w,-h, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0,
             w, h, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0);
}

function AddDynamicQuadBox(width, height, depth) 
{
    const w = width * 0.5;
    const h = height * 0.5;
    const d = depth * 0.5;

    // Front
    AddQuad(-w, h, d, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
            -w,-h, d, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0,
             w,-h, d, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0,
             w, h, d, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0);

    // Back
    AddQuad( w, h, -d, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, -1.0,
             w,-h, -d, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0,
            -w,-h, -d, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 0.0, -1.0,
            -w, h, -d, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, -1.0);

    // Top
    AddQuad(-w, h,-d, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0,
            -w, h, d, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0,
             w, h, d, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0,
             w, h,-d, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0);

    // Bottom
    AddQuad(-w,-h, d, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, -1.0, 0.0,
            -w,-h,-d, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, -1.0, 0.0,
             w,-h,-d, 0.0, 1.0, 1.0, 1.0, 0.0, 0.0, -1.0, 0.0,
             w,-h, d, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, -1.0, 0.0);

    // Left
    AddQuad(-w, h, d, 1.0, 0.5, 0.0, 0.0, 1.0, -1.0, 0.0, 0.0,
            -w, h,-d, 1.0, 0.5, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0,
            -w,-h,-d, 1.0, 0.5, 0.0, 1.0, 0.0, -1.0, 0.0, 0.0,
            -w,-h, d, 1.0, 0.5, 0.0, 1.0, 1.0, -1.0, 0.0, 0.0);
    
    // Right
    AddQuad( w, h,-d, 0.5, 0.0, 0.5, 0.0, 1.0, 1.0, 0.0, 0.0,
             w, h, d, 0.5, 0.0, 0.5, 0.0, 0.0, 1.0, 0.0, 0.0,
             w,-h, d, 0.5, 0.0, 0.5, 1.0, 0.0, 1.0, 0.0, 0.0,
             w,-h,-d, 0.5, 0.0, 0.5, 1.0, 1.0, 1.0, 0.0, 0.0);
}

function AddDynamicTriangleBox(width, height, depth)
{
    const w = width * 0.5;
    const h = height * 0.5;
    const d = depth * 0.5;

    // Front
    AddTriangle(0.0, h, 0.0, 1.0, 0.0, 0.0, 0.5, 1.0, 0.0, 1.0, 0.0,
                -w, -h,  d,  1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0,
                 w, -h,  d,  1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0);

    // Left/Back
    AddTriangle(0.0, h, 0.0, 0.0, 1.0, 0.0, 0.5, 1.0,  0.0, 1.0,  0.0,
                0.0,-h, -d,  0.0, 1.0, 0.0, 0.0, 0.0,  0.0, 0.0, -1.0,
                -w, -h,  d,  0.0, 1.0, 0.0, 1.0, 0.0, -1.0, 0.0,  0.0);

    // Right/Back
    AddTriangle(0.0, h, 0.0, 0.0, 0.0, 1.0, 0.5, 1.0, 0.0, 1.0,  0.0,
                 w, -h,  d,  0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  0.0,
                0.0,-h, -d,  0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, -1.0);
    // Bottom
    AddTriangle( w, -h, d, 0.0, 1.0, 1.0, 0.5, 1.0, 0.0, -1.0, 0.0,
                -w, -h, d, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, -1.0, 0.0,
                0.0,-h,-d, 0.0, 1.0, 1.0, 1.0, 0.0, 0.0, -1.0, 0.0);
}

function AddDynamicCylinder(radius, height)
{
    const h = height * 0.5;

    for (let i = 0; i < 360; i += 10) 
    {
        let angle1 = Math.cos(i);
        let angle2 = Math.sin(i);

        AddTriangle( 0.0, h, 0.0, 0.0, 1.0, 1.0, 0.5, 1.0, 0.0, -1.0, 0.0,
                    radius * Math.cos(i / 180 * Math.PI), h, radius * Math.sin(i / 180 * Math.PI), 0.0, 1.0, 1.0, 0.0, 0.0, 0.0, -1.0, 0.0,
                    radius * Math.cos((i + 10) / 180 * Math.PI), h, radius * Math.sin((i + 10) / 180 * Math.PI), 0.0, 1.0, 1.0, 1.0, 0.0, 0.0, -1.0, 0.0);
    }
}

function AddDynamicSubdividedeQuadBox(width, height, depth, divideX, divideY, divideZ) 
{
    divideX = Math.max(1, divideX);
    divideY = Math.max(1, divideY);
    divideZ = Math.max(1, divideZ);
    divideX = Math.round(divideX);
    divideY = Math.round(divideY);
    divideZ = Math.round(divideZ);

    const w = width * 0.5;
    const h = height * 0.5;
    const d = depth * 0.5;
    const stepZ = depth / divideZ;
    const stepY = height / divideY;
    const stepX = width / divideX;

    for (let i = 0; i < divideY; i++)
    {
        let divH = -h + (stepY * (i + 1));
        for (let j = 0; j < divideX; j++)
        {
            let setBlackXY = (i + j) % 2 == 0;
            let divW = -w + (stepX * (j + 1));
            // Front
            let sideColor1 = (setBlackXY ? 1.0 : 0.0);
            let sideColor2 = (setBlackXY ? 0.5 : 0.0);
            AddQuad(divW - stepX, divH,         d, sideColor1, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
                    divW - stepX, divH - stepY, d, sideColor1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0,
                    divW,         divH - stepY, d, sideColor1, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0,
                    divW,         divH,         d, sideColor1, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0);

            // Back
            AddQuad(divW,         divH,         -d, 0.0, sideColor1, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
                    divW,         divH - stepY, -d, 0.0, sideColor1, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0,
                    divW - stepX, divH - stepY, -d, 0.0, sideColor1, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0,
                    divW - stepX, divH,         -d, 0.0, sideColor1, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0);

            for (let q = 0; q < divideZ; q++)
            {
                let setBlackYZ = (i + q) % 2 == 0;
                let setBlackXZ = (j + q) % 2 == 0;
                let divD = -d + (stepZ * (q + 1));
                // Left
                sideColor1 = (setBlackYZ ? 1.0 : 0.0);
                sideColor2 = (setBlackYZ ? 0.5 : 0.0);
                AddQuad(-w, divH,         divD,         sideColor1, sideColor2, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
                        -w, divH,         divD - stepZ, sideColor1, sideColor2, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0,
                        -w, divH - stepY, divD - stepZ, sideColor1, sideColor2, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0,
                        -w, divH - stepY, divD,         sideColor1, sideColor2, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0);

                // Right   
                AddQuad(w, divH,         divD - stepZ,  sideColor2, 0.0, sideColor2, 0.0, 1.0, 0.0, 0.0, 1.0,
                        w, divH,         divD,          sideColor2, 0.0, sideColor2, 0.0, 0.0, 0.0, 0.0, 1.0,
                        w, divH - stepY, divD,          sideColor2, 0.0, sideColor2, 1.0, 0.0, 0.0, 0.0, 1.0,
                        w, divH - stepY, divD - stepZ,  sideColor2, 0.0, sideColor2, 1.0, 1.0, 0.0, 0.0, 1.0); 

                // Top
                sideColor1 = (setBlackXZ ? 1.0 : 0.0);
                AddQuad(divW - stepX, h, divD - stepZ,  0.0, 0.0, sideColor1, 0.0, 1.0, 0.0, 0.0, 1.0,
                        divW - stepX, h, divD,          0.0, 0.0, sideColor1, 0.0, 0.0, 0.0, 0.0, 1.0,
                        divW,         h, divD,          0.0, 0.0, sideColor1, 1.0, 0.0, 0.0, 0.0, 1.0,
                        divW,         h, divD - stepZ,  0.0, 0.0, sideColor1, 1.0, 1.0, 0.0, 0.0, 1.0);

                // Bottom
                AddQuad(divW - stepX, -h, divD,          0.0, sideColor1, sideColor1, 0.0, 1.0, 0.0, 0.0, 1.0,
                        divW - stepX, -h, divD - stepZ,  0.0, sideColor1, sideColor1, 0.0, 0.0, 0.0, 0.0, 1.0,
                        divW,         -h, divD - stepZ,  0.0, sideColor1, sideColor1, 1.0, 0.0, 0.0, 0.0, 1.0,
                        divW,         -h, divD,          0.0, sideColor1, sideColor1, 1.0, 1.0, 0.0, 0.0, 1.0);
            }
        }
    }
}

function ClearVertices()
{
    vertices.length = 0;
}

function CreateTexture(program, url)
{
    // Load texture to graphics card
    const texture = LoadTexture(url);

    // Flip y axis so it fits OpenGL standard
    graphicsLibrary.pixelStorei(graphicsLibrary.UNPACK_FLIP_Y_WEBGL, true);

    // Activate texture to texture unit 0
    graphicsLibrary.activeTexture(graphicsLibrary.TEXTURE0);
    graphicsLibrary.bindTexture(graphicsLibrary.TEXTURE_2D, texture);

    // Add uniform location to fragment shader
    textureUniformLocation = graphicsLibrary.getUniformLocation(program, 'Texture');

    // Add uniform location to fragment shader
    displayUniformLocation = graphicsLibrary.getUniformLocation(program, 'Display');
}

function LoadTexture(url) {
    // Get reference to memory location where texture data is saved
    const texture = graphicsLibrary.createTexture();

    // Call this before running any texture code, 
    // in order for the data to be send to previous memory location
    graphicsLibrary.bindTexture(graphicsLibrary.TEXTURE_2D, texture);

    // Create a blue image to be displayed until texture is loaded
    const pixel = new Uint8Array([0, 0, 255, 255]);
    graphicsLibrary.texImage2D(graphicsLibrary.TEXTURE_2D, 0, graphicsLibrary.RGBA, 1, 1, 0,
                               graphicsLibrary.RGBA, graphicsLibrary.UNSIGNED_BYTE, pixel);

    // Instantiate new image and replace blue image when download is finished
    const image = new Image();
    image.onload = () => {
        graphicsLibrary.bindTexture(graphicsLibrary.TEXTURE_2D, texture);
        graphicsLibrary.texImage2D(graphicsLibrary.TEXTURE_2D, 0, graphicsLibrary.RGBA,
                                   graphicsLibrary.RGBA, graphicsLibrary.UNSIGNED_BYTE, image);
        SetTextureFilters(image);
    };

    // Start image download here
    image.src = url;

    return texture;
}

function SetTextureFilters(image)
{
    // Check if image width and height i equal to the power of 2
    if (IsPow2(image.width) && IsPow2(image.height))
    {
        graphicsLibrary.generateMipmap(graphicsLibrary.TEXTURE_2D);
    }
    else
    {
        // Create a texture filter without mipmap

        // Set texture area to repeat the last pixel on the U and V axes to fill out the texture map
        graphicsLibrary.texParameteri(graphicsLibrary.TEXTURE_2D,
        graphicsLibrary.TEXTURE_WRAP_S, graphicsLibrary.CLAMP_TO_EDGE);
        graphicsLibrary.texParameteri(graphicsLibrary.TEXTURE_2D,
        graphicsLibrary.TEXTURE_WRAP_T, graphicsLibrary.CLAMP_TO_EDGE);
        graphicsLibrary.texParameteri(graphicsLibrary.TEXTURE_2D,
        graphicsLibrary.TEXTURE_MIN_FILTER, graphicsLibrary.LINEAR);
    }
}

function IsPow2(value)
{
    return (value & (value - 1)) === 0;
}

function CreateGeometryUI() {
    const widthElement = document.getElementById('width');
    const width = widthElement ? widthElement.value : 1.0;
    const heightElement = document.getElementById('height');
    const height = heightElement ? heightElement.value : 1.0;
    const depthElement = document.getElementById('depth');
    const depth = depthElement ? depthElement.value : 1.0;
    const divideXElement = document.getElementById('divideX');
    const divideX = divideXElement ? divideXElement.value : 1.0;
    const divideYElement = document.getElementById('divideY');
    const divideY = divideYElement ? divideYElement.value : 1.0;
    const divideZElement = document.getElementById('divideZ');
    const divideZ = divideZElement ? divideZElement.value : 1.0;

    document.getElementById('ui').innerHTML =
    'Width: <input type="number" id="width" value="'+ width +'"onchange= "InitShaders();"><br>' +
    'Height: <input type="number" id="height" value="'+ height +'"onchange= "InitShaders();"><br>' +
    'Depth: <input type="number" id="depth" value="'+ depth +'"onchange= "InitShaders();"><br>' +
    'DivideX: <input type="number" id="divideX" value="'+ divideX +'"onchange= "InitShaders();"><br>' +
    'DivideY: <input type="number" id="divideY" value="'+ divideY +'"onchange= "InitShaders();"><br>' +
    'DivideZ: <input type="number" id="divideZ" value="'+ divideZ +'"onchange= "InitShaders();"><br>';

    let selecter = document.getElementById('shape');
    switch (selecter.selectedIndex) {
        case 0: AddDynamicTriangle(width, height); break;
        case 1: AddDynamicQuad(width, height); break;
        case 2: AddDynamicQuadBox(width, height, depth); break;
        case 3: AddDynamicTriangleBox(width, height, depth); break;
        case 4: AddDynamicCylinder(width, height); break;
        case 5: AddDynamicSubdividedeQuadBox(width, height, depth, divideX, divideY, divideZ); break;
    }
}

function CreateVBO(ShaderProgram, vertices)
{
    let virtualBufferObject = graphicsLibrary.createBuffer();
    graphicsLibrary.bindBuffer(graphicsLibrary.ARRAY_BUFFER, virtualBufferObject);
    graphicsLibrary.bufferData(graphicsLibrary.ARRAY_BUFFER, vertices, graphicsLibrary.STATIC_DRAW);
    const vertexPoints = 11 * Float32Array.BYTES_PER_ELEMENT;

    // Create shader attribute: Pos
    let position = graphicsLibrary.getAttribLocation(ShaderProgram, 'Pos');
    graphicsLibrary.vertexAttribPointer(position, 3, graphicsLibrary.FLOAT, graphicsLibrary.FALSE, vertexPoints, 0);
    graphicsLibrary.enableVertexAttribArray(position);

    // Create shader attribute: Color
    const offset = 3 * Float32Array.BYTES_PER_ELEMENT;
    let color = graphicsLibrary.getAttribLocation(ShaderProgram, 'Color');
    graphicsLibrary.vertexAttribPointer(color, 3, graphicsLibrary.FLOAT, graphicsLibrary.FALSE, vertexPoints, offset);
    graphicsLibrary.enableVertexAttribArray(color);

    // Create shader attribute: UV
    const offset2 = offset * 2;
    let uv = graphicsLibrary.getAttribLocation(ShaderProgram, 'UV');
    graphicsLibrary.vertexAttribPointer(uv, 2, graphicsLibrary.FLOAT, graphicsLibrary.FALSE, vertexPoints, offset2);
    graphicsLibrary.enableVertexAttribArray(uv);

    // Create shader attribute: Normal
    const offset3 = offset + 5 * Float32Array.BYTES_PER_ELEMENT;
    let normal = graphicsLibrary.getAttribLocation(ShaderProgram, 'Normal');
    graphicsLibrary.vertexAttribPointer(normal, 3, graphicsLibrary.FLOAT, graphicsLibrary.FALSE, vertexPoints, offset3);
    graphicsLibrary.enableVertexAttribArray(normal);
}

function Render()
{
    graphicsLibrary.clearColor(0.0, 0.4, 0.6, 1.0);
    graphicsLibrary.clear(graphicsLibrary.COLOR_BUFFER_BIT | graphicsLibrary.DEPTH_BUFFER_BIT);
    graphicsLibrary.drawArrays(graphicsLibrary.TRIANGLES, 0, vertices.length / 6);
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
    angleUniformLocation = graphicsLibrary.getUniformLocation(shaderProgram, 'Angle');

    CreateTexture(shaderProgram, 'image/1812.jpg');

    // Activate shader program
    graphicsLibrary.useProgram(shaderProgram);

    // Display geometri on screen
    //Render();

    // Display Texture and light color on screen
    Update();
}

function Update()
{
    // Show texture (boolean) last element
    const textureElement = document.getElementById('t');
    display[3] = textureElement.checked ? 1.0 : 0.0;

    // Light color (convert hex to RGB)
    const light = document.getElementById('l').value;
    display[0] = parseInt(light.substring(1,3), 16) / 255.0;
    display[1] = parseInt(light.substring(3,5), 16) / 255.0;
    display[2] = parseInt(light.substring(5,7), 16) / 255.0;

    // Update array to graphics card and render
    graphicsLibrary.uniform4fv(displayUniformLocation, new Float32Array(display));

    // Display geometri on screen
    Render();
}