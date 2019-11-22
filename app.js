var express = require('express');
var app = express();

var server = app.listen(3000, () => {
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

  var sdclient = new SDClient(SDClientConfig.username, 
                              SDClientConfig.password, 
                              SDClientConfig.ws_uri, 
                              SDClientConfig.login_uri);
  var response = await sdclient.init();
  var parsedBody = await sdclient.login(response);
  var game = await sdclient.findgame(SDClientConfig.ladder, 
                                     SDClientConfig.team);

  var sdbattle = new SDBattle(game, sdclient);
  
  var outcome = await sdbattle.battle();

}

main();
