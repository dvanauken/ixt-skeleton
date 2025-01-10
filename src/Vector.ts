

export class Vector {
    constructor(
        public readonly x: number,
        public readonly y: number
    ) {}

    add(other: Vector): Vector {
        return new Vector(
            this.x + other.x,
            this.y + other.y
        );
    }

    subtract(other: Vector): Vector {
        return new Vector(
            this.x - other.x,
            this.y - other.y
        );
    }

    scale(scalar: number): Vector {
        return new Vector(
            this.x * scalar,
            this.y * scalar
        );
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    lengthSquared(): number {
        return this.x * this.x + this.y * this.y;
    }

    normalize(): Vector {
        const len = this.length();
        if (len === 0) {
            throw new Error('Cannot normalize zero vector');
        }
        return this.scale(1 / len);
    }

    dot(other: Vector): number {
        return this.x * other.x + this.y * other.y;
    }

    cross(other: Vector): number {
        return this.x * other.y - this.y * other.x;
    }

    angle(): number {
        // Convert from [-π, π] to [0, 2π] range
        const angle = Math.atan2(this.y, this.x);
        return angle < 0 ? angle + 2 * Math.PI : angle;
    }

    angleBetween(other: Vector): number {
        // Returns signed angle from this vector to other vector
        // Positive angle means counter-clockwise rotation
        const dot = this.dot(other);
        const cross = this.cross(other);
        
        // Use atan2 to get correct quadrant and sign
        return Math.atan2(cross, dot);
    }

    perpendicular(): Vector {
        // Returns counter-clockwise perpendicular vector
        return new Vector(-this.y, this.x);
    }

    rotate(angle: number): Vector {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos
        );
    }

    equals(other: Vector, epsilon: number = 1e-10): boolean {
        return Math.abs(this.x - other.x) < epsilon && 
               Math.abs(this.y - other.y) < epsilon;
    }


    static bisector(v1: Vector, v2: Vector): Vector {
        const n1 = v1.normalize()
        const n2 = v2.normalize()

        // Calculate the signed angle from n1 to n2
        const angle = n1.angleBetween(n2)

        let bisector: Vector

        if (angle < 0) { // Reflex angle
            bisector = n1.subtract(n2) // Corrected subtraction order
        } else { // Convex angle
            bisector = n1.add(n2)
        }

        // Handle the case where bisector is a zero vector
        if (bisector.lengthSquared() === 0) {
            throw new Error('Cannot compute bisector for collinear vectors')
        }

        return bisector.normalize()
    }

    distanceToPoint(point: Vector): number {
        return this.subtract(point).length();
    }

    distanceToLine(start: Vector, end: Vector): number {
        const line = end.subtract(start);
        const pointVector = this.subtract(start);
        if (line.lengthSquared() === 0) return pointVector.length();
        
        const t = Math.max(0, Math.min(1, pointVector.dot(line) / line.lengthSquared()));
        const projection = start.add(line.scale(t));
        return this.distanceToPoint(projection);
    }

    projectOnto(other: Vector): Vector {
        const len = other.lengthSquared();
        if (len === 0) throw new Error('Cannot project onto zero vector');
        return other.scale(this.dot(other) / len);
    }

    lerp(other: Vector, t: number): Vector {
        return this.add(other.subtract(this).scale(t));
    }

    isCollinear(v1: Vector, v2: Vector, epsilon: number = 1e-10): boolean {
        // Returns true if this point is collinear with points v1 and v2
        const area = (v2.x - v1.x) * (this.y - v1.y) - 
                    (this.x - v1.x) * (v2.y - v1.y);
        return Math.abs(area) < epsilon;
    }

    static fromAngle(angle: number): Vector {
        return new Vector(Math.cos(angle), Math.sin(angle));
    }

    toString(): string {
        return `Vector(${this.x}, ${this.y})`;
    }

    // Utility methods for edge/polygon operations
    static area2(a: Vector, b: Vector, c: Vector): number {
        // Returns twice the signed area of the triangle abc
        return (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);
    }

    static orientation(a: Vector, b: Vector, c: Vector): number {
        // Returns:
        //  1 if abc forms a counter-clockwise turn
        //  -1 if abc forms a clockwise turn
        //  0 if abc are collinear
        const area = Vector.area2(a, b, c);
        return Math.abs(area) < 1e-10 ? 0 : Math.sign(area);
    }
}