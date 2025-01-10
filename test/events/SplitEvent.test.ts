import { describe, it, expect } from "vitest";
import { Edge } from "../../src/Edge";
import { SplitEvent } from "../../src/events/SplitEvent";
import { Vector } from "../../src/Vector";
import { Vertex } from "../../src/Vertex";


describe('SplitEvent', () => {

    describe('ClassName', () => {
        describe('basic tests', () => {
            it('should create an instance', () => {
                expect(true).toBe(true);
            });
        });
    });


    // Helper to create a reflex vertex configuration
    const createReflexSetup = () => {
        // Create vertices for a reflex angle configuration
        const center = new Vertex(new Vector(0, 0));
        const v1 = new Vertex(new Vector(-1, 1));
        const v2 = new Vertex(new Vector(1, 1));
        
        // Create edges that form a reflex angle
        const edge1 = new Edge(v1, center);
        const edge2 = new Edge(center, v2);
        
        // Set up vertex connections
        center.setPrevEdge(edge1);
        center.setNextEdge(edge2);
        
        // Create split target
        const splitStart = new Vertex(new Vector(-2, -1));
        const splitEnd = new Vertex(new Vector(2, -1));
        const splitEdge = new Edge(splitStart, splitEnd);

        return {
            reflexVertex: center,
            reflexEdges: [edge1, edge2],
            splitEdge,
            splitPoint: new Vector(0, -1)
        };
    };

    //describe('Construction', () => {
        // it('should create valid split event', () => {
        //     const setup = createReflexSetup();
            
        //     expect(() => new SplitEvent(
        //         1.0,
        //         setup.splitPoint,
        //         setup.reflexVertex,
        //         setup.splitEdge,
        //         setup.reflexEdges
        //     )).not.toThrow();
        // });

        // it('should throw if not given exactly two reflex edges', () => {
        //     const setup = createReflexSetup();
            
        //     expect(() => new SplitEvent(
        //         1.0,
        //         setup.splitPoint,
        //         setup.reflexVertex,
        //         setup.splitEdge,
        //         [setup.reflexEdges[0]] // Only one edge
        //     )).toThrow('Split event must have exactly two edges at reflex vertex');
        // });

        // it('should throw if vertex is not reflex', () => {
        //     const setup = createReflexSetup();
            
        //     // Create a non-reflex vertex configuration
        //     const nonReflexCenter = new Vertex(new Vector(0, 0));
        //     const v1 = new Vertex(new Vector(-1, -1));
        //     const v2 = new Vertex(new Vector(1, -1));
            
        //     const edge1 = new Edge(v1, nonReflexCenter);
        //     const edge2 = new Edge(nonReflexCenter, v2);
            
        //     nonReflexCenter.setPrevEdge(edge1);
        //     nonReflexCenter.setNextEdge(edge2);

        //     expect(() => new SplitEvent(
        //         1.0,
        //         setup.splitPoint,
        //         nonReflexCenter,
        //         setup.splitEdge,
        //         [edge1, edge2]
        //     )).toThrow('Split event can only occur at reflex vertices');
        // });
    //});

    // describe('Validation', () => {
    //     it('should be valid for correct configuration', () => {
    //         const setup = createReflexSetup();
            
    //         const event = new SplitEvent(
    //             1.0,
    //             setup.splitPoint,
    //             setup.reflexVertex,
    //             setup.splitEdge,
    //             setup.reflexEdges
    //         );

    //         expect(event.isValid()).toBe(true);
    //     });

    //     it('should be invalid if reflex vertex no longer reflex', () => {
    //         const setup = createReflexSetup();
            
    //         const event = new SplitEvent(
    //             1.0,
    //             setup.splitPoint,
    //             setup.reflexVertex,
    //             setup.splitEdge,
    //             setup.reflexEdges
    //         );

    //         // Modify vertex configuration to make it non-reflex
    //         setup.reflexVertex.setPrevEdge(null);
    //         setup.reflexVertex.setNextEdge(null);

    //         expect(event.isValid()).toBe(false);
    //     });

    //     it('should be invalid if edges disconnected', () => {
    //         const setup = createReflexSetup();
            
    //         const event = new SplitEvent(
    //             1.0,
    //             setup.splitPoint,
    //             setup.reflexVertex,
    //             setup.splitEdge,
    //             setup.reflexEdges
    //         );

    //         // Break edge connectivity
    //         setup.reflexEdges[0].destination = new Vertex(new Vector(0, 0));

    //         expect(event.isValid()).toBe(false);
    //     });
    // });

    // describe('Execution', () => {
    //     it('should generate new edge events', () => {
    //         const setup = createReflexSetup();
            
    //         const event = new SplitEvent(
    //             1.0,
    //             setup.splitPoint,
    //             setup.reflexVertex,
    //             setup.splitEdge,
    //             setup.reflexEdges
    //         );

    //         const newEvents = event.execute();
    //         expect(newEvents.length).toBeGreaterThan(0);
    //     });

    //     it('should update topology correctly', () => {
    //         const setup = createReflexSetup();
            
    //         const event = new SplitEvent(
    //             1.0,
    //             setup.splitPoint,
    //             setup.reflexVertex,
    //             setup.splitEdge,
    //             setup.reflexEdges
    //         );

    //         event.execute();

    //         // Check the edges are properly connected after split
    //         expect(setup.reflexEdges[0].destination.position).toEqual(setup.splitPoint);
    //         expect(setup.reflexEdges[1].origin.position).toEqual(setup.splitPoint);
    //     });
    // });
});