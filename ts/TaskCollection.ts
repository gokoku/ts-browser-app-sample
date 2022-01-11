import { Status, Task } from './Task'

export class TaskCollection {
  private tasks: Task[] = []

  add(task: Task) {
    this.tasks.push(task)
  }

  delete(task: Task) {
    this.tasks = this.tasks.filter(t => t.id !== task.id)
  }

  find(id: string): Task | null {
    return this.tasks.find(t => t.id === id) || null
  }

  update(task: Task) {
    this.tasks = this.tasks.map((item) => {
      if (item.id === task.id) {
        return task
      }
      return item
    })
  }

  filter(filterStatus: Status) {
    return this.tasks.filter(({ status }) => status === filterStatus)
  }

}