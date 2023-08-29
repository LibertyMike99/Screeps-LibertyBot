/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('Map');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    standardCallback: function(roomName) {
        let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
        let isHighway = (parsed[1] % 10 === 0) || 
                (parsed[2] % 10 === 0);
        let isMyRoom = Game.rooms[roomName] &&
            Game.rooms[roomName].controller &&
            (Game.rooms[roomName].controller.my ||
            Game.rooms[roomName].controller.reservation &&
            Game.rooms[roomName].controller.reservation.username == MY_USERNAME);
        if (isHighway || isMyRoom) {
            return 1;
        }
        if (Game.map.getRoomStatus(roomName).status != 'normal') return Infinity;
        if (Memory.intel.avoidRooms.includes(roomName)) return Infinity;
        return 2;
    }
};