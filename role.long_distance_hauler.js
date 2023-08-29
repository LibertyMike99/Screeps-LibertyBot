module.exports = {
    run: function(creep) {
        //if creep is transporting energy to home but has none left
        if (creep.memory.transit == true && creep.store.getUsedCapacity() == 0) {
            //switch state
            console.log(creep.name);
            creep.memory.transit = false;
            if (creep.room.name != creep.memory.targetRoom) {
                let remoteRooms = Game.rooms[creep.memory.homeRoom].memory.remoteRooms;
                if (creep.memory.targetRoom == undefined) {
                    creep.memory.targetRoom = remoteRooms[0];
                }
                let index = remoteRooms.indexOf(creep.memory.targetRoom);
                if (index == remoteRooms.length - 1) {
                    creep.memory.targetRoom = remoteRooms[0];
                }
                else {
                    creep.memory.targetRoom = remoteRooms[index + 1];
                }
            }
        }
        //if creep is collecting but energy is full
        else if (creep.memory.transit == false && creep.store.getFreeCapacity() == 0) {
            //switch state
            creep.memory.transit = true;
        }
    
        //if creep is transitting energy to spawn
        if (creep.memory.transit == true) {
            if (creep.room.name == creep.memory.homeRoom) {
                var structures = _.filter(creep.room.find(FIND_MY_STRUCTURES), function(s) {
                    return s.structureType == STRUCTURE_STORAGE;
                });
                
                var targets = _.filter(structures, function(s) {
                    return s.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                });
                //console.log('targets ' + targets);
                
                
                var target = creep.pos.findClosestByPath(targets);
                
                //attempt to transfer energy to closest spawn/extension; if spawn/extension is not adjacent, 
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
            else {
                var containers = creep.room.find(FIND_MY_CONSTRUCTION_SITES, {filter:
                (s) => s.structureType == STRUCTURE_CONTAINER });
                let adjacentContainer = false;
                if (containers.length) {
                    for (let container of containers) {
                        if (creep.pos.isNearTo(container)) {
                            creep.collect(creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES));
                            adjacentContainer = true;
                            break;
                        }
                    }
                }
                if (adjacentContainer == false) {
                    var exit = creep.room.findExitTo(creep.memory.homeRoom);
                    if (creep.buildRoute == ERR_NAME_EXISTS) {
                        creep.moveTo(creep.pos.findClosestByPath(exit));
                    }
                }
            }
        }
        //if creep is collecting energy
        else {
            if (creep.room.name == creep.memory.targetRoom) {
                //find closest source
                var sources = creep.room.find(FIND_DROPPED_RESOURCES, {filter :
                    (r) => r.amount >= creep.store.getCapacity() / 2
                }).concat(creep.room.find(FIND_STRUCTURES, {filter:
                    (s) => s.structureType == StructureContainer &&
                    s.store.getUsedCapacity(RESOURCE_ENERGY) >=
                        creep.store.getCapacity() / 2}
                ));
                if (sources.length) {
                    
                    //source = creep.pos.findClosestByPath(sources);
                    source = sources[sources.map(s => s.amount).indexOf(
                        (sources.map(s => s.amount).reduce(function(a,b) {
                            return Math.max(a,b);
                        })))];
                    //attempt to harvest energy; if source is not adjacent,
                    if (creep.collect(source) == ERR_NOT_IN_RANGE) {
                        //move towards source
                        creep.moveTo(source);
                    }
                }
                else {
                    let remoteRooms = Game.rooms[creep.memory.homeRoom].memory.remoteRooms;
                    if (creep.memory.targetRoom == undefined) {
                        creep.memory.targetRoom = remoteRooms[0];
                    }
                    let index = remoteRooms.indexOf(creep.memory.targetRoom);
                    if (index == remoteRooms.length - 1) {
                        creep.memory.targetRoom = remoteRooms[0];
                    }
                    else {
                        creep.memory.targetRoom = remoteRooms[index + 1];
                    };
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
        'torso': [CARRY,CARRY,MOVE],
        'tail': [MOVE],
        'memory': {role:'long_distance_hauler', transit:true, targetRoom:''},
        'numberOfHeads': 4,
        'numberOfTails': 2
    },
    
    spawnInstructions: function() {
        return module.exports.spawnInfo;
    }
};