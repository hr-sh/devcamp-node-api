# ⚡ Online learning application API

Online Learning platform backend using nodejs express

## Steps to test

1. Open [https://olapi.herokuapp.com/](https://olapi.herokuapp.com/)
2. Go to public routes. Eg: [/api/v1/bootcamps](https://olapi.herokuapp.com/api/v1/bootcamps)
3. Create a account Eg. POST [/api/v1/register](https://olapi.herokuapp.com/api/v1/register)
4. Test all routes

## Steps to run

1. Clone repository
2. Cd into folder and run `npm install`
3. Start mongodb local server
4. Add mongodb connection-string in config/db.js
5. Run `node seedDB --import`
6. Run `npm run dev`
7. Open http://localhost:8080
