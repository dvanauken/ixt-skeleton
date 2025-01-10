import { Event, EventType } from './Event';
import { Vector } from '../Vector';
import { Vertex } from '../Vertex';
import { Edge } from '../Edge';
import { EdgeEvent } from './EdgeEvent';

export class SplitEvent extends Event {
    constructor(
        time: number,
        point: Vector,
        public readonly reflexVertex: Vertex, // The reflex vertex causing the split
        public readonly splitEdge: Edge,      // The edge being split
        public readonly reflexEdges: Edge[]   // The edges incident to the reflex vertex
    ) {
        // Include all affected vertices in the base class
        const vertices = [
            reflexVertex,
            splitEdge.origin,
            splitEdge.destination
        ];
        super(time, point, EventType.SPLIT, vertices);

        if (reflexEdges.length !== 2) {
            throw new Error('Split event must have exactly two edges at reflex vertex');
        }

        // Verify the vertex is actually reflex
        if (!reflexVertex.isReflex()) {
            throw new Error('Split event can only occur at reflex vertices');
        }
    }

    isValid(): boolean {
        // Check if all components still exist
        if (!this.reflexVertex || !this.splitEdge || 
            !this.reflexEdges[0] || !this.reflexEdges[1]) {
            return false;
        }

        // Verify the reflex vertex is still reflex
        if (!this.reflexVertex.isReflex()) {
            return false;
        }

        // Verify edges are still connected to the reflex vertex
        const isConnected = this.reflexEdges.every(edge => 
            edge.origin === this.reflexVertex || 
            edge.destination === this.reflexVertex
        );

        if (!isConnected) {
            return false;
        }

        // Recalculate the split point
        const currentPosition = this.reflexVertex.computePositionAtTime(this.time);
        const epsilon = 1e-8;

        // Verify the split point is still valid
        return currentPosition.subtract(this.point).length() < epsilon &&
               this.splitEdge.containsPoint(this.point, epsilon);
    }

    execute(): Event[] {
        const newEvents: Event[] = [];

        // Create new vertex at split point
        const splitVertex = new Vertex(this.point);

        // Create two new edges where the split edge was
        const leftEdge = new Edge(this.splitEdge.origin, splitVertex);
        const rightEdge = new Edge(splitVertex, this.splitEdge.destination);

        // Update topology around reflex vertex
        let [incomingEdge, outgoingEdge] = this.reflexEdges;
        if (incomingEdge.destination !== this.reflexVertex) {
            [incomingEdge, outgoingEdge] = [outgoingEdge, incomingEdge];
        }

        // Connect reflex vertex to split point
        incomingEdge.destination = splitVertex;
        outgoingEdge.origin = splitVertex;

        // Check for potential new edge events
        this.checkNewEdgeEvents(
            leftEdge,
            rightEdge,
            incomingEdge,
            outgoingEdge,
            this.time,
            newEvents
        );

        return newEvents;
    }

    private checkNewEdgeEvents(
        leftEdge: Edge,
        rightEdge: Edge,
        incomingEdge: Edge,
        outgoingEdge: Edge,
        currentTime: number,
        events: Event[]
    ): void {
        // Check pairs of adjacent edges for potential collisions
        const edgePairs = [
            [leftEdge, incomingEdge],
            [outgoingEdge, rightEdge]
        ];

        for (const [edge1, edge2] of edgePairs) {
            const collision = edge1.findEdgeEvent(edge2);
        //     if (collision && collision.time > currentTime) {
        //         events.push(new EdgeEvent(
        //             collision.time,
        //             collision.point,
        //             edge1,
        //             edge2
        //         ));
        //     }
        }
    }


    toString(): string {
        return `SplitEvent: Reflex vertex ${this.reflexVertex} ` +
               `splits edge at t=${this.time.toFixed(6)}, ` +
               `point=(${this.point.x.toFixed(2)}, ${this.point.y.toFixed(2)})`;
    }
}