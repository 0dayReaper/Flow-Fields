const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 700;
canvas.height = 700;

// Function to handle drag events
function handleDragEvent(event) {
  event.preventDefault(); 
}

// Function to handle drop events
function handleDropEvent(event) {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  handleImageUpload(file);
}

canvas.addEventListener('dragover', handleDragEvent);
canvas.addEventListener('drop', handleDropEvent);

// Function to handle image upload
function handleImageUpload(file) {
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
imageUpload.addEventListener('change', function(event) {
  handleImageUpload(event.target.files[0]);
});