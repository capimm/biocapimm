// Game variables
let canvas, ctx;
let gameState = 'menu'; // menu, selecting, playing, waiting
let players = {};
let currentPlayer = null;
let selectedWeapon = null;
let selectedPower = null;
let selectedStatus = null;
let playerName = '';
let gameSocket = null;
let keys = {};
let mouse = { x: 0, y: 0 };
let gold = 0;
let inventory = [];

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SIZE = 20;
const PLAYER_SPEED = 3;
const DASH_SPEED = 8;
const DASH_DURATION = 200;
const ATTACK_RANGE = 50;

// Game objects
let resources = [];
let chests = [];

// Initialize game
function initGame() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Initialize character selection
    initCharacterSelection();

    // Start game loop
    gameLoop();
}

// Character selection
function initCharacterSelection() {
    // Weapon selection
    document.querySelectorAll('#weapon-selection .option-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('#weapon-selection .option-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedWeapon = card.dataset.id;
            checkSelectionComplete();
        });
    });

    // Power selection
    document.querySelectorAll('#power-selection .option-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('#power-selection .option-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedPower = card.dataset.id;
            checkSelectionComplete();
        });
    });

    // Status selection
    document.querySelectorAll('#status-selection .option-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('#status-selection .option-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedStatus = card.dataset.id;
            checkSelectionComplete();
        });
    });

    // Player name input
    document.getElementById('player-name').addEventListener('input', (e) => {
        playerName = e.target.value.trim();
        checkSelectionComplete();
    });

    // Navigation buttons
    document.getElementById('next-to-weapon').addEventListener('click', () => goToStep(2));
    document.getElementById('next-to-power').addEventListener('click', () => goToStep(3));
    document.getElementById('next-to-status').addEventListener('click', () => goToStep(4));

    // Start game button
    document.getElementById('start-game-btn').addEventListener('click', startGame);
}

function goToStep(step) {
    // Update step indicators
    document.querySelectorAll('.step').forEach((indicator, index) => {
        indicator.classList.remove('active', 'completed');
        if (index + 1 < step) {
            indicator.classList.add('completed');
        } else if (index + 1 === step) {
            indicator.classList.add('active');
        }
    });

    // Show/hide steps
    document.querySelectorAll('.selection-step').forEach(stepDiv => {
        stepDiv.classList.remove('active');
    });
    document.querySelector(`[data-step="${step}"]`).classList.add('active');
}

function updateNavigationButtons() {
    const nextToWeapon = document.getElementById('next-to-weapon');
    const nextToPower = document.getElementById('next-to-power');
    const nextToStatus = document.getElementById('next-to-status');
    const startBtn = document.getElementById('start-game-btn');

    // Enable/disable navigation based on current selections
    nextToWeapon.disabled = playerName.length === 0;
    nextToPower.disabled = !selectedWeapon;
    nextToStatus.disabled = !selectedPower;
    startBtn.disabled = !selectedStatus;
}

function checkSelectionComplete() {
    updateNavigationButtons();
}

// Game functions
function openGame(gameType) {
    document.getElementById('game-modal').classList.add('show');
    document.getElementById('character-selection').style.display = 'flex';
    document.getElementById('game-ui').style.display = 'none';
    document.getElementById('waiting-message').style.display = 'none';
    gameState = 'selecting';

    // Reset selections
    selectedWeapon = null;
    selectedPower = null;
    selectedStatus = null;
    playerName = '';
    document.getElementById('player-name').value = '';
    document.querySelectorAll('.option-card').forEach(card => card.classList.remove('selected'));
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
    if (!selectedWeapon || !selectedPower || !selectedStatus || !playerName) return;

    // Create player
    currentPlayer = {
        id: Date.now().toString(),
        name: playerName,
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        weapon: selectedWeapon,
        power: selectedPower,
        status: selectedStatus,
        health: 100,
        maxHealth: selectedStatus === 'health' ? 150 : 100,
        speed: selectedStatus === 'speed' ? 4 : 3,
        strength: selectedStatus === 'strength' ? 1.5 : 1,
        color: getRandomColor(),
        isDashing: false,
        dashTime: 0,
        lastAttack: 0,
        direction: { x: 0, y: 0 }
    };

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
    }, 2000);
}

function addDummyPlayers() {
    const dummyPlayers = [
        { name: 'Jogador1', weapon: 'sword', power: 'fire', status: 'speed' },
        { name: 'Jogador2', weapon: 'bow', power: 'ice', status: 'health' },
        { name: 'Jogador3', weapon: 'staff', power: 'lightning', status: 'strength' }
    ];

    dummyPlayers.forEach((dummy, index) => {
        const player = {
            id: `dummy-${index}`,
            name: dummy.name,
            x: 100 + index * 200,
            y: 100 + index * 150,
            weapon: dummy.weapon,
            power: dummy.power,
            status: dummy.status,
            health: 100,
            maxHealth: dummy.status === 'health' ? 150 : 100,
            speed: dummy.status === 'speed' ? 4 : 3,
            strength: dummy.status === 'strength' ? 1.5 : 1,
            color: getRandomColor(),
            isDashing: false,
            dashTime: 0,
            lastAttack: 0,
            direction: { x: 0, y: 0 }
        };
        players[player.id] = player;
    });

    updatePlayerList();
}

function initResourcesAndChests() {
    // Initialize resources
    resources = [];
    for (let i = 0; i < 5; i++) {
        resources.push({
            x: Math.random() * (CANVAS_WIDTH - 40) + 20,
            y: Math.random() * (CANVAS_HEIGHT - 40) + 20,
            type: Math.random() > 0.5 ? 'gold' : 'health',
            collected: false
        });
    }

    // Initialize chests
    chests = [];
    for (let i = 0; i < 3; i++) {
        chests.push({
            x: Math.random() * (CANVAS_WIDTH - 40) + 20,
            y: Math.random() * (CANVAS_HEIGHT - 40) + 20,
            opened: false
        });
    }
}

function getRandomColor() {
    const colors = ['#ff4444', '#4444ff', '#44ff44', '#ffff44', '#ff44ff', '#44ffff'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Input handling
function handleKeyDown(e) {
    keys[e.code] = true;

    // Dash with spacebar
    if (e.code === 'Space' && !currentPlayer.isDashing && gameState === 'playing') {
        performDash();
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
        const dx = mouse.x - currentPlayer.x;
        const dy = mouse.y - currentPlayer.y;
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
    if (now - currentPlayer.lastAttack < 500) return; // Attack cooldown

    currentPlayer.lastAttack = now;

    // Check for hits on other players
    Object.values(players).forEach(player => {
        if (player.id === currentPlayer.id) return;

        const dx = player.x - currentPlayer.x;
        const dy = player.y - currentPlayer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < ATTACK_RANGE) {
            // Hit! Calculate damage based on weapon and strength
            let damage = 20 * currentPlayer.strength;

            // Weapon bonuses
            if (currentPlayer.weapon === 'sword') damage *= 1.2;
            else if (currentPlayer.weapon === 'bow') damage *= 0.8;
            else if (currentPlayer.weapon === 'staff') damage *= 1.5;

            player.health = Math.max(0, player.health - damage);

            // Apply power effect
            applyPowerEffect(player, currentPlayer.power);

            // Update health bar if it's the current player being hit
            if (player.id === currentPlayer.id) {
                updateHealthBar();
            }
        }
    });
}

function applyPowerEffect(target, power) {
    switch (power) {
        case 'fire':
            // Burn effect - damage over time
            setTimeout(() => {
                if (target.health > 0) {
                    target.health = Math.max(0, target.health - 5);
                }
            }, 1000);
            break;
        case 'ice':
            // Slow effect
            const originalSpeed = target.speed;
            target.speed *= 0.5;
            setTimeout(() => {
                target.speed = originalSpeed;
            }, 3000);
            break;
        case 'lightning':
            // Chain lightning - hits nearby players
            Object.values(players).forEach(player => {
                if (player.id !== target.id && player.id !== currentPlayer.id) {
                    const dx = player.x - target.x;
                    const dy = player.y - target.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 100) {
                        player.health = Math.max(0, player.health - 10);
                    }
                }
            });
            break;
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
        // Normal movement
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
    }

    // Keep player in bounds
    player.x = Math.max(PLAYER_SIZE, Math.min(CANVAS_WIDTH - PLAYER_SIZE, player.x));
    player.y = Math.max(PLAYER_SIZE, Math.min(CANVAS_HEIGHT - PLAYER_SIZE, player.y));
}

function render() {
    // Clear canvas
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
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
                ctx.lineWidth = 2;
                ctx.strokeRect(resource.x - 10, resource.y - 10, 20, 20);
            }
        });

        // Draw chests
        chests.forEach(chest => {
            if (!chest.opened) {
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(chest.x - 15, chest.y - 15, 30, 30);
                ctx.strokeStyle = '#654321';
                ctx.lineWidth = 2;
                ctx.strokeRect(chest.x - 15, chest.y - 15, 30, 30);
            }
        });

        // Draw attack range indicator when mouse is over canvas
        if (currentPlayer) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(currentPlayer.x, currentPlayer.y, ATTACK_RANGE, 0, Math.PI * 2);
            ctx.stroke();
        }
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

    // Weapon indicator
    const weaponEmoji = getWeaponEmoji(player.weapon);
    ctx.font = '16px Arial';
    ctx.fillText(weaponEmoji, player.x - 15, player.y - 25);

    // Power indicator
    const powerEmoji = getPowerEmoji(player.power);
    ctx.fillText(powerEmoji, player.x + 15, player.y - 25);

    // Dash effect
    if (player.isDashing) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x, player.y, PLAYER_SIZE + 5, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function getWeaponEmoji(weapon) {
    switch (weapon) {
        case 'sword': return '⚔️';
        case 'bow': return '🏹';
        case 'staff': return '🪄';
        default: return '❓';
    }
}

function getPowerEmoji(power) {
    switch (power) {
        case 'fire': return '🔥';
        case 'ice': return '❄️';
        case 'lightning': return '⚡';
        default: return '❓';
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
