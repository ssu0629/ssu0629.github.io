class MovingGame {
  constructor() {
    this.directions = [];
    this.currentDirections = [];
    this.round = 1;
    this.maxRounds = 4;
    this.baseTimeLimit = 30000; // 기본 30초
    this.startTime = 0;
    this.gameOver = false;
    this.gameStarted = false;
    this.success = false;
    this.restartButton = createButton('Restart');
    this.restartButton.position(width / 2 - 100, height - 200);
    this.restartButton.size(100, 50);
    this.restartButton.mousePressed(() => this.resetGame());
    this.restartButton.hide();
    this.isButtonPressed = false;
    this.isButtonOver = false;
    this.isButtonPressedAgain = false;
    this.isButtonOverAgain = false;
    this.isButtonPressedClose = false;
    this.isButtonOverClose = false;
  }

  startNewRound() {
    if (this.round > this.maxRounds) {
      this.success = true;
      this.gameOver = true;
      return;
    }

    this.directions = [];
    for (let i = 0; i < 2 * this.round + 3; i++) {
      this.directions.push(this.randomDirection());
    }
    this.currentDirections = [...this.directions];
    this.startTime = millis();
  }

  randomDirection() {
    const directions = ['UP', 'LEFT', 'DOWN', 'RIGHT'];
    return random(directions);
  }

  getTimeLimit() {
    return this.baseTimeLimit + this.round * 1000; // 라운드마다 1초 추가
  }

  update() {
    if (this.gameOver) {
      return;
    }

    if (millis() - this.startTime > this.getTimeLimit()) {
      this.gameOver = true;
    }
  }

  draw(storedDegX,storedDegY) {

    if (!this.gameStarted) {
      this.drawStartScreen();
      return;
    }

    if (this.gameOver) {
      if (this.success) {
        this.drawSuccessScreen();
        if (progress == 3) {
          progress++;
        }
      } else {
        this.drawGameOverScreen();
      }
      return;
    }

    image(boostImgBg, shared.slime.x - 400, shared.slime.y - 300, 800, 600);

    //엔터누를때 버튼 누르는 이미지
    let boostButtonPressed = 0
    if (keyIsPressed && keyCode === ENTER) boostButtonPressed = 1;
    else boostButtonPressed = 0;
    image(boostButtonImgs[boostButtonPressed], shared.slime.x - 400, shared.slime.y - 300, 800, 600);

    let boostDirection = 0;
    if (storedDegY > 0.5) {
      boostDirection = 4;
    } else if (storedDegY < -0.5) {
      boostDirection = 3;
    } else if (storedDegX > 0.5) {
      boostDirection = 2;
    } else if (storedDegX < -0.5) {
      boostDirection = 1;
    }


    image(boostImgs[boostDirection], shared.slime.x - 400, shared.slime.y - 300, 800, 600);

    this.drawDirections();
    this.drawTimer();
  }

  drawStartScreen() {
    image(boostIntroBg, shared.slime.x - 400, shared.slime.y - 300, 800, 600);
    let img;
    if (this.isButtonPressed) {
      img = buttonStartPressedImg;
    } else if (this.isButtonOver) {
      img = buttonStartOverImg;
    } else {
      img = buttonStartImg;
    }
    noSmooth();
    image(img, shared.slime.x - buttonWidth / 2, shared.slime.y + 200 - buttonHeight / 2 - 10, buttonWidth, buttonHeight);
  }

  drawGameOverScreen() {
    // textSize(32);
    // textAlign(CENTER, CENTER);
    // text('Times Up! You Lost!', width / 2, height / 2 - 40);

    image(boostImgBg, shared.slime.x - 400, shared.slime.y - 300, 800, 600);

    image(gameoverBg, shared.slime.x - 400, shared.slime.y - 300, 800, 600);

    // this.restartButton.show();

    let img;
    if (this.isButtonPressedAgain) {
      img = buttonAgainPressedImg;
    } else if (this.isButtonOverAgain) {
      img = buttonAgainOverImg;
    } else {
      img = buttonAgainImg;
    }
    image(img, shared.slime.x - buttonWidth / 2, shared.slime.y + 200 - buttonHeight / 2 - 10, buttonWidth, buttonHeight);
  }

  drawSuccessScreen() {
    // textSize(32);
    // textAlign(CENTER, CENTER);
    // text('Congratulations! You Won!', width / 2, height / 2 - 40);

    image(boostImgBg, shared.slime.x - 400, shared.slime.y - 300, 800, 600);

    image(successBg, shared.slime.x - 400, shared.slime.y - 300, 800, 600);


    // this.restartButton.show();

    // let img;
    // if (this.isButtonPressedClose) {
    //   img = buttonClosePressedImg;
    // } else if (this.isButtonOverClose) {
    //   img = buttonCloseOverImg;
    // } else {
    //   img = buttonCloseImg;
    // }
    // image(img, shared.slime.x - buttonWidth / 2, shared.slime.y + 200 - buttonHeight / 2 - 10, buttonWidth, buttonHeight);
  }

  drawDirections() {
    textSize(40);
    fill('#A6E31E');
    stroke('#31293d');
    strokeWeight(10);
    textAlign(CENTER, CENTER);
    for (let i = 0; i < this.currentDirections.length; i++) {

    text(this.getArrowSymbol(this.currentDirections[i]), shared.slime.x + (i - (this.currentDirections.length - 1) / 2) * 60, shared.slime.y - 185);
    
  }
    textSize(32);
  }

  drawTimer() {
    let elapsedTime = millis() - this.startTime;
    let timerWidth = map(elapsedTime, 150, this.getTimeLimit(), 800 - 124, 0);


    fill('#31293d');
    stroke('#31293d');
    strokeWeight(5);
    rect(shared.slime.x - 400 + 48, shared.slime.y + 300 - 64, 800 - 94, 20);
    noStroke();
    noStroke();
    fill('#A6E31E');
    rect(shared.slime.x - 400 + 50, shared.slime.y + 300 - 62, timerWidth, 16); // 레트로 스타일 타이머 막대

  }

  handleKeyPressed() {
    if (!this.gameStarted) {
      this.gameStarted = true;
      this.startNewRound();
      return;
    }

    if (this.gameOver) {
      return;
    }
  }

  degmatch(storedDegX, storedDegY) {
    let inputDirection = null;
    fill(0);
    if (storedDegY > 0.5) {
      inputDirection = 'RIGHT';
    } else if (storedDegY < -0.5) {
      inputDirection = 'LEFT';
    } else if (storedDegX > 0.5) {
      inputDirection = 'DOWN';
    } else if (storedDegX < -0.5) {
      inputDirection = 'UP';
    }

    // 첫 번째 방향과 현재 방향을 비교하여 일치하면 첫 번째 방향만 제거
    if (inputDirection && this.currentDirections.length > 0 && inputDirection === this.currentDirections[0]) {
      this.currentDirections.shift();
      console.log("Input matched:", inputDirection, "Remaining directions:", this.currentDirections);
      if (this.currentDirections.length === 0) {
        this.round++;
        this.startNewRound();
      } else {
        lastDirectionText = `StoredDegX: ${storedDegX.toFixed(2)}, StoredDegY: ${storedDegY.toFixed(2)}, Direction: ${inputDirection}`;
      }
    }
  }

  resetGame() {
    this.round = 1;
    this.gameOver = false;
    this.gameStarted = false;
    this.success = false;
    this.restartButton.hide();
    this.startNewRound();
  }

  getArrowSymbol(direction) {
    switch (direction) {
      case 'UP':
        return '↑';
      case 'LEFT':
        return '←';
      case 'DOWN':
        return '↓';
      case 'RIGHT':
        return '→';
    }
  }
}