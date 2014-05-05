[![Build Status](https://travis-ci.org/scull7/pipeline-queue.svg?branch=master)](https://travis-ci.org/scull7/pipeline-queue)
[![Coverage Status](https://coveralls.io/repos/scull7/pipeline-queue/badge.png)](https://coveralls.io/r/scull7/pipeline-queue)
[![Code Climate](https://codeclimate.com/github/scull7/pipeline-queue.png)](https://codeclimate.com/github/scull7/pipeline-queue)

pipeline-queue
==============
A simple queuing mechanism that can pipeline requests for a long running resource request.  By using this queue you can make multiple requests to the resource but the resource will only receive traffic as fast as it will respond.

Installation
------------
Just use npm to install.

````
npm install pipeline-queue
````

Usage
-----

````
var PipelineQueue = require('pipeline-queue'),
queue = PipelineQueue();

key = 'unique-key';
task = function () { //do something that takes a long time. };
callback1 = function (results) { // handle the response. };

queue.run(key, task, callback1);

//make a second request
callback2 = function (results) { // handle the response. };

queue.run(key, task, callback2); //if the task has not completed yet,
                                //then our callback will be queued and the task will not be run.
                                //Our callback will receive the results of the initial task run.
                                
