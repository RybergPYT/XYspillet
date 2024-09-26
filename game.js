// Hent canvas-elementet
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

// Indlæs billeder
let tankImage = new Image();
tankImage.src = 'rotated_tank_image.png'; // Tankens billede

let bulletImage = new Image();
bulletImage.src = 'skyd.png'; // Skuddets billede

// Tankens startposition og dimensioner (20% bredere)
let tank = {
    x: canvas.width / 2 - 60,  // Juster x-position for den bredere tank
    y: canvas.height - 200,    // Juster y-position
    width: 200,                // Øget bredde med 20% (100 -> 120)
    height: 200,               // Højde forbliver den samme
    speed: 2,
    movingLeft: false,
    movingRight: false
};

// Skydefunktion
let bullets = [];
let bulletSpeed = 9;
let lastShotTime = 0;
let cooldownTime = 2000; // 2 sekunder

function shoot() {
    let currentTime = Date.now();
    if (currentTime - lastShotTime > cooldownTime) {
        bullets.push({ x: tank.x + tank.width / 2 - 10, y: tank.y }); // Positionering af skuddet
        lastShotTime = currentTime;
    }
}

// Tegn tanken (med bredere dimensioner)
function drawTank() {
    ctx.drawImage(tankImage, tank.x, tank.y, tank.width, tank.height);
}

// Funktion til at bryde tekst op i linjer med maksimalt 4 ord
function splitTextIntoLines(text, maxWordsPerLine) {
    let words = text.split(' ');
    let lines = [];
    let currentLine = [];

    words.forEach((word) => {
        if (currentLine.length < maxWordsPerLine) {
            currentLine.push(word);
        } else {
            lines.push(currentLine.join(' '));
            currentLine = [word];
        }
    });

    if (currentLine.length > 0) {
        lines.push(currentLine.join(' '));
    }

    return lines;
}

// Tegn taleboble (rektangel med afrundede hjørner og justeret gennemsigtighed)
function drawSpeechBubble(x, y, width, height) {
    let radius = 10; // Radius for afrundede hjørner
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)"; // Gennemsigtig taleboble (80% opacitet)
    ctx.fill();
    ctx.strokeStyle = "red"; // Kantfarve for taleboble
    ctx.stroke();
}

// Nye udsagn
let statements = [
    { question: "Jeg tror, at folk arbejder bedst under stram kontrol.", category: "X" },
    { question: "Jeg stoler på, at folk kan udføre deres opgaver uden konstant opsyn.", category: "Y" },
    { question: "De fleste mennesker vil undgå ansvar, hvis de kan.", category: "X" },
    { question: "Jeg tror, at folk kan tage ansvar og udvise selvkontrol.", category: "Y" },
    { question: "Medarbejdere skal have klare instruktioner for at præstere godt.", category: "X" },
    { question: "Medarbejdere har brug for frihed til at træffe beslutninger selv.", category: "Y" },
    { question: "Folk er mere motiverede af eksterne belønninger og straf.", category: "X" },
    { question: "Folk motiveres af indre drivkraft og engagement.", category: "Y" },
    { question: "Det er nødvendigt at overvåge folk for at sikre produktivitet.", category: "X" },
    { question: "De fleste medarbejdere kan være produktive uden konstant overvågning.", category: "Y" },
    { question: "Folk har en tendens til at undgå arbejde, hvis de ikke overvåges.", category: "X" },
    { question: "Jeg tror, at folk finder tilfredsstillelse i deres arbejde, når de får autonomi.", category: "Y" },
    { question: "Folk har brug for klare mål og konsekvenser for at præstere.", category: "X" },
    { question: "Jeg tror, at folk kan sætte deres egne mål og finde løsninger.", category: "Y" },
    { question: "Uden stram ledelse vil folk ikke præstere på højt niveau.", category: "X" },
    { question: "Med tillid og frihed kan folk præstere bedre.", category: "Y" }
];

let currentStatement = 0;
let scoreX = 0;
let scoreY = 0;
let gameOver = false;

// Tegn udsagn med hitbox og taleboble
function drawStatements() {
    let maxWordsPerLine = 4;  // Maksimalt 4 ord per linje
    ctx.font = "bold 16px Arial";  // Gør teksten fed og sætter størrelsen til 16px

    // Tegn X-udsagnet med taleboble
    let xLines = splitTextIntoLines(statements[currentStatement].question, maxWordsPerLine);
    let maxTextWidthX = Math.max(...xLines.map(line => ctx.measureText(line).width)); // Bredden af teksten
    let totalTextHeightX = xLines.length * 30; // Total højde af teksten
    drawSpeechBubble(250 - 10, 170 - 40, maxTextWidthX + 20, totalTextHeightX + 20); // Taleboble omkring teksten

    // Sørg for, at teksten er sort før vi tegner den
    ctx.fillStyle = "black";  // Sort tekst
    xLines.forEach((line, index) => {
        ctx.fillText(line, 250, 170 + (index * 30)); // Tegn X-teksten
    });

    // Tegn Y-udsagnet med taleboble
    let yLines = splitTextIntoLines(statements[currentStatement + 1].question, maxWordsPerLine);
    let maxTextWidthY = Math.max(...yLines.map(line => ctx.measureText(line).width));
    let totalTextHeightY = yLines.length * 30;
    drawSpeechBubble(canvas.width - 450 - 10, 170 - 40, maxTextWidthY + 20, totalTextHeightY + 20); // Taleboble omkring teksten

    // Sørg for, at teksten er sort før vi tegner den
    ctx.fillStyle = "black";  // Sort tekst
    yLines.forEach((line, index) => {
        ctx.fillText(line, canvas.width - 450, 170 + (index * 30)); // Tegn Y-teksten
    });
}

// Tegn skud med billede i stedet for rektangel
function drawBullets() {
    bullets.forEach((bullet, index) => {
        // Brug billedet til skuddet i stedet for et rektangel
        ctx.drawImage(bulletImage, bullet.x, bullet.y, 40, 40); // Brug "skyd.png", skaleret til 30x30 pixels
        bullet.y -= bulletSpeed; // Skuddet bevæger sig opad

        // Kontroller om kuglen rammer tekstens hitbox
        let xLines = splitTextIntoLines(statements[currentStatement].question, 4);
        let maxTextWidthX = Math.max(...xLines.map(line => ctx.measureText(line).width));
        let totalTextHeightX = xLines.length * 30;
        if (bullet.x > 250 && bullet.x < 250 + maxTextWidthX && bullet.y < 170 && bullet.y > 170 - totalTextHeightX) {
            // Rammer X-udsagn
            if (statements[currentStatement].category === "X") {
                scoreX++;
            }
            currentStatement += 2; // Gå til næste sæt udsagn
            bullets.splice(index, 1);
        }

        let yLines = splitTextIntoLines(statements[currentStatement + 1].question, 4);
        let maxTextWidthY = Math.max(...yLines.map(line => ctx.measureText(line).width));
        let totalTextHeightY = yLines.length * 30;
        if (bullet.x > canvas.width - 450 && bullet.x < canvas.width - 450 + maxTextWidthY && bullet.y < 170 && bullet.y > 170 - totalTextHeightY) {
            // Rammer Y-udsagn
            if (statements[currentStatement + 1].category === "Y") {
                scoreY++;
            }
            currentStatement += 2; // Gå til næste sæt udsagn
            bullets.splice(index, 1);
        }
    });

    // Når alle udsagn er ramt, slut spillet og vis resultat
    if (currentStatement >= statements.length - 2) {
        gameOver = true;
        endGame();
    }
}

// Slut spillet og vis resultat
function endGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "50px Arial";
    ctx.fillStyle = "black";
    if (scoreX > scoreY) {
        ctx.fillText("Du har et x- menneskesyn!", canvas.width / 2 - 150, canvas.height / 2);
    } else {
        ctx.fillText("Du har et Y- menneskesyn!", canvas.width / 2 - 150, canvas.height / 2);
    }
}

// Bevægelse af tanken
document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
        tank.movingLeft = true;
    } else if (event.key === "ArrowRight") {
        tank.movingRight = true;
    }
});

document.addEventListener("keyup", function (event) {
    if (event.key === "ArrowLeft") {
        tank.movingLeft = false;
    } else if (event.key === "ArrowRight") {
        tank.movingRight = false;
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === " ") {
        shoot();
    }
});

// Opdater tankens position
function updateTankPosition() {
    if (!gameOver) {
        if (tank.movingLeft && tank.x > 0) {
            tank.x -= tank.speed;
        }
        if (tank.movingRight && tank.x + tank.width < canvas.width) {
            tank.x += tank.speed;
        }
    }
}

// Hovedspilsløkke
function gameLoop() {
    if (!gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateTankPosition();
        drawTank();
        drawStatements();
        drawBullets();
        requestAnimationFrame(gameLoop);
    }
}

// Start spillet
tankImage.onload = function() {
    gameLoop();
};