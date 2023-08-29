/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('Administrator');
 * mod.thing == 'a thing'; // true
 */

module.exports = function(id,superior) {
    this.id = id;
    Memory.Administrators = Memory.Administrators || {};
    Memory.Administrators[this.id] = Memory.Administrators[this.id] || {};
    this.memory = Memory.Administrators[this.id];
};