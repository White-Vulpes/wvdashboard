# Boiler plate code for JWT Authentication
**Express JS, Mongo DB, JWT**

---


This repo is very minimal, this does only two tasks
* Sign Up
* Login
* Check validity of token using our simple Auth middleware

This uses Mongo DB but you can use any Database of your choice.

## SignUp
Post request. Send a POST req to api/signup with email and password in header as JSON type
* Checks email already exists
* If exists sends "Email already registered"
* Else encrypts the password and saves the new user to MongoDB
* Sends back a JWT token

## Login
POST request. Send a POST req to api/login with email and password in Header as JSON type
* Checks email exists in DB
* Compare passwords
* If the both are true then sends a JWT token

## Check validity of JWT token
Send a GET request to api/protectedroute 
1. Without token. Response: "No Token, Authorization denied"
2. Send a GET request with incorrect token. Response: "Token is not valid"
3. Send a GET request with correct token. You will be sucessfully taken to the next middleware in the application stack

I didn't use Passport to Authenticate because it is very heavy for this simple task. Use passport only if you neeed to Authenticate using other social media accounts