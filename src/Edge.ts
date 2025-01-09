import { Vector } from './Vector';
import { Vertex } from './Vertex';

export class Edge {
    private _origin: Vertex;
    private _destination: Vertex;

    constructor(origin: Vertex, destination: Vertex) {
        this._origin = origin;
        this._destination = destination;
        origin.setNextEdge(this);
        destination.setPrevEdge(this);
    }

    get origin(): Vertex {
        return this._origin;
    }

    set origin(vertex: Vertex) {
        this._origin = vertex;
        vertex.setNextEdge(this);
    }

    get destination(): Vertex {
        return this._destination;
    }

    set destination(vertex: Vertex) {
        this._destination = vertex;
        vertex.setPrevEdge(this);
    }

    vector(): Vector {
        return this.destination.position.subtract(this.origin.position);
    }

    direction(): Vector {
        return this.vector().normalize();
    }

    length(): number {
        return this.vector().length();
    }

    normal(): Vector {
        // Returns counter-clockwise normal (for inward offset)
        return this.direction().perpendicular();
    }

    pointAt(t: number): Vector {
        return this.origin.position.add(this.vector().scale(t));
    }

    containsPoint(point: Vector, epsilon: number = 1e-10): boolean {
        const v = point.subtract(this.origin.position);
        const edgeVec = this.vector();
        
        // Check if point lies on the line (cross product near zero)
        if (Math.abs(v.cross(edgeVec)) > epsilon) {
            return false;
        }

        // Check if point lies within edge bounds using dot product
        const t = v.dot(edgeVec) / edgeVec.dot(edgeVec);
        return t >= -epsilon && t <= 1 + epsilon;
    }

    intersect(other: Edge): { point: Vector; t1: number; t2: number; } | null {
        const v1 = this.vector();
        const v2 = other.vector();
        const cross = v1.cross(v2);

        // Check if edges are parallel (cross product near zero)
        if (Math.abs(cross) < 1e-10) {
            return null;
        }

        // Calculate intersection parameters
        const diff = other.origin.position.subtract(this.origin.position);
        const t1 = diff.cross(v2) / cross;
        const t2 = diff.cross(v1) / cross;

        // Check if intersection lies within both edges
        if (t1 < 0 || t1 > 1 || t2 < 0 || t2 > 1) {
            return null;
        }

        return {
            point: this.pointAt(t1),
            t1,
            t2
        };
    }

    offset(distance: number): Edge {
        const normalVec = this.normal().scale(distance)
        const newOrigin = new Vertex(this.origin.position.add(normalVec))
        const newDestination = new Vertex(this.destination.position.add(normalVec))
    
        return new Edge(newOrigin, newDestination)
      }

    findEdgeEvent(other: Edge): { time: number; point: Vector; } | null {
        const n1 = this.normal();
        const n2 = other.normal();
        const cross = n1.cross(n2);
    
        // If normals are parallel, no intersection will occur
        if (Math.abs(cross) < 1e-10) {
            return null;
        }
    
        // Calculate intersection of offset lines
        const p1 = this.origin.position;
        const p2 = other.origin.position;
        const diff = p2.subtract(p1);
    
        // Important: the time must be positive for BOTH edges
        const t1 = diff.cross(n2) / cross;
        const t2 = diff.cross(n1) / cross;
    
        // Critical change: Use positive time for both edges
        const time = Math.max(t1, t2);
        if (time <= 0) {
            return null;
        }
    
        // Calculate intersection point
        const intersectionPoint = p1.add(n1.scale(time));
    
        return {
            time,
            point: intersectionPoint
        };
    }

}