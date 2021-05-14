async function fishingObjections (bot){
	if(!bot.entity || !bot.entity.isInWater){
		return 'not standing in water';
	}
	try {
	  await bot.equip(346, 'hand');
	  await bot.look(0,-90,false);//TODO better target(if standing at last water block, float goes outside of water)
	} catch (err) {
  	  return 'cannod equip fishing_rod: '+err.message;
	}

	return false;//can fish
}
module.exports.fishingObjections = fishingObjections;
module.exports.fish = async (bot) => {
	let obj = await fishingObjections(bot);
	if(obj){
		bot.afk.start();
		return;
	}
	try {
	  bot.isFishing = true;
	  await bot.fish();
	  bot.isFishing = false;
	} catch (err) {
	  bot.isFishing = false;
	  bot.afk.start();
	  return false;
	}
	setTimeout(bot.afk.fish, 1500*Math.random());
	return true;
}