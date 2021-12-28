# ⚡ Online learning application API

Online Learning platform backend using nodejs express

## steps to test

1. go to [api](https://olapi.herokuapp.com/)
2. test public routes 
- [/api/v1/bootcamps](https://olapi.herokuapp.com/api/v1/bootcamps)
- [/api/v1/courses](https://olapi.herokuapp.com/api/v1/courses)
- [/api/v1/reviews](https://olapi.herokuapp.com/api/v1/reviews)
3. create a account eg. POST [/api/v1/register](https://olapi.herokuapp.com/api/v1/register)
4. test all routes

## steps to run locally

1. clone repository
2. cd into folder and run `npm install`
3. start mongodb local server
4. add mongodb connection-string in config/db.js
5. run `node seedDB --import`
6. run `npm run dev`
7. visit http://localhost:8080
