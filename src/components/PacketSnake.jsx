import { useState, useEffect, useRef } from 'react';

const CELL = 16;
const COLS = 24;
const ROWS = 24;
const TICK = 110;

export default function PacketSnake() {
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => {
    try {
      return +(localStorage.getItem('jun_snake_best') || 0);
    } catch {
      return 0;
    }
  });

  const canvasRef = useRef(null);
  const gameStateRef = useRef({
    snake: [{ x: 11, y: 12 }, { x: 10, y: 12 }, { x: 9, y: 12 }],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: { x: 15, y: 12 },
    alive: true,
    timer: null,
  });

  const isLight = () => document.body.classList.contains('light');

  const draw = () => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const g = cvs.getContext('2d');
    if (!g) return;

    const { snake, food, alive } = gameStateRef.current;
    const light = isLight();

    g.fillStyle = light ? 'rgba(242,245,251,.9)' : 'rgba(0,0,0,.45)';
    g.fillRect(0, 0, cvs.width, cvs.height);

    g.strokeStyle = light ? 'rgba(15,21,36,.06)' : 'rgba(255,255,255,.04)';
    g.lineWidth = 1;
    for (let i = 1; i < COLS; i++) {
      g.beginPath();
      g.moveTo(i * CELL, 0);
      g.lineTo(i * CELL, cvs.height);
      g.stroke();
    }
    for (let j = 1; j < ROWS; j++) {
      g.beginPath();
      g.moveTo(0, j * CELL);
      g.lineTo(cvs.width, j * CELL);
      g.stroke();
    }

    g.shadowColor = '#3ddc84';
    g.shadowBlur = 10;
    g.fillStyle = '#3ddc84';
    g.beginPath();
    g.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, 5, 0, Math.PI * 2);
    g.fill();
    g.shadowBlur = 0;

    snake.forEach((s, i) => {
      g.fillStyle = i === 0 ? (light ? '#0f1524' : '#ffffff') : (light ? '#0077e6' : '#4cc9ff');
      g.fillRect(s.x * CELL + 2, s.y * CELL + 2, CELL - 4, CELL - 4);
    });

    if (!alive) {
      g.fillStyle = 'rgba(4,6,10,.55)';
      g.fillRect(0, 0, cvs.width, cvs.height);
      g.textAlign = 'center';
      g.fillStyle = '#ff5f57';
      g.font = "700 22px 'JetBrains Mono',monospace";
      g.fillText('CONNECTION LOST', cvs.width / 2, cvs.height / 2 - 8);
      g.fillStyle = light ? '#57617a' : '#9aa3b5';
      g.font = "12px 'JetBrains Mono',monospace";
      g.fillText('press SPACE to reconnect', cvs.width / 2, cvs.height / 2 + 18);
    }
  };

  const placeFood = (currentSnake) => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * COLS),
        y: Math.floor(Math.random() * ROWS),
      };
    } while (currentSnake.some((s) => s.x === newFood.x && s.y === newFood.y));
    return newFood;
  };

  const step = () => {
    const state = gameStateRef.current;
    if (!state.alive) return;

    state.dir = state.nextDir;
    const head = { x: state.snake[0].x + state.dir.x, y: state.snake[0].y + state.dir.y };

    if (
      head.x < 0 ||
      head.y < 0 ||
      head.x >= COLS ||
      head.y >= ROWS ||
      state.snake.some((s) => s.x === head.x && s.y === head.y)
    ) {
      state.alive = false;
      setBest((prevBest) => {
        const nextBest = Math.max(prevBest, state.snake.length - 3);
        try {
          localStorage.setItem('jun_snake_best', nextBest);
        } catch {}
        return nextBest;
      });
      draw();
      return;
    }

    state.snake.unshift(head);
    if (head.x === state.food.x && head.y === state.food.y) {
      const newScore = state.snake.length - 3;
      setScore(newScore);
      state.food = placeFood(state.snake);
    } else {
      state.snake.pop();
    }

    draw();
  };

  const resetGame = () => {
    const initialSnake = [{ x: 11, y: 12 }, { x: 10, y: 12 }, { x: 9, y: 12 }];
    const initialFood = placeFood(initialSnake);
    gameStateRef.current = {
      snake: initialSnake,
      dir: { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      food: initialFood,
      alive: true,
      timer: gameStateRef.current.timer,
    };
    setScore(0);
    draw();
  };

  const startGame = () => {
    resetGame();
    if (!gameStateRef.current.timer) {
      gameStateRef.current.timer = setInterval(step, TICK);
    }
  };

  const closeGame = () => {
    setOpen(false);
    if (gameStateRef.current.timer) {
      clearInterval(gameStateRef.current.timer);
      gameStateRef.current.timer = null;
    }
  };

  useEffect(() => {
    const onLaunch = () => {
      setOpen(true);
      setTimeout(() => {
        startGame();
      }, 50);
    };

    window.addEventListener('jun:launch-snake', onLaunch);
    return () => {
      window.removeEventListener('jun:launch-snake', onLaunch);
      if (gameStateRef.current.timer) {
        clearInterval(gameStateRef.current.timer);
      }
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      const k = e.key;
      const state = gameStateRef.current;
      const map = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 },
        s: { x: 0, y: 1 },
        a: { x: -1, y: 0 },
        d: { x: 1, y: 0 },
        W: { x: 0, y: -1 },
        S: { x: 0, y: 1 },
        A: { x: -1, y: 0 },
        D: { x: 1, y: 0 },
      };

      if (map[k]) {
        e.preventDefault();
        if (!state.alive) return;
        const nd = map[k];
        if (!(nd.x === -state.dir.x && nd.y === -state.dir.y)) {
          state.nextDir = nd;
        }
      } else if ((k === ' ' || k === 'Enter') && !state.alive) {
        e.preventDefault();
        startGame();
      } else if (k === 'Escape') {
        e.preventDefault();
        closeGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <div
      className={`snake-backdrop ${open ? 'open' : ''}`}
      id="snakeBackdrop"
      aria-hidden={!open}
      onClick={(e) => {
        if (e.target.id === 'snakeBackdrop') closeGame();
      }}
    >
      <div className="snake-panel glass" role="dialog" aria-modal="true" aria-label="Packet Snake game">
        <div className="snake-head">
          <h3>PACKET SNAKE</h3>
          <button className="cs-close" id="snakeClose" aria-label="Close game" onClick={closeGame}>
            ✕
          </button>
        </div>
        <div className="snake-score">
          <span>
            packets eaten: <b id="snakeScore" style={{ color: 'var(--a1)' }}>{score}</b>
          </span>
          <span>
            best: <b id="snakeBest" style={{ color: 'var(--a1)' }}>{best}</b>
          </span>
        </div>
        <div className="snake-stage">
          <canvas ref={canvasRef} id="snakeCanvas" width="384" height="384"></canvas>
        </div>
        <div className="snake-foot">↑↓←→ / WASD to steer · SPACE to reconnect · ESC to quit</div>
      </div>
    </div>
  );
}
