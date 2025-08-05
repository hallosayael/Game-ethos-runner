// main.js
const canvas = document.getElementById("gameCanvas");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

const light = new THREE.HemisphereLight(0xffffff, 0x444444);
scene.add(light);

const playerSize = 1;
const playerGeometry = new THREE.BoxGeometry(playerSize, playerSize, playerSize);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(player);

let lane = 0;
const laneWidth = 2;
player.position.z = 5;

const groundGeometry = new THREE.BoxGeometry(10, 0.1, 100);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.position.y = -1;
ground.position.z = 45;
scene.add(ground);

const obstacles = [];
const coins = [];
function spawnObstacle() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
  const obstacle = new THREE.Mesh(geometry, material);
  const randomLane = Math.floor(Math.random() * 3) - 1;
  obstacle.position.x = randomLane * laneWidth;
  obstacle.position.y = 0;
  obstacle.position.z = -50;
  scene.add(obstacle);
  obstacles.push(obstacle);
}

function spawnCoin() {
  const geometry = new THREE.TorusGeometry(0.3, 0.1, 8, 16);
  const material = new THREE.MeshStandardMaterial({ color: 0xffff00 });
  const coin = new THREE.Mesh(geometry, material);
  const randomLane = Math.floor(Math.random() * 3) - 1;
  coin.position.x = randomLane * laneWidth;
  coin.position.y = 0.5;
  coin.position.z = -50;
  scene.add(coin);
  coins.push(coin);
}

let isJumping = false;
let isSliding = false;
let jumpSpeed = 0;
let gravity = -0.05;
let score = 0;
let coinCount = 0;
let speed = 0.2;
let gameRunning = false;

const scoreDisplay = document.getElementById("score");
const menu = document.getElementById("menu");
const gameOverScreen = document.getElementById("gameOver");
const finalScoreDisplay = document.getElementById("finalScore");
const hud = document.getElementById("hud");

function startGame() {
  menu.style.display = 'none';
  gameOverScreen.style.display = 'none';
  hud.style.display = 'block';
  gameRunning = true;
  score = 0;
  coinCount = 0;
  speed = 0.2;
  player.position.set(0, 0, 5);
  lane = 0;
  obstacles.forEach(o => scene.remove(o));
  obstacles.length = 0;
  coins.forEach(c => scene.remove(c));
  coins.length = 0;
  animate();
}

document.getElementById("startButton").onclick = startGame;
document.getElementById("restartButton").onclick = startGame;

document.addEventListener("keydown", (event) => {
  if (!gameRunning) return;

  if (event.key === "ArrowLeft" && lane > -1) lane--;
  if (event.key === "ArrowRight" && lane < 1) lane++;
  if (event.key === "ArrowUp" && !isJumping && !isSliding) {
    isJumping = true;
    jumpSpeed = 0.3;
  }
  if (event.key === "ArrowDown" && !isJumping && !isSliding) {
    isSliding = true;
    player.scale.y = 0.5;
    setTimeout(() => {
      player.scale.y = 1;
      isSliding = false;
    }, 1000);
  }
  player.position.x = lane * laneWidth;
});

camera.position.y = 5;
camera.position.z = 10;
camera.lookAt(0, 0, 5);

let obstacleInterval = setInterval(spawnObstacle, 2000);
let coinInterval = setInterval(spawnCoin, 1500);

function animate() {
  if (!gameRunning) return;
  requestAnimationFrame(animate);

  if (isJumping) {
    player.position.y += jumpSpeed;
    jumpSpeed += gravity;
    if (player.position.y <= 0) {
      player.position.y = 0;
      isJumping = false;
    }
  }

  obstacles.forEach(obstacle => {
    obstacle.position.z += speed;
    if (
      Math.abs(obstacle.position.z - player.position.z) < 1 &&
      Math.abs(obstacle.position.x - player.position.x) < 1 &&
      Math.abs(player.position.y - obstacle.position.y) < 1
    ) {
      gameRunning = false;
      hud.style.display = 'none';
      gameOverScreen.style.display = 'block';
      finalScoreDisplay.innerText = `Your score: ${Math.floor(score)} | Coins: ${coinCount}`;
    }
  });

  coins.forEach((coin, index) => {
    coin.rotation.y += 0.1;
    coin.position.z += speed;
    if (
      Math.abs(coin.position.z - player.position.z) < 1 &&
      Math.abs(coin.position.x - player.position.x) < 1
    ) {
      scene.remove(coin);
      coins.splice(index, 1);
      coinCount++;
    }
  });

  score += 0.1;
  if (Math.floor(score) % 100 === 0) speed += 0.01;
  scoreDisplay.innerText = `Score: ${Math.floor(score)} | Coins: ${coinCount}`;

  renderer.render(scene, camera);
}
