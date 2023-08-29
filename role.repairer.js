//var roleUpgrader = require('role.upgrader');

module.exports = {
    run: function(creep) {
        if (creep.getBoosted()) {
            return;
        }
        //creep.say('Hello');
        //if creep is transporting energy to structure but has none left
        if (creep.memory.transit == true && creep.store.getUsedCapacity() == 0) {
            //switch state
            creep.memory.transit = false;
        }
        //if creep is harvesting but energy is full
        else if (creep.memory.transit == false && creep.store.getFreeCapacity() == 0) {
            //switch state
            creep.memory.transit = true;
        }
    
        //if creep is transitting energy to structure
        if (creep.memory.transit == true) {
            
            //find all structures that need repair
            var structures = _.filter(creep.room.find(FIND_STRUCTURES), function(s) {
                
                //if structure is not a wall or rampart
                if (s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART &&
                s.structureType != STRUCTURE_ROAD) {
                    //return if it has damage
                    return s.hits < s.hitsMax;
                }
                //if structure is wall or rampart
                else {
                    let tiers = [0,100,1000,5000,10000,100000,500000,1000000,10000000];
                    //return if it has less than this amount of hits left
                    let hitAmt = tiers[creep.room.controller.level];
                    return s.hits < hitAmt && s.hits < s.hitsMax && s.structureType != STRUCTURE_ROAD;
                }
            });
            
            //find closest damaged structure
            var structure = creep.pos.findClosestByRange(structures);
            
            //if there are damaged structures
            if (structure != undefined) {
                //creep.say(structure.structureType);
                
                //attempt to repair structure
                if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
                    //move closer if not in range
                    creep.moveTo(structure);
                }
            }
            
            
                
            //otherwise upgrade controller
            else {
                //creep.say('Nope.');
                //console.log(creep.name + ' is upgrading instead');
                //roleUpgrader.run(creep);
            }
        }
    
        //if creep is harvesting energy
        else {
            if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                //move towards source
                creep.moveTo(creep.room.storage, {ignoreCreeps: false});
            }
        }
    },
    
    spawnInfo: {
        'head': [],
        'torso': [WORK,CARRY],
        'tail': [MOVE],
        'numberOfTails': 24,
        'maxTorsos': 24,
        'maxBodyParts': 48,
        'memory': {role:'repairer', transit:false},
        'boosts': {'carry': ['KH']}
    }
};