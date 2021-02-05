var early_key = {
  'hoh': [5, 0, 4, 1, 0, 2, 2, 9, 3, 5, 9, 7, 3, 3, 5, 1],
  'nom': [1, 5, 4, 7, 2, 2, 4, 2, 6, 8, 4, 2, 2, 3, 1, 1],
  'nothing': [15, 16, 13, 13, 19, 17, 15, 10, 12, 7, 6, 6, 5, 2, 0, 0],
  'veto': [1, 0, 0, 2, 1, 1, 1, 0, 2, 1, 0, 0, 1, 0, 0, 0]
}
var late_key = {
  'hoh': [0, 1, 2, 0, 1, 2, 5, 1, 2, 3, 1, 8, 5, 6, 7, 15],
  'nom': [1, 1, 1, 0, 1, 4, 3, 5, 4, 5, 1, 2, 2, 8, 10, 6],
  'nothing': [1, 4, 5, 10, 13, 13, 12, 15, 15, 13, 19, 11, 14, 7, 4, 0],
  'veto': [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 2, 1, 1, 0]
}

var seasons = [];
var players = [];
var numSeasons = 21;
var season;
var reign;

function Season(num, hohs, lategame) {
  this.winner = "";
  this.reigns = [];
  this.juryFor;
  this.juryAgainst;
  this.number = num;
  this.hohs = hohs;
  this.lategame = lategame;
}

function Reign(num, season) {
  this.players = [];
  this.number = num;
  this.season = season;
}

function Player(name, inp) {
  this.name = name;
  this.hoh = false;
  this.veto_used = false;
  this.veto_unused = false;
  this.nominated = false;
  this.nothing = true;
  this.evicted = false;
  this.votes = parseInt(0, 10);
  this.points = parseInt(0, 10);
  this.total_points = parseInt(0, 10);
  this.average_percent = parseInt(0, 10);
  this.running_percent = parseInt(0, 10);
  this.place = parseInt(100, 10);
  this.in = inp;
}

function getPlayer(name, reign) {
  for (var i = 0; i < reign.players.length; i++) {
    if (reign.players[i].name === name) {
      return reign.players[i];
    }
  }
}

function hoh(name, reign) {
  var player = getPlayer(name, reign);
  player.hoh = true;
  player.nothing = false;
  player.evicted = false;
}

function nom(name, reign) {
  var player = getPlayer(name, reign);
  player.nominated = true;
  player.nothing = false;
  player.votes = -1;
}

function veto(name, used, reign) {
  var player = getPlayer(name, reign);
  if (used) {
    player.veto_used = true;
    player.nothing = false;
  }
  else {
    player.veto_unused = true;
  }
}

function vote(name, votes, reign) {
  var player = getPlayer(name, reign);
  player.votes = votes;
}

function evict(name, reign) {
  var player = getPlayer(name, reign);
  player.evicted = true;
}

function reenter(name, reign) {
  var player = getPlayer(name, reign);
  player.evicted = false;
}

function calculate(reign) {
  /* Calculate reign points */
  for (var i = 0; i < reign.players.length; i++) {
    if (!reign.players[i].evicted) {
    /* Early Game */
    if (reign.number < reign.season.lategame) {
      if (reign.players[i].hoh) {
        reign.players[i].points += early_key.hoh[reign.number-1];
      }
      if (reign.players[i].nominated) {
        reign.players[i].points += early_key.nom[reign.number-1];
      }
      if (reign.players[i].nothing) {
        reign.players[i].points += early_key.nothing[reign.number-1];
      }
      if (reign.players[i].veto_used) {
        reign.players[i].points += early_key.veto[reign.number-1];
      }
    }
    /* Late Game */
    else {
      if (reign.players[i].hoh) {
        reign.players[i].points += late_key.hoh[15-(reign.season.hohs-reign.number)];
      }
      if (reign.players[i].nominated) {
        reign.players[i].points += late_key.nom[15-(reign.season.hohs-reign.number)];
      }
      if (reign.players[i].nothing) {
        reign.players[i].points += late_key.nothing[15-(reign.season.hohs-reign.number)];
      }
      if (reign.players[i].veto_used) {
        reign.players[i].points += late_key.veto[15-(reign.season.hohs-reign.number)];
      }
    }

    reign.players[i].total_points += reign.players[i].points;
    reign.players[i].average_percent = reign.players[i].total_points/(reign.number*numSeasons);
    if (reign.number > 1) {
      reign.players[i].running_percent = reign.players[i].running_percent * (reign.players[i].points/numSeasons);
    }
    else {
      reign.players[i].running_percent = reign.players[i].average_percent;
    }

    calculatePlace(reign);
  }
  }
}

function calculatePlace(reign) {
  var tmp_players = [];
  for (var i = 0; i < reign.players.length; i++) {
    if (!reign.players[i].evicted) {
      tmp_players.push(reign.players[i]);
    }
  }
  tmp_players.sort((a, b) => {
    return b.total_points - a.total_points;
  });

  var cur_place = 1;
  var cur_points = tmp_players[0].total_points
  for (i = 0; i < tmp_players.length; i++) {
    if (tmp_players[i].total_points === cur_points) {
      tmp_players[i].place = cur_place;
    }
    else {
      cur_place = i+1;
      cur_points = tmp_players[i].total_points;
      tmp_players[i].place = cur_place;
    }
  }

  reign.players.sort((a, b) => {
    return b.total_points - a.total_points;
  });
}

function copyPlayers(reign) {
  var copied = [];
  var tmp;
  for (var i = 0; i < reign.players.length; i++) {
    tmp = new Player(reign.players[i].name, reign.players[i].in);
    tmp.total_points = reign.players[i].total_points;
    tmp.evicted = reign.players[i].evicted;
    tmp.average_percent = reign.players[i].average_percent;
    tmp.running_percent = reign.players[i].running_percent;
    tmp.place = parseInt(0, 10);
    copied.push(tmp);
  }
  return copied;
}

function makePlayerArr() {
  for (var i = 0; i < seasons.length; i++) {
    var s = seasons[i];
    for (var j = 0; j < s.reigns[0].players.length; j++) {
      var tmp = {
        "name": "",
        "season": s.number,
        "place": parseInt(0, 10),
        "comps": parseInt(0, 10),
        "hoh": parseInt(0, 10),
        "nom": parseInt(0, 10),
        "veto": parseInt(0, 10),
        "veto_used": parseInt(0, 10),
        "veto_unused": parseInt(0, 10),
        "votes": parseInt(0, 10)
      }
      var player_name = s.reigns[0].players[j].name;
      tmp.name = player_name;
      tmp.place = s.reigns[0].players[j].in;
      for (var k = 0; k < s.reigns.length; k++) {
        for (var l = 0; l < s.reigns[k].players.length; l++) {
          if (s.reigns[k].players[l].name === player_name) {
            if (s.reigns[k].players[l].evicted) {
              if (s.reigns[k-1] && getPlayer(s.reigns[k].players[l].name, s.reigns[k-1]).evicted) {
                break;
              }
            }
              var p = s.reigns[k].players[l];
              if (p.hoh) {
                tmp.comps+=1;
                tmp.hoh+=1;
              }
              if (p.nominated) {
                tmp.nom+=1;
              }
              if (p.veto_used) {
                tmp.comps+=1;
                tmp.veto+=1;
                tmp.veto_used+=1;
              }
              if (p.veto_unused) {
                tmp.comps+=1;
                tmp.veto+=1;
                tmp.veto_unused+=1;
              }
              if (p.votes > 0) {
                tmp.votes+=p.votes;
              }
          }
        }
      }
      players.push(tmp);
    }
  }
}

/* Season 2 */
{
season = new Season(2, 9, 6);
reign = new Reign(1, season);
reign.players.push(new Player("Will", 1));
reign.players.push(new Player("Nicole", 2));
reign.players.push(new Player("Monica", 3));
reign.players.push(new Player("Hardy", 4));
reign.players.push(new Player("Bunky", 5));
reign.players.push(new Player("Krista", 6));
reign.players.push(new Player("Kent", 7));
reign.players.push(new Player("Mike", 8));
reign.players.push(new Player("Shannon", 9));
reign.players.push(new Player("Autumn", 10));
reign.players.push(new Player("Sheryl", 11));
reign.players.push(new Player("Justin", 12));

// Reign 1

evict("Justin", reign);
hoh("Mike", reign);
nom("Nicole", reign);
nom("Sheryl", reign);
vote("Sheryl", 5, reign);
vote("Nicole", 3, reign);
evict("Sheryl", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 2

reign = new Reign(2, season);
reign.players = copyPlayers(season.reigns[0]);

hoh("Krista", reign);
nom("Autumn", reign);
nom("Kent", reign);
vote("Autumn", 7, reign);
vote("Kent", 0, reign);
evict("Autumn", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 3

reign = new Reign(3, season);
reign.players = copyPlayers(season.reigns[1]);

hoh("Hardy", reign);
nom("Shannon", reign);
nom("Will", reign);
vote("Shannon", 6, reign);
vote("Will", 0, reign);
evict("Shannon", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 4

reign = new Reign(4, season);
reign.players = copyPlayers(season.reigns[2]);

hoh("Kent", reign);
nom("Krista", reign);
nom("Mike", reign);
vote("Mike", 4, reign);
vote("Krista", 1, reign);
evict("Mike", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 5

reign = new Reign(5, season);
reign.players = copyPlayers(season.reigns[3]);

hoh("Hardy", reign);
nom("Kent", reign);
nom("Will", reign);
vote("Kent", 4, reign);
vote("Will", 0, reign);
evict("Kent", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 6

reign = new Reign(6, season);
reign.players = copyPlayers(season.reigns[4]);

hoh("Nicole", reign);
nom("Krista", reign);
nom("Monica", reign);
vote("Krista", 3, reign);
vote("Monica", 0, reign);
evict("Krista", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 7

reign = new Reign(7, season);
reign.players = copyPlayers(season.reigns[5]);

hoh("Hardy", reign);
nom("Bunky", reign);
nom("Will", reign);
vote("Bunky", 2, reign);
vote("Will", 1, reign);
evict("Bunky", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 8

reign = new Reign(8, season);
reign.players = copyPlayers(season.reigns[6]);

hoh("Monica", reign);
nom("Hardy", reign);
nom("Nicole", reign);
vote("Hardy", 1, reign);
vote("Nicole", 0, reign);
evict("Hardy", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 9

reign = new Reign(9, season);
reign.players = copyPlayers(season.reigns[7]);

hoh("Nicole", reign);
nom("Monica", reign);
nom("Will", reign);
vote("Monica", 1, reign);
vote("Will", 0, reign);
evict("Monica", reign);

calculate(reign);
season.reigns.push(reign);

//Finale

season.winner = "Will";
season.juryFor = 5;
season.juryAgainst = 2;

seasons.push(season);
}

/* Season 3 */
{
season = new Season(3, 11, 7);
reign = new Reign(1, season);
reign.players.push(new Player("Lisa", 1));
reign.players.push(new Player("Danielle", 2));
reign.players.push(new Player("Jason", 3));
reign.players.push(new Player("Amy", 4));
reign.players.push(new Player("Marcellas", 5));
reign.players.push(new Player("Roddy", 6));
reign.players.push(new Player("Gerry", 7));
reign.players.push(new Player("Chiara", 8));
reign.players.push(new Player("Josh", 9));
reign.players.push(new Player("Eric", 10));
reign.players.push(new Player("Tonya", 11));
reign.players.push(new Player("Lori", 12));

// Reign 1

hoh("Lisa", reign);
nom("Lori", reign);
nom("Marcellas", reign);
veto("Gerry", true, reign);
nom("Amy", reign);
vote("Lori", 5, reign);
vote("Amy", 4, reign);
evict("Lori", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 2

reign = new Reign(2, season);
reign.players = copyPlayers(season.reigns[0]);

hoh("Marcellas", reign);
nom("Josh", reign);
nom("Tonya", reign);
veto("Danielle", false, reign);
vote("Tonya", 5, reign);
vote("Josh", 3, reign);
evict("Tonya", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 3

reign = new Reign(3, season);
reign.players = copyPlayers(season.reigns[1]);

hoh("Roddy", reign);
nom("Amy", reign);
nom("Marcellas", reign);
veto("Eric", false, reign);
vote("Amy", 7, reign);
vote("Marcellas", 0, reign);
evict("Amy", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 4

reign = new Reign(4, season);
reign.players = copyPlayers(season.reigns[2]);

hoh("Gerry", reign);
nom("Eric", reign);
nom("Lisa", reign);
veto("Chiara", false, reign);
vote("Eric", 4, reign);
vote("Lisa", 3, reign);
evict("Eric", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 5

reign = new Reign(5, season);
reign.players = copyPlayers(season.reigns[3]);

hoh("Chiara", reign);
nom("Josh", reign);
nom("Roddy", reign);
veto("Lisa", false, reign);
vote("Josh", 5, reign);
vote("Roddy", 0, reign);
evict("Josh", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 6

reign = new Reign(6, season);
reign.players = copyPlayers(season.reigns[4]);

reenter("Amy", reign);
hoh("Amy", reign);
nom("Chiara", reign);
nom("Roddy", reign);
veto("Gerry", false, reign);
vote("Chiara", 4, reign);
vote("Roddy", 1, reign);
evict("Chiara", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 7

reign = new Reign(7, season);
reign.players = copyPlayers(season.reigns[5]);

hoh("Jason", reign);
nom("Amy", reign);
nom("Gerry", reign);
veto("Jason", false, reign);
vote("Gerry", 4, reign);
vote("Amy", 0, reign);
evict("Gerry", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 8

reign = new Reign(8, season);
reign.players = copyPlayers(season.reigns[6]);

hoh("Marcellas", reign);
nom("Amy", reign);
nom("Roddy", reign);
veto("Amy", false, reign);
vote("Roddy", 3, reign);
vote("Amy", 0, reign);
evict("Roddy", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 9

reign = new Reign(9, season);
reign.players = copyPlayers(season.reigns[7]);

hoh("Jason", reign);
nom("Amy", reign);
nom("Marcellas", reign);
veto("Marcellas", false, reign);
vote("Marcellas", 2, reign);
vote("Amy", 1, reign);
evict("Marcellas", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 10

reign = new Reign(10, season);
reign.players = copyPlayers(season.reigns[8]);

hoh("Danielle", reign);
nom("Amy", reign);
nom("Lisa", reign);
vote("Lisa", 0, reign);
vote("Amy", 1, reign);
evict("Amy", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 11

reign = new Reign(11, season);
reign.players = copyPlayers(season.reigns[9]);

hoh("Lisa", reign);
nom("Danielle", reign);
nom("Jason", reign);
vote("Danielle", 0, reign);
vote("Jason", 1, reign);
evict("Jason", reign);

calculate(reign);
season.reigns.push(reign);

//Finale

season.winner = "Lisa";
season.juryFor = 9;
season.juryAgainst = 1;

seasons.push(season);
}

/* Season 4 */
{
season = new Season(4, 10, 6);
reign = new Reign(1, season);
reign.players.push(new Player("Jun", 1));
reign.players.push(new Player("Alison", 2));
reign.players.push(new Player("Robert", 3));
reign.players.push(new Player("Erika", 4));
reign.players.push(new Player("Jee", 5));
reign.players.push(new Player("Jack", 6));
reign.players.push(new Player("Justin", 7));
reign.players.push(new Player("Nathan", 8));
reign.players.push(new Player("Dana", 9));
reign.players.push(new Player("David", 10));
reign.players.push(new Player("Michelle", 11));
reign.players.push(new Player("Amanda", 12));
reign.players.push(new Player("Scott", 13));

// Reign 1

evict("Scott", reign);
hoh("Nathan", reign);
nom("Amanda", reign);
nom("Jee", reign);
veto("Dana", false, reign);
vote("Amanda", 9, reign);
vote("Jee", 0, reign);
evict("Amanda", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 2

reign = new Reign(2, season);
reign.players = copyPlayers(season.reigns[0]);

hoh("Jee", reign);
nom("Erika", reign);
nom("Michelle", reign);
veto("David", false, reign);
vote("Erika", 2, reign);
vote("Michelle", 6, reign);
evict("Michelle", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 3

reign = new Reign(3, season);
reign.players = copyPlayers(season.reigns[1]);

hoh("Dana", reign);
nom("Alison", reign);
nom("Jack", reign);
veto("Nathan", true, reign);
nom("David", reign);
vote("Jack", 2, reign);
vote("David", 5, reign);
evict("David", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 4

reign = new Reign(4, season);
reign.players = copyPlayers(season.reigns[2]);

hoh("Alison", reign);
nom("Dana", reign);
nom("Jun", reign);
veto("Robert", false, reign);
vote("Dana", 6, reign);
vote("Jun", 0, reign);
evict("Dana", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 5

reign = new Reign(5, season);
reign.players = copyPlayers(season.reigns[3]);

hoh("Justin", reign);
nom("Jack", reign);
nom("Nathan", reign);
veto("Robert", false, reign);
vote("Jack", 0, reign);
vote("Nathan", 5, reign);
evict("Nathan", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 6

reign = new Reign(6, season);
reign.players = copyPlayers(season.reigns[4]);

hoh("Erika", reign);
nom("Justin", reign);
nom("Robert", reign);
veto("Jun", false, reign);
vote("Justin", 3, reign);
vote("Robert", 1, reign);
evict("Justin", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 7

reign = new Reign(7, season);
reign.players = copyPlayers(season.reigns[5]);

hoh("Jee", reign);
nom("Erika", reign);
nom("Jack", reign);
veto("Jee", false, reign);
vote("Erika", 1, reign);
vote("Jack", 2, reign);
evict("Jack", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 8

reign = new Reign(8, season);
reign.players = copyPlayers(season.reigns[6]);

hoh("Jun", reign);
nom("Alison", reign);
nom("Jee", reign);
veto("Alison", true, reign);
nom("Robert", reign);
vote("Robert", 0, reign);
vote("Jee", 2, reign);
evict("Jee", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 9

reign = new Reign(9, season);
reign.players = copyPlayers(season.reigns[7]);

hoh("Robert", reign);
nom("Alison", reign);
nom("Jun", reign);
veto("Alison", true, reign);
nom("Erika", reign);
vote("Erika", 1, reign);
vote("Jun", 0, reign);
evict("Erika", reign);

calculate(reign);
season.reigns.push(reign);

//Reign 10

reign = new Reign(10, season);
reign.players = copyPlayers(season.reigns[8]);

hoh("Alison", reign);
nom("Jun", reign);
nom("Robert", reign);
vote("Robert", 1, reign);
vote("Jun", 0, reign);
evict("Robert", reign);

calculate(reign);
season.reigns.push(reign);

//Finale

season.winner = "Jun";
season.juryFor = 6;
season.juryAgainst = 1;

seasons.push(season);
}

/* Season 5 */
{
  season = new Season(5, 12, 7);
  reign = new Reign(1, season);
  reign.players.push(new Player("Drew", 1));
  reign.players.push(new Player("Michael", 2));
  reign.players.push(new Player("Diane", 3));
  reign.players.push(new Player("Nakomis", 4));
  reign.players.push(new Player("Karen", 5));
  reign.players.push(new Player("Marvin", 6));
  reign.players.push(new Player("Adria", 7));
  reign.players.push(new Player("Natalie", 8));
  reign.players.push(new Player("Will", 9));
  reign.players.push(new Player("Jase", 10));
  reign.players.push(new Player("Scott", 11));
  reign.players.push(new Player("Holly", 12));
  reign.players.push(new Player("Lori", 13));
  reign.players.push(new Player("Mike", 14));

  // Reign 1

  hoh("Jase", reign);
  nom("Mike", reign);
  nom("Nakomis", reign);
  veto("Scott", false, reign);
  vote("Mike", 10, reign);
  vote("Nakomis", 0, reign);
  evict("Mike", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 2

  reign = new Reign(2, season);
  reign.players = copyPlayers(season.reigns[0]);

  hoh("Marvin", reign);
  nom("Holly", reign);
  nom("Lori", reign);
  veto("Jase", true, reign);
  nom("Karen", reign)
  vote("Lori", 7, reign);
  vote("Karen", 2, reign);
  evict("Lori", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 3

  reign = new Reign(3, season);
  reign.players = copyPlayers(season.reigns[1]);

  hoh("Drew", reign);
  nom("Holly", reign);
  nom("Nakomis", reign);
  veto("Nakomis", true, reign);
  nom("Adria", reign);
  vote("Holly", 7, reign);
  vote("Adria", 1, reign);
  evict("Holly", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 4

  reign = new Reign(4, season);
  reign.players = copyPlayers(season.reigns[2]);

  hoh("Diane", reign);
  nom("Jase", reign);
  nom("Scott", reign);
  veto("Jase", true, reign);
  nom("Marvin", reign);
  vote("Scott", 4, reign);
  vote("Marvin", 3, reign);
  evict("Scott", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 5

  reign = new Reign(5, season);
  reign.players = copyPlayers(season.reigns[3]);

  hoh("Nakomis", reign);
  nom("Diane", reign);
  nom("Marvin", reign);
  veto("Drew", true, reign);
  nom("Jase", reign);
  vote("Jase", 6, reign);
  vote("Marvin", 1, reign);
  evict("Jase", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 6

  reign = new Reign(6, season);
  reign.players = copyPlayers(season.reigns[4]);

  hoh("Adria", reign);
  nom("Marvin", reign);
  nom("Will", reign);
  veto("Adria", false, reign);
  vote("Will", 4, reign);
  vote("Marvin", 3, reign);
  evict("Will", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 7

  reign = new Reign(7, season);
  reign.players = copyPlayers(season.reigns[5]);

  hoh("Nakomis", reign);
  nom("Adria", reign);
  nom("Natalie", reign);
  veto("Adria", true, reign);
  nom("Michael", reign);
  vote("Natalie", 4, reign);
  vote("Michael", 1, reign);
  evict("Natalie", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 8

  reign = new Reign(8, season);
  reign.players = copyPlayers(season.reigns[6]);

  hoh("Marvin", reign);
  nom("Adria", reign);
  nom("Michael", reign);
  veto("Karen", false, reign);
  vote("Adria", 4, reign);
  vote("Michael", 0, reign);
  evict("Adria", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 9

  reign = new Reign(9, season);
  reign.players = copyPlayers(season.reigns[7]);

  hoh("Drew", reign);
  nom("Diane", reign);
  nom("Marvin", reign);
  veto("Diane", true, reign);
  nom("Nakomis", reign);
  vote("Marvin", 3, reign);
  vote("Nakomis", 0, reign);
  evict("Marvin", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 10

  reign = new Reign(10, season);
  reign.players = copyPlayers(season.reigns[8]);

  hoh("Nakomis", reign);
  nom("Drew", reign);
  nom("Michael", reign);
  veto("Diane", true, reign);
  nom("Karen", reign);
  vote("Karen", 2, reign);
  vote("Michael", 0, reign);
  evict("Karen", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 11

  reign = new Reign(11, season);
  reign.players = copyPlayers(season.reigns[9]);

  hoh("Drew", reign);
  nom("Diane", reign);
  nom("Nakomis", reign);
  veto("Michael", true, reign);
  evict("Nakomis", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 12

  reign = new Reign(12, season);
  reign.players = copyPlayers(season.reigns[10]);

  hoh("Drew", reign);
  nom("Diane", reign);
  nom("Michael", reign);
  vote("Diane", 1, reign);
  vote("Michael", 0, reign);
  evict("Diane", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Finale

  season.winner = "Drew";
  season.juryFor = 4;
  season.juryAgainst = 3;

  seasons.push(season);
}

/* Season 6 */
{
  season = new Season(6, 13, 8);
  reign = new Reign(1, season);
  reign.players.push(new Player("Maggie", 1));
  reign.players.push(new Player("Ivette", 2));
  reign.players.push(new Player("Janelle", 3));
  reign.players.push(new Player("April", 4));
  reign.players.push(new Player("Howie", 5));
  reign.players.push(new Player("Beau", 6));
  reign.players.push(new Player("James", 7));
  reign.players.push(new Player("Rachel", 8));
  reign.players.push(new Player("Jennifer", 9));
  reign.players.push(new Player("Kaysar", 10));
  reign.players.push(new Player("Sarah", 11));
  reign.players.push(new Player("Eric", 12));
  reign.players.push(new Player("Michael", 13));
  reign.players.push(new Player("Ashlea", 14));

  // Reign 1

  hoh("Rachel", reign);
  nom("Ashlea", reign);
  nom("Kaysar", reign);
  veto("Rachel", false, reign);
  vote("Ashlea", 9, reign);
  vote("Kaysar", 2, reign);
  evict("Ashlea", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 2

  reign = new Reign(2, season);
  reign.players = copyPlayers(season.reigns[0]);

  hoh("Eric", reign);
  nom("Janelle", reign);
  nom("Michael", reign);
  veto("James", false, reign);
  vote("Janelle", 1, reign);
  vote("Michael", 9, reign);
  evict("Michael", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 3

  reign = new Reign(3, season);
  reign.players = copyPlayers(season.reigns[1]);

  hoh("Kaysar", reign);
  nom("James", reign);
  nom("Maggie", reign);
  veto("James", true, reign);
  nom("Eric", reign);
  vote("Eric", 5, reign);
  vote("Maggie", 4, reign);
  evict("Eric", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 4

  reign = new Reign(4, season);
  reign.players = copyPlayers(season.reigns[2]);

  hoh("Maggie", reign);
  nom("James", reign);
  nom("Kaysar", reign);
  veto("Sarah", true, reign);
  nom("Janelle", reign);
  vote("Kaysar", 7, reign);
  vote("Janelle", 1, reign);
  evict("Kaysar", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 5

  reign = new Reign(5, season);
  reign.players = copyPlayers(season.reigns[3]);

  hoh("Howie", reign);
  nom("James", reign);
  nom("Sarah", reign);
  veto("James", true, reign);
  nom("Ivette", reign);
  vote("Sarah", 6, reign);
  vote("Ivette", 1, reign);
  evict("Sarah", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 6

  reign = new Reign(6, season);
  reign.players = copyPlayers(season.reigns[4]);

  reenter("Kaysar", reign);
  hoh("Jennifer", reign);
  nom("Janelle", reign);
  nom("Rachel", reign);
  veto("Rachel", true, reign);
  nom("Kaysar", reign);
  vote("Kaysar", 7, reign);
  vote("Janelle", 0, reign);
  evict("Kaysar", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 7

  reign = new Reign(7, season);
  reign.players = copyPlayers(season.reigns[5]);

  hoh("Janelle", reign);
  nom("Jennifer", reign);
  nom("Maggie", reign);
  veto("Janelle", true, reign);
  nom("Ivette", reign);
  vote("Jennifer", 5, reign);
  vote("Ivette", 1, reign);
  evict("Jennifer", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 8

  reign = new Reign(8, season);
  reign.players = copyPlayers(season.reigns[6]);

  hoh("Beau", reign);
  nom("Howie", reign);
  nom("Rachel", reign);
  veto("James", false, reign);
  vote("Rachel", 5, reign);
  vote("Howie", 0, reign);
  evict("Rachel", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 9

  reign = new Reign(9, season);
  reign.players = copyPlayers(season.reigns[7]);

  hoh("April", reign);
  nom("Howie", reign);
  nom("Janelle", reign);
  veto("April", true, reign);
  nom("James", reign);
  vote("James", 4, reign);
  vote("Howie", 0, reign);
  evict("James", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 10

  reign = new Reign(10, season);
  reign.players = copyPlayers(season.reigns[8]);

  hoh("Howie", reign);
  nom("Beau", reign);
  nom("Ivette", reign);
  veto("Maggie", false, reign);
  vote("Beau", 3, reign);
  vote("Ivette", 0, reign);
  evict("Beau", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 11

  reign = new Reign(11, season);
  reign.players = copyPlayers(season.reigns[9]);

  hoh("Ivette", reign);
  nom("Howie", reign);
  nom("Janelle", reign);
  veto("Janelle", true, reign);
  nom("April", reign);
  vote("Howie", 2, reign);
  vote("April", 1, reign);
  evict("Howie", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 12

  reign = new Reign(12, season);
  reign.players = copyPlayers(season.reigns[10]);

  hoh("Janelle", reign);
  nom("Ivette", reign);
  nom("Maggie", reign);
  veto("Ivette", true, reign);
  nom("April", reign);
  vote("April", 1, reign);
  vote("Maggie", 0, reign);
  evict("April", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 13

  reign = new Reign(13, season);
  reign.players = copyPlayers(season.reigns[11]);

  hoh("Ivette", reign);
  nom("Janelle", reign);
  nom("Maggie", reign);
  vote("Janelle", 1, reign);
  vote("Maggie", 0, reign);
  evict("Janelle", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Finale

  season.winner = "Maggie";
  season.juryFor = 4;
  season.juryAgainst = 3;

  seasons.push(season);
}

/* Season 7 */
{
  season = new Season(7, 12, 7);
  reign = new Reign(1, season);
  reign.players.push(new Player("Mike", 1));
  reign.players.push(new Player("Erika", 2));
  reign.players.push(new Player("Janelle", 3));
  reign.players.push(new Player("Will", 4));
  reign.players.push(new Player("George", 5));
  reign.players.push(new Player("Danielle", 6));
  reign.players.push(new Player("James", 7));
  reign.players.push(new Player("Howie", 8));
  reign.players.push(new Player("Marcellas", 9));
  reign.players.push(new Player("Kaysar", 10));
  reign.players.push(new Player("Diane", 11));
  reign.players.push(new Player("Jase", 12));
  reign.players.push(new Player("Nakomis", 13));
  reign.players.push(new Player("Allison", 14));

  // Reign 1

  hoh("Janelle", reign);
  hoh("Jase", reign);
  nom("Allison", reign);
  nom("Danielle", reign);
  veto("Janelle", false, reign);
  vote("Allison", 8, reign);
  vote("Danielle", 2, reign);
  evict("Allison", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 2

  reign = new Reign(2, season);
  reign.players = copyPlayers(season.reigns[0]);

  hoh("Kaysar", reign);
  nom("Diane", reign);
  nom("Nakomis", reign);
  veto("Erika", false, reign);
  vote("Diane", 2, reign);
  vote("Nakomis", 8, reign);
  evict("Nakomis", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 3

  reign = new Reign(3, season);
  reign.players = copyPlayers(season.reigns[1]);

  hoh("James", reign);
  nom("George", reign);
  nom("Will", reign);
  veto("George", true, reign);
  nom("Jase", reign);
  vote("Jase", 9, reign);
  vote("Will", 0, reign);
  evict("Jase", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 4

  reign = new Reign(4, season);
  reign.players = copyPlayers(season.reigns[2]);

  hoh("Janelle", reign);
  nom("Erika", reign);
  nom("Mike", reign);
  veto("Mike", true, reign);
  nom("Diane", reign);
  vote("Diane", 7, reign);
  vote("Erika", 1, reign);
  evict("Diane", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 5

  reign = new Reign(5, season);
  reign.players = copyPlayers(season.reigns[3]);

  hoh("Danielle", reign);
  nom("James", reign);
  nom("Janelle", reign);
  veto("Janelle", true, reign);
  nom("Kaysar", reign);
  vote("Kaysar", 5, reign);
  vote("James", 1, reign);
  evict("Kaysar", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 6

  reign = new Reign(6, season);
  reign.players = copyPlayers(season.reigns[4]);

  hoh("Janelle", reign);
  nom("Danielle", reign);
  nom("Erika", reign);
  veto("Danielle", true, reign);
  nom("Marcellas", reign);
  vote("Marcellas", 6, reign);
  vote("Janelle", 0, reign);
  evict("Marcellas", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 7

  reign = new Reign(7, season);
  reign.players = copyPlayers(season.reigns[5]);

  hoh("George", reign);
  nom("Erika", reign);
  nom("James", reign);
  veto("James", true, reign);
  nom("Howie", reign);
  vote("Howie", 3, reign);
  vote("Erika", 2, reign);
  evict("Howie", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 8

  reign = new Reign(8, season);
  reign.players = copyPlayers(season.reigns[6]);

  hoh("Mike", reign);
  nom("James", reign);
  nom("Janelle", reign);
  veto("Janelle", true, reign);
  nom("George", reign);
  vote("James", 3, reign);
  vote("George", 1, reign);
  evict("James", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 9

  reign = new Reign(9, season);
  reign.players = copyPlayers(season.reigns[7]);

  hoh("Erika", reign);
  nom("George", reign);
  nom("Janelle", reign);
  veto("Janelle", true, reign);
  nom("Danielle", reign);
  vote("Danielle", 3, reign);
  vote("George", 0, reign);
  evict("Danielle", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 10

  reign = new Reign(10, season);
  reign.players = copyPlayers(season.reigns[8]);

  hoh("Janelle", reign);
  nom("Erika", reign);
  nom("George", reign);
  veto("Erika", true, reign);
  nom("Mike", reign);
  vote("George", 2, reign);
  vote("Mike", 0, reign);
  evict("George", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 11

  reign = new Reign(11, season);
  reign.players = copyPlayers(season.reigns[9]);

  hoh("Mike", reign);
  nom("Erika", reign);
  nom("Janelle", reign);
  veto("Janelle", true, reign);
  nom("Will", reign);
  vote("Will", 1, reign);
  vote("Erika", 0, reign);
  evict("Will", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 12

  reign = new Reign(12, season);
  reign.players = copyPlayers(season.reigns[10]);

  hoh("Mike", reign);
  nom("Erika", reign);
  nom("Janelle", reign);
  vote("Erika", 0, reign);
  vote("Janelle", 1, reign);
  evict("Janelle", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Finale

  season.winner = "Mike";
  season.juryFor = 6;
  season.juryAgainst = 1;

  seasons.push(season);
}

/* Season 8 */
{
  season = new Season(8, 12, 7);
  reign = new Reign(1, season);
  reign.players.push(new Player("Dick", 1));
  reign.players.push(new Player("Daniele", 2));
  reign.players.push(new Player("Zach", 3));
  reign.players.push(new Player("Jameka", 4));
  reign.players.push(new Player("Eric", 5));
  reign.players.push(new Player("Jessica", 6));
  reign.players.push(new Player("Amber", 7));
  reign.players.push(new Player("Jen", 8));
  reign.players.push(new Player("Dustin", 9));
  reign.players.push(new Player("Kail", 10));
  reign.players.push(new Player("Nick", 11));
  reign.players.push(new Player("Mike", 12));
  reign.players.push(new Player("Joe", 13));
  reign.players.push(new Player("Carol", 14));

  // Reign 1

  hoh("Kail", reign);
  nom("Carol", reign);
  nom("Amber", reign);
  veto("Daniele", false, reign);
  vote("Carol", 10, reign);
  vote("Amber", 1, reign);
  evict("Carol", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 2

  reign = new Reign(2, season);
  reign.players = copyPlayers(season.reigns[0]);

  hoh("Jen", reign);
  nom("Daniele", reign);
  nom("Dick", reign);
  veto("Daniele", true, reign);
  nom("Joe", reign)
  vote("Joe", 9, reign);
  vote("Dick", 1, reign);
  evict("Joe", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 3

  reign = new Reign(3, season);
  reign.players = copyPlayers(season.reigns[1]);

  hoh("Dick", reign);
  nom("Jen", reign);
  nom("Kail", reign);
  veto("Jen", true, reign);
  nom("Mike", reign);
  vote("Mike", 7, reign);
  vote("Kail", 2, reign);
  evict("Mike", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 4

  reign = new Reign(4, season);
  reign.players = copyPlayers(season.reigns[2]);

  hoh("Dustin", reign);
  nom("Jen", reign);
  nom("Kail", reign);
  veto("Jameka", true, reign);
  nom("Nick", reign);
  vote("Nick", 6, reign);
  vote("Kail", 2, reign);
  evict("Nick", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 5

  reign = new Reign(5, season);
  reign.players = copyPlayers(season.reigns[3]);

  hoh("Daniele", reign);
  nom("Jen", reign);
  nom("Kail", reign);
  veto("Jen", true, reign);
  nom("Eric", reign);
  vote("Kail", 4, reign);
  vote("Eric", 3, reign);
  evict("Kail", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 6

  reign = new Reign(6, season);
  reign.players = copyPlayers(season.reigns[4]);

  hoh("Jessica", reign);
  nom("Dick", reign);
  nom("Daniele", reign);
  veto("Dick", true, reign);
  nom("Dustin", reign);
  vote("Dustin", 4, reign);
  vote("Dick", 2, reign);
  evict("Dustin", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 7

  reign = new Reign(7, season);
  reign.players = copyPlayers(season.reigns[5]);

  hoh("Daniele", reign);
  nom("Amber", reign);
  nom("Jameka", reign);
  veto("Daniele", true, reign);
  nom("Jen", reign);
  vote("Jen", 6, reign);
  vote("Jameka", 0, reign);
  evict("Jen", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 8

  reign = new Reign(8, season);
  reign.players = copyPlayers(season.reigns[6]);

  hoh("Jessica", reign);
  nom("Amber", reign);
  nom("Zach", reign);
  veto("Eric", false, reign);
  vote("Amber", 3, reign);
  vote("Zach", 1, reign);
  evict("Amber", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 9

  reign = new Reign(9, season);
  reign.players = copyPlayers(season.reigns[7]);

  hoh("Zach", reign);
  nom("Jameka", reign);
  nom("Jessica", reign);
  veto("Daniele", false, reign);
  vote("Jameka", 1, reign);
  vote("Jessica", 2, reign);
  evict("Jessica", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 10

  reign = new Reign(10, season);
  reign.players = copyPlayers(season.reigns[8]);

  hoh("Dick", reign);
  nom("Eric", reign);
  nom("Jameka", reign);
  veto("Zach", false, reign);
  vote("Eric", 2, reign);
  vote("Jameka", 0, reign);
  evict("Eric", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 11

  reign = new Reign(11, season);
  reign.players = copyPlayers(season.reigns[9]);

  hoh("Zach", reign);
  nom("Daniele", reign);
  nom("Dick", reign);
  veto("Daniele", true, reign);
  nom("Jameka", reign);
  vote("Jameka", 1, reign);
  vote("Daniele", 0, reign);
  evict("Jameka", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 12

  reign = new Reign(12, season);
  reign.players = copyPlayers(season.reigns[10]);

  hoh("Dick", reign);
  nom("Daniele", reign);
  nom("Zach", reign);
  vote("Daniele", 0, reign);
  vote("Zach", 1, reign);
  evict("Zach", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Finale

  season.winner = "Dick";
  season.juryFor = 5;
  season.juryAgainst = 2;

  seasons.push(season);
}

/* Season 9 */
{
  season = new Season(9, 11, 7);
  reign = new Reign(1, season);
  reign.players.push(new Player("Adam", 1));
  reign.players.push(new Player("Ryan", 2));
  reign.players.push(new Player("Shiela", 3));
  reign.players.push(new Player("Sharon", 4));
  reign.players.push(new Player("Natalie", 5));
  reign.players.push(new Player("James", 6));
  reign.players.push(new Player("Joshuah", 7));
  reign.players.push(new Player("Chelsia", 8));
  reign.players.push(new Player("Matt", 9));
  reign.players.push(new Player("Allison", 10));
  reign.players.push(new Player("Alex", 11));
  reign.players.push(new Player("Amanda", 12));
  reign.players.push(new Player("Jen", 13));
  reign.players.push(new Player("Parker", 14));
  reign.players.push(new Player("Neil", 15));
  reign.players.push(new Player("Jacob", 16));

  // Reign 1

  evict("Jacob", reign);
  evict("Neil", reign);
  hoh("Alex", reign);
  hoh("Amanda", reign);
  nom("Allison", reign);
  nom("Ryan", reign);
  nom("Jen", reign);
  nom("Parker", reign);
  veto("Matt", false, reign);
  veto("Natalie", false, reign);
  vote("Jen", 6, reign);
  vote("Parker", 6, reign);
  vote("Ryan", 2, reign);
  vote("Allison", 2, reign);
  evict("Jen", reign);
  evict("Parker", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 2

  reign = new Reign(2, season);
  reign.players = copyPlayers(season.reigns[0]);

  hoh("Chelsia", reign);
  hoh("James", reign);
  nom("Alex", reign);
  nom("Amanda", reign);
  nom("Matt", reign);
  nom("Natalie", reign);
  veto("Joshuah", false, reign);
  veto("Sharon", false, reign);
  vote("Alex", 6, reign);
  vote("Amanda", 6, reign);
  vote("Matt", 0, reign);
  vote("Natalie", 0, reign);
  evict("Alex", reign);
  evict("Amanda", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 3

  reign = new Reign(3, season);
  reign.players = copyPlayers(season.reigns[1]);

  hoh("Joshuah", reign);
  hoh("Sharon", reign);
  nom("Allison", reign);
  nom("Ryan", reign);
  nom("Matt", reign);
  nom("Natalie", reign);
  veto("Matt", true, reign);
  veto("Natalie", true, reign);
  nom("Adam", reign);
  nom("Shiela", reign);
  vote("Allison", 6, reign);
  vote("Ryan", 0, reign);
  evict("Allison", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 4

  reign = new Reign(4, season);
  reign.players = copyPlayers(season.reigns[2]);

  hoh("Ryan", reign);
  nom("Chelsia", reign);
  nom("Sharon", reign);
  veto("Chelsia", true, reign);
  nom("James", reign);
  vote("James", 5, reign);
  vote("Sharon", 1, reign);
  evict("James", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 5

  reign = new Reign(5, season);
  reign.players = copyPlayers(season.reigns[3]);

  reenter("James", reign);
  hoh("James", reign);
  nom("Ryan", reign);
  nom("Shiela", reign);
  veto("James", true, reign);
  nom("Matt", reign);
  vote("Matt", 4, reign);
  vote("Ryan", 3, reign);
  evict("Matt", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 6

  reign = new Reign(6, season);
  reign.players = copyPlayers(season.reigns[4]);

  hoh("Adam", reign);
  nom("Chelsia", reign);
  nom("James", reign);
  veto("James", true, reign);
  nom("Sharon", reign);
  vote("Chelsia", 5, reign);
  vote("Sharon", 0, reign);
  evict("Chelsia", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 7

  reign = new Reign(7, season);
  reign.players = copyPlayers(season.reigns[5]);

  hoh("Natalie", reign);
  nom("James", reign);
  nom("Joshuah", reign);
  veto("James", true, reign);
  nom("Sharon", reign);
  vote("Joshuah", 3, reign);
  vote("Sharon", 1, reign);
  evict("Joshuah", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 8

  reign = new Reign(8, season);
  reign.players = copyPlayers(season.reigns[6]);

  hoh("Adam", reign);
  nom("Sharon", reign);
  nom("Shiela", reign);
  veto("Ryan", true, reign);
  nom("James", reign);
  vote("James", 3, reign);
  vote("Sharon", 0, reign);
  evict("James", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 9

  reign = new Reign(9, season);
  reign.players = copyPlayers(season.reigns[7]);

  hoh("Shiela", reign);
  nom("Adam", reign);
  nom("Sharon", reign);
  veto("Adam", true, reign);
  nom("Natalie", reign);
  vote("Natalie", 2, reign);
  vote("Sharon", 1, reign);
  evict("Natalie", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 10

  reign = new Reign(10, season);
  reign.players = copyPlayers(season.reigns[8]);

  hoh("Ryan", reign);
  nom("Sharon", reign);
  nom("Shiela", reign);
  veto("Ryan", false, reign);
  vote("Sharon", 1, reign);
  vote("Shiela", 0, reign);
  evict("Sharon", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 11

  reign = new Reign(11, season);
  reign.players = copyPlayers(season.reigns[9]);

  hoh("Ryan", reign);
  nom("Adam", reign);
  nom("Shiela", reign);
  vote("Shiela", 1, reign);
  vote("Adam", 0, reign);
  evict("Shiela", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Finale

  season.winner = "Adam";
  season.juryFor = 6;
  season.juryAgainst = 1;

  seasons.push(season);
}

/* Season 10 */
{
  season = new Season(10, 11, 7);
  reign = new Reign(1, season);
  reign.players.push(new Player("Dan", 1));
  reign.players.push(new Player("Memphis", 2));
  reign.players.push(new Player("Jerry", 3));
  reign.players.push(new Player("Keesha", 4));
  reign.players.push(new Player("Renny", 5));
  reign.players.push(new Player("Ollie", 6));
  reign.players.push(new Player("Michelle", 7));
  reign.players.push(new Player("April", 8));
  reign.players.push(new Player("Libra", 9));
  reign.players.push(new Player("Jessie", 10));
  reign.players.push(new Player("Angie", 11));
  reign.players.push(new Player("Steven", 12));
  reign.players.push(new Player("Brian", 13));

  // Reign 1

  hoh("Jerry", reign);
  nom("Jessie", reign);
  nom("Renny", reign);
  veto("Jessie", true, reign);
  nom("Brian", reign);
  vote("Brian", 9, reign);
  vote("Renny", 1, reign);
  evict("Brian", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 2

  reign = new Reign(2, season);
  reign.players = copyPlayers(season.reigns[0]);

  hoh("Jessie", reign);
  nom("Dan", reign);
  nom("Steven", reign);
  veto("Michelle", false, reign);
  vote("Steven", 9, reign);
  vote("Dan", 0, reign);
  evict("Steven", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 3

  reign = new Reign(3, season);
  reign.players = copyPlayers(season.reigns[1]);

  hoh("Keesha", reign);
  nom("Angie", reign);
  nom("Jessie", reign);
  veto("Keesha", false, reign);
  vote("Angie", 8, reign);
  vote("Jessie", 0, reign);
  evict("Angie", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 4

  reign = new Reign(4, season);
  reign.players = copyPlayers(season.reigns[2]);

  hoh("April", reign);
  nom("Jessie", reign);
  nom("Memphis", reign);
  veto("Jerry", false, reign);
  vote("Jessie", 4, reign);
  vote("Memphis", 3, reign);
  evict("Jessie", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 5

  reign = new Reign(5, season);
  reign.players = copyPlayers(season.reigns[3]);

  hoh("Michelle", reign);
  nom("Keesha", reign);
  nom("Libra", reign);
  veto("Jerry", false, reign);
  vote("Keesha", 0, reign);
  vote("Libra", 6, reign);
  evict("Libra", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 6

  reign = new Reign(6, season);
  reign.players = copyPlayers(season.reigns[4]);

  hoh("Renny", reign);
  nom("April", reign);
  nom("Jerry", reign);
  veto("Dan", false, reign);
  vote("April", 4, reign);
  vote("Jerry", 1, reign);
  evict("April", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 7

  reign = new Reign(7, season);
  reign.players = copyPlayers(season.reigns[5]);

  hoh("Dan", reign);
  nom("Jerry", reign);
  nom("Memphis", reign);
  veto("Memphis", true, reign);
  nom("Michelle", reign);
  vote("Michelle", 3, reign);
  vote("Jerry", 1, reign);
  evict("Michelle", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 8

  reign = new Reign(8, season);
  reign.players = copyPlayers(season.reigns[6]);

  hoh("Keesha", reign);
  nom("Jerry", reign);
  nom("Ollie", reign);
  veto("Dan", false, reign);
  vote("Ollie", 3, reign);
  vote("Jerry", 0, reign);
  evict("Ollie", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 9

  reign = new Reign(9, season);
  reign.players = copyPlayers(season.reigns[7]);

  hoh("Jerry", reign);
  nom("Dan", reign);
  nom("Keesha", reign);
  veto("Memphis", true, reign);
  nom("Renny", reign);
  vote("Renny", 2, reign);
  vote("Keesha", 0, reign);
  evict("Renny", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 10

  reign = new Reign(10, season);
  reign.players = copyPlayers(season.reigns[8]);

  hoh("Dan", reign);
  nom("Jerry", reign);
  nom("Memphis", reign);
  veto("Memphis", true, reign);
  nom("Keesha", reign);
  vote("Keesha", 1, reign);
  vote("Jerry", 0, reign);
  evict("Keesha", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 11

  reign = new Reign(11, season);
  reign.players = copyPlayers(season.reigns[9]);

  hoh("Dan", reign);
  nom("Memphis", reign);
  nom("Jerry", reign);
  vote("Jerry", 1, reign);
  vote("Memphis", 0, reign);
  evict("Jerry", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Finale

  season.winner = "Dan";
  season.juryFor = 7;
  season.juryAgainst = 0;

  seasons.push(season);
}

/* Season 11 */
{
  season = new Season(11, 12, 7);
  reign = new Reign(1, season);
  reign.players.push(new Player("Jordan", 1));
  reign.players.push(new Player("Natalie", 2));
  reign.players.push(new Player("Kevin", 3));
  reign.players.push(new Player("Michele", 4));
  reign.players.push(new Player("Jeff", 5));
  reign.players.push(new Player("Russell", 6));
  reign.players.push(new Player("Lydia", 7));
  reign.players.push(new Player("Chima", 8));
  reign.players.push(new Player("Jessie", 9));
  reign.players.push(new Player("Ronnie", 10));
  reign.players.push(new Player("Casey", 11));
  reign.players.push(new Player("Laura", 12));
  reign.players.push(new Player("Braden", 13));

  // Reign 1

  hoh("Jessie", reign);
  nom("Chima", reign);
  nom("Lydia", reign);
  veto("Russell", true, reign);
  nom("Braden", reign);
  vote("Braden", 6, reign);
  vote("Chima", 5, reign);
  evict("Braden", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 2

  reign = new Reign(2, season);
  reign.players = copyPlayers(season.reigns[0]);

  hoh("Ronnie", reign);
  nom("Jeff", reign);
  nom("Laura", reign);
  veto("Jeff", true, reign);
  nom("Jordan", reign);
  vote("Laura", 8, reign);
  vote("Jordan", 1, reign);
  evict("Laura", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 3

  reign = new Reign(3, season);
  reign.players = copyPlayers(season.reigns[1]);

  hoh("Jessie", reign);
  nom("Jordan", reign);
  nom("Michele", reign);
  veto("Michele", true, reign);
  nom("Casey", reign);
  vote("Casey", 7, reign);
  vote("Jordan", 1, reign);
  evict("Casey", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 4

  reign = new Reign(4, season);
  reign.players = copyPlayers(season.reigns[2]);

  hoh("Russell", reign);
  nom("Lydia", reign);
  nom("Ronnie", reign);
  veto("Michele", false, reign);
  vote("Ronnie", 4, reign);
  vote("Lydia", 3, reign);
  evict("Ronnie", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 5

  reign = new Reign(5, season);
  reign.players = copyPlayers(season.reigns[3]);

  hoh("Chima", reign);
  nom("Lydia", reign);
  nom("Russell", reign);
  veto("Kevin", false, reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 6

  reign = new Reign(6, season);
  reign.players = copyPlayers(season.reigns[4]);

  hoh("Jeff", reign);
  nom("Jessie", reign);
  nom("Natalie", reign);
  vote("Jessie", 3, reign);
  vote("Natalie", 2, reign);
  evict("Jessie", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 7

  reign = new Reign(7, season);
  reign.players = copyPlayers(season.reigns[5]);

  hoh("Michele", reign);
  nom("Chima", reign);
  nom("Natalie", reign);
  evict("Chima", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 8

  reign = new Reign(8, season);
  reign.players = copyPlayers(season.reigns[6]);

  hoh("Jordan", reign);
  nom("Lydia", reign);
  nom("Natalie", reign);
  veto("Jordan", false, reign);
  vote("Lydia", 3, reign);
  vote("Natalie", 1, reign);
  evict("Lydia", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 9

  reign = new Reign(9, season);
  reign.players = copyPlayers(season.reigns[7]);

  hoh("Jeff", reign);
  nom("Kevin", reign);
  nom("Natalie", reign);
  veto("Jeff", true, reign);
  nom("Russell", reign);
  vote("Russell", 3, reign);
  vote("Natalie", 0, reign);
  evict("Russell", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 10

  reign = new Reign(10, season);
  reign.players = copyPlayers(season.reigns[8]);

  hoh("Kevin", reign);
  nom("Jeff", reign);
  nom("Michele", reign);
  veto("Michele", true, reign);
  nom("Jordan", reign);
  vote("Jeff", 2, reign);
  vote("Jordan", 1, reign);
  evict("Jeff", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 11

  reign = new Reign(11, season);
  reign.players = copyPlayers(season.reigns[9]);

  hoh("Natalie", reign);
  nom("Kevin", reign);
  nom("Michele", reign);
  veto("Kevin", true, reign);
  nom("Jordan", reign);
  vote("Michele", 1, reign);
  vote("Jordan", 0, reign);
  evict("Michele", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 11

  reign = new Reign(12, season);
  reign.players = copyPlayers(season.reigns[10]);

  hoh("Jordan", reign);
  nom("Kevin", reign);
  nom("Natalie", reign);
  vote("Kevin", 1, reign);
  vote("Natalie", 0, reign);
  evict("Kevin", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Finale

  season.winner = "Jordan";
  season.juryFor = 5;
  season.juryAgainst = 2;

  seasons.push(season);
}

/* Season 12 */
{
  season = new Season(12, 11, 7);
  reign = new Reign(1, season);
  reign.players.push(new Player("Hayden", 1));
  reign.players.push(new Player("Lane", 2));
  reign.players.push(new Player("Enzo", 3));
  reign.players.push(new Player("Britney", 4));
  reign.players.push(new Player("Ragan", 5));
  reign.players.push(new Player("Brendon", 6));
  reign.players.push(new Player("Matt", 7));
  reign.players.push(new Player("Kathy", 8));
  reign.players.push(new Player("Rachel", 9));
  reign.players.push(new Player("Kristen", 10));
  reign.players.push(new Player("Andrew", 11));
  reign.players.push(new Player("Monet", 12));
  reign.players.push(new Player("Annie", 13));

  // Reign 1

  hoh("Hayden", reign);
  nom("Brendon", reign);
  nom("Rachel", reign);
  veto("Brendon", true, reign);
  nom("Annie", reign);
  vote("Annie", 10, reign);
  vote("Rachel", 0, reign);
  evict("Annie", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 2

  reign = new Reign(2, season);
  reign.players = copyPlayers(season.reigns[0]);

  hoh("Rachel", reign);
  nom("Britney", reign);
  nom("Monet", reign);
  veto("Britney", true, reign);
  nom("Matt", reign);
  vote("Matt", 2, reign);
  vote("Monet", 7, reign);
  evict("Monet", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 3

  reign = new Reign(3, season);
  reign.players = copyPlayers(season.reigns[1]);

  hoh("Matt", reign);
  nom("Andrew", reign);
  nom("Kathy", reign);
  veto("Brendon", false, reign);
  vote("Andrew", 8, reign);
  vote("Kathy", 0, reign);
  evict("Andrew", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 4

  reign = new Reign(4, season);
  reign.players = copyPlayers(season.reigns[2]);

  hoh("Rachel", reign);
  nom("Hayden", reign);
  nom("Kristen", reign);
  veto("Britney", false, reign);
  vote("Kristen", 6, reign);
  vote("Hayden", 1, reign);
  evict("Kristen", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 5

  reign = new Reign(5, season);
  reign.players = copyPlayers(season.reigns[3]);

  hoh("Matt", reign);
  nom("Brendon", reign);
  nom("Rachel", reign);
  veto("Britney", false, reign);
  vote("Rachel", 6, reign);
  vote("Brendon", 0, reign);
  evict("Rachel", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 6

  reign = new Reign(6, season);
  reign.players = copyPlayers(season.reigns[4]);

  hoh("Brendon", reign);
  nom("Lane", reign);
  nom("Ragan", reign);
  veto("Ragan", true, reign);
  nom("Matt", reign);
  veto("Matt", true, reign);
  nom("Kathy", reign);
  vote("Kathy", 5, reign);
  vote("Lane", 0, reign);
  evict("Kathy", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 7

  reign = new Reign(7, season);
  reign.players = copyPlayers(season.reigns[5]);

  hoh("Britney", reign);
  nom("Brendon", reign);
  nom("Enzo", reign);
  veto("Brendon", true, reign);
  nom("Matt", reign);
  vote("Matt", 4, reign);
  vote("Enzo", 0, reign);
  evict("Matt", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 8

  reign = new Reign(8, season);
  reign.players = copyPlayers(season.reigns[6]);

  hoh("Hayden", reign);
  nom("Brendon", reign);
  nom("Ragan", reign);
  veto("Ragan", true, reign);
  nom("Britney", reign);
  vote("Brendon", 4, reign);
  vote("Britney", 0, reign);
  evict("Brendon", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 9

  reign = new Reign(9, season);
  reign.players = copyPlayers(season.reigns[7]);

  hoh("Lane", reign);
  nom("Enzo", reign);
  nom("Ragan", reign);
  veto("Enzo", true, reign);
  nom("Hayden", reign);
  vote("Ragan", 2, reign);
  vote("Hayden", 0, reign);
  evict("Ragan", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 10

  reign = new Reign(10, season);
  reign.players = copyPlayers(season.reigns[8]);

  hoh("Hayden", reign);
  nom("Britney", reign);
  nom("Lane", reign);
  veto("Hayden", false, reign);
  vote("Britney", 1, reign);
  vote("Lane", 0, reign);
  evict("Britney", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 11

  reign = new Reign(11, season);
  reign.players = copyPlayers(season.reigns[9]);

  hoh("Hayden", reign);
  nom("Enzo", reign);
  nom("Lane", reign);
  vote("Enzo", 1, reign);
  vote("Lane", 0, reign);
  evict("Enzo", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Finale

  season.winner = "Hayden";
  season.juryFor = 4;
  season.juryAgainst = 3;

  seasons.push(season);
}

/* Season 13 */
{
  season = new Season(13, 12, 8);
  reign = new Reign(1, season);
  reign.players.push(new Player("Rachel", 1));
  reign.players.push(new Player("Porsche", 2));
  reign.players.push(new Player("Adam", 3));
  reign.players.push(new Player("Jordan", 4));
  reign.players.push(new Player("Kalia", 5));
  reign.players.push(new Player("Shelly", 6));
  reign.players.push(new Player("Jeff", 7));
  reign.players.push(new Player("Daniele", 8));
  reign.players.push(new Player("Brendon", 9));
  reign.players.push(new Player("Lawon", 10));
  reign.players.push(new Player("Dominic", 11));
  reign.players.push(new Player("Cassi", 12));
  reign.players.push(new Player("Keith", 13));
  reign.players.push(new Player("Dick", 14));

  // Reign 1

  evict("Dick", reign);
  hoh("Rachel", reign);
  nom("Keith", reign);
  nom("Porsche", reign);
  veto("Brendon", false, reign);
  veto("Rachel", false, reign);
  vote("Keith", 6, reign);
  vote("Porsche", 4, reign);
  evict("Keith", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 2

  reign = new Reign(2, season);
  reign.players = copyPlayers(season.reigns[0]);

  hoh("Jordan", reign);
  nom("Adam", reign);
  nom("Dominic", reign);
  veto("Dominic", true, reign);
  nom("Cassi", reign);
  nom("Shelly", reign);
  vote("Cassi", 9, reign);
  vote("Shelly", 0, reign);
  evict("Cassi", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 3

  reign = new Reign(3, season);
  reign.players = copyPlayers(season.reigns[1]);

  hoh("Rachel", reign);
  nom("Adam", reign);
  nom("Dominic", reign);
  veto("Brendon", false, reign);
  vote("Dominic", 7, reign);
  vote("Adam", 1, reign);
  evict("Dominic", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 4

  reign = new Reign(4, season);
  reign.players = copyPlayers(season.reigns[2]);

  hoh("Daniele", reign);
  nom("Brendon", reign);
  nom("Rachel", reign);
  veto("Brendon", true, reign);
  nom("Jordan", reign);
  vote("Brendon", 5, reign);
  vote("Jordan", 2, reign);
  evict("Brendon", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 5

  reign = new Reign(5, season);
  reign.players = copyPlayers(season.reigns[3]);

  hoh("Kalia", reign);
  nom("Jeff", reign);
  nom("Rachel", reign);
  veto("Jeff", true, reign);
  nom("Lawon", reign);
  vote("Lawon", 6, reign);
  vote("Rachel", 0, reign);
  evict("Lawon", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 6

  reign = new Reign(6, season);
  reign.players = copyPlayers(season.reigns[4]);

  reenter("Brendon", reign);
  hoh("Daniele", reign);
  nom("Adam", reign);
  nom("Shelly", reign);
  veto("Adam", true, reign);
  nom("Brendon", reign);
  vote("Brendon", 5, reign);
  vote("Shelly", 1, reign);
  evict("Brendon", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 7

  reign = new Reign(7, season);
  reign.players = copyPlayers(season.reigns[5]);

  hoh("Jeff", reign);
  nom("Kalia", reign);
  nom("Porsche", reign);
  veto("Jeff", true, reign);
  nom("Daniele", reign);
  vote("Daniele", 3, reign);
  vote("Kalia", 2, reign);
  evict("Daniele", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 8

  reign = new Reign(8, season);
  reign.players = copyPlayers(season.reigns[6]);

  hoh("Kalia", reign);
  nom("Jeff", reign);
  nom("Rachel", reign);
  veto("Porsche", false, reign);
  vote("Jeff", 3, reign);
  vote("Rachel", 2, reign);
  evict("Jeff", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 9

  reign = new Reign(9, season);
  reign.players = copyPlayers(season.reigns[7]);

  hoh("Porsche", reign);
  nom("Jordan", reign);
  nom("Rachel", reign);
  veto("Rachel", true, reign);
  nom("Adam", reign);
  nom("Shelly", reign);
  vote("Shelly", 2, reign);
  vote("Adam", 1, reign);
  evict("Shelly", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 10

  reign = new Reign(10, season);
  reign.players = copyPlayers(season.reigns[8]);

  hoh("Rachel", reign);
  nom("Kalia", reign);
  nom("Porsche", reign);
  veto("Adam", false, reign);
  vote("Kalia", 2, reign);
  vote("Porsche", 1, reign);
  evict("Kalia", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 11

  reign = new Reign(11, season);
  reign.players = copyPlayers(season.reigns[9]);

  hoh("Adam", reign);
  nom("Jordan", reign);
  nom("Porsche", reign);
  veto("Porsche", true, reign);
  nom("Rachel", reign);
  vote("Jordan", 1, reign);
  vote("Rachel", 0, reign);
  evict("Jordan", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 12

  reign = new Reign(12, season);
  reign.players = copyPlayers(season.reigns[10]);

  hoh("Rachel", reign);
  nom("Adam", reign);
  nom("Porsche", reign);
  vote("Adam", 1, reign);
  vote("Porsche", 0, reign);
  evict("Adam", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Finale

  season.winner = "Rachel";
  season.juryFor = 4;
  season.juryAgainst = 3;

  seasons.push(season);
}

/* Season 14 */
{
  season = new Season(14, 13, 9);
  reign = new Reign(1, season);
  reign.players.push(new Player("Ian", 1));
  reign.players.push(new Player("Dan", 2));
  reign.players.push(new Player("Danielle", 3));
  reign.players.push(new Player("Shane", 4));
  reign.players.push(new Player("Jenn", 5));
  reign.players.push(new Player("Joe", 6));
  reign.players.push(new Player("Frank", 7));
  reign.players.push(new Player("Britney", 8));
  reign.players.push(new Player("Ashley", 9));
  reign.players.push(new Player("Mike", 10));
  reign.players.push(new Player("Wil", 11));
  reign.players.push(new Player("Janelle", 12));
  reign.players.push(new Player("JoJo", 13));
  reign.players.push(new Player("Willie", 14));
  reign.players.push(new Player("Kara", 15));
  reign.players.push(new Player("Jodi", 16));

  // Reign 1

  evict("Jodi", reign);
  hoh("Willie", reign);
  nom("Frank", reign);
  nom("Kara", reign);
  veto("Shane", false, reign);
  vote("Kara", 5, reign);
  vote("Frank", 3, reign);
  evict("Kara", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 2

  reign = new Reign(2, season);
  reign.players = copyPlayers(season.reigns[0]);

  evict("Willie", reign);
  hoh("Frank", reign);
  nom("JoJo", reign);
  nom("Shane", reign);
  veto("Shane", true, reign);
  nom("Danielle", reign);
  vote("JoJo", 5, reign);
  vote("Danielle", 1, reign);
  evict("JoJo", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 3

  reign = new Reign(3, season);
  reign.players = copyPlayers(season.reigns[1]);

  hoh("Shane", reign);
  nom("Ashley", reign);
  nom("Joe", reign);
  veto("Shane", true, reign);
  nom("Frank", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 4

  reign = new Reign(4, season);
  reign.players = copyPlayers(season.reigns[2]);

  hoh("Danielle", reign);
  nom("Frank", reign);
  nom("Wil", reign);
  veto("Danielle", true, reign);
  nom("Janelle", reign);
  vote("Janelle", 8, reign);
  vote("Frank", 1, reign);
  evict("Janelle", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 5

  reign = new Reign(5, season);
  reign.players = copyPlayers(season.reigns[3]);

  hoh("Frank", reign);
  nom("Joe", reign);
  nom("Wil", reign);
  veto("Frank", false, reign);
  vote("Joe", 2, reign);
  vote("Wil", 6, reign);
  evict("Wil", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 6

  reign = new Reign(6, season);
  reign.players = copyPlayers(season.reigns[4]);

  hoh("Shane", reign);
  nom("Frank", reign);
  nom("Mike", reign);
  veto("Frank", true, reign);
  nom("Jenn", reign);
  vote("Mike", 5, reign);
  vote("Jenn", 2, reign);
  evict("Mike", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 7

  reign = new Reign(7, season);
  reign.players = copyPlayers(season.reigns[5]);

  hoh("Ian", reign);
  nom("Ashley", reign);
  nom("Frank", reign);
  veto("Frank", true, reign);
  nom("Joe", reign);
  vote("Ashley", 5, reign);
  vote("Joe", 1, reign);
  evict("Ashley", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 8

  reign = new Reign(8, season);
  reign.players = copyPlayers(season.reigns[6]);

  hoh("Frank", reign);
  nom("Dan", reign);
  nom("Danielle", reign);
  veto("Ian", false, reign);
  veto("Jenn", true, reign);
  nom("Britney", reign);
  vote("Britney", 4, reign);
  vote("Danielle", 1, reign);
  evict("Britney", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 9

  reign = new Reign(9, season);
  reign.players = copyPlayers(season.reigns[7]);

  hoh("Ian", reign);
  nom("Frank", reign);
  nom("Jenn", reign);
  veto("Dan", true, reign);
  nom("Joe", reign);
  vote("Frank", 3, reign);
  vote("Joe", 1, reign);
  evict("Frank", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 10

  reign = new Reign(10, season);
  reign.players = copyPlayers(season.reigns[8]);

  hoh("Dan", reign);
  nom("Ian", reign);
  nom("Joe", reign);
  veto("Ian", true, reign);
  nom("Danielle", reign);
  vote("Joe", 3, reign);
  vote("Danielle", 0, reign);
  evict("Joe", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 11

  reign = new Reign(11, season);
  reign.players = copyPlayers(season.reigns[9]);

  hoh("Ian", reign);
  nom("Jenn", reign);
  nom("Shane", reign);
  veto("Shane", true, reign);
  nom("Danielle", reign);
  vote("Jenn", 2, reign);
  vote("Danielle", 0, reign);
  evict("Jenn", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 12

  reign = new Reign(12, season);
  reign.players = copyPlayers(season.reigns[10]);

  hoh("Danielle", reign);
  nom("Ian", reign);
  nom("Dan", reign);
  veto("Danielle", true, reign);
  nom("Shane", reign);
  vote("Shane", 1, reign);
  vote("Ian", 0, reign);
  evict("Shane", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 13

  reign = new Reign(13, season);
  reign.players = copyPlayers(season.reigns[11]);

  hoh("Ian", reign);
  nom("Danielle", reign);
  nom("Dan", reign);
  vote("Danielle", 1, reign);
  vote("Dan", 0, reign);
  evict("Danielle", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Finale

  season.winner = "Ian";
  season.juryFor = 6;
  season.juryAgainst = 1;

  seasons.push(season);
}

/* Season 15 */
{
  season = new Season(15, 15, 9);
  reign = new Reign(1, season);
  reign.players.push(new Player("Andy", 1));
  reign.players.push(new Player("Ginamarie", 2));
  reign.players.push(new Player("Spencer", 3));
  reign.players.push(new Player("McCrae", 4));
  reign.players.push(new Player("Judd", 5));
  reign.players.push(new Player("Elissa", 6));
  reign.players.push(new Player("Amanda", 7));
  reign.players.push(new Player("Aaryn", 8));
  reign.players.push(new Player("Helen", 9));
  reign.players.push(new Player("Jessie", 10));
  reign.players.push(new Player("Candice", 11));
  reign.players.push(new Player("Howard", 12));
  reign.players.push(new Player("Kaitlin", 13));
  reign.players.push(new Player("Jeremy", 14));
  reign.players.push(new Player("Nick", 15));
  reign.players.push(new Player("David", 16));

  // Reign 1

  hoh("McCrae", reign);
  nom("Candice", reign);
  nom("Jessie", reign);
  nom("David", reign);
  veto("McCrae", false, reign);
  nom("Elissa", reign);
  vote("David", 7, reign);
  vote("Elissa", 5, reign);
  vote("Jessie", 0, reign);
  evict("David", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 2

  reign = new Reign(2, season);
  reign.players = copyPlayers(season.reigns[0]);

  hoh("Aaryn", reign);
  nom("Elissa", reign);
  nom("Helen", reign);
  nom("Jeremy", reign);
  veto("Jeremy", true, reign);
  nom("Nick", reign);
  vote("Nick", 7, reign);
  vote("Elissa", 4, reign);
  vote("Helen", 0, reign);
  evict("Nick", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 3

  reign = new Reign(3, season);
  reign.players = copyPlayers(season.reigns[1]);

  hoh("Helen", reign);
  nom("Aaryn", reign);
  nom("Kaitlin", reign);
  nom("Spencer", reign);
  veto("Kaitlin", true, reign);
  nom("Jeremy", reign);
  vote("Jeremy", 9, reign);
  vote("Spencer", 1, reign);
  vote("Aaryn", 0, reign);
  evict("Jeremy", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 4

  reign = new Reign(4, season);
  reign.players = copyPlayers(season.reigns[2]);

  hoh("Judd", reign);
  nom("Aaryn", reign);
  nom("Kaitlin", reign);
  nom("Elissa", reign);
  veto("Elissa", true, reign);
  nom("Ginamarie", reign);
  vote("Kaitlin", 9, reign);
  vote("Aaryn", 0, reign);
  vote("Ginamarie", 0, reign);
  evict("Kaitlin", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 5

  reign = new Reign(5, season);
  reign.players = copyPlayers(season.reigns[3]);

  hoh("Aaryn", reign);
  nom("Howard", reign);
  nom("Spencer", reign);
  nom("Amanda", reign);
  veto("Spencer", true, reign);
  nom("Candice", reign);
  vote("Howard", 7, reign);
  vote("Candice", 1, reign);
  vote("Amanda", 0, reign);
  evict("Howard", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 6

  reign = new Reign(6, season);
  reign.players = copyPlayers(season.reigns[4]);

  hoh("Ginamarie", reign);
  nom("Candice", reign);
  nom("Jessie", reign);
  nom("Amanda", reign);
  veto("Jessie", true, reign);
  nom("Spencer", reign);
  vote("Candice", 7, reign);
  vote("Amanda", 0, reign);
  vote("Spencer", 0, reign);
  evict("Candice", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 7

  reign = new Reign(7, season);
  reign.players = copyPlayers(season.reigns[5]);

  hoh("Aaryn", reign);
  nom("Jessie", reign);
  nom("Spencer", reign);
  veto("Aaryn", true, reign);
  nom("Judd", reign);
  vote("Judd", 7, reign);
  vote("Spencer", 0, reign);
  evict("Judd", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 8

  reign = new Reign(8, season);
  reign.players = copyPlayers(season.reigns[6]);

  hoh("Andy", reign);
  nom("Jessie", reign);
  nom("Spencer", reign);
  veto("Andy", false, reign);
  vote("Jessie", 6, reign);
  vote("Spencer", 0, reign);
  evict("Jessie", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 9

  reign = new Reign(9, season);
  reign.players = copyPlayers(season.reigns[7]);

  hoh("Aaryn", reign);
  nom("Elissa", reign);
  nom("Helen", reign);
  veto("Elissa", true, reign);
  nom("Spencer", reign);
  vote("Helen", 4, reign);
  vote("Spencer", 1, reign);
  evict("Helen", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 10

  reign = new Reign(10, season);
  reign.players = copyPlayers(season.reigns[8]);

  reenter("Judd", reign);
  hoh("Elissa", reign);
  nom("Aaryn", reign);
  nom("McCrae", reign);
  veto("Amanda", true, reign);
  nom("Andy", reign);
  vote("Aaryn", 5, reign);
  vote("Andy", 0, reign);
  evict("Aaryn", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 11

  reign = new Reign(11, season);
  reign.players = copyPlayers(season.reigns[9]);

  hoh("Ginamarie", reign);
  nom("Amanda", reign);
  nom("McCrae", reign);
  veto("McCrae", true, reign);
  nom("Spencer", reign);
  vote("Amanda", 3, reign);
  vote("Spencer", 2, reign);
  evict("Amanda", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 12

  reign = new Reign(12, season);
  reign.players = copyPlayers(season.reigns[10]);

  hoh("McCrae", reign);
  nom("Elissa", reign);
  nom("Ginamarie", reign);
  veto("Judd", false, reign);
  vote("Elissa", 3, reign);
  vote("Ginamarie", 0, reign);
  evict("Elissa", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 13

  reign = new Reign(13, season);
  reign.players = copyPlayers(season.reigns[11]);

  hoh("Spencer", reign);
  nom("Ginamarie", reign);
  nom("McCrae", reign);
  veto("McCrae", true, reign);
  nom("Judd", reign);
  vote("Judd", 2, reign);
  vote("Ginamarie", 0, reign);
  evict("Judd", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 13

  reign = new Reign(14, season);
  reign.players = copyPlayers(season.reigns[12]);

  hoh("Andy", reign);
  nom("McCrae", reign);
  nom("Spencer", reign);
  veto("Andy", false, reign);
  vote("McCrae", 1, reign);
  vote("Spencer", 0, reign);
  evict("McCrae", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 13

  reign = new Reign(15, season);
  reign.players = copyPlayers(season.reigns[13]);

  hoh("Andy", reign);
  nom("Ginamarie", reign);
  nom("Spencer", reign);
  vote("Spencer", 1, reign);
  vote("Ginamarie", 0, reign);
  evict("Spencer", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Finale

  season.winner = "Andy";
  season.juryFor = 7;
  season.juryAgainst = 2;

  seasons.push(season);
}

/* Season 16 */
{
  season = new Season(16, 16, 9);
  reign = new Reign(1, season);
  reign.players.push(new Player("Derrick", 1));
  reign.players.push(new Player("Cody", 2));
  reign.players.push(new Player("Victoria", 3));
  reign.players.push(new Player("Caleb", 4));
  reign.players.push(new Player("Frankie", 5));
  reign.players.push(new Player("Christine", 6));
  reign.players.push(new Player("Nicole F", 7));
  reign.players.push(new Player("Donny", 8));
  reign.players.push(new Player("Zach", 9));
  reign.players.push(new Player("Hayden", 10));
  reign.players.push(new Player("Jocasta", 11));
  reign.players.push(new Player("Amber", 12));
  reign.players.push(new Player("Brittany", 13));
  reign.players.push(new Player("Devin", 14));
  reign.players.push(new Player("Paola", 15));
  reign.players.push(new Player("Joey", 16));

  // Reign 1

  hoh("Caleb", reign);
  hoh("Frankie", reign);
  nom("Donny", reign);
  nom("Paola", reign);
  nom("Brittany", reign);
  nom("Victoria", reign);
  veto("Donny", true, reign);
  nom("Joey", reign);
  vote("Joey", 13, reign);
  vote("Paola", 0, reign);
  evict("Joey", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 2

  reign = new Reign(2, season);
  reign.players = copyPlayers(season.reigns[0]);

  hoh("Devin", reign);
  hoh("Amber", reign);
  nom("Brittany", reign);
  nom("Paola", reign);
  nom("Hayden", reign);
  nom("Nicole F", reign);
  veto("Devin", true, reign);
  nom("Zach", reign);
  vote("Paola", 10, reign);
  vote("Zach", 2, reign);
  evict("Paola", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 3

  reign = new Reign(3, season);
  reign.players = copyPlayers(season.reigns[1]);

  hoh("Derrick", reign);
  hoh("Nicole F", reign);
  nom("Caleb", reign);
  nom("Jocasta", reign);
  nom("Amber", reign);
  nom("Donny", reign);
  veto("Donny", true, reign);
  nom("Devin", reign);
  vote("Devin", 11, reign);
  vote("Caleb", 0, reign);
  evict("Devin", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 4

  reign = new Reign(4, season);
  reign.players = copyPlayers(season.reigns[2]);

  hoh("Cody", reign);
  hoh("Frankie", reign);
  nom("Brittany", reign);
  nom("Victoria", reign);
  nom("Amber", reign);
  nom("Jocasta", reign);
  veto("Victoria", true, reign);
  nom("Donny", reign);
  vote("Brittany", 10, reign);
  vote("Donny", 0, reign);
  evict("Brittany", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 5

  reign = new Reign(5, season);
  reign.players = copyPlayers(season.reigns[3]);

  hoh("Frankie", reign);
  hoh("Zach", reign);
  nom("Jocasta", reign);
  nom("Victoria", reign);
  nom("Christine", reign);
  nom("Nicole F", reign);
  veto("Hayden", true, reign);
  nom("Amber", reign);
  vote("Amber", 9, reign);
  vote("Jocasta", 0, reign);
  evict("Amber", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 6

  reign = new Reign(6, season);
  reign.players = copyPlayers(season.reigns[4]);

  hoh("Nicole F", reign);
  hoh("Donny", reign);
  nom("Jocasta", reign);
  nom("Zach", reign);
  nom("Caleb", reign);
  nom("Victoria", reign);
  veto("Christine", false, reign);
  vote("Jocasta", 6, reign);
  vote("Zach", 2, reign);
  evict("Jocasta", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 7

  reign = new Reign(7, season);
  reign.players = copyPlayers(season.reigns[5]);

  hoh("Caleb", reign);
  nom("Donny", reign);
  nom("Hayden", reign);
  veto("Donny", true, reign);
  nom("Nicole F", reign);
  vote("Hayden", 5, reign);
  vote("Nicole F", 2, reign);
  evict("Hayden", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 8

  reign = new Reign(8, season);
  reign.players = copyPlayers(season.reigns[6]);

  hoh("Christine", reign);
  hoh("Nicole F", reign);
  nom("Donny", reign);
  nom("Zach", reign);
  nom("Caleb", reign);
  nom("Frankie", reign);
  veto("Zach", true, reign);
  nom("Nicole F", reign);
  vote("Nicole F", 6, reign);
  vote("Donny", 0, reign);
  evict("Nicole F", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 9

  reign = new Reign(9, season);
  reign.players = copyPlayers(season.reigns[7]);

  hoh("Frankie", reign);
  hoh("Derrick", reign);
  nom("Caleb", reign);
  nom("Cody", reign);
  nom("Christine", reign);
  nom("Donny", reign);
  veto("Frankie", true, reign);
  nom("Zach", reign);
  vote("Zach", 5, reign);
  vote("Cody", 0, reign);
  evict("Zach", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 10

  reign = new Reign(10, season);
  reign.players = copyPlayers(season.reigns[8]);

  reenter("Nicole F", reign);
  hoh("Cody", reign);
  nom("Donny", reign);
  nom("Nicole F", reign);
  veto("Cody", false, reign);
  vote("Donny", 5, reign);
  vote("Nicole F", 0, reign);
  evict("Donny", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 11

  reign = new Reign(11, season);
  reign.players = copyPlayers(season.reigns[9]);

  hoh("Caleb", reign);
  nom("Christine", reign);
  nom("Nicole F", reign);
  veto("Christine", true, reign);
  nom("Victoria", reign);
  vote("Nicole F", 4, reign);
  vote("Victoria", 0, reign);
  evict("Nicole F", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 12

  reign = new Reign(12, season);
  reign.players = copyPlayers(season.reigns[10]);

  hoh("Derrick", reign);
  nom("Christine", reign);
  nom("Victoria", reign);
  veto("Frankie", false, reign);
  vote("Christine", 3, reign);
  vote("Victoria", 0, reign);
  evict("Christine", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 13

  reign = new Reign(13, season);
  reign.players = copyPlayers(season.reigns[11]);

  hoh("Frankie", reign);
  nom("Cody", reign);
  nom("Victoria", reign);
  veto("Frankie", false, reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 14

  reign = new Reign(14, season);
  reign.players = copyPlayers(season.reigns[12]);

  hoh("Caleb", reign);
  nom("Frankie", reign);
  nom("Victoria", reign);
  veto("Cody", false, reign);
  vote("Frankie", 2, reign);
  vote("Victoria", 0, reign);
  evict("Frankie", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 15

  reign = new Reign(15, season);
  reign.players = copyPlayers(season.reigns[13]);

  hoh("Derrick", reign);
  nom("Caleb", reign);
  nom("Victoria", reign);
  veto("Cody", false, reign);
  vote("Caleb", 1, reign);
  vote("Victoria", 0, reign);
  evict("Caleb", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 16

  reign = new Reign(16, season);
  reign.players = copyPlayers(season.reigns[14]);

  hoh("Cody", reign);
  nom("Derrick", reign);
  nom("Victoria", reign);
  vote("Victoria", 1, reign);
  vote("Derrick", 0, reign);
  evict("Victoria", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Finale

  season.winner = "Derrick";
  season.juryFor = 7;
  season.juryAgainst = 2;

  seasons.push(season);
}

/* Season 17 */
{
  season = new Season(17, 16, 9);
  reign = new Reign(1, season);
  reign.players.push(new Player("Steve", 1));
  reign.players.push(new Player("Liz", 2));
  reign.players.push(new Player("Vanessa", 3));
  reign.players.push(new Player("John", 4));
  reign.players.push(new Player("Austin", 5));
  reign.players.push(new Player("Julia", 6));
  reign.players.push(new Player("James", 7));
  reign.players.push(new Player("Meg", 8));
  reign.players.push(new Player("Becky", 9));
  reign.players.push(new Player("Jackie", 10));
  reign.players.push(new Player("Shelli", 11));
  reign.players.push(new Player("Clay", 12));
  reign.players.push(new Player("Jason", 13));
  reign.players.push(new Player("Audrey", 14));
  reign.players.push(new Player("Jeff", 15));
  reign.players.push(new Player("Da'Vonne", 16));
  reign.players.push(new Player("Jace", 17));

  // Reign 1

  hoh("James", reign);
  hoh("Jason", reign);
  nom("Jackie", reign);
  nom("Steve", reign);
  nom("Becky", reign);
  nom("John", reign);
  veto("Steve", true, reign);
  nom("Jace", reign);
  vote("Jace", 12, reign);
  vote("Jackie", 1, reign);
  evict("Jace", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 2

  reign = new Reign(2, season);
  reign.players = copyPlayers(season.reigns[0]);

  hoh("Shelli", reign);
  hoh("Becky", reign);
  nom("Da'Vonne", reign);
  nom("John", reign);
  nom("Jason", reign);
  nom("Steve", reign);
  veto("John", true, reign);
  nom("Meg", reign);
  vote("Da'Vonne", 7, reign);
  vote("Meg", 2, reign);
  evict("Da'Vonne", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 3

  reign = new Reign(3, season);
  reign.players = copyPlayers(season.reigns[1]);

  hoh("Vanessa", reign);
  hoh("Austin", reign);
  nom("James", reign);
  nom("John", reign);
  nom("Jason", reign);
  nom("Meg", reign);
  veto("John", true, reign);
  nom("Jeff", reign);
  vote("Jeff", 7, reign);
  vote("James", 4, reign);
  evict("Jeff", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 4

  reign = new Reign(4, season);
  reign.players = copyPlayers(season.reigns[2]);

  hoh("Shelli", reign);
  hoh("Liz", reign);
  nom("Jason", reign);
  nom("John", reign);
  nom("James", reign);
  nom("Jackie", reign);
  veto("Vanessa", true, reign);
  nom("Audrey", reign);
  vote("Audrey", 10, reign);
  vote("John", 1, reign);
  evict("Audrey", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 5

  reign = new Reign(5, season);
  reign.players = copyPlayers(season.reigns[3]);

  hoh("Vanessa", reign);
  hoh("Jackie", reign);
  nom("Becky", reign);
  nom("Clay", reign);
  nom("James", reign);
  nom("Liz", reign);
  veto("Clay", true, reign);
  nom("Jason", reign);
  vote("Jason", 7, reign);
  vote("Becky", 2, reign);
  evict("Jason", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 6

  reign = new Reign(6, season);
  reign.players = copyPlayers(season.reigns[4]);

  hoh("James", reign);
  nom("Clay", reign);
  nom("Shelli", reign);
  veto("James", false, reign);
  vote("Clay", 9, reign);
  vote("Shelli", 0, reign);
  evict("Clay", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 7

  reign = new Reign(7, season);
  reign.players = copyPlayers(season.reigns[5]);

  hoh("Becky", reign);
  nom("Steve", reign);
  nom("Shelli", reign);
  veto("Steve", true, reign);
  nom("Vanessa", reign);
  vote("Shelli", 8, reign);
  vote("Vanessa", 0, reign);
  evict("Shelli", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 8

  reign = new Reign(8, season);
  reign.players = copyPlayers(season.reigns[6]);

  hoh("Steve", reign);
  nom("Jackie", reign);
  nom("Meg", reign);
  veto("John", false, reign);
  vote("Jackie", 6, reign);
  vote("Meg", 1, reign);
  evict("Jackie", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 9

  reign = new Reign(9, season);
  reign.players = copyPlayers(season.reigns[7]);

  hoh("Liz", reign);
  nom("Becky", reign);
  nom("John", reign);
  veto("Liz", false, reign);
  vote("Becky", 6, reign);
  vote("John", 0, reign);
  evict("Becky", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 10

  reign = new Reign(10, season);
  reign.players = copyPlayers(season.reigns[8]);

  hoh("Austin", reign);
  nom("John", reign);
  nom("Steve", reign);
  veto("Vanessa", false, reign);
  vote("John", 5, reign);
  vote("Steve", 0, reign);
  evict("John", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 11

  reign = new Reign(11, season);
  reign.players = copyPlayers(season.reigns[9]);

  reenter("John", reign);
  hoh("Vanessa", reign);
  nom("James", reign);
  nom("Meg", reign);
  veto("James", true, reign);
  nom("Julia", reign);
  vote("Meg", 4, reign);
  vote("Julia", 1, reign);
  evict("Meg", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 12

  reign = new Reign(12, season);
  reign.players = copyPlayers(season.reigns[10]);

  hoh("Liz", reign);
  nom("James", reign);
  nom("John", reign);
  veto("Julia", false, reign);
  vote("James", 4, reign);
  vote("John", 0, reign);
  evict("James", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 13

  reign = new Reign(13, season);
  reign.players = copyPlayers(season.reigns[11]);

  hoh("Steve", reign);
  nom("Austin", reign);
  nom("Liz", reign);
  veto("Austin", true, reign);
  nom("Julia", reign);
  vote("Julia", 3, reign);
  vote("Liz", 0, reign);
  evict("Julia", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 14

  reign = new Reign(14, season);
  reign.players = copyPlayers(season.reigns[12]);

  hoh("Vanessa", reign);
  nom("John", reign);
  nom("Steve", reign);
  veto("John", true, reign);
  nom("Austin", reign);
  vote("Austin", 2, reign);
  vote("Steve", 1, reign);
  evict("Austin", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 15

  reign = new Reign(15, season);
  reign.players = copyPlayers(season.reigns[13]);

  hoh("Steve", reign);
  nom("John", reign);
  nom("Vanessa", reign);
  veto("Vanessa", true, reign);
  nom("Liz", reign);
  vote("John", 1, reign);
  vote("Liz", 0, reign);
  evict("John", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 16

  reign = new Reign(16, season);
  reign.players = copyPlayers(season.reigns[14]);

  hoh("Steve", reign);
  nom("Liz", reign);
  nom("Vanessa", reign);
  vote("Vanessa", 1, reign);
  vote("Liz", 0, reign);
  evict("Vanessa", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Finale

  season.winner = "Steve";
  season.juryFor = 6;
  season.juryAgainst = 3;

  seasons.push(season);
}

/* Season 18 */
{
  season = new Season(18, 15, 9);
  reign = new Reign(1, season);
  reign.players.push(new Player("Nicole F", 1));
  reign.players.push(new Player("Paul", 2));
  reign.players.push(new Player("James", 3));
  reign.players.push(new Player("Corey", 4));
  reign.players.push(new Player("Victor", 5));
  reign.players.push(new Player("Natalie", 6));
  reign.players.push(new Player("Michelle", 7));
  reign.players.push(new Player("Paulie", 8));
  reign.players.push(new Player("Bridgette", 9));
  reign.players.push(new Player("Zakiyah", 10));
  reign.players.push(new Player("Da'Vonne", 11));
  reign.players.push(new Player("Frank", 12));
  reign.players.push(new Player("Tiffany", 13));
  reign.players.push(new Player("Bronte", 14));
  reign.players.push(new Player("Jozea", 15));
  reign.players.push(new Player("Glenn", 16));

  // Reign 1

  evict("Glenn", reign);
  hoh("Nicole F", reign);
  nom("Jozea", reign);
  nom("Paul", reign);
  nom("Paulie", reign);
  veto("Paul", true, reign);
  nom("Bridgette", reign);
  vote("Jozea", 7, reign);
  vote("Paulie", 4, reign);
  vote("Bridgette", 0, reign);
  evict("Jozea", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 2

  reign = new Reign(2, season);
  reign.players = copyPlayers(season.reigns[0]);

  hoh("Paulie", reign);
  nom("Paul", reign);
  nom("Bronte", reign);
  nom("Tiffany", reign);
  veto("Paulie", true, reign);
  nom("Victor", reign);
  vote("Victor", 9, reign);
  vote("Bronte", 1, reign);
  vote("Tiffany", 0, reign);
  evict("Victor", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 3

  reign = new Reign(3, season);
  reign.players = copyPlayers(season.reigns[1]);

  hoh("Bridgette", reign);
  nom("Paul", reign);
  nom("Tiffany", reign);
  nom("Bronte", reign);
  veto("Bridgette", false, reign);
  vote("Bronte", 5, reign);
  vote("Tiffany", 4, reign);
  vote("Paul", 0, reign);
  evict("Bronte", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 4

  reign = new Reign(4, season);
  reign.players = copyPlayers(season.reigns[2]);

  hoh("Paulie", reign);
  nom("Corey", reign);
  nom("Natalie", reign);
  nom("Tiffany", reign);
  veto("Corey", true, reign);
  nom("Da'Vonne", reign);
  vote("Tiffany", 8, reign);
  vote("Da'Vonne", 0, reign);
  vote("Natalie", 0, reign);
  evict("Tiffany", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 5

  reign = new Reign(5, season);
  reign.players = copyPlayers(season.reigns[3]);

  reenter("Victor", reign);
  hoh("James", reign);
  nom("Bridgette", reign);
  nom("Frank", reign);
  veto("Michelle", false, reign);
  vote("Frank", 9, reign);
  vote("Bridgette", 0, reign);
  evict("Frank", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 6

  reign = new Reign(6, season);
  reign.players = copyPlayers(season.reigns[4]);

  hoh("Paul", reign);
  nom("Bridgette", reign);
  nom("Paulie", reign);
  veto("Paulie", true, reign);
  nom("Da'Vonne", reign);
  vote("Da'Vonne", 6, reign);
  vote("Bridgette", 2, reign);
  evict("Da'Vonne", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 7

  reign = new Reign(7, season);
  reign.players = copyPlayers(season.reigns[5]);

  hoh("Victor", reign);
  nom("Michelle", reign);
  nom("Zakiyah", reign);
  veto("Paulie", false, reign);
  vote("Zakiyah", 4, reign);
  vote("Michelle", 3, reign);
  evict("Zakiyah", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 8

  reign = new Reign(8, season);
  reign.players = copyPlayers(season.reigns[6]);

  hoh("Corey", reign);
  nom("Bridgette", reign);
  nom("Michelle", reign);
  veto("Corey", false, reign);
  vote("Bridgette", 5, reign);
  vote("Michelle", 1, reign);
  evict("Bridgette", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 9

  reign = new Reign(9, season);
  reign.players = copyPlayers(season.reigns[7]);

  hoh("Victor", reign);
  nom("Corey", reign);
  nom("Paulie", reign);
  veto("Victor", false, reign);
  vote("Paulie", 5, reign);
  vote("Corey", 0, reign);
  evict("Paulie", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 10

  reign = new Reign(10, season);
  reign.players = copyPlayers(season.reigns[8]);

  hoh("Natalie", reign);
  hoh("Michelle", reign);
  nom("Paul", reign);
  nom("Victor", reign);
  veto("Paul", true, reign);
  nom("Corey", reign);
  vote("Victor", 2, reign);
  vote("Corey", 1, reign);
  evict("Victor", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 11

  reign = new Reign(11, season);
  reign.players = copyPlayers(season.reigns[9]);

  reenter("Victor", reign);
  hoh("Nicole F", reign);
  nom("Michelle", reign);
  nom("Paul", reign);
  veto("Nicole F", false, reign);
  vote("Michelle", 3, reign);
  vote("Paul", 2, reign);
  evict("Michelle", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 12

  reign = new Reign(12, season);
  reign.players = copyPlayers(season.reigns[10]);

  hoh("Victor", reign);
  nom("James", reign);
  nom("Natalie", reign);
  veto("Corey", false, reign);
  vote("James", 0, reign);
  vote("Natalie", 3, reign);
  evict("Natalie", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 13

  reign = new Reign(13, season);
  reign.players = copyPlayers(season.reigns[11]);

  hoh("Corey", reign);
  nom("Paul", reign);
  nom("Victor", reign);
  veto("Nicole F", false, reign);
  vote("Victor", 2, reign);
  vote("Paul", 0, reign);
  evict("Victor", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 14

  reign = new Reign(14, season);
  reign.players = copyPlayers(season.reigns[12]);

  hoh("Paul", reign);
  nom("Corey", reign);
  nom("Nicole F", reign);
  veto("Paul", false, reign);
  vote("Corey", 1, reign);
  vote("Nicole F", 0, reign);
  evict("Corey", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 15

  reign = new Reign(15, season);
  reign.players = copyPlayers(season.reigns[13]);

  hoh("Paul", reign);
  nom("James", reign);
  nom("Nicole F", reign);
  vote("James", 1, reign);
  vote("Nicole F", 0, reign);
  evict("James", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Finale

  season.winner = "Nicole F";
  season.juryFor = 5;
  season.juryAgainst = 4;

  seasons.push(season);
}

/* Season 19 */
{
  season = new Season(19, 15, 9);
  reign = new Reign(1, season);
  reign.players.push(new Player("Josh", 1));
  reign.players.push(new Player("Paul", 2));
  reign.players.push(new Player("Christmas", 3));
  reign.players.push(new Player("Kevin", 4));
  reign.players.push(new Player("Alex", 5));
  reign.players.push(new Player("Raven", 6));
  reign.players.push(new Player("Jason", 7));
  reign.players.push(new Player("Matt", 8));
  reign.players.push(new Player("Mark", 9));
  reign.players.push(new Player("Elena", 10));
  reign.players.push(new Player("Cody", 11));
  reign.players.push(new Player("Jessica", 12));
  reign.players.push(new Player("Ramses", 13));
  reign.players.push(new Player("Dominique", 14));
  reign.players.push(new Player("Jillian", 15));
  reign.players.push(new Player("Megan", 16));
  reign.players.push(new Player("Cameron", 17));

  // Reign 1

  evict("Cameron", reign);
  hoh("Cody", reign);
  nom("Megan", reign);
  nom("Alex", reign);
  nom("Jillian", reign);
  veto("Alex", true, reign);
  nom("Paul", reign);
  nom("Christmas", reign);
  evict("Megan", reign)
  vote("Jillian", 8, reign);
  vote("Christmas", 4, reign);
  evict("Jillian", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 2

  reign = new Reign(2, season);
  reign.players = copyPlayers(season.reigns[0]);

  hoh("Paul", reign);
  nom("Alex", reign);
  nom("Josh", reign);
  nom("Ramses", reign);
  veto("Paul", true, reign);
  nom("Cody", reign);
  vote("Cody", 7, reign);
  vote("Ramses", 3, reign);
  vote("Alex", 0, reign);
  evict("Cody", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 3

  reign = new Reign(3, season);
  reign.players = copyPlayers(season.reigns[1]);

  hoh("Alex", reign);
  nom("Dominique", reign);
  nom("Jessica", reign);
  veto("Jason", false, reign);
  vote("Dominique", 10, reign);
  vote("Jessica", 0, reign);
  evict("Dominique", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 4

  reign = new Reign(4, season);
  reign.players = copyPlayers(season.reigns[2]);

  reenter("Cody", reign);
  hoh("Jessica", reign);
  nom("Josh", reign);
  nom("Ramses", reign);
  veto("Jessica", false, reign);
  vote("Ramses", 7, reign);
  vote("Josh", 3, reign);
  evict("Ramses", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 5

  reign = new Reign(5, season);
  reign.players = copyPlayers(season.reigns[3]);

  hoh("Paul", reign);
  nom("Cody", reign);
  nom("Jason", reign);
  nom("Jessica", reign);
  veto("Paul", true, reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 6

  reign = new Reign(6, season);
  reign.players = copyPlayers(season.reigns[4]);

  hoh("Josh", reign);
  nom("Elena", reign);
  nom("Jessica", reign);
  nom("Mark", reign);
  veto("Mark", true, reign);
  nom("Raven", reign);
  vote("Jessica", 7, reign);
  vote("Raven", 1, reign);
  vote("Elena", 0, reign);
  evict("Jessica", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 7

  reign = new Reign(7, season);
  reign.players = copyPlayers(season.reigns[5]);

  hoh("Alex", reign);
  nom("Elena", reign);
  nom("Jason", reign);
  nom("Matt", reign);
  veto("Matt", true, reign);
  nom("Cody", reign);
  vote("Cody", 7, reign);
  vote("Elena", 0, reign);
  vote("Jason", 0, reign);
  evict("Cody", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 8

  reign = new Reign(8, season);
  reign.players = copyPlayers(season.reigns[6]);

  hoh("Jason", reign);
  nom("Elena", reign);
  nom("Mark", reign);
  veto("Mark", true, reign);
  nom("Matt", reign);
  vote("Elena", 6, reign);
  vote("Matt", 1, reign);
  evict("Elena", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 9

  reign = new Reign(9, season);
  reign.players = copyPlayers(season.reigns[7]);

  hoh("Christmas", reign);
  nom("Jason", reign);
  nom("Matt", reign);
  veto("Jason", true, reign);
  nom("Mark", reign);
  vote("Mark", 4, reign);
  vote("Matt", 2, reign);
  evict("Mark", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 10

  reign = new Reign(10, season);
  reign.players = copyPlayers(season.reigns[8]);

  hoh("Jason", reign);
  nom("Matt", reign);
  nom("Raven", reign);
  veto("Jason", false, reign);
  vote("Matt", 6, reign);
  vote("Raven", 0, reign);
  evict("Matt", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 11

  reign = new Reign(11, season);
  reign.players = copyPlayers(season.reigns[9]);

  hoh("Christmas", reign);
  nom("Alex", reign);
  nom("Jason", reign);
  veto("Paul", true, reign);
  nom("Kevin", reign);
  vote("Jason", 3, reign);
  vote("Kevin", 2, reign);
  evict("Jason", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 12

  reign = new Reign(12, season);
  reign.players = copyPlayers(season.reigns[10]);

  hoh("Alex", reign);
  nom("Kevin", reign);
  nom("Raven", reign);
  veto("Josh", false, reign);
  vote("Raven", 2, reign);
  vote("Kevin", 1, reign);
  evict("Raven", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 13

  reign = new Reign(13, season);
  reign.players = copyPlayers(season.reigns[11]);

  hoh("Josh", reign);
  nom("Alex", reign);
  nom("Kevin", reign);
  veto("Paul", false, reign);
  vote("Alex", 2, reign);
  vote("Kevin", 1, reign);
  evict("Alex", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 14

  reign = new Reign(14, season);
  reign.players = copyPlayers(season.reigns[12]);

  hoh("Paul", reign);
  nom("Josh", reign);
  nom("Kevin", reign);
  veto("Paul", false, reign);
  vote("Kevin", 1, reign);
  vote("Josh", 0, reign);
  evict("Kevin", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 15

  reign = new Reign(15, season);
  reign.players = copyPlayers(season.reigns[13]);

  hoh("Josh", reign);
  nom("Christmas", reign);
  nom("Paul", reign);
  vote("Christmas", 1, reign);
  vote("Paul", 0, reign);
  evict("Christmas", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Finale

  season.winner = "Josh";
  season.juryFor = 5;
  season.juryAgainst = 4;

  seasons.push(season);
}

/* Season 20 */
{
  season = new Season(20, 15, 9);
  reign = new Reign(1, season);
  reign.players.push(new Player("Kaycee", 1));
  reign.players.push(new Player("Tyler", 2));
  reign.players.push(new Player("JC", 3));
  reign.players.push(new Player("Angela", 4));
  reign.players.push(new Player("Sam", 5));
  reign.players.push(new Player("Brett", 6));
  reign.players.push(new Player("Haleigh", 7));
  reign.players.push(new Player("Scottie", 8));
  reign.players.push(new Player("Faysal", 9));
  reign.players.push(new Player("Rockstar", 10));
  reign.players.push(new Player("Bayleigh", 11));
  reign.players.push(new Player("Rachel", 12));
  reign.players.push(new Player("Kaitlyn", 13));
  reign.players.push(new Player("Winston", 14));
  reign.players.push(new Player("Swaggy C", 15));
  reign.players.push(new Player("Steve", 16));

  // Reign 1

  hoh("Tyler", reign);
  nom("Sam", reign);
  nom("Steve", reign);
  veto("Faysal", false, reign);
  vote("Steve", 7, reign);
  vote("Sam", 6, reign);
  evict("Steve", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 2

  reign = new Reign(2, season);
  reign.players = copyPlayers(season.reigns[0]);

  hoh("Kaitlyn", reign);
  nom("Scottie", reign);
  nom("Winston", reign);
  veto("Tyler", true, reign);
  nom("Swaggy C", reign);
  vote("Swaggy C", 8, reign);
  vote("Winston", 4, reign);
  evict("Swaggy C", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 3

  reign = new Reign(3, season);
  reign.players = copyPlayers(season.reigns[1]);

  hoh("Scottie", reign);
  nom("Brett", reign);
  nom("Winston", reign);
  veto("Scottie", false, reign);
  vote("Winston", 6, reign);
  vote("Brett", 5, reign);
  evict("Winston", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 4

  reign = new Reign(4, season);
  reign.players = copyPlayers(season.reigns[2]);

  hoh("Sam", reign);
  nom("Haleigh", reign);
  nom("Kaitlyn", reign);
  veto("Faysal", true, reign);
  nom("Rockstar", reign);
  vote("Kaitlyn", 9, reign);
  vote("Rockstar", 1, reign);
  evict("Kaitlyn", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 5

  reign = new Reign(5, season);
  reign.players = copyPlayers(season.reigns[3]);

  hoh("Bayleigh", reign);
  nom("Brett", reign);
  nom("Rachel", reign);
  veto("Tyler", false, reign);
  vote("Rachel", 5, reign);
  vote("Brett", 4, reign);
  evict("Rachel", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 6

  reign = new Reign(6, season);
  reign.players = copyPlayers(season.reigns[4]);

  hoh("Angela", reign);
  nom("Rockstar", reign);
  nom("Scottie", reign);
  nom("Tyler", reign);
  veto("Angela", true, reign);
  nom("Bayleigh", reign);
  vote("Bayleigh", 6, reign);
  vote("Rockstar", 1, reign);
  evict("Bayleigh", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 7

  reign = new Reign(7, season);
  reign.players = copyPlayers(season.reigns[5]);

  hoh("Haleigh", reign);
  nom("Angela", reign);
  nom("Kaycee", reign);
  nom("Rockstar", reign);
  veto("Tyler", true, reign);
  vote("Rockstar", 5, reign);
  vote("Kaycee", 1, reign);
  evict("Rockstar", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 8

  reign = new Reign(8, season);
  reign.players = copyPlayers(season.reigns[6]);

  hoh("Faysal", reign);
  nom("Brett", reign);
  nom("Scottie", reign);
  veto("Brett", true, reign);
  nom("Kaycee", reign);
  vote("Scottie", 6, reign);
  vote("Kaycee", 0, reign);
  evict("Scottie", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 9

  reign = new Reign(9, season);
  reign.players = copyPlayers(season.reigns[7]);

  hoh("Angela", reign);
  nom("Faysal", reign);
  nom("Haleigh", reign);
  veto("Kaycee", false, reign);
  vote("Faysal", 4, reign);
  vote("Haleigh", 1, reign);
  evict("Faysal", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 10

  reign = new Reign(10, season);
  reign.players = copyPlayers(season.reigns[8]);

  reenter("Scottie", reign);
  hoh("Tyler", reign);
  nom("Haleigh", reign);
  nom("Scottie", reign);
  veto("Kaycee", false, reign);
  vote("Scottie", 5, reign);
  vote("Haleigh", 0, reign);
  evict("Scottie", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 11

  reign = new Reign(11, season);
  reign.players = copyPlayers(season.reigns[9]);

  hoh("Kaycee", reign);
  nom("Haleigh", reign);
  nom("Sam", reign);
  veto("Kaycee", false, reign);
  vote("Haleigh", 4, reign);
  vote("Sam", 0, reign);
  evict("Haleigh", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 12

  reign = new Reign(12, season);
  reign.players = copyPlayers(season.reigns[10]);

  hoh("Tyler", reign);
  nom("JC", reign);
  nom("Sam", reign);
  veto("Angela", true, reign);
  nom("Brett", reign);
  vote("Brett", 3, reign);
  vote("Sam", 0, reign);
  evict("Brett", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 13

  reign = new Reign(13, season);
  reign.players = copyPlayers(season.reigns[11]);

  hoh("Angela", reign);
  nom("JC", reign);
  nom("Sam", reign);
  veto("Kaycee", false, reign);
  vote("Sam", 2, reign);
  vote("JC", 0, reign);
  evict("Sam", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 14

  reign = new Reign(14, season);
  reign.players = copyPlayers(season.reigns[12]);

  hoh("JC", reign);
  nom("Angela", reign);
  nom("Tyler", reign);
  veto("Kaycee", false, reign);
  vote("Angela", 1, reign);
  vote("Tyler", 0, reign);
  evict("Angela", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 15

  reign = new Reign(15, season);
  reign.players = copyPlayers(season.reigns[13]);

  hoh("Kaycee", reign);
  nom("JC", reign);
  nom("Tyler", reign);
  vote("JC", 1, reign);
  vote("Tyler", 0, reign);
  evict("JC", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Finale

  season.winner = "Kaycee";
  season.juryFor = 5;
  season.juryAgainst = 4;

  seasons.push(season);
}

/* Season 21 */
{
  season = new Season(21, 14, 9);
  reign = new Reign(1, season);
  reign.players.push(new Player("Jackson", 1));
  reign.players.push(new Player("Holly", 2));
  reign.players.push(new Player("Nicole A", 3));
  reign.players.push(new Player("Cliff", 4));
  reign.players.push(new Player("Tommy", 5));
  reign.players.push(new Player("Christie", 6));
  reign.players.push(new Player("Jessica", 7));
  reign.players.push(new Player("Nick", 8));
  reign.players.push(new Player("Analyse", 9));
  reign.players.push(new Player("Kathryn", 10));
  reign.players.push(new Player("Jack", 11));
  reign.players.push(new Player("Sam", 12));
  reign.players.push(new Player("Isabella", 13));
  reign.players.push(new Player("Kemi", 14));
  reign.players.push(new Player("Ovi", 15));
  reign.players.push(new Player("David", 16));

  // Reign 1

  evict("David", reign);
  hoh("Christie", reign);
  nom("Cliff", reign);
  nom("Kathryn", reign);
  veto("Sam", true, reign);
  nom("Ovi", reign);
  vote("Ovi", 12, reign);
  vote("Kathryn", 0, reign);
  evict("Ovi", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 2

  reign = new Reign(2, season);
  reign.players = copyPlayers(season.reigns[0]);

  hoh("Jack", reign);
  nom("Jessica", reign);
  nom("Kemi", reign);
  veto("Sam", false, reign);
  vote("Kemi", 10, reign);
  vote("Jessica", 1, reign);
  evict("Kemi", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 3

  reign = new Reign(3, season);
  reign.players = copyPlayers(season.reigns[1]);

  hoh("Nick", reign);
  nom("Cliff", reign);
  nom("Jessica", reign);
  veto("Kathryn", true, reign);
  nom("Nicole A", reign);
  vote("Cliff", 6, reign);
  vote("Nicole A", 4, reign);
  evict("Cliff", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 4

  reign = new Reign(4, season);
  reign.players = copyPlayers(season.reigns[2]);

  reenter("Cliff", reign);
  hoh("Cliff", reign);
  nom("Jack", reign);
  nom("Jackson", reign);
  veto("Jackson", true, reign);
  nom("Isabella", reign);
  vote("Isabella", 8, reign);
  vote("Jack", 2, reign);
  evict("Isabella", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 5

  reign = new Reign(5, season);
  reign.players = copyPlayers(season.reigns[3]);

  hoh("Holly", reign);
  nom("Nick", reign);
  nom("Sam", reign);
  veto("Nick", true, reign);
  nom("Kathryn", reign);
  vote("Sam", 9, reign);
  vote("Kathryn", 0, reign);
  evict("Sam", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 6

  reign = new Reign(6, season);
  reign.players = copyPlayers(season.reigns[4]);

  hoh("Jessica", reign);
  nom("Jack", reign);
  nom("Jackson", reign);
  veto("Jessica", false, reign);
  vote("Jack", 6, reign);
  vote("Jackson", 2, reign);
  evict("Jack", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 7

  reign = new Reign(7, season);
  reign.players = copyPlayers(season.reigns[5]);

  hoh("Tommy", reign);
  nom("Christie", reign);
  nom("Cliff", reign);
  nom("Kathryn", reign);
  veto("Tommy", true, reign);
  vote("Kathryn", 6, reign);
  vote("Cliff", 1, reign);
  evict("Kathryn", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 8

  reign = new Reign(8, season);
  reign.players = copyPlayers(season.reigns[6]);

  hoh("Jackson", reign);
  nom("Analyse", reign);
  nom("Christie", reign);
  veto("Jackson", false, reign);
  vote("Analyse", 5, reign);
  vote("Christie", 1, reign);
  evict("Analyse", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 9

  reign = new Reign(9, season);
  reign.players = copyPlayers(season.reigns[7]);

  hoh("Holly", reign);
  nom("Christie", reign);
  nom("Nick", reign);
  veto("Jackson", false, reign);
  vote("Nick", 5, reign);
  vote("Christie", 0, reign);
  evict("Nick", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 10

  reign = new Reign(10, season);
  reign.players = copyPlayers(season.reigns[8]);

  hoh("Jackson", reign);
  nom("Christie", reign);
  nom("Jessica", reign);
  veto("Tommy", true, reign);
  nom("Cliff", reign);
  vote("Jessica", 4, reign);
  vote("Cliff", 0, reign);
  evict("Jessica", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 11

  reign = new Reign(11, season);
  reign.players = copyPlayers(season.reigns[9]);

  hoh("Nicole A", reign);
  nom("Christie", reign);
  nom("Tommy", reign);
  veto("Cliff", false, reign);
  vote("Christie", 3, reign);
  vote("Tommy", 0, reign);
  evict("Christie", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 12

  reign = new Reign(12, season);
  reign.players = copyPlayers(season.reigns[10]);

  hoh("Jackson", reign);
  nom("Cliff", reign);
  nom("Tommy", reign);
  veto("Nicole A", true, reign);
  nom("Holly", reign);
  vote("Tommy", 2, reign);
  vote("Holly", 0, reign);
  evict("Tommy", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 13

  reign = new Reign(13, season);
  reign.players = copyPlayers(season.reigns[11]);

  hoh("Nicole A", reign);
  nom("Holly", reign);
  nom("Jackson", reign);
  veto("Jackson", true, reign);
  nom("Cliff", reign);
  vote("Cliff", 1, reign);
  vote("Holly", 0, reign);
  evict("Cliff", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 14

  reign = new Reign(14, season);
  reign.players = copyPlayers(season.reigns[12]);

  hoh("Jackson", reign);
  nom("Holly", reign);
  nom("Nicole A", reign);
  vote("Nicole A", 1, reign);
  vote("Holly", 0, reign);
  evict("Nicole A", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Finale

  season.winner = "Jackson";
  season.juryFor = 6;
  season.juryAgainst = 3;

  seasons.push(season);
}

/* Season 22 */
{
  season = new Season(22, 14, 9);
  reign = new Reign(1, season);
  reign.players.push(new Player("Cody", 1));
  reign.players.push(new Player("Enzo", 2));
  reign.players.push(new Player("Nicole F", 3));
  reign.players.push(new Player("Christmas", 4));
  reign.players.push(new Player("Memphis", 5));
  reign.players.push(new Player("Tyler", 6));
  reign.players.push(new Player("Dani", 7));
  reign.players.push(new Player("David", 8));
  reign.players.push(new Player("Kevin", 9));
  reign.players.push(new Player("Da'Vonne", 10));
  reign.players.push(new Player("Ian", 11));
  reign.players.push(new Player("Bayleigh", 12));
  reign.players.push(new Player("Kaysar", 13));
  reign.players.push(new Player("Janelle", 14));
  reign.players.push(new Player("Nicole A", 15));
  reign.players.push(new Player("Keesha", 16));

  // Reign 1

  hoh("Cody", reign);
  nom("Keesha", reign);
  nom("Kevin", reign);
  veto("Enzo", false, reign);
  vote("Keesha", 13, reign);
  vote("Kevin", 0, reign);
  evict("Keesha", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 2

  reign = new Reign(2, season);
  reign.players = copyPlayers(season.reigns[0]);

  hoh("Memphis", reign);
  nom("David", reign);
  nom("Nicole A", reign);
  veto("Memphis", false, reign);
  vote("Nicole A", 10, reign);
  vote("David", 2, reign);
  evict("Nicole A", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 3

  reign = new Reign(3, season);
  reign.players = copyPlayers(season.reigns[1]);

  hoh("Tyler", reign);
  nom("Janelle", reign);
  nom("Kaysar", reign);
  veto("Cody", false, reign);
  vote("Janelle", 9, reign);
  vote("Kaysar", 2, reign);
  evict("Janelle", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 4

  reign = new Reign(4, season);
  reign.players = copyPlayers(season.reigns[2]);

  hoh("Enzo", reign);
  nom("Kaysar", reign);
  nom("Kevin", reign);
  veto("Kevin", true, reign);
  nom("Christmas", reign);
  vote("Kaysar", 10, reign);
  vote("Christmas", 0, reign);
  evict("Kaysar", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 5

  reign = new Reign(5, season);
  reign.players = copyPlayers(season.reigns[3]);

  hoh("Christmas", reign);
  nom("Bayleigh", reign);
  nom("Da'Vonne", reign);
  veto("Christmas", false, reign);
  vote("Bayleigh", 9, reign);
  vote("Da'Vonne", 0, reign);
  evict("Bayleigh", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 6

  reign = new Reign(6, season);
  reign.players = copyPlayers(season.reigns[4]);

  hoh("Dani", reign);
  nom("David", reign);
  nom("Kevin", reign);
  nom("Tyler", reign);
  veto("Da'Vonne", true, reign);
  nom("Ian", reign);
  vote("Ian", 5, reign);
  vote("Tyler", 3, reign);
  evict("Ian", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 7

  reign = new Reign(7, season);
  reign.players = copyPlayers(season.reigns[5]);

  hoh("Memphis", reign);
  nom("Da'Vonne", reign);
  nom("Kevin", reign);
  veto("Tyler", false, reign);
  vote("Da'Vonne", 5, reign);
  vote("Kevin", 2, reign);
  evict("Da'Vonne", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 8

  reign = new Reign(8, season);
  reign.players = copyPlayers(season.reigns[6]);

  hoh("Cody", reign);
  nom("David", reign);
  nom("Kevin", reign);
  veto("Cody", false, reign);
  vote("Kevin", 6, reign);
  vote("David", 0, reign);
  evict("Kevin", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 9

  reign = new Reign(9, season);
  reign.players = copyPlayers(season.reigns[7]);

  hoh("Memphis", reign);
  nom("David", reign);
  nom("Nicole F", reign);
  veto("Christmas", false, reign);
  vote("David", 3, reign);
  vote("Nicole F", 2, reign);
  evict("David", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 10

  reign = new Reign(10, season);
  reign.players = copyPlayers(season.reigns[8]);

  hoh("Tyler", reign);
  nom("Dani", reign);
  nom("Nicole F", reign);
  veto("Tyler", false, reign);
  vote("Dani", 4, reign);
  vote("Nicole F", 0, reign);
  evict("Dani", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 11

  reign = new Reign(11, season);
  reign.players = copyPlayers(season.reigns[9]);

  hoh("Cody", reign);
  nom("Christmas", reign);
  nom("Tyler", reign);
  veto("Cody", false, reign);
  vote("Tyler", 3, reign);
  vote("Christmas", 0, reign);
  evict("Tyler", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 12

  reign = new Reign(12, season);
  reign.players = copyPlayers(season.reigns[10]);

  hoh("Nicole F", reign);
  nom("Christmas", reign);
  nom("Memphis", reign);
  veto("Nicole F", false, reign);
  vote("Memphis", 2, reign);
  vote("Christmas", 0, reign);
  evict("Memphis", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 13

  reign = new Reign(13, season);
  reign.players = copyPlayers(season.reigns[11]);

  hoh("Enzo", reign);
  nom("Christmas", reign);
  nom("Nicole F", reign);
  veto("Cody", false, reign);
  vote("Nicole F", 0, reign);
  vote("Christmas", 1, reign);
  evict("Christmas", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Reign 14

  reign = new Reign(14, season);
  reign.players = copyPlayers(season.reigns[12]);

  hoh("Cody", reign);
  nom("Enzo", reign);
  nom("Nicole F", reign);
  vote("Enzo", 0, reign);
  vote("Nicole F", 1, reign);
  evict("Nicole F", reign);

  calculate(reign);
  season.reigns.push(reign);

  //Finale

  season.winner = "Cody";
  season.juryFor = 9;
  season.juryAgainst = 0;

  seasons.push(season);
}

makePlayerArr();
