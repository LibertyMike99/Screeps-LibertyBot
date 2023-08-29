//Import dependencies here

module.exports = {
    run: function(creep) {
        if (creep.spawning) {
            return;
        }
        if (creep.getBoosted()) {
            creep.say('boosting');
            return;
        }
        
        let partner = Game.creeps[creep.memory.partner] || _.filter(Game.creeps, (c) => {
            return !c.spawning && c.memory.role == 'depositMiner' && c.memory.targetRoom == creep.memory.targetRoom && c.memory.homeRoom == creep.memory.homeRoom && 
            (!c.memory.partner || !Game.creeps[c.memory.partner] || c.memory.partner == creep.name);
        })[0];
        if (Math.abs(creep.ticksToLive - partner.ticksToLive) > 500) {
            partner = undefined;
        }
        [creep.memory.partner,partner.memory.partner] = [partner.name,creep.name];
        console.log(partner);
        
        if (partner && (!creep.memory.transit || !creep.isEmpty) && !creep.pos.isNearTo(partner) && !(
            creep.pos.x == 0 || creep.pos.x == 49 ||
            creep.pos.y == 0 || creep.pos.y == 49)) {
            if (!(partner.pos.x == 0 || partner.pos.x == 49 ||
            partner.pos.y == 0 || partner.pos.y == 49) || !(
            creep.pos.x == 1 || creep.pos.x == 48 ||
            creep.pos.y == 1 || creep.pos.y == 48)) {
                creep.moveTo(partner,{ignoreCreeps: true});
            }
            return;
        } else if (partner && partner.spawning) {
            return;
        }
        
        else if (creep.getBoosted(partner)) {
            creep.pull(partner);
            partner._move(creep);
            return;
        }
        
        let cTombs = creep.room.lookForAtArea(LOOK_TOMBSTONES,creep.pos.y-1,creep.pos.x-1,creep.pos.y+1,creep.pos.x+1,true);
        let pTombs = partner.room.lookForAtArea(LOOK_TOMBSTONES,partner.pos.y-1,partner.pos.x-1,partner.pos.y+1,partner.pos.x+1,true);
        let cDrops = creep.room.lookForAtArea(LOOK_RESOURCES,creep.pos.y-1,creep.pos.x-1,creep.pos.y+1,creep.pos.x+1,true);
        let pDrops = partner.room.lookForAtArea(LOOK_RESOURCES,partner.pos.y-1,partner.pos.x-1,partner.pos.y+1,partner.pos.x+1,true);
        if (cTombs) {
            cTombs.forEach((t) => {
                if (t.store && t.store.getUsedCapacity(RESOURCE_METAL)) {
                    creep.withdraw(t,RESOURCE_METAL);
                }
            });
        }
        if (pTombs) {
            pTombs.forEach((t) => {
                if (t.store && t.store.getUsedCapacity(RESOURCE_METAL)) {
                    partner.withdraw(t,RESOURCE_METAL);
                }
            });
        }
        if (cDrops) {
            cDrops.forEach((t) => {
                if (t.resourceType == RESOURCE_METAL) {
                    creep.pickup(t);
                }
            });
        }
        if (pDrops) {
            pDrops.forEach((t) => {
                if (t.resourceType == RESOURCE_METAL) {
                    partner.pickup(t);
                }
            });
        }
        
        let target = JSON.parse(creep.memory.targetRoom);
        target = new RoomPosition(target.x,target.y,target.room);
        
        if (!creep.memory.transit) {
            let transitTime = Game.map.getRoomLinearDistance(creep.memory.homeRoom,creep.room.name) * 
            ((creep.memory.boosts['ZO']) ? 100 : 200) * ((!creep.isFull || partner.isEmpty) ? 1.2 : 1.2) * 1.5;
            if (creep.ticksToLive < transitTime || partner.ticksToLive < transitTime) {
                creep.memory.transit = true;
                return;
            }
            if (creep.pos.isNearTo(target) || (partner.pos.isNearTo(target) && creep.pos.isNearTo(partner))) {
                if (!partner.pos.isNearTo(target)) {
                    creep.moveTo(partner);
                    creep.pull(partner);
                    partner._move(creep);
                } else {
                    if (!creep.isFull) {
                        partner.transfer(creep,RESOURCE_METAL);
                        partner.harvest(partner.room.lookForAt(LOOK_DEPOSITS,target)[0]);
                    } else {
                        if (partner.isFull) {
                            creep.memory.transit = true;
                            creep.moveTo(Game.rooms[creep.homeRoom].terminal, {reusePath:50});
                            creep.pull(partner);
                            partner._move(creep);
                        } else {
                            partner.harvest(partner.room.lookForAt(LOOK_DEPOSITS,target)[0]);
                        }
                    }
                }
            } else {
                creep.say(creep.moveTo(target, {reusePath:50, avoid: Object.values(Game.flags)}));
                creep.pull(partner);
                let terrain = creep.room.getTerrain();
                if (creep.pos.x == 0 || creep.pos.x == 49) {
                    let dir = (terrain.get(creep.pos.x, creep.pos.y + 1) != TERRAIN_MASK_WALL) ?
                        BOTTOM : TOP;
                    creep._move(dir);
                    creep.say(dir);
                } else if (creep.pos.y == 0 || creep.pos.y == 49) {
                    let dir = (terrain.get(creep.pos.x + 1, creep.pos.y) != TERRAIN_MASK_WALL) ?
                        RIGHT : LEFT;
                    creep._move(dir);
                    creep.say(dir);
                }
                partner.say(partner._move(creep));
            }
        } else {
            if (creep.isEmpty && (creep.ticksToLive < 800 || partner.ticksToLive < 800) && (partner.isEmpty || !partner)) {
                //creep.memory.transit = false;
                if (!creep.pos.isNearTo(partner)) {
                    creep.moveTo(partner);
                    return;
                }
                if (creep.getUnboosted(partner)) {
                    partner.memory.role = 'retiree';
                    return;
                }
                //partner.suicide();
                creep.memory.role = 'retiree';
                
            }
            if (creep.room.terminal && creep.room.terminal.my) {
                target = creep.room.terminal;
            } else {
                target = Game.rooms[creep.memory.homeRoom].terminal;
            }
            if (creep.pos.isNearTo(target)) {
                if (!creep.isEmpty) {
                    creep.transfer(target,RESOURCE_METAL,
                    Math.min(target.store.getFreeCapacity(RESOURCE_METAL),creep.store.getUsedCapacity(RESOURCE_METAL)));
                } else {
                    if (!partner.isEmpty) {
                        partner.transfer(creep,RESOURCE_METAL)
                    } else if (partner.isEmpty) {
                        creep.memory.transit = false;
                    }
                }
            } else {
                creep.moveTo(target, {reusePath:50});
                creep.pull(partner);
                partner._move(creep);
                let terrain = creep.room.getTerrain();
                if (creep.pos.x == 0 || creep.pos.x == 49) {
                    let dir = (terrain.get(creep.pos.x, creep.pos.y + 1) != TERRAIN_MASK_WALL) ?
                        BOTTOM : TOP;
                    creep._move(dir);
                    creep.say(dir);
                } else if (creep.pos.y == 0 || creep.pos.y == 49) {
                    let dir = (terrain.get(creep.pos.x + 1, creep.pos.y) != TERRAIN_MASK_WALL) ?
                        RIGHT : LEFT;
                    creep._move(dir);
                    creep.say(dir);
                }
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
        'torso': [CARRY,MOVE],
        'tail': [],
        'numberOfHeads': 1,
        'numberOfTails': 25,
        'maxEnergy': Infinity,
        'maxTorsos': 50,
        'maxBodyParts': 50,
        'memory': {role: 'depositHauler', transit: false, earlyReplace: true, priority:10},
        'boosts': {
            carry: ['KH'],
            move: ['ZO']
        }
    },
    
    spawnInstructions: function(info) {
        return module.exports.spawnInfo;
    }
};