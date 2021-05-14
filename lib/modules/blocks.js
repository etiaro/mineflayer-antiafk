const utils = require('../utils');
const Vec3 = require('vec3');

module.exports.placeBlock = async (bot) => {
    let availableItems = bot.inventory.items()
        .map((i)=>i.type)
        .filter(v => bot.afk.config.placing.includes(v));
    let block = utils.randomElement(availableItems);
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

module.exports.breakBlock = async (bot) => {
    if(bot.entity.isInWater) return; //mineflayer is broken when digging in water TODO isInWater not always working 
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
            let bestTool = utils.bestHarvestTool(bot, block);
            if(bestTool)
                await bot.equip(bestTool, 'hand');
            await bot.dig(block);
        }catch(err){}
}