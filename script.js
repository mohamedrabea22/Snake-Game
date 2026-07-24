const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const gridSize = 20;
    const tileCount = canvas.width / gridSize;

    let snake = [];
    let food = { x: 0, y: 0 };
    let dx = 0;
    let dy = 0;
    let score = 0;
    let highScore = localStorage.getItem("snakeHighScore") || 0;
    let gameInterval = null;
    let isChangingDirection = false;
    let gameStarted = false; // متغير للتحكم في بدء الحركة

    document.getElementById("highScore").innerText = highScore;

    function resetGame() {
      snake = [
        { x: 10 * gridSize, y: 10 * gridSize },
        { x: 9 * gridSize, y: 10 * gridSize },
        { x: 8 * gridSize, y: 10 * gridSize }
      ];
      score = 0;
      dx = 0; // الثعبان ثابت في البداية
      dy = 0;
      gameStarted = false;

      document.getElementById("score").innerText = score;
      document.getElementById("gameOverOverlay").classList.remove("active");
      document.getElementById("startMsg").style.display = "block";

      generateFood();
      clearCanvas();
      drawFood();
      drawSnake();

      // تبطيء سرعة اللعبة من (100ms) إلى (160ms)
      if (gameInterval) clearInterval(gameInterval);
      gameInterval = setInterval(gameLoop, 160); 
    }

    function gameLoop() {
      if (!gameStarted) return; // لا يتحرك حتى يضغط اللاعب على زر

      if (isGameOver()) {
        handleGameOver();
        return;
      }

      isChangingDirection = false;
      clearCanvas();
      drawFood();
      moveSnake();
      drawSnake();
    }

    function clearCanvas() {
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // خطوط شبكية خفيفة
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      for (let i = 0; i < canvas.width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }
    }

    function drawSnake() {
      snake.forEach((part, index) => {
        if (index === 0) {
          ctx.fillStyle = "#34d399";
          ctx.shadowBlur = 12;
          ctx.shadowColor = "#34d399";
        } else {
          ctx.fillStyle = "#059669";
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.roundRect(part.x + 1, part.y + 1, gridSize - 2, gridSize - 2, 6);
        ctx.fill();
      });
      ctx.shadowBlur = 0;
    }

    function moveSnake() {
      const head = { x: snake[0].x + dx, y: snake[0].y + dy };
      snake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById("score").innerText = score;
        if (score > highScore) {
          highScore = score;
          localStorage.setItem("snakeHighScore", highScore);
          document.getElementById("highScore").innerText = highScore;
        }
        generateFood();
      } else {
        snake.pop();
      }
    }

    function generateFood() {
      food.x = Math.floor(Math.random() * tileCount) * gridSize;
      food.y = Math.floor(Math.random() * tileCount) * gridSize;

      snake.forEach(part => {
        if (part.x === food.x && part.y === food.y) generateFood();
      });
    }

    function drawFood() {
      ctx.fillStyle = "#f43f5e";
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#f43f5e";

      ctx.beginPath();
      ctx.arc(food.x + gridSize / 2, food.y + gridSize / 2, gridSize / 2 - 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
    }

    function isGameOver() {
      const head = snake[0];
      const hitLeft = head.x < 0;
      const hitRight = head.x >= canvas.width;
      const hitTop = head.y < 0;
      const hitBottom = head.y >= canvas.height;

      if (hitLeft || hitRight || hitTop || hitBottom) return true;

      for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) return true;
      }

      return false;
    }

    function handleGameOver() {
      clearInterval(gameInterval);
      document.getElementById("finalScore").innerText = score;
      document.getElementById("gameOverOverlay").classList.add("active");
    }

    function setDirection(dir) {
      if (isChangingDirection) return;

      const goingUp = dy === -gridSize;
      const goingDown = dy === gridSize;
      const goingRight = dx === gridSize;
      const goingLeft = dx === -gridSize;

      // عند أول تحريك: إخفاء الرسالة وتفعيل الحركة
      if (!gameStarted) {
        gameStarted = true;
        document.getElementById("startMsg").style.display = "none";
      }

      if (dir === 'LEFT' && !goingRight) { dx = -gridSize; dy = 0; }
      if (dir === 'UP' && !goingDown) { dx = 0; dy = -gridSize; }
      if (dir === 'RIGHT' && !goingLeft) { dx = gridSize; dy = 0; }
      if (dir === 'DOWN' && !goingUp) { dx = 0; dy = gridSize; }

      isChangingDirection = true;
    }

    // دعم الكيبورد
    window.addEventListener("keydown", e => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") setDirection('LEFT');
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") setDirection('UP');
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") setDirection('RIGHT');
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") setDirection('DOWN');
    });

    // تهيئة اللعبة
    resetGame();
