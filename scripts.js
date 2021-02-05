var curSeason = 2;
var curReign = 0;

function makeSeason(but, s) {
  curSeason = s;
  curReign = 0;
  document.getElementsByClassName('selected')[0].classList.remove('selected');
  but.classList.add('selected');
  if (document.getElementsByClassName("trans")[0]) {
    document.getElementsByClassName("trans")[0].classList.remove("trans");
  }
  document.getElementById("left").classList.add("trans");
  makeDiagram(s);
  makeDataTable(s, 0);
}

function newReign(but, dir) {
  if (dir === 1) {
    if (curReign < seasons[curSeason-2].hohs-1) {
      curReign++;
      makeDataTable(curSeason, curReign);
      if(document.getElementsByClassName("trans")[0]) {
        document.getElementsByClassName("trans")[0].classList.remove("trans");
      }
      if (!seasons[curSeason-2].reigns[curReign+1]) {
        but.classList.add("trans")
      }
    }
  }
  if (dir === -1) {
    if (seasons[curSeason-2].reigns[curReign-1]) {
      curReign--;
      makeDataTable(curSeason, curReign);
      if(document.getElementsByClassName("trans")[0]) {
        document.getElementsByClassName("trans")[0].classList.remove("trans");
      }
      if (!seasons[curSeason-2].reigns[curReign-1]) {
        but.classList.add("trans")
      }
    }
  }
}

function makeDiagram(s){
  var szn = seasons[s-2];
  var table = document.getElementById("diagram");
  table.innerHTML = "";

  var head = document.createElement('tr');
  var td = document.createElement('td');
  var txt = document.createTextNode('Player');
  td.appendChild(txt);
  td.classList.add('s4');
  head.appendChild(td);
  table.appendChild(head);

  for (var i = 0; i < szn.hohs; i++) {
    td = document.createElement('td');
    txt = document.createTextNode("HOH " + (i+1));
    td.appendChild(txt);
    if (i === 0) {
      td.setAttribute("onclick", "curReign = " + i + "; makeDataTable(curSeason, " + i + "); document.getElementById('left').classList.add('trans'); document.getElementById('right').setAttribute('class', '');");
    }
    else if (i === szn.hohs-1) {
      td.setAttribute("onclick", "curReign = " + i + "; makeDataTable(curSeason, " + i + "); document.getElementById('right').classList.add('trans'); document.getElementById('left').setAttribute('class', '');");
    }
    else {
      td.setAttribute("onclick", "curReign = " + i + "; makeDataTable(curSeason, " + i + "); document.getElementById('left').setAttribute('class', ''); document.getElementById('right').setAttribute('class', '');");
    }
    td.classList.add('s4');
    td.classList.add('hoverable');
    head.appendChild(td);
  }

  for (i = 0; i < szn.reigns[0].players.length; i++) {
    szn.reigns[0].players.sort((a, b) => {
      return a.in - b.in;
    });
    var tr = document.createElement('tr');
    td = document.createElement('td');
    txt = document.createTextNode(szn.reigns[0].players[i].name);
    td.appendChild(txt);
    td.classList.add('player_names');
    tr.appendChild(td);
    var player = szn.reigns[0].players[i];
    for (var j = 0; j < szn.reigns.length; j++) {

      szn.reigns[j].players.sort((a, b) => {
        return a.in - b.in;
      });
      var player = szn.reigns[j].players[i];

      td = document.createElement('td');
      if (player.evicted) {
        var div = document.createElement('div');
        if (player.veto_unused) {
          var span = document.createElement('span');
          span.classList.add('veto_unused');
          var txt = document.createTextNode("V ");
          span.appendChild(txt);
          div.appendChild(span);
        }
        if (player.veto_used) {
          var span = document.createElement('span');
          span.classList.add('veto_used');
          var txt = document.createTextNode("V ");
          span.appendChild(txt);
          div.appendChild(span);
        }
        if (player.votes > 0) {
          txt = document.createTextNode(player.votes);
          div.appendChild(txt);
          td.classList.add('evicted');
          td.style.borderLeft = "1px SOLID #CC0000";
          td.appendChild(div);
        }
        else {
          td.classList.add('evicted');
          td.appendChild(div);
        }
      }
      else {
        if (player.hoh) {
          var div = document.createElement('div');
          if (player.veto_unused) {
            var span = document.createElement('span');
            span.classList.add('veto_unused');
            var txt = document.createTextNode("V ");
            span.appendChild(txt);
            div.appendChild(span);
          }
          if (player.veto_used) {
            var span = document.createElement('span');
            span.classList.add('veto_used');
            var txt = document.createTextNode("V ");
            span.appendChild(txt);
            div.appendChild(span);
          }
          td.classList.add('hoh');
        }
        if (player.nominated) {
          var div = document.createElement('div');
          td.classList.add('nominated');
          if (player.veto_unused) {
            var span = document.createElement('span');
            span.classList.add('veto_unused');
            var txt = document.createTextNode("V ");
            span.appendChild(txt);
            div.appendChild(span);
          }
          if (player.veto_used) {
            var span = document.createElement('span');
            span.classList.add('veto_used');
            var txt = document.createTextNode("V ");
            span.appendChild(txt);
            div.appendChild(span);
          }
          if (player.votes < 0) {
            txt = document.createTextNode("–");
            div.appendChild(txt);
          }
          if (player.votes >= 0) {
            if (!(j === szn.reigns.length-1)) {
              txt = document.createTextNode(player.votes);
              div.appendChild(txt);
            }
          }
        }
        if (player.nothing) {
          var div = document.createElement('div');
          td.classList.add('nothing');
          if (player.veto_unused) {
            var span = document.createElement('span');
            span.classList.add('veto_unused');
            var txt = document.createTextNode("V ");
            span.appendChild(txt);
            div.appendChild(span);
          }
        }
        if (player.veto_used) {
          var div = document.createElement('div');
          if (player.nominated) {
            td.classList.add('nominated');
          }
          else if (player.hoh) {
            td.classList.add('hoh');
          }
          else {
            td.classList.add('nothing');
          }

          var span = document.createElement('span');
          span.classList.add('veto_used');
          var txt = document.createTextNode("V ");
          span.appendChild(txt);

          div.appendChild(span);
          if ((player.votes >= 0) && player.nominated) {
            if (!(j === szn.reigns.length-1)) {
              txt = document.createTextNode(player.votes);
              div.appendChild(txt);
            }
          }
        }
        td.appendChild(div);
      }
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  for (i = 1; i < table.children.length; i++) {
    for (j = 0; j < table.children[i].children.length; j++) {
      if (table.children[i].children[j].classList.contains('evicted')) {
        if ((j+1) === table.children[i].children.length) {
          table.children[i].children[j].style.borderRight = "1px SOLID #CC0000";
        }
      }
      if (table.children[i].children[j+1]) {
        if (table.children[i].children[j+1].classList.contains('nominated')) {
          table.children[i].children[j].style.borderRight = "1px SOLID #ea9999";
        }
        if (table.children[i].children[j].classList.contains('nothing')) {
          if (table.children[i].children[j+1].classList.contains('hoh')) {
            table.children[i].children[j].style.borderRight = "1px SOLID #b6d7a8";
          }
        }
        if (!table.children[i].children[j].classList.contains('evicted')) {
          if (table.children[i].children[j+1].classList.contains('evicted')) {
            table.children[i].children[j].style.borderRight = "1px SOLID #CC0000";
          }
        }
        else {
          if (!table.children[i].children[j+1].classList.contains('evicted')) {
            table.children[i].children[j].style.borderRight = "1px SOLID #CC0000";
          }
        }
      }
      if (table.children[i+1]) {
        if (table.children[i+1].children[j].classList.contains('nominated')) {
          if (!table.children[i].children[j].classList.contains('evicted')) {
            table.children[i].children[j].style.borderBottom = "1px SOLID #ea9999";
          }
        }
        if (table.children[i+1].children[j].classList.contains('evicted')) {
          table.children[i].children[j].style.borderBottom = "1px SOLID #CC0000";
        }
        if (table.children[i].children[j].classList.contains('nothing')) {
          if (table.children[i+1].children[j].classList.contains('hoh')) {
            table.children[i].children[j].style.borderBottom = "1px SOLID #b6d7a8";
          }
        }
      }
    }
  }
}

function makeDataTable(s, r) {
  var szn = seasons[s-2];
  var reign = szn.reigns[r];
  var table = document.getElementById("data_table");
  document.getElementById("hoh_number").innerHTML = r+1;
  table.innerHTML = "";

  var count = 0;
  for (var i = 0; i < reign.players.length; i++) {
    reign.players.sort((a, b) => {
      return a.place - b.place;
    });
    if(!reign.players[i].evicted) {
      var tr = document.createElement('tr');
      var td = document.createElement('td');
      if (count%2 === 0) {
        tr.classList.add('even_empty');
      }
      else {
        tr.classList.add('odd_empty');
      }
      count++;
      td = document.createElement('td');
      td.classList.add('data_cell');
      var txt = document.createTextNode(reign.players[i].place);
      td.appendChild(txt);
      tr.appendChild(td);
      td = document.createElement('td');
      td.classList.add('data_cell');
      txt = document.createTextNode(reign.players[i].name);
      td.appendChild(txt);
      td.classList.add('data_cell');
      td.style.textAlign = "left";
      tr.appendChild(td);
      td = document.createElement('td');
      txt = document.createTextNode(reign.players[i].total_points);
      td.appendChild(txt);
      td.classList.add('data_cell');
      tr.appendChild(td);
      td = document.createElement('td');
      txt = document.createTextNode((reign.players[i].average_percent*100).toFixed(3) + "%");
      td.appendChild(txt);
      td.classList.add('data_cell');
      tr.appendChild(td);
      td = document.createElement('td');
      txt = document.createTextNode((reign.players[i].running_percent*100).toFixed(3) + "%");
      td.appendChild(txt);
      td.classList.add('data_cell');
      tr.appendChild(td);
      td = document.createElement('td');
      txt = document.createTextNode(reign.players[i].points);
      td.appendChild(txt);
      td.classList.add('data_cell');
      tr.appendChild(td);

      td = document.createElement('td');
      var span = document.createElement('span');
      var data = getSimilarWinners(reign.players[i].name, curSeason, curReign);

      if (data[0].score > 0) {
        span = document.createElement('span');
        txt = document.createTextNode(data[0].winner);
        span.appendChild(txt);
        span.classList.add("sim_win");
        td.appendChild(span);

        span = document.createElement('span');
        txt = document.createTextNode(" " + data[0].score.toFixed(0) + "%");
        span.classList.add("perc");
        span.appendChild(txt);
        td.appendChild(span);
      }

      if (data[1].score > 0) {
        span = document.createElement('span');
        txt = document.createTextNode("  |  ");
        span.appendChild(txt);
        span.classList.add("sep");
        td.appendChild(span);

        span = document.createElement('span');
        txt = document.createTextNode(data[1].winner);
        span.appendChild(txt);
        span.classList.add("sim_win");
        td.appendChild(span);

        span = document.createElement('span');
        txt = document.createTextNode(" " + data[1].score.toFixed(0) + "%");
        span.classList.add("perc");
        span.appendChild(txt);
        td.appendChild(span);
      }

      if (data[2].score > 0) {
        span = document.createElement('span');
        txt = document.createTextNode("  |  ");
        span.appendChild(txt);
        span.classList.add("sep");
        td.appendChild(span);

        span = document.createElement('span');
        txt = document.createTextNode(data[2].winner);
        span.appendChild(txt);
        span.classList.add("sim_win");
        td.appendChild(span);

        span = document.createElement('span');
        txt = document.createTextNode(" " + data[2].score.toFixed(0) + "%");
        span.classList.add("perc");
        span.appendChild(txt);
        td.appendChild(span);
      }

      td.classList.add('last_cell');
      td.style.textAlign = "center";
      tr.appendChild(td);

      table.appendChild(tr);
    }
  }
  table = document.getElementById("diagram");
  if (document.getElementsByClassName('slight_t')[0]) {
    document.getElementsByClassName('slight_t')[0].classList.remove('slight_t');
  }
  table.children[0].children[r+1].classList.add('slight_t');
  console.log(table.children[0]);
}

function getSimilarWinners(name, s, r) {
  var szn = seasons[s-2];
  var similarities = [];

  for (var h = 0; h < seasons.length; h++) {
    seasons[h].reigns[1].players.sort((a, b) => {
      return a.in - b.in;
    });
    var tmp = {
      'winner': seasons[h].reigns[1].players[0].name,
      'score': 0.00,
      'total': 1
    };
    similarities.push(tmp);
  }

  for (var i = 0; i < szn.reigns[r].number; i++) {
    var player = getPlayer(name, szn.reigns[i]);
    for (var j = 0; j < seasons.length; j++) {
      if (seasons[j].reigns[i]) {
        seasons[j].reigns[i].players.sort((a, b) => {
          return a.in - b.in;
        });
        var winner = seasons[j].reigns[i].players[0];
        var sim = 0;
        var total = 0;
        if (! (winner.name === szn.winner)) {
          if (winner.hoh) {
            if (player.hoh === winner.hoh) {
              sim++;
            }
            total++;
          }
          if (winner.nominated) {
            if (player.nominated === winner.nominated) {
              sim++;
            }
            total++;
          }
          if (winner.nothing) {
            if (player.nothing === winner.nothing) {
              sim++;
            }
            total++;
          }
          if ((player.veto_used || player.veto_unused)) {
            if (winner.veto_used || winner.veto_unused) {
              sim++;
              if ((player.veto_used === winner.veto_used) || (player.veto_unused === winner.veto_unused)) {
                sim++;
              }
              total++;
            }
            total++;
          }
          else {
            if (winner.veto_used || winner.veto_unused) {
              total++;
            }
          }
          similarities[getSimilarWinner(similarities, winner.name)].score += sim;
          similarities[getSimilarWinner(similarities, winner.name)].total += total;
          if (i === 0) {
            similarities[getSimilarWinner(similarities, winner.name)].total--;
          }
        }
      }
    }
  }
  for (var m = 0; m < similarities.length; m++) {
    similarities[m].score = (similarities[m].score/similarities[m].total)*100;
  }
  similarities.sort((a, b) => {
    return b.score - a.score;
  });
  return similarities;
}

function getSimilarWinner(arr, name) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].winner === name) {
      return i;
    }
    else {
    }
  }
}

function makeStatTable(sort, o) {
  console.log(sort);
  players.sort((a, b) => {
    return a.season - b.season;
  });

  if (sort === "Player") {
    if (o === 'd') {
      players.sort((a, b) => {
        return a.name - b.name;
      });
    }
    else {
      players.sort((a, b) => {
        return b.name - a.name;
      });
    }
  }
  if (sort === "Season") {
    players.sort((a, b) => {
      return a.place - b.place;
    });
    if (o === 'd') {
      players.sort((a, b) => {
        return a.season - b.season;
      });
    }
    else {
      players.sort((a, b) => {
        return b.season - a.season;
      });
    }
  }
  if (sort === "Place") {
    if (o === 'd') {
      players.sort((a, b) => {
        return a.place - b.place;
      });
    }
    else {
      players.sort((a, b) => {
        return b.place - a.place;
      });
    }
  }
  if (sort === "Comp Wins") {
    if (o === 'd') {
      players.sort((a, b) => {
        return a.comps - b.comps;
      });
    }
    else {
      players.sort((a, b) => {
        return b.comps - a.comps;
      });
    }
  }
  if (sort === "HOHs") {
    if (o === 'd') {
      players.sort((a, b) => {
        return a.hoh - b.hoh;
      });
    }
    else {
      players.sort((a, b) => {
        return b.hoh - a.hoh;
      });
    }
  }
  if (sort === "Vetos") {
    if (o === 'd') {
      players.sort((a, b) => {
        return a.veto - b.veto;
      });
    }
    else {
      players.sort((a, b) => {
        return b.veto - a.veto;
      });
    }
  }
  if (sort === "Used Vetos") {
    if (o === 'd') {
      players.sort((a, b) => {
        return a.veto_used - b.veto_used;
      });
    }
    else {
      players.sort((a, b) => {
        return b.veto_used - a.veto_used;
      });
    }
  }
  if (sort === "Unused Vetos") {
    if (o === 'd') {
      players.sort((a, b) => {
        return a.veto_unused - b.veto_unused;
      });
    }
    else {
      players.sort((a, b) => {
        return b.veto_unused - a.veto_unused;
      });
    }
  }
  if (sort === "Nominations") {
    if (o === 'd') {
      players.sort((a, b) => {
        return a.nom - b.nom;
      });
    }
    else {
      players.sort((a, b) => {
        return b.nom - a.nom;
      });
    }
  }
  if (sort === "Votes Against") {
    players.sort((a, b) => {
      return a.place - b.place;
    });
    if (o === 'd') {
      players.sort((a, b) => {
        return a.votes - b.votes;
      });
    }
    else {
      players.sort((a, b) => {
        return b.votes - a.votes;
      });
    }
  }
  var table = document.getElementById('player_table');
  table.innerHTML = "";
  for (var i = 0; i < table_rows; i++) {
    var tr = document.createElement('tr');
    if (i%2 === 0) {
      tr.classList.add('even_empty');
    }
    else {
      tr.classList.add('odd_empty');
    }

    var td = document.createElement('td');
    td.classList.add('p_cell');
    td.style.textAlign = "left";
    var txt = document.createTextNode(players[i].name);
    td.appendChild(txt);
    tr.appendChild(td);

    td = document.createElement('td');
    td.classList.add('p_cell');
    txt = document.createTextNode(players[i].season);
    td.appendChild(txt);
    tr.appendChild(td);

    td = document.createElement('td');
    td.classList.add('p_cell');
    txt = document.createTextNode(players[i].place);
    td.appendChild(txt);
    tr.appendChild(td);

    td = document.createElement('td');
    td.classList.add('p_cell');
    txt = document.createTextNode(players[i].comps);
    td.appendChild(txt);
    tr.appendChild(td);

    td = document.createElement('td');
    td.classList.add('p_cell');
    txt = document.createTextNode(players[i].hoh);
    td.appendChild(txt);
    tr.appendChild(td);

    td = document.createElement('td');
    td.classList.add('p_cell');
    txt = document.createTextNode(players[i].veto);
    td.appendChild(txt);
    tr.appendChild(td);

    td = document.createElement('td');
    td.classList.add('p_cell');
    txt = document.createTextNode(players[i].veto_used);
    td.appendChild(txt);
    tr.appendChild(td);

    td = document.createElement('td');
    td.classList.add('p_cell');
    txt = document.createTextNode(players[i].veto_unused);
    td.appendChild(txt);
    tr.appendChild(td);

    td = document.createElement('td');
    td.classList.add('p_cell');
    txt = document.createTextNode(players[i].nom);
    td.appendChild(txt);
    tr.appendChild(td);

    td = document.createElement('td');
    td.classList.add('p_cell');
    txt = document.createTextNode(players[i].votes);
    td.appendChild(txt);
    tr.appendChild(td);

    table.appendChild(tr);
  }
}

makeDiagram(2);
makeDataTable(2, 0);
