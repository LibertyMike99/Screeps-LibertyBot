module.exports = {
    run: function(creep) {
        //if creep is transporting energy to upgrader but has none left
        if (creep.memory.transit == true && creep.store.getUsedCapacity() == 0) {
            //switch state
            creep.memory.transit = false;
        }
        //if creep is harvesting but energy is full
        else if (creep.memory.transit == false && creep.store.getFreeCapacity() == 0) {
            //switch state
            creep.memory.transit = true;
        }
    
        //if creep is transitting energy to upgrader
        if (creep.memory.transit == true) {
            //attempt to transfer energy; if upgrader is not adjacent, 
            if (creep.transfer(creep.room.controller, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE || creep.pos.findInRange(creep.room.sources,1).length) {
                //move towards upgrader
                creep.moveTo(creep.room.controller);
            }
        }
        //if creep is harvesting energy
        else {
            if (creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] > 0) {
                if (creep.withdraw(creep.room.storage,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage);
                }
                return;
            }
            //find closest source
            var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            //attempt to harvest energy; if source is not adjacent, 
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                //move towards source
                creep.moveTo(source);
            }
        }
    },
    
    spawnInfo: {
        'head': [WORK],
        'torso': [CARRY,CARRY,MOVE],
        'tail': [MOVE],
        'numberOfHeads': 6,
        'numberOfTails': 6,
        'maxTorsos': 3,
        'memory': {role:'upgrader.old', transit:false}
    }
};