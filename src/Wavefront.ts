import { Polygon } from './Polygon';
import { Vector } from './Vector';
import { Vertex } from './Vertex';
import { Edge } from './Edge';
import { EventQueue } from './EventQueue';
import { Event } from './events/Event';
import { EdgeEvent } from './events/EdgeEvent';
import { SplitEvent } from './events/SplitEvent';
import { VertexEvent } from './events/VertexEvent';

export class Wavefront {
    public vertices: Vertex[];
    public edges: Edge[];
    private eventQueue: EventQueue;
    private time: number;
    private skeleton: Edge[];
    private vertexVelocities: Map<Vertex, Vector>;

    constructor(polygon: Polygon) {
        this.vertices = [];
        this.edges = [];
        this.eventQueue = new EventQueue();
        this.time = 0;
        this.skeleton = [];
        this.vertexVelocities = new Map();

        // Deep copy vertices to create independent wavefront
        this.vertices = polygon.vertices.map(v => 
            new Vertex(new Vector(v.position.x, v.position.y))
        );

        // Create edges and establish connectivity
        for (let i = 0; i < this.vertices.length; i++) {
            const nextIndex = (i + 1) % this.vertices.length;
            const edge = new Edge(this.vertices[i], this.vertices[nextIndex]);
            this.edges.push(edge);
            
            // Set vertex connections
            this.vertices[i].setNextEdge(edge);
            this.vertices[nextIndex].setPrevEdge(edge);
        }

        // Initialize vertex velocities
        this.vertices.forEach(vertex => {
            this.updateVertexVelocity(vertex);
        });

        this.findInitialEvents();
    }

    private updateVertexVelocity(vertex: Vertex): void {
        const bisector = vertex.calculateBisector();
        const speed = vertex.calculateSpeed();
        this.vertexVelocities.set(vertex, bisector.scale(speed));
    }

    private findInitialEvents(): void {
        // // Check for edge events
        // this.edges.forEach(edge => {
        //     const event = this.computeEdgeEvent(edge);
        //     if (event) {
        //         this.eventQueue.push(event);
        //     }
        // });

        // // Check for split events from reflex vertices
        // this.vertices.forEach(vertex => {
        //     if (vertex.isReflex()) {
        //         const events = this.computeSplitEvents(vertex);
        //         events.forEach(event => this.eventQueue.push(event));
        //     }
        // });
    }

    private computeEdgeEvent(edge: Edge): EdgeEvent | null {
        const v1 = edge.origin;
        const v2 = edge.destination;
        
        const v1Velocity = this.vertexVelocities.get(v1);
        const v2Velocity = this.vertexVelocities.get(v2);
        
        if (!v1Velocity || !v2Velocity) return null;

        const relativeVel = v2Velocity.subtract(v1Velocity);
        const edgeVector = edge.getEdgeVector();
        
        if (relativeVel.dot(edgeVector) >= 0) return null;

        const timeToCollapse = edge.getEdgeLength() / relativeVel.length();
        
        if (timeToCollapse <= 0) return null;

        // Calculate collapse point
        const collapsePoint = v1.position.add(edgeVector.scale(0.5));

        // Find the next edge in sequence for proper EdgeEvent construction
        const nextEdge = v2.nextEdge;
        
        return new EdgeEvent(
            this.time + timeToCollapse,
            collapsePoint,
            edge,
            nextEdge
        );
    }

    private computeSplitEvent(vertex: Vertex, edge: Edge): SplitEvent | null {
        // const velocity = this.vertexVelocities.get(vertex);
        // if (!velocity) return null;

        // const trajStart = vertex.position;
        // const trajEnd = vertex.position.add(velocity);
        
        // const intersection = edge.intersect({
        //     origin: trajStart,
        //     destination: trajEnd
        // });

        // if (!intersection) return null;

        // const timeToSplit = intersection.t1;
        
        // if (timeToSplit <= 0) return null;

        // const reflexEdges = [vertex.prevEdge, vertex.nextEdge];

        // return new SplitEvent(
        //     this.time + timeToSplit,
        //     intersection.point,
        //     vertex,
        //     edge,
        //     reflexEdges
        // );
        return null;
    }

    propagate(timeStep: number): void {
        const targetTime = this.time + timeStep;

        while (!this.eventQueue.isEmpty() && this.eventQueue.peek()!.time <= targetTime) {
            const event = this.eventQueue.pop()!;
            
            this.moveVerticesToTime(event.time);
            this.handleEvent(event);
            this.updateEvents();
        }

        if (this.time < targetTime) {
            this.moveVerticesToTime(targetTime);
        }
    }

    private moveVerticesToTime(targetTime: number): void {
        const deltaTime = targetTime - this.time;
        
        this.vertices.forEach(vertex => {
            const velocity = this.vertexVelocities.get(vertex);
            if (velocity) {
                const displacement = velocity.scale(deltaTime);
                vertex.position = vertex.position.add(displacement);
            }
        });

        this.time = targetTime;
    }

    private handleEvent(event: Event): void {
        if (event instanceof EdgeEvent) {
            this.handleEdgeEvent(event);
        } else if (event instanceof SplitEvent) {
            this.handleSplitEvent(event);
        }

        this.updateSkeleton(event);
    }

    private handleEdgeEvent(event: EdgeEvent): void {
        const edge = event.edge1;
        const v1 = edge.origin;
        const v2 = edge.destination;

        const mergePoint = this.calculateEventPoint(event);
        v1.position = mergePoint;

        this.removeVertex(v2);
        this.removeEdge(edge);
        this.vertexVelocities.delete(v2);
        
        this.updateVertexVelocity(v1);
        if (v1.prevEdge) this.updateVertexVelocity(v1.prevEdge.origin);
        if (v1.nextEdge) this.updateVertexVelocity(v1.nextEdge.destination);
    }

    private handleSplitEvent(event: SplitEvent): void {
        const vertex = event.reflexVertex;
        const edge = event.splitEdge;
        const splitPoint = event.point;

        const newVertex = new Vertex(splitPoint);
        this.vertices.push(newVertex);

        const newEdge = this.splitEdge(edge, newVertex);
        
        this.updateVertexVelocity(newVertex);
        this.updateVertexVelocity(edge.origin);
        this.updateVertexVelocity(newEdge.destination);
    }

    private splitEdge(edge: Edge, vertex: Vertex): Edge {
        const oldDest = edge.destination;
        const newEdge = new Edge(vertex, oldDest);
        
        edge.destination = vertex;
        vertex.setPrevEdge(edge);
        vertex.setNextEdge(newEdge);
        
        this.edges.push(newEdge);
        return newEdge;
    }

    private removeVertex(vertex: Vertex): void {
        const index = this.vertices.indexOf(vertex);
        if (index !== -1) {
            this.vertices.splice(index, 1);
        }
        this.vertexVelocities.delete(vertex);
    }

    private removeEdge(edge: Edge): void {
        const index = this.edges.indexOf(edge);
        if (index !== -1) {
            this.edges.splice(index, 1);
        }
    }

    private updateEvents(): void {
        this.eventQueue.clear();
        this.findInitialEvents();
    }

    private calculateEventPoint(event: Event): Vector {
        if (event instanceof EdgeEvent) {
            return event.point;
        } else if (event instanceof SplitEvent) {
            return event.point;
        }
        throw new Error("Unknown event type");
    }

    private updateSkeleton(event: Event): void {
        if (event instanceof EdgeEvent) {
            this.skeleton.push(event.edge1);
        } else if (event instanceof SplitEvent) {
            this.skeleton.push(event.splitEdge);
        }
    }

    getSkeleton(): Edge[] {
        return this.skeleton;
    }
}