// Game variables
let canvas, ctx;
let gameState = 'menu'; // menu, selecting, playing, waiting
let players = {};
let currentPlayer = null;
let playerName = '';
let gameSocket = null;
let keys = {};
let mouse = { x: 0, y: 0 };
let gold = 0;
let inventory = [];

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = 1200;
const PLAYER_SIZE = 20;
const PLAYER_SPEED = 3;
const DASH_SPEED = 8;
const DASH_DURATION = 200;
const ATTACK_RANGE = 50;
const PROJECTILE_SPEED = 8;
const PROJECTILE_SIZE = 4;
const PROJECTILE_DAMAGE = 15;

// Camera and zoom
let camera = { x: 0, y: 0 };
let zoom = 1;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_SPEED = 0.1;

// Inventory always visible
let inventoryVisible = true;

// Full map mode
let fullMapMode = false;

// Game objects
let resources = [];
let chests = [];
let projectiles = [];

// Initialize game
function initGame() {
    canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context!');
        return;
    }

    // Set canvas size
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    console.log('Game initialized successfully');

    // Initialize character selection
    initCharacterSelection();

    // Start game loop
    gameLoop();
}

// Character selection
function initCharacterSelection() {
    // Player name input
    document.getElementById('player-name').addEventListener('input', (e) => {
        playerName = e.target.value.trim();
        updateStartButton();
    });

    // Start game button
    document.getElementById('start-game-btn').addEventListener('click', () => {
        if (playerName.length > 0) {
            startGame();
        }
    });

    // Room buttons
    document.getElementById('create-room-btn').addEventListener('click', createRoom);
    document.getElementById('join-room-btn').addEventListener('click', joinRoom);
}

function updateStartButton() {
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.disabled = playerName.length === 0;
    }
}

// Game functions
function openGame(gameType) {
    document.getElementById('game-modal').classList.add('show');
    document.getElementById('character-selection').style.display = 'flex';
    document.getElementById('game-ui').style.display = 'none';
    document.getElementById('waiting-message').style.display = 'none';
    gameState = 'selecting';

    // Reset selections
    playerName = '';
    document.getElementById('player-name').value = '';
    document.getElementById('start-game-btn').disabled = true;

    initGame();
}

function closeGame() {
    document.getElementById('game-modal').classList.remove('show');
    gameState = 'menu';

    // Disconnect from game server if connected
    if (gameSocket) {
        gameSocket.close();
        gameSocket = null;
    }
}

function startGame() {
    if (!playerName) return;

    // Create player with default stats
    currentPlayer = {
        id: Date.now().toString(),
        name: playerName,
        x: WORLD_WIDTH / 2,
        y: WORLD_HEIGHT / 2,
        health: 100,
        maxHealth: 100,
        speed: PLAYER_SPEED,
        strength: 1,
        color: getRandomColor(),
        isDashing: false,
        dashTime: 0,
        lastAttack: 0,
        direction: { x: 0, y: 0 }
    };

    // Initialize camera to follow player
    camera.x = currentPlayer.x - CANVAS_WIDTH / 2;
    camera.y = currentPlayer.y - CANVAS_HEIGHT / 2;

    // Set default zoom to minimum
    zoom = MIN_ZOOM;

    console.log(`Created currentPlayer: ${currentPlayer.name} at (${currentPlayer.x}, ${currentPlayer.y})`);

    // Update UI
    document.getElementById('character-selection').style.display = 'none';
    document.getElementById('game-ui').style.display = 'block';
    document.getElementById('waiting-message').style.display = 'block';
    document.getElementById('current-player').textContent = playerName;
    document.getElementById('health-fill').style.width = '100%';

    gameState = 'waiting';

    // Connect to game server (simulated for now)
    connectToGameServer();

    // Add event listeners for gameplay
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleMouseClick);
    canvas.addEventListener('wheel', handleMouseWheel);
}

function connectToGameServer() {
    // Simulate connection to game server
    // In a real implementation, this would connect via WebSocket
    setTimeout(() => {
        gameState = 'playing';
        document.getElementById('waiting-message').style.display = 'none';
        document.getElementById('game-status').textContent = 'Jogando';

        // Add some dummy players for demonstration
        addDummyPlayers();

        // Initialize resources and chests
        initResourcesAndChests();
    }, 500); // Reduced delay for faster testing
}

function addDummyPlayers() {
    const dummyNames = ['Jogador1', 'Jogador2', 'Jogador3'];

    dummyNames.forEach((name, index) => {
        const player = {
            id: `dummy-${index}`,
            name: name,
            x: 100 + index * 200,
            y: 100 + index * 150,
            health: 100,
            maxHealth: 100,
            speed: PLAYER_SPEED,
            strength: 1,
            color: getRandomColor(),
            isDashing: false,
            dashTime: 0,
            lastAttack: 0,
            direction: { x: 0, y: 0 }
        };
        players[player.id] = player;
        console.log(`Added dummy player: ${name} at (${player.x}, ${player.y})`);
    });

    console.log(`Total players: ${Object.keys(players).length}`);
    updatePlayerList();
}

function initResourcesAndChests() {
    // Initialize resources
    resources = [];
    for (let i = 0; i < 20; i++) {
        resources.push({
            x: Math.random() * (WORLD_WIDTH - 40) + 20,
            y: Math.random() * (WORLD_HEIGHT - 40) + 20,
            type: Math.random() > 0.5 ? 'gold' : 'health',
            collected: false
        });
    }

    // Initialize chests
    chests = [];
    for (let i = 0; i < 10; i++) {
        chests.push({
            x: Math.random() * (WORLD_WIDTH - 40) + 20,
            y: Math.random() * (WORLD_HEIGHT - 40) + 20,
            opened: false
        });
    }
}

function getRandomColor() {
    const colors = ['#ff4444', '#4444ff', '#44ff44', '#ffff44', '#ff44ff', '#44ffff'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Room management functions
function createRoom() {
    // Generate a random room ID
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    document.getElementById('current-room-id').textContent = roomId;
    document.getElementById('room-input').value = roomId;
    alert(`Sala criada! ID: ${roomId}`);
}

function joinRoom() {
    const roomId = document.getElementById('room-input').value.trim().toUpperCase();
    if (roomId.length === 0) {
        alert('Digite um ID de sala válido!');
        return;
    }

    // Simulate joining room
    document.getElementById('current-room-id').textContent = roomId;
    alert(`Entrou na sala: ${roomId}`);
}

// Input handling
function handleKeyDown(e) {
    keys[e.code] = true;

    // Dash with spacebar
    if (e.code === 'Space' && !currentPlayer.isDashing && gameState === 'playing') {
        performDash();
    }

    // Toggle full map with 'E'
    if (e.code === 'KeyE' && gameState === 'playing') {
        fullMapMode = !fullMapMode;
    }
}

function handleKeyUp(e) {
    keys[e.code] = false;
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
}

function handleMouseClick(e) {
    if (gameState === 'playing') {
        performAttack();
    }
}

function handleMouseWheel(e) {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -ZOOM_SPEED : ZOOM_SPEED;
    zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + zoomDelta));
}

// Game mechanics
function performDash() {
    if (currentPlayer.isDashing) return;

    currentPlayer.isDashing = true;
    currentPlayer.dashTime = Date.now();

    // Calculate dash direction based on movement keys
    let dashX = 0;
    let dashY = 0;

    if (keys['KeyW'] || keys['ArrowUp']) dashY = -1;
    if (keys['KeyS'] || keys['ArrowDown']) dashY = 1;
    if (keys['KeyA'] || keys['ArrowLeft']) dashX = -1;
    if (keys['KeyD'] || keys['ArrowRight']) dashX = 1;

    // If no direction, dash towards mouse
    if (dashX === 0 && dashY === 0) {
        // Convert mouse coordinates to world coordinates
        const worldMouseX = mouse.x / zoom + camera.x;
        const worldMouseY = mouse.y / zoom + camera.y;
        const dx = worldMouseX - currentPlayer.x;
        const dy = worldMouseY - currentPlayer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0) {
            dashX = dx / distance;
            dashY = dy / distance;
        }
    }

    currentPlayer.direction = { x: dashX, y: dashY };
}

function performAttack() {
    const now = Date.now();
    if (now - currentPlayer.lastAttack < 300) return; // Attack cooldown

    currentPlayer.lastAttack = now;

    // Convert mouse coordinates to world coordinates
    const worldMouseX = mouse.x / zoom + camera.x;
    const worldMouseY = mouse.y / zoom + camera.y;

    // Calculate direction towards mouse
    const dx = worldMouseX - currentPlayer.x;
    const dy = worldMouseY - currentPlayer.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
        const dirX = dx / distance;
        const dirY = dy / distance;

        // Create projectile
        const projectile = {
            x: currentPlayer.x,
            y: currentPlayer.y,
            dirX: dirX,
            dirY: dirY,
            speed: PROJECTILE_SPEED,
            damage: PROJECTILE_DAMAGE,
            owner: currentPlayer.id
        };

        projectiles.push(projectile);
    }
}



function updateHealthBar() {
    const healthPercent = (currentPlayer.health / currentPlayer.maxHealth) * 100;
    document.getElementById('health-fill').style.width = healthPercent + '%';

    if (currentPlayer.health <= 0) {
        gameState = 'game-over';
        document.getElementById('game-status').textContent = 'Game Over';
    }
}

function updatePlayerList() {
    const playerList = document.getElementById('player-list');
    let html = '<h4>Jogadores:</h4>';

    if (currentPlayer) {
        html += `<div>${currentPlayer.name} (Você) - ${currentPlayer.health} HP</div>`;
        html += `<div>Ouro: ${gold}</div>`;
        if (inventory.length > 0) {
            html += `<div>Inventário: ${inventory.join(', ')}</div>`;
        }
    }

    Object.values(players).forEach(player => {
        html += `<div>${player.name} - ${player.health} HP</div>`;
    });

    // Add controls section
    html += '<h4>Controles:</h4>';
    html += '<div>WASD - Mover</div>';
    html += '<div>Espaço - Dash</div>';
    html += '<div>Mouse - Atacar</div>';

    playerList.innerHTML = html;
}

function checkResourceCollection() {
    if (!currentPlayer) return;

    resources.forEach((resource, index) => {
        if (!resource.collected) {
            const dx = resource.x - currentPlayer.x;
            const dy = resource.y - currentPlayer.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < PLAYER_SIZE + 10) {
                // Collect resource
                resource.collected = true;

                if (resource.type === 'gold') {
                    gold += 10;
                } else if (resource.type === 'health') {
                    currentPlayer.health = Math.min(currentPlayer.maxHealth, currentPlayer.health + 20);
                    updateHealthBar();
                }
            }
        }
    });
}

function checkChestOpening() {
    if (!currentPlayer) return;

    chests.forEach((chest, index) => {
        if (!chest.opened) {
            const dx = chest.x - currentPlayer.x;
            const dy = chest.y - currentPlayer.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < PLAYER_SIZE + 15) {
                // Open chest
                chest.opened = true;

                // Random reward
                const rewardType = Math.random();
                if (rewardType < 0.5) {
                    gold += 25;
                } else {
                    const items = ['Potion', 'Shield', 'Sword Upgrade', 'Armor'];
                    const item = items[Math.floor(Math.random() * items.length)];
                    inventory.push(item);
                }
            }
        }
    });
}

function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];

        // Move projectile
        projectile.x += projectile.dirX * projectile.speed;
        projectile.y += projectile.dirY * projectile.speed;

        // Check for collisions with players
        let hitPlayer = false;
        Object.values(players).forEach(player => {
            if (player.id !== projectile.owner) {
                const dx = projectile.x - player.x;
                const dy = projectile.y - player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < PLAYER_SIZE + PROJECTILE_SIZE) {
                    // Hit! Deal damage
                    player.health = Math.max(0, player.health - projectile.damage);
                    hitPlayer = true;

                    // Update health bar if it's the current player being hit
                    if (player.id === currentPlayer.id) {
                        updateHealthBar();
                    }
                }
            }
        });

        // Remove projectile if it hit a player or went off-world
        if (hitPlayer ||
            projectile.x < -PROJECTILE_SIZE ||
            projectile.x > WORLD_WIDTH + PROJECTILE_SIZE ||
            projectile.y < -PROJECTILE_SIZE ||
            projectile.y > WORLD_HEIGHT + PROJECTILE_SIZE) {
            projectiles.splice(i, 1);
        }
    }
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (gameState !== 'playing') return;

    // Update current player
    if (currentPlayer) {
        updatePlayer(currentPlayer);
    }

    // Update other players
    Object.values(players).forEach(player => {
        if (player.id !== currentPlayer.id) {
            updatePlayer(player);
        }
    });

    // Check resource collection
    checkResourceCollection();

    // Update projectiles
    updateProjectiles();

    // Check chest opening
    checkChestOpening();

    updatePlayerList();
}

function updatePlayer(player) {
    // Handle dashing
    if (player.isDashing) {
        const dashElapsed = Date.now() - player.dashTime;
        if (dashElapsed < DASH_DURATION) {
            player.x += player.direction.x * DASH_SPEED;
            player.y += player.direction.y * DASH_SPEED;
        } else {
            player.isDashing = false;
        }
    } else {
        // Movement logic depends on player type
        if (player.id === currentPlayer.id) {
            // Human player movement
            let moveX = 0;
            let moveY = 0;

            if (keys['KeyW'] || keys['ArrowUp']) moveY = -1;
            if (keys['KeyS'] || keys['ArrowDown']) moveY = 1;
            if (keys['KeyA'] || keys['ArrowLeft']) moveX = -1;
            if (keys['KeyD'] || keys['ArrowRight']) moveX = 1;

            if (moveX !== 0 || moveY !== 0) {
                const length = Math.sqrt(moveX * moveX + moveY * moveY);
                moveX /= length;
                moveY /= length;

                player.x += moveX * player.speed;
                player.y += moveY * player.speed;
            }
        } else {
            // Bot movement - random wandering
            if (!player.botTarget || Math.random() < 0.02) { // Change target occasionally
                player.botTarget = {
                    x: Math.random() * (WORLD_WIDTH - 2 * PLAYER_SIZE) + PLAYER_SIZE,
                    y: Math.random() * (WORLD_HEIGHT - 2 * PLAYER_SIZE) + PLAYER_SIZE
                };
            }

            const dx = player.botTarget.x - player.x;
            const dy = player.botTarget.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 5) {
                const moveX = dx / distance;
                const moveY = dy / distance;
                player.x += moveX * player.speed * 0.5; // Slower bots
                player.y += moveY * player.speed * 0.5;
            }
        }
    }

    // Keep player in world bounds
    player.x = Math.max(PLAYER_SIZE, Math.min(WORLD_WIDTH - PLAYER_SIZE, player.x));
    player.y = Math.max(PLAYER_SIZE, Math.min(WORLD_HEIGHT - PLAYER_SIZE, player.y));

    // Update camera to follow current player
    if (player.id === currentPlayer.id) {
        const targetCameraX = player.x - CANVAS_WIDTH / (2 * zoom);
        const targetCameraY = player.y - CANVAS_HEIGHT / (2 * zoom);

        // Smooth camera movement
        camera.x += (targetCameraX - camera.x) * 0.1;
        camera.y += (targetCameraY - camera.y) * 0.1;

        // Keep camera in world bounds
        camera.x = Math.max(0, Math.min(WORLD_WIDTH - CANVAS_WIDTH / zoom, camera.x));
        camera.y = Math.max(0, Math.min(WORLD_HEIGHT - CANVAS_HEIGHT / zoom, camera.y));
    }
}

function render() {
    console.log(`Render called, gameState: ${gameState}, currentPlayer: ${currentPlayer ? currentPlayer.name : 'null'}, players count: ${Object.keys(players).length}`);

    // Clear canvas
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Save context for camera/zoom transformations
    ctx.save();

    // Handle full map mode
    let renderZoom = zoom;
    let renderCameraX = camera.x;
    let renderCameraY = camera.y;

    if (fullMapMode) {
        // Calculate zoom to fit entire world
        const worldAspectRatio = WORLD_WIDTH / WORLD_HEIGHT;
        const canvasAspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT;

        if (worldAspectRatio > canvasAspectRatio) {
            // World is wider than canvas
            renderZoom = CANVAS_WIDTH / WORLD_WIDTH;
        } else {
            // World is taller than canvas
            renderZoom = CANVAS_HEIGHT / WORLD_HEIGHT;
        }

        // Center the world
        renderCameraX = 0;
        renderCameraY = 0;
    }

    // Apply camera and zoom transformations
    ctx.translate(-renderCameraX * renderZoom, -renderCameraY * renderZoom);
    ctx.scale(renderZoom, renderZoom);

    // Draw world grid
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1 / renderZoom; // Adjust line width for zoom
    for (let x = 0; x < WORLD_WIDTH; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, WORLD_HEIGHT);
        ctx.stroke();
    }
    for (let y = 0; y < WORLD_HEIGHT; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WORLD_WIDTH, y);
        ctx.stroke();
    }

    if (gameState === 'playing') {
        // Draw players
        if (currentPlayer) {
            drawPlayer(currentPlayer, true);
        }

        Object.values(players).forEach(player => {
            drawPlayer(player, false);
        });

        // Draw resources
        resources.forEach(resource => {
            if (!resource.collected) {
                ctx.fillStyle = resource.type === 'gold' ? '#ffff00' : '#ff0000';
                ctx.fillRect(resource.x - 10, resource.y - 10, 20, 20);
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2 / renderZoom;
                ctx.strokeRect(resource.x - 10, resource.y - 10, 20, 20);
            }
        });

        // Draw chests
        chests.forEach(chest => {
            if (!chest.opened) {
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(chest.x - 15, chest.y - 15, 30, 30);
                ctx.strokeStyle = '#654321';
                ctx.lineWidth = 2 / renderZoom;
                ctx.strokeRect(chest.x - 15, chest.y - 15, 30, 30);
            }
        });

        // Draw projectiles
        projectiles.forEach(projectile => {
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, PROJECTILE_SIZE, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1 / renderZoom;
            ctx.stroke();
        });

        // Draw attack range indicator when mouse is over canvas
        if (currentPlayer) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2 / renderZoom;
            ctx.beginPath();
            ctx.arc(currentPlayer.x, currentPlayer.y, ATTACK_RANGE, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // Restore context
    ctx.restore();

    // Draw UI elements (not affected by camera/zoom)
    if (gameState === 'playing') {
        // Draw zoom level indicator
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Zoom: ${zoom.toFixed(1)}x`, 10, 30);
    }
}

function drawPlayer(player, isCurrentPlayer) {
    // Player body
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, PLAYER_SIZE, 0, Math.PI * 2);
    ctx.fill();

    // Player border
    ctx.strokeStyle = isCurrentPlayer ? '#ffffff' : '#666666';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Health bar
    const barWidth = 40;
    const barHeight = 6;
    const barX = player.x - barWidth / 2;
    const barY = player.y - PLAYER_SIZE - 15;

    // Background
    ctx.fillStyle = '#333333';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Health fill
    const healthPercent = player.health / player.maxHealth;
    ctx.fillStyle = healthPercent > 0.6 ? '#44ff44' : healthPercent > 0.3 ? '#ffff44' : '#ff4444';
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    // Border
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // Player name
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(player.name, player.x, player.y + PLAYER_SIZE + 20);

    // Dash effect
    if (player.isDashing) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x, player.y, PLAYER_SIZE + 5, 0, Math.PI * 2);
        ctx.stroke();
    }
}



// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.offsetTop;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});
