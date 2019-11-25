import * as jQuery from 'jquery';
import { html, render } from 'lit-html';
import { route } from 'silkrouter';

(function($, route, html, render) {
  
  // Models
  class FeedItem {
    constructor(guid, title, link, description){
      this.guid = guid;
      this.title = title;
      this.link = link;
      this.description = description;
      this.read = false;
      this.like = false;
    }
  }

  // Event Handlers
  function clickHandler(ev, arg) {
    console.log(arg);
  }

  // view modules
  function Feed(data) {
      return html `<li id="${data.guid}" class="feed-item"
      @click=${ev => clickHandler(ev, data.guid)})}>
      ${data.title}
      </li>`;
  }
  
  function Channel(allItems) {
      return html `<ul class="feed-list">
        ${allItems.map(item => {
          return Feed(item);
        })}
      </ul>`;
  }

  // data fetching
  const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
  var getAllFeeds = function() {
    return $.ajax({
      method: 'GET',
      url: `${CORS_PROXY}https://www.concordia.ca/content/concordia/en/news/archive/_jcr_content/content-main/news_list.xml`
    });
  };
  
  var xmlDocToJSObj = function(xmlDoc) {
    var feeds = [];
    $(xmlDoc).find("item").each(function() {
        var guid = $(this).find("guid").text();
        var title = $(this).find("title").text();
        var description = $(this).find("description").text();
        var link = $(this).find("link").text();

        const feed = new FeedItem(guid, title, link, description);
        feeds.push(feed);
      }
    )
    return feeds;
  }
  
  // entry point - app setup
  var populateChannelDataToDOM = function(xmlDoc) {
    var allItems = xmlDocToJSObj(xmlDoc);
    var list = $('#main-content');
    render(Channel(allItems), list[0]);
  };
  
  var loadChannelDataToDOM = function(){
    var success = function(data) {
      populateChannelDataToDOM(data);
    };

    var error = function(error) {
      console.log(error);
    };

    var feeds = 
    getAllFeeds()
    .done(success)
    .fail(error);
  }

  $(document).ready(function() {
    
    // Routing
    route((e) => {
      var isPageReload = !(e.originalEvent instanceof PopStateEvent);
      var hasHash = window.location.hash!=='';
      var isHashChange = (e.type === 'hashchange' || e.eventName === 'hashchange');

      if((isPageReload && !hasHash) || isHashChange){
        var route = e.route;

        
        /* -----------------------
        *** Important !!!
        *** Hacked for not accessing the index.html from web server - 
        *** The url path will be a local machine file system path
        *** ONLY for the requirement of the assignment
        */
        if(route.search("index.html") > -1){
          route = "/index.html"; 
        }
        // ------------------------

        switch(route) {
          case '/':
          case '/index.html':
          case '#/home': { 
            loadChannelDataToDOM(); 
            break;
          }
          case '#/fav': { 
            var list = $('#main-content');
            render(html `<p>FAV</p>`, list[0]);
            break; 
          }
        }
      }
    })

  });

})(jQuery, route, html, render)