let shared;
let clickCount;

let totalDeg;
let guests;
let me;

function preload() {
  partyConnect(
    "wss://demoserver.p5party.org",
    "party_circle"
  );
  shared = partyLoadShared("shared", { x: 100, y: 100 });
  clickCount = partyLoadShared("clickCount", { value: 0 });
  guests = partyLoadGuestShareds();
  me = partyLoadMyShared({ degX: 0 });
}

function setup() {
  createCanvas(400, 400);
  noStroke();

  if (partyIsHost()) {
    clickCount.value = 0;
    shared.x = 200;
    shared.y = 200;
  }

  totalDeg = 0;

  // 권한 요청
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(response => {
        if (response == 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          alert('DeviceOrientation 권한이 거부되었습니다.');
        }
      })
      .catch(console.error);
  } else {
    // iOS 13 이하 또는 다른 브라우저의 경우
    window.addEventListener('deviceorientation', handleOrientation);
  }
}

function mousePressed() {
  shared.x = mouseX;
  shared.y = mouseY;
  clickCount.value++;
}

function draw() {
  background('#ffcccc');
  fill("#000066");

  textAlign(CENTER, CENTER);
  text(clickCount.value, width / 2, height / 2);

  // 회전 값 합산 초기화
  totalDeg = 0;

  // 각 게스트의 회전 값을 합산
  for (let i = 0; i < guests.length; i++) {
    totalDeg += guests[i].degX;
  }

  text(radians(totalDeg), width / 2, 100);

  // 키 입력에 따라 shared 위치 조정
  if (keyIsPressed) {
    if (key === 'w') {
      shared.x += 0.5 * radians(totalDeg);
      shared.y -= 0.5;
    } else if (key === 's') {
      shared.x += 0.5 * radians(totalDeg);
      shared.y += 0.5;
    }
  }

  ellipse(shared.x, shared.y, 100, 100);

  // 내 회전 값을 업데이트
  me.degX = rotationX;
}

function handleOrientation(event) {
  me.degX = event.beta; // X축 회전 값을 업데이트
}
