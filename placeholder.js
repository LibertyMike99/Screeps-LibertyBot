//Import dependencies here

module.exports = {
    run: function(creep) {
        var centerPos = creep.room.getPositionAt(
            creep.room.memory.base.center.x,creep.room.memory.base.center.y
        );
        var home = Game.getObjectById(creep.room.memory.links.home);
        var controller = Game.getObjectById(creep.room.memory.links.controller);
        if (creep.pos.isEqualTo(centerPos)) {
            creep.stay(2);
            var excessEnergy =
                home.store.getUsedCapacity(RESOURCE_ENERGY) +
                controller.store.getUsedCapacity(RESOURCE_ENERGY) -
                (700);
            excessEnergy = Math.min(excessEnergy,home.store.getUsedCapacity(RESOURCE_ENERGY));
                
            var targets = (excessEnergy >= 0) ?
            {from: home, to: (creep.room.terminal && creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) < 20000) ?
            creep.room.terminal : creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < 800000 ?
            creep.room.storage : creep.room.terminal} : 
            {from: creep.room.storage, to: home};
            
            creep.say(excessEnergy);
            
            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && Math.abs(excessEnergy) > 10) {
                creep.transfer(targets.to,RESOURCE_ENERGY);
                  creep.say(targets.to.structureType);
            }
            
            else if (Math.abs(excessEnergy) > 10) { // else
                creep.withdraw(targets.from,RESOURCE_ENERGY,Math.min(
                    Math.abs(excessEnergy),
                    creep.store.getFreeCapacity(RESOURCE_ENERGY)));
            }
            else if (creep.room.storage.store.getFreeCapacity(RESOURCE_ENERGY) < 200000 ||
                (creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) < 20000) && 
                creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 20000) {
                if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                    creep.say('to: term');
                    creep.transfer(creep.room.terminal,RESOURCE_ENERGY, 
                    creep.store.getUsedCapacity(RESOURCE_ENERGY));
                }
                else {
                    creep.withdraw(creep.room.storage,RESOURCE_ENERGY, creep.store.getFreeCapacity(RESOURCE_ENERGY));
                    //creep.say(Math.min(20000 - creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY), creep.store.getFreeCapacity(RESOURCE_ENERGY)))
                    creep.say('fr: stor');
                }
            }
            else if (creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < 700000) {
                if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                    creep.transfer(creep.room.storage,RESOURCE_ENERGY);
                    creep.say('to: stor');
                }
                else if (creep.room.terminal && creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 20000) {
                    creep.withdraw(creep.room.terminal,RESOURCE_ENERGY,
                    Math.min(creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) - 20000, creep.store.getFreeCapacity(RESOURCE_ENERGY)));
                    creep.say('fr: term');
                }
            }
        }
        else {
            creep.moveTo(centerPos);
        }
    
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
        'numberOfHeads': 10,
        'numberOfTails': 1,
        'maxEnergy': Infinity,
        'maxTorsos': Infinity,
        'memory': {role: 'sorter', priority: 2}
    }
};