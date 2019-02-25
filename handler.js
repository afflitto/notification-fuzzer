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

  //https://archive.org/stream/ThePsychologyOfPersuasion/The%20Psychology%20of%20Persuasion_djvu.txt
  const sentences = [
    'I can admit it freely now.',
    'All my life I\'ve been a patsy.',
    'For as long as I can recall.',
    'I\'ve been an easy mark for the pitches of peddlers, fundraisers, and operators of one sort or another.',
    'True, only some of these people have had dishonorable motives.',
    'The others — representatives of certain charitable agencies, for instance — have had the best of intentions.',
    'No matter.',
    'With personally disquieting frequency, I have always found myself in possession of unwanted magazine subscriptions or tickets to the sanitation workers\' ball.',
    'Probably this long-standing status as sucker accounts for my interest in the study of compliance: Just what are the factors that cause one person to say yes to another person? And which techniques most effectively use these factors to bring about such compliance? I wondered why it is that a request stated in a certain way will be rejected, while a request that asks for the same favor in a slightly different fashion will be successful.',
    'So in my role as an experimental social psychologist, I began to do research into the psychology of compliance.',
    'At first the research took the form of experiments performed, for the most part, in my laboratory and on college students.',
    'I wanted to find out which psychological principles influence the tendency to comply with a request.',
    'Right now, psychologists know quite a bit about these principles — what they are and how they work.',
    'I have characterized such principles as weapons of influence and will report on some of the most important in the upcoming chapters.',
    'After a time, though, I began to realize that the experimental work, while necessary, wasn\'t enough.',
    'It didn\'t allow me to judge the importance of the principles in the world beyond the psychology building and the campus where I was examining them.',
    'It became clear that if I was to understand fully the psychology of compliance, I would need to broaden my scope of investigation.',
    'I would need to look to the compliance professionals — the people who had been using the principles on me all my life.',
    'They know what works and what doesn\'t; the law of survival of the fittest assures it.',
    'Their business is to make us comply, and their livelihoods depend on it.',
    'Those who don\'t know how to get people to say yes soon fall away; those who do, stay and flourish.',
    'Of course, the compliance professionals aren\'t the only ones who know about and use these principles to help them get their way.',
    'We all employ them and fall victim to them, to some degree, in our daily interactions with neighbors, friends, lovers, and offspring.',
    'But the compliance practitioners have much more than the vague and amateurish understanding of what works than the rest of us have.',
    'As I thought about it, I knew that they represented the richest vein of information about compliance available to me.',
    'For nearly three years, then, I combined my experimental studies with a decidedly more entertaining program of systematic immersion into the world of compliance professionals — sales operators, fund-raisers, recruiters, advertisers, and others.',
    'The purpose was to observe, from the inside, the techniques and strategies most commonly and effectively used by a broad range of compliance practitioners.',
    'That program of observation sometimes took the form of interviews with the practitioners themselves and sometimes with the natural enemies (for example, police buncosquad officers, consumer agencies) of certain of the practitioners.',
    'At other times it involved an intensive examination of the written materials by which compliance techniques are passed down from one generation to another — sales manuals and the like.',
    'Most frequently, though, it has taken the form of participant observation.',
    'Participant observation is a research approach in which the researcher becomes a spy of sorts.',
    'With disguised identity and intent, the investigator infiltrates the setting of interest and becomes a full-fledged participant in the group to be studied.',
    'So when I wanted to learn about the compliance tactics of encyclopedia (or vacuum-cleaner, or portraitphotography, or dance-lesson) sales organizations, I would answer a newspaper ad for sales trainees and have them teach me their methods.',
    'Using similar but not identical approaches, I was able to penetrate advertising, public-relations, and fund-raising agencies to examine their techniques.',
    'Much of the evidence presented in this book, then, comes from my experience posing as a compliance professional, or aspiring professional, in a large variety of organizations dedicated to getting us to say yes.',
    'One aspect of what I learned in this three-year period of participant observation was most instructive.',
    'Although there are thousands of different tactics that compliance practitioners employ to produce yes, the majority fall within six basic categories.',
    'Each of these categories is governed by a fundamental psychological principle that directs human behavior and, in so doing, gives the tactics their power.',
    'The book is organized around these six principles, one to a chapter.',
    'The principles — consistency, reciprocation, social proof, authority, liking, and scarcity — are each discussed in terms of their function in the society and in terms of how their enormous force can be commissioned by a compliance professional who deftly incorporates them into requests for purchases, donations, concessions, votes, assent, etc.',
    'It is worthy of note that I have not included among the six principles the simple rule of material self-interest — that people want to get the most and pay the least for their choices.',
    'This omission does not stem from any perception on my part that the desire to maximize benefits and minimize costs is unimportant in driving our decisions.',
    'Nor does it come from any evidence I have that compliance professionals ignore the power of this rule.',
    'Quite the opposite: In my investigations, I frequently saw practitioners use (sometimes honestly, sometimes not) the compelling "I can give you a good deal" approach.',
    'I choose not to treat the material selfinterest rule separately in this book because I see it as a motivational given, as a goes-without-saying factor that deserves acknowledgment but not extensive description.',
    'Finally, each principle is examined as to its ability to produce a distinct kind of automatic, mindless compliance from people, that is, a willingness to say yes without thinking first.',
    'The evidence suggests that the ever-accelerating pace and informational crush of modern life will make this particular form of unthinking compliance more and more prevalent in the future.',
    'It will be increasingly important for the society, therefore, to understand the how and why of automatic influence.',
    'It has been some time since the first edition of Influence was published.',
    'In the interim, some things have happened that I feel deserve a place in this new edition.',
    'First, we now know more about the influence process than before.',
    'The study of persuasion, compliance, and change has advanced, and the pages that follow have been adapted to reflect that progress.',
    'In addition to an overall update of the material, I have included a new feature that was stimulated by the responses of prior readers.',
    'That new feature highlights the experiences of individuals who have read Influence, recognized how one of the principles worked on (or for) them in a particular instance, and wrote to me describing the event.',
    'Their descriptions, which appear in the Reader\'s Reports at the end of each chapter, illustrate how easily and frequently we can fall victim to the pull of the influence process in our everyday lives.',
    'I wish to thank the following individuals who — either directly or through their course instructors — contributed the Reader\'s Reports used in this edition: Pat Bobbs, Mark Hastings, James Michaels, Paul R.',
    'Nail, Alan J.',
    'Resnik, Daryl Retzlaff, Dan Swift, and Karla Vasks.',
    'In addition, I would like to invite new readers to submit similar reports for possible publication in a future edition.',
    'They may be sent to me at the Department of Psychology, Arizona State University, Tempe, AZ 85287 - 1104 .',
    'She was giddy with a curious piece of news.',
    'Something fascinating had just happened, and she thought that, as a psychologist, I might be able to explain it to her.',
    'The story involved a certain allotment of turquoise jewelry she had been having trouble selling.',
    'It was the peak of the tourist season, the store was unusually full of customers, the turquoise pieces were of good quality for the prices she was asking; yet they had not sold.',
    'My friend had attempted a couple of standard sales tricks to get them moving.',
    'She tried calling attention to them by shifting their location to a more central display area; no luck.',
    'She even told her sales staff to "push" the items hard, again without success.',
    'Finally, the night before leaving on an out-of-town buying trip, she scribbled an exasperated note to her head saleswoman, "Everything in this display case, price x Vi," hoping just to be rid of the offending pieces, even if at a loss.',
    'When she returned a few days later, she was not surprised to find that every article had been sold.',
    'She was shocked, though, to discover that, because the employee had read the “V 2 " in her scrawled message as a "2," the entire allotment had sold out at twice the original price! That\'s when she called me.',
    'I thought I knew what had happened but told her that, if I were to explain things properly, she would have to listen to a story of mine.',
    'Actually, it isn\'t my story; it\'s about mother turkeys, and it belongs to the relatively new science of ethology — the study of animals in their natural settings.',
    'Turkey mothers are good mothers — loving, watchful, and protective.',
    'They spend much of their time tending, warming, cleaning, and huddling the young beneath them.',
    'But there is something odd about their method.',
    'Virtually all of this mothering is triggered by one thing: the "cheep-cheep" sound of young turkey chicks.',
    'Other identifying features of the chicks, such as their smell, touch, or appearance, seem to play minor roles in the mothering process.',
    'If a chick makes the "cheep-cheep" noise, its mother will care for it; if not, the mother will ignore or sometimes kill it.',
    'The extreme reliance of maternal turkeys upon this one sound was dramatically illustrated by animal behaviorist M. W. Fox in his description of an experiment involving a mother turkey and a stuffed polecat.',
    '1 For a mother turkey, a polecat is a natural enemy whose approach is to be greeted with squawking, pecking, clawing rage.',
    'Indeed, the experimenters found that even a stuffed model of a polecat, when drawn by a string toward a mother turkey, received an immediate and furious attack.',
    'When, however, the same stuffed replica carried inside it a small recorder that played the "cheep-cheep" sound of baby turkeys, the mother not only accepted the oncoming polecat but gathered it underneath her.',
    'When the machine was turned off, the polecat model again drew a vicious attack.',
    'How ridiculous a female turkey seems under these circumstances: She will embrace a natural enemy just because it goes "cheep-cheep," and she will mistreat or murder one of her own chicks just because it does not.',
    'She looks like an automaton whose maternal instincts are under the automatic control of that single sound.',
    'The ethologists tell us that this sort of thing is far from unique to the turkey.',
    'They have begun to identify regular, blindly mechanical patterns of action in a wide variety of species.',
    'Called fixed-action patterns, they can involve intricate sequences of behavior, such as entire courtship or mating rituals.',
    'A fundamental characteristic of these patterns is that the behaviors that compose them occur in virtually the same fashion and in the same order every time.',
    'It is almost as if the patterns were recorded on tapes within the animals.',
    'When the situation calls for courtship, the courtship tape gets played; when the situation calls for mothering, the maternal-behavior tape gets played.',
    'Click and the appropriate tape is activated; whirr and out rolls the standard sequence of behaviors.',
    'The most interesting thing about all this is the way the tapes are activated.',
    'When a male animal acts to defend his territory, for instance, it is the intrusion of another male of the same species that cues the territorial-defense tape of rigid vigilance, threat, and, if need be, combat behaviors.',
    'But there is a quirk in the system.',
    'It is not the rival male as a whole that is the trigger; it is some specific feature of him, the trigger feature.',
    'Often the trigger feature will be just one tiny aspect of the totality that is the approaching intruder.',
    'Sometimes a shade of color is the trigger feature.',
    'The experiments of ethologists have shown, for instance, that a male robin, acting as if a rival robin had entered its territory, will vigorously attack nothing more than a clump of robin-redbreast feathers placed there.',
    'At the same time, it will virtually ignore a perfect stuffed replica of a male robin without red breast feathers; similar results have been found in another species of bird, the bluethroat, where it appears that the trigger for territorial defense is a specific shade of blue breast feathers/ Before we enjoy too smugly the ease with which lower animals can be tricked by trigger features into reacting in ways wholly inappropriate to the situation, we might realize two things.',
    'First, the automatic, fixedaction patterns of these animals work very well the great majority of the time.',
    'For example, because only healthy, normal turkey chicks make the peculiar sound of baby turkeys, it makes sense for mother turkeys to respond maternally to that single "cheep-cheep" noise.',
    'By reacting to just that one stimulus, the average mother turkey will nearly always behave correctly.',
    'It takes a trickster like a scientist to make her tapelike response seem silly.',
    'The second important thing to understand is that we, too, have our preprogrammed tapes; and, although they usually work to our advantage, the trigger features that activate them can be used to dupe us into playing them at the wrong times.',
    'This parallel form of human automatic action is aptly demonstrated in an experiment by Harvard social psychologist Ellen Langer.',
    'A wellknown principle of human behavior says that when we ask someone to do us a favor we will be more successful if we provide a reason.',
    'People simply like to have reasons for what they do.',
    'Langer demonstrated this unsurprising fact by asking a small favor of people waiting in line to use a library copying machine: Excuse me, I have five pages.',
    'May I use the Xerox machine because I\'m in a rush? The effectiveness of this request-plus-reason was nearly total: Ninety-four percent of those asked let her skip ahead of them in line.',
    'Compare this success rate to the results when she made the request only: Excuse me, I have five pages.'
  ];

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
