process.env.TEST_ENV = true;
require("ts-node").register(); // This will register the TypeScript compiler
require("./src"); // This will load our Typescript application 
