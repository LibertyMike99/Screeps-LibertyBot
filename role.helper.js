module.exports = {
    run: function(creep) {
        if (!creep.memory.transit) {
            roleBootStrapper.run(creep);
        } else if (creep.room.name == creep.memory.targetRoom && creep.pos.findPathTo(creep.room.controller).length < creep.pos.getRangeTo(creep.room.controller)) {
            roleRoomDismantler.run(creep);
        } else {
            roleBootStrapper.run(creep);
        }
    }

};