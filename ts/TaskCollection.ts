import { Status, Task, TaskObject } from './Task'

const STORAGE_KEY = 'TASKS'
export class TaskCollection {
  private readonly storage
  private tasks

  constructor() {
    this.storage = localStorage
    this.tasks = this.getStoredTasks()
  }

  add(task: Task) {
    this.tasks.push(task)
    this.updateStorage()
  }

  delete(task: Task) {
    this.tasks = this.tasks.filter(t => t.id !== task.id)
    this.updateStorage()
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
    this.updateStorage()
  }

  filter(filterStatus: Status) {
    return this.tasks.filter(({ status }) => status === filterStatus)
  }

  moveAboveTarget(task: Task, target: Task) {
    const taskIndex = this.tasks.indexOf(task)
    const targetIndex = this.tasks.indexOf(target)

    this.changeOrder(task, taskIndex, taskIndex < targetIndex ? targetIndex -1 : targetIndex)
  }

  moveToLast(task: Task) {
    const taskIndex = this.tasks.indexOf(task)
    this.changeOrder(task, taskIndex, this.tasks.length)
  }

  private changeOrder(task: Task, fromIndex: number, toIndex: number) {
    this.tasks.splice(fromIndex, 1)
    this.tasks.splice(toIndex, 0, task)
    this.updateStorage()
  }

  private updateStorage() {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(this.tasks))
  }

  private getStoredTasks() {
    const jsonString = this.storage.getItem(STORAGE_KEY)
    if (!jsonString) return []
    try{
      const storedTasks = JSON.parse(jsonString)

      assertIsTaskObjects(storedTasks)

      const tasks = storedTasks.map(t => new Task(t))
      return tasks
    } catch (e) {
      this.storage.removeItem(STORAGE_KEY)
      return []
    }
  }
}

function assertIsTaskObjects(value: any): asserts value is TaskObject[] {
  if(!Array.isArray(value) || !value.every((item) => Task.validate(item))) {
    throw new Error('引数「value」は TaskObject[] 型と一致しません。')
  }
}
