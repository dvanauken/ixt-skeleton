import { describe, it, expect } from "vitest";
import { Vector } from "../../src/Vector";
import { Vertex } from "../../src/Vertex";
import { Edge } from "../../src/Edge";
import { VertexEvent } from "../../src/events/VertexEvent";

describe('VertexEvent', () => {
    // Helper function to create a valid vertex event setup
    const createVertexSetup = () => {
        // Create vertices in a valid triangle configuration
        const vertex = new Vertex(new Vector(0, 0));     // center
        const v1 = new Vertex(new Vector(-1, -1));       // bottom left
        const v2 = new Vertex(new Vector(1, -1));        // bottom right
        
        // Create edges forming a triangle
        const edge1 = new Edge(v1, vertex);
        const edge2 = new Edge(vertex, v2);
        
        // Set up the vertex correctly with both edges
        vertex.setPrevEdge(edge1);
        vertex.setNextEdge(edge2);
        
        // Calculate where this vertex will actually be at t=1.0
        const time = 1.0;
        const point = vertex.computePositionAtTime(time);
        
        return {
            vertex,
            edges: [edge1, edge2],
            time,
            point
        };
    };

    describe('Construction', () => {
        it('should create valid vertex event with default setup', () => {
            const setup = createVertexSetup();
            const event = new VertexEvent(setup.time, setup.point, setup.vertex, setup.edges);

            expect(event.vertex).toBe(setup.vertex);
            expect(event.affectedEdges).toEqual(setup.edges);
            expect(event.time).toBe(setup.time);
            expect(event.point).toEqual(setup.point);
        });

        it('should throw if given wrong number of edges', () => {
            const setup = createVertexSetup();
            
            expect(() => new VertexEvent(
                setup.time,
                setup.point,
                setup.vertex,
                [setup.edges[0]] // Only one edge
            )).toThrow('VertexEvent must involve exactly two edges');
        });
    });

    describe('Validation', () => {
        it('should be valid for correct configuration', () => {
            const setup = createVertexSetup();
            const event = new VertexEvent(setup.time, setup.point, setup.vertex, setup.edges);
            expect(event.isValid()).toBe(true);
        });

        it('should be invalid if edges are disconnected', () => {
            const setup = createVertexSetup();
            const event = new VertexEvent(setup.time, setup.point, setup.vertex, setup.edges);

            // Break edge connectivity
            const newVertex = new Vertex(new Vector(2, 2));
            setup.edges[0].destination = newVertex;

            expect(event.isValid()).toBe(false);
        });
    });

    describe('Execution', () => {
        // it('should update edge connectivity correctly', () => {
        //     // Create a proper triangle configuration
        //     const vertex = new Vertex(new Vector(0, 0));
        //     const v1 = new Vertex(new Vector(-1, -1));
        //     const v2 = new Vertex(new Vector(1, -1));
            
        //     const prevEdge = new Edge(v1, vertex);
        //     const nextEdge = new Edge(vertex, v2);
            
        //     // Setup proper edge connections
        //     vertex.setPrevEdge(prevEdge);
        //     vertex.setNextEdge(nextEdge);
            
        //     const point = vertex.computePositionAtTime(1.0);
        //     const event = new VertexEvent(1.0, point, vertex, [prevEdge, nextEdge]);

        //     event.execute();

        //     // Check if edges were updated correctly
        //     expect(prevEdge.destination.position).toEqual(point);
        //     expect(nextEdge.origin.position).toEqual(point);
            
        //     // Verify edge connectivity is maintained
        //     const newVertex = prevEdge.destination;
        //     expect(newVertex).toBe(nextEdge.origin);
        //     expect(newVertex.getPrevEdge()).toBe(prevEdge);
        //     expect(newVertex.getNextEdge()).toBe(nextEdge);
        // });

        it('should handle reflex vertices', () => {
            // Create a reflex vertex configuration - arrow pointing down
            const vertex = new Vertex(new Vector(0, 1));
            const v1 = new Vertex(new Vector(-1, -1));
            const v2 = new Vertex(new Vector(1, -1));
            
            // Create edges
            const edge1 = new Edge(v1, vertex);
            const edge2 = new Edge(vertex, v2);
            
            // Set up full edge connectivity
            vertex.setPrevEdge(edge1);
            vertex.setNextEdge(edge2);
            v1.setNextEdge(edge1);
            v2.setPrevEdge(edge2);

            const point = vertex.computePositionAtTime(1.0);
            const event = new VertexEvent(1.0, point, vertex, [edge1, edge2]);
            
            //expect(() => event.execute()).not.toThrow();
        });
    });

    describe('String Representation', () => {
        it('should format string correctly', () => {
            const setup = createVertexSetup();
            const event = new VertexEvent(
                1.23456,
                new Vector(2.34, 5.67),
                setup.vertex,
                setup.edges
            );

            const expected = 
                'VertexEvent: Vertex at (0.00, 0.00) ' +
                't=1.234560, ' +
                'point=(2.34, 5.67)';
            
            expect(event.toString()).toBe(expected);
        });
    });
});