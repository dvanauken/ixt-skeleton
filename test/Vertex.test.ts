import { describe, it, expect } from 'vitest'
import { Vector } from '../src/Vector'
import { Edge } from '../src/Edge'
import { Vertex } from '../src/Vertex'

describe('Vertex', () => {

    it('should calculate the bisector correctly', () => {
    const v1 = new Vector(0, 0)
    const v2 = new Vector(1, 0)
    const v3 = new Vector(1, 1)
    const vertex = new Vertex(v2)
    const e1 = new Edge(new Vertex(v1), vertex)
    const e2 = new Edge(vertex, new Vertex(v3))
    vertex.setPrevEdge(e1)
    vertex.setNextEdge(e2)
    const b = vertex.calculateBisector()
    expect(b.x).toBeCloseTo(Math.SQRT1_2, 5)
    expect(b.y).toBeCloseTo(Math.SQRT1_2, 5)
  })

  it('should identify a reflex vertex', () => {
    const v1 = new Vector(0, 0)
    const v2 = new Vector(1, 0)
    const v3 = new Vector(1, -1)
    const vertex = new Vertex(v2)
    const e1 = new Edge(new Vertex(v1), vertex)
    const e2 = new Edge(vertex, new Vertex(v3))
    vertex.setPrevEdge(e1)
    vertex.setNextEdge(e2)
    expect(vertex.isReflex()).toBe(true)
  })

  it('should calculate speed correctly', () => {
    const v1 = new Vector(0, 0)
    const v2 = new Vector(1, 0)
    const v3 = new Vector(1, 1)
    const vertex = new Vertex(v2)
    const e1 = new Edge(new Vertex(v1), vertex)
    const e2 = new Edge(vertex, new Vertex(v3))
    vertex.setPrevEdge(e1)
    vertex.setNextEdge(e2)
    const s = vertex.calculateSpeed()
    expect(s).toBeCloseTo(1 / Math.sin(Math.PI / 4), 5)
  })

  it('should compute position at time correctly', () => {
    const v1 = new Vector(0, 0)
    const v2 = new Vector(1, 0)
    const v3 = new Vector(1, 1)
    const vertex = new Vertex(v2)
    const e1 = new Edge(new Vertex(v1), vertex)
    const e2 = new Edge(vertex, new Vertex(v3))
    vertex.setPrevEdge(e1)
    vertex.setNextEdge(e2)
    const t = 1
    const pos = vertex.computePositionAtTime(t)
    const dist = t / vertex.calculateSpeed()
    expect(pos.x).toBeCloseTo(1 + Math.SQRT1_2 * dist, 5)
    expect(pos.y).toBeCloseTo(0 + Math.SQRT1_2 * dist, 5)
  })
})
