module.exports = {
    run: function(creep) {
        //if creep is transporting energy to spawn but has none left
        if (creep.memory.transit == true && creep.store.getUsedCapacity() == 0) {
            //switch state
            creep.memory.transit = false;
        }
        //if creep is harvesting but energy is full
        else if (creep.memory.transit == false && creep.store.getFreeCapacity() == 0) {
            //switch state
            creep.memory.transit = true;
        }
    
        //if creep is transitting energy to spawn
        if (creep.memory.transit == true) {
            if (creep.room.name == creep.memory.homeRoom) {
                var structures = _.filter(creep.room.find(FIND_STRUCTURES), function(s) {
                    return s.structureType == STRUCTURE_SPAWN ||
                    s.structureType == STRUCTURE_EXTENSION ||
                    s.structureType == STRUCTURE_TOWER ||
                    s.structureType == STRUCTURE_STORAGE ||
                    s.structureType == STRUCTURE_CONTAINER;
                });
                
                var targets = _.filter(structures, function(s) {
                    return s.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                });
                //console.log('targets ' + targets);
                
                if (targets.length) {
                    var target = creep.pos.findClosestByPath(targets);
                    
                    //attempt to transfer energy to closest spawn/extension; if spawn/extension is not adjacent, 
                    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        //console.log('moving to spawn/extnesion');
                        //move towards spawn/extension
                        creep.moveTo(target);
                    }
                } else {
                    if (creep.room.find(FIND_MY_CONSTRUCTION_SITES).length) {
                        roleBuilder.run(creep);
                        return;
                    }
                    roleUpgraderOld.run(creep);
                }
            }
            else {
                var exit = creep.room.findExitTo(creep.memory.homeRoom);
                creep.moveTo(creep.pos.findClosestByPath(exit));
            }
        }
        //if creep is harvesting energy
        else {
            if (creep.room.name == creep.memory.targetRoom) {
                //find closest source
                var source = creep.pos.findClosestByPath(creep.room.openSources);
                //attempt to harvest energy; if source is not adjacent,
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    //move towards source
                    creep.moveTo(source);
                }
            }
            else {
                var exit = creep.room.findExitTo(creep.memory.targetRoom);
                creep.moveTo(creep.pos.findClosestByPath(exit));
            }
        }
    },
    
    spawnInfo: {
        'head': [WORK],
        'torso': [CARRY,MOVE],
        'tail': [MOVE],
        'memory': {role:'long_distance_harvester', transit:false},
        'numberOfHeads': 2,
        'numberOfTails': 2
    },
    
    spawnInstructions: function() {
        return module.exports.spawnInfo;
    }
};