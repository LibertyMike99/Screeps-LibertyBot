module.exports = {
    run: function(creep) {
        if (creep.getBoosted()) {
            return;
        }
        if (creep.memory.transit) {
            if (creep.isEmpty) {
                creep.memory.transit = false;
                return;
            }
            let home = Game.rooms[creep.memory.homeRoom].terminal || Game.rooms[creep.memory.homeRoom].storage;
            for (let resource in creep.store) {
                if (resource == RESOURCE_ENERGY) {
                    home = Game.rooms[creep.memory.homeRoom].storage;
                }
                if (creep.transfer(home,resource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(home,{reusePath: 50,maxOps:20000});
                    break;
                }
            }
        } else {
            if (creep.isFull) {
                creep.memory.transit = true;
                return;
            }
            if (creep.room.name == creep.memory.targetRoom) {
                
                let tombs = creep.room.find(FIND_TOMBSTONES, {filter: (t) => {
                    return t.store.getUsedCapacity() > 0;
                }});
                if (tombs.length) {
                    tombs.sort((last,next) => {
                        return creep.pos.getRangeTo(last) - creep.pos.getRangeTo(next);
                    });
                    for (let tomb of tombs) {
                        if (!creep.pos.isNearTo(tomb)) {
                            creep.moveTo(tomb);
                            return;
                        }
                        for (let resource in tomb.store) {
                            creep.withdraw(tomb,resource);
                        }
                    }
                    return;
                }
                
                let structures = creep.room.find(FIND_STRUCTURES, {filter: (s) => {
                    return s.store && s.store.getUsedCapacity() > 0;
                }});
                if (structures.length && !creep.room.controller.safeMode > 0) {
                    structures.sort((last,next) => {
                        return creep.pos.getRangeTo(last) - creep.pos.getRangeTo(next);
                    });
                    for (let structure of structures) {
                        if (!creep.pos.isNearTo(structure)) {
                            creep.moveTo(structure);
                            return;
                        }
                        for (let resource in structure.store) {
                            creep.withdraw(structure,resource);
                        }
                    }
                    return;
                }
                
                let resources = creep.room.find(FIND_DROPPED_RESOURCES);
                if (resources.length) {
                    resources.sort((last,next) => {
                        return creep.pos.getRangeTo(last) - creep.pos.getRangeTo(next);
                    });
                    for (let resource of resources) {
                        if (creep.pickup(resource) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(resource);
                            return;
                        }
                    }
                    return;
                }
                
                //_.filter(Memory.rooms[creep.memory.homeRoom].scavengeRooms, {filter: {(r) => r != creep.room.name}});
                creep.memory.transit = true;
            } else {
                creep.moveTo(Game.rooms[creep.memory.targetRoom].controller, {reusePath:50});
            }
        }
    },
    
    spawnInfo: {
        /*creep spawning instructions here
         *head is FIRST, least protected
         *torso fills in body
         *tail is LAST, most protected
         memory is the initial creep memory
         */
        'head': [],
        'torso': [CARRY],
        'tail': [MOVE],
        'numberOfHeads': 0,
        'numberOfTails': 25,
        'maxEnergy': Infinity,
        'maxTorsos': 50,
        'maxBodyParts': 50,
        'memory': {role: 'scavenger', transit: false, earlyReplace: true, priority:1},
        'boosts': {
            carry: ['KH']
        }
    },
    
    spawnInstructions: function(info) {
        return module.exports.spawnInfo;
    }

};