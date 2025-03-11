const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Dimensiones del canvas
const window_height = window.innerHeight / 2;
const window_width = window.innerWidth / 2;

canvas.height = window_height;
canvas.width = window_width;
canvas.style.background = "#ccc";

// Contadores de eliminación y nivel
let totalCreated = 10;
let totalDeleted = 0;
let level = 1;
let speedMultiplier = 1;

// Elemento para mostrar estadísticas
const stats = document.createElement("div");
stats.style.position = "absolute";
stats.style.top = "10px";
stats.style.left = "10px";
stats.style.color = "white";
stats.style.fontSize = "18px";
stats.style.fontFamily = "Arial, sans-serif";
document.body.appendChild(stats);

// Cargar el audio
const clickSound = new Audio("cho.mp3");  // Reemplaza con la ruta de tu archivo de audio

// Clase Circle
class Circle {
    constructor(x, radius, color, speed) {
        this.x = x;
        this.y = window_height + radius;
        this.radius = radius;
        this.color = color;
        this.speedY = speed * speedMultiplier;
        this.speedX = (Math.random() - 0.5) * 2;
        this.opacity = 1;
        this.fading = false;
        this.glow = 0;
        this.clicked = false;  // Nueva propiedad para saber si el círculo fue clicado
    }

    draw(context) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.shadowBlur = this.glow;
        context.shadowColor = this.color;
        context.fillStyle = this.getColorWithOpacity();
        context.globalAlpha = this.opacity;
        context.fill();
        context.globalAlpha = 1;
        context.shadowBlur = 0;
        context.closePath();
    }

    move() {
        this.y -= this.speedY;
        this.x += this.speedX;
        if (this.fading) {
            this.opacity -= 0.02;
        }
        if (this.glow > 0) {
            this.glow -= 1;
        }
    }

    changeColor() {
        const colors = ["red", "blue", "green", "yellow", "purple"];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    getColorWithOpacity() {
        return `rgba(${this.hexToRgb(this.color)}, ${this.opacity})`;
    }

    hexToRgb(hex) {
        const colors = {
            white: "255,255,255",
            red: "255,0,0",
            blue: "0,0,255",
            green: "0,255,0",
            yellow: "255,255,0",
            purple: "128,0,128"
        };
        return colors[hex] || "255,255,255";
    }

    contains(mouseX, mouseY) {
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        return Math.sqrt(dx * dx + dy * dy) < this.radius;
    }

    isColliding(otherCircle) {
        const dx = this.x - otherCircle.x;
        const dy = this.y - otherCircle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius + otherCircle.radius;
    }
}

const circles = [];
const numberOfCircles = 10;

function createCircles() {
    for (let i = 0; i < numberOfCircles; i++) {
        const radius = Math.random() * 30 + 20;
        const x = Math.random() * (window_width - 2 * radius) + radius;
        const speed = (Math.random() * 1.5 + 0.5) * speedMultiplier;
        const color = "white";
        circles.push(new Circle(x, radius, color, speed));
    }
}

createCircles();

canvas.addEventListener("mousemove", (event) => {
    const { offsetX, offsetY } = event;
    circles.forEach(circle => {
        if (circle.contains(offsetX, offsetY)) {
            circle.changeColor();
        }
    });
});

canvas.addEventListener("click", (event) => {
    const { offsetX, offsetY } = event;
    circles.forEach(circle => {
        if (circle.contains(offsetX, offsetY)) {
            if (!circle.clicked) {  // Solo contar si no ha sido clicado antes
                circle.clicked = true;
                circle.fading = true;
                totalDeleted++;  // Incrementar contador solo si es clicado
                clickSound.play();  // Reproducir el sonido
                levelUp(); // Llamar la función levelUp inmediatamente después de eliminar un círculo
            }
        }
    });
});

function updateStats() {
    const percentageDeleted = ((totalDeleted / totalCreated) * 100).toFixed(2);
    stats.innerHTML = `Nivel: ${level} - Eliminados: ${totalDeleted} (${percentageDeleted}%)`;
}

function levelUp() {
    // Si se han eliminado 10 círculos, incrementar nivel y ajusta la velocidad
    if (totalDeleted % 10 === 0) {
        level++;
        if (level <= 10) {
            speedMultiplier += 0.2;
            circles.forEach(circle => {
                circle.speedY *= 1.2;
            });
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, window_width, window_height);
    
    circles.forEach((circle, index) => {
        circle.move();
        circle.draw(ctx);
        
        for (let j = index + 1; j < circles.length; j++) {
            if (circle.isColliding(circles[j])) {
                circle.glow = 20;
                circles[j].glow = 20;
            }
        }
        
        if (circle.y + circle.radius < 0 || circle.opacity <= 0) {
            circles.splice(index, 1);
            updateStats();
        }
    });
    
    while (circles.length < numberOfCircles) {
        const radius = Math.random() * 30 + 20;
        const x = Math.random() * (window_width - 2 * radius) + radius;
        const speed = (Math.random() * 1.5 + 0.5) * speedMultiplier;
        const color = "white";
        circles.push(new Circle(x, radius, color, speed));
        totalCreated++;
    }
    
    requestAnimationFrame(animate);
}

animate();
