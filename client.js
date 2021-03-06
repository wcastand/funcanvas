const choo = require('choo')
const cache = require('cache-element')
const html = require('choo/html')
const sf = require('sheetify')
const app = choo()

sf('./main.styl', { global: true })
window.requestAnimationFrame = window.requestAnimationFrame ||
window.mozRequestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.msRequestAnimationFrame

const randomRange =
  (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

app.model({
  state: {
    canvas: null,
    ctx: null,
    segments: [],
    nbSegment: 100,
  },
  reducers: {
    init: (data, state) =>
      Object.assign({}, state, data),
    segment: (segments, state) =>
      Object.assign({}, state, { segments }),
    updateSegments: (data, state) =>
      state.segments.map(s => s.addPoint()),
  },
  effects: {
    timerPoint: (data, state, send, done) => {
      send('updateSegments', done)
      setTimeout(() => send('timerPoint', done), 10)
    },
    setSegments: (data, state, send, done) => {
        const segments = []
        for(let i = 0;i < 31 ; i++) segments.push(Segment(i))
        send('segment', segments, done)
    },
    frame: (data, state, send, done) => {
      if (state.canvas === null) {
        const canvas = document.querySelector('#world')
        const ctx = canvas.getContext('2d')
        const segments = []
        for(let i = 0;i < 15 ; i++) segments.push(Segment(i))

        send('init', { canvas, ctx }, done)
        send('segment', segments, done)
        send('timerPoint', done)
        return requestAnimationFrame(() => send('frame', done))
      }
      else{
        state.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
        state.segments.map(s => {
          state.ctx.beginPath()
          state.ctx.lineWidth = 1
          state.ctx.lineJoin = state.ctx.lineCap = 'round'
          state.ctx.moveTo(s.points[0][0], s.points[0][1])
          for(let i = 1; i < s.points.length - 1; i+=2){
            state.ctx.strokeStyle = `hsl(${s.angle % 360 * i}, 35%, 57%)`
            state.ctx.quadraticCurveTo(s.points[i][0], s.points[i][1], s.points[i+1][0], s.points[i+1][1])
          }
          state.ctx.stroke()
        })
        requestAnimationFrame(() => send('frame', done))
      }
    }
  },
  subscriptions: [
    (send, done) =>
      requestAnimationFrame(() => send('frame', done)),
  ]
})

const view = cache((state, prev, send) =>
  html`
    <div>
      <input type='range' min=5 max=50 value=30 class="segments">
      <canvas id='world' width=${window.innerWidth} height=${window.innerHeight}></canvas>
    </div>
  `
)

app.router(r => [ r('/', view) ])
document.addEventListener('DOMContentLoaded', function (event) {
  const tree = app.start()
  document.body.appendChild(tree)
})

const Point = (x, y) => [x, y]
const Segment = (offset = 0) => {
  let angle = offset / 360
  let length = 10
  const points = []

  const start = Point(window.innerWidth / 2, window.innerHeight / 2)
  points.push(start)

  return {
    addPoint: () => {
      const x = window.innerWidth / 2 + Math.cos(angle) * length
      const y = window.innerHeight / 2 + Math.sin(angle) * length
      angle += 1
      length += .5
      if(points.length < 500)
        points.push(Point(x, y))
    },
    angle: offset,
    points
  }
}
