'use strict';

const {promisify} = require('util');
const fs = require('fs');
const Markov = require('markov-strings').default;
const Twitter = require('twitter');
const config = require('./config.js');
const T = new Twitter(config);

const readFile = promisify(fs.readFile);

async function generateTweet() {
  const stateSize = 2;
  try {
    let input = await readFile('./input.txt', 'utf8');
    input = input.split('\n');

    input = input.filter(line => line.length >= 15);

    const markov = new Markov(input, {stateSize: stateSize});

    markov.buildCorpus();

    const options = {
      maxTries: 300,
      filter: (result) => result.string.length <= 280 && result.score > 20
    }

    const result = markov.generate(options);
    return result;
  } catch(err) {
    console.error(err);
  }
}

module.exports.follow = (event, context, callback) => {
  const T = new Twitter(config);

  T.get('followers/list', (err, data, response) => {
    if(err) {
      console.log(err);
    } else {
      let followers = data.users;
      console.log('followers (data.ids):', followers)

      followers.forEach(follower => {
        let user = {
          user_id: follower.id_str
        }

        T.post('friendships/destroy', user, (err, data, response) => {
          if (err && err[0].code != 34) { //if 34, that means we're not following them in the first place
            console.log(err, user.user_id)
          } else {
            console.log('Unfollowed: ', user.user_id);

            setTimeout(() => {
              T.post('friendships/create', user, (err, data, response) => {
                if (err) {
                  console.log(err, user.user_id)
                } else {
                  console.log('Followed: ', user.user_id);
                }
              });
            }, 250);
          }
        });
      });
    }
  });
};

module.exports.speak = async (event, context, callback) => {
  //https://archive.org/stream/ThePsychologyOfPersuasion/The%20Psychology%20of%20Persuasion_djvu.txt
  //https://archive.org/stream/EMCDDAAddictionNeurobiology/EMCDDA%20Addiction%20neurobiology_djvu.txt

  const tweet = await generateTweet();
  if(tweet) {
    console.log(tweet);

    T.post('statuses/update', {status: tweet.string}, (err, data, response) => { //send tweet
      if(err) {
        console.error(err);
      } else {
        console.log("successfully sent tweet");
        return result
      }
    });
  } else {
    console.error('error yo')
  }
};

module.exports.generate = async (event, context, callback) => {
  let tweet = await generateTweet();

  if(tweet) {
    return response(200, {tweet: tweet.string});
  } else {
    return response(500, 'nah lol');
  }

  function response(status, body) {
    return {
      'statusCode' : status,
      'body'       : JSON.stringify(body),
      'headers'    : {
        'Content-Type' : 'application/json',
        'Access-Control-Allow-Origin' : '*'
      }
    };
  }
}
