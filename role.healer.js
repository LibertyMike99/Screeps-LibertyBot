module.exports = {
    run: function(creep) {
        if (creep.spawning) {
            if (creep.memory.targetRoom) {
                Memory.rooms[creep.memory.targetRoom].orders.hold = true;
                console.log(creep.name,'blocking',creep.memory.targetRoom);
            }
        }
        else if (creep.room.name != creep.memory.targetRoom) {
            var exit = creep.room.findExitTo(creep.memory.targetRoom)
            console.log(creep.pos,creep.name);
            if (!creep.pos.inRangeTo(creep.pos.findClosestByPath(exit),5)) {
                Memory.rooms[creep.memory.targetRoom].orders.hold = true;
                console.log(creep.name,'blocking',creep.memory.targetRoom);
            }
        }
        var creeps = creep.room.find(FIND_MY_CREEPS, {filter: 
            (c) => c.hits < c.hitsMax
        });
        target = creep.pos.findClosestByPath(creeps);
        
        if(target) {
            if(creep.heal(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
            creep.moveTo(target);
        }
        
        else if (creep.hits < creep.hitsMax) {
            creep.heal(creep);
        }
        
        else if (creep.memory.targetRoom != creep.room.name &&
            (!Memory.rooms[creep.memory.targetRoom] ||
            !Memory.rooms[creep.memory.targetRoom].orders ||
            !Memory.rooms[creep.memory.targetRoom].orders.hold)) {
            var exit = creep.room.findExitTo(creep.memory.targetRoom);
            creep.moveTo(creep.pos.findClosestByPath(exit));    
        }
        else if (creep.memory.targetRoom != creep.room.name &&
            (Memory.rooms[creep.memory.targetRoom] &&
            Memory.rooms[creep.memory.targetRoom].orders &&
            Memory.rooms[creep.memory.targetRoom].orders.hold)) {
                console.log('target room goings');
                let exit = creep.room.findExitTo(creep.memory.targetRoom);
                creep.moveTo(creep.pos.findClosestByPath(exit),{range:3});    
        }
        
        
        else {
            let defenders = creep.room.find(FIND_MY_CREEPS, {filter: 
                (c) => (c.memory.role == 'defender' ||
                c.memory.role == 'attacker') &&
                c.memory.targetRoom == creep.memory.targetRoom
            });
            if (defenders.length) {
                creep.moveTo(creep.pos.findClosestByPath(defenders),
                {range:1});
            }
            else {
                var nameFlags = _.filter(Game.flags, function(f) {
                    return f.name == creep.name;
                });
                if (nameFlags.length > 0) {
                    var targ = creep.pos.findClosestByPath(nameFlags)
                    if (targ) {
                        if (targ.pos == creep.pos) {
                            console.log(targ + ' removed');
                            targ.remove();
                        }
                        else {
                            creep.moveTo(targ);
                        }
                    }
                    else {
                        creep.moveTo(nameFlags[0]);
                    }
                }
                else {
                    var greenFlags = _.filter(Game.flags, function(f) {
                        var flag = f;
                        return flag.color == COLOR_GREEN;
                        });
                    var targ = creep.pos.findClosestByPath(greenFlags);
                    if (targ) {
                        creep.moveTo(targ,{range:1});
                    }
                    else if (greenFlags.length) {
                        creep.moveTo(greenFlags[0]);
                    }
                    
                    if (creep.room.name == creep.memory.targetRoom) {
                        creep.moveTo(25,25,{range:10});
                    }
                    else {
                        creep.moveTo(Game.rooms[creep.memory.homeRoom].storage,{range:10});
                    }
                }
            }
        }
    },
    
    spawnInfo: {
        'head': [HEAL],
        'torso': [],
        'tail': [MOVE],
        'numberOfHeads': 10,
        'numberOfTails': 10,
        'memory': {role:'healer', priority: 2}
    },
    
    spawnInstructions: function() {
        return module.exports.spawnInfo;
    }
};