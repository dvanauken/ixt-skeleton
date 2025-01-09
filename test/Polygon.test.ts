// Polygon.test.ts

import { describe, it, expect } from 'vitest'
import { Polygon } from '../src/Polygon'
import { Vector } from '../src/Vector'
import { Vertex } from '../src/Vertex'
import { Edge } from '../src/Edge'

describe('Polygon', () => {
  describe('constructor', () => {
    it('throws error if initialized with fewer than 3 points', () => {
      // Attempt to create a polygon with 2 points
      const points = [new Vector(0, 0), new Vector(1, 1)]
      expect(() => new Polygon(points)).toThrow('Polygon must have at least 3 points')
    })

    it('creates vertices and edges cycle for valid input', () => {
      const points = [new Vector(0, 0), new Vector(1, 0), new Vector(0, 1)]
      const polygon = new Polygon(points)

      // Check number of vertices
      expect(polygon.getVertices().length).toBe(3)

      // Check number of edges
      expect(polygon.getEdges().length).toBe(3)

      // Ensure edges are cyclic
      const edges = polygon.getEdges()
      for (let i = 0; i < edges.length; i++) {
        const e = edges[i]
        const v1 = polygon.getVertices()[i]
        const v2 = polygon.getVertices()[(i + 1) % edges.length]
        expect(e.origin).toBe(v1)
        expect(e.destination).toBe(v2)
      }
    })
  })

  describe('isClockwise / area', () => {
    it('correctly identifies clockwise vs counterclockwise and computes area', () => {
      // A simple square in CCW order
      const squareCCW = [
        new Vector(0, 0),
        new Vector(0, 2),
        new Vector(2, 2),
        new Vector(2, 0)
      ]
      const polyCCW = new Polygon(squareCCW)
      expect(polyCCW.isClockwise()).toBe(false)
      expect(polyCCW.area()).toBeCloseTo(4, 1) // 2x2 square => area=4

      // A simple square in CW order
      const squareCW = [
        new Vector(0, 0),
        new Vector(2, 0),
        new Vector(2, 2),
        new Vector(0, 2)
      ]
      const polyCW = new Polygon(squareCW)
      expect(polyCW.isClockwise()).toBe(true)
      expect(polyCW.area()).toBeCloseTo(4, 1)
    })
  })

  describe('makeCounterClockwise', () => {
    it('reverses vertices if polygon is clockwise', () => {
      const squareCW = [
        new Vector(0, 0),
        new Vector(2, 0),
        new Vector(2, 2),
        new Vector(0, 2)
      ]
      const polyCW = new Polygon(squareCW)

      expect(polyCW.isClockwise()).toBe(true)
      polyCW.makeCounterClockwise()
      expect(polyCW.isClockwise()).toBe(false)
      expect(polyCW.area()).toBeCloseTo(4, 1)
    })

    it('does nothing if already CCW', () => {
      const squareCCW = [
        new Vector(0, 0),
        new Vector(0, 2),
        new Vector(2, 2),
        new Vector(2, 0)
      ]
      const polyCCW = new Polygon(squareCCW)

      expect(polyCCW.isClockwise()).toBe(false)
      const oldVertices = polyCCW.getVertices().slice()
      polyCCW.makeCounterClockwise()
      const newVertices = polyCCW.getVertices()

      // Vertices shouldn't have reversed if already CCW
      expect(oldVertices).toEqual(newVertices)
    })
  })

  describe('containsPoint', () => {
    it('returns true for point inside polygon', () => {
      const triangle = [
        new Vector(0, 0),
        new Vector(2, 0),
        new Vector(1, 2)
      ]
      const poly = new Polygon(triangle)

      const insidePoint = new Vector(1, 1)
      expect(poly.containsPoint(insidePoint)).toBe(true)
    })

    it('returns false for point outside polygon', () => {
      const triangle = [
        new Vector(0, 0),
        new Vector(2, 0),
        new Vector(1, 2)
      ]
      const poly = new Polygon(triangle)

      const outsidePoint = new Vector(3, 3)
      expect(poly.containsPoint(outsidePoint)).toBe(false)
    })

    it('returns true for point on the edge of the polygon', () => {
      const square = [
        new Vector(0, 0),
        new Vector(0, 1),
        new Vector(1, 1),
        new Vector(1, 0)
      ]
      const poly = new Polygon(square)

      // Point exactly on the edge from (0,0) -> (0,1)
      const onEdge = new Vector(0, 0.5)
      expect(poly.containsPoint(onEdge)).toBe(true)
    })
  })

  describe('findClosestEdge', () => {
    it('finds the edge closest to a given point', () => {
      const square = [
        new Vector(0, 0),
        new Vector(0, 2),
        new Vector(2, 2),
        new Vector(2, 0)
      ]
      const poly = new Polygon(square)

      // A point near the top edge
      const testPoint = new Vector(1.5, 1.8)
      const { edge, distance } = poly.findClosestEdge(testPoint)

      // The top edge runs from (0,2) to (2,2)
      const topEdge = poly.getEdges()[1] // index 1 => (0,2)->(2,2)
      expect(edge).toBe(topEdge)
      expect(distance).toBeCloseTo(0.2, 1)
    })
  })

  describe('isSimple', () => {
    it('returns true for a simple polygon (no self-intersections)', () => {
      const simpleQuad = [
        new Vector(0, 0),
        new Vector(0, 1),
        new Vector(1, 1),
        new Vector(1, 0)
      ]
      const poly = new Polygon(simpleQuad)
      expect(poly.isSimple()).toBe(true)
    })

    it('returns false for a self-intersecting polygon', () => {
      // A "bowtie" or hourglass shape that intersects itself
      const bowtie = [
        new Vector(0, 0),
        new Vector(2, 2),
        new Vector(2, 0),
        new Vector(0, 2)
      ]
      const poly = new Polygon(bowtie)
      expect(poly.isSimple()).toBe(false)
    })
  })

  describe('validate', () => {
    it('returns false if polygon is not simple', () => {
      const bowtie = [
        new Vector(0, 0),
        new Vector(2, 2),
        new Vector(2, 0),
        new Vector(0, 2)
      ]
      const poly = new Polygon(bowtie)
      // It's self-intersecting => not simple => fails validation
      expect(poly.validate()).toBe(false)
    })

    it('returns false if polygon is clockwise', () => {
      const squareCW = [
        new Vector(0, 0),
        new Vector(2, 0),
        new Vector(2, 2),
        new Vector(0, 2)
      ]
      const polyCW = new Polygon(squareCW)
      // isClockwise => fails validation
      expect(polyCW.validate()).toBe(false)
    })

    it('returns false if area is zero (collinear points)', () => {
      // All points on a line => area=0 => fails validation
      const linePoints = [
        new Vector(0, 0),
        new Vector(1, 1),
        new Vector(2, 2)
      ]
      const poly = new Polygon(linePoints)
      expect(poly.validate()).toBe(false)
    })

    it('returns true for a valid, simple, CCW polygon with area > 0', () => {
      const squareCCW = [
        new Vector(0, 0),
        new Vector(0, 2),
        new Vector(2, 2),
        new Vector(2, 0)
      ]
      const polyCCW = new Polygon(squareCCW)
      expect(polyCCW.validate()).toBe(true)
    })
  })
})
