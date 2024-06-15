// 모터 돌리기 게임 class
class Motorgame {
  constructor() {
    this.acceleration = 0;
    this.maxAcceleration = 60;
    this.energy = 0;
    this.maxEnergy = 8000;
    this.gameState = "intro"; // 게임 상태: "intro", "playing", "success", "fail"
    this.successTime = 0; // 충전 완료 후 경과 시간 계산
  }

  update(totalAccelerationChange) {
    if (this.gameState === "playing") {
      if (totalAccelerationChange > threshold) { // 기준치를 넘는 경우에만 업데이트
        this.acceleration = min(totalAccelerationChange, this.maxAcceleration);
        this.energy = min(this.energy + this.acceleration * 0.5, this.maxEnergy);
      } else {
        // 가속도 변화가 기준치 이하일 때 에너지를 감소
        this.acceleration = 0;
        this.energy = max(this.energy - 5, 0);
      }

      // 에너지가 최대치에 도달하면 게임 성공 상태로 전환
      if (this.energy >= this.maxEnergy) {
        this.gameState = "success";
        this.successTime = frameCount; // 성공 시간을 현재 frameCount로 설정
        progress++;
      }
    }
  }

  display() {
    if (this.gameState === "playing" || this.gameState === "success") {


      // 모터 애니메이션
      if (this.acceleration > 0 && this.gameState === "playing") {
        motorImgNow = (motorImgNow + 1) % 8; // 애니메이션 프레임 업데이트
      }
      motorImg = motorImgs[motorImgNow + 1];
      image(motorImg, shared.slime.x - 400, shared.slime.y - 300, 800, 600);

      // 배터리 애니메이션
      motorBatteryImgNow = int(1 + 7 * (this.energy / this.maxEnergy)); // 점수 0~10000 값을 1~8로 나오도록
      if (this.gameState === "success") {
        motorBatteryImgNow = 8; // 충전 완료된 배터리 이미지로 설정
      }
      motorBatteryImg = motorBatteryImgs[motorBatteryImgNow];
      image(motorBatteryImg, shared.slime.x - 400, shared.slime.y - 300, 800, 600);
    }

    if (this.gameState === "success") { 
      if (frameCount - this.successTime <= 60) { // 약 2초간 배터리 이미지 표시
        motorBatteryImgNow = 8;
        motorBatteryImg = motorBatteryImgs[motorBatteryImgNow];
        image(motorBatteryImg, shared.slime.x - 400, shared.slime.y - 300, 800, 600);
      } else {
        image(successBg, shared.slime.x - 400, shared.slime.y - 300, 800, 600); // 성공 배경 이미지 표시
      }
    }
  }

  drawEnergyGauge(energy, maxEnergy) {
    let gaugeWidth = 200;
    let gaugeHeight = 20;
    let filledWidth = map(energy, 0, maxEnergy, 0, gaugeWidth);

    fill(200);
    rect(shared.slime.x - gaugeWidth / 2, shared.slime.y - 40, gaugeWidth, gaugeHeight);
    fill(0, 255, 0);
    rect(shared.slime.x - gaugeWidth / 2, shared.slime.y - 40, filledWidth, gaugeHeight);
  }


  reset() {
    this.acceleration = 0;
    this.energy = 0;
    this.gameState = "intro";
    this.successTime = 0; // 성공 시간도 초기화
  }
}

