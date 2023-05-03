export type EventEmitter_Events = Record<string | number | symbol, unknown[]>;

export type EventEmitter_Listener<Parameters extends unknown[]> = (
  ...params: Parameters
) => void;

export default class EventEmitter<Events extends EventEmitter_Events> {
  private readonly listeners: {
    [EventName in keyof Events]?: {
      persist: boolean;
      listener: EventEmitter_Listener<Events[EventName]>;
    }[];
  } = {};

  private add<EventName extends keyof Events>(
    event: EventName,
    listener: EventEmitter_Listener<Events[EventName]>,
    persist: boolean
  ): void {
    (this.listeners[event] ||= []).push({
      persist: persist,
      listener: listener,
    });
  }

  public on<EventName extends keyof Events>(
    event: EventName,
    listener: EventEmitter_Listener<Events[EventName]>
  ): this {
    this.add(event, listener, true);

    return this;
  }

  public once<EventName extends keyof Events>(
    event: EventName,
    listener: EventEmitter_Listener<Events[EventName]>
  ): this {
    this.add(event, listener, false);

    return this;
  }

  public off<EventName extends keyof Events>(
    event: EventName,
    listener: (...params: Events[EventName]) => void
  ): this {
    const listeners = this.listeners[event];

    if (listeners) {
      const index = listeners.findIndex((item) => {
        return item.listener === listener;
      });

      if (index > -1) {
        listeners.splice(index, 1);
      }
    }

    return this;
  }

  public emit<EventName extends keyof Events>(
    event: EventName,
    ...params: Events[EventName]
  ): this {
    const listeners = this.listeners[event];

    if (listeners) {
      let listenerLength = listeners.length;

      for (let i = 0; i < listenerLength; i++) {
        const { persist, listener } = listeners[i];

        listener(...params);

        if (!persist) {
          listeners.splice(i, 1);

          i--;
          listenerLength--;
        }
      }
    }

    return this;
  }
}
