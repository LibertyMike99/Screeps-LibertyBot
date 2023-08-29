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
            
            var structures = _.filter(creep.room.find(FIND_STRUCTURES), function(s) {
                return s.structureType == STRUCTURE_SPAWN ||
                s.structureType == STRUCTURE_EXTENSION ||
                s.structureType == STRUCTURE_TOWER ||
                s.structureType == STRUCTURE_STORAGE;
            });
            
            var targets = _.filter(structures, function(s) {
                return s.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            });
            //console.log('targets ' + targets);
            
            
            var target = creep.pos.findClosestByPath(targets);
            
            if (target != undefined) {
                //attempt to transfer energy to closest spawn/extension; if spawn/extension is not adjacent, 
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    //console.log('moving to spawn/extnesion');
                    //move towards spawn/extension
                    creep.moveTo(target);
                }
            }
            else {
                target = creep.room.find(FIND_MY_STRUCTURES, {filter : (s) => 
                    s.structureType == STRUCTURE_STORAGE
                    }
                );
                
                if (!target.length) {roleUpgraderOld.run(creep);}
                
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    //console.log('moving to spawn/extnesion');
                    //move towards spawn/extension
                    creep.moveTo(target);
                }
            }
        }
        //if creep is harvesting energy
        else {
            var resources = creep.pos.lookFor(LOOK_RESOURCES);
            var resource = creep.pos.findClosestByPath(resources);
            if (resource != undefined) {
                if (creep.pickup(resource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(resource);
                }
            }
            else {
                //find closest source
                var source = creep.pos.findClosestByPath(creep.room.openSources);
                if (source != undefined) { 
                //attempt to harvest energy; if source is not adjacent, 
                    if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                        //move towards source
                        creep.moveTo(source);
                    } else {
                        creep.stay(-1);
                    }
                }
                else if (creep.store.getUsedCapacity() > 0) {
                    creep.memory.transit = true;
                }
                else {
                    source = creep.pos.findClosestByPath(FIND_SOURCES);
                    creep.moveTo(source);
                }
            }
        }
    },
    
    spawnInfo: {
        'head': [],
        'torso': [WORK,CARRY,MOVE],
        'tail': [],
        'maxTorsos': 10,
        'memory': {role:'harvester.old', transit:false}
    }
};
