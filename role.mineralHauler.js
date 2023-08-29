module.exports = {
    run: function(creep) {
        let path = creep.memory.path.map((p) => new RoomPosition(p.x,p.y,p.roomName));
        let target = creep.room.terminal || creep.room.storage;
        creep.memory.idx = creep.memory.idx || 0;
        if (creep.memory.idx == 1 || creep.memory.path.length == 1 && creep.store.getFreeCapacity()) {
            creep.withdraw(Game.getObjectById(creep.memory.container),creep.room.mineral.mineralType);
        }
        if (creep.pos.isNearTo(target)) {
            creep.transfer(target,creep.room.mineral.mineralType);
        }
        creep.moveTo(path[creep.memory.idx],{reusePath:0});
        creep.say(`${creep.memory.idx}`);
        if (creep.pos.isNearTo(path[creep.memory.idx])) {
            creep.memory.idx = (creep.memory.idx + 1) % path.length;
        }
    },
    spawnInfo: {
        head: [CARRY],
        torso: [],
        tail: [MOVE],
        numberOfHeads: 4,
        numberOfTails: 2
    },
    spawnInstructions: function(info) {
        let homeRoom = Game.rooms[info.home];
        let spot = homeRoom.getPositionAt(homeRoom.memory.base.mineral.x,homeRoom.memory.base.mineral.y);
        let target = homeRoom.terminal || homeRoom.storage;
        
        let pathInfo = PathFinder.search(
            spot,
            {pos: target.pos, range: 1},
            {
                plainCost: 2,
                swampCost: 10,
                roomCallback: function(roomName) {
                    let room = Game.rooms[roomName];
                    
                    let costs = new PathFinder.CostMatrix;
                    
                    if (room) {
                        room.find(FIND_STRUCTURES).forEach(function(s) {
                            if (s.structureType != STRUCTURE_CONTAINER &&
                            (s.structureType != STRUCTURE_RAMPART ||
                            !s.my) &&
                            s.structureType != STRUCTURE_STORAGE) {
                                costs.set(s.pos.x, s.pos.y, 255);
                                
                            if (s.structureType == STRUCTURE_ROAD) {
                                costs.set(s.pos.x, s.pos.y, 1);
                            }
                            }
                        });
                        room.find(FIND_FLAGS).forEach(function(f) {
                            if (f.color == COLOR_BROWN) {
                                costs.set(f.pos.x,f.pos.y,255)
                            }
                        });
                        let cont = Game.rooms[roomName].controller;
                        if (cont) {
                            let pos = cont.pos;
                            for (let x = -1; x <= 1; x++) {
                                for (let y = -1; y <= 1; y++) {
                                    costs.set(cont.pos.x - x,cont.pos.y - y,255);
                                }
                            }
                        }
                    }
                    
                    
                    
                    return costs;
                },
                maxOps: 4000
                
            }
        );
        
        if (pathInfo.incomplete) {
            Game.notify(`Spawning Error: ${JSON.stringify(spot)} Ops:${pathInfo.ops}`);
        }
        let path = pathInfo.path;
        path.reduce(function(last,current) {
            if (last.roomName == current.roomName) {
                new RoomVisual(current.roomName).line(
                    last.x,last.y,
                    current.x,current.y);
            }
            let road = current.lookFor(LOOK_STRUCTURES).reduce((check,struct) => {
                return (check || struct.structureType == STRUCTURE_ROAD);
            },false);
            if (!road) {
                current.createConstructionSite(STRUCTURE_ROAD);
            }
            return current;
        });
        let mineral = homeRoom.mineral;
        let lapLength = (path.length - 1) * 2;    // Round trip length
        let ticksToRegen = mineral.ticksToRegeneration || MINERAL_REGEN_TIME
        let minedPerLap = lapLength * MINERAL_DENSITY[mineral.density] / ticksToRegen;    // Mineral mined per round trip
        let carryParts = Math.max(1,Math.ceil(minedPerLap / CARRY_CAPACITY));   // Parts needed
        let moveParts = Math.max(1,Math.ceil(carryParts / 2)); //moving on roads;
        
        let container = spot.lookFor(LOOK_STRUCTURES).reduce((last,struct) => {
            console.log(struct);
            if (struct.structureType == STRUCTURE_CONTAINER) {
                return struct;
            } else {
                return last;
            }
        });
        
        if (container.store.getUsedCapacity(homeRoom.mineral) >= 500) {
            carryParts += 1;
            moveParts += 1;
        }
        
        let lap = path.concat(path.slice().reverse().slice(1,-1));
        
        return {
            head: [CARRY],
            torso: [],
            tail: [MOVE],
            numberOfHeads: carryParts,
            numberOfTails: moveParts,
            memory: {
                role: 'mineralHauler',
                priority: 3,
                container: container.id,
                path: lap
            }
        }
    }
};