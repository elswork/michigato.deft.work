document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Configuración del Canvas
    canvas.width = 800;
    canvas.height = 600;

    // Estado del Juego
    const gameState = {
        isRunning: false,
        score: 0,
        lives: 3,
        level: 1,
        projectiles: [],
        bubbles: [],
        particles: [],
        selectedCharacter: 'obama' // Default
    };

    // Assets
    const assets = {
        obama: new Image(),
        mushroom: new Image(),
        trippi: new Image()
    };

    let assetsLoaded = 0;
    const totalAssets = 3;

    function loadAssets() {
        return new Promise((resolve) => {
            const checkLoad = () => {
                assetsLoaded++;
                if (assetsLoaded === totalAssets) resolve();
            };

            assets.obama.src = 'img/Obama-removebg-preview.png';
            assets.obama.onload = checkLoad;

            assets.mushroom.src = 'img/Mushroom-Fungi-removebg-preview.png';
            assets.mushroom.onload = checkLoad;

            assets.trippi.src = 'img/Trippi-Tropp__1_-removebg-preview.png';
            assets.trippi.onload = checkLoad;
        });
    }

    // Selección de Personaje UI
    const charBtns = document.querySelectorAll('.char-btn');
    charBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            charBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            gameState.selectedCharacter = btn.dataset.char;
            // Actualizar sprite del jugador si ya existe
            if (player) {
                player.updateSprite();
            }
        });
    });

    // Clases
    class Player {
        constructor() {
            this.width = 96;
            this.height = 144;
            this.x = canvas.width / 2 - this.width / 2;
            this.y = canvas.height - this.height;
            this.speed = 5;
            this.isMovingLeft = false;
            this.isMovingRight = false;
            this.canShoot = true;
            this.updateSprite();
        }

        updateSprite() {
            this.sprite = assets[gameState.selectedCharacter];
        }

        update() {
            if (this.isMovingLeft && this.x > 0) {
                this.x -= this.speed;
            }
            if (this.isMovingRight && this.x < canvas.width - this.width) {
                this.x += this.speed;
            }
        }

        draw() {
            if (this.sprite) {
                ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
            }
        }

        shoot() {
            if (this.canShoot) {
                if (gameState.projectiles.length === 0) {
                    gameState.projectiles.push(new Projectile(this.x + this.width / 2, this.y));
                }
            }
        }
    }

    class Projectile {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.width = 4;
            this.speed = 7;
            this.active = true;
        }

        update() {
            this.y -= this.speed;
            if (this.y < 0) {
                this.active = false;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, canvas.height);
            ctx.strokeStyle = '#00e5ff';
            ctx.lineWidth = this.width;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(this.x - 5, this.y + 10);
            ctx.lineTo(this.x, this.y);
            ctx.lineTo(this.x + 5, this.y + 10);
            ctx.strokeStyle = '#00e5ff';
            ctx.stroke();
        }
    }

    class Bubble {
        constructor(x, y, radius, speedX, speedY) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.speedX = speedX;
            this.speedY = speedY;
            this.gravity = 0.2;
            this.bounce = -11;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.speedY += this.gravity;

            if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
                this.speedX *= -1;
            }

            if (this.y + this.radius > canvas.height) {
                this.y = canvas.height - this.radius;
                this.speedY = this.bounce;
                if (this.radius < 30) this.speedY = -9;
            }
        }

        draw() {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

            // Relleno verde con gradiente
            const gradient = ctx.createRadialGradient(this.x - this.radius / 3, this.y - this.radius / 3, this.radius / 10, this.x, this.y, this.radius);
            gradient.addColorStop(0, '#00ff00');
            gradient.addColorStop(1, '#004400');
            ctx.fillStyle = gradient;
            ctx.fill();

            // Borde brillante
            ctx.strokeStyle = '#ccffcc';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Brillo
            ctx.beginPath();
            ctx.arc(this.x - this.radius / 3, this.y - this.radius / 3, this.radius / 4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fill();

            ctx.restore();
        }
    }

    // Inicialización
    const player = new Player();

    function initGame() {
        gameState.bubbles = [];
        gameState.bubbles.push(new Bubble(100, 100, 40, 2, 0));
        gameState.bubbles.push(new Bubble(700, 100, 40, -2, 0));
        gameState.isRunning = true;
        gameLoop();
    }

    // Input Handling
    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyA' || e.code === 'ArrowLeft') player.isMovingLeft = true;
        if (e.code === 'KeyD' || e.code === 'ArrowRight') player.isMovingRight = true;
        if (e.code === 'Space' || e.code === 'KeyW') {
            if (!gameState.isRunning) {
                document.getElementById('start-screen').classList.add('hidden');
                document.getElementById('game-over-screen').classList.add('hidden');
                if (gameState.lives <= 0) {
                    gameState.lives = 3;
                    gameState.score = 0;
                    initGame();
                } else if (!gameState.isRunning && gameState.bubbles.length === 0) {
                    initGame();
                }
            } else {
                player.shoot();
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'KeyA' || e.code === 'ArrowLeft') player.isMovingLeft = false;
        if (e.code === 'KeyD' || e.code === 'ArrowRight') player.isMovingRight = false;
    });

    // Detección de Colisiones
    function checkCollisions() {
        // Proyectiles con Burbujas
        for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
            const p = gameState.projectiles[i];
            for (let j = gameState.bubbles.length - 1; j >= 0; j--) {
                const b = gameState.bubbles[j];

                if (p.active &&
                    b.x + b.radius > p.x - 2 &&
                    b.x - b.radius < p.x + 2 &&
                    b.y + b.radius > p.y) {

                    p.active = false;
                    splitBubble(j);
                    gameState.score += 100;
                    document.getElementById('score').innerText = `Puntuación: ${gameState.score}`;
                    break;
                }
            }
        }

        // Burbujas con Jugador
        for (let i = 0; i < gameState.bubbles.length; i++) {
            const b = gameState.bubbles[i];

            // Hitbox del jugador más pequeña que el sprite para mayor precisión visual
            const hitboxWidth = player.width * 0.4;
            const hitboxHeight = player.height * 0.7;
            const hitboxX = player.x + (player.width - hitboxWidth) / 2;
            const hitboxY = player.y + (player.height - hitboxHeight); // Alineado abajo

            const distX = Math.abs(b.x - (hitboxX + hitboxWidth / 2));
            const distY = Math.abs(b.y - (hitboxY + hitboxHeight / 2));

            if (distX > (hitboxWidth / 2 + b.radius)) { continue; }
            if (distY > (hitboxHeight / 2 + b.radius)) { continue; }

            if (distX <= (hitboxWidth / 2)) { handlePlayerHit(); break; }
            if (distY <= (hitboxHeight / 2)) { handlePlayerHit(); break; }

            const dx = distX - hitboxWidth / 2;
            const dy = distY - hitboxHeight / 2;
            if (dx * dx + dy * dy <= (b.radius * b.radius)) {
                handlePlayerHit();
                break;
            }
        }
    }

    function splitBubble(index) {
        const b = gameState.bubbles[index];
        gameState.bubbles.splice(index, 1);

        if (b.radius > 10) {
            const newRadius = b.radius / 2;
            gameState.bubbles.push(new Bubble(b.x, b.y, newRadius, 2, -5));
            gameState.bubbles.push(new Bubble(b.x, b.y, newRadius, -2, -5));
        }

        if (gameState.bubbles.length === 0) {
            setTimeout(() => {
                alert("¡Nivel Completado!");
                initGame();
            }, 1000);
        }
    }

    function handlePlayerHit() {
        gameState.lives--;
        document.getElementById('lives').innerText = `Vidas: ${gameState.lives}`;
        gameState.isRunning = false;

        if (gameState.lives > 0) {
            player.x = canvas.width / 2 - player.width / 2;
            gameState.projectiles = [];
            setTimeout(() => {
                gameState.isRunning = true;
                gameLoop();
            }, 2000);
        } else {
            document.getElementById('game-over-screen').classList.remove('hidden');
        }
    }

    function gameLoop() {
        if (!gameState.isRunning) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        player.update();
        player.draw();

        for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
            const p = gameState.projectiles[i];
            p.update();
            p.draw();
            if (!p.active) {
                gameState.projectiles.splice(i, 1);
            }
        }

        for (let i = 0; i < gameState.bubbles.length; i++) {
            gameState.bubbles[i].update();
            gameState.bubbles[i].draw();
        }

        checkCollisions();

        requestAnimationFrame(gameLoop);
    }

    loadAssets().then(() => {
        console.log('Assets loaded');
    });
});
