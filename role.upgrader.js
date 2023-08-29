//Import dependencies here

module.exports = {
    run: function(creep) {
        if (creep.spawning) {
            return;
        }
        if (creep.getBoosted()) {
            return;
        }
        if (creep.body.some((p) => p.boost) && creep.ticksToLive < 125) {
            creep.memory.role = 'retiree';
        }
        targetPos = creep.room.getPositionAt(
            creep.room.memory.base.controller.x,creep.room.memory.base.controller.y
        );
        if (!(creep.pos.isNearTo(targetPos))) { 
            creep.moveTo(targetPos);
        }
        else {
            var link = Game.getObjectById(creep.room.memory.links.controller);
            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                creep.upgradeController(creep.room.controller);
            }
            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) <= 45) {
                creep.withdraw(link,RESOURCE_ENERGY);
            }
            if (!creep.room.controller.sign || creep.room.controller.sign.username != creep.owner.username) {
                creep.signController(creep.room.controller, 'Live Long and Prosper 🖖');
            }
            creep.stay(1);
        }
    
    },
    
    spawnInfo: {
        /*creep spawning instructions here
         *head is FIRST, least protected
         *torso fills in body
         *tail is LAST, most protected
         memory is the initial creep memory
         */
        'head': [MOVE],
        'torso': [WORK],
        'tail': [CARRY,MOVE,MOVE],
        'numberOfHeads': 2,
        'numberOfTails': 3,
        'maxEnergy': Infinity,
        //'maxTorsos': 30,
        //'maxBodyParts': 26,
        'memory': {role: 'upgrader', earlyReplace: true, priority:5},
        'boosts': {work: [RESOURCE_CATALYZED_GHODIUM_ACID]}
    },
    
    spawnInstructions: function(info) {
        //console.log(info.home);
        let data = (Game.rooms[info.home].controller.level < 8 ) ?
        {maxTorsos: 30 * (Game.market.credits >= 1000000 ? 2 : 1), maxBodyParts: 41} :
        {maxTorsos: 15 * (Game.market.credits >= 1000000 ? 2 : 1), maxBodyParts: 26};
        //console.log(JSON.stringify({...module.exports.spawnInfo,...data}));
        return {...module.exports.spawnInfo,...data}; 
    }
};