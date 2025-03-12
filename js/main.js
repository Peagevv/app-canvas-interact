const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const fondo = new Image();
fondo.src = "bl.jpeg"; 

// Dimensiones del canvas
const window_height = window.innerHeight / 2;
const window_width = window.innerWidth / 2;

canvas.height = window_height;
canvas.width = window_width;
canvas.style.background = "#000";

// Cargar imagen de abeja
const abejaImg = new Image();
abejaImg.src = "lurr.png"; 

// Contadores de eliminación y nivel
let totalCreated = 10;
let totalDeleted = 0;
let level = 1;
let speedMultiplier = 1;

// Elementos de la tarjeta Bootstrap
const nivelElement = document.getElementById("nivel");
const eliminadasElement = document.getElementById("eliminadas");
const porcentajeElement = document.getElementById("porcentaje");

// Cargar el audio
const clickSound = new Audio("cho.mp3");

// Clase Abeja
class Abeja {
    constructor(x, speed) {
        this.x = x;
        this.y = window_height + 40;
        this.width = 80;
        this.height = 80;
        this.speedY = speed * speedMultiplier;
        this.speedX = (Math.random() - 0.5) * 2;
        this.opacity = 1;
        this.fading = false;
        this.clicked = false;
        this.glow = 0;
        this.hovered = false;
    }

    draw(context) {
        context.save();
        context.globalAlpha = this.opacity;

        if (this.hovered) {
            context.shadowBlur = 15;
            context.shadowColor = "white";
        }

        if (this.glow > 0) {
            context.shadowBlur = Math.max(context.shadowBlur, this.glow);
            context.shadowColor = "yellow";
        }

        context.drawImage(abejaImg, this.x, this.y, this.width, this.height);

        context.shadowBlur = 0;
        context.restore();
    }

    move() {
        this.y -= this.speedY;
        this.x += this.speedX;
        if (this.fading) {
            this.opacity -= 0.02;
            if (this.opacity <= 0) {
                this.opacity = 0;
            }
        }

        if (this.glow > 0) {
            this.glow -= 1;
        }
    }

    contains(mouseX, mouseY) {
        return (
            mouseX > this.x &&
            mouseX < this.x + this.width &&
            mouseY > this.y &&
            mouseY < this.y + this.height
        );
    }

    isColliding(otherAbeja) {
        return (
            this.x < otherAbeja.x + otherAbeja.width &&
            this.x + this.width > otherAbeja.x &&
            this.y < otherAbeja.y + otherAbeja.height &&
            this.y + this.height > otherAbeja.y
        );
    }
}

const abejas = [];
const numberOfAbejas = 10;

function createAbejas() {
    for (let i = 0; i < numberOfAbejas; i++) {
        const x = Math.random() * (window_width - 40);
        const speed = (Math.random() * 1.5 + 0.5) * speedMultiplier;
        abejas.push(new Abeja(x, speed));
    }
}

createAbejas();

canvas.addEventListener("mousemove", (event) => {
    const { offsetX, offsetY } = event;
    abejas.forEach((abeja) => {
        abeja.hovered = abeja.contains(offsetX, offsetY);
    });
});

canvas.addEventListener("click", (event) => {
    const { offsetX, offsetY } = event;
    abejas.forEach((abeja, index) => {
        if (abeja.contains(offsetX, offsetY) && !abeja.clicked) {
            abeja.clicked = true;
            abeja.fading = true;
            totalDeleted++;
            clickSound.play();
            abejas.splice(index, 1);
            updateStats();
            levelUp();
        }
    });
});

// Actualiza la tarjeta Bootstrap con los valores actuales
function updateStats() {
    let percentageDeleted = ((totalDeleted / totalCreated) * 100).toFixed(2);
    nivelElement.innerText = level;
    eliminadasElement.innerText = totalDeleted;
    porcentajeElement.innerText = percentageDeleted + "%";
}

// Sube de nivel cada 10 eliminaciones
function levelUp() {
    if (totalDeleted % 10 === 0) {
        level++;
        console.log(`🆙 Nivel subido a: ${level}`);

        speedMultiplier += 0.2;
        abejas.forEach((abeja) => {
            abeja.speedY *= 1.2;
        });

        // Generar más abejas en el nuevo nivel
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * (window_width - 40);
            const speed = (Math.random() * 1.5 + 0.5) * speedMultiplier;
            abejas.push(new Abeja(x, speed));
            totalCreated++;
        }

        updateStats();
    }
}

function animate() {
    ctx.clearRect(0, 0, window_width, window_height);
    
    // Dibujar el fondo antes de las abejas
    ctx.drawImage(fondo, 0, 0, canvas.width, canvas.height);

    abejas.forEach((abeja, index) => {
        abeja.move();
        abeja.draw(ctx);

        // Detectar colisiones y aplicar brillo
        for (let i = 0; i < abejas.length; i++) {
            for (let j = i + 1; j < abejas.length; j++) {
                if (abejas[i].isColliding(abejas[j])) {
                    abejas[i].glow = 20;
                    abejas[j].glow = 20;
                }
            }
        }

        if (abeja.y + abeja.height < 0 || abeja.opacity <= 0) {
            abejas.splice(index, 1);
            updateStats();
        }
    });

    while (abejas.length < numberOfAbejas) {
        const x = Math.random() * (window_width - 40);
        const speed = (Math.random() * 1.5 + 0.5) * speedMultiplier;
        abejas.push(new Abeja(x, speed));
        totalCreated++;
    }

    requestAnimationFrame(animate);
}

// Esperar a que el fondo cargue antes de iniciar la animación
fondo.onload = function () {
    animate();
};
