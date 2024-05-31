let screws = [];
let selectedScrew = null;
let mode = "select"; // "select" 또는 "rotate" 모드
let machineImage;
const holeDepth = 100; // 구멍의 깊이 임의로 설정
let successed = 0;
let frame = 30;
let game;

function preload() {
  machineImage = loadImage('machine_background.jpg'); // 기계 부품 배경 이미지 로드
}

function setup() {
  createCanvas(800, 600);
  game = new Game();
}

function draw() {
  background(150);
  image(machineImage, 0, 0, width, height);
  game.show();

  for (let screw of screws) {
    screw.show();
  }

  if (selectedScrew) {
    selectedScrew.highlight();
  }
}

function mousePressed() {
  selectedScrew = null; // 이전 선택을 초기화
  if (game.isGameOver) return;
  for (let screw of screws) {
    if (screw.isMouseOver()) {
      selectedScrew = screw;
      mode = "rotate";
      break;
    }
  }
}

function keyPressed() {
  if (mode === "rotate" && selectedScrew) {
    if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
      if (game.isGameOver) return;
      selectedScrew.move();
    }
  }
}

class Screw {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 50;
    this.depth = 0; // 나사의 구멍 속 깊이
    this.threadTurns = 20;
    this.threadHeight = 100;
    this.threadWidth = 10;
    this.spacing = this.threadHeight / this.threadTurns;
    this.angle = 0;
    this.successed = false;
  }

  show() {
    push();
    translate(this.x, this.y + this.depth);
    stroke(125);
    strokeWeight(15);
    noFill();
    beginShape();
    for (let i = 0; i <= this.threadTurns; i++) {
      let y = i * this.spacing;
      let x = (i % 2 === 0) ? -this.threadWidth / 2 : this.threadWidth / 2;
      vertex(x, y);
    }
    endShape();
    this.drawHead();
    pop();
  }

  drawHead() {
    noStroke();
    fill(180);
    ellipse(0, 0, this.size, this.size);
    for (let i = 0; i < this.size / 2; i++) {
      let inter = map(i, 0, this.size / 2, 180, 100);
      fill(inter);
      ellipse(0, 0, this.size - i, this.size - i);
    }
    stroke(0);
    strokeWeight(2);
    push();
    rotate(this.angle);
    line(-this.size / 4, 0, this.size / 4, 0);
    line(0, -this.size / 4, 0, this.size / 4);
    pop();
  }

  update() {
    this.angle += PI / (2 * frame);
    if (this.angle >= TWO_PI) {
      this.angle = 0;
    }
  }

  highlight() {
    push();
    translate(this.x, this.y + this.depth);
    noFill();
    stroke(255, 0, 0);
    strokeWeight(3);
    ellipse(0, 0, this.size + 10, this.size + 10);
    pop();
  }

  isMouseOver() {
    let d = dist(mouseX, mouseY, this.x, this.y + this.depth);
    return d < this.size / 2;
  }

  move() {
    if (this.depth + this.spacing <= holeDepth) {
      for (let i = 0; i < frame; i++) {
        this.depth += this.spacing / frame;
        if (i == frame - 1) {
          this.threadTurns -= 1;
        }
        this.update();
      }
      if (!this.successed && this.depth + this.spacing >= holeDepth) {
        successed += 1;
        this.successed = true;
      }
    } else {
      this.depth = holeDepth;
    }
  }
}

class Game {
  constructor() {
    this.initGame();
  }

  initGame() {
    this.restartButton = createButton("다시 시작");
    this.restartButton.position(width / 2 - 50, height / 2);
    this.restartButton.mousePressed(this.resetGame.bind(this));
    this.restartButton.hide();
    this.resetTimer();
    this.isGameSuccess = false;
    this.isGameOver = false;
    this.createScrews();
  }

  createScrews() {
    screws = [];
    screws.push(new Screw(200, 200));
    screws.push(new Screw(600, 200));
    screws.push(new Screw(200, 400));
    screws.push(new Screw(600, 400));
  }

  show() {
    if (successed == 4) {
      this.isGameSuccess = true;
    }

    this.displayTimer();

    if (!this.isGameOver) {
      fill(150);
      textAlign(CENTER);
      textSize(20);

      if (this.isGameSuccess) {
        fill(255, 0, 0);
        textSize(32);
        text("게임 성공!", width / 2, height / 2 - 50);
      }
    }

    for (let screw of screws) {
      screw.show();
    }

    if (selectedScrew) {
      selectedScrew.highlight();
    }
  }

  displayTimer() {
    let timePassed = millis() - this.timerStart;
    let timeLeft = this.timeLimit - timePassed;
    let barWidth = map(timeLeft, 0, this.timeLimit, 0, width - 20);

    if (timeLeft <= 0) {
      this.gameOver();
      fill(255, 0, 0);
      textSize(32);
      textAlign(CENTER);
      text("시간 초과! 게임 오버", width / 2, height / 2 - 50);
      this.restartButton.show();
    } else if (!this.isGameSuccess) {
      fill(255, 0, 0);
      rect(10, height - 100, barWidth, 20);
    }
  }

  gameOver() {
    this.isGameOver = true;
  }

  resetTimer() {
    this.timerStart = millis();
    this.timeLimit = 10000;
  }

  resetGame() {
    this.restartButton.hide();
    successed = 0; // 성공된 나사 개수 초기화
    this.resetTimer();
    this.initGame();
  }
}



