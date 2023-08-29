module.exports = {
    run: function(creep) {
        
        var target;
        creep.heal(creep);
        
        if (creep.room.find(FIND_HOSTILE_STRUCTURES,{filter:(s)=>s.hitsMax &&
            s.structureType != STRUCTURE_STORAGE && s.structureType != STRUCTURE_RAMPART
        }).length) {
            console.log('No target, building found.');
            target = creep.pos.findClosestByPath(creep.room.find(FIND_HOSTILE_STRUCTURES,
            {filter:(s)=>s.hitsMax &&
            s.structureType != STRUCTURE_STORAGE  && s.structureType != STRUCTURE_RAMPART
                
            }));
            if(target) {
                if(creep.dismantle(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
                }
            }
            
            else if (creep.room.find(FIND_HOSTILE_STRUCTURES,{filter:(s)=>s.hitsMax &&
                s.structureType == STRUCTURE_RAMPART  && s.structureType != STRUCTURE_STORAGE
            }).length) {
                console.log('No target, building found.');
                target = creep.pos.findClosestByPath(creep.room.find(FIND_HOSTILE_STRUCTURES,
                {filter:(s)=>s.hitsMax && s.structureType == STRUCTURE_RAMPART}));
                if(target) {
                    if(creep.dismantle(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                    }
                }
            }
        }
        else if (creep.memory.targetRoom != creep.room.name &&
            (!Memory.rooms[creep.memory.targetRoom] ||
            !Memory.rooms[creep.memory.targetRoom].orders ||
            !Memory.rooms[creep.memory.targetRoom].orders.hold)) {
                console.log('target room goings');
                let exit = creep.room.findExitTo(creep.memory.targetRoom);
                creep.moveTo(creep.pos.findClosestByPath(exit));    
        }
        else if (creep.memory.targetRoom != creep.room.name &&
            (Memory.rooms[creep.memory.targetRoom] &&
            Memory.rooms[creep.memory.targetRoom].orders &&
            Memory.rooms[creep.memory.targetRoom].orders.hold)) {
                console.log('target room goings');
                let exit = creep.room.findExitTo(creep.memory.targetRoom);
                Game.map.findRoute(creep.room.name,creep.memory.targetRoom).length <= 1 ?
                creep.moveTo(creep.pos.findClosestByPath(exit),{range:3}) : creep.moveTo(creep.pos.findClosestByPath(exit));    
        }
        
        else {
            console.log(creep.name,'finds flags?');
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
                var redFlags = _.filter(Game.flags, function(f) {
                    var flag = f;
                    return flag.color == COLOR_RED;
                    });
                if (redFlags.length) {
                    var targ = creep.pos.findClosestByPath(redFlags);
                    if (targ && creep.room.name != creep.memory.targetRoom) {
                        creep.moveTo(targ,{range:1});
                    }
                    else if (creep.room.name != creep.memory.targetRoom) {
                        creep.moveTo(redFlags[0]);
                    }
                    if (creep.room.name == creep.memory.targetRoom) {
                        creep.moveTo(25,25,{range:10});
                    }
                }
                else {
                    creep.memory.targetRoom = creep.memory.homeRoom;
                    console.log(`${creep.name} is returning home to ${creep.memory.homeRoom}`);
                }
            }
        }
    },
    
    spawnInfo: {
        'head': [WORK],
        'torso': [],
        'tail': [HEAL,MOVE],
        'numberOfHeads': 24,
        'numberOfTails': 13,
        'memory': {role:'dismantler',priority:3}
    },
    
    spawnInstructions: function() {
        return module.exports.spawnInfo;
    }
};