const { Vec3 } = require("vec3")

module.exports.randomElement = (arr)=>{
    return arr[Math.floor(Math.random() * arr.length)]
}
module.exports.randomTime = (min, max) => {
    let time = min;
    time = time + Math.random()*(max - time);
    return time;
}


module.exports.canSeeBlock = (bot, block) => {
    const headPos = bot.entity.position.offset(0, bot.entity.height, 0)
    const range = headPos.distanceTo(block.position)
    const dir = block.position.offset(0.5, 0.5, 0.5).minus(headPos)
    const match = (inputBlock, iter) => {
    const intersect = iter.intersect(inputBlock.shapes, inputBlock.position)
    if (intersect) { return true }
        return block.position.equals(inputBlock.position)
    }
    const blockAtCursor = bot.world.raycast(headPos, dir.normalize(), range, match)
    return blockAtCursor && blockAtCursor.position.equals(block.position)
}

module.exports.bestHarvestTool = (bot, block) => {
    const availableTools = bot.inventory.items()
    const effects = bot.entity.effects

    let fastest = Number.MAX_VALUE
    let bestTool = null
    for (const tool of availableTools) {
      const enchants = (tool && tool.nbt) ? nbt.simplify(tool.nbt).Enchantments : []
      const digTime = block.digTime(tool ? tool.type : null, false, false, false, enchants, effects)
      if (digTime < fastest) {
        fastest = digTime
        bestTool = tool
      }
    }

    return bestTool;
}


const fluids = [8, 9, 10, 11];
module.exports.isFluid = (block)=>{
    return fluids.includes(block.type);
}

module.exports.standingOn = (bot, block)=>{
    return bot.entity.position.minus(new Vec3(0,1,0)).floored().equals(block.position);
}