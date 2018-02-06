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

export function withVelocity(gSS, timespan) {
  return (oldState, scrollEvent) => {
    let history = oldState.history || []

    const state = gSS(oldState, scrollEvent)
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
      velocity.x = (state.scrollLeft - history[0].scrollLeft) / dt
      velocity.y = (state.scrollTop - history[0].scrollTop) / dt
    }

    state.velocity = velocity
    state.history = history.concat({ ...state })

    return state
  }
}
