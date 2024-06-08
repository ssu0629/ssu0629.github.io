let shared;
let clickCount;
let totalDeg;
let guests;
let me;

////////수정사항/////////
// 애니메이션 추가로 코드 수정한 곳
// assets폴더
// preload에 이미지 불러오기
// draw에 루프하는 배경 추가
// class안의 display, spawnObstacle
// 캔버스 크기 바꿈
let dodgeImgRobots = []; // 로봇 애니메이션 전체파일
let dodgeImgFrame = 0; // 로봇 현재 프레임 저장
let dodgeImgBg;
let dodgeImgBgStars = []; // 배경에 있는 별은 레이어 2개 있습니다
let dodgeImgObstacles = []; // 장애물 이미지 5개 있습니다

let dodgeBgSpeed;
let dodgeBgY = 0; // 배경 스크롤 초기 위치 변수
let dodgeBgY2; //!!setup()에서 초기화 해요
let dodgeBgY3 = 0;
let dodgeBgY4;
let dodgeBgY5 = 0;
let dodgeBgY6;

let game; // 게임 인스턴스를 전역으로 선언하여 draw 함수에서 접근 가능하게 함

let introActive = true; // 인트로 활성 상태 변수
let startButtonPressed = false;
let restartButtonPressed = false; // 버튼이 눌린 상태 변수

// 시작버튼
let startW = 200;
let startH = 100;
let startX, startY;

document.addEventListener("DOMContentLoaded", function () {
  const activateButton = document.getElementById('activateButton');
  activateButton.addEventListener('click', onClick);
});

function onClick() {
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          window.addEventListener('devicemotion', cb);
        }
      })
      .catch(console.error);
  } else {
    window.addEventListener('devicemotion', cb);
  }
}

function cb(event) {
  console.log(event.rotationRate);
}

function preload() {
  partyConnect(
    "wss://demoserver.p5party.org",
    "party_circle"
  );
  shared = partyLoadShared("shared", { x: 100, y: 100 });
  clickCount = partyLoadShared("clickCount", { value: 0 });
  guests = partyLoadGuestShareds();
  me = partyLoadMyShared({ degX: 0 });

  // 이미지 프리로드
  for (let i = 0; i < 2; i++) { // 파일이름 0부터 1까지 불러오기
    dodgeImgRobots[i] = loadImage("assets/dodge/dodgeRobot" + i + ".png");
    dodgeImgBgStars[i] = loadImage("assets/dodge/dodgeBgStar" + i + ".png");
  }
  for (let i = 0; i < 5; i++) { // 파일이름 0부터 4까지 불러오기
    dodgeImgObstacles[i] = loadImage("assets/dodge/dodgeObstacle" + i + ".png");
  }
  dodgeImgBg = loadImage("assets/dodge/dodgeBgSpace.png");
  introImg = loadImage("assets/assets for use/introBg/dodgeIntroBg.png"); // 시작 화면 이미지 파일 로드
  gameOverBg = loadImage("assets/gameoverBg.png");
  successBg = loadImage("assets/successBg.png");

  // 버튼 이미지 불러오기
  buttonStartImg = loadImage("assets/assets for use/buttons 200_100/buttonStart.png");
  buttonStartOverImg = loadImage("assets/assets for use/buttons 200_100/buttonStartOver.png");
  buttonStartPressedImg = loadImage("assets/assets for use/buttons 200_100/buttonStartPressed.png");

  buttonAgainImg = loadImage("assets/assets for use/buttons 200_100/buttonAgain.png");
  buttonAgainOverImg = loadImage("assets/assets for use/buttons 200_100/buttonAgainOver.png");
  buttonAgainPressedImg = loadImage("assets/assets for use/buttons 200_100/buttonAgainPressed.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 배경 이미지 루프를 위한 초기화, 배경 이미지 세로 길이가 -windowWidth*2
  dodgeBgY2 = -windowWidth * 2;
  dodgeBgY4 = -windowWidth * 2;
  dodgeBgY6 = -windowWidth * 2;

  noStroke();

  if (partyIsHost()) {
    clickCount.value = 0;
    shared.x = 200;
    shared.y = 200;
  }

  totalDeg = 0;

  game = new ObstacleGame(); // 장애물 피하기 게임 클래스 인스턴스 생성

  // 핸드폰 기울기 이벤트 리스너 추가
  window.addEventListener('devicemotion', handleMotionEvent);

  startX = windowWidth / 2 - startW / 2;
  startY = windowHeight / 5 * 4 - startH / 2 - 20;
}

function handleMotionEvent(event) {
  const acceleration = event.accelerationIncludingGravity;
  if (acceleration) {
    const accelerationX = acceleration.x;
    me.accelerationX = accelerationX; // 기울기 데이터 공유
  }
}


function draw() {
  // 배경 색상 설정
  background('#41388d');

  if (introActive) {
    drawIntro();
  } else {
    drawGame();
  }
}

function drawIntro() {
  image(introImg, windowWidth / 2 - 400, windowHeight / 2 - 300, 800, 600);
  drawStartButton();
}

function drawStartButton() {
  if (startButtonPressed) {
    image(buttonStartPressedImg, startX, startY, startW, startH);
  } else if (mouseX > startX && mouseX < startX + startW && mouseY > startY && mouseY < startY + startH) {
    image(buttonStartOverImg, startX, startY, startW, startH);
  } else {
    image(buttonStartImg, startX, startY, startW, startH);
  }
}

function drawGame() {
  // 무한 루프되는 배경
  // 배경 비율은 1:2(세로가 더 김), 가로길이는 windowWidth, 세로는 2배
  dodgeBgHeight = windowWidth * 2; // 배경 이미지의 세로 길이
  dodgeBgSpeed = 3; // 스크롤의 속도를 조절함
  dodgeBgY += dodgeBgSpeed;  // 우주
  dodgeBgY2 += dodgeBgSpeed; // 우주2
  dodgeBgY3 += dodgeBgSpeed * 0.3; // 별1
  dodgeBgY4 += dodgeBgSpeed * 0.3; // 별2
  dodgeBgY5 += dodgeBgSpeed * 0.1; // 별3
  dodgeBgY6 += dodgeBgSpeed * 0.1; // 별4

  image(dodgeImgBg, 0, dodgeBgY, windowWidth, dodgeBgHeight); // 첫 이미지
  image(dodgeImgBg, 0, dodgeBgY2, windowWidth, dodgeBgHeight); // 그 위 이미지
  blendMode(LIGHTEST);  // 블렌드 모드
  image(dodgeImgBgStars[0], 0, dodgeBgY3, windowWidth, dodgeBgHeight);
  image(dodgeImgBgStars[0], 0, dodgeBgY4, windowWidth, dodgeBgHeight);
  image(dodgeImgBgStars[1], 0, dodgeBgY5, windowWidth, dodgeBgHeight);
  image(dodgeImgBgStars[1], 0, dodgeBgY6, windowWidth, dodgeBgHeight);
  if (dodgeBgY >= dodgeBgHeight - 10) dodgeBgY = -dodgeBgHeight; // 다 내려오면 위로 올림
  if (dodgeBgY2 >= dodgeBgHeight - 10) dodgeBgY2 = -dodgeBgHeight;
  if (dodgeBgY3 >= dodgeBgHeight - 10) dodgeBgY3 = -dodgeBgHeight;
  if (dodgeBgY4 >= dodgeBgHeight - 10) dodgeBgY4 = -dodgeBgHeight;
  if (dodgeBgY5 >= dodgeBgHeight - 10) dodgeBgY5 = -dodgeBgHeight;
  if (dodgeBgY6 >= dodgeBgHeight - 10) dodgeBgY6 = -dodgeBgHeight;
  blendMode(BLEND); // 블렌드 모드 초기화

  fill("#000066");

  me.degY = rotationY;

  for (let i = 0; i < guests.length; i++) {
    totalDeg += guests[i].degY;
  }

  textAlign(CENTER, CENTER);
  // text(clickCount.value, width / 2, height / 2);
  text(radians(totalDeg), width / 2, 100);

  totalDeg = 0;

  if (!game.gameOver) {
    // 공유된 기울기 데이터 가져오기
    let sharedAccelerationX = 0;
    for (let guest of guests) {
      sharedAccelerationX += guest.accelerationX;
    }
    if (guests.length > 0) {
      sharedAccelerationX /= guests.length; // 평균 기울기 값
    }
    game.handleMotion(sharedAccelerationX); // 공유된 기울기 데이터 사용

    game.update(); // 게임 업데이트
    game.display(frameCount); // 게임 화면 표시
  } else {
    if (game.win) {
      image(successBg, 0, 0, windowWidth, windowHeight); // 게임 성공 배경 이미지 표시
      // textSize(50);
      // fill(0, 255, 0);
      // text("You Win!", width / 2, height / 2);
    } else {
      image(gameOverBg, 0, 0, windowWidth, windowHeight); // 게임 오버 배경 이미지 표시
      // textSize(50);
      // fill(255, 0, 0);
      // text("Game Over", width / 2, height / 2);
      drawRestartButton(); // 다시 시작 버튼 표시
    }
    // drawRestartButton(); // 다시 시작 버튼 표시
  }

  // 미니맵 그리기
  game.drawMiniMap();
}

function drawRestartButton() {
  let restartW = 200;
  let restartH = 100;
  let restartX = windowWidth / 2 - restartW / 2;
  let restartY = windowHeight / 5 * 4 - restartH / 2;
  console.log(restartX, restartY, restartW, restartH)

  if (restartButtonPressed) {
    image(buttonAgainPressedImg, restartX, restartY, restartW, restartH);
  } else if (mouseX > restartX && mouseX < restartX + restartW && mouseY > restartY && mouseY < restartY + restartH) {
    image(buttonAgainOverImg, restartX, restartY, restartW, restartH);
  } else {
    image(buttonAgainImg, restartX, restartY, restartW, restartH);
  }
}


function mousePressed() {
  if (introActive) {
    if (mouseX > startX && mouseX < startX + startW && mouseY > startY && mouseY < startY + startH) {
      startButtonPressed = true;
    }
  } else if (game.gameOver) {
    let restartW = 200;
    let restartH = 100;
    let restartX = windowWidth / 2 - restartW / 2;
    let restartY = windowHeight / 5 * 4 - restartH / 2;

    if (mouseX > restartX && mouseX < restartX + restartW && mouseY > restartY && mouseY < restartY + restartH) {
      restartButtonPressed = true;
    }
  }
}


function startGame() {
  introActive = false;
  loop(); // 게임 루프 재시작
}

function mouseReleased() {
  if (introActive && startButtonPressed) {
    if (mouseX > startX && mouseX < startX + startW && mouseY > startY && mouseY < startY + startH) {
      startGame();
    }
    startButtonPressed = false;
  } else if (game.gameOver && restartButtonPressed) {
    let restartW = 200;
    let restartH = 100;
    let restartX = windowWidth / 2 - restartW / 2;
    let restartY = windowHeight / 5 * 4 - restartH / 2;

    if (mouseX > restartX && mouseX < restartX + restartW && mouseY > restartY && mouseY < restartY + restartH) {
      game.reset();
    }
    restartButtonPressed = false;
  }
}

class ObstacleGame {
  constructor() {
    this.player = { x: width / 2, y: height - 50, size: 120 };
    this.obstacles = [];
    this.speed = 2;
    this.spawnRate = 60;
    this.counter = 0;
    this.distanceTraveled = 0;
    this.totalDistance = 5000; // 총 이동 거리 (맵의 길이)
    this.gameOver = false;
    this.win = false; // Initialize win state
  }

  reset() {
    this.player = { x: width / 2, y: height - 50, size: 120 };
    this.obstacles = [];
    this.counter = 0;
    this.distanceTraveled = 0;
    this.gameOver = false;
    this.win = false; // 게임 초기화
    loop(); // 게임 루프 재시작
  }

  handleMotion(accelerationX) {
    // 기울기 값을 사용하여 플레이어 이동
    const sensitivity = 2; // 기울기 민감도 조절
    this.player.x += accelerationX * sensitivity;

    if (this.player.x < 0) this.player.x = 0;
    if (this.player.x > width) this.player.x = width;
  }

  update() {
    this.counter++;
    this.distanceTraveled += this.speed; // 이동 거리 증가

    if (this.counter % this.spawnRate === 0) {
      this.spawnObstacle();
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      this.obstacles[i].y += this.speed;

      if (this.obstacles[i].y > height) {
        this.obstacles.splice(i, 1);
      }

      if (this.isColliding(this.player, this.obstacles[i])) {
        this.gameOver = true; // 게임 오버 상태로 설정
        this.win = false; // 게임 오버 상태
        break;
      }
    }

    // 목적지에 도달하면 게임 성공 처리
    if (this.distanceTraveled >= this.totalDistance) {
      this.gameOver = true;
      this.win = true; // 게임 성공 상태
      //noLoop();
    }
  }

  display(t) { // 로봇 애니메이션을 위해 변수 t 로 frameCount를 받음
    // 플레이어 이미지
    imageMode(CENTER);
    fill(0, 0, 255, 100);
    dodgeImgFrame = int(t / 5) % 2;
    image(dodgeImgRobots[dodgeImgFrame], this.player.x, this.player.y, this.player.size, this.player.size)
    //ellipse(this.player.x, this.player.y, this.player.size, this.player.size);

    fill(255, 0, 0, 100);
    for (let obstacle of this.obstacles) {
      // 장애물 이미지
      noSmooth();
      push();
      translate(obstacle.x, obstacle.y);
      rotate(t / 80 * obstacle.r)
      image(dodgeImgObstacles[obstacle.i], 0, 0, obstacle.size, obstacle.size);
      pop();
      rectMode(CENTER)
      //rect(obstacle.x, obstacle.y, obstacle.size, obstacle.size);
    }
    imageMode(CORNER); // 이미지모드 초기화
    rectMode(CORNER);// 초기화
  }

  drawMiniMap() {
    let miniMapWidth = 50;
    let miniMapHeight = 200;
    let miniPlayerSize = 5;

    // 미니맵 배경
    fill(200);
    rect(width - miniMapWidth - 10, 10, miniMapWidth, miniMapHeight);

    // 주인공 위치 표시
    fill(105, 255, 127);
    let miniPlayerY = map(this.distanceTraveled, 0, this.totalDistance, 10 + miniMapHeight, 10);
    ellipse(width - miniMapWidth / 2 - 10, miniPlayerY, miniPlayerSize, miniPlayerSize);

    // 목적지 표시
    fill(0, 255, 0);
    rect(width - miniMapWidth - 10, 10, miniMapWidth, 5);
  }

  spawnObstacle() {
    let size = 80;
    let x = random(0, width - size);

    let i = int(random(0, 5)); // 랜덤 이미지 고르기
    let r = random(-3, 3); // 랜덤회전 속도
    this.obstacles.push({ x: x, y: 0, size: size, i: i, r: r });
  }

  isColliding(player, obstacle) {
    return (
      player.x < obstacle.x + obstacle.size &&
      player.x + player.size > obstacle.x &&
      player.y < obstacle.y + obstacle.size &&
      player.y + player.size > obstacle.y
    );
  }
}

function keyPressed(event) {
  if (event.code === 'ArrowLeft') {
    moveLeft = true;
  } else if (event.code === 'ArrowRight') {
    moveRight = true;
  }
}

function keyReleased(event) {
  if (event.code === 'ArrowLeft') {
    moveLeft = false;
  } else if (event.code === 'ArrowRight') {
    moveRight = false;
  }
}
