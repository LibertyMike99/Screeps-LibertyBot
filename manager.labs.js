/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('manager.labs');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    LAB_PRODUCTS: {
        empty: ['empty','empty'],
        OH: ['O','H'],
        LH: ['L','H'],
        KH: ['K','H'],
        UH: ['U','H'],
        ZH: ['Z','H'],
        GH: ['G','H'],
        LO: ['L','O'],
        KO: ['K','O'],
        UO: ['U','O'],
        ZO: ['Z','O'],
        GO: ['G','O'],
        UL: ['U','L'],
        ZK: ['Z','K'],
        G: ['ZK','UL'],
        UH2O: ['UH','OH'],
        UHO2: ['UO','OH'],
        ZH2O: ['ZH','OH'],
        ZHO2: ['ZO','OH'],
        KH2O: ['KH','OH'],
        KHO2: ['KO','OH'],
        LH2O: ['LH','OH'],
        LHO2: ['LO','OH'],
        GH2O: ['GH','OH'],
        GHO2: ['GO','OH'],
        XUH2O: ['UH2O','X'],
        XUHO2: ['UHO2','X'],
        XZH2O: ['ZH2O','X'],
        XZHO2: ['ZHO2','X'],
        XKH2O: ['KH2O','X'],
        XKHO2: ['KHO2','X'],
        XLH2O: ['LH2O','X'],
        XLHO2: ['LHO2','X'],
        XGH2O: ['GH2O','X'],
        XGHO2: ['GHO2','X']
    },
    
    run: function(room) {
        memory = room.memory.labManager;
        
        let reactant1 = 'empty';
        let reactant2 = 'empty';
        let product = 'empty';
        
        if (memory.reaction) {
            [reactant1,reactant2] = LAB_PRODUCTS[memory.reaction];
            //product = memory.reaction;
        }
        
        room.memory.labs = {};
        room.memory.labs[memory.reactant1] = reactant1;
        room.memory.labs[memory.reactant2] = reactant2;
        memory.products.forEach(lab => room.memory.labs[lab] = product);
        
        if (memory.boosts) {
            for (let labId in memory.boosts) {
                room.memory.labs[labId] = memory.boosts[labId];
            }
        }
        
        if (memory.reaction) {
            let lab1 = Game.getObjectById(memory.reactant1);
            let lab2 = Game.getObjectById(memory.reactant2);
            let labs = memory.products.map(id => Game.getObjectById(id));
            let runLab = function(lab) {
                if (!lab.mineralType || lab.mineralType == memory.reaction) {
                    lab.runReaction(lab1,lab2);
                }
            }
            
            if (lab1.store[reactant1] > 5 && lab2.store[reactant2] > 5) {
                labs.forEach(lab => runLab(lab));
            }
        } 
        
        return `product: ${product}, 1: ${reactant1}, 2: ${reactant2}`
    }
};