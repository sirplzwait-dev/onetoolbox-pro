/* ==========================================================
   OneToolBox Worker Manager v1.0
========================================================== */

"use strict";


const WorkerManager = (() => {


const manager = {};


/* ==========================================================
   State
========================================================== */

manager.workers = [];

manager.queue = [];

manager.active = 0;

manager.maxWorkers =

navigator.hardwareConcurrency || 2;


/* ==========================================================
   Initialize
========================================================== */

manager.init=function(

workerFile="worker.js"

){

this.workerFile=

workerFile;


for(

let i=0;

i<this.maxWorkers;

i++

){

this.createWorker();

}

};


/* ==========================================================
   Create Worker
========================================================== */

manager.createWorker=function(){

const worker =

new Worker(

this.workerFile

);


worker.busy=false;

worker.id=

this.workers.length;


worker.onmessage=(e)=>{


this.handleMessage(

worker,

e.data

);


};


worker.onerror=(e)=>{


worker.busy=false;


this.active--;


console.error(

"Worker Error",

e

);


this.next();

};


this.workers.push(

worker

);


};


/* ==========================================================
   Add Task
========================================================== */

manager.add=function(

task

){

return new Promise(

resolve=>{


this.queue.push({

task,

resolve

});


this.next();


});

};


/* ==========================================================
   Next Task
========================================================== */

manager.next=function(){


if(

!this.queue.length

)

return;


const worker=

this.workers.find(

w=>!w.busy

);


if(!worker)

return;



const item=

this.queue.shift();



worker.busy=true;


this.active++;


worker.current=item;



worker.postMessage(

item.task

);


};
/* ==========================================================
   Message Handler
========================================================== */

manager.handleMessage=function(

worker,

data

){


if(

data.type==="progress"

){


if(

worker.current &&

worker.current.progress

){


worker.current.progress(

data.percent,

data.message

);


}


return;

}



/* Complete */

if(

data.type==="complete"

){


worker.busy=false;


this.active--;


const resolve=

worker.current.resolve;


if(resolve){

resolve(data);

}


worker.current=null;


this.next();


return;

}



/* Error */

if(

data.type==="error"

){


worker.busy=false;


this.active--;


const reject=

worker.current.reject;


if(reject){

reject(

data.error

);

}


worker.current=null;


this.next();


}

};


/* ==========================================================
   Cancel All Tasks
========================================================== */

manager.cancelAll=function(){


this.queue=[];


this.workers.forEach(worker=>{


worker.terminate();


});


this.workers=[];


this.active=0;


};


/* ==========================================================
   Pause Queue
========================================================== */

manager.paused=false;


manager.pause=function(){

this.paused=true;

};


/* ==========================================================
   Resume Queue
========================================================== */

manager.resume=function(){

this.paused=false;

this.next();

};


/* ==========================================================
   Override Next Check
========================================================== */

const oldNext=

manager.next;


manager.next=function(){


if(this.paused)

return;


oldNext.call(this);

};


/* ==========================================================
   Retry Task
========================================================== */

manager.retry=function(

task,

attempts=3

){


let count=0;


const run=()=>{


return this.add(task)

.catch(err=>{


count++;


if(count<attempts){

return run();

}


throw err;


});


};


return run();

};


/* ==========================================================
   Worker Status
========================================================== */

manager.status=function(){


return{


total:

this.workers.length,


active:

this.active,


waiting:

this.queue.length,


paused:

this.paused


};


};
/* ==========================================================
   Restart Worker
========================================================== */

manager.restart=function(workerId){

    const worker =

    this.workers[workerId];


    if(!worker)

        return;


    worker.terminate();


    this.workers[workerId]=null;


    this.createWorker();

};


/* ==========================================================
   Cleanup Workers
========================================================== */

manager.cleanup=function(){

    this.workers.forEach(worker=>{


        worker.terminate();


    });


    this.workers=[];


    this.queue=[];


    this.active=0;

};


/* ==========================================================
   Dynamic Worker Count
========================================================== */

manager.setWorkers=function(count){

    this.cleanup();


    this.maxWorkers=count;


    for(

        let i=0;

        i<count;

        i++

    ){

        this.createWorker();

    }

};


/* ==========================================================
   Auto Shutdown
========================================================== */

manager.autoShutdown=function(

delay=60000

){

    setTimeout(()=>{


        if(

            this.active===0 &&

            this.queue.length===0

        ){

            this.cleanup();

        }


    },delay);

};


/* ==========================================================
   Execute Function
========================================================== */

manager.execute=function(

payload,

options={}

){

    return new Promise((resolve,reject)=>{


        this.queue.push({

            task:payload,

            resolve,

            reject,

            progress:

            options.progress || null

        });


        this.next();


    });

};


/* ==========================================================
   Worker Statistics
========================================================== */

manager.stats=function(){

    return{

        workers:

        this.workers.length,


        active:

        this.active,


        queue:

        this.queue.length,


        max:

        this.maxWorkers

    };

};


/* ==========================================================
   Final Export
========================================================== */

return manager;


})();