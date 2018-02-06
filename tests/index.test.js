import test from 'ava'
import { keys, pick } from 'lodash'

import { Direction, getScrollState } from '../src/index.js'

const emptyEvent = {
  scrollLeft: 0,
  scrollTop: 0,
}

test('getScrollState() returns a state with all the properties from the scroll event', t => {
  const evt = { ...emptyEvent }
  const state = getScrollState(null, evt)

  t.deepEqual(evt, pick(state, keys(evt)))
})

test('dx and dy are correct', t => {
  // dx
  const stateX1 = getScrollState(
    { ...emptyEvent, scrollLeft: -10 },
    { ...emptyEvent, scrollLeft: 10 }
  )
  t.is(stateX1.dx, 20)

  const stateX2 = getScrollState(
    { ...emptyEvent, scrollLeft: 10 },
    { ...emptyEvent, scrollLeft: -10 }
  )
  t.is(stateX2.dx, -20)

  const stateX3 = getScrollState(
    { ...emptyEvent, scrollLeft: -10 },
    { ...emptyEvent, scrollLeft: -20 }
  )
  t.is(stateX3.dx, -10)

  const stateX4 = getScrollState(
    { ...emptyEvent, scrollLeft: 10 },
    { ...emptyEvent, scrollLeft: 20 }
  )
  t.is(stateX4.dx, 10)

  const stateX5 = getScrollState(
    { ...emptyEvent, scrollLeft: -666 },
    { ...emptyEvent, scrollLeft: -666 }
  )
  t.is(stateX5.dx, 0)

  const stateX6 = getScrollState(
    { ...emptyEvent, scrollLeft: 0 },
    { ...emptyEvent, scrollLeft: 0 }
  )
  t.is(stateX6.dx, 0)

  // dy
  const stateY1 = getScrollState(
    { ...emptyEvent, scrollTop: -10 },
    { ...emptyEvent, scrollTop: 10 }
  )
  t.is(stateY1.dy, 20)

  const stateY2 = getScrollState(
    { ...emptyEvent, scrollTop: 10 },
    { ...emptyEvent, scrollTop: -10 }
  )
  t.is(stateY2.dy, -20)

  const stateY3 = getScrollState(
    { ...emptyEvent, scrollTop: -10 },
    { ...emptyEvent, scrollTop: -20 }
  )
  t.is(stateY3.dy, -10)

  const stateY4 = getScrollState(
    { ...emptyEvent, scrollTop: 10 },
    { ...emptyEvent, scrollTop: 20 }
  )
  t.is(stateY4.dy, 10)

  const stateY5 = getScrollState(
    { ...emptyEvent, scrollTop: -666 },
    { ...emptyEvent, scrollTop: -666 }
  )
  t.is(stateY5.dy, 0)

  const stateY6 = getScrollState(
    { ...emptyEvent, scrollTop: 0 },
    { ...emptyEvent, scrollTop: 0 }
  )
  t.is(stateY6.dy, 0)
})

test('directions are NONE for equal scroll events', t => {
  const state = getScrollState(emptyEvent, emptyEvent)
  t.is(state.direction.x, Direction.NONE)
  t.is(state.direction.y, Direction.NONE)
})

test('directions are correct', t => {
  const state1 = getScrollState(emptyEvent, { ...emptyEvent, scrollLeft: 10 })
  t.is(state1.direction.x, Direction.RIGHT)

  const state2 = getScrollState(emptyEvent, { ...emptyEvent, scrollLeft: -10 })
  t.is(state2.direction.x, Direction.LEFT)

  const state3 = getScrollState(emptyEvent, { ...emptyEvent, scrollTop: 10 })
  t.is(state3.direction.y, Direction.DOWN)

  const state4 = getScrollState(emptyEvent, { ...emptyEvent, scrollTop: -10 })
  t.is(state4.direction.y, Direction.UP)
})
