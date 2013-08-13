
(function() {
  var backgroundPage = chrome.extension.getBackgroundPage();
  var search_pane = 2;

  // click to open tweet window (new tweet)
  $('#open_tweetarea').click(function() {
    TWITT.tweet_intents();
  });

  $('p.source a').attr("target","_blank");
  $('.word_menu').click(function() {
    return false;
  });
  $('.head_word_listdown_button').click(function() {
    return false;
  });
  $('.add_word_button').click(function() {
    return false;
  });
  var logo_html = '<div id="logo"><a href="'+TWITT.conf.extension_pub_url+'" target="_blank"><img src="'+TWITT.conf.home_icon+'" width="20" height="20"></a>';
  logo_html += '</div>';

  $('#logout').click(function() {
    TWITT.jsoauth.endSession(function(data) {
      var json = JSON.parse(data.text);
      //console.log(json);
      //console.log(backgroundPage.TWITT.conf.tabid);
      //console.log(TWITT.conf.tabid);
      TWITT.removeTab(backgroundPage.TWITT.conf.tabid);
    });
  });

  /*
   * open reply
   */
  $('#home_timeline').delegate('.reply','click',function() {
    var tweet_id = $(this).attr('tweet_id');
    var obj = $('#tw'+tweet_id);
    TWITT.onClickReply(obj);
  });

  /*
   * open reply with edit
   */
  $('#home_timeline').delegate('.share_rt','click',function() {
    var tweet_id = $(this).attr('tweet_id');
    var obj = $('#tw'+tweet_id);
    TWITT.onClickShareReply(obj);
  });
  
  /*
   * open retweet
   */
  $('#home_timeline').delegate('.retweet','click',function() {
    var tweet_id = $(this).attr('tweet_id');
    var obj = $('#tw'+tweet_id);
    TWITT.onClickRetweet(obj); // home_timeline上のretweetボタン押した時
  });
  
  /*
   * delete tweet
   */
  $('#home_timeline').delegate('.destroy_tweet','click',function() {
    var tweet_id = $(this).attr('tweet_id');
    var obj = $('#tw'+tweet_id);
    TWITT.onClickDestroy(obj);
  });

  /*
   * pick up list name (pane 1)
   */
  $('#head_tweets1').delegate('li.lists_list', 'click', function() {
    var pane_id = 1;
    var name = $(this).find('a').attr('list_name');

    /*
     * stop current search
     */
    if (TWITT.conf.search_data["1"] !== undefined) {
      clearTimeout(TWITT.conf.search_data["1"].timer);
    }
    if (TWITT.conf.lists_data["1"] !== undefined) {
      clearTimeout(TWITT.conf.lists_data["1"].timer);
    }

    $('#tweets'+pane_id+' .tweet').remove();

    var params = {
      "name": name,
      "max_id_str": 0
    };

    if (TWITT.conf.lists_data["1"] != undefined) {
      TWITT.conf.lists_data["1"].max_id_str = undefined;
    }

    TWITT.list_timeline(params, pane_id);
    TWITT.change_list_words(pane_id, params.name);
  });

  /*
   * pick up list name (pane 2)
   */
  $('#head_tweets2').delegate('li.lists_list', 'click', function() {
    var pane_id = 2;
    var name = $(this).find('a').attr('list_name');

    /*
     * stop current search
     */
    if (TWITT.conf.search_data["2"] !== undefined) {
      clearTimeout(TWITT.conf.search_data["2"].timer);
    }
    if (TWITT.conf.lists_data["2"] !== undefined) {
      clearTimeout(TWITT.conf.lists_data["2"].timer);
    }

    $('#tweets'+pane_id+' .tweet').remove();

    var params = {
      "name": name,
      "max_id_str": 0
    };

    if (TWITT.conf.lists_data["2"] != undefined) {
      //console.log(TWITT.conf.lists_data["2"].max_id_str);
      TWITT.conf.lists_data["2"].max_id_str = undefined;
    }

    console.log(params);
    TWITT.list_timeline(params, pane_id);
    TWITT.change_list_words(pane_id, params.name);
  });

  // Undo retweet (off since cannot get ID)
  /*
  $('#home_timeline').delegate('.undo_retweet', 'click', function() {
    console.log(this);
    var tweet_id = $(this).attr('tweet_id');
    var obj = $('#tw'+tweet_id);
    console.log(obj);
    TWITT.onClickUndoRetweet(obj);
  });
  */

  TWITT.jsoauth = backgroundPage.TWITT.jsoauth;
  var jsoauth = backgroundPage.TWITT.jsoauth;

  if (localStorage.oauth_token && localStorage.oauth_token_secret) {
    var oauth_token = localStorage.oauth_token;
    var oauth_token_secret = localStorage.oauth_token_secret;
    TWITT.jsoauth.oauth.setAccessToken([oauth_token, oauth_token_secret]);
  }

  /*
   * main
   */
  jsoauth.verifyCredentials(function(data) {
    var json = JSON.parse(data.text);
    var send_data = {
      'screen_name': json.screen_name,
      'profile_image_url': json.profile_image_url,
      'id_str' : json.id_str
    };

    // send screen_name to background listener
    chrome.extension.sendRequest({msg:"set_screen_name", body: send_data}, function(response) {});

    TWITT.get_saved_searches(function(){
      var ary_words = TWITT.get_words();
      var n = 0;
      /*
       * start searching
       */
      $('div.pane').delay(5000).each(function (e) {
        TWITT.search_pane(n+1, ary_words); // 検索のdropdown menuをセット
        var pane_id = $(this).attr('pane_id');
        //console.log(ary_words[n]);
        var m = ary_words[n].match(/^\((.*?)\)$/);
        if (m) {
          // list name case
          //console.log(m);
          var params = {
            'name': m[1],
            'max_id_str': 0
          };
          //console.log(JSON.stringify(params));
          TWITT.list_timeline(params, pane_id);
        } else {
          TWITT.search_tweets(pane_id, ary_words[n]);
        }
        n += 1;
        TWITT.add_search(pane_id); // set search form event
      });

      TWITT.init_timeline();
      TWITT.jsoauth.rateLimitStatus(function(data) {
        var json = JSON.parse(data.text);
        //console.log(json);
        $('#my_title').text(send_data.screen_name +
         ' (home_timeline api limit ' +
        json.resources.statuses['/statuses/home_timeline'].remaining + '/' +
        json.resources.statuses['/statuses/home_timeline'].limit + ')');
      });
    });

    /*
     * add lists to dropdown menu
     */
    TWITT.get_lists_all(function(json) {
      TWITT.set_lists(json);
      var s = TWITT.lists_list(json);
      TWITT.dropdown_append_lists(1, s);
      TWITT.dropdown_append_lists(2, s);
    });

  });

  $("#home_timeline").bottom(); // add event on scroll to bottom
  $("#home_timeline").bind("bottom", function() {
    TWITT.timeline_maxid(); // get old home_timeline
  });

}());
