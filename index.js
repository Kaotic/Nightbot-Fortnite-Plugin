const https = require('https');
const fs = require('fs');
const express = require('express');
const Fortnite = require("fortnite-api");
const app = express();
const options = {  //LET'S ENCRYPT SSL
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

var DefaultStatsUsername = "Tekzification.Tv"; //default username
var DefaultStatsUserId = "86986ea429a1449da69b900c5bf4e633"; //default userid
var DefaultStatsType = "kd"; //kd top
var DefaultStatsGroup = "squad"; //solo duo squad
var DefaultStatsTime = "weekly"; //weekly alltime
var DefaultStatsPlatform = "pc"; //pc ps4 xb1
var DefaultTwitchUsername = "TheKaotic13"; //default twitch username

var StatsUsername = DefaultStatsUsername; //default username
var StatsUserId = DefaultStatsUserId; //default userid
var StatsType = DefaultStatsType; //kd top
var StatsGroup = DefaultStatsGroup; //solo duo squad
var StatsTime = DefaultStatsTime; //weekly alltime
var StatsPlatform = DefaultStatsPlatform; //pc ps4 xb1
var TwitchUsername = DefaultTwitchUsername; //default twitch username
var SendReturn = "";

app.use(require('helmet')()); //Secure SSL with HTLS

app.get('/', function (req, res) {
    res.send('A Nightbot Fortnite API</a> by <a href="https://kaotic.fr">Kaotic</a>');
});

app.get('/get_user_id', function (req, res) {
    //Set default settings every session
    let UserName = DefaultStatsUsername;
    let Platform = DefaultStatsPlatform;

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
    if(req.query.q){ StatsUsername = req.query.q; } //If get twitch username
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
                SendReturn = "Une erreur c'est produite.";
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
    let Wins = "";
    let WinsRate = "";
    let Kda = "";
    let Match = "";
    let Kill = "";

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

        if(StatsType.includes("kd")){
            SendReturn = KDToString(Wins, WinsRate, Kda, Match, Kill); //KD to string
        }else if(StatsType.includes("top")){
            SendReturn = TOPToString(Wins, WinsRate, Kda, Match, Kill); //TOP to string
        }else{
            SendReturn = KDToString(Wins, WinsRate, Kda, Match, Kill); //KD to string
        }

        res.send(SendReturn); //Return data
    }).catch(err => {
        console.log(err);
        SendReturn = "Une erreur c'est produite.";
        res.send(SendReturn);
    });
}

function KDToString(wins, winsrate, kda, match, kill){
    let KdSt = "";
    let TimeSt = "";
    let GroupSt = "";

    if(StatsTime.includes("alltime")){
        TimeSt = "sur toutes les saisons.";
    }else{
        TimeSt = "sur cette saison.";
    }

    if(StatsGroup.includes("solo") || StatsGroup.includes("duo") || StatsGroup.includes("squad")){
        GroupSt = StatsGroup.charAt(0).toUpperCase() + StatsGroup.slice(1);
    }else{
        GroupSt = "Tous les modes";
    }

    KdSt = "@"+TwitchUsername + " -> " + StatsUsername + " a " + kda + " de KD et gagne a " + winsrate + "% " + TimeSt + " ("+GroupSt+")";

    return KdSt;
}

function TOPToString(wins, winsrate, kda, match, kill){
    let TopSt = "";
    let TimeSt = "";
    let GroupSt = "";

    if(StatsTime.includes("alltime")){
        TimeSt = "sur toutes les saisons.";
    }else{
        TimeSt = "sur cette saison.";
    }

    if(StatsGroup.includes("solo") || StatsGroup.includes("duo") || StatsGroup.includes("squad")){
        GroupSt = StatsGroup.charAt(0).toUpperCase() + StatsGroup.slice(1);
    }else{
        GroupSt = "Tous les modes";
    }

    TopSt = "@"+TwitchUsername + " -> " + StatsUsername + " gagne a " + winsrate + "% avec " + wins + " TOP 1 " + TimeSt + " ("+GroupSt+")";

    return TopSt;
}

https.createServer(options, app).listen(8698, function () {
    console.log('App launched and listen on 8698 !');
});
