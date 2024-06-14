let theta1 = 0
let theta2 = 0
let theta3 = 0

let dthetaXdt = 0;
let dthetaYdt = 0;
let dthetaZdt = 0;

let dtheta1dt = 0;
let dtheta2dt = 0;
let dtheta3dt = 0;

let thetaX = 0;
let thetaY = 0;
let thetaZ = 0;

let det = false

let t = 0, dt = 1;

let shared;
let clickCount;

let guests;
let me;
let game;
let checkpointPassed = [false, false, false]; // 체크포인트 통과 여부를 저장
let rotationCount = 0; // 회전 수를 저장
let screwImgs = new Array(8);
let screwSelectedImgs = new Array(8);
let screwBgImg;
let introImg;
let gameState;

let centerX, centerY;
let totalDeg, pTotalDeg;
let halfCount = 0
let count = 0;
let pCount
let pANum = 0;
let areaNum = 0;
let clockWise = {
  1: false,
  2: false,
  3: false,
};
let antiClockWise = {
  1: false,
  2: false,
  3: false,
};



// DOMContentLoaded 이벤트 리스너를 추가하여 HTML 문서가 완전히 로드된 후 onClick 함수를 버튼 클릭 이벤트에 연결
document.addEventListener("DOMContentLoaded", function () {
  const activateButton = document.getElementById('activateButton');
  if (activateButton) {
    activateButton.addEventListener('click', onClick);
  } else {
    console.error("Activate button not found.");
  }
});

// // onClick 함수는 iOS 기기에서 motion 권한을 요청합니다.
// function onClick() {
//   if (typeof DeviceOrientationEvent.requestPermission === 'function') {
//     DeviceOrientationEvent.requestPermission()
//       .then(permissionState => {
//         if (permissionState === 'granted') {
//           window.addEventListener('deviceorientation', cb);
//         }
//       })
//       .catch(console.error);
//   } else {
//     window.addEventListener('deviceorientation', cb);
//     // iOS 13 이전 버전이나 다른 장치에서는 권한 요청 없이 바로 이벤트를 추가
//   }
// }


function cb(event) {
  dthetaXdt = event.rotationRate.alpha * PI / 180;
  dthetaYdt = event.rotationRate.beta * PI / 180;
  dthetaZdt = event.rotationRate.gamma * PI / 180;

  let ct = millis() / 1000;
  dt = ct - t;
  t = ct;

  det = true;
}

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
    // handle regular non iOS 13+ devices
  }
}




function setup() {
  createCanvas(400, 400, WEBGL);
}





function draw() {

  background(0);

  directionalLight(255, 255, 255, -1, -1, -1);
  ambientLight(80);

  dtheta1dt = dthetaXdt;
  dtheta2dt = dthetaYdt * sin(thetaX) + dthetaZdt * cos(thetaX);
  dtheta3dt = -dthetaYdt * cos(thetaX) * cos(theta2)
    + dthetaZdt * sin(thetaX) * cos(theta2)


  scale(1.5)


  stroke(0)


  let r1 = 100, r2 = 80, r3 = 60;

  noStroke()
  let detailX = 48 * 2;
  let detailY = 32;

  //outer ring
  torus(r1, 5, detailX, detailY)

  push()
  translate((r1 + r2) / 2, 0, 0)
  rotateZ(PI / 2)
  cylinder(5, 20)
  pop()
  push()
  translate(-(r1 + r2) / 2, 0, 0)
  rotateZ(PI / 2)
  cylinder(5, 20)
  pop()

  //middle ring
  rotateX(theta1)
  rotateX(PI / 2)
  torus(80, 5, detailX, detailY)

  push()
  translate(0, (r2 + r3) / 2, 0)
  rotateY(PI / 2)
  cylinder(5, 20)
  pop()

  push()
  translate(0, -(r2 + r3) / 2, 0)
  rotateY(PI / 2)
  cylinder(5, 20)
  pop()


  //inner ring
  rotateY(theta2);
  rotateY(PI / 2)
  torus(r3, 5, detailX, detailY)

  //box
  rotateX(theta3);
  box(50)
  rotateZ(PI / 2)
  cylinder(5, 2 * r3)

  if (det && dtheta1dt == dtheta1dt) {
    theta1 += dtheta1dt * dt;
    theta2 += dtheta2dt * dt;
    theta3 += dtheta3dt * dt;

    thetaX += dthetaXdt * dt;
    thetaY += dthetaYdt * dt;
    thetaZ += dthetaZdt * dt;
  }

}
