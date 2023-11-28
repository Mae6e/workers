const { Worker } = require('worker_threads');
const os = require('os');

//? Manage tasks
class TaskQueue {
    constructor() {
        this.tasks = [];
        this.workers = [];
    }

    enqueue(task) {
        this.tasks.push(task);
        this.processTasks();
    }

    push(task) {
        this.tasks.push(task);
    }

    registerWorker(worker) {
        const object = this.workers.find(obj => obj.worker.threadId === worker.threadId);
        if (object) {
            object.tasks++;
        } else {
            this.workers.push({ worker, tasks: 0 });
        }
        this.processTasks();
    }

    updateTasksOfWorker(worker) {
        const object = this.workers.find(obj => obj.worker.threadId === worker.threadId);
        if (object) {
            object.tasks++;
        }
    }

    processTasks() {
        while (this.tasks.length > 0 && this.workers.length > 0) {
            const task = this.tasks.shift();
            const worker = this.workers.sort((a, b) => a.tasks - b.tasks)[0].worker;
            console.log('length: ' + this.workers.length);
            worker.postMessage(task);
        }
    }
}

//? First point of execution
setTimeout(() => {
    console.log(`Master process started. Process ID: ${process.pid}`);

    const corLength = os.cpus().length;
    const taskQueue = new TaskQueue();

    //? Create worker threads
    for (let i = 0; i < corLength; i++) {
        const worker = new Worker('./workers/search.js');
        taskQueue.registerWorker(worker);

        //? When Recieve message from worker-The end of task
        worker.on('message', (result) => {
            console.log(`Received result from worker: ${result} id:` + worker.threadId);
            taskQueue.push('Task 11');
            taskQueue.registerWorker(worker);
        });
    }

    //? Add tasks to the task queue
    const tasks = [
        'Task 1',
        'Task 2', 'Task 3', 'Task 4', 'Task 5',
        'Task 6', 'Task 7', 'Task 8', 'Task 9', 'Task 10'
    ];

    tasks.forEach((task) => {
        taskQueue.enqueue(task);
    });

}, 10000);
