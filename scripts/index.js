// Constants
const MAX_RIPPLE_SIZE = 300;
const RAIN_ENABLED_CLASS = "fas fa-tint";
const RAIN_DISABLED_CLASS = "fas fa-tint-slash";

// HTML Element Variables and friends
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let rect = canvas.getBoundingClientRect();
const rainToggle = document.getElementById("rain-toggle");
const rainToggleIcon = document.getElementById("rain-toggle-icon");

// State Variables
let isRaining = false;

// Cursor Click Location for fish following
let clickX = -1;
let clickY = -1;

//Helper Functions
// Reset Canvas size to window
function initCanvas() {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    rect = canvas.getBoundingClientRect();
}
// Helper function to generate color rgb string
function generateColor(t) {
    return `rgba(255, 255, 255, ${t})`
}
// Helper to create a ripple object
function initRipple(x, y) {
    return {
        x: x,
        y: y,
        r: 1,
        delta: 2
    }
}
// Create a ripple somewhere in the canvas
function createRandomRipple() {
    return initRipple(
        Math.floor(Math.random() * canvas.width),
        Math.floor(Math.random() * canvas.height)
    );
}

// Here we go
initCanvas();
window.addEventListener("resize", initCanvas);

// Setup waterdrop animation
let drawInterval;
function drawRipples(rips) {
    for (var i = rips.length - 1; i >= 0; i--) {
        ctx.beginPath();
        // Transitions the color from 255 to 0
        ctx.strokeStyle = generateColor((Math.max(MAX_RIPPLE_SIZE - (rips[i].r), 0) / MAX_RIPPLE_SIZE));
        ctx.arc(
            (rips[i].x - rect.left) / (rect.right - rect.left) * canvas.width,
            (rips[i].y - rect.top) / (rect.bottom - rect.top) * canvas.height,
            rips[i].r,
            0,
            2 * Math.PI
        );
        ctx.stroke();

        rips[i].r += rips[i].delta;

        // Only check the most recent ripple
        if (rips[i].r > MAX_RIPPLE_SIZE) {
            rips.splice(i, 1);
            if (rips.length == 0) {
                if (isRaining) {
                    rips.push(createRandomRipple());
                } else {
                    // clearInterval(drawInterval);
                }
            }
        }
    }
}

let ripples = []
canvas.addEventListener('click', (e) => {
    ripples.unshift(initRipple(e.clientX, e.clientY));
    clickX = e.clientX;
    clickY = e.clientY;
});
rainToggle.addEventListener('click', () => {
    if (isRaining) {
        ripples.length = 0;
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        // clearInterval(drawInterval);
        rainToggleIcon.className = RAIN_DISABLED_CLASS;
    } else {
        ripples.push(createRandomRipple());
        rainToggleIcon.className = RAIN_ENABLED_CLASS;
    }
    isRaining = !isRaining;
})

// FISH?
function drawFish(X, Y, quarterLength, halfWidth, rotation) {
    let cosRotation = Math.cos(rotation);
    let sinRotation = Math.sin(rotation);

    let origin          = { x: Math.floor(X                                                           ) , y: Math.floor(Y                                                           ) };
    let lCurveUpper     = { x: Math.floor(X + (halfWidth*sinRotation)                                 ) , y: Math.floor(Y + (halfWidth*cosRotation)                                 ) };
    let rCurveUpper     = { x: Math.floor(X - (halfWidth*sinRotation)                                 ) , y: Math.floor(Y - (halfWidth*cosRotation)                                 ) };
    let lCurveLower     = { x: Math.floor(X - (2*quarterLength*cosRotation) + (halfWidth*sinRotation) ) , y: Math.floor(Y + (2*quarterLength*sinRotation) + (halfWidth*cosRotation) ) };
    let rCurveLower     = { x: Math.floor(X - (2*quarterLength*cosRotation) - (halfWidth*sinRotation) ) , y: Math.floor(Y + (2*quarterLength*sinRotation) - (halfWidth*cosRotation) ) };
    let tailConnection  = { x: Math.floor(X - (3*quarterLength*cosRotation)                           ) , y: Math.floor(Y + (3*quarterLength*sinRotation)                           ) };
    let lTail           = { x: Math.floor(X + (halfWidth*sinRotation) - (4*quarterLength*cosRotation) ) , y: Math.floor(Y + (4*quarterLength*sinRotation) + (halfWidth*cosRotation) ) };
    let rTail           = { x: Math.floor(X - (halfWidth*sinRotation) - (4*quarterLength*cosRotation) ) , y: Math.floor(Y + (4*quarterLength*sinRotation) - (halfWidth*cosRotation) ) };

    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(tailConnection.x, tailConnection.y);
    ctx.lineTo(lTail.x, lTail.y);
    ctx.lineTo(rTail.x, rTail.y);
    ctx.lineTo(tailConnection.x,tailConnection.y);

    ctx.bezierCurveTo(lCurveLower.x, lCurveLower.y, lCurveUpper.x, lCurveUpper.y, origin.x, origin.y);
    ctx.bezierCurveTo(rCurveUpper.x, rCurveUpper.y,rCurveLower.x, rCurveLower.y, tailConnection.x, tailConnection.y);
    ctx.fill();

}

let x = 300;
let y = 500;
let fishRotation = 0;
function drawFishes() {
    let speed = 5;

    let diffX = clickX - x;
    let diffY = y - clickY;

    if (clickX > 0 && clickY > 0) {
        if (Math.abs(diffX) < 3 && Math.abs(diffY) < 3) {
            clickX = -1;
            clickY = -1;
        } else {
            fishRotation = Math.atan(diffY/diffX)
            if ( clickX <= x ) {
                fishRotation += Math.PI;
            }
            x += speed * Math.cos(fishRotation);
            y -= speed * Math.sin(fishRotation);
        }
    }
    drawFish(x, y, 50, 40, fishRotation);
}

function animateLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    drawRipples(ripples);
    drawFishes();

    requestAnimationFrame(animateLoop);
}
animateLoop();
