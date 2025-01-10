import { Vector } from './Vector';
import { Vertex } from './Vertex';


export interface Intersection {
    point: Vector;
    t1: number;    // Parameter along first edge
    t2: number;    // Parameter along second edge
}

export interface EdgeEventResult {
    time: number;
    point: Vector;
}

export class Edge {
    private _origin: Vertex;
    private _destination: Vertex;

    constructor(origin: Vertex, destination: Vertex) {
        this._origin = origin;
        this._destination = destination;
        
        // Establish connectivity
        origin.setNextEdge(this);
        destination.setPrevEdge(this);
    }

    // Getters and setters with proper connectivity management
    get origin(): Vertex {
        return this._origin;
    }

    set origin(vertex: Vertex) {
        // Disconnect from old origin
        if (this._origin) {
            this._origin.setNextEdge(null);
        }
        this._origin = vertex;
        // Connect to new origin
        if (vertex) {
            vertex.setNextEdge(this);
        }
    }

    get destination(): Vertex {
        return this._destination;
    }

    set destination(vertex: Vertex) {
        // Disconnect from old destination
        if (this._destination) {
            this._destination.setPrevEdge(null);
        }
        this._destination = vertex;
        // Connect to new destination
        if (vertex) {
            vertex.setPrevEdge(this);
        }
    }

    // Vector operations
    getEdgeVector(): Vector {
        return this.destination.position.subtract(this.origin.position);
    }

    getEdgeDirection(): Vector {
        return this.getEdgeVector().normalize();
    }

    getEdgeLength(): number {
        return this.getEdgeVector().length();
    }

    getEdgeNormal(): Vector {
        // Returns the normalized normal vector pointing inward for CCW orientation
        return this.getEdgeDirection().perpendicular();
    }

    // Point calculations
    pointAt(t: number): Vector {
        // Returns point at parameter value t along the edge (0 ≤ t ≤ 1)
        return this.origin.position.lerp(this.destination.position, t);
    }

    containsPoint(point: Vector, epsilon: number = 1e-10): boolean {
        // Check if point lies on the edge
        const v = this.getEdgeVector();
        const p = point.subtract(this.origin.position);

        // Check collinearity
        if (Math.abs(v.cross(p)) > epsilon) {
            return false;
        }

        // Check if point lies between endpoints
        if (v.lengthSquared() === 0) {
            return point.equals(this.origin.position, epsilon);
        }

        const t = p.dot(v) / v.lengthSquared();
        return t >= -epsilon && t <= 1 + epsilon;
    }

    // Intersection calculations
    intersect(other: Edge): Intersection | null {
        const v1 = this.getEdgeVector();
        const v2 = other.getEdgeVector();
        const cross = v1.cross(v2);

        // Check if edges are parallel
        if (Math.abs(cross) < 1e-10) {
            return null;
        }

        const p = other.origin.position.subtract(this.origin.position);
        const t1 = p.cross(v2) / cross;
        const t2 = p.cross(v1) / cross;

        // Check if intersection point lies within both edges
        if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
            return {
                point: this.pointAt(t1),
                t1: t1,
                t2: t2
            };
        }

        return null;
    }

    // Offset operations
    offset(distance: number): Edge {
        const normal = this.getEdgeNormal();
        const offset = normal.scale(distance);
        
        const newOrigin = new Vertex(this.origin.position.add(offset));
        const newDestination = new Vertex(this.destination.position.add(offset));
        
        return new Edge(newOrigin, newDestination);
    }

    findEdgeEvent(other: Edge): EdgeEventResult | null {
        const intersection = this.intersect(other);
        if (!intersection) return null;

        // Calculate the time when the edges will collide
        const v1 = this.getEdgeVector();
        const v2 = other.getEdgeVector();
        const speed = Math.sqrt(v1.lengthSquared() + v2.lengthSquared());
        
        if (speed === 0) return null;

        // Time is proportional to the distance to intersection
        const time = intersection.t1 * this.getEdgeLength() / speed;

        return {
            time: time,
            point: intersection.point
        };
    }


    toString(): string {
        return `Edge(${this.origin.position} -> ${this.destination.position})`;
    }
}