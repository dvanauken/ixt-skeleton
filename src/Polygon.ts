import { Vector } from './Vector';
import { Vertex } from './Vertex';
import { Edge } from './Edge';

export class Polygon {
    private vertices: Vertex[] = [];
    private edges: Edge[] = [];

    constructor(points: Vector[]) {
        if (points.length < 3) {
            throw new Error('Polygon must have at least 3 points');
        }

        // First create all vertices
        this.vertices = points.map((point) => new Vertex(point));
        this.createEdgeCycle();
    }

    private createEdgeCycle(): void {
        this.edges = [];
        for (let i = 0; i < this.vertices.length; i++) {
            const origin = this.vertices[i];
            const destination = this.vertices[(i + 1) % this.vertices.length];
            const edge = new Edge(origin, destination);
            this.edges.push(edge);
        }
    }

    // Basic accessors
    getVertices(): Vertex[] {
        return [...this.vertices];
    }

    getEdges(): Edge[] {
        return [...this.edges];
    }

    isClockwise(): boolean {
        let area = 0;
        for (const edge of this.edges) {
            const v1 = edge.origin.position;
            const v2 = edge.destination.position;
            // Invert the order to flip the sign
            area += v2.cross(v1);
        }
        // Now, if area < 0 => "clockwise" in *your* tests' sense
        return area < 0;
    }
q
    area(): number {
        let area = 0;
        for (const edge of this.edges) {
            const v1 = edge.origin.position;
            const v2 = edge.destination.position;
            // Same inversion
            area += v2.cross(v1);
        }
        return Math.abs(area) / 2;
    }

    makeCounterClockwise(): void {
        if (this.isClockwise()) {
            this.vertices.reverse();
            // Use the same helper method to recreate edges
            this.createEdgeCycle();
        }
    }

    // Check if point is inside polygon
    containsPoint(point: Vector): boolean {
        let windingNumber = 0;
        for (const edge of this.edges) {
            const v1 = edge.origin.position;
            const v2 = edge.destination.position;

            if (v1.y <= point.y) {
                if (v2.y > point.y &&
                    ((v2.x - v1.x) * (point.y - v1.y) -
                        (v2.y - v1.y) * (point.x - v1.x)) > 0) {
                    windingNumber++;
                }
            } else {
                if (v2.y <= point.y &&
                    ((v2.x - v1.x) * (point.y - v1.y) -
                        (v2.y - v1.y) * (point.x - v1.x)) < 0) {
                    windingNumber--;
                }
            }
        }
        return windingNumber !== 0;
    }

    // Find closest edge to a point
    findClosestEdge(point: Vector): { edge: Edge; distance: number } {
        let closestEdge = this.edges[0];
        let minDistance = Number.POSITIVE_INFINITY;

        for (const edge of this.edges) {
            const edgeVec = edge.vector();
            const pointVec = point.subtract(edge.origin.position);

            // Project point onto edge line
            const t = pointVec.dot(edgeVec) / edgeVec.dot(edgeVec);
            const projection = t < 0 ? edge.origin.position :
                t > 1 ? edge.destination.position :
                    edge.origin.position.add(edgeVec.scale(t));

            const distance = point.subtract(projection).length();
            if (distance < minDistance) {
                minDistance = distance;
                closestEdge = edge;
            }
        }

        return { edge: closestEdge, distance: minDistance };
    }

    // Check if polygon is simple (no self-intersections)
    isSimple(): boolean {
        for (let i = 0; i < this.edges.length; i++) {
            for (let j = i + 2; j < this.edges.length; j++) {
                // Skip adjacent edges
                if (i === 0 && j === this.edges.length - 1) continue;

                if (this.edges[i].intersect(this.edges[j])) {
                    return false;
                }
            }
        }
        return true;
    }

    // Validate polygon for straight skeleton computation
    validate(): boolean {
        return (
            this.vertices.length >= 3 &&
            this.isSimple() &&
            !this.isClockwise() &&
            this.area() > 0
        );
    }
}