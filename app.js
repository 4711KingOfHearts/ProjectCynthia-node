const express = require('express');
const app = express();

const server = app.listen(3000, () => {
	console.log('server is running on port', server.address().port);
});

function errHandler(err){
  console.log("ERROR: " + err);
  return process.exit(1);
}

async function main(){
  const config = require('config');
  const SDClientConfig = config.get('SDClientConfig');

  const SDClient = require('./SDClient');
  const SDBattle = require('./SDBattle');

  let sdclient = new SDClient(SDClientConfig.username, 
                              SDClientConfig.password, 
                              SDClientConfig.ws_uri, 
                              SDClientConfig.login_uri);
  let response = await sdclient.init();
  let parsedBody = await sdclient.login(response);
  let game = await sdclient.findgame(SDClientConfig.ladder, 
                                     SDClientConfig.team);

  let sdbattle = new SDBattle(game, sdclient);
  
  let outcome = await sdbattle.battle();

}

main();
