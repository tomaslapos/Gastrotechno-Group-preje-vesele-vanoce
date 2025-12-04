// Gastrotechnogroup Christmas Game
// 2D Side-scrolling Platformer

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Configuration
const GAME_WIDTH = 1200;
const GAME_HEIGHT = 600;
const GRAVITY = 0.6;
const JUMP_FORCE = -14;
const MOVE_SPEED = 6;
const LEVEL_WIDTH = 13600;
const GAME_TIME = 120;

// Game State
let gameState = 'start'; // start, playing, win, gameover
let timeRemaining = GAME_TIME;
let collectiblesCount = 0;
let cameraX = 0;

// Colors from Gastrotechnogroup logo
const COLORS = {
    red: '#c81e1e',
    darkRed: '#a01818',
    yellow: '#FFD700',
    black: '#1a1a1a',
    white: '#ffffff',
    snow: '#e8f0f8',
    sky: '#1a3a5c'
};

// Load equipment images for under the tree
const equipmentImages = [];
const equipmentUrls = [
    'https://gastrotechnogroup.cz/wp-content/uploads/2025/01/konvektprofil-400x284.png',
    'https://gastrotechnogroup.cz/wp-content/uploads/2022/11/narezove-stroje-400x284.png',
    'https://gastrotechnogroup.cz/wp-content/uploads/2025/01/jipa-400x284.png',
    'https://gastrotechnogroup.cz/wp-content/uploads/2022/11/lednice-400x284.png',
    'https://gastrotechnogroup.cz/wp-content/uploads/2022/11/mlynky-na-maso-400x284.png'
];

let imagesLoaded = 0;
const totalImages = equipmentUrls.length;

function onImageLoad() {
    imagesLoaded++;
    const loadingText = document.getElementById('loadingText');
    if (loadingText) {
        const percent = Math.round((imagesLoaded / totalImages) * 100);
        loadingText.textContent = `Načítání obrázků... ${percent}%`;
    }
    if (imagesLoaded >= totalImages) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        document.getElementById('startScreen').style.display = 'flex';
    }
}

// Load all equipment images
equipmentUrls.forEach(url => {
    const img = new Image();
    img.onload = onImageLoad;
    img.onerror = onImageLoad; // Continue even if fails
    img.src = url;
    equipmentImages.push(img);
});

// Snowflakes
let snowflakes = [];
for (let i = 0; i < 150; i++) {
    snowflakes.push({
        x: Math.random() * LEVEL_WIDTH,
        y: Math.random() * GAME_HEIGHT,
        size: Math.random() * 4 + 1,
        speed: Math.random() * 2 + 1,
        wind: Math.random() * 0.5 - 0.25
    });
}

// Player
const player = {
    x: 100,
    y: 400,
    width: 40,
    height: 70,
    velocityX: 0,
    velocityY: 0,
    onGround: false,
    direction: 1,
    walking: false,
    walkFrame: 0,
    walkTimer: 0,
    autoWalk: false
};

// Platforms (ground segments)
const platforms = [];

// Create ground with gaps
function createLevel() {
    platforms.length = 0;
    collectibles.length = 0;
    obstacles.length = 0;
    
    // Ground segments with gaps (pits) - 2x longer level
    const groundSegments = [
        { x: 0, width: 800 },
        { x: 900, width: 600 },
        { x: 1600, width: 500 },
        { x: 2200, width: 700 },
        { x: 3000, width: 600 },
        { x: 3700, width: 500 },
        { x: 4300, width: 600 },
        { x: 5000, width: 700 },
        // New segments for extended level
        { x: 5800, width: 600 },
        { x: 6500, width: 500 },
        { x: 7100, width: 700 },
        { x: 7900, width: 600 },
        { x: 8600, width: 500 },
        { x: 9200, width: 600 },
        { x: 9900, width: 700 },
        { x: 10700, width: 600 },
        { x: 11400, width: 2200 }
    ];
    
    groundSegments.forEach(seg => {
        platforms.push({
            x: seg.x,
            y: GAME_HEIGHT - 80,
            width: seg.width,
            height: 80,
            type: 'ground'
        });
    });
    
    // Floating platforms - extended for longer level
    const floatingPlatforms = [
        { x: 400, y: 380, width: 120 },
        { x: 1200, y: 350, width: 150 },
        { x: 1800, y: 320, width: 100 },
        { x: 2600, y: 380, width: 130 },
        { x: 3300, y: 340, width: 120 },
        { x: 4000, y: 360, width: 140 },
        { x: 4600, y: 320, width: 100 },
        // New platforms for extended level
        { x: 5400, y: 350, width: 130 },
        { x: 6100, y: 380, width: 120 },
        { x: 6800, y: 340, width: 100 },
        { x: 7500, y: 360, width: 140 },
        { x: 8200, y: 320, width: 120 },
        { x: 8900, y: 380, width: 130 },
        { x: 9600, y: 350, width: 100 },
        { x: 10300, y: 340, width: 120 },
        { x: 11000, y: 360, width: 140 }
    ];
    
    floatingPlatforms.forEach(p => {
        platforms.push({
            x: p.x,
            y: p.y,
            width: p.width,
            height: 25,
            type: 'floating'
        });
    });
    
    // Create obstacles (red crates) - extended for longer level
    const obstaclePositions = [
        // Single crates
        { x: 300, y: GAME_HEIGHT - 80 - 50, type: 'single' },
        { x: 1000, y: GAME_HEIGHT - 80 - 50, type: 'single' },
        { x: 2400, y: GAME_HEIGHT - 80 - 50, type: 'single' },
        { x: 3200, y: GAME_HEIGHT - 80 - 50, type: 'single' },
        { x: 4500, y: GAME_HEIGHT - 80 - 50, type: 'single' },
        { x: 5300, y: GAME_HEIGHT - 80 - 50, type: 'single' },
        { x: 6200, y: GAME_HEIGHT - 80 - 50, type: 'single' },
        { x: 7300, y: GAME_HEIGHT - 80 - 50, type: 'single' },
        { x: 8400, y: GAME_HEIGHT - 80 - 50, type: 'single' },
        { x: 9500, y: GAME_HEIGHT - 80 - 50, type: 'single' },
        { x: 10600, y: GAME_HEIGHT - 80 - 50, type: 'single' },
        // Stacked (2 high)
        { x: 600, y: GAME_HEIGHT - 80 - 50, type: 'stacked2' },
        { x: 1400, y: GAME_HEIGHT - 80 - 50, type: 'stacked2' },
        { x: 2800, y: GAME_HEIGHT - 80 - 50, type: 'stacked2' },
        { x: 3900, y: GAME_HEIGHT - 80 - 50, type: 'stacked2' },
        { x: 5900, y: GAME_HEIGHT - 80 - 50, type: 'stacked2' },
        { x: 6800, y: GAME_HEIGHT - 80 - 50, type: 'stacked2' },
        { x: 7900, y: GAME_HEIGHT - 80 - 50, type: 'stacked2' },
        { x: 9000, y: GAME_HEIGHT - 80 - 50, type: 'stacked2' },
        { x: 10100, y: GAME_HEIGHT - 80 - 50, type: 'stacked2' },
        // Pyramids
        { x: 1900, y: GAME_HEIGHT - 80 - 50, type: 'pyramid' },
        { x: 3500, y: GAME_HEIGHT - 80 - 50, type: 'pyramid' },
        { x: 6400, y: GAME_HEIGHT - 80 - 50, type: 'pyramid' },
        { x: 8500, y: GAME_HEIGHT - 80 - 50, type: 'pyramid' },
        { x: 10800, y: GAME_HEIGHT - 80 - 50, type: 'pyramid' }
    ];
    
    obstaclePositions.forEach(obs => {
        if (obs.type === 'single') {
            obstacles.push({ x: obs.x, y: obs.y, width: 50, height: 50 });
        } else if (obs.type === 'stacked2') {
            obstacles.push({ x: obs.x, y: obs.y, width: 50, height: 50 });
            obstacles.push({ x: obs.x, y: obs.y - 50, width: 50, height: 50 });
        } else if (obs.type === 'pyramid') {
            // Bottom row
            obstacles.push({ x: obs.x, y: obs.y, width: 50, height: 50 });
            obstacles.push({ x: obs.x + 50, y: obs.y, width: 50, height: 50 });
            obstacles.push({ x: obs.x + 100, y: obs.y, width: 50, height: 50 });
            // Middle row
            obstacles.push({ x: obs.x + 25, y: obs.y - 50, width: 50, height: 50 });
            obstacles.push({ x: obs.x + 75, y: obs.y - 50, width: 50, height: 50 });
            // Top
            obstacles.push({ x: obs.x + 50, y: obs.y - 100, width: 50, height: 50 });
        }
    });
    
    // Create collectibles (screwdriver, wrench, hammer, nut, screw) - spread over longer level
    const collectiblePositions = [
        { x: 250, y: 400, type: 'screwdriver' },
        { x: 700, y: 450, type: 'wrench' },
        { x: 1250, y: 300, type: 'hammer' },
        { x: 2500, y: 400, type: 'nut' },
        { x: 3800, y: 450, type: 'screw' },
        { x: 5500, y: 400, type: 'screwdriver' },
        { x: 6800, y: 290, type: 'wrench' },
        { x: 8200, y: 430, type: 'hammer' },
        { x: 9600, y: 300, type: 'nut' },
        { x: 11000, y: 400, type: 'screw' }
    ];
    
    collectiblePositions.forEach(c => {
        collectibles.push({
            x: c.x,
            y: c.y,
            width: 60,
            height: 60,
            type: c.type,
            collected: false,
            floatOffset: Math.random() * Math.PI * 2
        });
    });
}

// Obstacles array
const obstacles = [];

// Collectibles array
const collectibles = [];

// Finish line and Christmas tree - moved for longer level
const finishLine = {
    x: 12000,
    treeX: 12200
};

// Input handling
const keys = {
    left: false,
    right: false,
    jump: false
};

document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'Space') {
        e.preventDefault();
        keys.jump = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'Space') keys.jump = false;
});

// Collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Update player
function updatePlayer() {
    if (gameState !== 'playing') return;
    
    // Auto walk to tree after finish
    if (player.autoWalk) {
        player.velocityX = MOVE_SPEED * 0.7;
        player.direction = 1;
        player.walking = true;
        
        if (player.x >= finishLine.treeX - 50) {
            player.velocityX = 0;
            player.walking = false;
            showWinScreen();
            return;
        }
    } else {
        // Normal controls
        if (keys.left) {
            player.velocityX = -MOVE_SPEED;
            player.direction = -1;
            player.walking = true;
        } else if (keys.right) {
            player.velocityX = MOVE_SPEED;
            player.direction = 1;
            player.walking = true;
        } else {
            player.velocityX = 0;
            player.walking = false;
        }
        
        if (keys.jump && player.onGround) {
            player.velocityY = JUMP_FORCE;
            player.onGround = false;
        }
    }
    
    // Apply gravity
    player.velocityY += GRAVITY;
    
    // Move player
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Prevent going left of start
    if (player.x < 0) player.x = 0;
    
    // Check ground collision
    player.onGround = false;
    
    platforms.forEach(platform => {
        if (checkCollision(
            { x: player.x, y: player.y, width: player.width, height: player.height },
            platform
        )) {
            // Landing on top
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y + 5) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.onGround = true;
            }
        }
    });
    
    // Check obstacle collision (must jump over - can't walk through)
    obstacles.forEach(obstacle => {
        const playerRect = { x: player.x + 5, y: player.y, width: player.width - 10, height: player.height };
        
        if (checkCollision(playerRect, obstacle)) {
            // Calculate overlap
            const overlapLeft = (player.x + player.width - 5) - obstacle.x;
            const overlapRight = (obstacle.x + obstacle.width) - (player.x + 5);
            const overlapTop = (player.y + player.height) - obstacle.y;
            const overlapBottom = (obstacle.y + obstacle.height) - player.y;
            
            // Find smallest overlap to determine collision side
            const minOverlapX = Math.min(overlapLeft, overlapRight);
            const minOverlapY = Math.min(overlapTop, overlapBottom);
            
            if (minOverlapY < minOverlapX) {
                // Vertical collision
                if (overlapTop < overlapBottom && player.velocityY >= 0) {
                    // Landing on top
                    player.y = obstacle.y - player.height;
                    player.velocityY = 0;
                    player.onGround = true;
                } else if (overlapBottom < overlapTop && player.velocityY < 0) {
                    // Hit from below
                    player.y = obstacle.y + obstacle.height;
                    player.velocityY = 0;
                }
            } else {
                // Horizontal collision - BLOCK the player
                if (overlapLeft < overlapRight) {
                    // Hit from left side - push player back
                    player.x = obstacle.x - player.width + 5;
                    player.velocityX = 0;
                } else {
                    // Hit from right side - push player back
                    player.x = obstacle.x + obstacle.width - 5;
                    player.velocityX = 0;
                }
            }
        }
    });
    
    // Check collectibles
    collectibles.forEach(collectible => {
        if (!collectible.collected && checkCollision(
            { x: player.x, y: player.y, width: player.width, height: player.height },
            collectible
        )) {
            collectible.collected = true;
            collectiblesCount++;
            updateUI();
        }
    });
    
    // Check fall into pit
    if (player.y > GAME_HEIGHT + 100) {
        gameOver('Spadl jste do propasti!');
    }
    
    // Check finish line (without autoWalk)
    if (!player.autoWalk && player.x >= finishLine.x) {
        player.autoWalk = true;
    }
    
    // Update walk animation
    if (player.walking) {
        player.walkTimer++;
        if (player.walkTimer > 8) {
            player.walkTimer = 0;
            player.walkFrame = (player.walkFrame + 1) % 4;
        }
    } else {
        player.walkFrame = 0;
    }
    
    // Update camera
    cameraX = Math.max(0, Math.min(player.x - GAME_WIDTH / 3, LEVEL_WIDTH - GAME_WIDTH));
}

// Update snowflakes
function updateSnowflakes() {
    snowflakes.forEach(flake => {
        flake.y += flake.speed;
        flake.x += flake.wind;
        
        if (flake.y > GAME_HEIGHT) {
            flake.y = -10;
            flake.x = Math.random() * LEVEL_WIDTH;
        }
    });
}

// Draw functions
function drawBackground() {
    // Sky gradient - lighter blue tones
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#4a7cb8');
    gradient.addColorStop(0.4, '#6a9cd8');
    gradient.addColorStop(0.7, '#8ab8e8');
    gradient.addColorStop(1, '#b8d8f8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Mountains in background - lighter colors
    ctx.fillStyle = '#7090b0';
    for (let i = 0; i < 5; i++) {
        const x = (i * 400 - cameraX * 0.2) % (GAME_WIDTH + 400) - 200;
        drawMountain(x, GAME_HEIGHT - 200, 300, 250);
    }
    
    ctx.fillStyle = '#88a8c8';
    for (let i = 0; i < 7; i++) {
        const x = (i * 300 - cameraX * 0.4) % (GAME_WIDTH + 300) - 150;
        drawMountain(x, GAME_HEIGHT - 150, 200, 180);
    }
    
    // Trees in background
    for (let i = 0; i < 10; i++) {
        const x = (i * 250 - cameraX * 0.5) % (GAME_WIDTH + 250) - 100;
        drawBackgroundTree(x, GAME_HEIGHT - 120, 0.5);
    }
}

function drawMountain(x, y, width, height) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width / 2, y - height);
    ctx.lineTo(x + width, y);
    ctx.closePath();
    ctx.fill();
    
    // Snow cap
    ctx.fillStyle = '#e8f0f8';
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y - height);
    ctx.lineTo(x + width / 2 - 30, y - height + 50);
    ctx.lineTo(x + width / 2 + 30, y - height + 50);
    ctx.closePath();
    ctx.fill();
}

function drawBackgroundTree(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    // Tree trunk
    ctx.fillStyle = '#5a4030';
    ctx.fillRect(-10, -20, 20, 40);
    
    // Tree layers - nice green
    ctx.fillStyle = '#2a6a4a';
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, -160 + i * 40);
        ctx.lineTo(-50 - i * 15, -80 + i * 40);
        ctx.lineTo(50 + i * 15, -80 + i * 40);
        ctx.closePath();
        ctx.fill();
    }
    
    // Snow on tree
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, -160 + i * 40);
        ctx.lineTo(-30 - i * 10, -120 + i * 40);
        ctx.lineTo(30 + i * 10, -120 + i * 40);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.restore();
}

function drawSnowflakes() {
    ctx.fillStyle = '#ffffff';
    snowflakes.forEach(flake => {
        const screenX = flake.x - cameraX;
        if (screenX > -10 && screenX < GAME_WIDTH + 10) {
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(screenX, flake.y, flake.size, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    ctx.globalAlpha = 1;
}

function drawPlatforms() {
    platforms.forEach(platform => {
        const screenX = platform.x - cameraX;
        if (screenX > -platform.width && screenX < GAME_WIDTH) {
            if (platform.type === 'ground') {
                // Snow ground
                const groundGradient = ctx.createLinearGradient(0, platform.y, 0, platform.y + platform.height);
                groundGradient.addColorStop(0, '#e8f0f8');
                groundGradient.addColorStop(0.3, '#c8d8e8');
                groundGradient.addColorStop(1, '#8a9aa8');
                ctx.fillStyle = groundGradient;
                ctx.fillRect(screenX, platform.y, platform.width, platform.height);
                
                // Snow texture on top
                ctx.fillStyle = '#ffffff';
                for (let i = 0; i < platform.width; i += 20) {
                    ctx.beginPath();
                    ctx.arc(screenX + i + 10, platform.y + 5, 8, 0, Math.PI, true);
                    ctx.fill();
                }
                
                // Dirt/rock edge
                ctx.fillStyle = '#5a4a3a';
                ctx.fillRect(screenX, platform.y + 20, platform.width, platform.height - 20);
                
            } else {
                // Floating platform (wooden plank with snow)
                ctx.fillStyle = '#6a4a2a';
                ctx.fillRect(screenX, platform.y, platform.width, platform.height);
                
                // Wood grain
                ctx.strokeStyle = '#5a3a1a';
                ctx.lineWidth = 1;
                for (let i = 0; i < platform.width; i += 15) {
                    ctx.beginPath();
                    ctx.moveTo(screenX + i, platform.y);
                    ctx.lineTo(screenX + i, platform.y + platform.height);
                    ctx.stroke();
                }
                
                // Snow on top
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(screenX, platform.y - 5, platform.width, 8);
            }
        }
    });
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        const screenX = obstacle.x - cameraX;
        if (screenX > -obstacle.width && screenX < GAME_WIDTH) {
            // Red crate
            const crateGradient = ctx.createLinearGradient(screenX, obstacle.y, screenX + obstacle.width, obstacle.y);
            crateGradient.addColorStop(0, '#d82828');
            crateGradient.addColorStop(0.5, '#c81e1e');
            crateGradient.addColorStop(1, '#a81818');
            ctx.fillStyle = crateGradient;
            ctx.fillRect(screenX, obstacle.y, obstacle.width, obstacle.height);
            
            // Crate border
            ctx.strokeStyle = '#8a1010';
            ctx.lineWidth = 3;
            ctx.strokeRect(screenX + 2, obstacle.y + 2, obstacle.width - 4, obstacle.height - 4);
            
            // X pattern
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(screenX + 8, obstacle.y + 8);
            ctx.lineTo(screenX + obstacle.width - 8, obstacle.y + obstacle.height - 8);
            ctx.moveTo(screenX + obstacle.width - 8, obstacle.y + 8);
            ctx.lineTo(screenX + 8, obstacle.y + obstacle.height - 8);
            ctx.stroke();
            
            // Snow on top
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(screenX + obstacle.width / 2, obstacle.y, obstacle.width / 2 - 5, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function drawCollectibles() {
    const time = Date.now() / 1000;
    
    collectibles.forEach(collectible => {
        if (collectible.collected) return;
        
        const screenX = collectible.x - cameraX;
        if (screenX < -50 || screenX > GAME_WIDTH + 50) return;
        
        const floatY = collectible.y + Math.sin(time * 3 + collectible.floatOffset) * 5;
        
        ctx.save();
        ctx.translate(screenX + collectible.width / 2, floatY + collectible.height / 2);
        
        // Glow effect
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 15;
        
        if (collectible.type === 'screwdriver') {
            drawScrewdriver(0, 0);
        } else if (collectible.type === 'wrench') {
            drawWrench(0, 0);
        } else if (collectible.type === 'hammer') {
            drawHammer(0, 0);
        } else if (collectible.type === 'nut') {
            drawNut(0, 0);
        } else if (collectible.type === 'screw') {
            drawScrew(0, 0);
        }
        
        ctx.restore();
    });
}

function drawWrench(x, y) {
    ctx.fillStyle = '#c0c0c0';
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 2;
    
    // Wrench head (open end)
    ctx.beginPath();
    ctx.moveTo(x - 25, y - 12);
    ctx.lineTo(x - 15, y - 8);
    ctx.lineTo(x - 15, y + 8);
    ctx.lineTo(x - 25, y + 12);
    ctx.lineTo(x - 30, y + 6);
    ctx.lineTo(x - 22, y);
    ctx.lineTo(x - 30, y - 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Wrench shaft
    ctx.fillRect(x - 15, y - 5, 30, 10);
    ctx.strokeRect(x - 15, y - 5, 30, 10);
    
    // Wrench head (box end)
    ctx.beginPath();
    ctx.arc(x + 20, y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Box end hole (hexagon)
    ctx.fillStyle = '#404040';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (i * 60) * Math.PI / 180;
        const px = x + 20 + Math.cos(angle) * 6;
        const py = y + Math.sin(angle) * 6;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
}

function drawHammer(x, y) {
    // Handle (wooden)
    ctx.fillStyle = '#8B4513';
    ctx.strokeStyle = '#5D2E0C';
    ctx.lineWidth = 2;
    ctx.save();
    ctx.rotate(-0.3);
    ctx.fillRect(x - 5, y - 5, 35, 10);
    ctx.strokeRect(x - 5, y - 5, 35, 10);
    ctx.restore();
    
    // Metal head
    ctx.fillStyle = '#707070';
    ctx.strokeStyle = '#404040';
    ctx.beginPath();
    ctx.rect(x - 28, y - 18, 28, 20);
    ctx.fill();
    ctx.stroke();
    
    // Head highlight
    ctx.fillStyle = '#909090';
    ctx.fillRect(x - 26, y - 16, 8, 16);
    
    // Claw part
    ctx.fillStyle = '#707070';
    ctx.beginPath();
    ctx.moveTo(x - 28, y - 18);
    ctx.lineTo(x - 38, y - 25);
    ctx.lineTo(x - 35, y - 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x - 28, y + 2);
    ctx.lineTo(x - 38, y + 9);
    ctx.lineTo(x - 35, y + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawScrew(x, y) {
    ctx.fillStyle = '#a0a0a0';
    ctx.strokeStyle = '#606060';
    ctx.lineWidth = 2;
    
    // Screw head
    ctx.beginPath();
    ctx.arc(x, y - 12, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Phillips head slot
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 7, y - 12);
    ctx.lineTo(x + 7, y - 12);
    ctx.moveTo(x, y - 19);
    ctx.lineTo(x, y - 5);
    ctx.stroke();
    
    // Screw shaft with threads
    ctx.fillStyle = '#909090';
    ctx.fillRect(x - 4, y - 2, 8, 25);
    
    // Thread lines
    ctx.strokeStyle = '#606060';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(x - 6, y + 2 + i * 5);
        ctx.lineTo(x + 6, y + 2 + i * 5);
        ctx.stroke();
    }
    
    // Pointed tip
    ctx.fillStyle = '#909090';
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 23);
    ctx.lineTo(x, y + 30);
    ctx.lineTo(x + 4, y + 23);
    ctx.closePath();
    ctx.fill();
}

function drawScrewdriver(x, y) {
    // Handle - 2x larger
    ctx.fillStyle = COLORS.red;
    ctx.beginPath();
    ctx.roundRect(x - 24, y - 10, 28, 20, 6);
    ctx.fill();
    
    // Handle stripes
    ctx.fillStyle = COLORS.black;
    ctx.fillRect(x - 20, y - 10, 4, 20);
    ctx.fillRect(x - 12, y - 10, 4, 20);
    
    // Metal shaft - 2x larger
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(x + 4, y - 4, 24, 8);
    
    // Tip - 2x larger
    ctx.fillStyle = '#a0a0a0';
    ctx.beginPath();
    ctx.moveTo(x + 28, y - 6);
    ctx.lineTo(x + 36, y);
    ctx.lineTo(x + 28, y + 6);
    ctx.closePath();
    ctx.fill();
}

function drawNut(x, y) {
    ctx.fillStyle = '#c0c0c0';
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 3;
    
    // Hexagon - 2x larger
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (i * 60 - 30) * Math.PI / 180;
        const px = x + Math.cos(angle) * 24;
        const py = y + Math.sin(angle) * 24;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Center hole - 2x larger
    ctx.fillStyle = '#404040';
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
}

function drawPlayer() {
    const screenX = player.x - cameraX;
    
    ctx.save();
    ctx.translate(screenX + player.width / 2, player.y + player.height);
    ctx.scale(player.direction, 1);
    
    // Walking animation offset
    const legOffset = player.walking ? Math.sin(player.walkFrame * Math.PI / 2) * 5 : 0;
    const armOffset = player.walking ? Math.sin(player.walkFrame * Math.PI / 2) * 8 : 0;
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Boots
    ctx.fillStyle = COLORS.black;
    ctx.fillRect(-15, -12 + legOffset, 12, 12);
    ctx.fillRect(3, -12 - legOffset, 12, 12);
    
    // Red overalls (pants)
    ctx.fillStyle = COLORS.red;
    ctx.fillRect(-14, -35 + legOffset, 10, 25);
    ctx.fillRect(4, -35 - legOffset, 10, 25);
    
    // Body (red overalls top)
    ctx.fillStyle = COLORS.red;
    ctx.fillRect(-16, -55, 32, 25);
    
    // Black shirt (visible at top)
    ctx.fillStyle = COLORS.black;
    ctx.fillRect(-14, -58, 28, 8);
    
    // Overall straps
    ctx.fillStyle = COLORS.darkRed;
    ctx.fillRect(-12, -55, 5, 20);
    ctx.fillRect(7, -55, 5, 20);
    
    // Arms (black sleeves)
    ctx.fillStyle = COLORS.black;
    ctx.save();
    ctx.translate(-18, -50);
    ctx.rotate(armOffset * 0.05);
    ctx.fillRect(-8, 0, 8, 20);
    ctx.restore();
    
    ctx.save();
    ctx.translate(18, -50);
    ctx.rotate(-armOffset * 0.05);
    ctx.fillRect(0, 0, 8, 20);
    ctx.restore();
    
    // Hands (skin color)
    ctx.fillStyle = '#e8c8a8';
    ctx.beginPath();
    ctx.arc(-22 + armOffset * 0.3, -28, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(22 - armOffset * 0.3, -28, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Head
    ctx.fillStyle = '#e8c8a8';
    ctx.beginPath();
    ctx.arc(0, -68, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Red cap
    ctx.fillStyle = COLORS.red;
    ctx.beginPath();
    ctx.arc(0, -72, 13, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-13, -74, 26, 4);
    
    // Cap brim
    ctx.fillStyle = COLORS.darkRed;
    ctx.beginPath();
    ctx.ellipse(8, -70, 10, 4, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = COLORS.black;
    ctx.beginPath();
    ctx.arc(-4, -68, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(4, -68, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Smile
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -64, 5, 0.2, Math.PI - 0.2);
    ctx.stroke();
    
    // Small GTG logo on overalls (chest)
    ctx.fillStyle = COLORS.yellow;
    ctx.font = 'bold 7px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GTG', 0, -44);
    
    // Small logo on cap
    ctx.fillStyle = COLORS.yellow;
    ctx.font = 'bold 5px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('G', 2, -73);
    
    ctx.restore();
}

function drawChristmasTree() {
    const screenX = finishLine.treeX - cameraX;
    if (screenX < -200 || screenX > GAME_WIDTH + 200) return;
    
    const treeY = GAME_HEIGHT - 80;
    
    ctx.save();
    ctx.translate(screenX, treeY);
    
    // Trunk
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(-20, -40, 40, 50);
    
    // Tree layers (red tree)
    const layers = [
        { y: -280, width: 40 },
        { y: -220, width: 80 },
        { y: -150, width: 120 },
        { y: -70, width: 160 }
    ];
    
    layers.forEach((layer, i) => {
        ctx.fillStyle = COLORS.red;
        ctx.beginPath();
        ctx.moveTo(0, layer.y);
        ctx.lineTo(-layer.width, layer.y + 80);
        ctx.lineTo(layer.width, layer.y + 80);
        ctx.closePath();
        ctx.fill();
        
        // Darker edge
        ctx.fillStyle = COLORS.darkRed;
        ctx.beginPath();
        ctx.moveTo(0, layer.y);
        ctx.lineTo(layer.width, layer.y + 80);
        ctx.lineTo(layer.width - 20, layer.y + 80);
        ctx.lineTo(0, layer.y + 20);
        ctx.closePath();
        ctx.fill();
    });
    
    // Yellow star on top
    ctx.fillStyle = COLORS.yellow;
    drawStar(0, -300, 25, 5);
    
    // Yellow ornaments
    const ornaments = [
        { x: -30, y: -200 },
        { x: 40, y: -180 },
        { x: -50, y: -120 },
        { x: 20, y: -130 },
        { x: 60, y: -100 },
        { x: -80, y: -60 },
        { x: -20, y: -70 },
        { x: 50, y: -50 },
        { x: 100, y: -40 }
    ];
    
    ornaments.forEach(o => {
        ctx.fillStyle = COLORS.yellow;
        ctx.beginPath();
        ctx.arc(o.x, o.y, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Shine
        ctx.fillStyle = '#fff8c0';
        ctx.beginPath();
        ctx.arc(o.x - 3, o.y - 3, 3, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Snow on tree
    ctx.fillStyle = '#ffffff';
    layers.forEach((layer, i) => {
        for (let x = -layer.width + 20; x < layer.width - 20; x += 30) {
            ctx.beginPath();
            ctx.arc(x, layer.y + 75, 8, 0, Math.PI, true);
            ctx.fill();
        }
    });
    
    ctx.restore();
    
    // Draw equipment images under tree
    drawEquipmentImages(screenX, treeY);
}

function drawStar(x, y, radius, points) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? radius : radius / 2;
        const angle = (i * Math.PI / points) - Math.PI / 2;
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    
    // Glow
    ctx.shadowColor = COLORS.yellow;
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawEquipmentImages(treeX, treeY) {
    const imgWidth = 120;
    const imgHeight = 85;
    const spacing = 130;
    const startX = treeX - (spacing * 2);
    
    equipmentImages.forEach((img, i) => {
        const x = startX + i * spacing;
        const y = treeY - imgHeight - 15;
        
        // Draw actual image if loaded (no frame, directly on snow)
        if (img.complete && img.naturalWidth > 0) {
            // Subtle shadow under image
            ctx.shadowColor = 'rgba(0,0,0,0.4)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 5;
            ctx.drawImage(img, x - imgWidth/2, y, imgWidth, imgHeight);
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
        } else {
            // Fallback - draw simple placeholder
            ctx.fillStyle = '#e0e0e0';
            ctx.fillRect(x - imgWidth/2, y, imgWidth, imgHeight);
            ctx.fillStyle = COLORS.red;
            ctx.font = '12px Fredoka';
            ctx.textAlign = 'center';
            ctx.fillText('🎁', x, y + imgHeight/2 + 5);
        }
    });
}

function drawFinishLine() {
    const screenX = finishLine.x - cameraX;
    if (screenX < -50 || screenX > GAME_WIDTH + 50) return;
    
    // Checkered flag pole
    ctx.fillStyle = '#808080';
    ctx.fillRect(screenX - 3, GAME_HEIGHT - 280, 6, 200);
    
    // Flag
    const flagWidth = 60;
    const flagHeight = 40;
    const squareSize = 10;
    
    for (let row = 0; row < flagHeight / squareSize; row++) {
        for (let col = 0; col < flagWidth / squareSize; col++) {
            ctx.fillStyle = (row + col) % 2 === 0 ? '#ffffff' : '#1a1a1a';
            ctx.fillRect(
                screenX + col * squareSize,
                GAME_HEIGHT - 280 + row * squareSize,
                squareSize,
                squareSize
            );
        }
    }
    
    // "CÍL" text
    ctx.fillStyle = COLORS.yellow;
    ctx.font = 'bold 24px Fredoka';
    ctx.textAlign = 'center';
    ctx.fillText('CÍL', screenX + 30, GAME_HEIGHT - 290);
}

function updateUI() {
    document.getElementById('collectibles').textContent = `🔧 ${collectiblesCount} / 10`;
    document.getElementById('timer').textContent = `⏱️ ${Math.ceil(timeRemaining)}s`;
}

function showWinScreen() {
    gameState = 'win';
    document.getElementById('winScreen').style.display = 'flex';
    document.getElementById('finalScore').textContent = `Sebrané nástroje: ${collectiblesCount}/10 | Čas: ${Math.ceil(GAME_TIME - timeRemaining)}s`;
}

function gameOver(reason) {
    gameState = 'gameover';
    document.getElementById('gameOverScreen').style.display = 'flex';
    document.getElementById('gameOverReason').textContent = reason;
}

function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    resetGame();
    gameState = 'playing';
    gameLoop();
}

function restartGame() {
    document.getElementById('winScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    resetGame();
    gameState = 'playing';
}

function resetGame() {
    player.x = 100;
    player.y = 400;
    player.velocityX = 0;
    player.velocityY = 0;
    player.onGround = false;
    player.autoWalk = false;
    player.direction = 1;
    
    collectiblesCount = 0;
    timeRemaining = GAME_TIME;
    cameraX = 0;
    
    createLevel();
    updateUI();
}

let lastTime = 0;
function gameLoop(currentTime = 0) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    if (gameState === 'playing') {
        // Update timer
        timeRemaining -= deltaTime;
        if (timeRemaining <= 0) {
            gameOver('Vypršel čas!');
        }
        updateUI();
        
        updatePlayer();
        updateSnowflakes();
    }
    
    // Draw
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    drawBackground();
    drawSnowflakes();
    drawPlatforms();
    drawObstacles();
    drawCollectibles();
    drawFinishLine();
    drawChristmasTree();
    drawPlayer();
    
    requestAnimationFrame(gameLoop);
}

// Initialize
createLevel();

// Add roundRect polyfill for older browsers
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    };
}

