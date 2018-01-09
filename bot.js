//
// Dependencies =========================
//
var
    twit = require('twit'),
    config = require('./config');

var Twitter = new twit(config);

//
// RETWEET BOT ==========================
//
// find latest tweet according the query 'q' in params
function retweet() {
    var params = {
        q: '"#starfrosch  min_retweets:2 min_faves:2" OR "#hot111 min_retweets:2" OR "#ccmusic min_retweets:2 min_faves:2"',  // REQUIRED
        result_type: 'recent',
        lang: 'en'
    };
    Twitter.get('search/tweets', params, function(err, data) {
      // if there no errors
        if (!err) {
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
          console.log('Retweeted: Something went wrong while searching.');
        }
    });
}

// grab & retweet as soon as program is running...
retweet();
// retweet in every 1 minutes
setInterval(retweet, 60000);

//
// FAVORITE and FOLLOW BOT====================
//
// find a random tweet and favorite it and follow the user
function favoriteFollowRandomTweet(){
  console.log('favoriteFollowRandomTweet: Event is running');
  var params = {
      q: '"#YouTuber -buy -promo min_retweets:2 min_faves:2" OR "vlog  min_retweets:2 min_faves:2" OR "starfrosch" OR "#ccmusic" OR "#hot111"',  // REQUIRED
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
        console.log("followRandomTweet: friendship/create: " + target);
      }
      });
    }

  });
}
// grab & 'favorite' as soon as program is running...
favoriteFollowRandomTweet();
// 'favorite' a tweet in every 3 minutes
setInterval(favoriteFollowRandomTweet, 180000);


// Use Streams API for interacting with a USER ==========
// set up a user stream

var stream = Twitter.stream('user');

// when someone follows
stream.on('follow', followed);

//
// FOLLOW-Reply AND FOLLOW-back BOT ===========================
//
// ...trigger the callback
function followed(event) {
  console.log('Followed: Event is running');
  //get their twitter handler (screen name)
  var
    name = event.source.name,
    screenName = event.source.screen_name;

// Silly self greeting === No way
   if ( screenName === 'starfroschBot' || screenName === 'starfrosch') {
       return;
   }

  // function that replies back to the user who followed and
    tweetNow('@' + screenName + ' Thank you for following. Zirrrrp. Solar power for my circuits. Visit my master @starfrosch https://starfrosch.com Zirrrrp. RT to get more #followers. Zirrrrp. #followback #hot111. ');
  // Follow-back User
    Twitter.post('friendships/create', {screen_name: screenName}, function(err, data, response)  {
    if(err){
      console.log("Followed: friendships/create: Failed: " + screenName);
    }
    else{
      console.log("Followed: friendships/create: Success: " + screenName);
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
//  choose a random friend of one of your followers, and follow that user
//
function randomFollow() {
  console.log('randomFollow: Event is running');
  Twitter.get('followers/ids', function(err, response) {
    if(err){
      console.log("randomFollow: followers/id: " + err);
      return;
    }

      var followers = response.ids
        , randFollower  = randIndex(followers);

      Twitter.get('friends/ids', { user_id: randFollower }, function(err, response) {
        if(err){
          console.log("randomFollow: fiends/ids: " + randFollower + " " + err);
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
          }
        });

      });
    });
};

// random Follow as program is running...
randomFollow();
// Follow in every 3 minutes
setInterval(randomFollow, 180000);

//
//  prune all users that don't follow back
//

function pruneFollowers () {
  console.log('pruneFollowers: Event is running');
  Twitter.get('followers/ids', function(err, response) {
      if(err){
        console.log("pruneFollowers: followers/ids: " + err);
        return;
      }
      var followers = response.ids;

      Twitter.get('friends/ids', function(err, response) {
        if(err){
          console.log("pruneFollowers: friends/ids: " + err);
          return;
        }
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
                console.log("pruneFollowers: friendships/destroy: " + target + err);
              }
              else{
                console.log("pruneFollowers: friendships/destroy: " + target);
              }
            });
            }
          }
      });
  });
};

// prune as program is running...
pruneFollowers();
// prune in every 9 minutes
setInterval(pruneFollowers, 540000);

function randIndex (arr) {
  var index = Math.floor(arr.length*Math.random());
  return arr[index];
};
