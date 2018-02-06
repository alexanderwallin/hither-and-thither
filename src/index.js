const Axis = {
  X: 'X',
  Y: 'Y',
}

export const Direction = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  NONE: 'NONE',
}

const defaultState = {
  direction: {
    x: null,
    y: null,
  },
  dx: 0,
  dy: 0,
}

function getDirection(axis, movement) {
  if (movement > 0) {
    return axis === Axis.X ? Direction.RIGHT : Direction.DOWN
  } else if (movement < 0) {
    return axis === Axis.X ? Direction.LEFT : Direction.UP
  }
  return Direction.NONE
}

function getDeltaState(a, b) {
  const dx = b.scrollLeft - a.scrollLeft
  const dy = b.scrollTop - a.scrollTop
  const direction = {
    x: getDirection(Axis.X, dx),
    y: getDirection(Axis.Y, dy),
  }

  return { dx, dy, direction }
}

export function getScrollState(oldState, scrollEvent) {
  const comparisonState = oldState || defaultState
  const deltaState = getDeltaState(comparisonState, scrollEvent)

  return {
    ...scrollEvent,
    ...deltaState,
  }
}
