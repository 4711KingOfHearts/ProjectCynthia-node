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

  init() {
    var challstrPromise = new Promise( (resolve, reject) => {
      var EventEmitter = require('events');
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

    return challstrPromise;
  }

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
//      "json" : true
    };
    console.log("POSTING: " + JSON.stringify(options) );

//    return process.exit(0);

    let loginresponse = await this.request(options);
        
    let parsedbody = JSON.parse(loginresponse.slice(1));
      
    let message = ["/trn " + this.username + ",0," + parsedbody.assertion];
    this.sendMessage("", message);

    return new Promise( (resolve, reject) => {
      resolve(parsedbody);
    });
  }

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
