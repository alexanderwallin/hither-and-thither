import test from 'ava'
import td from 'testdouble'
import { has, isNumber, keys, pick } from 'lodash'

import { Direction, getScrollState, withVelocity } from '../src/index.js'

const emptyEvent = {
  scrollLeft: 0,
  scrollTop: 0,
}

test('getScrollState() returns a state with all the properties from the scroll event', t => {
  const evt = { ...emptyEvent }
  const state = getScrollState(null, evt)

  t.deepEqual(evt, pick(state, keys(evt)))
})

//
// Delta values
//

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

//
// Directions
//

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

//
// Velocity
//

const SECOND = 1000

let getScrollStateWithVelocity
let fakeDate

test.beforeEach(() => {
  getScrollStateWithVelocity = withVelocity(getScrollState, SECOND)
  fakeDate = td.replace(Date, 'now')
})

test.afterEach(() => {
  td.reset()
})

test('withVelocity() decorated function returns a state that has all common properties', t => {
  const state = getScrollStateWithVelocity(emptyEvent, emptyEvent)
  t.true(has(state, 'dx'))
  t.true(has(state, 'dy'))
  t.true(has(state, 'direction.x'))
  t.true(has(state, 'direction.y'))
})

test('withVelocity() decorated function returns null velocities in its first invokation', t => {
  const state = getScrollStateWithVelocity(emptyEvent, emptyEvent)
  t.is(state.velocity.x, null)
  t.is(state.velocity.y, null)
})

test('withVelocity() decorated function returns null velocities until its timespan has passed', t => {
  td.when(Date.now()).thenReturn(0, SECOND / 2, SECOND)

  const state1 = getScrollStateWithVelocity(emptyEvent, emptyEvent)
  t.is(state1.velocity.x, null)
  t.is(state1.velocity.y, null)

  const state2 = getScrollStateWithVelocity(state1, emptyEvent)
  t.is(state2.velocity.x, null)
  t.is(state2.velocity.y, null)

  const state3 = getScrollStateWithVelocity(state2, emptyEvent)
  t.true(isNumber(state3.velocity.x))
  t.true(isNumber(state3.velocity.y))
})

test('withVelocity() decorated function returns correct velocities', t => {
  td.when(Date.now()).thenReturn(0, SECOND, SECOND * 3, SECOND * 6)

  const state1 = getScrollStateWithVelocity(emptyEvent, emptyEvent)

  const state2 = getScrollStateWithVelocity(state1, {
    ...emptyEvent,
    scrollLeft: 10,
    scrollTop: 10,
  })
  t.is(state2.velocity.x, 10 / SECOND)
  t.is(state2.velocity.y, 10 / SECOND)

  const state3 = getScrollStateWithVelocity(state2, {
    ...emptyEvent,
    scrollLeft: state2.scrollLeft + 250,
    scrollTop: state2.scrollTop + 500,
  })
  t.is(state3.velocity.x, 250 / (SECOND * 2))
  t.is(state3.velocity.y, 500 / (SECOND * 2))

  const state4 = getScrollStateWithVelocity(state3, {
    ...emptyEvent,
    scrollLeft: state3.scrollLeft + 666,
    scrollTop: state3.scrollTop - 666,
  })
  t.is(state4.velocity.x, 666 / (SECOND * 3))
  t.is(state4.velocity.y, -666 / (SECOND * 3))
})

test('withVelocity() decorated function ignores ancient events', t => {
  td.when(Date.now()).thenReturn(SECOND * 10)

  const event1 = { ...emptyEvent, timestamp: 0 }
  const event2 = { ...emptyEvent, timestamp: 1 }
  const event3 = { ...emptyEvent, timestamp: 3 }
  const event4 = { ...emptyEvent, timestamp: SECOND }
  const oldState = {
    ...emptyEvent,
    history: [event1, event2, event3, event4],
  }

  const state = getScrollStateWithVelocity(oldState, {
    ...emptyEvent,
    scrollLeft: 100,
    scrollTop: -100,
  })
  t.is(state.velocity.x, 100 / (SECOND * 9))
  t.is(state.velocity.y, -100 / (SECOND * 9))
})
