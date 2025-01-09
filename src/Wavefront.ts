import { Polygon } from './Polygon';
import { Edge } from './Edge';
import { Vertex } from './Vertex';
import { Vector } from './Vector';
import { Event } from './events/Event';
import { EventType } from './events/Event';
import { SplitEvent } from './events/SplitEvent';
import { CollapseEvent } from './events/CollapseEvent';

interface WavefrontChain {
    edges: Edge[];
    vertices: Vertex[];
    isActive: boolean;
}

export class Wavefront {
    private chains: WavefrontChain[] = [];
    private currentTime: number = 0;

    constructor(initialPolygon: Polygon) {
        // Initialize first chain from the input polygon
        const edges = initialPolygon.getEdges();
        const vertices = initialPolygon.getVertices();
        
        this.chains.push({
            edges: [...edges],
            vertices: [...vertices],
            isActive: true
        });
    }

    // Update wavefront to a new time, handling topology changes
    update(event: Event): void {
        this.currentTime = event.time;

        switch (event.type) {
            case EventType.EDGE:
                this.handleEdgeEvent(event);
                break;
            case EventType.VERTEX:
                this.handleVertexEvent(event);
                break;
            case EventType.SPLIT:
                this.handleSplitEvent(event as SplitEvent);
                break;
            case EventType.COLLAPSE:
                this.handleCollapseEvent(event as CollapseEvent);
                break;
        }

        // Update positions of all active vertices
        this.updateVertexPositions();
    }

    private updateVertexPositions(): void {
        for (const chain of this.chains) {
            if (!chain.isActive) continue;

            for (const vertex of chain.vertices) {
                const newPosition = vertex.computePositionAtTime(this.currentTime);
                // Create new vertex at updated position
                const updatedVertex = vertex.clone(newPosition);
                
                // Update references in adjacent edges
                if (vertex.prevEdge) {
                    if (vertex.prevEdge.destination === vertex) {
                        //vertex.prevEdge.destination = updatedVertex;
                    }
                }
                if (vertex.nextEdge) {
                    if (vertex.nextEdge.origin === vertex) {
                        //vertex.nextEdge.origin = updatedVertex;
                    }
                }
            }
        }
    }

    private handleEdgeEvent(event: Event): void {
        // Find the chain containing the affected edges
        const chainIndex = this.findChainContainingVertex(event.vertices[0]);
        if (chainIndex === -1) return;

        const chain = this.chains[chainIndex];
        
        // Update topology by merging vertices and removing collapsed edge
        this.mergeVertices(chain, event.vertices, event.point);
    }

    private handleVertexEvent(event: Event): void {
        // Similar to edge event, but may need special handling for vertex speed
        const chainIndex = this.findChainContainingVertex(event.vertices[0]);
        if (chainIndex === -1) return;

        const chain = this.chains[chainIndex];
        this.mergeVertices(chain, event.vertices, event.point);
    }

    private handleSplitEvent(event: SplitEvent): void {
        const chainIndex = this.findChainContainingVertex(event.reflexVertex);
        if (chainIndex === -1) return;

        // Create two new chains from the split
        const originalChain = this.chains[chainIndex];
        const splitPoint = event.point;

        // Find split indices
        const splitEdgeIndex = originalChain.edges.indexOf(event.splitEdge);
        const reflexVertexIndex = originalChain.vertices.indexOf(event.reflexVertex);

        if (splitEdgeIndex === -1 || reflexVertexIndex === -1) return;

        // Create new chains
        const chain1: WavefrontChain = {
            edges: originalChain.edges.slice(0, splitEdgeIndex + 1),
            vertices: originalChain.vertices.slice(0, reflexVertexIndex + 1),
            isActive: true
        };

        const chain2: WavefrontChain = {
            edges: originalChain.edges.slice(splitEdgeIndex + 1),
            vertices: originalChain.vertices.slice(reflexVertexIndex),
            isActive: true
        };

        // Update chain references
        this.chains[chainIndex] = chain1;
        this.chains.push(chain2);
    }

    private handleCollapseEvent(event: CollapseEvent): void {
        const chainIndex = this.findChainContainingEdge(event.collapsingChain[0]);
        if (chainIndex === -1) return;

        const chain = this.chains[chainIndex];
        
        // Mark chain as inactive if it completely collapses
        if (event.collapsingChain.length === chain.edges.length) {
            chain.isActive = false;
        } else {
            // Update topology by merging vertices at collapse point
            this.mergeVertices(chain, event.vertices, event.point);
        }
    }

    private findChainContainingVertex(vertex: Vertex): number {
        return this.chains.findIndex(chain => 
            chain.isActive && chain.vertices.includes(vertex)
        );
    }

    private findChainContainingEdge(edge: Edge): number {
        return this.chains.findIndex(chain =>
            chain.isActive && chain.edges.includes(edge)
        );
    }

    private mergeVertices(chain: WavefrontChain, vertices: Vertex[], mergePoint: Vector): void {
        // Create new vertex at merge point
        // const newVertex = new Vertex(mergePoint, vertices[0].index);

        // // Update edge references
        // for (const vertex of vertices) {
        //     const vertexIndex = chain.vertices.indexOf(vertex);
        //     if (vertexIndex !== -1) {
        //         chain.vertices[vertexIndex] = newVertex;
        //     }

        //     // Update edge endpoints
        //     if (vertex.prevEdge) {
        //         if (vertex.prevEdge.destination === vertex) {
        //             vertex.prevEdge.destination = newVertex;
        //         }
        //     }
        //     if (vertex.nextEdge) {
        //         if (vertex.nextEdge.origin === vertex) {
        //             vertex.nextEdge.origin = newVertex;
        //         }
        //     }
        // }
    }

    // Get current state of all active chains
    getActiveChains(): WavefrontChain[] {
        return this.chains.filter(chain => chain.isActive);
    }

    // Check if wavefront is completely collapsed
    isComplete(): boolean {
        return this.chains.every(chain => !chain.isActive);
    }
}