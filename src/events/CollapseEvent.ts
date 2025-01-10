import { Event, EventType } from './Event';
import { Vector } from '../Vector';
import { Vertex } from '../Vertex';
import { Edge } from '../Edge';

export class CollapseEvent extends Event {
    constructor(
        time: number,
        point: Vector,
        public readonly collapsingChain: Edge[],
        public readonly terminalVertices: Vertex[]
    ) {
        // Get all vertices involved in the collapse
        const vertices = Array.from(new Set([
            ...collapsingChain.map(edge => edge.origin),
            ...collapsingChain.map(edge => edge.destination)
        ]));
        
        super(time, point, EventType.COLLAPSE, vertices);

        // Validate edge chain
        if (collapsingChain.length < 1) {
            throw new Error('Collapse event must involve at least one edge');
        }

        // Validate terminal vertices
        if (terminalVertices.length !== 2) {
            throw new Error('Collapse event must have exactly two terminal vertices');
        }

        // Validate chain connectivity and terminal vertices
        this.validateChainConnectivity();
    }

    // private validateChainConnectivity(): void {
    //     // Check that edges form a connected chain
    //     for (let i = 0; i < this.collapsingChain.length - 1; i++) {
    //         const currentEdge = this.collapsingChain[i];
    //         const nextEdge = this.collapsingChain[i + 1];
    //         const isConnected = currentEdge.destination === nextEdge.origin ||
    //             currentEdge.destination === nextEdge.destination ||
    //             currentEdge.origin === nextEdge.origin ||
    //             currentEdge.origin === nextEdge.destination;
    //         if (!isConnected) {
    //             throw new Error('Collapsing edges must form a connected chain');
    //         }
    //     }

    //     // Get all vertices in the chain
    //     const endVertices = new Set([
    //         this.collapsingChain[0].origin,
    //         this.collapsingChain[0].destination,
    //         this.collapsingChain[this.collapsingChain.length - 1].origin,
    //         this.collapsingChain[this.collapsingChain.length - 1].destination
    //     ]);

    //     // Check if both terminal vertices are in the set of end vertices
    //     const terminalVerticesAtEnds = this.terminalVertices.every(v => endVertices.has(v));
        
    //     if (!terminalVerticesAtEnds) {
    //         throw new Error('Terminal vertices must be at the ends of the chain');
    //     }
    // }
    private validateChainConnectivity(): void {
        // Check that edges form a connected chain
        for (let i = 0; i < this.collapsingChain.length - 1; i++) {
            const currentEdge = this.collapsingChain[i];
            const nextEdge = this.collapsingChain[i + 1];
            const isConnected = currentEdge.destination === nextEdge.origin ||
                currentEdge.destination === nextEdge.destination ||
                currentEdge.origin === nextEdge.origin ||
                currentEdge.origin === nextEdge.destination;
            if (!isConnected) {
                throw new Error('Collapsing edges must form a connected chain');
            }
        }

        // Get start and end vertices of the chain
        const firstEdge = this.collapsingChain[0];
        const lastEdge = this.collapsingChain[this.collapsingChain.length - 1];

        // Get actual end vertices (considering chain orientation)
        const startVertex = firstEdge.origin;
        const endVertex = lastEdge.destination;

        // Check if terminal vertices match the actual ends of the chain
        const isStartTerminal = this.terminalVertices.includes(startVertex);
        const isEndTerminal = this.terminalVertices.includes(endVertex);

        if (!isStartTerminal || !isEndTerminal) {
            throw new Error('Terminal vertices must be at the ends of the chain');
        }

        // Ensure we have exactly the start and end vertices as terminals
        if (this.terminalVertices[0] !== startVertex && this.terminalVertices[1] !== startVertex) {
            throw new Error('Terminal vertices must be at the ends of the chain');
        }
        if (this.terminalVertices[0] !== endVertex && this.terminalVertices[1] !== endVertex) {
            throw new Error('Terminal vertices must be at the ends of the chain');
        }
    }
    
    isValid(): boolean {
        // Check if all edges and vertices still exist
        const componentsExist = this.collapsingChain.every(edge => edge) &&
            this.terminalVertices.every(vertex => vertex);

        if (!componentsExist) {
            return false;
        }

        // Verify chain is still connected
        try {
            this.validateChainConnectivity();
        } catch {
            return false;
        }

        // Check if terminal vertices will actually meet at the collapse point
        const positions = this.terminalVertices.map(vertex => 
            vertex.computePositionAtTime(this.time)
        );

        // Verify all terminal vertices collapse to approximately the same point
        const epsilon = 1e-8;
        return positions.every(pos => 
            pos.subtract(this.point).length() < epsilon
        );
    }

    execute(): Event[] {
        // Create new vertex at collapse point
        const collapseVertex = new Vertex(this.point);

        // Find edges connected to the chain but not part of it
        const connectedEdges = new Set<Edge>();
        
        for (const vertex of this.vertices) {
            if (vertex.prevEdge && !this.collapsingChain.includes(vertex.prevEdge)) {
                connectedEdges.add(vertex.prevEdge);
            }
            if (vertex.nextEdge && !this.collapsingChain.includes(vertex.nextEdge)) {
                connectedEdges.add(vertex.nextEdge);
            }
        }

        // Update the endpoints of connected edges to the new collapse vertex
        for (const edge of connectedEdges) {
            if (this.vertices.includes(edge.origin)) {
                edge.origin = collapseVertex;
            }
            if (this.vertices.includes(edge.destination)) {
                edge.destination = collapseVertex;
            }
        }

        // No new events are generated from a collapse
        return [];
    }

    toString(): string {
        return `CollapseEvent: ${this.collapsingChain.length} edges collapse at t=${this.time.toFixed(6)}, ` +
            `point=(${this.point.x.toFixed(2)}, ${this.point.y.toFixed(2)})`;
    }
}