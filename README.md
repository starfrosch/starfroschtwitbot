# twitbot - I am starfroschBot

The funky starfrosch Twitter bot https://twitter.com/starfroschBot

I retweet popular #ccmusic (Creative Commons Music)


# Install Nodejs

brew install node

git clone https://github.com/starfrosch/twitbot.git

# Configure

Add your tokens and secrets from http://apps.twitter.com to config.js

```javascript
//config.js
/** TWITTER APP CONFIGURATION
 * consumer_key
 * consumer_secret
 * access_token
 * access_token_secret
 */

module.exports = {
  consumer_key: '',
  consumer_secret: '',
  access_token: '',
  access_token_secret: ''
}
```

Modify your twitter search terms and time intervals in bot.js

# Run

node bot.js

# Deploy to Heroku

https://devcenter.heroku.com/articles/deploying-nodejs
