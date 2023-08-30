/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('Administrator');
 * mod.thing == 'a thing'; // true
 */

class Administrator {
    constructor(id, superiorId = null) {
        this.id = id; // Unique identifier for the administrator
        this.superiorId = superiorId; // Superior's identifier

        // Initialize or restore state from memory
        this.memory = this._loadFromMemory();

        // Local state for orders and messages
        this.orders = [];
    }

    // Load state from Memory or initialize if not present
    _loadFromMemory() {
        if (!Memory.administrators[this.id]) {
            Memory.administrators[this.id] = {
                inferiors: [],
                messages: [],
                orders: [],
            };
        }
        return { ...Memory.administrators[this.id] };
    }

    // Save local state to Memory
    _saveToMemory() {
        Memory.administrators[this.id] = this.memory;
    }

    // Send a message to the superior
    sendMessageToSuperior(message) {
        if (this.superiorId && Memory.administrators[this.superiorId]) {
            Memory.administrators[this.superiorId].messages.push(message);
        }
    }

    // Issue an order to an inferior
    issueOrder(inferiorId, order) {
        if (this.memory.inferiors.includes(inferiorId)) {
            this.orders.push({ targetId: inferiorId, order });
        }
    }

    // Process orders from the superior
    processOrders() {
        while (this.memory.orders.length > 0) {
            const order = this.memory.orders.shift();
            // Handle the order (to be implemented by inheriting classes)
        }
    }

    // Other methods (sendMessage, processMessages, addInferior, removeInferior, run) remain unchanged...

    // Override the saveToMemory method to include the orders
    saveToMemory() {
        this.memory.orders = this.orders;
        Memory.administrators[this.id] = this.memory;
    }

    // Recursively generate the o rganization chart
    generateOrgChart() {
        const chart = {
            id: this.id,
            type: 'Administrator',
            children: []
        };

        for (const inferiorId of this.memory.inferiors) {
            // Check if the inferior is another Administrator
            if (Memory.administrators[inferiorId]) {
                const inferiorAdmin = new Administrator(inferiorId);
                chart.children.push(inferiorAdmin.generateOrgChart());
            } else {
                // If not an Administrator, it's a creep or another entity
                chart.children.push({
                    id: inferiorId,
                    type: 'Creep', // Or other types if you have them
                    children: [] // Creeps don't have inferiors in this model
                });
            }
        }

        return chart;
    }
}

// Ensure the Memory.administrators object exists
if (!Memory.administrators) {
    Memory.administrators = {};
}

module.exports = Administrator;


/*
module.exports = function(id,superior) {
    this.id = id;
    Memory.Administrators = Memory.Administrators || {};
    Memory.Administrators[this.id] = Memory.Administrators[this.id] || {};
    this.memory = Memory.Administrators[this.id];
};
*/