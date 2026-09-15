const pathElement = document.querySelector<SVGPathElement>(
  "#needly-path"
);

if (!pathElement) {
  throw new Error(
    "Could not find the Needly loading path."
  );
}

const path: SVGPathElement = pathElement;

const DRAW_DURATION = 2800;
const PAUSE_DURATION = 700;

const pathLength = path.getTotalLength();

path.style.strokeDasharray = `${pathLength}`;
path.style.strokeDashoffset = `${pathLength}`;

function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function draw(
  startTime: number
): void {

  function frame(currentTime: number): void {

    const elapsed =
      currentTime - startTime;

    const rawProgress =
      Math.min(
        elapsed / DRAW_DURATION,
        1
      );

    const progress =
      easeInOutCubic(rawProgress);

    const offset =
      pathLength * (1 - progress);

    path.style.strokeDashoffset =
      `${offset}`;

    if (rawProgress < 1) {

      requestAnimationFrame(frame);

    } else {

      path.style.strokeDashoffset = "0";

      window.setTimeout(() => {

        reset();

      }, PAUSE_DURATION);
    }
  }

  requestAnimationFrame(frame);
}

function reset(): void {

  path.style.strokeDashoffset =
    `${pathLength}`;

  requestAnimationFrame(
    (timestamp) => {

      draw(timestamp);

    }
  );
}

function prefersReducedMotion(): boolean {

  return window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
}

if (prefersReducedMotion()) {

  path.style.strokeDasharray =
    "none";

  path.style.strokeDashoffset =
    "0";

} else {

  requestAnimationFrame(
    (timestamp) => {

      draw(timestamp);

    }
  );
}
