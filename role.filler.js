//Import dependencies here

module.exports = {
    run: function(creep) {
        let cpu = {};
        cpu.start = Game.cpu.getUsed();
        let structures;
        if (this.cache && this.cache[creep.room]) {
            if (this.cache[creep.room].structures) {
                structures = this.cache[creep.room].structures;
            }
        }
        if (!structures) {
            structures = creep.room.find(FIND_MY_STRUCTURES, {filter:
                (s) => (s.structureType == STRUCTURE_SPAWN ||
                s.structureType == STRUCTURE_EXTENSION) &&
                s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            });
            cpu.find_spawns_and_extensions = Game.cpu.getUsed();
        }
        
        //if (true) {
        if (!structures.length) {
            structures = creep.room.find(FIND_MY_STRUCTURES, {filter:
                (s) => s.structureType == STRUCTURE_TOWER &&
            s.store.getFreeCapacity(RESOURCE_ENERGY) >= 100
            });
            cpu.find_towers = Game.cpu.getUsed();
        }
        
        if (!structures.length && !creep.room.find(FIND_HOSTILE_CREEPS).length) {
            structures = creep.room.find(FIND_MY_STRUCTURES, {filter:
                (s) => s.structureType == STRUCTURE_LAB &&
                s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            });
            cpu.find_labs = Game.cpu.getUsed();
        }
        
        let structure = creep.pos.findClosestByPath(structures);
        cpu.find_closest = Game.cpu.getUsed();
        
        
        if (structure == undefined || creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
            if (creep.store.getFreeCapacity() == 0) {
                  creep.moveTo(creep.pos.findClosestByPath(creep.room.find(FIND_FLAGS),{filter:
                      (f) => f.color == COLOR_BLUE && (!f.pos.lookFor(LOOK_CREEPS).length || f.pos.isEqualTo(creep.pos))
                    }),{ignoreCreeps: true, avoid: _.filter(Game.flags,(f) => {return f.color == COLOR_BROWN})});
                cpu.idle = Game.cpu.getUsed(); 
            }
            else {
                creep.memory.transit = false;
                cpu.change_transit_false = Game.cpu.getUsed();
            }
        }
        else if (creep.memory.transit == false) {
            creep.memory.transit = true;
            cpu.change_transit_true = Game.cpu.getUsed();
        }
        if (creep.memory.transit) {
            if (creep.transfer(structure,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(structure,{ignoreCreeps: true,avoid: _.filter(Game.flags,(f) => {return f.color == COLOR_BROWN})});
                cpu.transit_true_range = Game.cpu.getUsed();
            }
            else {
                //let neighbors = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter: (s) => {
                //    return (structure && s && s.structureType == structure.structureType && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
                //}});
                //console.log(neighbors);
                //neighbors.forEach((s) => creep.transfer(s,RESOURCE_ENERGY));
                cpu.transit_true_xfer = Game.cpu.getUsed();
            }
        }
        else if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            if (creep.withdraw(creep.room.storage,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.storage,{ignoreCreeps:true, avoid: _.filter(Game.flags,(f) => {return f.color == COLOR_BROWN})});
                cpu.transit_false_range = Game.cpu.getUsed();
            }
            else {
                cpu.transit_false_xfer = Game.cpu.getUsed();
            }
            if (creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
                creep.moveTo(creep.pos.findClosestByPath(creep.room.find(FIND_FLAGS),{filter:
                      (f) => f.color == COLOR_BLUE && (!f.pos.lookFor(LOOK_CREEPS).length || !f.pos.isEqualTo(creep.pos))
                    }),{ignoreCreeps:true, avoid: _.filter(Game.flags,(f) => {return f.color == COLOR_BROWN})});
            }
        }
        let last = cpu.start;
        cpu.end = Game.cpu.getUsed();
        //console.log(`${creep.name} ${creep.room.name}`);
        for (let data in cpu) {
            //console.log(data, ': ', (cpu[data]-last));
            last = cpu[data];
        }
        //console.log('Total: ', (cpu.end-cpu.start));
    
    },
    
    spawnInfo: {
        /*creep spawning instructions here
         *head is FIRST, least protected
         *torso fills in body
         *tail is LAST, most protected
         memory is the initial creep memory
         */
        'head': [CARRY],
        'torso': [],
        'tail': [MOVE],
        'numberOfHeads': 12,
        'numberOfTails': 6,
        'maxEnergy': Infinity,
        'maxTorsos': Infinity,
        'memory': {role: 'filler', transit: false, priority: 3}
    },
}