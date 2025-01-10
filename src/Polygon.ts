import { Vector } from './Vector';
import { Vertex } from './Vertex';
import { Edge } from './Edge';

interface BoundingBox {
    min: Vector;
    max: Vector;
}

export class Polygon {
    vertices: Vertex[];
    private static readonly EPSILON = 1e-10;

    constructor(vertices: Vertex[]) {
        this.validateVertices(vertices);
        this.vertices = [...vertices];
        this.setupConnectivity();
    }

    private validateVertices(vertices: Vertex[]): void {
        // Check minimum vertex count
        if (vertices.length < 3) {
            throw new Error('Polygon must have at least 3 vertices');
        }

        // Check for coincident vertices and near-collinear sequences
        for (let i = 0; i < vertices.length; i++) {
            const v1 = vertices[i].position;
            const v2 = vertices[(i + 1) % vertices.length].position;
            const v3 = vertices[(i + 2) % vertices.length].position;

            // Check for coincident vertices
            if (v1.subtract(v2).length() < Polygon.EPSILON) {
                throw new Error('Coincident vertices detected');
            }

            // Check for near-collinear vertices
            const edge1 = v2.subtract(v1);
            const edge2 = v3.subtract(v2);
            const area = Math.abs(edge1.cross(edge2));
            if (area < Polygon.EPSILON * edge1.length() * edge2.length()) {
                throw new Error('Near-collinear vertices detected');
            }
        }

        // Check for self-intersection
        for (let i = 0; i < vertices.length; i++) {
            const edge1Start = vertices[i].position;
            const edge1End = vertices[(i + 1) % vertices.length].position;
            
            for (let j = i + 2; j < vertices.length; j++) {
                const edge2Start = vertices[j].position;
                const edge2End = vertices[(j + 1) % vertices.length].position;
                
                // Skip adjacent edges
                if ((j + 1) % vertices.length === i) continue;
                
                if (this.segmentsIntersect(
                    edge1Start, edge1End,
                    edge2Start, edge2End
                )) {
                    throw new Error('Self-intersecting polygon detected');
                }
            }
        }
    }

    private setupConnectivity(): void {
        // Create edges and establish connectivity
        for (let i = 0; i < this.vertices.length; i++) {
            const current = this.vertices[i];
            const next = this.vertices[(i + 1) % this.vertices.length];
            const prev = this.vertices[(i - 1 + this.vertices.length) % this.vertices.length];

            // Create edge from current to next vertex
            const edge = new Edge(current, next);
            current.setNextEdge(edge);
            next.setPrevEdge(edge);
        }
    }

    area(): number {
        let sum = 0;
        for (let i = 0; i < this.vertices.length; i++) {
            const current = this.vertices[i].position;
            const next = this.vertices[(i + 1) % this.vertices.length].position;
            sum += current.x * next.y - next.x * current.y;
        }
        return Math.abs(sum) / 2;
    }
    
    isCCW(): boolean {
        let sum = 0;
        for (let i = 0; i < this.vertices.length; i++) {
            const current = this.vertices[i].position;
            const next = this.vertices[(i + 1) % this.vertices.length].position;
            sum += (current.x * next.y - next.x * current.y);
        }
        return sum > 0;
    }   

    containsPoint(point: Vector): boolean {
        let inside = false;
        for (let i = 0, j = this.vertices.length - 1; i < this.vertices.length; j = i++) {
            const vi = this.vertices[i].position;
            const vj = this.vertices[j].position;
            
            if (((vi.y > point.y) !== (vj.y > point.y)) &&
                (point.x < (vj.x - vi.x) * (point.y - vi.y) / (vj.y - vi.y) + vi.x)) {
                inside = !inside;
            }
        }
        return inside;
    }

    getBoundingBox(): BoundingBox {
        const min = new Vector(
            Math.min(...this.vertices.map(v => v.position.x)),
            Math.min(...this.vertices.map(v => v.position.y))
        );
        const max = new Vector(
            Math.max(...this.vertices.map(v => v.position.x)),
            Math.max(...this.vertices.map(v => v.position.y))
        );
        return { min, max };
    }

    removeVertex(vertex: Vertex): void {
        const index = this.vertices.indexOf(vertex);
        if (index === -1) return;

        // Update connectivity
        const prev = this.vertices[(index - 1 + this.vertices.length) % this.vertices.length];
        const next = this.vertices[(index + 1) % this.vertices.length];
        
        // Create new edge connecting prev to next
        const newEdge = new Edge(prev, next);
        prev.setNextEdge(newEdge);
        next.setPrevEdge(newEdge);

        // Remove vertex
        this.vertices.splice(index, 1);
    }

    isValid(): boolean {
        try {
            this.validateVertices(this.vertices);
            return true;
        } catch {
            return false;
        }
    }

    private segmentsIntersect(p1: Vector, p2: Vector, p3: Vector, p4: Vector): boolean {
        // Returns true if line segments p1p2 and p3p4 intersect
        const ccw = (A: Vector, B: Vector, C: Vector): boolean => {
            return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
        };
        
        const intersect = ccw(p1, p3, p4) !== ccw(p2, p3, p4) &&
                         ccw(p1, p2, p3) !== ccw(p1, p2, p4);
        
        // Check if segments are collinear and overlapping
        if (!intersect) {
            const collinear = Math.abs((p2.y - p1.y) * (p4.x - p3.x) - 
                                     (p4.y - p3.y) * (p2.x - p1.x)) < Polygon.EPSILON;
            
            if (collinear) {
                // Check for overlap
                const x1 = Math.min(p1.x, p2.x), x2 = Math.max(p1.x, p2.x);
                const x3 = Math.min(p3.x, p4.x), x4 = Math.max(p3.x, p4.x);
                const y1 = Math.min(p1.y, p2.y), y2 = Math.max(p1.y, p2.y);
                const y3 = Math.min(p3.y, p4.y), y4 = Math.max(p3.y, p4.y);
                
                return !(x2 < x3 || x4 < x1 || y2 < y3 || y4 < y1);
            }
        }
        
        return intersect;
    }
}