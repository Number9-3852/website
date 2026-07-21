// Decode field: a grid of characters that idles as noise and resolves
// into brighter, steadier glyphs near the cursor — like a flashlight
// passing over encoded text. Mounts onto any element with #decodeCanvas
// inside a container passed as the function argument.
function initDecodeField(containerSelector){
  const canvas = document.getElementById('decodeCanvas');
  if (!canvas) return;
  const container = document.querySelector(containerSelector);
  const ctx = canvas.getContext('2d');
  const CHARS = "01{}[]<>/\\;:_-+=*#$@%01010101abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const CELL = 15;
  const RADIUS = 190;

  let cols, rows, cells = [];
  let mouse = { x: -9999, y: -9999 };
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function randChar(){ return CHARS[(Math.random() * CHARS.length) | 0]; }

  function resize(){
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cols = Math.ceil(rect.width / CELL) + 1;
    rows = Math.ceil(rect.height / CELL) + 1;
    cells = new Array(cols * rows);
    for (let i = 0; i < cells.length; i++){
      cells[i] = { ch: randChar(), o: 0.05 + Math.random() * 0.08 };
    }
  }

  function onMove(e){
    const rect = container.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }
  function onLeave(){ mouse.x = -9999; mouse.y = -9999; }

  window.addEventListener('mousemove', onMove);
  container.addEventListener('mouseleave', onLeave);
  window.addEventListener('resize', resize);

  function tick(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${CELL - 2}px 'IBM Plex Mono', monospace`;
    ctx.textBaseline = 'top';

    for (let r = 0; r < rows; r++){
      for (let c = 0; c < cols; c++){
        const idx = r * cols + c;
        const cell = cells[idx];
        const x = c * CELL;
        const y = r * CELL;

        const dx = (x - mouse.x);
        const dy = (y - mouse.y);
        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetO = 0.05 + Math.random() * 0.03;
        if (dist < RADIUS){
          const proximity = 1 - dist / RADIUS;
          targetO = 0.08 + proximity * 0.85;
          if (Math.random() < proximity * 0.10) cell.ch = randChar();
        } else if (Math.random() < 0.0025) {
          cell.ch = randChar();
        }

        cell.o += (targetO - cell.o) * 0.12;

        if (cell.o > 0.02){
          const isHot = dist < RADIUS * 0.4;
          ctx.fillStyle = isHot
            ? `rgba(10, 210, 61, ${Math.min(cell.o, 1)})`
            : `rgba(10, 150, 40, ${Math.min(cell.o, 1)})`;
          ctx.fillText(cell.ch, x, y);
        }
      }
    }
    requestAnimationFrame(tick);
  }

  resize();
  requestAnimationFrame(tick);
}
