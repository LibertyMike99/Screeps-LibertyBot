//Import dependencies here

module.exports = {
    run: function(creep) {
        var centerPos = creep.room.getPositionAt(
            creep.room.memory.base.center.x,creep.room.memory.base.center.y
        );
        var home = Game.getObjectById(creep.room.memory.links.home);
        var controller = Game.getObjectById(creep.room.memory.links.controller) || undefined;
        if (creep.pos.isEqualTo(centerPos)) {
            creep.stay(2);
            
            if (true && creep.room.memory.products && creep.room.memory.products.length && creep.room.factory && 
            (true || creep.room.terminal.store.getUsedCapacity(RESOURCE_METAL) > 100 || creep.room.factory.store.getUsedCapacity(RESOURCE_METAL) > 100)) {
                let fill = {};
                let empty = {};
                let free = creep.store.getFreeCapacity();
                console.log(`${creep.room.name} free: ${free}`);
                for (let product of creep.room.memory.products) {
                    let components = COMMODITIES[product].components;
                    for (let component in components) {
                        let diff = components[component] - creep.room.factory.store.getUsedCapacity(component);
                        if (diff > 0) {
                            fill[component] = Math.max(0, components[component] - creep.room.factory.store.getUsedCapacity(component));
                        }
                    }
                    empty[product] = creep.room.factory.store.getUsedCapacity(product);
                    if (!Object.keys(fill).length) {
                        creep.room.factory.produce(product);
                    }
                }
                for (let product of creep.room.memory.products) {
                    if (creep.store.getUsedCapacity(product)) {
                        creep.transfer(creep.room.terminal,product);
                    }
                    if (free > 0) {
                        let amt = Math.min(empty[product],free);
                        creep.withdraw(creep.room.factory,product,amt);
                        free -= amt;
                    } else {
                        creep.transfer(creep.room.terminal,RESOURCE_ENERGY);
                    }
                }
                for (let component in fill) {
                    if (creep.store.getUsedCapacity(component)) {
                        creep.transfer(creep.room.factory,component);
                    }
                    if (creep.room.terminal.store.getUsedCapacity(component) +
                    creep.store.getUsedCapacity(component) < fill[component]) {
                        creep.room.memory.products = _.filter(creep.room.memory.products,(p) => {
                            return !Object.keys(COMMODITIES[p].components).includes(component);
                        });
                    }
                    if (free > 0) {
                        let amt = Math.min(free,creep.room.terminal.store.getUsedCapacity(component));
                        creep.withdraw(creep.room.terminal,component,amt);
                        free -= amt;
                    }
                }
                
                if (Object.keys(fill).length) {
                    return;
                }
            }
            var excessEnergy = (!controller) ? home.store.getUsedCapacity(RESOURCE_ENERGY) :
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
            
            else if (Math.abs(excessEnergy) > 10 && creep.store.getFreeCapacity() > 0) { // else
                creep.withdraw(targets.from,RESOURCE_ENERGY,Math.min(
                    Math.abs(excessEnergy),
                    creep.store.getFreeCapacity(RESOURCE_ENERGY)));
            }
            else if (creep.store.getFreeCapacity > 0 && creep.room.storage.store.getFreeCapacity(RESOURCE_ENERGY) < 200000 && 
                creep.room.storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
                creep.room.terminal.store.getFreeCapacity(RESOURCE_ENERGY) > 100000 ||
                (creep.room.terminal && creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) < 20000) && 
                creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 20000) {
                if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                    creep.say('to: term');
                    creep.transfer(creep.room.terminal,RESOURCE_ENERGY, 
                    creep.store.getUsedCapacity(RESOURCE_ENERGY));
                }
                else if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    creep.withdraw(creep.room.storage,RESOURCE_ENERGY, creep.store.getFreeCapacity(RESOURCE_ENERGY));
                    //creep.say(Math.min(20000 - creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY), creep.store.getFreeCapacity(RESOURCE_ENERGY)))
                    creep.say('fr: stor');
                }
            }
            else if (creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < 700000 ||
            (creep.room.terminal.store.getFreeCapacity(RESOURCE_ENERGY) < 100000 &&
            creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 20000)) {
                if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                    creep.transfer(creep.room.storage,RESOURCE_ENERGY);
                    creep.say('to: stor');
                }
                else if (creep.room.terminal && creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 20000 && creep.store.getFreeCapacity() > 0) {
                    creep.withdraw(creep.room.terminal,RESOURCE_ENERGY,
                    Math.min(creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) - 20000, creep.store.getFreeCapacity(RESOURCE_ENERGY)));
                    creep.say('fr: term');
                }
            } else {
                if (creep.store.getFreeCapacity() > 0) {
                    for (let resource in creep.room.storage.store) {
                        if (resource != RESOURCE_ENERGY) {
                            creep.withdraw(creep.room.storage,resource);
                        }
                    }
                }
                if (creep.store.getUsedCapacity() > 0) {
                    for (let resource in creep.store) {
                        creep.transfer(creep.room.terminal,resource);
                    }
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