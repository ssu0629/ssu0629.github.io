let shared;
let clickCount;
let totalAcceleration;
let guests;
let me;
let game2;
let lastMotionTime;
const threshold = 2; // 가속도의 기준치 설정 (필요에 따라 조정 가능)

// DOMContentLoaded 이벤트 리스너를 추가하여 HTML 문서가 완전히 로드된 후 onClick 함수를 버튼 클릭 이벤트에 연결
document.addEventListener("DOMContentLoaded", function() {
  const activateButton = document.getElementById('activateButton');
  activateButton.addEventListener('click', onClick);
});

// onClick 함수는 iOS 기기에서 motion 권한을 요청합니다.
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
    // iOS 13 이전 버전이나 다른 장치에서는 권한 요청 없이 바로 이벤트를 추가
  }
}

// devicemotion 이벤트 콜백 함수
function cb(event) {
  const acc = event.accelerationIncludingGravity || { x: 0, y: 0, z: 0 }; // null 체크 및 기본값 설정
  const acceleration = Math.sqrt((acc.x * acc.x) + (acc.y * acc.y) + (acc.z * acc.z)) || 0; // 가속도 벡터의 크기를 계산하고 NaN 방지
  if (acceleration > threshold) { // 기준치를 넘는 경우에만 업데이트
    me.acceleration = acceleration;
    lastMotionTime = millis();
  }
  console.log(`Acceleration: ${me.acceleration}`); // 가속도를 콘솔에 출력
}

// p5.js preload 함수로 party.js 연결 및 공유 데이터 초기화
function preload() {
  partyConnect(
    "wss://demoserver.p5party.org",
    "party_circle"
  );
  shared = partyLoadShared("shared", { x: 100, y: 100 });
  clickCount = partyLoadShared("clickCount", { value: 0 });
  guests = partyLoadGuestShareds();
  me = partyLoadMyShared({ acceleration: 0 });
}

// p5.js setup 함수로 캔버스 설정 및 초기 값 설정
function setup() {
  createCanvas(400, 400); // 400x400 크기의 캔버스를 생성
  noStroke(); // 윤곽선 없음

  // 호스트인 경우 초기 값을 설정
  if (partyIsHost()) {
    clickCount.value = 0;
    shared.x = 200;
    shared.y = 200;
  }

  totalAcceleration = 0; // 총 가속도 초기화
  lastMotionTime = millis();

  game2 = new Motorgame();
}

// 마우스를 클릭하면 공유 객체의 위치를 업데이트하고 클릭 수를 증가
function mousePressed() {
  shared.x = mouseX;
  shared.y = mouseY;
  clickCount.value++;

  if (game2.gameState === "fail") {
    let buttonX = width / 2 - 100;
    let buttonY = height / 2 + 50;
    let buttonWidth = 200;
    let buttonHeight = 50;

    if (mouseX > buttonX && mouseX < buttonX + buttonWidth && mouseY > buttonY && mouseY < buttonY + buttonHeight) {
      game2.reset();
    }
  }
}

// p5.js draw 함수로 매 프레임마다 호출되며 화면을 업데이트
function draw() {
  background('#ffcccc'); // 배경색 설정
  fill("#000066"); // 도형 색상 설정

  totalAcceleration = me.acceleration; // 현재 기기의 가속도를 저장

  // 각 게스트의 가속도 값을 합산
  for (let i = 0; i < guests.length; i++) {
    totalAcceleration += guests[i].acceleration;
  }

  console.log(`Total Acceleration: ${totalAcceleration}`); // 합산된 가속도 값을 콘솔에 출력

  game2.update(totalAcceleration);
  game2.display();

  textAlign(CENTER, CENTER); // 텍스트 정렬 설정
  text(clickCount.value, width / 2, height / 2); // 클릭 수를 화면에 표시
  text(totalAcceleration.toFixed(2), width / 2, 100); // 합산된 가속도 값을 화면에 표시
}

// 모터 돌리기 게임 class
class Motorgame {
  constructor() {
    this.propeller = new Propeller(width / 2, height / 2, 150);
    this.acceleration = 0;
    this.maxAcceleration = 100;
    this.energy = 0;
    this.maxEnergy = 10000;
    this.timeLimit = 10; // 타이머 제한 시간 (초)
    this.startTime = millis();
    this.gameState = "playing"; // 게임 상태: "playing", "success", "fail"
  }

  update(totalAcceleration) {
    if (this.gameState === "playing") {
      let currentTime = millis();
      
      if (totalAcceleration > threshold) { // 작은 움직임 무시
        this.acceleration = min(totalAcceleration, this.maxAcceleration);
      } else if (currentTime - lastMotionTime > 1000) { // 1초 동안 가속도가 0에 가까우면
        this.acceleration = max(this.acceleration - 0.5, 0); // 서서히 감소
      }
      
      this.energy = min(this.energy + this.acceleration * 0.5, this.maxEnergy);

      // 프로펠러 업데이트
      this.propeller.update(this.acceleration);

      // 타이머 체크
      let elapsedTime = (millis() - this.startTime) / 1000;
      if (elapsedTime >= this.timeLimit) {
        this.gameState = "fail";
      }

      // 에너지가 최대치에 도달하면 게임 성공 상태로 전환
      if (this.energy >= this.maxEnergy) {
        this.gameState = "success";
      }
    }
  }

  display() {
    if (this.gameState === "playing") {
      // 프로펠러 그리기
      this.propeller.display();

      // 에너지 게이지 그리기
      this.drawEnergyGauge(this.energy, this.maxEnergy);

      // 타이머 그리기
      this.drawTimer();
    } else if (this.gameState === "success") {
      // 게임 성공 화면
      textSize(64);
      fill(0);
      textAlign(CENTER, CENTER);
      text("게임 성공!", width / 2, height / 2);
    } else if (this.gameState === "fail") {
      // 게임 실패 화면
      textSize(64);
      fill(0);
      textAlign(CENTER, CENTER);
      text("게임 실패", width / 2, height / 2);

      // 다시 도전 버튼 그리기
      this.drawRetryButton();
    }
  }

  drawEnergyGauge(energy, maxEnergy) {
    let gaugeWidth = 200;
    let gaugeHeight = 20;
    let filledWidth = map(energy, 0, maxEnergy, 0, gaugeWidth);

    fill(200);
    rect(width / 2 - gaugeWidth / 2, height - 40, gaugeWidth, gaugeHeight);
    fill(0, 255, 0);
    rect(width / 2 - gaugeWidth / 2, height - 40, filledWidth, gaugeHeight);
  }

  drawTimer() {
    let elapsedTime = (millis() - this.startTime) / 1000;
    let remainingTime = max(this.timeLimit - elapsedTime, 0);
    let gaugeWidth = 200;
    let gaugeHeight = 20;
    let filledWidth = map(remainingTime, 0, this.timeLimit, 0, gaugeWidth);

    fill(200);
    rect(width / 2 - gaugeWidth / 2, 40, gaugeWidth, gaugeHeight);
    fill(255, 0, 0);
    rect(width / 2 - gaugeWidth / 2, 40, filledWidth, gaugeHeight);
  }

  drawRetryButton() {
    fill(0, 255, 0);
    rect(width / 2 - 100, height / 2 + 50, 200, 50);
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("다시 도전", width / 2, height / 2 + 75);
  }

  reset() {
    this.propeller = new Propeller(width / 2, height / 2, 150);
    this.acceleration = 0;
    this.energy = 0;
    this.startTime = millis();
    this.gameState = "playing";
  }
}

// 프로펠러 그리는 class
class Propeller {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.angle = 0;
    this.speed = 0;
  }

  update(speed) {
    this.speed = speed;
    this.angle += this.speed;
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    fill(0); // 프로펠러 색을 검정색으로 설정

    // 프로펠러 블레이드 그리기
    for (let i = 0; i < 6; i++) {
      rotate(60);
      this.drawBlade();
    }

    pop();
  }

  drawBlade() {
    let bladeWidth = this.size / 2; // 블레이드의 폭을 조절하는 변수
    beginShape();
    vertex(0, 0);
    vertex(this.size, -bladeWidth / 4);
    vertex(this.size, bladeWidth / 4);
    endShape(CLOSE);
  }
}
