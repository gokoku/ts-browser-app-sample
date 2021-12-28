type Listeners = {
  [id: string]: {
    event: string
    element: HTMLElement
    handler: (event: Event) => void
  }
}

export class EventListener {
  private readonly listeners: Listeners = {}

  add(listenerID: string, event: string, element: HTMLElement, handler: (e: Event) => void) {
    this.listeners[listenerID] = {
      event,
      element,
      handler,
    }
    element.addEventListener(event, handler)
  }

  remove(listenerId: string) {
    const listener = this.listeners[listenerId]
    if (!listener) {
      return
    }
    listener.element.removeEventListener(listener.event, listener.handler)
    delete this.listeners[listenerId]
  }
}