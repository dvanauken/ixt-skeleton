import { Vector } from './Vector'
import { Edge } from './Edge'

export class Vertex {
    position: Vector
    private _prev: Edge | null = null;
    private _next: Edge | null = null;

    constructor(pos: Vector) {
        this.position = pos
    }

    setPrevEdge(e: Edge | null) {
        this._prev = e
    }

    setNextEdge(e: Edge | null) {
        this._next = e
    }

    get prevEdge(): Edge | null { // Changed return type to Edge | null
        return this._prev
    }

    get nextEdge(): Edge | null { // Changed return type to Edge | null
        return this._next
    }

    hasBothEdges(): boolean {
        return this._prev !== null && this._next !== null;
    }
    // hasBothEdges(): this is { _prev: Edge; _next: Edge } {
    //     return this._prev !== null && this._next !== null;
    // }
    calculateBisector(): Vector {
        if (!this.hasBothEdges()) {
            throw new Error('Cannot calculate bisector without both edges');
        }

        const prevVertex = this.prevEdge!.origin.position;
        const nextVertex = this.nextEdge!.destination.position;

        // Determine orientation to check if the vertex is reflex
        const orientation = Vector.orientation(prevVertex, this.position, nextVertex);
        console.log(`Vertex at ${this.position.toString()}: Orientation = ${orientation}`);

        const inc = this.position.subtract(prevVertex).normalize();
        const out = nextVertex.subtract(this.position).normalize();
        console.log(`Incoming Vector: ${inc.toString()}`);
        console.log(`Outgoing Vector: ${out.toString()}`);

        let bisector: Vector;

        if (orientation === -1) { // Clockwise orientation, reflex vertex
            bisector = inc.subtract(out).normalize();
            console.log(`Convex Bisector: ${bisector.toString()}`);
        } else if (orientation === 1) { // Counter-Clockwise orientation, convex vertex
            bisector = inc.add(out).normalize();
            console.log(`Reflex Bisector: ${bisector.toString()}`);
        } else { // Collinear edges
            throw new Error('Cannot compute bisector for collinear edges');
        }

        return bisector;
    }

    calculateInteriorAngle(): number {
        if (!this.hasBothEdges()) {
            throw new Error('Cannot calculate interior angle without both edges');
        }
    
        const inc = this.position.subtract(this.prevEdge!.origin.position).normalize();
        const out = this.nextEdge!.destination.position.subtract(this.position).normalize();
        
        // Ensure dot product is within valid range for acos
        const d = Math.min(Math.max(inc.dot(out), -1), 1);
        let angle = Math.acos(d);
        
        // Adjust angle based on cross product sign for correct orientation
        const cross = inc.cross(out);
        if (cross < 0) angle = 2 * Math.PI - angle;
        
        return angle;
    }
    
    isReflex(): boolean {
        if (!this.hasBothEdges()) {
            throw new Error('Cannot determine if vertex is reflex without both edges')
        }
        return this.calculateInteriorAngle() > Math.PI
    }

    calculateSpeed(): number {
        if (!this.hasBothEdges()) {
            throw new Error('Cannot calculate speed without both edges');
        }
        
        const theta = this.calculateInteriorAngle();
        const sinHalfTheta = Math.sin(theta / 2);
        
        if (Math.abs(sinHalfTheta) < 1e-12) {
            throw new Error('Speed calculation faiqled: angle results in zero sine');
        }
        
        return 1 / sinHalfTheta;
    }

    computePositionAtTime(t: number): Vector {
        if (!this.hasBothEdges()) {
            throw new Error('Cannot compute position without both edges')
        }

        const bisector = this.calculateBisector()
        const speed = this.calculateSpeed()
        const distance = t / speed
        
        return this.position.add(bisector.scale(distance))
    }

    calculatePotentialSplit(edges: Edge[]): Vector | null {
        if (!this.hasBothEdges() || !this.isReflex()) {
            return null
        }

        // Implement split event detection
        // For each edge not adjacent to this vertex:
        // 1. Calculate distance from vertex to edge
        // 2. Calculate time when vertex reaches edge
        // 3. Return position at minimum valid time
        
        let minTime = Infinity
        let splitPoint: Vector | null = null

        for (const edge of edges) {
            // Skip adjacent edges
            if (edge === this._prev || edge === this._next) {
                continue
            }

            const bisector = this.calculateBisector()
            const speed = this.calculateSpeed()
            
            // Calculate intersection between bisector ray and edge
            // TODO: Implement intersection calculation
            
            // Update minTime and splitPoint if this is a valid split event
        }

        return splitPoint
    }

    clone(newPosition: Vector = this.position): Vertex {
        const vertex = new Vertex(newPosition)
        // Don't copy edge connections in clone
        return vertex
    }

    toString(): string {
        return `Vertex(${this.position.toString()})`
    }
}