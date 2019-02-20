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
