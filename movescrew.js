// Game class
class Game {
  constructor() {
    this.screws = []; // 나사 객체를 담을 배열
    this.selectedScrew = null; // 선택된 나사 객체
    this.mode = "select"; // 현재 모드 ("select" 또는 "rotate")
    this.holeDepth = 100; // 구멍 깊이
    this.successed = 0; // 성공한 나사 수
    this.frame = 30; // 프레임 수
    this.isGameSuccess = false; // 게임 성공 여부
    this.isGameOver = false; // 게임 오버 여부
    this.previousDeg = 0; // 이전 각도
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
    if (this.mode === "rotate" && this.selectedScrew) { // 회전 모드이고 나사가 선택된 경우
      let diff = totalDeg - this.previousDeg;

      if (abs(diff) >= radians(90)) { // 각도 차이가 90도 이상인 경우
        if (!this.isGameOver && !this.isGameSuccess) { // 게임 오버 또는 성공 시 무시
          this.selectedScrew.move(); // 나사 회전
          this.previousDeg += radians(90) * (diff > 0 ? 1 : -1); // 90도 단위로 업데이트
        }
      }
    }

    this.show(); // 게임 상태 표시 (항상 호출되도록 위치 조정)
  }

  mousePressed() {
    if (this.isGameOver || this.isGameSuccess) return; // 게임 오버 또는 성공 시 무시
    this.selectedScrew = null; // 선택된 나사 초기화
    for (let screw of this.screws) {
      if (screw.isMouseOver()) { // 마우스가 나사 위에 있을 때
        this.selectedScrew = screw; // 나사 선택
        this.mode = "rotate"; // 모드 변경
        this.previousDeg = totalDeg; // 현재 각도로 초기화
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
    this.previousDeg = 0; // 이전 각도 초기화
  }
}
