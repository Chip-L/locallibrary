# Chips Library

## Description

This is doing the MDN Tutorial for creating a local library. (https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs)

I wanted to learn more about setting up the Express server and how they configured their files. This was fun and informative. I changed several things in it, most notably multiple authors. I attempted to write the code myself before going in to their code to read it. This was difficult because they used their code as the design documents.

## Table of Contents

- [User Story](#user-story)
- [Usage](#usage)
- [Technologies](#technologies)

## User Story

AS A book lover

I WANT a catalog of books

SO THAT I can keep track of what books I have

## Usage

`npm run start` -- starts the individual server

`npm run devstart` -- starts the server with nodemon

Be sure to set up a `.env` file with the following variables:

- `MONGODB` -- te connection string to your database

## Technologies

- [Express](https://www.npmjs.com/package/express) (server, routing, and middleware)
- [pug](https://pugjs.org/api/getting-started.html) (page display)
- [mongoose](https://mongoosejs.com/) (MongoDB Database ORM)
- [express validator](https://express-validator.github.io/docs/) (validation on routes)
- [async](https://www.npmjs.com/package/async) (mostly just parallel to pull promises all at once)
- [luxon](https://moment.github.io/luxon/) (date time manipulation)
- [bcrypt](https://www.npmjs.com/package/bcrypt) (password hashing)
