import { describe, it, expect } from "vitest";

import { Wavefront } from '../src/Wavefront';
import { Vector } from '../src/Vector';
import { Vertex } from '../src/Vertex';
import { Polygon } from '../src/Polygon';

describe('Wavefront', () => {
    // Helper function to create our test polygon
    const createTestPolygon = () => {
        const vertices = [
            new Vertex(new Vector(0, 70)),   // A
            new Vertex(new Vector(0, 30)),   // B
            new Vertex(new Vector(40, 30)),  // C
            new Vertex(new Vector(40, 0)),   // D
            new Vertex(new Vector(100, 0)),  // E
            new Vertex(new Vector(100, 70))  // F
        ];
        return new Polygon(vertices);
    };

    describe('initialization', () => {
        it('should create initial wavefront from polygon', () => {
            const polygon = createTestPolygon();
            const wavefront = new Wavefront(polygon);
            
            expect(wavefront.vertices.length).toBe(6);
            expect(wavefront.edges.length).toBe(6);
        });

        // it('should calculate correct initial vertex velocities', () => {
        //     const polygon = createTestPolygon();
        //     const wavefront = new Wavefront(polygon);
            
        //     // Test vertex A's velocity (should move towards (20,50))
        //     const vertexA = wavefront.vertices[0];
        //     const velocityA = vertexA.velocity;
        //     const expectedDirA = new Vector(20, -20).normalize();
        //     expect(velocityA.x).toBeCloseTo(expectedDirA.x, 5);
        //     expect(velocityA.y).toBeCloseTo(expectedDirA.y, 5);
        // });

        it('should identify reflex vertex correctly', () => {
            const polygon = createTestPolygon();
            const wavefront = new Wavefront(polygon);
            
            // Vertex C should be reflex
            const vertexC = wavefront.vertices[2];
            expect(vertexC.isReflex()).toBe(true);
        });
    });

    describe('propagation', () => {
        // it('should compute correct vertex positions after time step', () => {
        //     const polygon = createTestPolygon();
        //     const wavefront = new Wavefront(polygon);
        //     const timeStep = 1.0;
            
        //     wavefront.propagate(timeStep);
            
        //     // Check position of vertex A after movement
        //     const vertexA = wavefront.vertices[0];
        //     const expectedPosA = new Vector(20, 50);
        //     expect(vertexA.position.x).toBeCloseTo(expectedPosA.x, 5);
        //     expect(vertexA.position.y).toBeCloseTo(expectedPosA.y, 5);
        // });

        it('should maintain edge connectivity during propagation', () => {
            const polygon = createTestPolygon();
            const wavefront = new Wavefront(polygon);
            const timeStep = 1.0;
            
            wavefront.propagate(timeStep);
            
            // Check that edges remain properly connected
            wavefront.edges.forEach((edge, i) => {
                const nextEdge = wavefront.edges[(i + 1) % wavefront.edges.length];
                expect(edge.destination).toBe(nextEdge.origin);
            });
        });
    });
});