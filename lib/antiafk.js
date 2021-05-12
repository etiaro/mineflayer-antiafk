const utils = require('./utils');
const killaura = require('./killaura')
const Vec3 = require('vec3');
const autoeat = require("mineflayer-auto-eat")

function randomElement(arr){
    return arr[Math.floor(Math.random() * arr.length)]
}
function randomTime(min, max){
    let time = min;
    time = time + Math.random()*(max - time);
    return time;
}

async function fishingObjections(bot){
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
async function fish(bot) {
	let obj = await bot.afk.fishingObjections();
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
const walkActions = [ 'forward', 'back', 'left', 'right'];
function walk(bot, direction){
    let time = randomTime(bot.afk.config.minWalkingTime, bot.afk.config.maxWalkingTime);
	return new Promise((resolve, reject) => {
        let action = direction ?? randomElement(walkActions);
		bot.setControlState(action, true);
		setTimeout(() => {
			bot.clearControlStates();
			if(bot.entity.isInWater)
				bot.setControlState('jump', true);
			resolve();
		}, time);
	});
}
async function rotate(bot){
    let yaw = 2*Math.random()*Math.PI - (0.5*Math.PI);
    let pitch = Math.random()*Math.PI - (0.5*Math.PI);
    await bot.look(yaw,pitch,false);
}
function jump(bot){
    return new Promise((resolve, reject) => {
        bot.setControlState('jump',true);
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
async function placeBlock(bot){
    let availableItems = bot.inventory.items()
        .map((i)=>i.type)
        .filter(v => bot.afk.config.placing.includes(v));
    let block = randomElement(availableItems);
    try{
        await bot.equip(block, 'hand');
        let refBlock = bot.blockAtCursor();
        if(refBlock){
            const faces = {
                0: new Vec3(0, -1, 0),
                1: new Vec3(0, 1, 0),
                2: new Vec3(0, 0, -1),
                3: new Vec3(0, 0, 1),
                4: new Vec3(-1, 0, 0),
                5: new Vec3(1, 0, 0),
            }
            let face = faces[refBlock.face];
            
            await bot.placeBlock(refBlock, face);
        }
    }catch(err){}
}

async function breakBlock(bot){
    let block = bot.findBlock({matching: bot.afk.config.breaking, maxDistance: 4,
        useExtraInfo: block=>{
            return utils.canSeeBlock(bot, block) &&
            !utils.standingOn(bot, block) &&
            !utils.isFluid(bot.blockAt(block.position.plus(new Vec3(1,0,0)))) &&
            !utils.isFluid(bot.blockAt(block.position.plus(new Vec3(0,0,1)))) &&
            !utils.isFluid(bot.blockAt(block.position.plus(new Vec3(-1,0,0)))) &&
            !utils.isFluid(bot.blockAt(block.position.plus(new Vec3(0,-1,0)))) &&
            !utils.isFluid(bot.blockAt(block.position.plus(new Vec3(0,0,-1))));
        }});
    
    if(block)
        try{
            await bot.equip(utils.bestHarvestTool(bot, block), 'hand');
            await bot.dig(block);
        }catch(err){}
}
function chat(bot){
    bot.chat(randomElement(bot.afk.config.chatMessages));
}
async function start(bot){
    if(!bot.afk.chatInterval) 
        bot.afk.chatInterval = setInterval(bot.afk.chat, bot.afk.config.chatInterval)
	if(bot._client.state != "play"){
		bot.once("spawn", ()=>start(bot)); 
		return;
	}
    if(bot.afk.config.autoEatEnabled)
        bot.autoEat.enable();

	if (bot.afk.config.fishing){
		if(!await bot.afk.fishingObjections()){
			bot.afk.fish();
			return;
		}
	}

    await bot.afk[randomElement(bot.afk.config.actions)]();
    let time = randomTime(bot.afk.config.minActionsInterval, bot.afk.config.maxActionsInterval);
	setTimeout(()=>start(bot), time);
}

function setOptions(bot, {actions, fishing,
        minWalkingTime, maxWalkingTime, 
        minActionsInterval, maxActionsInterval, 
        breaking, placing, 
        chatting, chatMessages, chatInterval, 
        autoEatEnabled, autoEatConfig}){
    let config = bot.afk.config;
    config.actions = actions ?? config.actions ?? 
        ['rotate', 'walk', 'jump', 'jumpWalk', 'swingArm', 'placeBlock', 'breakBlock'];
    config.fishing = fishing ?? config.fishing ?? true;
    config.minWalkingTime = minWalkingTime ?? config.minWalkingTime ?? 2000;
    config.maxWalkingTime = maxWalkingTime ?? config.maxWalkingTime ?? 4000;
    config.minActionsInterval = minActionsInterval ?? config.minActionsInterval ?? 0;
    config.maxActionsInterval = maxActionsInterval ?? config.maxActionsInterval ?? 500;
    config.breaking = breaking ?? config.breaking ?? [1, 2, 3, 4, 5, 12, 13, 17];
    config.placing = placing ?? config.placing ?? [3, 4, 5, 12, 13, 17];
    config.chatting = chatting ?? config.chatting ?? true;
    config.chatMessages = chatMessages ?? config.chatMessages ??
        ['Hi!', 'What am I doing here?', 'Oh, I dont care'];
    config.chatInterval = chatInterval ?? config.chatInterval ?? 50000;
    config.autoEatEnabled = autoEatEnabled ?? config.autoEatEnabled ?? true; 
    //autoeat plugin config
    bot.autoEat.options = autoEatConfig ?? bot.autoEat.options ?? 
    {
        priority: "foodPoints",
        startAt: 14,
        bannedFood: [],
    }
}

async function stop(bot){
    if(bot.isFishing)
        await bot.activateItem(); //stop fishing(required for mineflyer to not get bugged)

    bot.autoEat.disable();
    clearInterval(bot.afk.chatInterval);
    bot.afk.chatInterval = null;
}


function inject (bot) {
    bot.loadPlugin(autoeat);
    killaura.start(bot);

    bot.afk = { 
        isFishing: false, 
        config: {},
        start: ()=>start(bot), 
        stop:()=>stop(bot),
        setOptions:(opt)=>setOptions(bot, {...opt}),
        fish: ()=>fish(bot),
        fishingObjections: ()=>fishingObjections(bot),
        rotate: ()=>rotate(bot),
        walk: (dir)=>walk(bot, dir),
        jump: ()=>jump(bot),
        jumpWalk: ()=>jumpWalk(bot),
        swingArm: ()=>swingArm(bot),
        placeBlock: ()=>placeBlock(bot),
        breakBlock: ()=>breakBlock(bot),
        chat: ()=>chat(bot),
     };
    bot.afk.setOptions();
}
  
  
  module.exports = inject;