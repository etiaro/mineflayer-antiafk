module.exports.start = (bot) => {
    let target;
    let interval = setInterval(()=>{
        if(target && bot.entity.position.distanceTo(target.position) < 3){
            bot.attack(target);
        }
    }, 200)
    bot.on('entityMoved', (entity)=> {
        if(entity.kind == 'Hostile mobs' && bot.entity.position.distanceTo(entity.position) < 3){
            target = entity;
        }
    });
}