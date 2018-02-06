import test from 'ava'
import td from 'testdouble'
import { has, isNumber, set } from 'lodash'

import {
  Axis,
  Direction,
  getScrollDirection,
  getScrollPosition,
  getScrollState,
  withPositionGetter,
  withVelocity,
} from '../src/index.js'

const emptyState = {
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

const zeroPosition = { x: 0, y: 0 }

//
// getScrollDirection()
//

test('getScrollDirection() returns NONE when movement is 0', t => {
  t.is(getScrollDirection(Axis.X, 0), Direction.NONE)
  t.is(getScrollDirection(Axis.Y, 0), Direction.NONE)
})

test('getScrollDirection() returns correct directions', t => {
  t.is(getScrollDirection(Axis.X, -1), Direction.LEFT)
  t.is(getScrollDirection(Axis.X, 1), Direction.RIGHT)
  t.is(getScrollDirection(Axis.Y, -1), Direction.UP)
  t.is(getScrollDirection(Axis.Y, 1), Direction.DOWN)
})

//
// getScrollPosition()
//

test('getScrollPosition() maps scrollLeft and scrollTop properties to { x, y }', t => {
  const position = getScrollPosition({ scrollLeft: 123, scrollTop: 456 })
  t.deepEqual(position, { x: 123, y: 456 })
})

//
// getScrollState()
//

test('getScrollState() returns correct delta values', t => {
  // dx
  const stateX1 = getScrollState(
    set({ ...emptyState }, 'scrollPosition.x', -10),
    { x: 10, y: 0 }
  )
  t.is(stateX1.delta.x, 20)

  const stateX2 = getScrollState(
    set({ ...emptyState }, 'scrollPosition.x', 10),
    { x: -10, y: 0 }
  )
  t.is(stateX2.delta.x, -20)

  const stateX3 = getScrollState(
    set({ ...emptyState }, 'scrollPosition.x', -10),
    { x: -20, y: 0 }
  )
  t.is(stateX3.delta.x, -10)

  const stateX4 = getScrollState(
    set({ ...emptyState }, 'scrollPosition.x', 10),
    { x: 20, y: 0 }
  )
  t.is(stateX4.delta.x, 10)

  const stateX5 = getScrollState(
    set({ ...emptyState }, 'scrollPosition.x', -666),
    { x: -666, y: 0 }
  )
  t.is(stateX5.delta.x, 0)

  const stateX6 = getScrollState(
    set({ ...emptyState }, 'scrollPosition.x', 0),
    { x: 0, y: 0 }
  )
  t.is(stateX6.delta.x, 0)

  // dy
  const stateY1 = getScrollState(
    set({ ...emptyState }, 'scrollPosition.y', -10),
    { x: 0, y: 10 }
  )
  t.is(stateY1.delta.y, 20)

  const stateY2 = getScrollState(
    set({ ...emptyState }, 'scrollPosition.y', 10),
    { x: 0, y: -10 }
  )
  t.is(stateY2.delta.y, -20)

  const stateY3 = getScrollState(
    set({ ...emptyState }, 'scrollPosition.y', -10),
    { x: 0, y: -20 }
  )
  t.is(stateY3.delta.y, -10)

  const stateY4 = getScrollState(
    set({ ...emptyState }, 'scrollPosition.y', 10),
    { x: 0, y: 20 }
  )
  t.is(stateY4.delta.y, 10)

  const stateY5 = getScrollState(
    set({ ...emptyState }, 'scrollPosition.y', -666),
    { x: 0, y: -666 }
  )
  t.is(stateY5.delta.y, 0)

  const stateY6 = getScrollState(
    set({ ...emptyState }, 'scrollPosition.y', 0),
    { x: 0, y: 0 }
  )
  t.is(stateY6.delta.y, 0)
})

// Directions
test('directions are NONE for equal scroll positions', t => {
  const scrollPosition = { x: 123, y: 123 }

  const state = getScrollState(
    { ...emptyState, scrollPosition },
    scrollPosition
  )
  t.is(state.direction.x, Direction.NONE)
  t.is(state.direction.y, Direction.NONE)
})

test('directions are correct', t => {
  const state1 = getScrollState(emptyState, { x: 10, y: 0 })
  t.is(state1.direction.x, Direction.RIGHT)

  const state2 = getScrollState(emptyState, { x: -10, y: 0 })
  t.is(state2.direction.x, Direction.LEFT)

  const state3 = getScrollState(emptyState, { x: 0, y: 10 })
  t.is(state3.direction.y, Direction.DOWN)

  const state4 = getScrollState(emptyState, { x: 0, y: -10 })
  t.is(state4.direction.y, Direction.UP)
})

//
// withPositionGetter()
//

test('withPositionGetter() provides getScrollState() with a scroll position using a given function', t => {
  const getPosition = td
    .when(td.function('getPosition')())
    .thenReturn({ x: 123, y: 456 })

  const getScrollStateWithPosition = withPositionGetter(
    getPosition,
    getScrollState
  )

  const state = getScrollStateWithPosition(null)
  t.deepEqual(state.scrollPosition, { x: 123, y: 456 })
})

//
// withVelocity()
//

const SECOND = 1000

let getScrollStateWithVelocity

test.beforeEach(() => {
  getScrollStateWithVelocity = withVelocity(SECOND, getScrollState)
  td.replace(Date, 'now')
})

test.afterEach(() => {
  td.reset()
})

test('withVelocity() decorated function returns a state that has all common properties', t => {
  const state = getScrollStateWithVelocity(emptyState, zeroPosition)
  t.true(has(state, 'delta.x'))
  t.true(has(state, 'delta.y'))
  t.true(has(state, 'direction.x'))
  t.true(has(state, 'direction.y'))
  t.true(has(state, 'scrollPosition.x'))
  t.true(has(state, 'scrollPosition.y'))
})

test('withVelocity() decorated function returns null velocities in its first invokation', t => {
  const state = getScrollStateWithVelocity(emptyState, zeroPosition)
  t.is(state.velocity.x, null)
  t.is(state.velocity.y, null)
})

test('withVelocity() decorated function returns null velocities until its timespan has passed', t => {
  td.when(Date.now()).thenReturn(0, SECOND / 2, SECOND)

  const state1 = getScrollStateWithVelocity(emptyState, zeroPosition)
  t.is(state1.velocity.x, null)
  t.is(state1.velocity.y, null)

  const state2 = getScrollStateWithVelocity(state1, zeroPosition)
  t.is(state2.velocity.x, null)
  t.is(state2.velocity.y, null)

  const state3 = getScrollStateWithVelocity(state2, zeroPosition)
  t.true(isNumber(state3.velocity.x))
  t.true(isNumber(state3.velocity.y))
})

test('withVelocity() decorated function returns correct velocities', t => {
  td.when(Date.now()).thenReturn(0, SECOND, SECOND * 3, SECOND * 6)

  const state1 = getScrollStateWithVelocity(emptyState, zeroPosition)

  const state2 = getScrollStateWithVelocity(state1, { x: 10, y: 10 })
  t.is(state2.velocity.x, 10 / SECOND)
  t.is(state2.velocity.y, 10 / SECOND)

  const state3 = getScrollStateWithVelocity(state2, {
    x: state2.scrollPosition.x + 250,
    y: state2.scrollPosition.y + 500,
  })
  t.is(state3.velocity.x, 250 / (SECOND * 2))
  t.is(state3.velocity.y, 500 / (SECOND * 2))

  const state4 = getScrollStateWithVelocity(state3, {
    x: state3.scrollPosition.x + 666,
    y: state3.scrollPosition.y - 666,
  })
  t.is(state4.velocity.x, 666 / (SECOND * 3))
  t.is(state4.velocity.y, -666 / (SECOND * 3))
})

test('withVelocity() decorated function ignores ancient events', t => {
  td.when(Date.now()).thenReturn(SECOND * 10)

  const event1 = { ...emptyState, timestamp: 0 }
  const event2 = { ...emptyState, timestamp: 1 }
  const event3 = { ...emptyState, timestamp: 3 }
  const event4 = { ...emptyState, timestamp: SECOND }
  const oldState = {
    ...emptyState,
    history: [event1, event2, event3, event4],
  }

  const state = getScrollStateWithVelocity(oldState, {
    x: 100,
    y: -100,
  })
  t.is(state.velocity.x, 100 / (SECOND * 9))
  t.is(state.velocity.y, -100 / (SECOND * 9))
})
