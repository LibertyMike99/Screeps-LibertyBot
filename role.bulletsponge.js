module.exports = {
    run: function(creep) {
        if (creep.room.name != creep.memory.targetRoom) {
            if (creep.hits < creep.hitsMax) {
                creep.moveTo(new RoomPosition(25,25,creep.memory.homeRoom));
                return;
            }
            if (!creep.memory.route) {
                console.log('No memory route');
                creep.memory.route = Game.map.findRoute(creep.room, creep.memory.targetRoom, {
                routeCallback: function(roomName) {
                    
                    let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                    let isHighway = (parsed[1] % 10 === 0) || 
                            (parsed[2] % 10 === 0);
                    let isSourceKeeper = (parsed[1] % 10 <= 6 && parsed[1] % 10 >= 4) && 
                        (parsed[2] % 10 <= 6 && parsed[2] % 10 >= 4);
                    let isMyRoom = Game.rooms[roomName] &&
                        Game.rooms[roomName].controller &&
                        (Game.rooms[roomName].controller.my ||
                        Game.rooms[roomName].controller.reservation &&
                        Game.rooms[roomName].controller.reservation.username == MY_USERNAME);
                    if (isHighway || isMyRoom) {
                        return 1;
                    } else {
                        return 2.5;
                    }
                    //if (isSourceKeeper) return Infinity;
                    if (Game.map.getRoomStatus(roomName).status != 'normal') return Infinity;
                    if (roomName == 'W37S9') return Infinity;
                }
            });
            }
            var route = creep.memory.route.map((p) => {
                return p.room;
            });
            //console.log(route);
            //console.log(route[route.indexOf(creep.room.name) + 1]);
            //console.log(creep.room.findExitTo(route[route.indexOf(creep.room.name) + 1]));
            creep.moveTo(creep.pos.findClosestByPath(creep.room.findExitTo(route[route.indexOf(creep.room.name) + 1])));
        } else {
            if (creep.hits < creep.hitsMax * .2) {
                creep.moveTo(new RoomPosition(25,25,creep.memory.homeRoom));
                return;
            }
            creep.clearExit()
        }
    },
    
    
    spawnInfo: {
        'head': [],
        'torso': [TOUGH],
        'tail': [MOVE],
        'numberOfHeads': 0,
        'numberOfTails': 25,
        'memory': {role:'bulletsponge', priority: 2}
    },
    
    spawnInstructions: function() {
        return module.exports.spawnInfo;
    }
};