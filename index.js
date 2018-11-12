const utils = require('util'),
      https = require('https'),
      fs = require('fs'),
      express = require('express'),
      Fortnite = require("fortnite-api"),
      app = express(),
      options = {  //LET'S ENCRYPT SSL
        cert: fs.readFileSync('/etc/letsencrypt/live/your_domain_name/fullchain.pem'),
        key: fs.readFileSync('/etc/letsencrypt/live/your_domain_name/privkey.pem')
};

let fortniteAPI = new Fortnite([
    "EMAIL_ACCOUNT",
    "PASSWORD",
    "CLIENT LAUNCHER TOKEN",
    "FORTNITE CLIENT TOKEN"
], {
    debug: true
});

var DefaultStatsUsername = "Tekzification.Tv", //default username
    DefaultStatsUserId = "86986ea429a1449da69b900c5bf4e633", //default userid
    DefaultStatsType = "kd", //kd top
    DefaultStatsGroup = "squad", //solo duo squad
    DefaultStatsTime = "weekly", //weekly alltime
    DefaultStatsPlatform = "pc", //pc ps4 xb1
    DefaultTwitchUsername = "TheKaotic13"; //default twitch username

var StatsUsername = DefaultStatsUsername, //default username
    StatsUserId = DefaultStatsUserId, //default userid
    StatsType = DefaultStatsType, //kd top
    StatsGroup = DefaultStatsGroup, //solo duo squad
    StatsTime = DefaultStatsTime, //weekly alltime
    StatsPlatform = DefaultStatsPlatform, //pc ps4 xb1
    TwitchUsername = DefaultTwitchUsername, //default twitch username
    SendReturn = "";

app.use(require('helmet')()); //Secure SSL with HTLS

app.get('/', function (req, res) {
    res.send('A Nightbot Fortnite API</a> by <a href="https://kaotic.fr">Kaotic</a>');
});

app.get('/get_user_id', function (req, res) {
    //Set default settings every session
    let UserName = DefaultStatsUsername,
        Platform = DefaultStatsPlatform;

    //Check if have get requests
    if(req.query.username){ UserName = req.query.username; } //If get username
    if(req.query.platform) if(req.query.platform.includes("pc") || req.query.platform.includes("ps4") || req.query.platform.includes("xb1")) { Platform = req.query.platform; } //If get platform

    fortniteAPI.login().then(() => {
        fortniteAPI.checkPlayer(UserName, Platform).then(stats => {
            res.send(stats["id"]);
        }).catch(err => {
            res.send(err);
        });
    });

    console.log(UserName + " " + Platform);
});

app.get('/api/fortnite', function (req, res) {
    //Set default settings every session
    StatsUsername = DefaultStatsUsername;
    StatsUserId = DefaultStatsUserId;
    StatsType = DefaultStatsType; //kd top
    StatsGroup = DefaultStatsGroup; //solo duo squad
    StatsTime = DefaultStatsTime; //weekly alltime
    StatsPlatform = DefaultStatsPlatform; //pc ps4 xb1
    TwitchUsername = DefaultTwitchUsername; //default twitch username
    SendReturn = "";

    //Check if have get requests
    if(req.query.username){ StatsUsername = req.query.username; } //If get username
    if(req.query.q){ StatsUsername = req.query.q; } //If get username
    if(req.query.twitchn){ TwitchUsername = req.query.twitchn; } //If get twitch username
    if(req.query.type) if(req.query.type.includes("kd")){ StatsType = "kd"; }else if(req.query.type.includes("top")){ StatsType = "top"; } //If get type
    if(req.query.group) if(req.query.group.includes("solo") || req.query.group.includes("duo") || req.query.group.includes("squad") || req.query.group.includes("lifetime")){ StatsGroup = req.query.group; } //If get group
    if(req.query.time) if(req.query.time.includes("weekly") || req.query.time.includes("alltime")) { StatsTime = req.query.time; } //If get time
    if(req.query.platform) if(req.query.platform.includes("pc") || req.query.platform.includes("ps4") || req.query.platform.includes("xb1")) { StatsPlatform = req.query.platform; } //If get platform

    //Check if token is correct and login to epic games servers.
    fortniteAPI.login().then(() => {
        //Change UserId if get request username or q(username filtered) for performances.
        if(req.query.username || req.query.q) {
            fortniteAPI.checkPlayer(StatsUsername, StatsPlatform, StatsTime).then(stats => {
                StatsUserId = stats["id"];
                GetStatsFromId(res);
            }).catch(err => {
                console.log(err);
                SendReturn = "Error with API !";
                res.send(SendReturn);
            });
        }else{
            GetStatsFromId(res);
        }

        SendReturn = StatsUsername + " " + StatsType + " " + StatsGroup + " " + StatsTime + " " + StatsPlatform;
        console.log(SendReturn);
    });
});

function GetStatsFromId(res){
    let Wins = "",
        WinsRate = "",
        Kda = "",
        Match = "",
        Kill = "";

    fortniteAPI.getStatsBRFromID(StatsUserId, StatsPlatform, StatsTime).then(stats => {
        if(StatsGroup.includes("solo") || StatsGroup.includes("duo") || StatsGroup.includes("squad")){
            Wins = stats["group"][StatsGroup]["wins"];
            WinsRate = stats["group"][StatsGroup]["win%"];
            Kda = stats["group"][StatsGroup]["k/d"];
            Match = stats["group"][StatsGroup]["matches"];
            Kill = stats["group"][StatsGroup]["kills"];
        }else{
            Wins = stats["lifetimeStats"]["wins"];
            WinsRate = stats["lifetimeStats"]["win%"];
            Kda = stats["lifetimeStats"]["k/d"];
            Match = stats["lifetimeStats"]["matches"];
            Kill = stats["lifetimeStats"]["kills"];
        }

        SendReturn = TypeToString(StatsType, Wins, WinsRate, Kda, Match, Kill);

        res.send(SendReturn); //Return data
    }).catch(err => {
        console.log(err);
        SendReturn = "Error with API !";
        res.send(SendReturn);
    });
}

function TypeToString(mode, wins, winsrate, kda, match, kill){
    let TypeReturn = "",
        TimeSt = "",
        GroupSt = "";

    if(StatsTime.includes("alltime")){
        TimeSt = "in all seasons.";
    }else{
        TimeSt = "on this season.";
    }

    if(StatsGroup.includes("solo") || StatsGroup.includes("duo") || StatsGroup.includes("squad")){
        GroupSt = StatsGroup.charAt(0).toUpperCase() + StatsGroup.slice(1);
    }else{
        GroupSt = "All mods";
    }

    if(mode.includes("kd")){
        TypeReturn = utils.format("@%s -> %s has a %s K/D and wins %s% %s (%s)", TwitchUsername, StatsUsername, kda, winsrate, TimeSt, GroupSt);
    }else{
        TypeReturn = utils.format("@%s -> %s has a %s% winrate with %s TOP 1 %s (%s)", TwitchUsername, StatsUsername, winsrate, wins, TimeSt, GroupSt);
    }

    return TypeReturn;
}

https.createServer(options, app).listen(8698, function () {
    console.log('App launched and listen on 8698 !');
});
