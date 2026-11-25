// Keyboard and mouse, normalised into one small state the game loop reads each frame.
// Movement keys are held; action keys are edge-triggered (pressed this frame only).
export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keysDown = new Set();
    this.pressed = new Set();
    this.moveTarget = null; // {x, y} in canvas coordinates, from a mouse click
    this.mouse = { x: 0, y: 0 };
    this.clickedStation = null;

    window.addEventListener('keydown', (event) => {
      if (event.repeat) return;
      this.keysDown.add(event.code);
      this.pressed.add(event.code);
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
        event.preventDefault();
      }
    });
    window.addEventListener('keyup', (event) => this.keysDown.delete(event.code));
    window.addEventListener('blur', () => {
      this.keysDown.clear();
      this.moveTarget = null;
    });

    canvas.addEventListener('pointerdown', (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
      this.mouse = { x, y };
      this.moveTarget = { x, y };
      this.clickedStation = { x, y };
    });
  }

  /** True while any of the given codes is held down. */
  held(...codes) {
    return codes.some((code) => this.keysDown.has(code));
  }

  /** True only on the frame the key went down; the game clears it after each update. */
  wasPressed(...codes) {
    return codes.some((code) => this.pressed.has(code));
  }

  /** The movement vector from held keys, normalised; zero when none are held. */
  moveVector() {
    let x = 0;
    let y = 0;
    if (this.held('KeyA', 'ArrowLeft')) x -= 1;
    if (this.held('KeyD', 'ArrowRight')) x += 1;
    if (this.held('KeyW', 'ArrowUp')) y -= 1;
    if (this.held('KeyS', 'ArrowDown')) y += 1;
    if (x !== 0 && y !== 0) {
      const len = Math.hypot(x, y);
      x /= len;
      y /= len;
    }
    return { x, y };
  }

  /** Any movement key held, or a click target waiting. */
  get wantsToMove() {
    return this.moveVector().x !== 0 || this.moveVector().y !== 0 || this.moveTarget !== null;
  }

  endFrame() {
    this.pressed.clear();
    this.clickedStation = null;
  }
}
