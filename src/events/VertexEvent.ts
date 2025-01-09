import { Event, EventType } from './Event'
import { Vector } from '../Vector'
import { Vertex } from '../Vertex'
import { Edge } from '../Edge'
import { EdgeEvent } from './EdgeEvent'
import { SplitEvent } from './SplitEvent'

export class VertexEvent extends Event {
  constructor(
    time: number,
    point: Vector,
    public readonly vertex: Vertex,
    public readonly affectedEdges: Edge[] // Edges incident to this vertex
  ) {
    super(time, point, EventType.VERTEX, [vertex])

    if (affectedEdges.length !== 2) {
      throw new Error('VertexEvent must involve exactly two edges')
    }
  }

  isValid(): boolean {
    // Check if the vertex and edges still exist in the wavefront
    if (!this.vertex || !this.affectedEdges[0] || !this.affectedEdges[1]) {
      return false
    }

    // Verify the edges are still connected to this vertex
    const isConnected = this.affectedEdges.every(
      edge => edge.origin === this.vertex || edge.destination === this.vertex
    )
    if (!isConnected) {
      return false
    }

    // Recalculate the vertex position at this time
    const expectedPosition = this.vertex.computePositionAtTime(this.time)

    // Check if the calculated position matches the event position
    const epsilon = 1e-8
    return expectedPosition.subtract(this.point).length() < epsilon
  }

  execute(): Event[] {
    const newEvents: Event[] = []

    // Get the edges in the correct order (prev -> vertex -> next)
    let [prevEdge, nextEdge] = this.affectedEdges
    if (prevEdge.destination !== this.vertex) {
      [prevEdge, nextEdge] = [nextEdge, prevEdge]
    }

    // Calculate the bisector at the vertex
    const bisector = this.vertex.calculateBisector()

    // Create a new vertex at the event point (NO index!)
    const newVertex = new Vertex(this.point)

    // Update edge connectivity
    if (prevEdge.destination === this.vertex) {
      prevEdge.destination = newVertex
    }
    if (nextEdge.origin === this.vertex) {
      nextEdge.origin = newVertex
    }

    // Check for reflex vertex (interior angle > 180 degrees)
    if (this.vertex.isReflex()) {
      // For reflex vertices, we need to check for potential split events
      const splitEvent = this.checkForSplitEvent(newVertex, bisector)
      if (splitEvent) {
        newEvents.push(splitEvent)
      }
    }

    // Check for new edge events with adjacent edges
    const edgeEvent = this.checkForEdgeEvent(prevEdge, nextEdge)
    if (edgeEvent) {
      newEvents.push(edgeEvent)
    }

    return newEvents
  }

  private checkForSplitEvent(vertex: Vertex, bisector: Vector): SplitEvent | null {
    // Calculate potential split points with all other edges
    // The real implementation would be more complex; placeholder:
    const potentialSplit = vertex.calculatePotentialSplit([])

    if (potentialSplit !== null) {
      // Create split event if found
      // Implementation details would depend on your actual SplitEvent
      return null // placeholder
    }
    return null
  }

  private checkForEdgeEvent(edge1: Edge, edge2: Edge): EdgeEvent | null {
    const collision = edge1.findEdgeEvent(edge2)
    if (collision && collision.time > this.time) {
      return new EdgeEvent(
        collision.time,
        collision.point,
        edge1,
        edge2
      )
    }
    return null
  }

  toString(): string {
    // Log the vertex’s position instead of using vertex.index
    const vx = this.vertex.position.x.toFixed(2)
    const vy = this.vertex.position.y.toFixed(2)
    return `VertexEvent: Vertex at (${vx}, ${vy}) ` +
           `t=${this.time.toFixed(6)}, ` +
           `point=(${this.point.x.toFixed(2)}, ${this.point.y.toFixed(2)})`
  }
}
