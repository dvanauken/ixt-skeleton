import { Event, EventType } from './Event';
import { Vector } from '../Vector';
import { Vertex } from '../Vertex';
import { Edge } from '../Edge';

export class CollapseEvent extends Event {
    constructor(
        time: number,
        point: Vector,
        public readonly collapsingChain: Edge[], // Sequence of edges that will collapse
        public readonly terminalVertices: Vertex[] // End vertices of the chain
    ) {
        // Include all vertices from the collapsing chain
        const vertices = Array.from(new Set([
            ...collapsingChain.map(edge => edge.origin),
            ...collapsingChain.map(edge => edge.destination)
        ]));
        
        super(time, point, EventType.COLLAPSE, vertices);

        if (collapsingChain.length < 1) {
            throw new Error('Collapse event must involve at least one edge');
        }

        if (terminalVertices.length !== 2) {
            throw new Error('Collapse event must have exactly two terminal vertices');
        }

        // Verify chain connectivity
        this.validateChainConnectivity();
    }

    private validateChainConnectivity(): void {
        // Check that edges form a connected chain
        for (let i = 0; i < this.collapsingChain.length - 1; i++) {
            const currentEdge = this.collapsingChain[i];
            const nextEdge = this.collapsingChain[i + 1];
            
            const isConnected = 
                currentEdge.destination === nextEdge.origin ||
                currentEdge.destination === nextEdge.destination ||
                currentEdge.origin === nextEdge.origin ||
                currentEdge.origin === nextEdge.destination;

            if (!isConnected) {
                throw new Error('Collapsing edges must form a connected chain');
            }
        }

        // Verify terminal vertices are at the ends of the chain
        const firstEdge = this.collapsingChain[0];
        const lastEdge = this.collapsingChain[this.collapsingChain.length - 1];
        
        const hasTerminals = 
            (firstEdge.origin === this.terminalVertices[0] || firstEdge.origin === this.terminalVertices[1] ||
             firstEdge.destination === this.terminalVertices[0] || firstEdge.destination === this.terminalVertices[1]) &&
            (lastEdge.origin === this.terminalVertices[0] || lastEdge.origin === this.terminalVertices[1] ||
             lastEdge.destination === this.terminalVertices[0] || lastEdge.destination === this.terminalVertices[1]);

        if (!hasTerminals) {
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
        // The wavefront topology will be updated by the main algorithm
        return [];
    }

    toString(): string {
        const chainLength = this.collapsingChain.length;
        return `CollapseEvent: ${chainLength} edges collapse at t=${this.time.toFixed(6)}, ` +
               `point=(${this.point.x.toFixed(2)}, ${this.point.y.toFixed(2)})`;
    }
}