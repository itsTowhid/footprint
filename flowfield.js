/**
 * Simple Simplex-like Noise utility
 */
const noise = {
    perm: new Uint8Array(512),
    init() {
        for (let i = 0; i < 256; i++) this.perm[i] = this.perm[i + 256] = Math.floor(Math.random() * 256);
    },
    lerp(t, a, b) { return a + t * (b - a); },
    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); },
    grad(hash, x, y) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    },
    get(x, y) {
        const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
        x -= Math.floor(x); y -= Math.floor(y);
        const u = this.fade(x), v = this.fade(y);
        const a = this.perm[X] + Y, b = this.perm[X + 1] + Y;
        return this.lerp(v, this.lerp(u, this.grad(this.perm[a], x, y), this.grad(this.perm[b], x - 1, y)),
            this.lerp(u, this.grad(this.perm[a + 1], x, y - 1), this.grad(this.perm[b + 1], x - 1, y - 1)));
    }
};

let canvas, ctx, width, height, particles;
let animationId = null;
let isAnimationRunning = false;

// Config
const particleCount = 1200;
const noiseScale = 0.001;
const speed = 0.4;

class Particle {
    constructor() { this.init(); }
    init() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.oldX = this.x;
        this.oldY = this.y;
        this.life = Math.random() * 100 + 100;
    }
    move() {
        this.oldX = this.x;
        this.oldY = this.y;
        // Get angle from noise field
        const angle = noise.get(this.x * noiseScale, this.y * noiseScale) * Math.PI * 4;
        this.x += Math.cos(angle) * speed;
        this.y += Math.sin(angle) * speed;
        this.life--;

        if (this.life <= 0 || this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
            this.init();
        }
    }
    draw() {
        ctx.beginPath();
        ctx.moveTo(this.oldX, this.oldY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
    }
}

function setup() {
    canvas = document.getElementById('flowfield-canvas');
    ctx = canvas.getContext('2d');

    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    noise.init();
    particles = Array.from({ length: particleCount }, () => new Particle());

    // Initial background
    updateBackground();
}

function updateBackground() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
        ctx.fillStyle = '#0f172a';
    } else {
        ctx.fillStyle = '#ebe5dbff';
    }
    ctx.fillRect(0, 0, width, height);
}

function animate() {
    // Semi-transparent overlay creates the "fading trail" effect
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    if (isDark) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.05)';
        ctx.strokeStyle = 'rgba(191, 191, 191, 0.4)';
    } else {
        ctx.fillStyle = 'rgba(250, 248, 245, 0.05)';
        ctx.strokeStyle = 'rgba(52, 52, 52, 0.4)';
    }

    ctx.fillRect(0, 0, width, height);
    ctx.lineWidth = 1;

    particles.forEach(p => {
        p.move();
        p.draw();
    });
    animationId = requestAnimationFrame(animate);
}

function startAnimation() {
    if (isAnimationRunning) return;

    setup();
    animate();
    isAnimationRunning = true;
}

function stopAnimation() {
    if (!isAnimationRunning) return;

    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    isAnimationRunning = false;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const animToggle = document.getElementById('anim-toggle');

    if (animToggle) {
        // Don't start animation by default - wait for user to toggle
        setup(); // Setup canvas but don't animate

        // Toggle animation on button click
        animToggle.addEventListener('click', () => {
            if (isAnimationRunning) {
                // Stop animation
                stopAnimation();
                animToggle.classList.remove('anim-active');
                canvas.classList.remove('anim-visible');
            } else {
                // Start animation
                startAnimation();
                animToggle.classList.add('anim-active');
                canvas.classList.add('anim-visible');
            }
        });
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (isAnimationRunning) {
        setup();
    }
});

// Reinitialize on theme change for smooth color transition
const themeToggle = document.querySelector('.theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        setTimeout(() => {
            if (isAnimationRunning) {
                updateBackground();
            }
        }, 100);
    });
}