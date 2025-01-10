import { describe, it, expect, vi } from "vitest";
import { Edge } from "../../src/Edge";
import { Vector } from "../../src/Vector";
import { Vertex } from "../../src/Vertex";
import { CollapseEvent } from "../../src/events/CollapseEvent";

describe('CollapseEvent', () => {
    // Helper function to create a simple chain of edges
    const createEdgeChain = () => {
        const v1 = new Vertex(new Vector(0, 0));
        const v2 = new Vertex(new Vector(1, 0));
        const v3 = new Vertex(new Vector(2, 0));
        
        // Create edges with proper connectivity
        const edge1 = new Edge(v1, v2);
        const edge2 = new Edge(v2, v3);
        
        // Manually set up edge connections for vertices
        v1.setNextEdge(edge1);
        v2.setPrevEdge(edge1);
        v2.setNextEdge(edge2);
        v3.setPrevEdge(edge2);
        
        return { vertices: [v1, v2, v3], edges: [edge1, edge2], collapsePoint: new Vector(1, 0) };
    };

    describe('Construction', () => {
        it('should create valid collapse event for connected chain', () => {
            const { edges, vertices, collapsePoint } = createEdgeChain();
            const terminalVertices = [vertices[0], vertices[2]];
            expect(() => new CollapseEvent(
                1.0,
                collapsePoint,
                edges,
                terminalVertices
            )).not.toThrow();
        });

        it('should throw for empty edge chain', () => {
            const { vertices, collapsePoint } = createEdgeChain();
            const terminalVertices = [vertices[0], vertices[2]];
            expect(() => new CollapseEvent(
                1.0,
                collapsePoint,
                [], // Empty chain
                terminalVertices
            )).toThrow('Collapse event must involve at least one edge');
        });

        it('should throw for incorrect number of terminal vertices', () => {
            const { edges, vertices, collapsePoint } = createEdgeChain();
            expect(() => new CollapseEvent(
                1.0,
                collapsePoint,
                edges,
                [vertices[0]] // Only one terminal vertex
            )).toThrow('Collapse event must have exactly two terminal vertices');
        });

        it('should throw for disconnected edge chain', () => {
            const v1 = new Vertex(new Vector(0, 0));
            const v2 = new Vertex(new Vector(1, 0));
            const v3 = new Vertex(new Vector(3, 0)); // Gap between v2 and v3
            const v4 = new Vertex(new Vector(4, 0));
            const edge1 = new Edge(v1, v2);
            const edge2 = new Edge(v3, v4); // Not connected to edge1
            expect(() => new CollapseEvent(
                1.0,
                new Vector(2, 0),
                [edge1, edge2],
                [v1, v4]
            )).toThrow('Collapsing edges must form a connected chain');
        });

        it('should throw if terminal vertices are not at chain ends', () => {
            const { edges, vertices, collapsePoint } = createEdgeChain();
            const invalidTerminals = [vertices[0], vertices[1]]; // v1 and v2 instead of v1 and v3
            expect(() => new CollapseEvent(
                1.0,
                collapsePoint,
                edges,
                invalidTerminals
            )).toThrow('Terminal vertices must be at the ends of the chain');
        });
    });

    describe('Validation', () => {
        it('should be valid when chain remains connected and vertices will meet', () => {
            const { edges, vertices, collapsePoint } = createEdgeChain();
            const terminalVertices = [vertices[0], vertices[2]];
            
            // Mock computePositionAtTime to return collapse point
            vertices[0].computePositionAtTime = vi.fn().mockReturnValue(collapsePoint);
            vertices[2].computePositionAtTime = vi.fn().mockReturnValue(collapsePoint);

            const event = new CollapseEvent(1.0, collapsePoint, edges, terminalVertices);
            expect(event.isValid()).toBe(true);
        });

        it('should be invalid if terminal vertices won\'t meet at collapse point', () => {
            const { edges, vertices, collapsePoint } = createEdgeChain();
            const terminalVertices = [vertices[0], vertices[2]];
            
            // Mock vertices to collapse to different points
            vertices[0].computePositionAtTime = vi.fn().mockReturnValue(new Vector(0, 0));
            vertices[2].computePositionAtTime = vi.fn().mockReturnValue(new Vector(1, 1));

            const event = new CollapseEvent(1.0, collapsePoint, edges, terminalVertices);
            expect(event.isValid()).toBe(false);
        });

        it('should be invalid if chain connectivity is broken', () => {
            const { edges, vertices, collapsePoint } = createEdgeChain();
            const terminalVertices = [vertices[0], vertices[2]];

            const event = new CollapseEvent(1.0, collapsePoint, edges, terminalVertices);

            // Break chain connectivity
            edges[0].destination = new Vertex(new Vector(5, 5));
            expect(event.isValid()).toBe(false);
        });
    });

    describe('Execution', () => {
        it('should update connected edges to new collapse vertex', () => {
            const { edges, vertices, collapsePoint } = createEdgeChain();
            const terminalVertices = [vertices[0], vertices[2]];

            // Add extra edges connected to terminal vertices
            const extraV1 = new Vertex(new Vector(-1, 0));
            const extraV2 = new Vertex(new Vector(3, 0));
            const extraEdge1 = new Edge(extraV1, vertices[0]);
            const extraEdge2 = new Edge(vertices[2], extraV2);

            vertices[0].setPrevEdge(extraEdge1);
            vertices[2].setNextEdge(extraEdge2);

            const event = new CollapseEvent(1.0, collapsePoint, edges, terminalVertices);
            event.execute();

            // Check that extra edges now connect to collapse point
            expect(extraEdge1.destination.position).toEqual(collapsePoint);
            expect(extraEdge2.origin.position).toEqual(collapsePoint);
        });

        it('should not generate new events', () => {
            // Create vertices with positions
            const v1 = new Vertex(new Vector(0, 0));
            const v2 = new Vertex(new Vector(1, 0));
            const v3 = new Vertex(new Vector(2, 0));
            
            // Create edges
            const edge1 = new Edge(v1, v2);
            const edge2 = new Edge(v2, v3);
            
            // Set up all edge connections explicitly
            v1.setNextEdge(edge1);
            v2.setPrevEdge(edge1);
            v2.setNextEdge(edge2);
            v3.setPrevEdge(edge2);
            
            // Create additional edges to ensure complete connectivity
            const extraV1 = new Vertex(new Vector(-1, 0));
            const extraV2 = new Vertex(new Vector(3, 0));
            const extraEdge1 = new Edge(extraV1, v1);
            const extraEdge2 = new Edge(v3, extraV2);
            
            // Connect extra edges
            extraV1.setNextEdge(extraEdge1);
            v1.setPrevEdge(extraEdge1);
            v3.setNextEdge(extraEdge2);
            extraV2.setPrevEdge(extraEdge2);

            const event = new CollapseEvent(1.0, new Vector(1, 0), [edge1, edge2], [v1, v3]);
            const newEvents = event.execute();
            expect(newEvents).toHaveLength(0);
        });
    });

    describe('String Representation', () => {
        it('should include chain length and collapse point', () => {
            const { edges, vertices } = createEdgeChain();
            const terminalVertices = [vertices[0], vertices[2]];

            const event = new CollapseEvent(
                1.23456,
                new Vector(2.34567, 3.45678),
                edges,
                terminalVertices
            );

            const expected = 'CollapseEvent: 2 edges collapse at t=1.234560, point=(2.35, 3.46)';
            expect(event.toString()).toBe(expected);
        });
    });
});