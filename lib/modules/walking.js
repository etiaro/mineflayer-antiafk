const utils = require('../utils');
//TODO avoid fall/lava damage, stop when not moving
const walkActions = [ 'forward', 'back', 'left', 'right'];
module.exports.walk = (bot, direction) => {
    let time = utils.randomTime(bot.afk.config.minWalkingTime, bot.afk.config.maxWalkingTime);
	return new Promise((resolve, reject) => {
        let action = direction ?? utils.randomElement(walkActions);
		bot.setControlState(action, true);

		if(bot.entity.isInWater)
        	bot.setControlState('jump', true);
			
		setTimeout(() => {
			bot.clearControlStates();
			if(bot.entity.isInWater)
				bot.setControlState('jump', true);
			resolve();
		}, time);
	});
}