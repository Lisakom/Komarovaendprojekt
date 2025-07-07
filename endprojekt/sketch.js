let mic;
let angles = [];
let radius = 400;          // увеличил основной круг
let basePadRadius = 100;    // увеличил размер подушек
let padColors = [];
let activeIndex = 0;
let waveCircles = [];
let centerWaves = [];      // волны от центрального круга
let threshold = 0.02; // минимальный уровень громкости для реакции
let saveButton;
let backgroundParticles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  textAlign(CENTER, CENTER);
  textSize(24);
  fill(255);
  text('Click anywhere to start', width / 2, height / 2);

  for (let i = 0; i < 8; i++) {
    let val = max(0, 80 - i * 5);
    let grayShade = color(val, val, val);
    padColors.push(grayShade);
    angles.push(i * 45);
  }
  for (let i = 0; i < 200; i++) {
    backgroundParticles.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      speed: random(0.1, 0.5),
      alpha: random(50, 150)
    });
  }
}

function drawMetallicCircle(x, y, r) {

  // 1) Плавный градиент с мягким переходом от светлого центра к чуть тёмнее краям
  for (let i = r; i > 0; i--) {
    let inter = map(i, 0, r, 0, 1);
    let c = lerpColor(color(220, 220, 240), color(50, 50, 70), inter); // более светлый край
    fill(c);
    ellipse(x, y, i * 2, i * 2);
  }

  let ctx = drawingContext;

// 2) Мягкий внешний тёмный градиент для аккуратного затемнения краёв
let edgeGradient = ctx.createRadialGradient(x, y, r * 0.6, x, y, r);
edgeGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
edgeGradient.addColorStop(1, 'rgba(0, 0, 0, 0.65)');  // чуть темнее
ctx.fillStyle = edgeGradient;
ctx.beginPath();
ctx.ellipse(x, y, r, r, 0, 0, TWO_PI);  // радиус круга оставляем r
ctx.fill();

  // 3) Усиленный блик сверху слева
  let highlightGradient = ctx.createRadialGradient(
    x - r * 0.3, y - r * 0.3, r * 0.05,
    x - r * 0.3, y - r * 0.3, r * 0.3
  );
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = highlightGradient;
  ctx.beginPath();
  ctx.ellipse(x - r * 0.3, y - r * 0.3, r * 0.8, r * 0.5, 0, 0, TWO_PI);
  ctx.fill();

  // 4) Маленький блик справа снизу
  let smallHighlight = ctx.createRadialGradient(
    x + r * 0.4, y + r * 0.3, r * 0.03,
    x + r * 0.4, y + r * 0.3, r * 0.2
  );
  smallHighlight.addColorStop(0, 'rgba(200, 200, 255, 0.5)');
  smallHighlight.addColorStop(1, 'rgba(200, 200, 255, 0)');
  ctx.fillStyle = smallHighlight;
  ctx.beginPath();
  ctx.ellipse(x + r * 0.4, y + r * 0.3, r * 0.5, r * 0.4, 0, 0, TWO_PI);
  ctx.fill();


// 5) Контур круга — чуть светлее и тоньше
ctx.strokeStyle = 'rgba(50, 50, 80, 0.5)';  // чуть светлее
ctx.lineWidth = 4;
ctx.beginPath();
ctx.ellipse(x, y, r, r, 0, 0, TWO_PI);
ctx.stroke();
}

function drawIndentedCircleWithBaseColor(x, y, size, baseColor) {
  colorMode(RGB);
  
  let ctx = drawingContext;

  let gradient = ctx.createLinearGradient(x, y - size / 2, x, y + size / 2);

  let topColor = color(
    constrain(red(baseColor) - 40, 0, 255),
    constrain(green(baseColor) - 40, 0, 255),
    constrain(blue(baseColor) - 40, 0, 255),
    1
  );
  let bottomColor = color(
    constrain(red(baseColor) + 30, 0, 255),
    constrain(green(baseColor) + 30, 0, 255),
    constrain(blue(baseColor) + 30, 0, 255),
    0.9
  );

  gradient.addColorStop(0, topColor.toString());
  gradient.addColorStop(0.5, baseColor.toString());
  gradient.addColorStop(1, bottomColor.toString());

  noStroke();
  ctx.fillStyle = gradient;
  ellipse(x, y, size * 1.1, size * 1.1);

  let innerSize = size * 0.45;

  let gloss = color(
    constrain(red(baseColor) + 60, 0, 255),
    constrain(green(baseColor) + 60, 0, 255),
    constrain(blue(baseColor) + 60, 0, 255)
  );
  let shadow = color(
    constrain(red(baseColor) - 40, 0, 255),
    constrain(green(baseColor) - 40, 0, 255),
    constrain(blue(baseColor) - 40, 0, 255)
  );

  let radial = ctx.createRadialGradient(x, y, innerSize * 0.1, x, y, innerSize / 2);
  radial.addColorStop(0, gloss.toString());
  radial.addColorStop(1, shadow.toString());

  ctx.fillStyle = radial;
  ellipse(x, y, innerSize * 1.05, innerSize * 0.95);

  colorMode(RGB);
}

function drawIndentedOvalWithBaseColor(x, y, w, h, baseColor) {
  colorMode(RGB);

  let ctx = drawingContext;

  // Градиент сверху вниз по высоте овала
  let gradient = ctx.createLinearGradient(x, y - h / 2, x, y + h / 2);

  let topColor = color(
    constrain(red(baseColor) + 30, 0, 255),
    constrain(green(baseColor) + 30, 0, 255),
    constrain(blue(baseColor) + 30, 0, 255),
    0.9
  );
  let bottomColor = color(
    constrain(red(baseColor) - 40, 0, 255),
    constrain(green(baseColor) - 40, 0, 255),
    constrain(blue(baseColor) - 40, 0, 255),
    1
  );

  gradient.addColorStop(0, topColor.toString());
  gradient.addColorStop(0.5, baseColor.toString());
  gradient.addColorStop(1, bottomColor.toString());

  noStroke();
  ctx.fillStyle = gradient;
  ellipse(x, y, w, h);

  let innerW = w * 0.45;
  let innerH = h * 0.45;

  let gloss = color(
    constrain(red(baseColor) + 60, 0, 255),
    constrain(green(baseColor) + 60, 0, 255),
    constrain(blue(baseColor) + 60, 0, 255)
  );
  let shadow = color(
    constrain(red(baseColor) - 40, 0, 255),
    constrain(green(baseColor) - 40, 0, 255),
    constrain(blue(baseColor) - 40, 0, 255)
  );

  let radial = ctx.createRadialGradient(x, y, innerW * 0.1, x, y, innerW / 2);
  radial.addColorStop(0, gloss.toString());
  radial.addColorStop(1, shadow.toString());

  ctx.fillStyle = radial;
  ellipse(x, y, innerW, innerH);

  colorMode(RGB);
}

function mousePressed() {
  userStartAudio();
  mic = new p5.AudioIn();
  mic.start(() => {
    console.log('Mic started');
    createSaveButton()
  }, (err) => {
    console.error('Mic error:', err);
  });
}

function draw() {
  background(0);
  colorMode(RGB, 255);
  noStroke();
for (let p of backgroundParticles) {
  fill(180, 200, 255, p.alpha);
  circle(p.x, p.y, p.size);
  p.y += p.speed;
  if (p.y > height) p.y = 0;
}

  if (!mic) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text('Click to start mic', width / 2, height / 2);
    return;
  }

  let vol = mic.getLevel();
  let bump = map(vol, 0, 0.3, 0, 60);

  // Создаем волну от центра по звуку (реже, чтобы не слишком часто)
  if (vol > threshold && frameCount % 15 === 0) {
    centerWaves.push({
      x: width / 2,
      y: height / 2,
      radius: 130,    // стартовый радиус (половина центрального круга)
      alpha: 180
    });
  }

  // Основной металлический круг
  drawMetallicCircle(width / 2, height / 2, radius);

  // Центральный выпуклый круг (по центру)
  let centerSize = 260;
  let centerColor = color(120, 120, 140);
  drawIndentedCircleWithBaseColor(width / 2, height / 2, centerSize, centerColor);

  // Подушки вокруг круга
  for (let i = 0; i < 8; i++) {
    let angle = angles[i];
    let x = width / 2 + cos(angle) * (radius - 90);
    let y = height / 2 + sin(angle) * (radius - 90);

    let size = basePadRadius;
    if (i === activeIndex) {
      size += bump + 20;
    }

    let ovalWidth = size * 1.7;
    let ovalHeight = size * 1.0;

    push();
    translate(x, y);
    rotate(angle + 180);  // Поворачиваем так, чтобы овалы смотрели к центру
    drawIndentedOvalWithBaseColor(0, 0, ovalWidth, ovalHeight, padColors[i]);
    pop();
  }

  // При звуке создаём волны от подушек (рандомно)
  if (vol > threshold && frameCount % 2 === 0) {
    activeIndex = floor(random(0, 8));

    let angle = angles[activeIndex];
    let baseX = width / 2 + cos(angle) * (radius - 60);
    let baseY = height / 2 + sin(angle) * (radius - 60);

      let nextIndex = (activeIndex + 1) % 8;
  let angle2 = angles[nextIndex];
  let nextX = width / 2 + cos(angle2) * (radius - 60);
  let nextY = height / 2 + sin(angle2) * (radius - 60);

  drawLightning(baseX, baseY, nextX, nextY);

    for (let i = 0; i < 20; i++) {
      let offsetX = i * 20;  // Смещаем каждую волну дальше по X
      let offsetY = i * 20;  // или Y, или по диагонали
      let size = basePadRadius + random(-10, 10);

      let base = padColors[activeIndex];
      let waveColor = color(
        constrain(red(base) + random(50, 100), 0, 255),
        constrain(green(base) + random(50, 100), 0, 255),
        constrain(blue(base) + random(50, 100), 0, 255),
        255
      );

      waveCircles.push({
        x: baseX + offsetX,
        y: baseY + offsetY,
        sizeW: basePadRadius * 7.5 + random(-10, 10), // начальная ширина — как овал
        sizeH: basePadRadius * 3.0 + random(-5, 5),  // начальная высота
        size: size,
        alpha: 255,
        color: waveColor,
        angle: angle + 180
      });
      
    }
  }

  // Рисуем волны от подушек
  let maxWaveWidth = radius * 9;   // ширина волны в 4.5 раза больше радиуса круга
let maxWaveHeight = radius * 9;  // высота волны в 3.5 раза больше радиуса круга

  for (let i = waveCircles.length - 1; i >= 0; i--) {
    let w = waveCircles[i];
    noFill();
    stroke(w.color.levels[0], w.color.levels[1], w.color.levels[2], constrain(w.alpha, 0, 255));
    strokeWeight(2);

    push();
    translate(w.x, w.y);
    rotate(w.angle);
    ellipse(0, 0, w.sizeW, w.sizeH);
    pop();

   // Плавное увеличение размеров
  w.sizeW += (width / 10 - w.sizeW) * 0.05;
  w.sizeH += ((width / 15) - w.sizeH) * 0.05;

  // Плавное уменьшение прозрачности
  w.alpha *= 0.95;

    if (w.sizeW > width * 2 || w.alpha <= 0) {
      waveCircles.splice(i, 1);
    }
  }

  // Рисуем волны от центрального круга
  for (let i = centerWaves.length - 1; i >= 0; i--) {
    let wave = centerWaves[i];
    noFill();
    stroke(200, 200, 255, wave.alpha);
    strokeWeight(4);
    ellipse(wave.x, wave.y, wave.radius * 2);

    wave.radius += 4;
    wave.alpha -= 1.5;

    if (wave.alpha <= 0) {
      centerWaves.splice(i, 1);
    }
  }
}
function createSaveButton() {
  if (saveButton) return;
  

  saveButton = createButton('💾 Save Image');
  saveButton.position(20, 20);
  
  saveButton.mousePressed(() => {
    saveCanvas('my-visual', 'png');
  });
  saveButton.class('save-btn'); // 👈 Применим CSS-класс
  saveButton.style("background", "rgba(255, 255, 255, 0.15)");
  saveButton.style("color", "#ffffff");
  saveButton.style("border", "1px solid rgba(255, 255, 255, 0.3)");
  saveButton.style("padding", "8px 12px");
  saveButton.style("border-radius", "8px");
  saveButton.style("backdrop-filter", "blur(5px)");
  
}
function drawLightning(x1, y1, x2, y2) {
  stroke(180, 220, 255, 200);
  strokeWeight(2);
  noFill();

  let segments = 10;
  beginShape();
  for (let i = 0; i <= segments; i++) {
    let t = i / segments;
    let x = lerp(x1, x2, t) + random(-5, 5);
    let y = lerp(y1, y2, t) + random(-5, 5);
    vertex(x, y);
  }
  endShape();
}
