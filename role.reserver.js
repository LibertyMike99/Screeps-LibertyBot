module.exports = {
    run: function(creep) {
        if (creep.room.name == creep.memory.targetRoom ) {
            var targ = creep.room.controller;
            if ((targ.reservation) && targ.reservation['username'] != creep.owner['username']) {
                if (creep.attackController(targ) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targ);
                }
            } else if (targ.owner && targ.owner.username != creep.owner.username) {
                if (!targ.upgradeBlocked) {
                    if (creep.attackController(targ) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targ);
                    }
                }
            }
            else {
                if (creep.reserveController(targ) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targ);
                } else {
                    if (!targ.sign || targ.sign.username != creep.owner.username || targ.sign.text != 'Go Forth and Multiply') {
                        creep.signController(targ, 'Go Forth and Multiply');
                    }
                    creep.stay(0);
                }
            }
        }
        else {
            if (!Game.rooms[creep.memory.targetRoom]) {
                roleScout.run(creep);
                return;
            }
            //var exit = creep.room.findExitTo(creep.memory.targetRoom);
            //creep.moveTo(creep.pos.findClosestByPath(exit));
            creep.moveTo((Game.rooms[creep.memory.targetRoom].controller || new RoomPosition(25,25,creep.memory.targetRoom)));
        }
    },
    
    spawnInfo: {
        'head': [],
        'torso': [CLAIM,MOVE],
        'tail': [],
        'maxTorsos': 4,
        'memory': {role:'reserver'}
    },
    
    spawnInstructions: function() {
        return module.exports.spawnInfo;
    }
};