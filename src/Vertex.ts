import { Vector } from './Vector'
import { Edge } from './Edge'

//let vc = 0

export class Vertex {
  clone(newPosition: Vector) {
      throw new Error('Method not implemented.')
  }
  position: Vector
  //index: number
  private _prev?: Edge
  private _next?: Edge
  constructor(pos: Vector) {
    this.position = pos
    //this.index = i !== undefined ? i : vc++
  }
  
  setPrevEdge(e: Edge) {
    this._prev = e
  }
  
  setNextEdge(e: Edge) {
    this._next = e
  }
  
  get prevEdge(): Edge {
    if (!this._prev) throw new Error('Missing prevEdge')
    return this._prev
  }
  
  get nextEdge(): Edge {
    if (!this._next) throw new Error('Missing nextEdge')
    return this._next
  }
  
  calculateBisector(): Vector {
    const inc = this.position.subtract(this.prevEdge.origin.position).normalize()
    const out = this.nextEdge.destination.position.subtract(this.position).normalize()
    const sum = inc.add(out)
    return sum.length() < 1e-12 ? inc.perpendicular().normalize() : sum.normalize()
  }
  
  calculateInteriorAngle(): number {
    const inc = this.position.subtract(this.prevEdge.origin.position).normalize()
    const out = this.nextEdge.destination.position.subtract(this.position).normalize()
    const d = Math.min(Math.max(inc.dot(out), -1), 1)
    let angle = Math.acos(d)
    const cross = inc.x * out.y - inc.y * out.x
    if (cross < 0) angle = 2 * Math.PI - angle
    return angle
  }
  
  isReflex(): boolean {
    return this.calculateInteriorAngle() > Math.PI
  }
  
  calculateSpeed(): number {
    const th = this.calculateInteriorAngle()
    const s = Math.sin(th / 2)
    if (s === 0) throw new Error('Zero sine')
    return 1 / s
  }

  computePositionAtTime(t: number): Vector {
    const b = this.calculateBisector()
    const sp = this.calculateSpeed()
    const d = t / sp
    return this.position.add(b.scale(d))
  }

  public calculatePotentialSplit(edges: Edge[]): Vector | null {
    // TODO: Implement logic
    return null;
  }
}





