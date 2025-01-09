import { describe, it, expect } from "vitest";
import { Polygon } from "../src/Polygon";
import { Skeleton } from "../src/Skeleton";
import { Vector } from "../src/Vector";

describe("Skeleton", () => {
  describe("basic tests", () => {
    it("should build a skeleton from a simple square polygon", () => {
      // 1. Arrange: Create a simple polygon (a square, in this case)
      const polygon = new Polygon([
        new Vector(0, 0),
        new Vector(10, 0),
        new Vector(10, 10),
        new Vector(0, 10),
      ]);

      // 2. Act: Build the skeleton and retrieve polylines
      const skeleton = Skeleton.Build(polygon);
      const polylines = skeleton.getPolylines();

      // 3. Assert: Verify the results
      // Adjust the assertions below to match the expected behavior of your skeleton algorithm
      expect(polylines).toBeInstanceOf(Array);
      // Possibly check that you have some ridges formed
      expect(polylines.length).toBeGreaterThan(0);

      // Optional: additional checks
      // e.g., check the first polyline is not empty:
      expect(polylines[0]).toBeDefined();
      // In a real test, you might check actual coordinates, the count of points, etc.
    });
  });
});
