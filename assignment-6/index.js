/*
 * Primary file for API
 */

// Dependencies
const server = require('./server');
const cluster = require('cluster');
const os = require('os');

// Starts the server

const startApp = function() {

  if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    // Fork the process
    os.cpus().forEach(() => cluster.fork());
    cluster.on('death', function(worker) {
      console.log('worker ' + worker.pid + ' died');
    });

  } else {
    server();
    console.log(`Worker ${process.pid} started`);
  }
}


// Self invoking only if required directly
if (require.main === module){
  startApp();
}
