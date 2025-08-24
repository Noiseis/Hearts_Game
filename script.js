// FIX: Force page to scroll to the top on every reload
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};

// Floating hearts background animation
const canvas = document.getElementById('heartsCanvas');
const ctx = canvas.getContext('2d');
let hearts = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function randomHeart() {
    return {
        x: Math.random() * canvas.width,
        y: canvas.height + 20,
        size: 20 + Math.random() * 20,
        speed: 1 + Math.random() * 2,
        alpha: 0.7 + Math.random() * 0.3,
        swing: Math.random() * 2 * Math.PI,
        swingSpeed: 0.01 + Math.random() * 0.02,
        rotation: Math.random() * Math.PI - Math.PI / 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01
    };
}
function drawHeart(x, y, size, alpha, rotation = 0) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(0, size * 0.25);
    ctx.bezierCurveTo(0, -topCurveHeight, -size / 2, -topCurveHeight, -size / 2, size * 0.25);
    ctx.bezierCurveTo(-size / 2, size * 0.6, 0, size * 0.8, 0, size);
    ctx.bezierCurveTo(0, size * 0.8, size / 2, size * 0.6, size / 2, size * 0.25);
    ctx.bezierCurveTo(size / 2, -topCurveHeight, 0, -topCurveHeight, 0, size * 0.25);
    ctx.closePath();
    ctx.fillStyle = '#ee9ca7';
    ctx.fill();
    ctx.restore();
}
function animateHearts() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (hearts.length < 15) { hearts.push(randomHeart()); }
    hearts.forEach(h => {
        h.y -= h.speed;
        h.x += Math.sin(h.swing) * 0.5;
        h.swing += h.swingSpeed;
        h.rotation += h.rotationSpeed;
        drawHeart(h.x, h.y, h.size, h.alpha, h.rotation);
    });
    hearts = hearts.filter(h => h.y + h.size > 0);
    requestAnimationFrame(animateHearts);
}
animateHearts();


// --- Jumping Heart Mini-Game ---
const gameContainer = document.getElementById('game-view');
const gameCanvas = document.getElementById('loveGame');
const gameMsg = document.getElementById('gameMessage');
const gameOverModal = document.getElementById('gameOverModal');
const modalMessage = document.getElementById('modalMessage');
const retryButton = document.getElementById('retryButton');

if (gameCanvas && gameMsg) {
    const ctx2 = gameCanvas.getContext('2d');
    const heart = { x: 80, y: 250, w: 30, h: 30, vy: 0, jumping: false, gravity: 0.45 };
    const groundY = 250;
    let obstacles = [], particles = [], backgroundElements = [];
    let frame = 0, score = 0, gameSpeed = 4.0;
    let running = false;
    const compliments = [
        "You make my heart jump!", "Every moment with you is a win!", "Your smile is my favorite reward!",
        "You are my sunshine!", "I love you more with every jump!", "You are my forever player 1!",
        "You make every obstacle worth it!", "You're my lucky charm!", "With you, life's a fun game!", "You are my high score!"
    ];

    function createBackgroundElement() {
        return {
            x: Math.random() * gameCanvas.width, y: Math.random() * gameCanvas.height,
            size: Math.random() * 2 + 1, alpha: Math.random() * 0.2 + 0.1,
            speed: Math.random() * 0.4 + 0.1
        };
    }
    for (let i = 0; i < 30; i++) {
        backgroundElements.push(createBackgroundElement());
    }
    
    class Particle {
        constructor(x, y, color, speed, life) {
            this.x = x; this.y = y; this.color = color;
            this.vx = (Math.random() - 0.5) * speed;
            this.vy = (Math.random() - 0.5) * speed;
            this.life = life; this.alpha = 1;
            this.size = Math.random() * 3 + 1;
        }
        update() {
            this.x += this.vx; this.y += this.vy; this.life--;
            this.alpha = this.life / 20;
        }
        draw() {
            ctx2.save();
            ctx2.globalAlpha = this.alpha > 0 ? this.alpha : 0;
            ctx2.fillStyle = this.color;
            ctx2.beginPath();
            ctx2.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx2.fill();
            ctx2.restore();
        }
    }

    function drawPlayerHeart(x, y, size, rotation) {
        ctx2.save();
        ctx2.translate(x, y); ctx2.rotate(rotation);
        ctx2.fillStyle = '#e53935';
        ctx2.beginPath();
        const topCurveHeight = size * 0.3;
        ctx2.moveTo(0, size * 0.25);
        ctx2.bezierCurveTo(0, -topCurveHeight, -size / 2, -topCurveHeight, -size / 2, size * 0.25);
        ctx2.bezierCurveTo(-size / 2, size * 0.6, 0, size * 0.8, 0, size);
        ctx2.bezierCurveTo(0, size * 0.8, size / 2, size * 0.6, size / 2, size * 0.25);
        ctx2.bezierCurveTo(size / 2, -topCurveHeight, 0, -topCurveHeight, 0, size * 0.25);
        ctx2.fill(); ctx2.restore();
    }
    function drawBrokenHeart(x, y, size) {
        ctx2.save(); ctx2.fillStyle = '#6d4c41';
        ctx2.beginPath();
        ctx2.moveTo(x, y + size / 4); ctx2.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4);
        ctx2.bezierCurveTo(x - size / 2, y + size / 2, x, y + size / 1.2, x, y + size); ctx2.bezierCurveTo(x, y + size / 1.2, x + size / 2, y + size / 2, x + size / 2, y + size / 4);
        ctx2.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4); ctx2.closePath(); ctx2.fill();
        ctx2.strokeStyle = '#f5f5f5'; ctx2.lineWidth = 2; ctx2.beginPath(); ctx2.moveTo(x, y + size * 0.2);
        ctx2.lineTo(x - 3, y + size * 0.6); ctx2.lineTo(x + 2, y + size * 0.8); ctx2.stroke(); ctx2.restore();
    }
    function drawFlyingHeart(x, y, size) {
        const pulse = Math.sin(frame * 0.1) * 2 + size;
        ctx2.save(); ctx2.fillStyle = '#4a148c';
        ctx2.beginPath();
        const topCurveHeight = pulse * 0.3;
        ctx2.moveTo(x, y + pulse * 0.25); ctx2.bezierCurveTo(x, y - topCurveHeight, x - pulse / 2, y - topCurveHeight, x - pulse / 2, y + pulse * 0.25);
        ctx2.bezierCurveTo(x - pulse / 2, y + pulse * 0.6, x, y + pulse * 0.8, x, y + pulse); ctx2.bezierCurveTo(x, y + pulse * 0.8, x + pulse / 2, y + pulse * 0.6, x + pulse / 2, y + pulse * 0.25);
        ctx2.bezierCurveTo(x + pulse / 2, y - topCurveHeight, x, y - topCurveHeight, x, y + pulse * 0.25);
        ctx2.fill(); ctx2.restore();
    }

    function resetGame() {
        heart.y = groundY; heart.vy = 0; heart.jumping = false;
        obstacles = []; particles = []; frame = 0; score = 0; gameSpeed = 4.0;
    }

    function showStartScreen() {
        ctx2.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        drawPlayerHeart(heart.x, heart.y, heart.w, 0);
        ctx2.fillStyle = 'rgba(0,0,0,0.5)';
        ctx2.font = 'bold 30px Quicksand, sans-serif';
        ctx2.textAlign = 'center';
        ctx2.fillText('Click anywhere in this box to start!', gameCanvas.width / 2, 120);
        gameMsg.textContent = 'Help our love soar!';
    }
    
    function jump() {
        if (running && !heart.jumping) {
            heart.vy = -10.5; heart.jumping = true;
        }
    }

    function showGameOverModal() {
        const quote = "You can't escape me that easily! 💘 Even if you fall, I'll always be here to catch you. Ready for another round?";
        modalMessage.innerHTML = quote;
        gameOverModal.classList.remove('hidden');
        gameContainer.querySelector('.game-wrapper').classList.add('modal-active');
    }
    
    function update() {
        if (!running) return;
        requestAnimationFrame(update);
        let gradient = ctx2.createLinearGradient(0, 0, 0, gameCanvas.height);
        gradient.addColorStop(0, '#ffcdd2'); gradient.addColorStop(1, '#f8bbd0');
        ctx2.fillStyle = gradient; ctx2.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

        backgroundElements.forEach(el => {
            el.x -= el.speed; if (el.x < 0) el.x = gameCanvas.width;
            ctx2.beginPath(); ctx2.arc(el.x, el.y, el.size, 0, Math.PI * 2);
            ctx2.fillStyle = `rgba(255, 255, 255, ${el.alpha})`; ctx2.fill();
        });
        
        ctx2.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx2.fillRect(0, groundY + 15, gameCanvas.width, 35);
        
        heart.y += heart.vy; heart.vy += heart.gravity;
        if (heart.y >= groundY) {
            heart.y = groundY; heart.vy = 0;
            if (heart.jumping) for(let i = 0; i < 3; i++) particles.push(new Particle(heart.x, heart.y + heart.h/2, '#ffffff', 2, 20));
            heart.jumping = false;
        }
        const rotation = heart.jumping ? heart.vy * 0.03 : 0;
        drawPlayerHeart(heart.x, heart.y, heart.w, rotation);
        
        if (heart.jumping && frame % 4 === 0) particles.push(new Particle(heart.x, heart.y, '#fce4ec', 1, 20));
        
        let spawnInterval = Math.max(40, 120 - gameSpeed * 8);
        if (frame % Math.floor(spawnInterval) === 0) {
            const isFlying = Math.random() > 0.6;
            if (isFlying) {
                const flyingHeartY = groundY - (40 + Math.random() * 80);
                obstacles.push({ x: gameCanvas.width + 50, y: flyingHeartY, w: 25, h: 25, type: 'flying' });
            } else {
                obstacles.push({ x: gameCanvas.width + 50, y: groundY, w: 28, h: 28, type: 'ground' });
            }
        }
        
        obstacles.forEach((obs) => {
            obs.x -= gameSpeed;
            if (obs.type === 'flying') {
                obs.y += Math.sin(frame * 0.08) * 0.8; drawFlyingHeart(obs.x, obs.y, obs.w);
            } else {
                drawBrokenHeart(obs.x, obs.y, obs.w);
            }
            const dx = heart.x - obs.x, dy = heart.y - obs.y;
            if (Math.sqrt(dx * dx + dy * dy) < heart.w / 2 + obs.w / 2) {
                running = false; showGameOverModal();
            }
            if (!obs.passed && obs.x < heart.x) {
                obs.passed = true; score++;
                if (gameSpeed < 10) gameSpeed += 0.1;
                gameMsg.textContent = compliments[score % compliments.length];
            }
        });
        
        particles.forEach((p, i) => {
            p.update(); p.draw(); if (p.alpha <= 0) particles.splice(i, 1);
        });

        obstacles = obstacles.filter(obs => obs.x + obs.w > 0);
        frame++;
    }
    
    const bgMusic = document.getElementById('bgMusic');
    let musicPlaying = false;
    function toggleMusic() {
        if (musicPlaying) { bgMusic.pause(); } 
        else { 
            bgMusic.volume = 0.0;
            bgMusic.play().catch(()=>{});
            let fadeInterval = setInterval(() => {
            if (bgMusic.volume < 0.60) {
              bgMusic.volume = Math.min(bgMusic.volume + 0.02, 0.60);
            } else {
              clearInterval(fadeInterval);
            }
          }, 200);
        }
        musicPlaying = !musicPlaying;
    }

    function startGame() {
        resetGame(); running = true;
        gameMsg.textContent = compliments[0];
        gameOverModal.classList.add('hidden');
        gameContainer.querySelector('.game-wrapper').classList.remove('modal-active');
        // FIX: Ensure music plays if it hasn't started yet
        if (!musicPlaying) {
             try {
                bgMusic.play();
                musicPlaying = true;
             } catch(e) {
                console.log("User needs to interact to play music.");
             }
        }
        update();
    }

    // FIX: A much safer interaction handler for mobile and desktop
    function handleInteraction(e) {
        if (!running) {
            // If the game isn't running and the modal is hidden, start the game.
            // Don't prevent default, so scrolling still works.
            if (gameOverModal.classList.contains('hidden')) {
                startGame();
            }
            // If the modal is visible, do nothing here. The button's own listener will handle it.
        } else {
            // Only prevent default (scrolling) WHILE the game is active.
            e.preventDefault();
            jump();
        }
    }
    
    gameContainer.addEventListener('mousedown', handleInteraction);
    // Use 'touchstart' with passive:true where possible, but we need preventDefault for jump
    gameContainer.addEventListener('touchstart', handleInteraction, { passive: false });
    window.addEventListener('keydown', e => { if (e.code === 'Space') handleInteraction(e); });
    
    // FIX: The retry button needs its own, separate event listener that doesn't get blocked.
    retryButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Stop the event from bubbling up to the gameContainer
        startGame();
    });

    // FIX: The play button needs its own separate listener too
    document.querySelector('.play-button').addEventListener('click', (e) => {
        e.preventDefault();
        // Try to play music on the very first click
        if (!musicPlaying) {
            try {
               bgMusic.play();
               musicPlaying = true;
            } catch(e) {
               console.log("User needs to interact more to play music.");
            }
        }
        document.querySelector(e.currentTarget.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });

    showStartScreen();
}
