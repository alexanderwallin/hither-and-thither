export const Axis = {
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
  delta: {
    x: 0,
    y: 0,
  },
  direction: {
    x: null,
    y: null,
  },
  scrollPosition: {
    x: 0,
    y: 0,
  },
}

export function getScrollDirection(axis, movement) {
  if (movement > 0) {
    return axis === Axis.X ? Direction.RIGHT : Direction.DOWN
  } else if (movement < 0) {
    return axis === Axis.X ? Direction.LEFT : Direction.UP
  }
  return Direction.NONE
}

export function getScrollPosition(element) {
  return {
    x: element.scrollLeft,
    y: element.scrollTop,
  }
}

export function getScrollState(oldState, scrollPosition) {
  const comparisonState = oldState || defaultState

  const delta = {
    x: scrollPosition.x - comparisonState.scrollPosition.x,
    y: scrollPosition.y - comparisonState.scrollPosition.y,
  }

  const direction = {
    x: getScrollDirection(Axis.X, delta.x),
    y: getScrollDirection(Axis.Y, delta.y),
  }

  return {
    delta,
    direction,
    scrollPosition,
  }
}

export function withPositionGetter(getPosition, gSS) {
  return oldState => gSS(oldState, getPosition())
}

export function withVelocity(timespan, gSS) {
  return (oldState, scrollPosition) => {
    let history =
      oldState === null || oldState.history === undefined
        ? []
        : oldState.history

    const state = gSS(oldState, scrollPosition)
    const now = Date.now()
    state.timestamp = now

    const velocity = {
      x: null,
      y: null,
    }

    if (history.length > 0 && now - history[0].timestamp >= timespan) {
      // Remove old events until there is only one that happened >= timespan ago
      while (history.length > 1 && now - history[1].timestamp >= timespan) {
        history = history.slice(1)
      }

      const dt = state.timestamp - history[0].timestamp
      velocity.x = (state.scrollPosition.x - history[0].scrollPosition.x) / dt
      velocity.y = (state.scrollPosition.y - history[0].scrollPosition.y) / dt
    }

    state.velocity = velocity
    state.history = history.concat({ ...state })

    return state
  }
}
