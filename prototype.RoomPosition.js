module.exports = function() {
    
    Object.defineProperties(RoomPosition.prototype, {
        neighbors: {
            get: function() {
                if (!this._neighbors) {
                    this._neighbors = [];
                    for (let x = -1; x <= 1; x++) {
                        if ((this.x + x) < 0 || (this.x + x) >= 50) {
                            continue;
                        }
                        for (let y = -1; y <= 1; y++) {
                            if ((this.y + y) < 0 || (this.y + y) >= 50 || 
                            (y == 0 && x == 0)) {
                                continue;
                            }
                            this._neighbors.push(new RoomPosition(this.x + x, this.y + y, this.roomName));
                        }
                    }
                }
                return this._neighbors;
            },
        },
        walkableNeighbors: {
            get: function() {
                if (!this._walkableNeighbors) {
                    let terrain = new Room.Terrain(this.roomName);
                    this._walkableNeighbors = _.filter(this.neighbors, (n) => {
                        return terrain.get(n.x,n.y) != TERRAIN_MASK_WALL ||
                        (Game.rooms[n.roomName] && n.lookFor(LOOK_STRUCTURES).map(s => s.structureType).includes(STRUCTURE_ROAD));
                    });
                }
                return this._walkableNeighbors;
            }
        },
        openNeighbors: {
            get: function() {
                if (!this._openNeighbors) {
                    if (!Game.rooms[this.roomName]) {
                        return this.walkableNeighbors;
                    }
                    this._openNeighbors = _.filter(this.walkableNeighbors, (n) => {
                        return !n.lookFor(LOOK_CREEPS).length && !n.lookFor(LOOK_STRUCTURES).map(s => s.structureType).some((s) => OBSTACLE_OBJECT_TYPES.includes(s));
                    });
                }
                return this._openNeighbors;
            }
        },
        index: {
            get: function() {
                return this.x + this.y * 50;
            }
        }
    })
    
};