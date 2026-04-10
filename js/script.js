
// Global variable
var graphicsLibrary = document.getElementById('graphicsLibrary').getContext('webgl', {
                                                                                        antialias: false,
                                                                                        alpha: false,
                                                                                        depth: false,
                                                                                        stencil: false
                                                                                     }) || 
                      // Support Internet Explorer, Edge, Safari
                      document.getElementById('graphicsLibrary').getContext('experimental-webgl', {
                                                                                                    antialias: false,
                                                                                                    alpha: false,
                                                                                                    depth: false,
                                                                                                    stencil: false
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
    graphicsLibrary.enable(gl.DEPTH_TEST);
    graphicsLibrary.enable(gl.CULL_FACE);
    graphicsLibrary.cullFace(gl.BACK);
    //InitShaders();
}

