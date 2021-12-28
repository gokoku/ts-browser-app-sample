import { v4 as uuid } from 'uuid'

export const statusMap = {
  Todo: 'Todo',
  Doing: 'Doing',
  Done: 'Done',
} as const
export type Status = typeof statusMap[keyof typeof statusMap]

export class Task {
  readonly id
  title
  status

  constructor(properties: { title: string }) {
    this.id = uuid()
    this.title = properties.title
    this.status = statusMap.Todo
  }
}