const utils = require('./utils');
const modules = require('./modules');
const autoeat = require("mineflayer-auto-eat")

async function rotate(bot){
    let yaw = 2*Math.random()*Math.PI - (0.5*Math.PI);
    let pitch = Math.random()*Math.PI - (0.5*Math.PI);
    await bot.look(yaw,pitch,false);
}
function jump(bot){
    return new Promise((resolve, reject) => {
        bot.setControlState('jump',true);
		if(!bot.entity.isInWater)
            bot.setControlState('jump',false);
		setTimeout(resolve, 1000);
	});
}
async function jumpWalk(bot){
    bot.afk.jump();
    await bot.afk.walk();
}
async function swingArm(bot){
    let arm = Math.random() < 0.5 ? 'right' : 'left';
    await bot.swingArm(hand=arm);
}
function chat(bot){
    bot.chat(utils.randomElement(bot.afk.config.chatMessages));
}
async function start(bot){
    if(bot.afk.stopping){
        bot.afk.stopped = true;
        return;
    }
    if(!bot.afk.chatInterval && bot.afk.chatting && bot.afk.chatMessages?.length > 0) 
        bot.afk.chatInterval = setInterval(bot.afk.chat, bot.afk.config.chatInterval)

	if(bot._client.state != "play"){
		bot.once("spawn", ()=>start(bot)); 
		return;
	}
        
    if(bot.entity.isInWater)
        bot.setControlState('jump', true);

	if (bot.afk.config.fishing){
        if(!await modules.fishing.fishingObjections(bot)){
			bot.afk.fish();
			return;
		}
	}

    await bot.afk[utils.randomElement(bot.afk.config.actions)]();
    let time = utils.randomTime(bot.afk.config.minActionsInterval, bot.afk.config.maxActionsInterval);
	setTimeout(()=>start(bot), time);
}

function setOptions(bot, {actions, fishing,
        minWalkingTime, maxWalkingTime, 
        minActionsInterval, maxActionsInterval, 
        breaking, placing, 
        chatting, chatMessages, chatInterval, 
        killauraEnabled,
        autoEatEnabled, autoEatConfig}){
    let config = bot.afk.config;
    config.actions = actions ?? config.actions ?? 
        ['rotate', 'walk', 'jump', 'jumpWalk', 'swingArm', 'placeBlock', 'breakBlock'];
    config.fishing = fishing ?? config.fishing ?? true;
    config.minWalkingTime = minWalkingTime ?? config.minWalkingTime ?? 2000;
    config.maxWalkingTime = maxWalkingTime ?? config.maxWalkingTime ?? 4000;
    config.minActionsInterval = minActionsInterval ?? config.minActionsInterval ?? 0;
    config.maxActionsInterval = maxActionsInterval ?? config.maxActionsInterval ?? 500;
    config.breaking = breaking ?? config.breaking ?? [2, 3, 5, 12, 13, 17];//1,4
    config.placing = placing ?? config.placing ?? [3, 5, 12, 13, 17];//4
    config.chatting = chatting ?? config.chatting ?? true;
    config.chatMessages = chatMessages ?? config.chatMessages ??
        ['!que', '!queue'];
    config.chatInterval = chatInterval ?? config.chatInterval ?? 300000;
    //killaura config
    config.killaura = killauraEnabled ?? config.killauraEnabled ?? true;
    if(config.killaura) modules.killaura.start(bot);
    else modules.killaura.stop(bot);
    //autoeat plugin config
    config.autoEatEnabled = autoEatEnabled ?? config.autoEatEnabled ?? true; 
    bot.autoEat.options = autoEatConfig ?? bot.autoEat.options ?? 
    {
        priority: "foodPoints",
        startAt: 14,
        bannedFood: [],
    }
    if(config.autoEatEnabled) bot.autoEat.enable();
    else bot.autoEat.disable();
}

function stop(bot){
    bot.afk.stopping = true;
    return new Promise((resolve)=>{
        if(!bot.afk.enabled) resolve('nothing to stop');
        if(bot.afk.isFishing)
            bot.activateItem(); //stop fishing(required for mineflyer to not get bugged)

        clearInterval(bot.afk.chatInterval);
        bot.afk.chatInterval = null;
        bot.autoEat.disable();
        modules.killaura.stop(bot);

        setInterval(()=>{
            if(bot.afk.stopped){
                bot.afk.stopping = null;
                bot.afk.stopped = null;
                bot.afk.enabled = false;
                resolve('stopped successfully');
            }
        }, 500);
    })
}


function inject (bot) {
    bot.loadPlugin(autoeat);
    bot.afk = { 
        isFishing: false, 
        config: {},
        enabled: false,
        start: async ()=>{bot.afk.enabled = true; await start(bot)}, 
        stop: async ()=>await stop(bot),
        setOptions:(opt)=>setOptions(bot, {...opt}),
        fish: async ()=>await modules.fishing.fish(bot),
        rotate: async ()=>await rotate(bot),
        walk: async (dir)=>await modules.walking.walk(bot, dir),//TODO add sprint
        jump: async ()=>await jump(bot),
        jumpWalk: async ()=>await jumpWalk(bot),//TODO add jumpPlaceBlock
        swingArm: async ()=>await swingArm(bot),
        placeBlock: async ()=>await modules.blocks.placeBlock(bot),
        breakBlock: async ()=>await modules.blocks.breakBlock(bot),
        chat: ()=>chat(bot),
    };
    bot.afk.setOptions();
}
  
  
  module.exports = inject;