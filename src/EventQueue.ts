import { Event } from './events/Event';
import { EdgeEvent } from './events/EdgeEvent';
import { VertexEvent } from './events/VertexEvent';
import { SplitEvent } from './events/SplitEvent';
import { CollapseEvent } from './events/CollapseEvent';
import { Edge } from './Edge';
import { Vertex } from './Vertex';
import { Vector } from './Vector';

export class EventQueue {
    private events: Event[];

    constructor() {
        this.events = [];
    }

    push(event: Event): void {
        // Insert event maintaining time-based ordering
        const index = this.events.findIndex(e => e.time > event.time);
        if (index === -1) {
            this.events.push(event);
        } else {
            this.events.splice(index, 0, event);
        }
    }

    pop(): Event | null {
        return this.events.shift() || null;
    }

    peek(): Event | null {
        return this.events[0] || null;
    }

    isEmpty(): boolean {
        return this.events.length === 0;
    }

    clear(): void {
        this.events = [];
    }

    size(): number {
        return this.events.length;
    }
}