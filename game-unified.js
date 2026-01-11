// ============================================
// SPACE DEFENDER - SCRIPT UNIFIÉ CORRIGÉ
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Space Defender - Site et jeu initialisés');
    
    // ============================================
    // 1. GESTION DU THÈME
    // ============================================
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = themeToggle?.querySelector('i');
    
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.classList.toggle('light-theme', savedTheme === 'light');
        
        if (themeIcon) {
            themeIcon.className = savedTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    function toggleTheme() {
        const isLight = document.body.classList.toggle('light-theme');
        const newTheme = isLight ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        
        if (themeIcon) {
            themeIcon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        themeToggle.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            themeToggle.style.transform = 'rotate(0deg)';
        }, 300);
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        initTheme();
    }

    // ============================================
    // 2. NAVIGATION ET SCROLL
    // ============================================
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-link');
    const backToTop = document.querySelector('.back-to-top');
    
    // Empêcher le scroll avec la barre d'espace dans le jeu
    window.addEventListener('keydown', function(e) {
        if (e.code === 'Space' && e.target === document.body) {
            e.preventDefault();
        }
    });
    
    function toggleMobileMenu() {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        
        const hamburgers = navToggle.querySelectorAll('.hamburger');
        hamburgers.forEach((bar, index) => {
            bar.style.transform = mobileMenu.classList.contains('active') 
                ? `rotate(${45 + (90 * index)}deg) translate(${index === 1 ? '0' : '5px'}, ${index === 1 ? '0' : '-5px'})`
                : 'none';
        });
    }
    
    function smoothScroll(target) {
        const element = document.querySelector(target);
        if (element) {
            const navbarHeight = navbar.offsetHeight;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navbarHeight - 20;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            if (mobileMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        }
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            if (target.startsWith('#')) {
                smoothScroll(target);
            }
        });
    });

    if (navToggle) {
        navToggle.addEventListener('click', toggleMobileMenu);
    }

    // ============================================
    // 3. ANIMATIONS
    // ============================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                
                const counters = entry.target.querySelectorAll('.stat-number[data-count]');
                counters.forEach(counter => {
                    animateCounter(counter);
                });
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .stat-card').forEach(el => {
        observer.observe(el);
    });

    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
                element.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 200);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    // Typing animation
    const typingElement = document.querySelector('.typing-animation');
    if (typingElement) {
        const text = typingElement.textContent;
        typingElement.textContent = '';
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                typingElement.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        }
        setTimeout(typeWriter, 1000);
    }

    // ============================================
    // 4. LE JEU SPACE DEFENDER - CORRIGÉ
    // ============================================
    
    class SpaceDefenderGame {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            this.ctx = this.canvas.getContext('2d');
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            
            // Game state
            this.gameState = 'start';
            this.score = 0;
            this.lives = 3;
            this.wave = 1;
            this.maxLives = 5;
            
            // Player
            this.player = {
                x: this.width / 2,
                y: this.height - 100,
                width: 40,
                height: 60,
                speed: 6,
                color: '#00b4d8',
                invincible: false,
                invincibleTimer: 0
            };
            
            // Game objects
            this.enemies = [];
            this.bullets = [];
            this.powerUps = [];
            this.explosions = [];
            this.stars = this.createStars(150);
            
            // Game settings
            this.enemySpeed = 2;
            this.enemySpawnTimer = 0;
            this.enemySpawnDelay = 1000;
            this.bulletSpeed = 12;
            this.canShoot = true;
            this.shootDelay = 250;
            this.bulletLevel = 1;
            this.powerUpTimer = 0;
            
            // Keys
            this.keys = {};
            
            // UI Elements
            this.startScreen = document.getElementById('startScreen');
            this.pauseScreen = document.getElementById('pauseScreen');
            this.gameOverScreen = document.getElementById('gameOverScreen');
            this.scoreElement = document.getElementById('score');
            this.livesElement = document.getElementById('lives');
            this.waveElement = document.getElementById('wave');
            this.finalScoreElement = document.getElementById('finalScore');
            
            // Initialize
            this.init();
            this.setupButtonListeners();
        }
        
        createStars(count) {
            const stars = [];
            for (let i = 0; i < count; i++) {
                stars.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    size: Math.random() * 3 + 1,
                    speed: Math.random() * 0.5 + 0.2,
                    twinkle: Math.random() * 0.1 + 0.9,
                    alpha: Math.random() * 0.5 + 0.3
                });
            }
            return stars;
        }
        
        init() {
            // Empêcher le scroll avec espace
            this.canvas.addEventListener('keydown', (e) => {
                if (e.code === 'Space') {
                    e.preventDefault();
                }
            });
            
            // Focus sur le canvas pour les touches
            this.canvas.setAttribute('tabindex', '0');
            this.canvas.focus();
            
            // Game loop
            this.lastTime = performance.now();
            this.gameLoop();
        }
        
        setupButtonListeners() {
            document.getElementById('startButton')?.addEventListener('click', () => this.startGame());
            document.getElementById('resumeButton')?.addEventListener('click', () => this.resumeGame());
            document.getElementById('restartButton')?.addEventListener('click', () => this.startGame());
            document.getElementById('playAgainButton')?.addEventListener('click', () => this.startGame());
        }
        
        gameLoop(currentTime = performance.now()) {
            const deltaTime = Math.min(currentTime - this.lastTime, 32);
            this.lastTime = currentTime;
            
            this.drawBackground();
            
            switch(this.gameState) {
                case 'playing':
                    this.updatePlaying(deltaTime);
                    break;
                case 'paused':
                    this.draw();
                    break;
                case 'gameOver':
                    this.draw();
                    break;
                case 'start':
                    this.drawStartScreen();
                    break;
            }
            
            requestAnimationFrame((time) => this.gameLoop(time));
        }
        
        updatePlaying(deltaTime) {
            // Update player
            this.updatePlayer(deltaTime);
            
            // Update game objects
            this.updateEnemies(deltaTime);
            this.updateBullets(deltaTime);
            this.updatePowerUps(deltaTime);
            this.updateExplosions(deltaTime);
            this.updateStars(deltaTime);
            
            // Check collisions
            this.checkCollisions();
            
            // Update difficulty
            this.updateDifficulty();
            
            // Draw everything
            this.draw();
        }
        
        updatePlayer(deltaTime) {
            // Focus sur le canvas
            if (document.activeElement !== this.canvas) {
                this.canvas.focus();
            }
            
            // Movement
            let moveX = 0, moveY = 0;
            
            if (this.keys['z'] || this.keys['arrowup']) moveY -= 1;
            if (this.keys['s'] || this.keys['arrowdown']) moveY += 1;
            if (this.keys['q'] || this.keys['arrowleft']) moveX -= 1;
            if (this.keys['d'] || this.keys['arrowright']) moveX += 1;
            
            // Normalize diagonal movement
            if (moveX !== 0 && moveY !== 0) {
                moveX *= 0.7071;
                moveY *= 0.7071;
            }
            
            this.player.x += moveX * this.player.speed;
            this.player.y += moveY * this.player.speed;
            
            // Keep player in bounds
            this.player.x = Math.max(this.player.width/2, 
                Math.min(this.width - this.player.width/2, this.player.x));
            this.player.y = Math.max(this.player.height/2, 
                Math.min(this.height - this.player.height/2, this.player.y));
            
            // Update invincibility
            if (this.player.invincible) {
                this.player.invincibleTimer -= deltaTime;
                if (this.player.invincibleTimer <= 0) {
                    this.player.invincible = false;
                }
            }
            
            // Shooting - CORRECTION ESPACE
            if ((this.keys[' '] || this.keys['space']) && this.canShoot) {
                this.shoot();
                this.canShoot = false;
                setTimeout(() => this.canShoot = true, this.shootDelay);
            }
            
            // Pause with P
            if (this.keys['p']) {
                this.pauseGame();
                this.keys['p'] = false;
            }
        }
        
        shoot() {
            const bulletCount = Math.min(this.bulletLevel, 3);
            const spread = bulletCount > 1 ? 0.2 : 0;
            
            for (let i = 0; i < bulletCount; i++) {
                const offset = (i - (bulletCount - 1) / 2) * spread;
                
                this.bullets.push({
                    x: this.player.x + offset * 20,
                    y: this.player.y - this.player.height/2,
                    width: 6,
                    height: 20,
                    speed: this.bulletSpeed,
                    color: this.bulletLevel === 1 ? '#ffffff' : 
                           this.bulletLevel === 2 ? '#00ffaa' : '#ffaa00',
                    damage: this.bulletLevel
                });
            }
            
            // Muzzle flash
            this.createExplosion(this.player.x, this.player.y - 30, 8, '#ffffff', 0.3);
        }
        
        updateEnemies(deltaTime) {
            // Spawn new enemies
            this.enemySpawnTimer += deltaTime;
            if (this.enemySpawnTimer >= this.enemySpawnDelay) {
                this.enemySpawnTimer = 0;
                
                const enemyTypes = [
                    { type: 'basic', health: 1, value: 10, size: 30, speed: this.enemySpeed, color: '#ff4444' },
                    { type: 'fast', health: 1, value: 15, size: 25, speed: this.enemySpeed * 1.5, color: '#9370db' },
                    { type: 'tank', health: 3, value: 30, size: 50, speed: this.enemySpeed * 0.7, color: '#ff8c00' }
                ];
                
                let typeIndex = 0;
                const rand = Math.random();
                if (this.wave > 5 && rand > 0.7) typeIndex = 2;
                else if (this.wave > 3 && rand > 0.5) typeIndex = 1;
                
                const type = enemyTypes[typeIndex];
                
                this.enemies.push({
                    x: Math.random() * (this.width - type.size) + type.size/2,
                    y: -type.size,
                    width: type.size,
                    height: type.size,
                    speed: type.speed,
                    health: type.health,
                    maxHealth: type.health,
                    value: type.value,
                    color: type.color,
                    type: type.type
                });
            }
            
            // Update existing enemies
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                
                // Move with pattern
                if (enemy.type === 'fast') {
                    enemy.x += Math.sin(Date.now() * 0.002 + i) * 2;
                } else if (enemy.type === 'tank') {
                    enemy.x += Math.cos(Date.now() * 0.001 + i) * 0.5;
                }
                enemy.y += enemy.speed;
                
                // Remove if off screen
                if (enemy.y > this.height + 100) {
                    this.enemies.splice(i, 1);
                }
            }
        }
        
        updateBullets(deltaTime) {
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const bullet = this.bullets[i];
                bullet.y -= bullet.speed;
                
                // Remove if off screen
                if (bullet.y < -50) {
                    this.bullets.splice(i, 1);
                }
            }
        }
        
        updatePowerUps(deltaTime) {
            // Spawn power-ups occasionally
            this.powerUpTimer += deltaTime;
            if (this.powerUpTimer > 8000 && Math.random() < 0.02) {
                this.powerUpTimer = 0;
                
                const types = ['health', 'power', 'shield'];
                const type = types[Math.floor(Math.random() * types.length)];
                
                this.powerUps.push({
                    x: Math.random() * (this.width - 30) + 15,
                    y: -30,
                    width: 25,
                    height: 25,
                    speed: 2,
                    type: type,
                    color: type === 'health' ? '#ff4444' : 
                           type === 'power' ? '#00aaff' : '#00ff88',
                    rotation: 0,
                    rotationSpeed: Math.random() * 0.05 + 0.02
                });
            }
            
            // Update existing power-ups
            for (let i = this.powerUps.length - 1; i >= 0; i--) {
                const powerUp = this.powerUps[i];
                powerUp.y += powerUp.speed;
                powerUp.x += Math.sin(Date.now() * 0.002 + i) * 0.5;
                powerUp.rotation += powerUp.rotationSpeed;
                
                // Remove if off screen
                if (powerUp.y > this.height + 50) {
                    this.powerUps.splice(i, 1);
                }
            }
        }
        
        updateExplosions(deltaTime) {
            for (let i = this.explosions.length - 1; i >= 0; i--) {
                const explosion = this.explosions[i];
                explosion.life -= deltaTime;
                
                if (explosion.life <= 0) {
                    this.explosions.splice(i, 1);
                }
            }
        }
        
        updateStars(deltaTime) {
            this.stars.forEach(star => {
                star.y += star.speed;
                if (star.y > this.height) {
                    star.y = 0;
                    star.x = Math.random() * this.width;
                }
                star.twinkle = 0.8 + Math.sin(Date.now() * 0.001) * 0.2;
            });
        }
        
        checkCollisions() {
            // Player vs Enemies
            if (!this.player.invincible) {
                for (let i = this.enemies.length - 1; i >= 0; i--) {
                    const enemy = this.enemies[i];
                    
                    const dx = this.player.x - enemy.x;
                    const dy = this.player.y - enemy.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = (this.player.width/2 + enemy.width/2) * 0.8;
                    
                    if (distance < minDistance) {
                        this.takeDamage();
                        this.enemies.splice(i, 1);
                        this.createExplosion(enemy.x, enemy.y, enemy.width, enemy.color, 1);
                    }
                }
            }
            
            // Bullets vs Enemies
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const bullet = this.bullets[i];
                
                for (let j = this.enemies.length - 1; j >= 0; j--) {
                    const enemy = this.enemies[j];
                    
                    const dx = bullet.x - enemy.x;
                    const dy = bullet.y - enemy.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = bullet.width/2 + enemy.width/2;
                    
                    if (distance < minDistance) {
                        enemy.health -= bullet.damage;
                        
                        if (enemy.health <= 0) {
                            this.score += enemy.value;
                            this.enemies.splice(j, 1);
                            this.createExplosion(enemy.x, enemy.y, enemy.width, enemy.color, 1.5);
                            
                            // Chance to drop power-up
                            if (Math.random() < 0.2) {
                                this.createPowerUp(enemy.x, enemy.y);
                            }
                            
                            // Update score display
                            this.scoreElement.textContent = this.score;
                        }
                        
                        this.bullets.splice(i, 1);
                        this.createExplosion(bullet.x, bullet.y, 15, bullet.color, 0.5);
                        break;
                    }
                }
            }
            
            // Player vs Power-ups
            for (let i = this.powerUps.length - 1; i >= 0; i--) {
                const powerUp = this.powerUps[i];
                
                const dx = this.player.x - powerUp.x;
                const dy = this.player.y - powerUp.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = this.player.width/2 + powerUp.width/2;
                
                if (distance < minDistance) {
                    this.collectPowerUp(powerUp);
                    this.powerUps.splice(i, 1);
                }
            }
        }
        
        takeDamage() {
            this.lives--;
            this.player.invincible = true;
            this.player.invincibleTimer = 2000;
            
            // Update lives display
            this.livesElement.textContent = this.lives;
            this.livesElement.style.color = '#ff4444';
            setTimeout(() => this.livesElement.style.color = '#ffffff', 300);
            
            // Shake effect
            this.createShake(10);
            
            if (this.lives <= 0) {
                this.gameOver();
            }
        }
        
        collectPowerUp(powerUp) {
            switch(powerUp.type) {
                case 'health':
                    this.lives = Math.min(this.maxLives, this.lives + 1);
                    this.livesElement.textContent = this.lives;
                    this.createFloatingText(powerUp.x, powerUp.y, "+1 VIE", '#00ff00');
                    break;
                    
                case 'power':
                    this.bulletLevel = Math.min(3, this.bulletLevel + 1);
                    this.createFloatingText(powerUp.x, powerUp.y, "PUISSANCE +", '#00aaff');
                    break;
                    
                case 'shield':
                    this.player.invincible = true;
                    this.player.invincibleTimer = 5000;
                    this.createFloatingText(powerUp.x, powerUp.y, "BOUCLIER", '#00ff88');
                    break;
            }
            
            this.createExplosion(powerUp.x, powerUp.y, 30, powerUp.color, 0.8);
        }
        
        updateDifficulty() {
            // Increase difficulty every 100 points
            if (this.score >= this.wave * 100) {
                this.wave++;
                this.enemySpeed += 0.2;
                this.enemySpawnDelay = Math.max(400, this.enemySpawnDelay - 50);
                
                // Update wave display
                this.waveElement.textContent = this.wave;
                this.waveElement.style.color = '#ffaa00';
                setTimeout(() => this.waveElement.style.color = '#ffffff', 500);
                
                this.createFloatingText(this.width/2, 100, `VAGUE ${this.wave}`, '#ffaa00');
            }
        }
        
        // ============================================
        // DRAWING FUNCTIONS
        // ============================================
        
        drawBackground() {
            // Space gradient
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
            gradient.addColorStop(0, '#0a1128');
            gradient.addColorStop(1, '#1a1a2e');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Draw stars
            this.drawStars();
            
            // Nebula effect
            this.drawNebula();
        }
        
        drawStars() {
            this.stars.forEach(star => {
                this.ctx.globalAlpha = star.alpha * star.twinkle;
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
            this.ctx.globalAlpha = 1;
        }
        
        drawNebula() {
            this.ctx.globalAlpha = 0.1;
            this.ctx.fillStyle = '#00b4d8';
            this.ctx.beginPath();
            this.ctx.arc(this.width * 0.3, this.height * 0.7, 200, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.beginPath();
            this.ctx.arc(this.width * 0.7, this.height * 0.3, 150, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }
        
        draw() {
            // Draw power-ups
            this.powerUps.forEach(powerUp => {
                this.drawPowerUp(powerUp);
            });
            
            // Draw enemies
            this.enemies.forEach(enemy => {
                this.drawEnemy(enemy);
            });
            
            // Draw bullets
            this.bullets.forEach(bullet => {
                this.drawBullet(bullet);
            });
            
            // Draw player
            this.drawPlayer();
            
            // Draw explosions
            this.explosions.forEach(explosion => {
                this.drawExplosion(explosion);
            });
        }
        
        drawPlayer() {
            this.ctx.save();
            this.ctx.translate(this.player.x, this.player.y);
            
            // Invincibility blink
            if (this.player.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
                this.ctx.globalAlpha = 0.5;
            }
            
            // Ship body
            this.ctx.fillStyle = this.player.color;
            this.ctx.beginPath();
            this.ctx.moveTo(0, -this.player.height/2);
            this.ctx.lineTo(this.player.width/2, this.player.height/2);
            this.ctx.lineTo(-this.player.width/2, this.player.height/2);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Wings
            this.ctx.fillStyle = this.player.color.replace(')', ', 0.3)').replace('rgb', 'rgba');
            this.ctx.fillRect(-this.player.width * 0.8, this.player.height * 0.1, 
                            this.player.width * 1.6, this.player.height * 0.4);
            
            // Engine glow
            const pulse = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
            this.ctx.fillStyle = `rgba(255, 107, 107, ${pulse})`;
            this.ctx.beginPath();
            this.ctx.ellipse(0, this.player.height/2 + 8, 
                            this.player.width/3, this.player.height/4, 
                            0, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Shield if invincible
            if (this.player.invincible) {
                this.ctx.strokeStyle = `rgba(0, 255, 170, ${pulse})`;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, this.player.width * 0.6, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        }
        
        drawEnemy(enemy) {
            this.ctx.save();
            this.ctx.translate(enemy.x, enemy.y);
            
            // Enemy body with shadow
            this.ctx.shadowColor = enemy.color;
            this.ctx.shadowBlur = 15;
            this.ctx.fillStyle = enemy.color;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, enemy.width/2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            
            // Eye
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(0, -enemy.height/6, enemy.width/8, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#000000';
            this.ctx.beginPath();
            this.ctx.arc(0, -enemy.height/6, enemy.width/16, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        }
        
        drawBullet(bullet) {
            this.ctx.save();
            this.ctx.translate(bullet.x, bullet.y);
            
            // Bullet with glow
            this.ctx.shadowColor = bullet.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fillStyle = bullet.color;
            this.ctx.fillRect(-bullet.width/2, -bullet.height/2, bullet.width, bullet.height);
            this.ctx.shadowBlur = 0;
            
            // Trail
            this.ctx.fillStyle = bullet.color.replace(')', ', 0.3)').replace('rgb', 'rgba');
            this.ctx.fillRect(-bullet.width/4, bullet.height/2, bullet.width/2, 10);
            
            this.ctx.restore();
        }
        
        drawPowerUp(powerUp) {
            this.ctx.save();
            this.ctx.translate(powerUp.x, powerUp.y);
            this.ctx.rotate(powerUp.rotation);
            
            // Glow
            this.ctx.shadowColor = powerUp.color;
            this.ctx.shadowBlur = 20;
            this.ctx.fillStyle = powerUp.color;
            
            // Different shapes for different types
            switch(powerUp.type) {
                case 'health':
                    // Heart shape
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, -8);
                    this.ctx.bezierCurveTo(6, -12, 12, -6, 0, 6);
                    this.ctx.bezierCurveTo(-12, -6, -6, -12, 0, -8);
                    this.ctx.closePath();
                    this.ctx.fill();
                    break;
                    
                case 'power':
                    // Lightning bolt
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, -10);
                    this.ctx.lineTo(6, -4);
                    this.ctx.lineTo(2, -4);
                    this.ctx.lineTo(8, 6);
                    this.ctx.lineTo(0, 0);
                    this.ctx.lineTo(4, 0);
                    this.ctx.lineTo(-2, -10);
                    this.ctx.closePath();
                    this.ctx.fill();
                    break;
                    
                case 'shield':
                    // Shield
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, 10, 0, Math.PI * 2);
                    this.ctx.strokeStyle = powerUp.color;
                    this.ctx.lineWidth = 3;
                    this.ctx.stroke();
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, -8);
                    this.ctx.lineTo(-6, 0);
                    this.ctx.lineTo(6, 0);
                    this.ctx.closePath();
                    this.ctx.fill();
                    break;
            }
            
            this.ctx.shadowBlur = 0;
            this.ctx.restore();
        }
        
        drawExplosion(explosion) {
            const lifePercent = explosion.life / explosion.maxLife;
            const radius = explosion.radius * (1 - lifePercent);
            
            this.ctx.save();
            this.ctx.globalAlpha = lifePercent;
            
            // Explosion particles
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const x = explosion.x + Math.cos(angle) * radius * 1.5;
                const y = explosion.y + Math.sin(angle) * radius * 1.5;
                
                this.ctx.fillStyle = explosion.color;
                this.ctx.beginPath();
                this.ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Center glow
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(explosion.x, explosion.y, radius * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        }
        
        drawStartScreen() {
            // Draw game elements in background
            this.draw();
            
            // Overlay
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Title
            this.ctx.font = 'bold 60px Orbitron';
            this.ctx.fillStyle = '#00b4d8';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('SPACE DEFENDER', this.width/2, this.height/3);
            
            // Instructions
            this.ctx.font = '24px Exo 2';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText('Appuyez sur ESPACE pour commencer', this.width/2, this.height/2);
            
            // Controls
            this.ctx.font = '18px Exo 2';
            this.ctx.fillStyle = '#a8b2d1';
            this.ctx.fillText('ZQSD ou Flèches : Déplacement', this.width/2, this.height/2 + 60);
            this.ctx.fillText('ESPACE : Tirer', this.width/2, this.height/2 + 90);
            this.ctx.fillText('P : Pause', this.width/2, this.height/2 + 120);
        }
        
        // ============================================
        // EFFECTS FUNCTIONS
        // ============================================
        
        createExplosion(x, y, size, color, intensity = 1) {
            this.explosions.push({
                x: x,
                y: y,
                radius: size * 0.5,
                color: color,
                life: 500 * intensity,
                maxLife: 500 * intensity
            });
            
            // Screen shake for large explosions
            if (intensity > 1) {
                this.createShake(5 * intensity);
            }
        }
        
        createPowerUp(x, y) {
            const types = ['health', 'power', 'shield'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            this.powerUps.push({
                x: x,
                y: y,
                width: 25,
                height: 25,
                speed: 2,
                type: type,
                color: type === 'health' ? '#ff4444' : 
                       type === 'power' ? '#00aaff' : '#00ff88',
                rotation: 0,
                rotationSpeed: Math.random() * 0.05 + 0.02
            });
        }
        
        createFloatingText(x, y, text, color) {
            let opacity = 1;
            let yPos = y;
            let frame = 0;
            
            const animate = () => {
                if (opacity <= 0 || frame > 60) return;
                
                this.ctx.save();
                this.ctx.globalAlpha = opacity;
                this.ctx.fillStyle = color;
                this.ctx.font = 'bold 18px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(text, x, yPos);
                this.ctx.restore();
                
                opacity -= 0.016;
                yPos -= 1;
                frame++;
                
                requestAnimationFrame(animate);
            };
            
            animate();
        }
        
        createShake(intensity) {
            let shakeCount = 0;
            const maxShakes = 5;
            
            const shake = () => {
                if (shakeCount >= maxShakes) {
                    this.canvas.style.transform = 'translate(0, 0)';
                    return;
                }
                
                const shakeX = (Math.random() - 0.5) * intensity;
                const shakeY = (Math.random() - 0.5) * intensity;
                this.canvas.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
                
                shakeCount++;
                setTimeout(shake, 30);
            };
            
            shake();
        }
        
        // ============================================
        // GAME STATE FUNCTIONS
        // ============================================
        
        startGame() {
            this.gameState = 'playing';
            this.score = 0;
            this.lives = 3;
            this.wave = 1;
            this.bulletLevel = 1;
            this.enemySpeed = 2;
            this.enemySpawnDelay = 1000;
            
            this.enemies = [];
            this.bullets = [];
            this.powerUps = [];
            this.explosions = [];
            
            // Update UI
            this.scoreElement.textContent = this.score;
            this.livesElement.textContent = this.lives;
            this.waveElement.textContent = this.wave;
            this.livesElement.style.color = '#ffffff';
            this.waveElement.style.color = '#ffffff';
            
            // Hide screens
            this.startScreen.style.display = 'none';
            this.pauseScreen.style.display = 'none';
            this.gameOverScreen.style.display = 'none';
            
            // Focus on canvas
            this.canvas.focus();
            
            // Reset keys
            this.keys = {};
        }
        
        pauseGame() {
            this.gameState = 'paused';
            this.pauseScreen.style.display = 'flex';
        }
        
        resumeGame() {
            this.gameState = 'playing';
            this.pauseScreen.style.display = 'none';
            this.canvas.focus();
        }
        
        gameOver() {
            this.gameState = 'gameOver';
            this.finalScoreElement.textContent = this.score;
            this.gameOverScreen.style.display = 'flex';
        }
    }
    
    // ============================================
    // 5. INITIALISATION DU JEU
    // ============================================
    
    let game = null;
    
    // Attendre que tout soit chargé
    setTimeout(() => {
        if (document.getElementById('gameCanvas')) {
            game = new SpaceDefenderGame('gameCanvas');
            
            // Gestion des touches GLOBALES
            window.addEventListener('keydown', function(e) {
                // Empêcher le scroll avec espace
                if (e.code === 'Space' && e.target === document.body) {
                    e.preventDefault();
                }
                
                // Démarrer le jeu avec espace sur l'écran de démarrage
                if (e.code === 'Space' && game && game.gameState === 'start') {
                    e.preventDefault();
                    game.startGame();
                }
                
                // Pause avec P
                if (e.code === 'KeyP' && game && game.gameState === 'playing') {
                    e.preventDefault();
                    game.pauseGame();
                }
                
                // Reprendre avec P en pause
                if (e.code === 'KeyP' && game && game.gameState === 'paused') {
                    e.preventDefault();
                    game.resumeGame();
                }
                
                // Enregistrer les touches pour le jeu
                if (game && game.gameState === 'playing') {
                    game.keys[e.key.toLowerCase()] = true;
                    game.keys[e.code.toLowerCase()] = true;
                }
            });
            
            window.addEventListener('keyup', function(e) {
                if (game && game.gameState === 'playing') {
                    game.keys[e.key.toLowerCase()] = false;
                    game.keys[e.code.toLowerCase()] = false;
                }
            });
            
            console.log('🎮 Jeu Space Defender initialisé !');
        }
    }, 1000);
    
    // ============================================
    // 6. ÉVÉNEMENTS GLOBAUX
    // ============================================
    
    // Gestion du scroll pour la navbar
    window.addEventListener('scroll', function() {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
        backToTop.classList.toggle('visible', window.scrollY > 500);
    });
    
    // Back to top
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Initialisation finale
    console.log('✅ Space Defender prêt !');
});