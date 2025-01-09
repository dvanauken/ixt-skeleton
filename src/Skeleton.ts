import { Polygon } from './Polygon';
import { Vector } from './Vector';
import { EventQueue } from './EventQueue';
import { Wavefront } from './Wavefront';
import { Event } from './events/Event';
import { Edge } from './Edge';
import { Vertex } from './Vertex';

interface Ridge {
    start: Vector;
    end: Vector;
    time: number;
}

interface SkeletonResult {
    ridges: Ridge[];
    events: Event[];
}

export class Skeleton {
    private eventQueue: EventQueue;
    private wavefront: Wavefront;
    private ridges: Ridge[] = [];
    private processedEvents: Event[] = [];

    constructor() {
        this.eventQueue = new EventQueue();
        this.wavefront = null!; // Initialized in fromPolygon
    }

    // Main entry point for skeleton computation
    static fromPolygon(polygon: Polygon): SkeletonResult {
        if (!polygon.validate()) {
            throw new Error('Invalid polygon for straight skeleton computation');
        }

        const skeleton = new Skeleton();
        return skeleton.compute(polygon);
    }

    private compute(polygon: Polygon): SkeletonResult {
        // Initialize computation
        this.initializeComputation(polygon);

        // Main event processing loop
        while (!this.eventQueue.isEmpty() && !this.wavefront.isComplete()) {
            const event = this.eventQueue.poll();
            if (!event) continue;

            // Process the event
            this.processEvent(event);

            // Store processed event for result
            this.processedEvents.push(event);

            // Find and queue new events
            this.findNewEvents();
        }

        return {
            ridges: this.ridges,
            events: this.processedEvents
        };
    }

    private initializeComputation(polygon: Polygon): void {
        // Ensure counter-clockwise orientation
        if (polygon.isClockwise()) {
            throw new Error('Polygon must be in counter-clockwise orientation');
        }

        // Initialize wavefront
        this.wavefront = new Wavefront(polygon);

        // Initialize event queue with initial vertex events
        this.eventQueue.clear();
        this.eventQueue.initializeWithVertices(polygon.getVertices());

        // Find initial edge events
        this.eventQueue.findEdgeEvents(polygon.getEdges());

        // Find initial split events for reflex vertices
        this.eventQueue.findSplitEvents(polygon.getVertices(), polygon.getEdges());
    }

    private processEvent(event: Event): void {
        // Record ridge formation
        this.recordRidge(event);

        // Execute event and get new events
        const newEvents = event.execute();

        // Update wavefront
        this.wavefront.update(event);

        // Add new events to queue
        for (const newEvent of newEvents) {
            this.eventQueue.add(newEvent);
        }
    }

    private findNewEvents(): void {
        // Get current state of wavefront
        const activeChains = this.wavefront.getActiveChains();

        // Process each active chain
        for (const chain of activeChains) {
            // Find new edge events
            this.eventQueue.findEdgeEvents(chain.edges);

            // Find new split events
            this.eventQueue.findSplitEvents(chain.vertices, chain.edges);
        }
    }

    private recordRidge(event: Event): void {
        // Record the formation of skeleton ridges based on event type
        for (const vertex of event.vertices) {
            const startPoint = vertex.position;
            const endPoint = event.point;

            // Only add ridge if points are different
            if (!startPoint.equals(endPoint)) {
                this.ridges.push({
                    start: startPoint,
                    end: endPoint,
                    time: event.time
                });
            }
        }
    }

    // Utility method to validate input polygon
    private static validateInputPolygon(polygon: Polygon): boolean {
        return (
            polygon.getVertices().length >= 3 &&
            !polygon.isClockwise() &&
            polygon.isSimple()
        );
    }

    // Get the computed skeleton ridges
    getRidges(): Ridge[] {
        return [...this.ridges];
    }

    // Get all processed events
    getEvents(): Event[] {
        return [...this.processedEvents];
    }
}