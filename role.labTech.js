module.exports = {
    run: function(creep) {
        managerLabs.run(creep.room);
        if (creep.memory.transit) {
            //console.log('lab transit');
            let wrongLabs = creep.room.find(FIND_MY_STRUCTURES, {filter: (s) => {
                return s.structureType == STRUCTURE_LAB &&
                creep.room.memory.labs[s.id] &&
                s.mineralType && 
                (creep.room.memory.labs[s.id] != s.mineralType) //&& creep.room.memory.labs[s.id] != 'empty' || s.store[creep.room.memory.labs[s.id]] >= 0);
            }});
            //console.log(wrongLabs.length);
            if (wrongLabs.length) {
                if (creep.store.getFreeCapacity() > 0) {
                    let nearest = creep.pos.findClosestByPath(wrongLabs);
                    if (creep.withdraw(nearest,nearest.mineralType) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(nearest, {avoid: _.filter(Game.flags,(flag) => flag.color == COLOR_BROWN)});
                    }
                    return;
                }
            }
            if (creep.store.getUsedCapacity() == 0) {
                creep.memory.transit = false;
                return;
            }
            let labs = [];
            for (let resource in creep.store) {
                //console.log(resource);
                if (creep.store[resource] == 0) {
                    //console.log('continue');
                    continue;
                }
                labs = labs.concat(creep.room.find(FIND_MY_STRUCTURES, {filter: (s) => {
                    
                    return s.structureType == STRUCTURE_LAB &&
                    creep.room.memory.labs[s.id] == resource &&
                    s.store.getFreeCapacity(resource) > 0;
                }}));
            }
            //console.log(labs.length);
            
            if (labs.length > 0) {
                //console.log('labs length');
                let nearest = creep.pos.findClosestByPath(labs);
                //console.log(nearest);
                //console.log(creep.transfer(nearest,creep.room.memory.labs[nearest.id]));
                if (nearest && creep.transfer(nearest,creep.room.memory.labs[nearest.id]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(nearest, {avoid: _.filter(Game.flags,(flag) => flag.color == COLOR_BROWN)});
                }
            } else {
                creep.memory.transit = false;
                return;
            }
        } else {
            //console.log('lab no transit');
            let needed = {};
            for (let labID in creep.room.memory.labs) {
                let resource = creep.room.memory.labs[labID];
                if (resource == 'empty') {
                    continue;
                }
                //console.log(labID, resource);
                needed[resource] = needed[resource] || 0;
                let lab = Game.getObjectById(labID);
                needed[resource] += lab.store.getFreeCapacity(resource);
                //console.log(lab,labID,resource,lab.store.getFreeCapacity(resource),needed[resource]);
            }
            for (let resource in creep.store) {
                needed[resource] = needed[resource] || 0;
                needed[resource] -= creep.store.getUsedCapacity(resource);
                //console.log(resource,needed[resource]);
            }
            if (!creep.pos.inRangeTo(creep.room.terminal,1)) {
                creep.moveTo(creep.room.terminal, {ignoreCreeps: false, avoid: _.filter(Game.flags,(flag) => flag.color == COLOR_BROWN)});
            } else {
                let capacity = creep.store.getFreeCapacity();
                for (let resource in needed) {
                    if (needed[resource] < 0) {
                        var amount = Math.min(creep.room.terminal.store.getFreeCapacity(resource),0-needed[resource]);
                        creep.transfer(creep.room.terminal,resource,amount);
                        //capacity += amount;
                    }
                }
                for (let resource in needed) {
                    //console.log(JSON.stringify(needed));
                    //console.log(resource,needed[resource]);
                    if (needed[resource] > 0) {
                        if (Object.keys(needed).indexOf(resource) == Object.keys(needed).length - 1 &&
                        creep.room.terminal.store.getUsedCapacity(resource) < 1) {
                            creep.memory.transit = true;
                        }
                        var amount = Math.min(creep.room.terminal.store.getUsedCapacity(resource),
                        Math.min(capacity,needed[resource]));
                        //creep.say(`${resource}, ${amount}`);
                        //console.log(creep.name,capacity,resource,amount);
                        creep.withdraw(creep.room.terminal,resource,amount);
                        capacity -= amount;
                    } else {
                        continue;
                    }
                    if (capacity <= 0) {
                        break;
                    }
                    if (Object.keys(needed).indexOf(resource) == Object.keys(needed).length - 1) {
                        //
                    }
                    return;
                }
                //creep.say('said');
                creep.memory.transit = true;
                return;
            }
        }
    },
    spawnInfo: {
        'head': [],
        'torso': [CARRY],
        'tail': [MOVE],
        'numberOfHeads': 0,
        'numberOfTails': 10,
        'maxTorsos': 20,
        'memory': {role:'labTech', transit: false}
    },
    spawnInstructions: function(info) {
        let data = Object.assign({},module.exports.spawnInfo);
        switch (Game.rooms[info.home].controller.level) {
            case 6:
                data.numberOfTails = 3;
                data.maxTorsos = 6;
                break;
            case 7:
                data.numberOfTails = 6;
                data.maxTorsos = 12;
                break;
        }
        return data;
    }

};