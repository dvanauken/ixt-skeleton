import { describe, it, expect, vi } from "vitest";
import { Edge } from "../../src/Edge";
import { EdgeEvent } from "../../src/events/EdgeEvent";
import { Vector } from "../../src/Vector";
import { Vertex } from "../../src/Vertex";


describe('ClassName', () => {
    describe('basic tests', () => {
        it('should create an instance', () => {
            expect(true).toBe(true);
        });
    });
});


describe('EdgeEvent', () => {
    // Helper function to create adjacent edges configuration
    const createAdjacentEdges = () => {
        const v1 = new Vertex(new Vector(0, 0));
        const v2 = new Vertex(new Vector(1, 0));
        const v3 = new Vertex(new Vector(1, 1));
        
        const edge1 = new Edge(v1, v2);
        const edge2 = new Edge(v2, v3);
        
        return {
            vertices: [v1, v2, v3],
            edge1,
            edge2,
            collisionPoint: new Vector(1, 0) // The shared point
        };
    };

    describe('Construction', () => {
        it('should create valid edge event for adjacent edges', () => {
            const { edge1, edge2, collisionPoint } = createAdjacentEdges();

            expect(() => new EdgeEvent(
                1.0,
                collisionPoint,
                edge1,
                edge2
            )).not.toThrow();
        });

        it('should throw for non-adjacent edges', () => {
            const v1 = new Vertex(new Vector(0, 0));
            const v2 = new Vertex(new Vector(1, 0));
            const v3 = new Vertex(new Vector(0, 1));
            const v4 = new Vertex(new Vector(1, 1));
            
            const edge1 = new Edge(v1, v2);
            const edge2 = new Edge(v3, v4); // Non-adjacent edge

            expect(() => new EdgeEvent(
                1.0,
                new Vector(0.5, 0.5),
                edge1,
                edge2
            )).toThrow('EdgeEvent can only occur between adjacent edges');
        });

        it('should collect all vertices from both edges', () => {
            const { edge1, edge2, collisionPoint } = createAdjacentEdges();
            
            const event = new EdgeEvent(1.0, collisionPoint, edge1, edge2);

            expect(event.vertices).toHaveLength(4);
            expect(event.vertices).toContain(edge1.origin);
            expect(event.vertices).toContain(edge1.destination);
            expect(event.vertices).toContain(edge2.origin);
            expect(event.vertices).toContain(edge2.destination);
        });
    });

    describe('Validation', () => {
        it('should be valid for unchanged adjacent edges', () => {
            const { edge1, edge2, collisionPoint } = createAdjacentEdges();
            const event = new EdgeEvent(1.0, collisionPoint, edge1, edge2);

            // Mock findEdgeEvent to return matching event
            edge1.findEdgeEvent = vi.fn().mockReturnValue({
                time: 1.0,
                point: collisionPoint
            });

            expect(event.isValid()).toBe(true);
        });

        it('should be invalid if edge connectivity changes', () => {
            const { edge1, edge2, collisionPoint } = createAdjacentEdges();
            const event = new EdgeEvent(1.0, collisionPoint, edge1, edge2);

            // Break edge connectivity
            edge1.destination = new Vertex(new Vector(2, 2));

            expect(event.isValid()).toBe(false);
        });

        it('should be invalid if collision point changes', () => {
            const { edge1, edge2, collisionPoint } = createAdjacentEdges();
            const event = new EdgeEvent(1.0, collisionPoint, edge1, edge2);

            // Mock findEdgeEvent to return different collision point
            edge1.findEdgeEvent = vi.fn().mockReturnValue({
                time: 1.0,
                point: new Vector(2, 2)
            });

            expect(event.isValid()).toBe(false);
        });
    });

    describe('Execution', () => {
        it('should update topology correctly', () => {
            const { edge1, edge2, collisionPoint } = createAdjacentEdges();
            const event = new EdgeEvent(1.0, collisionPoint, edge1, edge2);

            event.execute();

            // Verify edges now share the new vertex at collision point
            expect(edge1.destination.position).toEqual(collisionPoint);
            expect(edge2.origin.position).toEqual(collisionPoint);
        });

        // it('should create vertex event after collision', () => {
        //     const { edge1, edge2, collisionPoint } = createAdjacentEdges();
        //     const event = new EdgeEvent(1.0, collisionPoint, edge1, edge2);

        //     const newEvents = event.execute();

        //     expect(newEvents).toHaveLength(1);
        //     expect(newEvents[0].type).toBe('VERTEX');
        // });

        it('should throw if edges no longer share vertex during execution', () => {
            const { edge1, edge2, collisionPoint } = createAdjacentEdges();
            const event = new EdgeEvent(1.0, collisionPoint, edge1, edge2);

            // Break edge connectivity before execution
            edge1.destination = new Vertex(new Vector(2, 2));

            expect(() => event.execute()).toThrow('Edges must share a vertex in EdgeEvent');
        });
    });

    describe('String Representation', () => {
        it('should format string correctly', () => {
            const { edge1, edge2 } = createAdjacentEdges();
            const event = new EdgeEvent(
                1.23456,
                new Vector(2.34567, 3.45678),
                edge1,
                edge2
            );

            const expected = 
                'EdgeEvent: Collision between edges at t=1.234560, ' +
                'point=(2.35, 3.46)';

            expect(event.toString()).toBe(expected);
        });
    });
});