let capture;
let poseNet;
let poses = [];
const cam_w = 1024;
const cam_h = 768;
let particlesLeftHand = [];
let particlesRightHand = [];

function setup() {
  createCanvas(cam_w, cam_h);
  capture = createCapture(VIDEO);
  capture.size(width, height);
  //frameRate(30)
  
  const options = {
  architecture: "MobileNetV1",
  imageScaleFactor: 0.3,
  outputStride: 16, // 8, 16 (larger = faster/less accurate)
  flipHorizontal: false,
  minConfidence: 0.5,
  maxPoseDetections: 2, // 5 is the max
  scoreThreshold: 0.5,
  nmsRadius: 20,
  detectionType: "multiple",
  inputResolution: 257, // 161, 193, 257, 289, 321, 353, 385, 417, 449, 481, 513, or 801, smaller = faster/less accurate
  multiplier: 0.5, // 1.01, 1.0, 0.75, or 0.50, smaller = faster/less accurate
  quantBytes: 2,
};

  poseNet = ml5.poseNet(capture, modelReady);
  poseNet.on("pose", function (results) {
    poses = results;
  });

  capture.hide();
}

function modelReady() {
  console.log("Model loaded");
}

function draw() {
  background(255);

  push();
  translate(width, 0);
  scale(-1, 1);
  image(capture, 0, 0, width, height);
  drawHeadSwaps();
  pop();
  
  if (poses.length > 1) {
    drawParticles();
  }

  for (let i = 0; i < particlesLeftHand.length; i++) {
    let p = particlesLeftHand[i];
    p.update();
    p.display();
    if (p.alpha < 0) {
      particlesLeftHand.shift();
    }
  }

  for (let i = 0; i < particlesRightHand.length; i++) {
    let p = particlesRightHand[i];
    p.update();
    p.display();
    if (p.alpha < 0) {
      particlesRightHand.shift();
    }
  }

  
  
}

function drawHeadSwaps() {
  if (poses.length >= 2) {
    

    let headA = getHead(poses[0]);
    let headB = getHead(poses[1]);

    // let headACenterX = poses[0].pose.keypoints.find(point => point.part === "nose").position.x;
    let headACenterX = poses[0].pose.nose.x;
    let headACenterY = poses[0].pose.nose.y;

    let headBCenterX = poses[1].pose.nose.x
    let headBCenterY = poses[1].pose.nose.y;

    image(headA, headBCenterX - headB.width / 2, headBCenterY - headB.height / 2);
    image(headB, headACenterX - headA.width / 2, headACenterY - headA.height / 2);

    push();
    scale(-1, 1);
    textAlign(CENTER, BOTTOM);
    fill(255, 0, 0); 
    textSize(25);
    text("Hi! Nice to meet you!", -headBCenterX, headBCenterY - headB.height / 2 - 10);
    fill(40, 190, 255);
    textSize(25);
    text("Hello! Good to see you!", -headACenterX, headACenterY - headA.height / 2 - 10);
  }
}

function getHead(pose) {
  let headWidth = 200;
  let headHeight = 200;
  let headImage = capture.get(
    pose.pose.nose.x - headWidth / 2,
    pose.pose.nose.y - headHeight / 2,
    headWidth,
    headHeight
  );
  return headImage;
}

function drawParticles() {
  let pose0 = poses[0].pose;
  let pose1 = poses[1].pose;

  //let personLeft;
  //let personRight;

  // check to see which side each person is on
  if (pose0.nose.x < pose1.nose.x) {
    personLeft = pose0;
    personRight = pose1;
  } else {
    personLeft = pose1;
    personRight = pose0;
  }

  let leftWrist0 = pose0.keypoints.find((point) => point.part === "leftWrist");
  let rightWrist0 = pose0.keypoints.find(
    (point) => point.part === "rightWrist"
  );

  let leftWrist1 = pose1.keypoints.find((point) => point.part === "leftWrist");
  let rightWrist1 = pose1.keypoints.find(
    (point) => point.part === "rightWrist"
  );

  if (leftWrist0 && leftWrist0.position.y < cam_h - 50) {
    for (let i = 0; i < 5; i++) {
      let randomColor = color(random(255));
      particlesLeftHand.push(
        new Particle(width-leftWrist0.position.x, leftWrist0.position.y, randomColor)
      );
    }
  }

  if (rightWrist0 && rightWrist0.position.y < cam_h - 50) {
    for (let i = 0; i < 5; i++) {
      let randomColor = color(random(255), random(255), random(255));
      particlesRightHand.push(
        new Particle(
          width-rightWrist0.position.x,
          rightWrist0.position.y,
          randomColor
        )
      );
    }
  }

  if (leftWrist1 && leftWrist1.position.y < cam_h - 50) {
    for (let i = 0; i < 5; i++) {
      let randomColor = color(random(255));
      particlesLeftHand.push(
        new Particle(width-leftWrist0.position.x, leftWrist0.position.y, randomColor)
      );
    }
  }

  if (rightWrist1 && rightWrist1.position.y < cam_h - 50) {
    for (let i = 0; i < 5; i++) {
      let randomColor = color(random(255), random(255), random(255));
      particlesRightHand.push(
        new Particle(
          width-rightWrist1.position.x,
          rightWrist1.position.y,
          randomColor
        )
      );
    }
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = random(-2, 2);
    this.vy = random(-2, 2);
    this.color = color;
    this.diameter = random(10, 25);
    this.alpha = 255;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 2;
  }

  display() {
    noStroke();
    fill(
      this.color.levels[0],
      this.color.levels[1],
      this.color.levels[2],
      this.alpha
    );
    ellipse(this.x, this.y, this.diameter, this.diameter);
  }
}

