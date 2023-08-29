module.exports = {
    run: function(creep) {
        let extractor = Game.getObjectById(creep.memory.extractor);
        if (extractor.cooldown) {
            return;
        }
        let homeRoom = Game.rooms[creep.memory.homeRoom];
        let spot = homeRoom.getPositionAt(homeRoom.memory.base.mineral.x,homeRoom.memory.base.mineral.y);
        if (creep.pos.isEqualTo(spot)) {
            let mineral = Game.getObjectById(creep.memory.mineral);
            creep.harvest(mineral);
        } else {
            creep.moveTo(spot);
        }
    },
    spawnInfo: {
        head: [WORK],
        torso: [],
        tail: [MOVE],
        numberOfHeads: 10,
        numberOfTails: 5
    },
    spawnInstructions: function(info) {
        let homeRoom = Game.rooms[info.home];
        let mineral = homeRoom.mineral;
        let extractor = homeRoom.extractor;
        let ticksToRegen = mineral.ticksToRegeneration || MINERAL_REGEN_TIME;
        let ticksToDeplete = mineral.mineralAmount * EXTRACTOR_COOLDOWN;
        let works = Math.max(1,Math.ceil(ticksToDeplete / ticksToRegen));
        return {
            head: [WORK],
            torso: [],
            tail: [MOVE],
            numberOfHeads: works,
            numberOfTails: Math.ceil(works / 2),
            memory: {
                role: 'mineralMiner',
                priority: 2,
                mineral: mineral.id,
                extractor: extractor.id
            }
        }
    }

};