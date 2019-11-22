class SDClient {
  constructor(username, password, ws_uri, login_uri) {
    this.username = username;
    this.password = password;
    this.ws_uri = ws_uri;
    this.login_uri = login_uri;
    this.messages = [];
    this.initchallstr = null;
    this.clientid = null ;
    this.challstr = null; 
	}

  //SDClient general process:
  //
  // 1) create the websocket
  //
  // 2) get the challenge string (challstr) that is
  //    sent when we create the websocket
  //
  // 3) use the challstr to loging to the Showdown
  //    website
  // 
  // 4) use the assertion in the reply from 3) to
  //    complete logging in to the websocket
  //
  // 5) use the gamestate info from 4) to start
  //    a game on Showdown, with gametype specified
  //    from the config.


  /**  
   * Sets up the websocket we use for communications
   * the websocket returns a challenge string when
   * it is initialized; we need this to login
   *
   * @return {Promise} challstr - challstr used to login.
   */
  init() {
    return new Promise( (resolve, reject) => {
      let EventEmitter = require('events');
      this.events = new EventEmitter();

      this.request = require('request-promise-native');
      
      this.WebSocket = require('ws');
      this.ws = new this.WebSocket(this.ws_uri);

      this.ws.on('error', (err) => {
        reject(err);
      });

      this.ws.on('message', (msg) => {
        this.messageHandler(msg);
        console.log("MESSAGE:" + msg);
      });
        
      console.log("SDClient: Waiting for challenge string...");

      if(this.initchallstr) {
        resolve(this.initchallstr);
      } else {
        this.events.on('challstr', (challstr) => {
          console.log("resolving challstr promise");
          resolve(challstr);
        });
      }
    });

  }

  /**
   * Uses the challstr to login to the Showdown website
   * 
   * @param {Array} - contains the client_id and challstr
   *
   * @return {Promise} parsedbody - JSON object containing
   * the login POST response
   */
  async login(response){
    console.log("LOGGING IN challstr: " + response);
    this.clientid = response[0];
    this.challstr = response[1];

    let data = {};

    if(this.password) {
      data = {
        "act" : "login",
        "name" : this.username,
        "pass" : this.password,
        "challstr" : response.join('|')
      };
    } else {
      data = {
        "act" : "getassertion",
        "name" : this.username,
        "challstr" : response.join('|')
      };
    }

    let options = {
      "method" : "post",
      "uri" : this.login_uri,
      "form" : data
    };
    console.log("POSTING: " + JSON.stringify(options) );


    let loginresponse = await this.request(options);    
    let parsedbody = JSON.parse(loginresponse.slice(1));
      
    let message = ["/trn " + this.username + ",0," + parsedbody.assertion];
    this.sendMessage("", message);

    return new Promise( (resolve, reject) => {
      resolve(parsedbody);
    });
  }

  /**
   * Starts a Showdown game.
   *
   * @param {String} ladder - the type of game to start.
   * @param {Object} team - contains the team to use for the game, null for games with no teams
   *
   * @return {Promise} game - contains info specific to the game started.
   */
  findgame(ladder, team) {
    let message1 = ["/utm " + team];
    let message2 = ["/search " + ladder];
    this.sendMessage("", message1);
    this.sendMessage("", message2);

    return new Promise( (resolve, reject) => {
      resolve("success");
    });
  }

  sendMessage(room, messages) {
    let message = room + "|" + messages.join("|");
    this.ws.send(message);
  }
  
  getMessage() {
    if(this.messages.length > 0){
      return this.messages.shift();
    } else {
      return null;
    }
  }

  messageHandler(message) {
    let split_message = message.split('|');
    switch (split_message[1]) {
      case 'challstr': 
        this.initchallstr = [split_message[2], split_message[3]];
        console.log("emitting challstr");
        this.events.emit('challstr', this.initchallstr);
        break;
      default:
        this.messages.push(message);
    }
  }


}

module.exports = SDClient;
