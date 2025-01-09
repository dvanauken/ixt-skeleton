import { describe, it, expect } from 'vitest'
import { Edge } from '../src/Edge'
import { Vertex } from '../src/Vertex'
import { Vector } from '../src/Vector'

describe('Edge', () => {
  describe('construction and connectivity', () => {
    it('establishes correct vertex connectivity', () => {
      const v1 = new Vertex(new Vector(0, 0))
      const v2 = new Vertex(new Vector(1, 1))
      const edge = new Edge(v1, v2)

      expect(edge.origin).toBe(v1)
      expect(edge.destination).toBe(v2)
      expect(v1.nextEdge).toBe(edge)
      expect(v2.prevEdge).toBe(edge)
    })

    it('allows updating edge endpoints', () => {
      const v1 = new Vertex(new Vector(0, 0))
      const v2 = new Vertex(new Vector(1, 1))
      const v3 = new Vertex(new Vector(2, 2))
      const edge = new Edge(v1, v2)

      edge.origin = v3
      expect(edge.origin).toBe(v3)
      expect(v3.nextEdge).toBe(edge)
    })
  })

  describe('geometric properties', () => {
    it('computes correct edge vector', () => {
      const v1 = new Vertex(new Vector(0, 0))
      const v2 = new Vertex(new Vector(3, 4))
      const edge = new Edge(v1, v2)

      const vec = edge.vector()
      expect(vec.x).toBe(3)
      expect(vec.y).toBe(4)
    })

    it('computes normalized direction vector', () => {
      const v1 = new Vertex(new Vector(0, 0))
      const v2 = new Vertex(new Vector(3, 4))
      const edge = new Edge(v1, v2)

      const dir = edge.direction()
      expect(dir.length()).toBeCloseTo(1, 10)
      expect(dir.x).toBeCloseTo(3 / 5, 10)
      expect(dir.y).toBeCloseTo(4 / 5, 10)
    })

    it('calculates correct length', () => {
      const v1 = new Vertex(new Vector(0, 0))
      const v2 = new Vertex(new Vector(3, 4))
      const edge = new Edge(v1, v2)

      // 3-4-5 right triangle => length should be 5
      expect(edge.length()).toBe(5)
    })

    it('computes correct normal vector (CCW orientation)', () => {
      const v1 = new Vertex(new Vector(0, 0))
      const v2 = new Vertex(new Vector(1, 0))
      const edge = new Edge(v1, v2)

      const normal = edge.normal()
      expect(normal.length()).toBeCloseTo(1, 10)
      // For a horizontal edge from (0,0) to (1,0), the CCW normal points up (0,1)
      expect(normal.x).toBeCloseTo(0, 10)
      expect(normal.y).toBeCloseTo(1, 10)
    })
  })

  describe('point calculations', () => {
    it('computes point at parameter value', () => {
      const v1 = new Vertex(new Vector(0, 0))
      const v2 = new Vertex(new Vector(2, 2))
      const edge = new Edge(v1, v2)

      const midpoint = edge.pointAt(0.5)
      expect(midpoint.x).toBe(1)
      expect(midpoint.y).toBe(1)
    })

    it('correctly determines point containment', () => {
      const v1 = new Vertex(new Vector(0, 0))
      const v2 = new Vertex(new Vector(2, 2))
      const edge = new Edge(v1, v2)

      const onEdge = new Vector(1, 1)
      const offEdge = new Vector(1, 0)
      expect(edge.containsPoint(onEdge)).toBeTruthy()
      expect(edge.containsPoint(offEdge)).toBeFalsy()
    })

    it('handles point containment with epsilon tolerance', () => {
      const v1 = new Vertex(new Vector(0, 0))
      const v2 = new Vertex(new Vector(1, 0))
      const edge = new Edge(v1, v2)

      // A point extremely close to the line from (0,0) to (1,0).
      // With small epsilon, it should count as "on" the line.
      const nearPoint = new Vector(0.5, 1e-11)
      expect(edge.containsPoint(nearPoint, 1e-10)).toBeTruthy()
    })
  })

  describe('intersection calculations', () => {
    it('detects intersection between crossing edges', () => {
      const v1 = new Vertex(new Vector(0, 0))
      const v2 = new Vertex(new Vector(2, 2))
      const edge1 = new Edge(v1, v2)

      const v3 = new Vertex(new Vector(0, 2))
      const v4 = new Vertex(new Vector(2, 0))
      const edge2 = new Edge(v3, v4)

      const intersection = edge1.intersect(edge2)
      expect(intersection).not.toBeNull()

      if (intersection) {
        expect(intersection.point.x).toBe(1)
        expect(intersection.point.y).toBe(1)
        expect(intersection.t1).toBe(0.5)
        expect(intersection.t2).toBe(0.5)
      }
    })

    it('returns null for parallel edges', () => {
      const v1 = new Vertex(new Vector(0, 0))
      const v2 = new Vertex(new Vector(1, 1))
      const edge1 = new Edge(v1, v2)

      const v3 = new Vertex(new Vector(0, 1))
      const v4 = new Vertex(new Vector(1, 2))
      const edge2 = new Edge(v3, v4)

      expect(edge1.intersect(edge2)).toBeNull()
    })

    it('returns null for non-intersecting edges', () => {
      const v1 = new Vertex(new Vector(0, 0))
      const v2 = new Vertex(new Vector(1, 1))
      const edge1 = new Edge(v1, v2)

      const v3 = new Vertex(new Vector(2, 0))
      const v4 = new Vertex(new Vector(3, 1))
      const edge2 = new Edge(v3, v4)

      expect(edge1.intersect(edge2)).toBeNull()
    })
  })

  describe('offset operations', () => {
    it('creates parallel offset edge', () => {
      const v1 = new Vertex(new Vector(0, 0))
      const v2 = new Vertex(new Vector(2, 0))
      const edge = new Edge(v1, v2)

      const distance = 1
      const offsetEdge = edge.offset(distance)

      // Compare midpoints to ensure offset distance is ~1
      const mid = edge.pointAt(0.5)
      const offsetMid = offsetEdge.pointAt(0.5)
      const actualDistance = offsetMid.subtract(mid).length()
      expect(actualDistance).toBeCloseTo(distance, 10)

      // Check parallel: dot(dir1, dir2) ~ ±1
      const dir1 = edge.direction()
      const dir2 = offsetEdge.direction()
      expect(Math.abs(dir1.dot(dir2))).toBeCloseTo(1, 10)
    })

    it('maintains edge length in offset', () => {
      const v1 = new Vertex(new Vector(0, 0))
      const v2 = new Vertex(new Vector(3, 4))
      const edge = new Edge(v1, v2)

      const offsetEdge = edge.offset(1)
      expect(edge.length()).toBeCloseTo(offsetEdge.length(), 10)
    })
  })

  describe('edge event detection', () => {
    it('handles parallel edges correctly', () => {
      const v1 = new Vertex(new Vector(0, 0))
      const v2 = new Vertex(new Vector(2, 0))
      const edge1 = new Edge(v1, v2)

      const v3 = new Vertex(new Vector(0, 1))
      const v4 = new Vertex(new Vector(2, 1))
      const edge2 = new Edge(v3, v4)

      expect(edge1.findEdgeEvent(edge2)).toBeNull()
    })
  })
})
