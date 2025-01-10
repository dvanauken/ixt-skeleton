import { describe, it, expect } from 'vitest';
import { Vector } from '../src/Vector';

describe('Vector', () => {
    // Utility function for comparing floating point numbers
    const equalWithinEpsilon = (a: number, b: number, epsilon = 1e-10) => 
        Math.abs(a - b) < epsilon;

    describe('mathematical properties', () => {
        it('ensures vector addition is commutative', () => {
            const v1 = new Vector(2, 3);
            const v2 = new Vector(-1, 4);
            
            const sum1 = v1.add(v2);
            const sum2 = v2.add(v1);
            
            expect(sum1.x).toEqual(sum2.x);
            expect(sum1.y).toEqual(sum2.y);
        });

        it('ensures scalar multiplication is distributive', () => {
            const v1 = new Vector(2, 3);
            const v2 = new Vector(-1, 4);
            const scalar = 2.5;

            const leftSide = v1.add(v2).scale(scalar);
            const rightSide = v1.scale(scalar).add(v2.scale(scalar));

            expect(equalWithinEpsilon(leftSide.x, rightSide.x)).toBeTruthy();
            expect(equalWithinEpsilon(leftSide.y, rightSide.y)).toBeTruthy();
        });

        it('preserves dot product properties', () => {
            const v1 = new Vector(2, 3);
            const v2 = new Vector(-1, 4);
            const v3 = new Vector(0, 2);

            // Commutative: a·b = b·a
            expect(v1.dot(v2)).toEqual(v2.dot(v1));

            // Distributive: a·(b + c) = a·b + a·c
            const leftSide = v1.dot(v2.add(v3));
            const rightSide = v1.dot(v2) + v1.dot(v3);
            expect(equalWithinEpsilon(leftSide, rightSide)).toBeTruthy();
        });

        it('preserves cross product properties', () => {
            const v1 = new Vector(2, 3);
            const v2 = new Vector(-1, 4);

            // Anti-commutative: a×b = -(b×a)
            expect(v1.cross(v2)).toEqual(-v2.cross(v1));

            // Cross product with self is zero
            expect(v1.cross(v1)).toEqual(0);
        });
    });

    describe('geometric properties', () => {
        it('maintains consistent length calculations', () => {
            const v = new Vector(3, 4);
            expect(v.length()).toEqual(5); // 3-4-5 triangle

            const zero = new Vector(0, 0);
            expect(zero.length()).toEqual(0);
        });

        it('preserves direction after normalization', () => {
            const v = new Vector(3, 4);
            const normalized = v.normalize();

            // Length should be 1
            expect(equalWithinEpsilon(normalized.length(), 1)).toBeTruthy();

            // Direction should be preserved (check proportions)
            expect(equalWithinEpsilon(normalized.x / normalized.y, 3/4)).toBeTruthy();
        });

        it('handles zero vector normalization', () => {
            const zero = new Vector(0, 0);
            expect(() => zero.normalize()).toThrow();
        });

        it('calculates correct angles', () => {
            const right = new Vector(1, 0);
            const up = new Vector(0, 1);
            
            // Right vector should have angle 0
            expect(right.angle()).toEqual(0);
            
            // Up vector should have angle π/2
            expect(equalWithinEpsilon(up.angle(), Math.PI/2)).toBeTruthy();
            
            // Down-left vector should have angle in correct quadrant
            const downLeft = new Vector(-1, -1);
            expect(downLeft.angle()).toBeGreaterThan(Math.PI);
        });

        it('maintains angle between vectors', () => {
            const v1 = new Vector(1, 0);
            const v2 = new Vector(0, 1);
            
            // Perpendicular vectors should have π/2 angle
            expect(equalWithinEpsilon(v1.angleBetween(v2), Math.PI/2)).toBeTruthy();
            
            // Opposite vectors should have π angle
            const v3 = new Vector(-1, 0);
            //qexpect(equalWithinEpsilon(v1.angleBetween(v3), Math.PI)).toBeTruthy();
            
            // Same vector should have 0 angle
            expect(v1.angleBetween(v1)).toEqual(0);
        });
    });

    describe('perpendicular computation', () => {
        it('creates correct perpendicular vectors', () => {
            const vectors = [
                new Vector(1, 0),
                new Vector(0, 1),
                new Vector(2, 3),
                new Vector(-1, 4)
            ];

            for (const v of vectors) {
                const perp = v.perpendicular();
                
                // Perpendicular vector should be orthogonal
                expect(equalWithinEpsilon(v.dot(perp), 0)).toBeTruthy();
                
                // Should maintain length
                expect(equalWithinEpsilon(v.length(), perp.length())).toBeTruthy();
                
                // Should rotate CCW by 90 degrees
                expect(equalWithinEpsilon(v.angleBetween(perp), Math.PI/2)).toBeTruthy();
            }
        });
    });

    describe('bisector calculation', () => {
        it('computes correct angle bisectors', () => {
            const v1 = new Vector(1, 0);
            const v2 = new Vector(0, 1);
            const bisector = Vector.bisector(v1, v2);

            // Bisector should have equal angles with both vectors
            const angle1 = Math.abs(bisector.angleBetween(v1));
            const angle2 = Math.abs(bisector.angleBetween(v2));
            expect(equalWithinEpsilon(angle1, angle2)).toBeTruthy();

            // Bisector should be normalized
            expect(equalWithinEpsilon(bisector.length(), 1)).toBeTruthy();
        });

        // it('handles special cases in bisector computation', () => {
        //     const v1 = new Vector(1, 0);
            
        //     // Same direction
        //     const sameBisector = Vector.bisector(v1, v1);
        //     //expect(equalWithinEpsilon(sameBisector.angleBetween(v1), 0)).toBeTruthy();

        //     // Opposite direction
        //     const v2 = new Vector(-1, 0);
        //     const oppositeBisector = Vector.bisector(v1, v2);
        //     // Should return perpendicular when vectors are opposite
        //     //expect(equalWithinEpsilon(Math.abs(oppositeBisector.angleBetween(v1)), Math.PI/2)).toBeTruthy();
        // });
    });
});