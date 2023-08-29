module.exports = {
    run: function(creep) {
        //if creep is transporting energy to spawn but has none left
        if (creep.memory.transit == true && creep.isEmpty) {
            //switch state
            creep.memory.transit = false;
        }
        //if creep is harvesting but energy is full
        else if (creep.memory.transit == false &&
        (creep.isFull || creep.store.getUsedCapacity(RESOURCE_ENERGY) >= 60)) {
            //switch state
            creep.memory.transit = true;
        }
    
        //if creep is transitting energy
        if (creep.memory.transit == true) {
            
            var targets = _.filter(creep.room.find(FIND_MY_STRUCTURES), (s) =>
                (s.structureType == STRUCTURE_LINK ||
                s.structureType == STRUCTURE_STORAGE ||
                s.structureType == STRUCTURE_CONTAINER) &&
                s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            );
            
            
            //console.log('targets ' + targets);
            
            let cpu = Game.cpu.getUsed();
            var target = creep.pos.findClosestByPath(targets);
            //console.log('Source: ',cpu-Game.cpu.getUsed());
            
            if (target != undefined) {
                //attempt to transfer energy to closest spawn/extension; if spawn/extension is not adjacent, 
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    //console.log('moving to spawn/extnesion');
                    //move towards spawn/extension
                    creep.moveTo(target);
                }
            }
            
        }
        //if creep is harvesting energy
        else {
            var source;
            if (creep.memory.source) {
                source = Game.getObjectById(creep.memory.source)
            }
            else {
                //find closest source
                var sources = []
                for (var link of creep.room.memory.links.sources) {
                    var linkSources = creep.room.openSources.filter(
                        function(s) {
                            return s.pos.inRangeTo(Game.getObjectById(link).pos,2);
                        }
                    );
                    linkSources.map(s => sources.push(s));
                }
                source = creep.pos.findClosestByPath(sources);
            }
            if (source != undefined) { 
                //attempt to harvest energy; if source is not adjacent, 
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    //move towards source
                    creep.moveTo(source);
                } else {
                    creep.stay(1);
                }
                creep.memory.source = source.id;
                source.creeps = creep;
            }
            else if (creep.store.getUsedCapacity() > 0) {
                creep.memory.transit = true;
            }
        }
    },
    
    spawnInfo: {
        'head': [WORK],
        'torso': [CARRY],
        'tail': [CARRY,MOVE,MOVE,MOVE],
        'maxTorsos': 1,
        'numberOfHeads': 6,
        'memory': {role:'harvester', transit:false}
    }
};