//var roleHarvester = require('role.harvester.old');

module.exports = {
    run: function(creep) {
        if (creep.room.storage &&
            creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) >= 0) {
            //console.log('Step 1');
            var structures = creep.room.find(FIND_MY_STRUCTURES, {filter:
                (s) => (s.structureType == STRUCTURE_EXTENSION ||
                s.structureType == STRUCTURE_SPAWN) &&
                s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            });
            
            var structure = creep.pos.findClosestByPath(structures);
            
            
            if (structure == undefined || creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
                creep.memory.transit = false;
            }
            else if (creep.memory.transit == false && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                creep.memory.transit = true;
            }
            if (creep.memory.transit) {
                if (creep.transfer(structure,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(structure);
                };
            }
            else if (creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0){
                if (creep.withdraw(creep.room.storage,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage);
                }
            }
            else {
                let target = creep.pos.findClosestByPath(
                        FIND_MY_STRUCTURES, {filter: (s) => s.structureType != STRUCTURE_SPAWN &&
                            s.structureType != STRUCTURE_EXTENSION && s.store &&
                            s.store.getUsedCapacity(RESOURCE_ENERGY) > 0});
                //console.log(target);
                if (target) {
                    //console.log(true);
                    if (creep.withdraw(target,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
                else {
                    roleBootStrapper.run(creep);
                }
            }
        }
        else {
            roleBootStrapper.run(creep);
        }
    
    },
    
    spawnInfo: {
        /*creep spawning instructions here
         *head is FIRST, least protected
         *torso fills in body
         *tail is LAST, most protected
         memory is the initial creep memory
         */
        'head': [WORK],
        'torso': [CARRY,MOVE],
        'tail': [],
        'numberOfHeads': 1,
        'numberOfTails': 1,
        'maxEnergy': Infinity,
        'maxTorsos': 5,
        'maxBodyParts': 50,
        'memory': {role: 'savior', transit: false}
    }
};