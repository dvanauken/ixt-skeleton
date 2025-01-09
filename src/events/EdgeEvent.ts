import { Event, EventType } from './Event';
import { Vector } from '../Vector';
import { Vertex } from '../Vertex';
import { Edge } from '../Edge';
import { VertexEvent } from './VertexEvent';

export class EdgeEvent extends Event {
    constructor(
        time: number,
        point: Vector,
        public readonly edge1: Edge,
        public readonly edge2: Edge
    ) {
        // Collect vertices from both edges for the base class
        const vertices = [
            edge1.origin,
            edge1.destination,
            edge2.origin,
            edge2.destination
        ];
        super(time, point, EventType.EDGE, vertices);
        
        // Ensure edges are adjacent to avoid processing non-adjacent edge collisions
        if (!this.areEdgesAdjacent()) {
            throw new Error('EdgeEvent can only occur between adjacent edges');
        }
    }

    private areEdgesAdjacent(): boolean {
        return this.edge1.destination === this.edge2.origin ||
               this.edge1.origin === this.edge2.destination ||
               this.edge2.destination === this.edge1.origin ||
               this.edge2.origin === this.edge1.destination;
    }

    isValid(): boolean {
        // Check if the edges still exist and their endpoints 
        // haven't been modified by other events
        const edgesExist = this.edge1 && this.edge2;
        
        if (!edgesExist) return false;

        // Recalculate collision point and time
        const newEvent = this.edge1.findEdgeEvent(this.edge2);
        if (!newEvent) return false;

        // Check if the event occurs at approximately the same time and location
        const timeEpsilon = 1e-10;
        const positionEpsilon = 1e-8;

        return Math.abs(newEvent.time - this.time) < timeEpsilon &&
               newEvent.point.subtract(this.point).length() < positionEpsilon;
    }

    execute(): Event[] {
        // Create a new vertex at the collision point
        const newVertex = new Vertex(this.point);

        // Find the shared vertex between the edges (if they're adjacent)
        let sharedVertex: Vertex | null = null;
        if (this.edge1.destination === this.edge2.origin) {
            sharedVertex = this.edge1.destination;
        } else if (this.edge1.origin === this.edge2.destination) {
            sharedVertex = this.edge1.origin;
        }

        if (!sharedVertex) {
            throw new Error('Edges must share a vertex in EdgeEvent');
        }

        // Update topology
        // The shared vertex is replaced by the new collision vertex
        if (this.edge1.destination === sharedVertex) {
            this.edge1.destination = newVertex;
        } else {
            this.edge1.origin = newVertex;
        }

        if (this.edge2.origin === sharedVertex) {
            this.edge2.origin = newVertex;
        } else {
            this.edge2.destination = newVertex;
        }

        // Calculate new events
        const newEvents: Event[] = [];

        // Check for potential vertex events at the new vertex
        const vertexEvent = new VertexEvent(
            this.time,
            this.point,
            newVertex,
            [this.edge1, this.edge2]
        );

        if (vertexEvent.isValid()) {
            newEvents.push(vertexEvent);
        }

        // Note: Additional events (like new edge events) will be detected
        // by the main algorithm's event finding logic after this event
        // is processed

        return newEvents;
    }

    toString(): string {
        return `EdgeEvent: Collision between edges at t=${this.time.toFixed(6)}, ` +
               `point=(${this.point.x.toFixed(2)}, ${this.point.y.toFixed(2)})`;
    }
}