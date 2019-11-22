# ProjectCynthia-node

A bot that can play on Pokémon Showdown, implemented in JavaScript.

## Setup/installation

ProjectCynthia requires a working Node.js environment.

Clone the repository with: `https://github.com/4711KingOfHearts/ProjectCynthia.git`

Install the npm modules with: `npm install`

## Configuration

ProjectCynthia uses the `config` package to read its configuration from the `config` directory. At the very least, you will need to create a `config\local.json` file with the username and password you wish to use to login to Showdown. `config/local-example.json` can be used as a sample config by copying it to `config\local.json` and filling it in.

```
{
  //Copy this to local.json and fill in the values

  "SDClientConfig" : {
    "username" : "Your_Username_Here",
    "password" : "Your_Password_Here"
  }
}
```

## Running the bot
`$ node app.js`
