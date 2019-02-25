'use strict';

module.exports.follow = (event, context, callback) => {
  var Twitter = require('twitter');
  var config = require('./config.js');
  var T = new Twitter(config);


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
              })
            }, 250)
          }
        })
      })
    }
  });
};

module.exports.speak = (event, context, callback) => {
  var Twitter = require('twitter');
  var config = require('./config.js');
  var T = new Twitter(config);

  const sentences = ['The quick brown fox jumps over the lazy dog.',
    'My Mum tries to be cool by saying that she likes all the same things that I do.',
    'If the Easter Bunny and the Tooth Fairy had babies would they take your teeth and leave chocolate for you?',
    'A purple pig and a green donkey flew a kite in the middle of the night and ended up sunburnt.',
    'What was the person thinking when they discovered cow’s milk was fine for human consumption… and why did they do it in the first place!?',
    'Last Friday in three week’s time I saw a spotted striped blue worm shake hands with a legless lizard.',
    'Wednesday is hump day, but has anyone asked the camel if he’s happy about it?',
    'If Purple People Eaters are real… where do they find purple people to eat?',
    'A song can make or ruin a person’s day if they let it get to them.',
    'Sometimes it is better to just walk away from things and go back to them later when you’re in a better frame of mind.',
    'Writing a list of random sentences is harder than I initially thought it would be.',
    'Where do random thoughts come from?',
    'Lets all be unique together until we realise we are all the same.',
    'I will never be this young again. Ever. Oh damn… I just got older.',
    'If I don’t like something, I’ll stay away from it.',
    'I love eating toasted cheese and tuna sandwiches.',
    'If you like tuna and tomato sauce- try combining the two. It’s really not as bad as it sounds.',
    'Someone I know recently combined Maple Syrup & buttered Popcorn thinking it would taste like caramel popcorn. It didn’t and they don’t recommend anyone else do it either.',
    'Sometimes, all you need to do is completely make an ass of yourself and laugh it off to realise that life isn’t so bad after all.',
    'When I was little I had a car door slammed shut on my hand. I still remember it quite vividly.',
    'The clock within this blog and the clock on my laptop are 1 hour different from each other.',
    'I want to buy a onesie... but know it won’t suit me.',
    'I was very proud of my nickname throughout high school but today- I couldn’t be any different to what my nickname was.',
    'I currently have 4 windows open up... and I don’t know why.',
    'I often see the time 11:11 or 12:34 on clocks.',
    'This is the last random sentence I will be writing and I am going to stop mid-sent'];

  const Markov = require('markov-strings').default;

  const markov = new Markov(sentences, {stateSize: 1});

  markov.buildCorpus();

  const options = {
    maxTries: 20,
    filter: (result) => result.string.split(' ').length >= 5 && result.string.endsWith('.')
  }

  const result = markov.generate(options);
  console.log(result);

  T.post('statuses/update', {status: result.string}, (err, data, response) => {
    if(err) {
      console.error(err);
    } else {
      console.log(data);
      console.log(response);
    }
  });

};
