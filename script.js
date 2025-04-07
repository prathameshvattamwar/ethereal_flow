const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');
const resetButton = document.getElementById('resetButton');

let particles = [];
const numParticles = 150; // Adjust for performance/density
let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;
let mouse = { x: null, y: null, radius: 100 }; // Interaction radius

// --- Particle Class ---
class Particle {
    constructor(x, y) {
        this.x = x || Math.random() * canvasWidth;
        this.y = y || Math.random() * canvasHeight;
        this.size = Math.random() * 2 + 1; // Size variation
        this.baseX = this.x; // Remember original position
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1; // How much it reacts to mouse
        this.hue = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--particle-hue-start')) + Math.random() * 60 - 30; // Base hue + variation
        this.saturation = 80 + Math.random() * 20; // High saturation
        this.lightness = 50 + Math.random() * 10; // Bright
        this.opacity = 0.8 + Math.random() * 0.2; // Slight opacity variation
        this.vx = (Math.random() - 0.5) * 0.5; // Initial velocity x
        this.vy = (Math.random() - 0.5) * 0.5; // Initial velocity y
        this.maxSpeed = 1.5;
    }

    update() {
        // Interaction with mouse/touch
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;

        // Max distance for interaction
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance; // Stronger force closer to center
        let directionCheck = 1; // 1 for repel, -1 for attract

        if (distance < mouse.radius) {
            this.vx += forceDirectionX * force * this.density * 0.1 * directionCheck;
            this.vy += forceDirectionY * force * this.density * 0.1 * directionCheck;
        } else {
            // Gently return towards original position or just slow down
             this.vx += (this.baseX - this.x) * 0.001; // Gentle pull back (optional)
             this.vy += (this.baseY - this.y) * 0.001; // Gentle pull back (optional)

            // Dampen velocity when outside radius
             this.vx *= 0.98;
             this.vy *= 0.98;
        }

        // Limit speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        }


        this.x += this.vx;
        this.y += this.vy;

        // Boundary checks (wrap around)
        if (this.x < 0) this.x = canvasWidth;
        if (this.x > canvasWidth) this.x = 0;
        if (this.y < 0) this.y = canvasHeight;
        if (this.y > canvasHeight) this.y = 0;

        // Update color slightly based on position or velocity (optional)
        // this.hue += this.vx * 0.1; // Example: change hue based on horizontal speed
    }

    draw() {
        // Interaction glow effect
        let glowAlpha = 0;
        if (mouse.x !== null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius) {
                glowAlpha = (1 - distance / mouse.radius) * 0.6; // Adjust intensity
            }
        }

        // Base particle
        ctx.fillStyle = `hsla(${this.hue % 360}, ${this.saturation}%, ${this.lightness}%, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        // // Additive glow when interacting
        if (glowAlpha > 0) {
            ctx.globalCompositeOperation = 'lighter'; // Additive blending
            ctx.fillStyle = `hsla(${this.hue % 360}, ${this.saturation + 10}%, ${this.lightness + 10}%, ${glowAlpha})`;
            ctx.beginPath();
            // Make glow slightly larger than particle
            ctx.arc(this.x, this.y, this.size + 3, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over'; // Reset blend mode
        }
    }
}

// --- Initialization ---
function init() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    particles = [];
    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
    }
    // Update base hue from CSS var in case it changes
     const currentHue = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--particle-hue-start'));
     particles.forEach(p => {
        p.hue = currentHue + Math.random() * 60 - 30;
        p.baseX = p.x = Math.random() * canvasWidth; // Reset positions too
        p.baseY = p.y = Math.random() * canvasHeight;
        p.vx = (Math.random() - 0.5) * 0.5;
        p.vy = (Math.random() - 0.5) * 0.5;
     });
    console.log(`Canvas initialized (${canvasWidth}x${canvasHeight}), ${particles.length} particles created.`);
}

// --- Animation Loop ---
function animate() {
    // Clear canvas with slight opacity for trails effect
    ctx.fillStyle = 'rgba(15, 12, 41, 0.1)'; // Adjust alpha for trail length
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Update and draw particles
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // Evolve base hue slowly over time
    const currentHue = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--particle-hue-start'));
    document.documentElement.style.setProperty('--particle-hue-start', (currentHue + 0.05) % 360);


    requestAnimationFrame(animate); // Loop
}

// --- Event Listeners ---
window.addEventListener('resize', () => {
    // Debounce resize event slightly for performance
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(init, 200);
});

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

// Touch events for mobile
window.addEventListener('touchstart', (event) => {
    if (event.touches.length > 0) {
        mouse.x = event.touches[0].clientX;
        mouse.y = event.touches[0].clientY;
    }
}, { passive: true }); // Improve scroll performance

window.addEventListener('touchmove', (event) => {
     if (event.touches.length > 0) {
        mouse.x = event.touches[0].clientX;
        mouse.y = event.touches[0].clientY;
    }
}, { passive: true });

window.addEventListener('touchend', () => {
    mouse.x = null;
    mouse.y = null;
});

resetButton.addEventListener('click', init);


// --- Start ---
init();
animate();
