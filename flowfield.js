/**
 * Premium Flow Field Animation
 * Creates fingerprint-like patterns that interact with mouse movements
 */

class FlowFieldAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.flowField = [];
        this.cols = 0;
        this.rows = 0;
        this.scale = 20;
        this.time = 0;
        this.animationId = null;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Initialize particles
        this.createParticles();

        // Start animation
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.cols = Math.floor(this.canvas.width / this.scale);
        this.rows = Math.floor(this.canvas.height / this.scale);
        this.flowField = new Array(this.cols * this.rows);
    }

    createParticles() {
        const numberOfParticles = Math.min(1000, (this.canvas.width * this.canvas.height) / 18000);

        for (let i = 0; i < numberOfParticles; i++) {
            const maxLife = Math.random() * 10 + 10; // 10-20 seconds (at 60fps)
            const avgSpeed = 0.5; // Average speed
            const diagonalDistance = Math.sqrt(this.canvas.width ** 2 + this.canvas.height ** 2);
            const framesToCrossScreen = (diagonalDistance / avgSpeed) / 60; // Frames to cross screen

            // Start particles at random positions across the screen for staggered appearance
            const startProgress = Math.random(); // 0 to 1

            this.particles.push({
                x: Math.random() * this.canvas.width * 0.5,
                y: this.canvas.height * (1 - startProgress * 0.8), // Distribute across screen height
                vx: 0,
                vy: 0,
                size: Math.random() * 1.5 + 0.5,
                speed: Math.random() * 0.8 + 0.3,
                life: Math.random() * maxLife,
                maxLife: maxLife,
                decay: 1 / 60, // Decay by 1/60th per second (60fps)
                history: [],
                historyLength: Math.floor(framesToCrossScreen * 50), // Trail spans 50x screen crossing time
                fadeIn: 1, // Start fully visible
                isDying: false
            });
        }
    }

    getFlowFieldAngle(x, y) {
        // Diagonal movement from bottom-left to top-right
        // Base angle: -45 degrees (up-right direction)
        const baseAngle = -Math.PI / 4;

        // Add subtle wave motion for organic feel
        const wave = Math.sin(x * 0.005 + y * 0.005 + this.time * 0.3) * 0.3;

        return baseAngle + wave;
    }

    updateFlowField() {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const index = x + y * this.cols;
                const posX = x * this.scale;
                const posY = y * this.scale;
                this.flowField[index] = this.getFlowFieldAngle(posX, posY);
            }
        }
    }

    updateParticles() {
        this.particles.forEach(particle => {
            // Get flow field angle at particle position
            const col = Math.floor(particle.x / this.scale);
            const row = Math.floor(particle.y / this.scale);
            const index = Math.min(col + row * this.cols, this.flowField.length - 1);

            const angle = this.flowField[Math.max(0, index)] || 0;

            // Update velocity based on flow field
            particle.vx += Math.cos(angle) * 0.03;
            particle.vy += Math.sin(angle) * 0.03;

            // Apply speed
            particle.x += particle.vx * particle.speed;
            particle.y += particle.vy * particle.speed;

            // Apply friction
            particle.vx *= 0.97;
            particle.vy *= 0.97;

            // Store history for trails
            particle.history.push({ x: particle.x, y: particle.y });
            if (particle.history.length > particle.historyLength) {
                particle.history.shift();
            }

            // Start fading when approaching top of screen (last 30% of screen height)
            if (particle.y < this.canvas.height * 0.3) {
                particle.life -= particle.decay * 0.3; // Even slower decay for gradual fade
            }

            // When dying, shrink history gradually instead of clearing
            if (particle.life <= 0 && !particle.isDying) {
                particle.isDying = true;
            }

            if (particle.isDying) {
                // Gradually remove history points
                const shrinkSpeed = Math.max(1, Math.floor(particle.historyLength / 120)); // Shrink over ~2 seconds
                for (let i = 0; i < shrinkSpeed && particle.history.length > 0; i++) {
                    particle.history.shift();
                }

                // When history is empty, respawn
                if (particle.history.length < 2) {
                    particle.isDying = false;
                    particle.x = Math.random() * this.canvas.width * 0.5;
                    particle.y = this.canvas.height + Math.random() * 100;
                    particle.vx = 0;
                    particle.vy = 0;
                    particle.life = particle.maxLife;
                    particle.history = [];
                    particle.fadeIn = 0; // Will fade in gradually
                }
            }

            // Hard respawn only if way off screen
            if (particle.x > this.canvas.width + 200 || particle.y < -200) {
                particle.isDying = false;
                particle.x = Math.random() * this.canvas.width * 0.5;
                particle.y = this.canvas.height + Math.random() * 100;
                particle.vx = 0;
                particle.vy = 0;
                particle.life = particle.maxLife;
                particle.history = [];
                particle.fadeIn = 0;
            }

            // Gradual fade in for new particles
            if (particle.fadeIn < 1) {
                particle.fadeIn += 0.008; // Fade in over ~2 seconds
            }
        });
    }

    draw() {
        // Get theme colors
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        // Clear completely
        this.ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 1)' : 'rgba(250, 248, 245, 1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw particles with trails (no heads)
        this.particles.forEach(particle => {
            if (particle.history.length < 2) return;

            const lifeRatio = particle.life / particle.maxLife;

            // Smooth gradual fade over the entire life
            // Full opacity for most of life, then gradual fade
            let alpha;
            if (lifeRatio > 0.7) {
                alpha = 0.6; // Full opacity
            } else if (lifeRatio > 0.3) {
                // Start fading gradually
                alpha = 0.6 * ((lifeRatio - 0.3) / 0.4);
            } else {
                // Continue fading to zero
                alpha = 0.6 * (lifeRatio / 0.3);
            }

            // Ensure alpha doesn't go negative
            alpha = Math.max(0, alpha);

            // Apply fade in for new particles
            alpha *= particle.fadeIn;

            // Draw trail only (no particle head)
            if (particle.history.length > 2) {
                this.ctx.beginPath();
                this.ctx.moveTo(particle.history[0].x, particle.history[0].y);

                for (let i = 1; i < particle.history.length; i++) {
                    this.ctx.lineTo(particle.history[i].x, particle.history[i].y);
                }

                this.ctx.lineTo(particle.x, particle.y);

                if (isDark) {
                    this.ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`;
                } else {
                    this.ctx.strokeStyle = `rgba(217, 119, 6, ${alpha})`;
                }

                this.ctx.lineWidth = particle.size * 0.6;
                this.ctx.lineCap = 'round';
                this.ctx.lineJoin = 'round';
                this.ctx.stroke();
            }
        });
    }

    animate() {
        this.time += 0.01;

        this.updateFlowField();
        this.updateParticles();
        this.draw();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        window.removeEventListener('resize', this.resize);
    }
}

// Initialize when DOM is ready
let flowFieldAnimation;
let isAnimationRunning = false; // Default to OFF

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('flowfield-canvas');
    const animToggle = document.getElementById('anim-toggle');

    if (canvas && animToggle) {
        // Don't start animation by default - wait for user to toggle

        // Toggle animation on button click
        animToggle.addEventListener('click', () => {
            if (isAnimationRunning) {
                // Stop animation
                if (flowFieldAnimation) {
                    flowFieldAnimation.destroy();
                    flowFieldAnimation = null;
                }
                isAnimationRunning = false;
                animToggle.classList.remove('anim-active');
                canvas.classList.remove('anim-visible');
            } else {
                // Start animation
                flowFieldAnimation = new FlowFieldAnimation(canvas);
                isAnimationRunning = true;
                animToggle.classList.add('anim-active');
                canvas.classList.add('anim-visible');
            }
        });
    }
});

// Reinitialize on theme change for smooth color transition
const themeToggle = document.querySelector('.theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        setTimeout(() => {
            if (isAnimationRunning && flowFieldAnimation) {
                flowFieldAnimation.destroy();
                const canvas = document.getElementById('flowfield-canvas');
                flowFieldAnimation = new FlowFieldAnimation(canvas);
            }
        }, 100);
    });
}