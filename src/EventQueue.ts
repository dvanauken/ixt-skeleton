import { Event } from './events/Event';
import { EdgeEvent } from './events/EdgeEvent';
import { VertexEvent } from './events/VertexEvent';
import { SplitEvent } from './events/SplitEvent';
import { CollapseEvent } from './events/CollapseEvent';
import { Edge } from './Edge';
import { Vertex } from './Vertex';
import { Vector } from './Vector';

export class EventQueue {
    private events: Event[] = [];

    constructor() {}

    // Add a new event to the queue
    add(event: Event): void {
        // Insert event maintaining time order
        const index = this.findInsertionPoint(event);
        this.events.splice(index, 0, event);
    }

    // Find the correct insertion point using binary search
    private findInsertionPoint(event: Event): number {
        let left = 0;
        let right = this.events.length;

        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            if (this.events[mid].compareTo(event) <= 0) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }

        return left;
    }

    // Get and remove the next event
    poll(): Event | null {
        // Remove invalid events from the front of the queue
        while (this.events.length > 0 && !this.events[0].isValid()) {
            this.events.shift();
        }

        return this.events.length > 0 ? this.events.shift()! : null;
    }

    // Peek at the next valid event without removing it
    peek(): Event | null {
        // Skip invalid events
        while (this.events.length > 0 && !this.events[0].isValid()) {
            this.events.shift();
        }

        return this.events.length > 0 ? this.events[0] : null;
    }

    // Initialize queue with vertex events for a polygon
    initializeWithVertices(vertices: Vertex[]): void {
        for (const vertex of vertices) {
            const bisector = vertex.calculateBisector();
            const edges = [vertex.prevEdge, vertex.nextEdge];
            
            const time = vertex.calculateSpeed(); // Initial time based on vertex speed
            const point = vertex.computePositionAtTime(time);

            const vertexEvent = new VertexEvent(time, point, vertex, edges);
            if (vertexEvent.isValid()) {
                this.add(vertexEvent);
            }
        }
    }

    // Find and add all potential edge events between pairs of edges
    findEdgeEvents(edges: Edge[]): void {
        for (let i = 0; i < edges.length; i++) {
            for (let j = i + 1; j < edges.length; j++) {
                const edge1 = edges[i];
                const edge2 = edges[j];

                // Only consider adjacent edges
                if (this.areEdgesAdjacent(edge1, edge2)) {
                    const collision = edge1.findEdgeEvent(edge2);
                    if (collision) {
                        const edgeEvent = new EdgeEvent(
                            collision.time,
                            collision.point,
                            edge1,
                            edge2
                        );
                        if (edgeEvent.isValid()) {
                            this.add(edgeEvent);
                        }
                    }
                }
            }
        }
    }

    // Find and add potential split events for reflex vertices
    findSplitEvents(vertices: Vertex[], edges: Edge[]): void {
        for (const vertex of vertices) {
            if (vertex.isReflex()) {
                const splitTime = vertex.calculatePotentialSplit(edges);
                if (splitTime !== null) {
                    const point = vertex.computePositionAtTime(splitTime);
                    const reflexEdges = [vertex.prevEdge, vertex.nextEdge];
                    
                    // Find the edge that will be split
                    // This is a simplified version - actual implementation would need
                    // to determine which edge is being split
                    const splitEdge = this.findSplitEdge(vertex, point, edges);
                    
                    if (splitEdge) {
                        const splitEvent = new SplitEvent(
                            splitTime,
                            point,
                            vertex,
                            splitEdge,
                            reflexEdges
                        );
                        if (splitEvent.isValid()) {
                            this.add(splitEvent);
                        }
                    }
                }
            }
        }
    }

    private areEdgesAdjacent(edge1: Edge, edge2: Edge): boolean {
        return edge1.destination === edge2.origin ||
               edge1.origin === edge2.destination ||
               edge2.destination === edge1.origin ||
               edge2.origin === edge1.destination;
    }

    private findSplitEdge(vertex: Vertex, point: Vector, edges: Edge[]): Edge | null {
        // Find the edge that contains the split point
        // and is not adjacent to the vertex
        for (const edge of edges) {
            if (edge !== vertex.prevEdge && 
                edge !== vertex.nextEdge &&
                edge.containsPoint(point)) {
                return edge;
            }
        }
        return null;
    }

    // Check if queue is empty
    isEmpty(): boolean {
        return this.events.length === 0;
    }

    // Get number of events in queue
    size(): number {
        return this.events.length;
    }

    // Clear all events
    clear(): void {
        this.events = [];
    }
}