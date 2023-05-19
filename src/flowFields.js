const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 700;
canvas.height = 700;

// Function to handle image upload
function handleImageUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (fileEvent) {
    const img = new Image();
    img.onload = function () {
      const effect = new Effect(canvas, ctx, img);
      animate(effect);
    };
    img.src = fileEvent.target.result;
  };

  reader.readAsDataURL(file);
}

// Listen for image upload
const imageUpload = document.getElementById('imageUpload');
imageUpload.addEventListener('change', handleImageUpload);

class Particle {
  constructor(effect) {
    // Initialize particle properties
    this.effect = effect;
    this.x = Math.floor(Math.random() * this.effect.width);
    this.y = Math.floor(Math.random() * this.effect.height);
    this.speedX = 0;
    this.speedY = 0;
    this.speedModifier = Math.random() * 2 + 1;
    this.history = [{ x: this.x, y: this.y }];
    this.maxLength = Math.floor(Math.random() * 60 + 50);
    this.angle = 0;
    this.newAngle = 0;
    this.angleCorrector = Math.random() * 0.5 + 0.01;
    this.timer = this.maxLength * 2;
    this.red = 0;
    this.green = 0;
    this.blue = 0;
    this.color = 'rgb(' + this.red + ',' + this.green + ',' + this.blue + ')';
  }

  draw(context) {
    // Draw the particle's history as a line
    context.beginPath();
    context.moveTo(this.history[0].x, this.history[0].y);
    for (let i = 0; i < this.history.length; i++) {
      context.lineTo(this.history[i].x, this.history[i].y);
    }
    context.strokeStyle = this.color;
    context.stroke();
  }

  update() {
    // Update the particle's position and history
    this.timer--;

    if (this.timer >= 1) {
      let x = Math.floor(this.x / this.effect.cellSize);
      let y = Math.floor(this.y / this.effect.cellSize);
      let index = y * this.effect.cols + x;

      let flowFieldIndex = this.effect.flowField[index];
      if (flowFieldIndex) {
        // Adjust particle's angle based on flow field
        this.newAngle = flowFieldIndex.colorAngle;
        if (this.angle > this.newAngle) {
          this.angle -= this.angleCorrector;
        } else if (this.angle < this.newAngle) {
          this.angle += this.angleCorrector;
        } else {
          this.angle = this.newAngle;
        }

        // Calculate particle's speed in x and y directions
        this.speedX = Math.cos(this.angle) * this.speedModifier;
        this.speedY = Math.sin(this.angle) * this.speedModifier;

        // Adjust particle's color based on flow field
        if (flowFieldIndex.alpha > 0) {
          this.red += (flowFieldIndex.red - this.red) * 0.1;
          this.green += (flowFieldIndex.green - this.green) * 0.1;
          this.blue += (flowFieldIndex.blue - this.blue) * 0.1;
          this.color = 'rgb(' + Math.floor(this.red) + ',' + Math.floor(this.green) + ',' + Math.floor(this.blue) + ')';
        }
      }

      // Update particle's position and history
      this.x += this.speedX;
      this.y += this.speedY;
      this.history.push({ x: this.x, y: this.y });
      if (this.history.length > this.maxLength) {
        this.history.shift();
      }
    } else if (this.history.length > 1) {
      this.history.shift();
    } else {
      this.reset();
    }
  }

  reset() {
    // Reset particle's position and history
    let attempts = 0;
    let resetSuccess = false;

    while (attempts < 30 && !resetSuccess) {
      attempts++;
      let testIndex = Math.floor(Math.random() * this.effect.flowField.length);
      if (this.effect.flowField[testIndex].alpha > 0) {
        this.x = this.effect.flowField[testIndex].x;
        this.y = this.effect.flowField[testIndex].y;
        this.history = [{ x: this.x, y: this.y }];
        this.timer = this.maxLength * 2;
        resetSuccess = true;
      }
    }

    if (!resetSuccess) {
      this.x = Math.random() * this.effect.width;
      this.y = Math.random() * this.effect.height;
      this.history = [{ x: this.x, y: this.y }];
      this.timer = this.maxLength * 2;
    }
  }
}

class Effect {
  constructor(canvas, ctx, image) {
    // Initialize effect properties
    this.canvas = canvas;
    this.context = ctx;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.particles = [];
    this.numberOfParticles = 2000;
    this.cellSize = 5;
    this.rows = Math.floor(this.height / this.cellSize);
    this.cols = Math.floor(this.width / this.cellSize);
    this.flowField = [];
    this.debug = false;
    this.image = image;
    this.init();

    window.addEventListener('keydown', keyEvent => {
      if (keyEvent.key === 'd') this.debug = !this.debug;
    });

    window.addEventListener('resize', () => {
      this.resize(window.innerWidth, window.innerHeight);
    });
  }

  drawText() {
    // Draw text on the canvas
    this.context.font = '450px Impact';
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';

    const gradient1 = this.context.createLinearGradient(0, 0, this.width, this.height);
    gradient1.addColorStop(0.2, 'rgb(255,0,0)');
    gradient1.addColorStop(0.4, 'rgb(0,255,0)');
    gradient1.addColorStop(0.6, 'rgb(150,100,100)');
    gradient1.addColorStop(0.8, 'rgb(0,255,255)');

    const gradient2 = this.context.createLinearGradient(0, 0, this.width, this.height);
    gradient2.addColorStop(0.2, 'rgb(255,255,0)');
    gradient2.addColorStop(0.4, 'rgb(200,5,50)');
    gradient2.addColorStop(0.6, 'rgb(150,255,255)');
    gradient2.addColorStop(0.8, 'rgb(255,255,150)');

    const gradient3 = this.context.createRadialGradient(this.width * 0.5, this.height * 0.5, 10, this.width * 0.5, this.height * 0.5, this.width);
    gradient3.addColorStop(0.2, 'rgb(0,0,255)');
    gradient3.addColorStop(0.4, 'rgb(200,255,0)');
    gradient3.addColorStop(0.6, 'rgb(0,0,255)');
    gradient3.addColorStop(0.8, 'rgb(0,0,0)');

    this.context.fillStyle = gradient1;
    this.context.fillText('JS', this.width * 0.5, this.height * 0.5, this.width);
  }

  drawFlowFieldImage() {
    // Draw the image on the canvas
    let imageSize = this.width * 0.8;
    this.context.drawImage(this.image, this.width * 0.5 - imageSize * 0.5, this.height * 0.5 - imageSize * 0.5, imageSize, imageSize);
  }

  init() {
    // Clear the canvas
    this.context.clearRect(0, 0, this.width, this.height);

    // Draw the image or text on the canvas
    if (this.image) {
      this.drawFlowFieldImage();
    } else {
      this.drawText();
    }

    // Create the flow field
    this.flowField = [];
    const pixels = this.context.getImageData(0, 0, this.width, this.height).data;
    for (let y = 0; y < this.height; y += this.cellSize) {
      for (let x = 0; x < this.width; x += this.cellSize) {
        const index = (y * this.width + x) * 4;
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];
        const alpha = pixels[index + 3];
        const grayscale = (red + green + blue) / 3;
        const colorAngle = ((grayscale / 255) * 6.28).toFixed(2);
        this.flowField.push({
          x: x,
          y: y,
          red: red,
          green: green,
          blue: blue,
          alpha: alpha,
          colorAngle: colorAngle
        });
      }
    }

    // Create the particles
    this.particles = [];
    for (let i = 0; i < this.numberOfParticles; i++) {
      this.particles.push(new Particle(this));
    }
    this.particles.forEach(particle => particle.reset());
  }

  resize(width, height) {
    // Resize the canvas and re-initialize the effect
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.init();
  }

  render() {
    // Render the effect on the canvas
    if (this.debug) {
      this.drawGrid();
      this.drawFlowFieldImage();
    }
    this.particles.forEach(particle => {
      particle.draw(this.context);
      particle.update();
    });
  }
}

function animate(effect) {
  // Animation loop
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  effect.render();
  requestAnimationFrame(() => animate(effect));
}

// Default effect with no image
const effect = new Effect(canvas, ctx, null);
animate(effect);