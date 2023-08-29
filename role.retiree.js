module.exports = {
    run: function(creep) {
        if (creep.room.name != creep.memory.homeRoom) {
            creep.moveTo(Game.rooms[creep.memory.homeRoom].storage, {reusePath: 50});
            return;
        }
        if (creep.getUnboosted()) {
            return;
        }
        if (creep.memory.priority > 1) {
            creep.memory.priority = 1;
        }
        if (creep.memory.transit) {
            if (creep.isEmpty) {
                creep.memory.transit = false;
                return;
            }
            let storage = Game.rooms[creep.memory.homeRoom].terminal ||  Game.rooms[creep.memory.homeRoom].storage;
            for (let resource in creep.store) {
                if (creep.transfer(storage,resource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage);
                    break;
                }
            }
        } else {
            if (creep.isFull) {
                creep.memory.transit = true;
                return;
            }
            let resources = creep.room.find(FIND_DROPPED_RESOURCES);
            
            if (resources.length) {
                resources.sort((last,next) => {
                    return creep.pos.getRangeTo(last) - creep.pos.getRangeTo(next);
                });
                for (let resource of resources) {
                    if (creep.pickup(resource) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(resource);
                        return;
                    }
                }
                return;
            }
            
            let tombs = creep.room.find(FIND_TOMBSTONES, {filter: (t) => {
                return t.store.getUsedCapacity() > 0;
            }});
            if (tombs.length) {
                tombs.sort((last,next) => {
                    return creep.pos.getRangeTo(last) - creep.pos.getRangeTo(next);
                });
                for (let tomb of tombs) {
                    if (!creep.pos.isNearTo(tomb)) {
                        creep.moveTo(tomb);
                        return;
                    }
                    for (let resource in tomb.store) {
                        creep.withdraw(tomb,resource);
                    }
                }
                return;
            }
            creep.memory.transit = true;
        }
    }

};