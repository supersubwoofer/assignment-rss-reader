import * as jQuery from 'jquery';
import { router, route, unroute } from 'silkrouter';
import { equal } from 'assert';

(function($, router, route) {
  
  // Models
  class FeedItem {
    constructor(guid, title, link, description){
      this._guid = guid;
      this._title = title;
      this._link = link;
      this._description = description;
      this._read = false;
      this._like = false;
    }

    // Getters & Setters
    get title() {
      return this._title;
    }
    set title(title) {
      this._title = title;
    }

    get read() {
      return this._read;
    }
    set read(read) {
      this._read = read;
    }

    get like() {
      return this._like;
    }
    set like(like) {
      this._like = like;
    }
  }


  // view modules
  function Feed(data) {
    this.render = function() {
      return `<li class="feed-item">${data.title}</li>`;
    };
  }
  
  function Channel(allItems) {
    this.render = function() {
      return `<ul class="feed-list">
        ${allItems.map(item => {
          var listItem = new Feed(item);
          return listItem.render();
        }).join('')}
      </ul>`;
    };
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
    var channel = new Channel(allItems);

    var list = $('#main-content').empty();
    list.append(channel.render());  
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
        switch(e.route) {
          case '/':
          case '/index.html':
          case '#/home': { 
            loadChannelDataToDOM(); 
            break;
          }
          case '#/fav': { 
            var list = $('#main-content').empty();
            list.append(`<p>fav</p>`); 
            break; 
          }
        }
      }
    })

  });

})(jQuery, router, route)