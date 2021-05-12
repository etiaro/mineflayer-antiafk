module.exports.fishingObjections = async function fishingObjections (bot){
    //TODO change for standing in water?
    
	if(!bot.entity || !bot.blockAtCursor() || bot.blockAtCursor().name != 'water'){
		return 'not looking at water'; 
	}
	try {
	  await bot.equip(346, 'hand');
	} catch (err) {
  	  return 'cannod equip fishing_rod: '+err.message;
	}

	return false;//can fish
}
module.exports.fish = async (bot) => {
	let obj = await fishingObjections(bot);
	if(obj){
		bot.afk.start(bot);
		return;
	}
	try {
	  bot.isFishing = true;
	  await bot.fish();
	  bot.isFishing = false;
	} catch (err) {
	  bot.isFishing = false;
	  bot.afk.start(bot);
	  return false;
	}
	setTimeout(bot.afk.fish, 1500*Math.random());
	return true;
}