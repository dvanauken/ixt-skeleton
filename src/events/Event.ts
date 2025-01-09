import { Vector } from '../Vector';
import { Vertex } from '../Vertex';

export enum EventType {
    EDGE = 'EDGE',
    VERTEX = 'VERTEX',
    SPLIT = 'SPLIT',
    COLLAPSE = 'COLLAPSE'
}

export abstract class Event {
    constructor(
        // The time at which this event occurs
        public readonly time: number,
        // The location where this event occurs
        public readonly point: Vector,
        // The type of event (for type checking and handling)
        public readonly type: EventType,
        // Vertices involved in this event
        public readonly vertices: Vertex[]
    ) {
        if (time < 0) {
            throw new Error('Event time cannot be negative');
        }
    }

    /**
     * Compare events based on time for priority queue ordering.
     * If times match, we return 0 (or use a custom tie-breaker).
     */
    compareTo(other: Event): number {
        // Primary sort: event time
        if (this.time !== other.time) {
            return this.time - other.time
        }

        // Secondary sort: no longer rely on vertex.index. 
        // Just return 0, or implement your own tie-breaker logic.
        return 0
    }

    // Check if event is still valid
    // Each event type will implement its own validation logic
    abstract isValid(): boolean;

    // Execute the event
    // Each event type will implement its own execution logic
    // Returns any new events that are generated as a result
    abstract execute(): Event[];

    // String representation for debugging
    toString(): string {
        const vertexPositions = this.vertices
          .map((v) => `(${v.position.x.toFixed(2)}, ${v.position.y.toFixed(2)})`)
          .join(', ')
        return `${this.type} Event at t=${this.time.toFixed(6)}, ` +
               `point=(${this.point.x.toFixed(2)}, ${this.point.y.toFixed(2)}), ` +
               `vertices=[${vertexPositions}]`
      }
}