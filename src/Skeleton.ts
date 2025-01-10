// import { Polygon } from './Polygon';
// import { Vector } from './Vector';
// import { EventQueue } from './EventQueue';
// import { Wavefront } from './Wavefront';
// import { Event } from './events/Event';
// import { Edge } from './Edge';
// import { Vertex } from './Vertex';
// import { Polyline } from './Polyline';
// // Assuming you have a Polyline class that can be built from a set of points

// interface Ridge {
//     start: Vector;
//     end: Vector;
//     time: number;
// }

// export class Skeleton {
//     private eventQueue: EventQueue;
//     private wavefront: Wavefront;
//     private ridges: Ridge[] = [];
//     private processedEvents: Event[] = [];

//     constructor() {
//         this.eventQueue = new EventQueue();
//         this.wavefront = null!; // Will be initialized in compute()
//     }

//     /**
//      * Main entry point for building the skeleton from a polygon.
//      * Example client usage:
//      *
//      *    Polygon polygon = ...
//      *    Skeleton skeleton = Skeleton.Build(polygon);
//      *    Polyline[] polylines = skeleton.getPolylines();
//      */
//     public static Build(polygon: Polygon): Skeleton {
//         // Validate input polygon
//         if (!this.validateInputPolygon(polygon)) {
//             throw new Error('Invalid polygon for straight skeleton computation');
//         }

//         const skeleton = new Skeleton();
//         skeleton.compute(polygon);
//         return skeleton;
//     }

//     /**
//      * Computes the skeleton and stores results (ridges, events) in this instance.
//      */
//     private compute(polygon: Polygon): void {
//         // Initialize computation
//         this.initializeComputation(polygon);

//         // Main event processing loop
//         while (!this.eventQueue.isEmpty() && !this.wavefront.isComplete()) {
//             const event = this.eventQueue.poll();
//             if (!event) continue;

//             // Process the event
//             this.processEvent(event);

//             // Store processed event
//             this.processedEvents.push(event);

//             // Find and queue new events
//             this.findNewEvents();
//         }
//     }

//     /**
//      * Prepares the data structures for computation.
//      */
//     private initializeComputation(polygon: Polygon): void {
//         // Ensure counter-clockwise orientation
//         if (polygon.isClockwise()) {
//             throw new Error('Polygon must be in counter-clockwise orientation');
//         }

//         // Initialize wavefront
//         this.wavefront = new Wavefront(polygon);

//         // Initialize event queue with initial vertex events
//         this.eventQueue.clear();
//         this.eventQueue.initializeWithVertices(polygon.getVertices());

//         // Find initial edge events
//         this.eventQueue.findEdgeEvents(polygon.getEdges());

//         // Find initial split events for reflex vertices
//         this.eventQueue.findSplitEvents(polygon.getVertices(), polygon.getEdges());
//     }

//     /**
//      * Process a single skeleton event.
//      */
//     private processEvent(event: Event): void {
//         // Record ridge formation
//         this.recordRidge(event);

//         // Execute the event and get potential follow-up events
//         const newEvents = event.execute();

//         // Update wavefront based on the event
//         this.wavefront.update(event);

//         // Add follow-up events to the queue
//         for (const newEvent of newEvents) {
//             this.eventQueue.add(newEvent);
//         }
//     }

//     /**
//      * Finds and queues new events based on the current state of the wavefront.
//      */
//     private findNewEvents(): void {
//         // Get current state of wavefront
//         const activeChains = this.wavefront.getActiveChains();

//         // Process each active chain
//         for (const chain of activeChains) {
//             // Find new edge events
//             this.eventQueue.findEdgeEvents(chain.edges);

//             // Find new split events
//             this.eventQueue.findSplitEvents(chain.vertices, chain.edges);
//         }
//     }

//     /**
//      * Records the formation of skeleton "ridges" (edges in the straight skeleton)
//      * based on the current event.
//      */
//     private recordRidge(event: Event): void {
//         for (const vertex of event.vertices) {
//             const startPoint = vertex.position;
//             const endPoint = event.point;

//             if (!startPoint.equals(endPoint)) {
//                 this.ridges.push({
//                     start: startPoint,
//                     end: endPoint,
//                     time: event.time
//                 });
//             }
//         }
//     }

//     /**
//      * Utility method to validate input polygon.
//      */
//     private static validateInputPolygon(polygon: Polygon): boolean {
//         return (
//             polygon.getVertices().length >= 3 &&
//             !polygon.isClockwise() &&
//             polygon.isSimple()
//         );
//     }

//     /**
//      * Returns an array of all recorded ridges (each ridge is a segment).
//      */
//     public getRidges(): Ridge[] {
//         return [...this.ridges];
//     }

//     /**
//      * Returns all events that were processed during skeleton construction.
//      */
//     public getEvents(): Event[] {
//         return [...this.processedEvents];
//     }

//     /**
//      * Example method to convert ridges into polylines.
//      * (You'll need to implement your own logic in Polyline for how
//      *  these segments are combined or represented.)
//      */
//     public getPolylines(): Polyline[] {
//         // This simplistic example assumes each Ridge corresponds to a two-point polyline
//         //return this.ridges.map(ridge => new Polyline([ridge.start, ridge.end]));
//         throw new Error("TODO: Not implemented");
//     }
// }
