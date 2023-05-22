import { FocusableElement, focusable } from "tabbable";

// Define the keys for the D-pad directions
const KEY_UP = "ArrowUp";
const KEY_DOWN = "ArrowDown";
const KEY_LEFT = "ArrowLeft";
const KEY_RIGHT = "ArrowRight";
const KEY_ENTER = "Enter";

type Direction = "up" | "down" | "left" | "right";

// Listen for keydown event
document.addEventListener("keydown", (event) => {
  const key = event.key;

  // Track the current direction
  let currentDirection: Direction | null = null;

  // Update currentDirection based on key press
  switch (key) {
    case KEY_UP:
      currentDirection = "up";
      break;
    case KEY_DOWN:
      currentDirection = "down";
      break;
    case KEY_LEFT:
      currentDirection = "left";
      break;
    case KEY_RIGHT:
      currentDirection = "right";
      break;
  }

  if (currentDirection)
    // Call a function to handle the currentDirection
    handleDirection(currentDirection);
});
document.addEventListener("keyup", (event) => {
  const key = event.key;
  if (key === KEY_ENTER)
    (getFocusedElement() as HTMLElement)?.dispatchEvent(
      new PointerEvent("pointerup"),
    );
});

const getFocusableElements = () =>
  focusable(document.body, { getShadowRoot: true }) as HTMLElement[];
const getFocusedElementIndex = (elements?: FocusableElement[]) =>
  (elements ?? getFocusableElements()).findIndex((element) =>
    element.matches(":focus"),
  );
const getFocusedElement = (elements?: FocusableElement[]) =>
  (elements ?? getFocusableElements()).find((element) =>
    element.matches(":focus"),
  );

function handleDirection(direction: Direction) {
  // Find the nearest focusable element based on the current direction
  const nextElement = findNearestFocusableElement(direction);
  // Set focus on the next element
  nextElement?.focus();
}

// Helper function to find the nearest focusable element based on direction
function findNearestFocusableElement(direction) {
  const focusableElements = getFocusableElements();
  const focusedElementIndex = getFocusedElementIndex(focusableElements);
  const focusedElement = focusableElements.splice(focusedElementIndex, 1)[0];

  if (!focusedElement) return focusableElements[0];

  if (
    (focusedElement.matches('input[type="range"]') &&
      ["left", "right"].includes(direction)) ||
    (focusedElement as HTMLElement).offsetParent instanceof HTMLDialogElement
  )
    return null;

  // Calculate distances from the current focused element to focusable elements
  const distances = focusableElements
    .map((element) => {
      const rect1 = focusedElement.getBoundingClientRect();
      const rect2 = element.getBoundingClientRect();
      const distance = calculateDistance(rect1, rect2);
      return { element, distance, rect: rect2 };
    }).filter((x) => {
      if (direction === "left") return x.distance.dx > 0;
      if (direction === "right") return x.distance.dx < 0;
      if (direction === "up") return x.distance.dy > 0;
      if (direction === "down") return x.distance.dy < 0;
    });
  let sortedArray: typeof distances | undefined;
  if (["left", "right"].includes(direction)) {
    const sameLineDistances = distances.filter((x) => x.distance.dy === 0);
    sortedArray = (sameLineDistances.length ? sameLineDistances : distances).sort((a, b) => Math.abs(a.distance.dx) - Math.abs(b.distance.dx))
  } else
    sortedArray = distances.sort((a, b) => Math.abs(a.distance.dy) - Math.abs(b.distance.dy));

  return sortedArray?.[0]?.element;
}

// Helper function to calculate the distance between two elements
function calculateDistance(
  rect1: DOMRect,
  rect2: DOMRect,
) {
  const x1 = rect1.left;
  const y1 = rect1.top;
  const x2 = rect2.left;
  const y2 = rect2.top;

  const dx = x1 - x2;
  const dy = y1 - y2;

  return { dx, dy };
}
