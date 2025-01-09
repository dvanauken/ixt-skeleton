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
        const n1 = v1.normalize();
        const n2 = v2.normalize();
        const sum = n1.add(n2);

        // Handle special case of opposite vectors
        if (sum.length() < 1e-10) {
            // Return perpendicular vector when vectors are opposite
            return v1.perpendicular().normalize();
        }

        return sum.normalize();
    }

    toString(): string {
        return `Vector(${this.x}, ${this.y})`;
    }
}