
//RGBA
const pixelMask = new Uint8Array([
    255, 255, 255, 255,
    255, 255, 0, 255,
    255, 0, 255, 255,
    0, 255, 255, 255,
]);
const pixelSize = 2;

const vertexShaderSource = `
attribute vec2 position;
varying vec2 v_coordinate;
void main() {
gl_Position = vec4(position, 1, 1);
v_coordinate = gl_Position.xy * 0.5 + 0.5;
}
`;

const fragmentShaderSource = `
precision mediump float;
varying vec2 v_coordinate;
uniform vec2 canvasSize;
uniform sampler2D u_image;
uniform sampler2D u_mask;

void main() {
vec2 position = vec2(v_coordinate.x, 1.0 - v_coordinate.y);
vec2 pixel = vec2(2, 2) / canvasSize;
vec4 color = texture2D(u_image, position);
vec4 mask = texture2D(u_mask, position / pixel);

color = color * mask;
gl_FragColor = color;
}
`;



async function ApplyToAllImage(selector) {
    var imgs = document.querySelectorAll(selector + ":not(.filtered)");
    if (imgs.length == 0) return;
    let canvas = initGL();

    for (let i = 0; i < imgs.length; i++) {
        const img = imgs[i];
        if (img.complete) {
            canvas = await ApplyToImage(img, canvas)

        } else {
            await new Promise(async (resolve) => {
                img.onload = resolve
            })
            img.onload = null;
            canvas = await ApplyToImage(img, canvas);
        }
    }
    canvas.remove();
}

function ApplyToAllVideo(selector) {
    let vs = document.querySelectorAll(selector + ":not(.filtered)");
    [].forEach.call(vs,
        (v) => {
            if (v.readyState <= 2)
                v.oncanplay = () => { v.oncanplay = null; ApplyToVideo(v) }
            else {
                ApplyToVideo(v)
            }
        }
    )
}

/**
 * 
 * @param {HTMLImageElement} image
 * @returns {Promise< Boolean>} 
 */
async function ApplyToImage(image, canvas) {
    const w = pixelSize * image.naturalWidth;
    const h = pixelSize * image.naturalHeight;


    if (canvas.width != w || canvas.height != h) {
        //cannot reuse canvas
        canvas.remove();
        canvas = initGL(w, h)
    } else {
        console.log("Reuse canvas")
    }

    let blob = await GetImage(image, canvas);
    let url = URL.createObjectURL(blob);
    image.src = url;
    image.className += " filtered"
    return canvas;
}

/**
 * @param {HTMLVideoElement} video
 * @returns {Promise<Boolean>} 
 */
async function ApplyToVideo(video) {
    const w = pixelSize * video.videoWidth;
    const h = pixelSize * video.videoHeight;

    const canvas = initGL(w, h);
    canvas.setAttribute("style", video.getAttribute("style"));
    canvas.className = "video retro aimg";
    video.parentElement.insertBefore(canvas, video);
    Draw(canvas, video);

    function step() {
        if (video.paused) {
            return;
        }
        Draw(canvas, video);
        requestAnimationFrame(step)
    }

    canvas.onclick = () => {
        if (!video.paused) {
            video.pause();

        } else {
            video.play()
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
    video.className += " filtered";
    video.style.display = "none";
    return canvas;
}



async function GetImage(image, canvas) {

    if (!canvas) {
        canvas = initGL(w, h);
    }
    Draw(canvas, image);
    return new Promise(async (resolve) => {
        canvas.toBlob(resolve)
    })

}

function Draw(canvas, image) {
    canvas.myImageTexture.image = image;
    const gl = canvas.myGl;
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, canvas.myImageTexture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
    );

    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function initGL(w, h) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    const gl = canvas.getContext("webgl");

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);
    const positionAttributeLocation = gl.getAttribLocation(program, "position");
    const canvasSizeLocation = gl.getUniformLocation(program, "canvasSize");

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);


    gl.useProgram(program);

    gl.uniform2f(canvasSizeLocation, w, h);

    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);


    // texture
    const u_imageLocation = gl.getUniformLocation(program, "u_image");
    const u_maskLocation = gl.getUniformLocation(program, "u_mask");
    gl.uniform1i(u_imageLocation, 1);
    gl.uniform1i(u_maskLocation, 0);


    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            -1, -1, -1, 1,
            1, -1, 1, 1,
            1, -1, -1, 1
        ]),
        gl.STATIC_DRAW
    );

    // Load Mask
    gl.activeTexture(gl.TEXTURE0);
    let maskTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, maskTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, pixelSize, pixelSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixelMask);

    canvas.myImageTexture = gl.createTexture();
    canvas.myGl = gl;

    return canvas;
}

function compileShader(gl, type, shaderSource) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    const r = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (r === false) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const r = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (r === false) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }
    return program;
}

exports.ApplyToAllImage = ApplyToAllImage;
exports.ApplyToAllVideo = ApplyToAllVideo;