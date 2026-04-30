// animations.js
window.bgAnimations = window.bgAnimations || {};

let canvas, ctx, width, height;
let animationId = null;
let isAnimationRunning = false;
let currentAnimation = 'space';

function setup() {
    canvas = document.getElementById('flowfield-canvas');
    ctx = canvas.getContext('2d');
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    if (window.bgAnimations[currentAnimation] && window.bgAnimations[currentAnimation].setup) {
        window.bgAnimations[currentAnimation].setup(canvas, ctx, width, height);
    }
    updateBackground();
}

function updateBackground() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (window.bgAnimations[currentAnimation] && window.bgAnimations[currentAnimation].updateBackground) {
        window.bgAnimations[currentAnimation].updateBackground(ctx, width, height, isDark);
    } else {
        if (isDark) {
            ctx.fillStyle = '#0f172a';
        } else {
            ctx.fillStyle = '#ebe5dbff';
        }
        ctx.fillRect(0, 0, width, height);
    }
}

function animate() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    if (window.bgAnimations[currentAnimation] && window.bgAnimations[currentAnimation].draw) {
        window.bgAnimations[currentAnimation].draw(ctx, width, height, isDark);
    }

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
    const animSelect = document.getElementById('anim-type-select');

    if (animToggle) {
        setup();
        animToggle.addEventListener('click', () => {
            if (isAnimationRunning) {
                stopAnimation();
                animToggle.classList.remove('anim-active');
                canvas.classList.remove('anim-visible');
                if (animSelect) animSelect.classList.remove('anim-active');
            } else {
                startAnimation();
                animToggle.classList.add('anim-active');
                canvas.classList.add('anim-visible');
                if (animSelect) animSelect.classList.add('anim-active');
            }
        });
    }

    if (animSelect) {
        animSelect.addEventListener('change', (e) => {
            currentAnimation = e.target.value;
            if (isAnimationRunning) {
                stopAnimation();
                startAnimation();
            } else {
                setup();
            }
        });
    }
});

window.addEventListener('resize', () => {
    if (isAnimationRunning) {
        setup();
    }
});

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