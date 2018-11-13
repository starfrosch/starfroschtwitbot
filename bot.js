//
// Dependencies =========================
//
var
    twit = require('twit'),
    config = require('./config');

var Twitter = new twit(config);

var friendsDiff = 0;
// 0.5 is spam
var timerMultiplicator = 2.1;

//
// RETWEET BOT ==========================
//
// find latest tweet according the query 'q' in params
function retweet() {
    var params = {
        q: '"#starfrosch min_retweets:2 min_faves:2" OR "#hot111 min_retweets:2 min_faves:2" OR "#ccmusic min_retweets:3 min_faves:3" -from:markwinder8',  // REQUIRED
        result_type: 'recent',
        lang: 'en'
    };
    Twitter.get('search/tweets', params, function(err, data) {
      // if there no errors
        if (!err && data.statuses[0]) {
          // grab ID of tweet to retweet
            var retweetId = data.statuses[0].id_str;
            // Tell TWITTER to retweet
            Twitter.post('statuses/retweet/:id', {
                id: retweetId
            }, function(err, response) {
              if(err){
                console.log('Retweeted: ' + err);
              }
              else{
                console.log('Retweetet: Success');
              }
            });
        }
        // if unable to Search a tweet
        else {
          console.log('Retweeted: Search Error: ' + err);
        }
    });
}

// grab & retweet as soon as program is running...
// retweet in every 3 minutes
setInterval(retweet, 180000);

//
// FAVORITE and FOLLOW BOT====================
//
// find a random tweet and favorite it and follow the user
function favoriteFollowRandomTweet(){
  console.log('favoriteFollowRandomTweet: Event is running');
  var params = {
      q: '"#YouTuber -buy -promo min_retweets:2 min_faves:2" OR "vlog min_retweets:2 min_faves:2" OR "starfrosch" OR "#ccmusic" OR "#hot111"',  // REQUIRED
      result_type: 'recent',
      lang: 'en'
  };
  // for more parametes, see: https://dev.twitter.com/rest/reference

  // find the tweet
  Twitter.get('search/tweets', params, function(err,data){
    if(err){
      console.log("favoriteRandomTweet: search/tweets: Failed: " + err);
      return;
    }

    // find tweets
    var tweet = data.statuses;
    var randomTweet = randIndex(tweet);   // pick a random tweet

    // if random tweet exists
    if(typeof randomTweet != 'undefined'){
      // Tell TWITTER to 'favorite'
      Twitter.post('favorites/create', {id: randomTweet.id_str}, function(err, response){
        // if there was an error while 'favorite'
        if(err){
          console.log('favoriteRandomTweet:  ' + err);
        }
        else{
          console.log('favoriteRandomTweet: Success: ' + randomTweet.id_str);
        }
      });
    }
//
// choose a random tweet by topic and follow that user
//
/* Enable this part of the code and Twitter thinks you're a spam bot
    var tweets = data.statuses;
    var rTweet = randIndex(tweets);
    if(typeof rTweet != 'undefined')
    {
      var target = rTweet.user.id_str;

      Twitter.post('friendships/create', { id: target }, function(err, data, response) {
      if(err){
        console.log("followRandomTweet: friendships/create: " + target + " " + err);
      }
      else{
        console.log("followRandomTweet: friendships/create: " + target);
        friendsDiff++;
        console.log("followRandomTweet: friendsDiff: " + friendsDiff);
      }
      });
    } */

  });
}
// grab & 'favorite' as soon as program is running...
// 'favorite' a tweet in every 9 * timerMultiplicator minutes
setInterval(favoriteFollowRandomTweet, 540000 * timerMultiplicator);

// deprecated Twitter API user streams

// Use Streams API for interacting with a USER ==========
// set up a user stream

// var stream = Twitter.stream('user');

// when someone follows
// stream.on('follow', followed);

//stream.on('error', (err) => {
//  console.log('error!', err);
//});

//
// FOLLOW-Reply AND FOLLOW-back BOT =========================== OFFLINE
//
// ...trigger the callback
function followed(event) {
  console.log('Followed: Event is running');
  //get their twitter handler (Name AND screen name)
  var
    id = event.source.id,
    name = event.source.name,
    screenName = event.source.screen_name;

// Silly self greeting === No way
  if ( screenName === 'starfroschBot' || screenName === 'starfrosch') {
       return;
   }

// function that replies back to the user who followed and
//    tweetNow('@' + screenName + ' Thank you for following. Zirrrrp. Solar power for my circuits. Visit my master @starfrosch https://starfrosch.com Zirrrrp. RT to get more #followers. Zirrrrp. #followback #hot111. ');
// function that sends the user who followed a DM
    directMessageNow('@' + screenName + ' Thank you for following. Zirrrrp. Solar power for my circuits. Visit my master @starfrosch https://starfrosch.com Zirrrrp. #followback #hot111. Any questions? Feel free to ask me.', id);

  // Follow-back User
    Twitter.post('friendships/create', {screen_name: screenName}, function(err, data, response)  {
    if(err){
      console.log("Followed: friendships/create: Failed: " + screenName);
    }
    else{
      console.log("Followed: friendships/create: Success: " + screenName);
      friendsDiff++;
      console.log("Followed: friendsDiff: " + friendsDiff);
    }
  });
};

//
// function definition to tweet back to user who followed
//
function tweetNow(tweetTxt) {
  var tweet = {
      status: tweetTxt
  };
  Twitter.post('statuses/update', tweet, function(err, data, response) {
    if(err){
      console.log("Tweet: Error in Replying: " + err + " " + tweetTxt);
    }
    else{
      console.log("Tweet: Success: " + tweetTxt);
    }
  });
};

//
// Direct message to user who followed
//
function directMessageNow(tweetTxt, id) {

  Twitter.post('direct_messages/events/new', {
     "event": {
       "type": "message_create",
       "message_create": {
         "target": {
           "recipient_id": id
           },
         "message_data": {
           "text": tweetTxt,
           }
         }
       }
    }, function(err, data, response) {
      if(err){
        console.log("directMessageNow: " + err + " " + id + " " + tweetTxt);
      }
      else{
        console.log("directMessageNow: Success: " + id + " " + tweetTxt);
      }
    });
};
//
//  choose a random friend of one of your followers, and follow that user
//
function randomFollow() {
  console.log('randomFollow: Event is running');
  Twitter.get('followers/ids', { stringify_ids : true }, function(err, response) {
    if(err){
      console.log("randomFollow: followers/id: " + err);
      return;
    }

      var followers = response.ids
        , randFollower  = randIndex(followers);

      Twitter.get('friends/ids', { user_id: randFollower, stringify_ids : true }, function(err, response) {
        if(err){
          console.log("randomFollow: friends/ids: " + randFollower + " " + err);
          return;
        }
          var friends = response.ids
            , target  = randIndex(friends);

          Twitter.post('friendships/create', { id: target }, function(err, data, response) {
          if(err){
            console.log("randomFollow: friendships/create: " + target + " " + err);
          }
          else{
            console.log("randomFollow: friendship/create: " + target);
            friendsDiff++;
            console.log("followRandomTweet: friendsDiff: " + friendsDiff);
          }
        });

      });
    });
};

// random Follow as program is running...
// Follow in every 9 * timerMultiplicator minutes
setInterval(randomFollow, 540000 * timerMultiplicator);

//
//  prune all users that don't follow back
//

function pruneFriends () {
  console.log('pruneFriends: Event is running');
  Twitter.get('followers/ids', { stringify_ids : true }, function(err, response) {
      if(err){
        console.log("pruneFriends: followers/ids: " + err);
      } else {
      var followers = response.ids;

      Twitter.get('friends/ids', { stringify_ids : true }, function(err, response) {
        if(err){
          console.log("pruneFriends: friends/ids: " + err);
        } else {
          var friends = response.ids
            , pruned = false;

          var i = 0;
          while(!pruned && i < 10000) {
            var target = randIndex(friends);
            i++;
            if(!~followers.indexOf(target)) {
              pruned = true;
              Twitter.post('friendships/destroy', { id: target }, function(err, data, response) {
              if(err){
                console.log("pruneFriends: friendships/destroy: " + target + " "+ err);
              }
              else{
                console.log("pruneFriends: friendships/destroy: " + target);
                friendsDiff = friendsDiff - 1;
                console.log("pruneFriends: friendsDiff: " + friendsDiff);
              }
            });
            }
          }
        }
      });
    }
  });
pruneSpeed();
};

//
// Keep the following users constantly growing, Loop faster or slower
//
function pruneSpeed () {
// default 10 minutes
  var timeout = 600000 * timerMultiplicator;
  // https://stackoverflow.com/questions/729921/settimeout-or-setinterval
  if (friendsDiff < 1) {
  // minus following: slow down prune Followers to every 14 minutes
      var timeout = 980000 * timerMultiplicator;
    }
  if (friendsDiff > 0) {
  // plus following: speed up prune Followers to every 5 minutes
      var timeout = 320000 * timerMultiplicator;
    }
  // timeout
  console.log("friendsDiff: setTimeout: " + timeout + " " + friendsDiff);
  setTimeout(pruneFriends, timeout);
};

// prune as program is running...
pruneFriends();

// Check for new followers on startup
followFriends();

// Check for new followers in case we missed one
// in every 9 minutes
setInterval(followFriends, 540000 * timerMultiplicator);

//
//  follow all friends
//

function followFriends () {
  console.log('followFriends: Event is running');
  // Rate Limit: 15 Requests / 15-min window
  Twitter.get('followers/ids', { stringify_ids : true, count: 15 }, function(err, response) {
      if(err){
        console.log("followFriends: followers/ids: " + err);
      } else {
      var ids = response.ids

      ids.forEach(function(id){
        // Check every 10 seconds
        setTimeout(function(){ checkFollowFriends(id) }, 10000);

      });
    }
  });
};
//
// check if already followed
//
function checkFollowFriends(id) {
  // Rate Limit: 15 Requests / 15-min window
  Twitter.get('friendships/lookup', { user_id: id }, function (err, data, response) {
    if (err) {
      console.log(err);
    } else {
      // already following the user?
      if(data[0].connections[0] != 'following'){
      // not yet following --> Follow-back and DM
      Twitter.post('friendships/create', {user_id: id}, function(err, data, response)  {
      if (err) {
        console.log("followFriends: friendships/create: Failed: " + id + data[0].connections[0]);
      }
      else {
        console.log("followFriends: friendships/create: Success: " + id);
        // message user
        directMessageNow('Thank you for following. Zirrrrp. Solar power for my circuits. Visit my master @starfrosch https://starfrosch.com Zirrrrp. #followback #hot111. Any questions? Feel free to ask me.', id);
      }
      })
      }
      }
    });
};  

function randIndex (arr) {
  var index = Math.floor(arr.length*Math.random());
  return arr[index];
};
