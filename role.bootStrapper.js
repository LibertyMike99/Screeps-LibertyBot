//Import dependencies here

module.exports = {
    run: function(creep) {
        if (creep.spawning) {
            return;
        }
        if (creep.getBoosted()) {
            return;
        }
        
        if (creep.room.name == creep.memory.homeRoom && creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] && !creep.memory.transit) {
            if (!creep.isFull) {
                if (creep.withdraw(creep.room.storage,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage);
                    return;
                }
            } else {
                creep.memory.transit = true;
                if (creep.memory.targetRoom) {
                    creep.moveTo(Game.rooms[creep.memory.targetRoom].controller);
                }
            }
        } else if (creep.memory.targetRoom && creep.room.name != creep.memory.targetRoom) {
            if (creep.memory.transit) {
                //creep.moveTo(Game.rooms[creep.memory.targetRoom].controller);
                if (!creep.memory.route || creep.memory.route < 0 || !creep.memory.route.includes(creep.room.name) || !creep.memory.route.includes(creep.memory.targetRoom)) {
                //console.log(creep.room.name,creep.memory.targetRoom);
                creep.memory.route = Game.map.findRoute(creep.room.name,creep.memory.targetRoom, {
                    routeCallback: function(roomName) {
                        let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                        let isHighway = (parsed[1] % 10 === 0) || 
                                (parsed[2] % 10 === 0);
                        let isMyRoom = Game.rooms[roomName] &&
                            Game.rooms[roomName].controller &&
                            (Game.rooms[roomName].controller.my ||
                            Game.rooms[roomName].controller.reservation &&
                            Game.rooms[roomName].controller.reservation.username == MY_USERNAME);
                        //console.log(roomName,isHighway, isMyRoom);
                        if (isHighway || isMyRoom) {
                            return 1;
                        } else {
                            return 2.5;
                        }
                        if (Game.map.getRoomStatus(roomName).status != 'normal') return Infinity;
                        if (roomName == 'W37S9') return Infinity;
                    }
                });
                //creep.memory.route = Game.map.findRoute(creep.room.name,creep.memory.targetRoom);
                //console.log(creep.memory.route);
                creep.memory.route = creep.memory.route.map((r) => r.room);
                creep.memory.route.unshift(creep.room.name);
            }
            //console.log(target);
            //creep.say(creep.memory.route[creep.memory.route.indexOf(creep.room.name) + 1]);
            let target = creep.room.findExitTo(creep.memory.route[creep.memory.route.indexOf(creep.room.name) + 1]);
            creep.moveTo(creep.pos.findClosestByPath(target),{reusePath: 50});
                
            } else {
                if (creep.room.name == creep.memory.homeRoom) {
                    creep.say('Go Home!');
                    creep.moveTo(Game.rooms[creep.memory.homeRoom].storage,{reusePath: 50});
                } else {
                    let target = creep.room.findExitTo(creep.memory.route[creep.memory.route.indexOf(creep.room.name) - 1]);
                    creep.moveTo(creep.pos.findClosestByPath(target),{reusePath: 50});
                }
            }
        } else {
            if (creep.memory.transit) {
                if (creep.isEmpty) {
                    creep.memory.transit = false;
                    return;
                }
                let buildOrder = [STRUCTURE_TOWER,STRUCTURE_SPAWN,STRUCTURE_LINK,STRUCTURE_EXTENSION,STRUCTURE_STORAGE,STRUCTURE_ROAD,STRUCTURE_TERMINAL,STRUCTURE_WALL,STRUCTURE_RAMPART,STRUCTURE_CONTAINER,STRUCTURE_EXTRACTOR,STRUCTURE_LAB,STRUCTURE_OBSERVER,STRUCTURE_FACTORY]; // 
                let targs = [];
                for (let struct of buildOrder) {
                    targs = creep.room.find(FIND_CONSTRUCTION_SITES, {filter: {structureType: struct}});
                    if (targs.length) {
                        let targ = creep.pos.findClosestByRange(targs);
                        if (creep.pos.isEqualTo(targ)) {
                            creep.moveTo(creep.room.controller);
                            return;
                        }
                        if (creep.build(targ) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(targ);
                        } else {
                            creep.stay(creep.memory.priority);
                        }
                        return;
                    }
                    targs = creep.room.find(FIND_STRUCTURES, {filter: (s) => {
                        return s.structureType == struct && s.hits / s.hitsMax < .75 && s.hits < s.hitsMax && s.hits < 10000;
                    }});
                    if (targs.length) {
                        let targ = creep.pos.findClosestByPath(targs);
                        if (creep.repair(targ) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(targ);
                        } else {
                            creep.stay(creep.memory.priority);
                        }
                        return;
                    }
                }
                
                targs = creep.room.find(FIND_MY_STRUCTURES, {filter: (s) => {
                    return s.structureType == STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 200;
                }});
                if (targs.length) {
                    let targ = creep.pos.findClosestByPath(targs);
                    if (creep.transfer(targ,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targ);
                    } else {
                        creep.stay(creep.memory.priority);
                    }
                    return;
                }
                
                targs = creep.room.find(FIND_MY_STRUCTURES, {filter: (s) => {
                    return (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && 
                    s.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }});
                if (targs.length) {
                    let targ = creep.pos.findClosestByPath(targs);
                    if (creep.transfer(targ,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targ);
                    } else {
                        creep.stay(creep.memory.priority);
                    }
                    return;
                }
                
                if (creep.room.storage && creep.room.storage.store.getCapacity(RESOURCE_ENERGY) > 2000 && creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < 50000) {
                    if (creep.transfer(creep.room.storage,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.storage);
                        return;
                    }
                }
                
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                } else {
                    creep.stay(creep.memory.priority);
                }
            } else {
                if (creep.isFull) {
                    creep.memory.transit = true;
                }
                
                let targs = creep.room.find(FIND_DROPPED_RESOURCES,{filter:{resourceType: RESOURCE_ENERGY}});
                if (targs.length) {
                    let targ = creep.pos.findClosestByPath(targs);
                    if (creep.pickup(targ) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targ);
                    } else {
                        creep.stay(creep.memory.priority);
                    }
                    return;
                }
                
                targs = creep.room.find(FIND_TOMBSTONES, {filter : (t) => {
                    return t.store[RESOURCE_ENERGY] > 0
                }});
                if (targs.length) {
                    let targ = creep.pos.findClosestByPath(targs);
                    if (creep.withdraw(targ,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targ);
                    } else {
                        creep.stay(creep.memory.priority);
                    }
                    return;
                }
                
                targs = creep.room.find(FIND_RUINS, {filter : (t) => {
                    return t.store[RESOURCE_ENERGY] > 0
                }});
                if (targs.length) {
                    let targ = creep.pos.findClosestByPath(targs);
                    if (creep.withdraw(targ,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targ);
                    } else {
                        creep.stay(creep.memory.priority);
                    }
                    return;
                }
                
                targs = creep.room.find(FIND_STRUCTURES, {filter : (s) => {
                    return s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0 || s.structureType == STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] > 100000
                }});
                if (targs.length) {
                    let targ = creep.pos.findClosestByPath(targs);
                    if (creep.withdraw(targ,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targ);
                    } else {
                        creep.stay(creep.memory.priority);
                    }
                    return;
                }
                
                targs = creep.room.find(FIND_SOURCES_ACTIVE).filter(source => source.pos.openNeighbors.length > 0 || creep.pos.isNearTo(source));
                if (targs.length) {
                    let targ = creep.pos.findClosestByPath(targs);
                    if (creep.harvest(targ) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targ);
                    } else {
                        creep.stay(creep.memory.priority);
                    }
                    return;
                }
                /*
                targs = creep.room.find(FIND_SOURCES);
                if (targs.length) {
                    let targ = creep.pos.findClosestByPath(targs);
                    if (creep.pos.getRangeTo(targ) > 1) {
                        creep.moveTo(targ);
                    } else {
                        creep.stay(creep.memory.priority);
                    }
                    return;
                }
                */
                if (!creep.isEmpty) {
                    creep.memory.transit = true;
                    return;
                }
                let target = creep.room.findExitTo(creep.memory.route[creep.memory.route.indexOf(creep.room.name) - 1]);
                creep.moveTo(creep.pos.findClosestByPath(target),{reusePath: 50});
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
        'head': [WORK],
        'torso': [CARRY],
        'tail': [MOVE],
        'numberOfHeads': 10,
        'numberOfTails': 25,
        'maxEnergy': Infinity,
        'maxTorsos': 30,
        'maxBodyParts': 50,
        'memory': {role: 'bootStrapper', transit: false, priority: 2},
        'boosts': {
            carry: ['KH']
        } 
    },
    
    spawnInstructions: function(info) {
        console.log(info.home);
        if (info.home.controller.level == 8) {
            return module.exports.spawnInfo;
        } else {
            return {
                head: [],
                torso: [WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
                tail: [],
                memory: {role: 'bootStrapper', transit: false, priority: 3}
            }
        }
    }
};