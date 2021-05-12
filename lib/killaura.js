module.exports.start = (bot) => {
    if(bot.afk.killaura && bot.afk.killaura.enabled) return;
    bot.afk.killaura = {enabled: true};
    bot.afk.killaura.interval = setInterval(()=>{
        let target = bot.afk.killaura.target;
        if(target && bot.entity.position.distanceTo(target.position) < 3)
            bot.attack(target);
    }, 200)
    bot.afk.killaura.movedHandler = (entity)=>{
        if(entity.kind == 'Hostile mobs' && bot.entity.position.distanceTo(entity.position) < 3)
            bot.afk.killaura.target = entity;
    }
    bot.on('entityMoved', bot.afk.killaura.movedHandler);
}
module.exports.stop = (bot) => {
    if(!bot.afk.killaura || !bot.afk.killaura.enabled) return;
    bot.removeListener('entityMoved', bot.afk.killaura.movedHandler);
    clearInterval(bot.afk.killaura.interval);
    bot.afk.killaura = {enabled: false};
}