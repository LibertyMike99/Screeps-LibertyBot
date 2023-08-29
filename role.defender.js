module.exports = {
    run: function(creep) {
        Game.map.visual.circle(creep.pos,{color:'#ff0000',radius:5,opacity:1});
        Game.map.visual.circle(new RoomPosition(25,25,creep.memory.targetRoom || creep.memory.homeRoom),{color:'#ff0000',lineStyle:'dashed'});
        if (creep.hits <= 0) {
            return;
        }
        if (creep.spawning) {
            if (creep.memory.targetRoom) {
                //Memory.rooms[creep.memory.targetRoom].orders.hold = true;
                console.log(creep.name,'blocking',creep.memory.targetRoom);
            }
            return;
        }
        if (creep.memory.targetRoom && creep.room.name != creep.memory.targetRoom) {
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
            var exit = creep.room.findExitTo(creep.memory.route[creep.memory.route.indexOf(creep.room.name) + 1]);
            creep.say(exit);
            creep.moveTo(creep.pos.findClosestByPath(exit,{ignoreCreeps:true,maxRooms:1}),{ignoreCreeps:true,maxRooms:1});
            if (!Memory.intel.avoidRooms.includes(creep.room.name) &&
            creep.room.controller && 
            creep.room.controller.owner && 
            creep.room.controller.owner.username && 
            creep.room.controller.owner.username != creep.owner.username &&
            creep.room.controller.level > 0) {
                console.log(`${creep.name} has added ${creep.room.controller.owner.username}'s ${creep.room.name} to the avoidRooms list.`);
                Memory.intel.avoidRooms.push(creep.room.name);
            }
            
            if (false && creep && !creep.pos.inRangeTo(creep.pos.findClosestByPath(exit),5)) {
                if (Memory.rooms[creep.memory.targetRoom]) {
                    Memory.rooms[creep.memory.targetRoom].orders = {hold:true};
                }
                else {
                    Memory.rooms[creep.memory.targetRoom] = {orders: {hold:true}};
                }
                //Memory.rooms[creep.memory.targetRoom].orders.hold = true;
                console.log(creep.name,'blocking',creep.memory.targetRoom);
            }
        }
        var target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {filter:
            (c) => Memory.users.war.includes(c.owner.username) || c.body.map((b) => b.type).includes(ATTACK) ||
                c.body.map((b) => b.type).includes(HEAL) || c.body.map((b) => b.type).includes(RANGED_ATTACK) &&
                !Memory.users.peace.includes(c.owner.username)
        });
        if(target) {
            //console.log('There is a target');
            if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
            creep.attack(target);
            creep.rangedAttack(target);
            creep.moveTo(target)
        }
        else if (creep.room.find(FIND_HOSTILE_STRUCTURES,{filter:(s)=>s.hitsMax &&
            s.structureType != STRUCTURE_RAMPART && s.structureType != STRUCTURE_STORAGE
        }).length) {
            //console.log(creep.name, '1No target, building found.');
            target = creep.pos.findClosestByPath(creep.room.find(FIND_HOSTILE_STRUCTURES,
            {filter:(s)=>s.hitsMax && s.structureType != STRUCTURE_RAMPART &&
                s.structureType != STRUCTURE_STORAGE
            }));
            if(target) {
                //console.log(target);
                if((creep.getActiveBodyparts(RANGED_ATTACK) && creep.rangedAttack(target) == ERR_NOT_IN_RANGE) || creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                /*creep.moveTo(target, {costCallback: function(roomName,costMatrix) {
                    if (roomName == creep.room.name) {
                        for (let n = 0;n<=49;n++) {
                            costMatrix.set(n,0,255);
                            costMatrix.set(n,49,255);
                            costMatrix.set(0,n,255);
                            costMatrix.set(49,n,255);
                        }
                    }
                }}); */
                }
            }
            else if (creep.room.find(FIND_HOSTILE_STRUCTURES,{filter:(s)=>s.hitsMax &&
                s.structureType == STRUCTURE_RAMPART
            }).length) {
                //console.log('2No target, building found.');
                target = creep.pos.findClosestByPath(creep.room.find(FIND_HOSTILE_STRUCTURES,
                {filter:(s)=>s.hitsMax && s.structureType == STRUCTURE_RAMPART}));
                if(target) {
                    if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                    }
                }
            }
        }
        else if (creep.room.find(FIND_HOSTILE_CREEPS,{filter:
                (c) => !(c.pos.x == 0 || c.pos.x == 49 ||
                c.pos.y == 0 || c.pos.y == 49  &&
                !Memory.users.peace.includes(c.owner.username))}).length) {
            //console.log('Creep founds');
            target = creep.pos.findClosestByPath(creep.room.find(FIND_HOSTILE_CREEPS,{filter:
                (c) => !(c.pos.x == 0 || c.pos.x == 49 ||
                c.pos.y == 0 || c.pos.y == 49) &&
                !Memory.users.peace.includes(c.owner.username)
            }));
            //console.log(creep.name+target+'y5bjb5j5bku5bku75bkuibrbmrtbjur\n\n');
            creep.attack(target);
            creep.rangedAttack(target);
            creep.moveTo(target);
        }
        else if (creep.memory.targetRoom != creep.room.name &&
            (!Memory.rooms[creep.memory.targetRoom] ||
            !Memory.rooms[creep.memory.targetRoom].orders ||
            !Memory.rooms[creep.memory.targetRoom].orders.hold)) {
                //console.log('target room goings');
                //let exit = creep.room.findExitTo(creep.memory.targetRoom);
                creep.moveTo(creep.pos.findClosestByPath(exit));    
        }
        else if (creep.memory.targetRoom != creep.room.name &&
            (Memory.rooms[creep.memory.targetRoom] &&
            Memory.rooms[creep.memory.targetRoom].orders &&
            Memory.rooms[creep.memory.targetRoom].orders.hold)) {
                //console.log('target room goings');
                //let exit = creep.room.findExitTo(creep.memory.targetRoom);
                Game.map.findRoute(creep.room.name,creep.memory.targetRoom).length <= 1 ?
                creep.moveTo(creep.pos.findClosestByPath(exit),{range:3}) : creep.moveTo(creep.pos.findClosestByPath(exit));    
        }
        
        else {
            if (!Game.rooms[creep.memory.homeRoom].freeCreeps[creep.memory.role]) {
                Game.rooms[creep.memory.homeRoom].freeCreeps[creep.memory.role] = {};    
            }
            Game.rooms[creep.memory.homeRoom].freeCreeps[creep.memory.role][creep.id] = creep.room.name;
            
            
            //creep.moveTo(creep.room.controller,{range:3});
            console.log(`${creep.memory.role} ${creep.name} is idle. Moving to controller.`);
            
            /*
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
                } else if (creep.room.name == creep.memory.targetRoom) {
                        creep.moveTo(creep.room.controller,{range:3});
                    }
                else {
                    creep.memory.targetRoom = creep.memory.homeRoom;
                    console.log(`${creep.name} is returning home to ${creep.memory.homeRoom}`);
                }
            }
            */
        }
        
        if (!_.filter(creep.body,(b) => b.type == ATTACK && b.hits > 0).length) {
            creep.moveTo(Game.rooms[creep.memory.homeRoom].storage,{range:10});
            //Memory.rooms[creep.memory.targetRoom].orders.hold = true;
            console.log(creep.name,'blocking',creep.memory.targetRoom);
        }
    },
    
    
    spawnInfo: {
        'head': [RANGED_ATTACK],
        'torso': [ATTACK,MOVE],
        'tail': [MOVE,RANGED_ATTACK],
        'numberOfHeads': 0,
        'numberOfTails': 0,
        'maxTorsos':10,
        'memory': {role:'defender', priority: 3}
    },
    
    spawnInstructions: function() {
        return module.exports.spawnInfo;
    }
};