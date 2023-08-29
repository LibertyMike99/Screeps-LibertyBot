
module.exports = {
    run: function(creep) {
        if (creep.room.name != creep.memory.targetRoom) {
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
            creep.moveTo(creep.pos.findClosestByPath(target),{maxRooms: 1,swampcost: 1,reusePath: 50,
            avoid:[new RoomPosition(47,25,'W37S8'),new RoomPosition(47,24,'W37S8'),]});
            
            if (!Memory.intel.avoidRooms.includes(creep.room.name) &&
            creep.room.controller && 
            creep.room.controller.owner && 
            creep.room.controller.owner.username && 
            creep.room.controller.owner.username != creep.owner.username &&
            creep.room.controller.level > 0) {
                console.log(`${creep.name} has added ${creep.room.controller.owner.username}'s ${creep.room.name} to the avoidRooms list.`);
                Memory.intel.avoidRooms.push(creep.room.name);
            }
        }
        else if (!creep.pos.isEqualTo(34,4)) {
            creep.moveTo(34,4);
        }
        else {
            if (!Game.rooms[creep.memory.homeRoom].freeCreeps) {
                Game.rooms[creep.memory.homeRoom].freeCreeps = {};    
            }
            if (!Game.rooms[creep.memory.homeRoom].freeCreeps[creep.memory.role]) {
                Game.rooms[creep.memory.homeRoom].freeCreeps[creep.memory.role] = {};    
            }
            //Game.rooms[creep.memory.homeRoom].freeCreeps[creep.memory.role][creep.id] = creep.room.name;
            
            
            //creep.moveTo(creep.room.controller,{range:3});
            console.log(`${creep.memory.role} ${creep.name} is idle.`);
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
        'torso': [],
        'tail': [MOVE],
        'numberOfHeads': 1,
        'numberOfTails': 1,
        'maxEnergy': Infinity,
        'maxTorsos': Infinity,
        'maxBodyParts': 50,
        'memory': {role: 'scout'}
    },
    spawnInstructions: function() {
        return module.exports.spawnInfo;
    }

};