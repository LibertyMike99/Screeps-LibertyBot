module.exports = {
    run: function(creep) {
        if (creep.room.name == creep.memory.targetRoom) {
            var targ = creep.room.controller;
            if ((targ.owner && targ.owner.username != creep.owner.username) || (targ.reservation) && targ.reservation['username'] != creep.owner['username']) {
                //console.log(creep.name,'try claim');
                if (creep.room.controller.upgradeBlocked || creep.room.controller.my) {
                    if (!Game.rooms[creep.memory.homeRoom].freeCreeps[creep.memory.role]) {
                        Game.rooms[creep.memory.homeRoom].freeCreeps[creep.memory.role] = {};    
                    }
                    Game.rooms[creep.memory.homeRoom].freeCreeps[creep.memory.role][creep.id] = creep.room.name;
                }
                else if (creep.attackController(targ) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targ);
                }
                let obstacles = creep.room.find(FIND_STRUCTURES, {filter: (s) => {
                    return (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) &&
                    creep.pos.isNearTo(s);
                }});
                if (obstacles.length) {
                    creep.dismantle(obstacles[0]);
                }
            }
            else {
                roleReserver.run(creep);
            }
        }
        else {
            //console.log(`${creep.name} not in room`);
            //var exit = creep.room.findExitTo(creep.memory.targetRoom);
            //creep.moveTo(creep.pos.findClosestByPath(exit));
            if (!creep.memory.route || creep.memory.route < 0 || !creep.memory.route.includes(creep.room.name) || !creep.memory.route.includes(creep.memory.targetRoom)) {
                //console.log(creep.room.name,creep.memory.targetRoom);
                creep.memory.route = Game.map.findRoute(creep.room.name,creep.memory.targetRoom, {
                    routeCallback: Map.standardCallback
                });
                //creep.memory.route = Game.map.findRoute(creep.room.name,creep.memory.targetRoom);
                //console.log(creep.memory.route);
                creep.memory.route = creep.memory.route.map((r) => r.room);
                creep.memory.route.unshift(creep.room.name);
            }
            //console.log(target);
            //creep.say(creep.memory.route[creep.memory.route.indexOf(creep.room.name) + 1]);
            let target = creep.room.findExitTo(creep.memory.route[creep.memory.route.indexOf(creep.room.name) + 1]);
            creep.moveTo(creep.pos.findClosestByPath(target),{maxRooms:1,reusePath: 50});
        }
    },
    
    spawnInfo: {
        'head': [WORK,MOVE],
        'torso': [CLAIM,MOVE],
        'tail': [],
        'memory': {role:'unclaimer'},
        'maxTorsos': 1,
        'priority': 10
    },
    
    spawnInstructions: function(info) {
        if (Game.rooms[info.target] && Game.rooms[info.target].controller.owner &&
        Game.rooms[info.target].controller.owner.username != MY_USERNAME && !(Game.rooms[info.target].controller.upgradeBlocked > 150)) {
            let data = Object.assign({},module.exports.spawnInfo);
            data.maxTorsos = 25;
            data.numberOfHeads = 0;
            return data;
        }
        return module.exports.spawnInfo;
    }
};