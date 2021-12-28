# ⚡ Online learning application API

Online Learning platform backend using nodejs express

## steps to test

1. go to [api](https://olapi.herokuapp.com/)
2. test public routes eg. [/api/v1/bootcamps](https://olapi.herokuapp.com/api/v1/bootcamps)
3. create a account eg. [/api/v1/users](https://olapi.herokuapp.com/api/v1/users)
4. test all routes

## steps to run locally

1. clone repository
2. cd into folder and run `npm install`
3. start mongodb local server
4. add mongodb connection-string in config/db.js
5. run `node seedDB --import`
6. run `npm run dev`
7. visit http://localhost:8080
