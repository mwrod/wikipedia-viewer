var offset = 0;
var input = "";
var transitioned;

$(document).ready(function() {
  $('form').submit(function(e) {
    handleRequest($(this)[0]);
    e.preventDefault();
  });

  $('#button-load').on('click', loadMore);
});

function getApiCall(search, offset = 0){
  offset *= 10;
  search = encodeURIComponent(search.trim());
  return "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&generator=search&utf8=1&formatversion=2&exsentences=4&exlimit=max&exintro=1&explaintext=1&gsrsearch=" + search + "&gsrnamespace=0&gsrlimit=10&gsroffset=" + offset + "&gsrprop=snippet&callback=?";
}

function handleRequest(form){
  transitioned = false;
  console.log(form);
  input = form["search-input"].value;
  var req = getApiCall(input);

  getArticles(req, function(articles){
    $("main").css("padding-top", "5vh");
    $("#main-result").empty();
    $("main").one('webkitTransitionEnd otransitionend msTransitionEnd transitionend', function(){
      if(!transitioned){
        transitioned = true;
        addArticles(articles);
        $("#button-load").show();
        offset++;
      }
    });
  }, function() {
    alert("Could not retrieve any article.");
  });
}

function loadMore(){
  var req = getApiCall(input, offset);
  getArticles(req, function(articles){
    addArticles(articles);
    offset++;
  });
}

function getArticles(req, callback, callback_error = {}){
  var articles = [];
  $.getJSON(req, function(json){
    if(json.query === undefined) callback_error();
    else {
      $.each(json.query.pages, function(index, art){
        articles.push({
          id: art.pageid,
          title: art.title,
          extract: art.extract
        });
      });
      callback(articles);
    }
  }).fail(function(){ alert("Error"); });
}

function getCard(pageid, title, snippet){
  var card = $(`<div class="card animated fadeInUp">
  <div class="card-body">
  <h3 class="card-title"></h3>
  <p class="card-text"></p>
  </div>
  </div>`);
  card.on("click", function() { window.open("http://en.wikipedia.org/?curid=" + pageid);});
  card.find(".card-title").html(title);
  card.find(".card-text").html(snippet);
  card.attr("href", "http://en.wikipedia.org/?curid=" + pageid);
  card.css({"text-decoration": "none", "color": "inherit", "cursor": "pointer"});
  return card;
}

function addArticles(articles){
  var main = $(`<div class="card-columns"></div>`);
  for(var i = 0; i < articles.length; ++i){
    var card = getCard(articles[i].id, articles[i].title, articles[i].extract);
    main.append(card);
  }
  $("#main-result").append(main);
}
