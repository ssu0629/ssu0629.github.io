let shared;
let clickCount;
let totalDeg;
let guests;
let me;
let game;
let checkpointPassed = [false, false, false]; // 체크포인트 통과 여부를 저장
let rotationCount = 0; // 회전 수를 저장
let screwselectedImgs = new Array(8);
let screwBgImg;
let introImg;
let buttonState;
// let gameState;

// DOMContentLoaded 이벤트 리스너를 추가하여 HTML 문서가 완전히 로드된 후 onClick 함수를 버튼 클릭 이벤트에 연결
document.addEventListener("DOMContentLoaded", function() {
  const activateButton = document.getElementById('activateButton');
  if (activateButton) {
    activateButton.addEventListener('click', onClick);
  } else {
    console.error("Activate button not found.");
  }
});

// onClick 함수는 iOS 기기에서 motion 권한을 요청합니다.
function onClick() {
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(permissionState => {
        if (permissionState == 'granted') {
          window.addEventListener('deviceorientation', cb);
        }
      })
      .catch(console.error);
  } else {
    window.addEventListener('deviceorientation', cb);
    // iOS 13 이전 버전이나 다른 장치에서는 권한 요청 없이 바로 이벤트를 추가
  }
}

// deviceorientation 이벤트 콜백 함수
function cb(event) {
  console.log(event.gamma);
  if (event.gamma !== null) {
    me.degY = radians(event.gamma); // 기기의 y축 기울기 값을 라디안으로 변환하여 degY에 저장
    console.log("degY");
    console.log(me.degY);
  }
}

// p5.js preload 함수로 party.js 연결 및 공유 데이터 초기화
function preload() {
  console.log("preload called");
  partyConnect(
    "wss://demoserver.p5party.org",
    "party_circle"
  );

  // 애니메이션 파일 불러오기
  for (let i = 0; i < 8; i++) { // 파일이름이 1부터 8임 (0부터 7이 아님)
    screwselectedImgs[i] = loadImage("assets/assets for use/minigame_screw/screwSelected/screwSelected" + (i+1) + ".png");
  }
  screwBgImg = loadImage("assets/assets for use/minigame_screw/screwBg.png");
  //introImg = loadImage("assets/intro.png"); // 시작 화면 이미지 파일 로드

  // 버튼 이미지 불러오기
  buttonStartImg = loadImage("assets/buttonStart.png");
  buttonStartOverImg = loadImage("assets/buttonStartOver.png");
  buttonStartPressedImg = loadImage("assets/buttonStartPressed.png");

  shared = partyLoadShared("shared", { x: 200, y: 200 });
  clickCount = partyLoadShared("clickCount", { value: 0 });
  guests = partyLoadGuestShareds();
  me = partyLoadMyShared({ accelerationChange: 0 });

  neoDunggeunmoProFont = loadFont("assets/NeoDunggeunmoPro-Regular.ttf"); // 폰트 로드
}

// p5.js setup 함수로 캔버스 설정 및 초기 값 설정
function setup() {
  console.log("setup called");
  createCanvas(1280, 960); // 1280x960 크기의 캔버스를 생성
  noStroke(); // 윤곽선 없음

  // 호스트인 경우 초기 값을 설정
  if (partyIsHost()) {
    clickCount.value = 0;
    shared.x = 200;
    shared.y = 200;
  }

  game = new Game_test();
  game.setup(); // 미니게임1 설정
  totalDeg = 0; // 총 회전 각도 초기화

  // 버튼 위치 및 크기 설정
  buttonX = windowWidth / 2 - 100;
  buttonY = windowHeight / 2 + 150;
  buttonWidth = 200;
  buttonHeight = 50;
}

// 마우스를 클릭하면 공유 객체의 위치를 업데이트하고 클릭 수를 증가
function mousePressed() {
  game.mousePressed(); // 미니게임 1 마우스 클릭 처리
}

// 키가 눌렸을 때 호출되는 함수
function keyPressed() {
  if (key === ' ') { // 스페이스바를 눌렀을 때
    if (game.selectedScrew) { // 선택된 나사가 있는 경우
      game.selectedScrew.move(); // 나사를 회전시킴
    }
  }
}

// p5.js draw 함수로 매 프레임마다 호출되며 화면을 업데이트
function draw() {
  background('#ffcccc'); // 배경색 설정
  fill("#000066"); // 도형 색상 설정

  // 게임 화면 표시
  // 애니메이션 배경 그리기
  noSmooth();
  noStroke();
  image(screwBgImg, windowWidth / 2 - 400, windowHeight / 2 - 300, 800, 600);

  // 각 게스트의 회전 값을 합산
  totalDeg = 0; // 합산된 회전 값을 초기화
  for (let i = 0; i < guests.length; i++) {
    totalDeg += guests[i].degY; // 각 게스트의 y축 기울기를 합산
  }
  console.log("totalDeg");
  console.log(totalDeg);

  // 360도 회전을 인식하기 위한 체크포인트 로직
  updateRotation();

  game.draw(); // 미니게임1 그림

  // 게임 오버 상태와 관계없이 항상 텍스트를 그립니다.
  textAlign(CENTER, CENTER); // 텍스트 정렬 설정
  fill("#000066"); // 텍스트 색상 설정
  text(totalDeg.toFixed(2) + " rad", width / 2, 100); // 합산된 기울기 값을 라디안으로 변환하여 화면에 표시

  // console.log(totalDeg); // 합산된 기울기 값을 콘솔에 출력
}

// 기기의 회전 상태를 업데이트하고 나사의 move 함수를 호출하는 함수
function updateRotation() {
  const checkpoints = [radians(120), radians(240), radians(360)];

  if (totalDeg >= checkpoints[0] && !checkpointPassed[0]) {
    checkpointPassed[0] = true;
  }
  if (totalDeg >= checkpoints[1] && !checkpointPassed[1]) {
    checkpointPassed[1] = true;
  }
  if (totalDeg >= checkpoints[2] && !checkpointPassed[2]) {
    checkpointPassed[2] = true;
  }

  if (checkpointPassed.every(Boolean)) {
    rotationCount++;
    game.selectedScrew.move();
    checkpointPassed = [false, false, false]; // 체크포인트 초기화
  }
}

// 미니게임1 나사돌리기 실행 class
class Game_test {
  constructor() {
    this.screws = []; // 나사 객체를 담을 배열
    this.selectedScrew = null; // 선택된 나사 객체
    this.mode = "select"; // 현재 모드 ("select" 또는 "rotate")
    this.holeDepth = 100; // 구멍 깊이
    this.successed = 0; // 성공한 나사 수
    this.frame = 30; // 프레임 수
    this.isGameSuccess = false; // 게임 성공 여부
    this.isGameOver = false; // 게임 오버 여부
  }

  setup() {
    console.log("Game setup called");
    this.createScrews(); // 나사 객체 생성
    this.restartButton = createButton("다시 시작"); // 다시 시작 버튼 생성
    this.restartButton.position(width / 2 - 50, height / 2); // 버튼 위치 설정
    this.restartButton.mousePressed(this.resetGame.bind(this)); // 버튼 클릭 시 게임 리셋
    this.restartButton.hide(); // 버튼 숨기기
    this.resetTimer(); // 타이머 초기화
  }

  draw() {
    this.show(); // 게임 상태 표시 (항상 호출되도록 위치 조정)
  }

  mousePressed() {
    if (this.isGameOver || this.isGameSuccess) return; // 게임 오버 또는 성공 시 무시
    this.selectedScrew = null; // 선택된 나사 초기화
    for (let screw of this.screws) {
      if (screw.isMouseOver()) { // 마우스가 나사 위에 있을 때
        this.selectedScrew = screw; // 나사 선택
        this.mode = "rotate"; // 모드 변경
        break;
      }
    }
  }

  createScrews() {
    this.screws = []; // 나사 배열 초기화
    this.screws.push(new Screw(200, 200)); // 나사 객체 생성 및 배열에 추가
    this.screws.push(new Screw(600, 200));
    this.screws.push(new Screw(200, 400));
    this.screws.push(new Screw(600, 400));
  }

  show() {
    for (let screw of this.screws) {
      screw.show(); // 각 나사 객체 표시
    }

    if (this.selectedScrew) {
      this.selectedScrew.highlight(); // 선택된 나사 하이라이트
    }

    if (this.successed == 4) { // 모든 나사가 성공한 경우
      this.isGameSuccess = true; // 게임 성공 상태로 설정
    }

    this.displayTimer(); // 타이머 표시

    if (!this.isGameOver) { // 게임 오버가 아닌 경우
      fill(150);
      textAlign(CENTER);
      textSize(20);

      if (this.isGameSuccess) { // 게임 성공 시
        fill(255, 0, 0);
        textSize(32);
        text("게임 성공!", width / 2, height / 2 - 50); // 성공 메시지 표시
      }
    }
  }

  displayTimer() {
    if (this.isGameSuccess) return; // 게임 성공 시 타이머 멈춤

    let timePassed = millis() - this.timerStart; // 경과 시간 계산
    let timeLeft = this.timeLimit - timePassed; // 남은 시간 계산
    let barWidth = map(timeLeft, 0, this.timeLimit, 0, width - 20); // 타이머 바 너비 계산

    if (timeLeft <= 0) { // 시간이 다 지난 경우
      this.gameOver(); // 게임 오버 처리
      fill(255, 0, 0);
      textSize(32);
      textAlign(CENTER);
      text("시간 초과! 게임 오버", width / 2, height / 2 - 50); // 게임 오버 메시지 표시
      this.restartButton.show(); // 다시 시작 버튼 표시
    } else if (!this.isGameSuccess) { // 게임 성공이 아닌 경우
      fill(255, 0, 0);
      rect(10, height - 100, barWidth, 20); // 타이머 바 표시
    }
  }

  gameOver() {
    this.isGameOver = true; // 게임 오버 상태로 설정
  }

  resetTimer() {
    this.timerStart = millis(); // 타이머 시작 시간 설정
    this.timeLimit = 50000; // 타이머 제한 시간 설정 (50초)
  }

  resetGame() {
    this.restartButton.hide(); // 다시 시작 버튼 숨기기
    this.successed = 0; // 성공한 나사 수 초기화
    this.selectedScrew = null; // 선택된 나사 초기화
    this.resetTimer(); // 타이머 초기화
    this.createScrews(); // 나사 객체 재생성
    this.isGameOver = false; // 게임 오버 상태 초기화
    this.isGameSuccess = false; // 게임 성공 상태 초기화
    checkpointPassed = [false, false, false]; // 체크포인트 초기화
    rotationCount = 0; // 회전 수 초기화
  }
}

// 나사 생성 class
class Screw {
  constructor(x, y) {
    this.x = x; // 나사의 x 좌표
    this.y = y; // 나사의 y 좌표
    this.size = 50; // 나사의 크기
    this.depth = 0; // 나사의 깊이
    this.threadTurns = 8; // 나사 회전 수
    this.threadHeight = 100; // 나사 높이
    this.threadWidth = 10; // 나사 너비
    this.spacing = this.threadHeight / this.threadTurns; // 나사 회전 간격
    this.angle = 0; // 나사의 각도
    this.successed = false; // 나사 성공 여부
    this.imageIndex = 0; // 이미지 인덱스 초기화
    this.imageWidth = 150;
    this.imageHeight = 300;
  }

  show() {
    push();
    translate(this.x, this.y + this.depth); // 나사의 위치로 이동

    // 나사 이미지 애니메이션 표시
    image(screwselectedImgs[this.imageIndex], 0, 0, this.imageWidth, this.imageHeight);

    pop();
  }

  

  update() {
    this.angle += PI / (2 * game.frame); // 나사의 각도 업데이트
    if (this.angle >= TWO_PI) {
      this.angle = 0;
    }
  }

  highlight() {
    console.log("s");
    push();
    translate(this.x, this.y + this.depth); // 나사의 위치로 이동
    noFill();
    stroke(255, 0, 0);
    strokeWeight(3);
    ellipse(0, 0, this.size + 100, this.size + 100); // 하이라이트 그림
    pop();
  }

  isMouseOver() {
    let d = dist(mouseX, mouseY, this.x + this.imageWidth/2, this.y + this.imageHeight/2 + this.depth); // 마우스 위치와 나사 위치의 거리 계산
    return d < this.imageWidth / 2; // 마우스가 나사 위에 있는지 확인
  }

  move() {
    if (this.imageIndex < 7) { // 나사가 구멍 깊이보다 깊지 않은 경우
      this.updateImageIndex(); // 이미지 인덱스 업데이트
      if (!this.successed && this.imageIndex == 7) { // 나사가 성공적으로 들어간 경우
        game.successed += 1; // 게임 성공 수 증가
        this.successed = true; // 나사 성공 상태로 설정
      }
    } else {
      this.imageIndex = 7; // 나사 깊이 고정
    }
  }

  updateImageIndex() {
    this.imageIndex = (this.imageIndex + 1); // 이미지 인덱스 업데이트
  }
}
