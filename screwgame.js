// Game_test 클래스의 mousePressed 메서드에서 나사 선택 상태를 업데이트
class ScrewGame {
    constructor() {
      this.screws = []; // 나사 객체를 담을 배열
      this.selectedScrew = null; // 선택된 나사 객체
      this.mode = "select"; // 현재 모드 ("select" 또는 "rotate")
      this.holeDepth = 100; // 구멍 깊이
      this.successed = 0; // 성공한 나사 수
      this.frame = 30; // 프레임 수
      this.isGameSuccess = false; // 게임 성공 여부
      this.isGameOver = false; // 게임 오버 여부
      this.gameState = "intro"; // 게임 상태: "intro", "playing", "success", "fail"
    }
  
    setup() {
      console.log("Game setup called");
      this.createScrews(); // 나사 객체 생성
      // this.restartButton = createButton("다시 시작"); // 다시 시작 버튼 생성
      // this.restartButton.position(width / 2 - 50, height / 2); // 버튼 위치 설정
      // this.restartButton.mousePressed(this.resetGame.bind(this)); // 버튼 클릭 시 게임 리셋
      // this.restartButton.hide(); // 버튼 숨기기
    }
  
    draw() {
      this.show(); // 게임 상태 표시 (항상 호출되도록 위치 조정)
    }
  
    mousePressed() {
      if (this.isGameOver || this.isGameSuccess) return; // 게임 오버 또는 성공 시 무시
  
      let newSelectedScrew = null;
      for (let screw of this.screws) {
        if (screw.isMouseOver()) { // 마우스가 나사 위에 있을 때
          newSelectedScrew = screw;
          break;
        }
      }
  
      if (newSelectedScrew && newSelectedScrew !== this.selectedScrew) {
        if (this.selectedScrew) {
          this.selectedScrew.selected = false; // 현재 선택된 나사의 선택 상태 해제
        }
        this.selectedScrew = newSelectedScrew; // 새로 선택된 나사
        halfCount = 0;
        count = 0;
        pCount = 0;
        this.selectedScrew.selected = true; // 나사 선택 상태 설정
        this.mode = "rotate"; // 모드 변경
      }
    }
    createScrews() {
      this.screws = []; // 나사 배열 초기화
      this.screws.push(new Screw(shared.slime.x - 150, shared.slime.y - 90)); // 나사 객체 생성 및 배열에 추가
      this.screws.push(new Screw(shared.slime.x - 150, shared.slime.y + 90));
      this.screws.push(new Screw(shared.slime.x + 150, shared.slime.y - 90));
      this.screws.push(new Screw(shared.slime.x + 150, shared.slime.y + 90));
    }
  
    show() {
      for (let screw of this.screws) {
        screw.show(); // 각 나사 객체 표시
      }
  
      if (this.selectedScrew) {
        //this.selectedScrew.highlight(); // 선택된 나사 하이라이트
  
        areaNum = area(totalDeg);
  
        updateDirection();
        updateCount();
        if (pCount < count && !this.selectedScrew.successed && !this.isGameOver) {
          this.selectedScrew.move()
        }
  
        pANum = areaNum;
        pTotalDeg = totalDeg;
        pCount = count
  
      }
  
      if (this.successed == 4) { // 모든 나사가 성공한 경우
        this.isGameSuccess = true; // 게임 성공 상태로 설정
      }
  
  
   
      if (this.isGameSuccess) {
        image(successBg, shared.slime.x - 400, shared.slime.y - 300, 800, 600); // 성공 배경 이미지 표시
        if (progress == 1) {
          progress++;
        }
      } else if (this.isGameOver) {
        image(gameoverBg, shared.slime.x - 400, shared.slime.y - 300, 800, 600); // 게임 오버 배경 이미지 표시
        this.displayRestartButton(); // 다시 시작 버튼 표시
      }
    }
  
    displayRestartButton() {
      let buttonImg;
      if (buttonState === "normal") {
        buttonImg = buttonAgainImg;
      } else if (buttonState === "over") {
        buttonImg = buttonAgainOverImg;
      } else if (buttonState === "pressed") {
        buttonImg = buttonAgainPressedImg;
      }
      image(buttonImg, buttonX, buttonY, buttonWidth, buttonHeight);
    }
  
  

  
    gameOver() {
      this.isGameOver = true; // 게임 오버 상태로 설정
    }
  

  
    resetGame() {
      this.successed = 0; // 성공한 나사 수 초기화
      this.selectedScrew = null; // 선택된 나사 초기화
      this.createScrews(); // 나사 객체 재생성
      this.isGameOver = false; // 게임 오버 상태 초기화
      this.isGameSuccess = false; // 게임 성공 상태 초기화
      checkpointPassed = [false, false, false]; // 체크포인트 초기화
      rotationCount = 0; // 회전 수 초기화
      this.gameState = 'intro';
    }
  
  }