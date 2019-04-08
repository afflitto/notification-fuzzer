'use strict';

const {promisify} = require('util');
const fs = require('fs');
const Markov = require('markov-strings').default;
const Twitter = require('twitter');

const AWS = require('aws-sdk');
const ses = new AWS.SES();
const sns = new AWS.SNS();

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
      filter: (result) => result.string.length <= 280 && result.score > 10
    }

    const result = markov.generate(options);
    return result;
  } catch(err) {
    console.error(err);
  }
}

module.exports.follow = (event, context, callback) => {
  const config = require('./config.js');
  let accounts = [];
  config.accounts.forEach(account => {
    accounts.push(new Twitter(account));
  });

  //get followers of root account
  accounts[0].get('followers/list', (err, data, response) => {
    if(err) {
      console.log(err);
    } else {
      let followers = data.users;
      console.log('followers (data.ids):', followers)

      followers.forEach(follower => {
        let user = {
          user_id: follower.id_str
        }

        //for each fuzzer account
        accounts.forEach(account => {
          //unfollow
          account.post('friendships/destroy', user, (err, data, response) => {
            if (err && err[0].code != 34) { //if 34, that means we're not following them in the first place
              console.log(err, user.user_id)
            } else {
              console.log('Unfollowed: ', user.user_id);

              setTimeout(() => {
                //follow
                account.post('friendships/create', user, (err, data, response) => {
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
      });
    }
  });
};

module.exports.speak = async (event, context, callback) => {
  const config = require('./config.js');
  try {
    const tweet = await generateTweet();

    const emailParams = {
      Destination: {
        ToAddresses: [
          config.email
        ]
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: tweet.string
          },
          Text: {
            Charset: 'UTF-8',
            Data: tweet.string
          }
        },
        Subject: {
          Data: 'follow fuzzer',
          Charset: 'UTF-8'
        }
      },
      Source: 'fuzzer@fuzzer.afflitto.tech'
    };

    const smsParams = {
      Message: tweet.string,
      PhoneNumber: config.phone
    };

    let accounts = [];
    config.accounts.forEach(account => {
      accounts.push(new Twitter(account));
    });

    for(let account of accounts) {
      await account.post('statuses/update', {status: tweet.string});
    }

    await ses.sendEmail(emailParams).promise();
    await sns.publish(smsParams).promise();

    return tweet;
  } catch(err) {
    console.error(err)
    return err;
  }
};

module.exports.generate = async (event, context, callback) => {
  let tweet = await generateTweet();

  if(tweet) {
    return response(200, {tweet: tweet.string});
  } else {
    return response(500, 'error');
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
