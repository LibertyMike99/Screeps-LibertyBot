module.exports = {
    roomMatrix: function(roomName) {
        this.roomName = roomName;
        this.matrix = {};
        this.set = function(x,y,value) {
            if (this.matrix[x]) {
                this.matrix[x][y] = value;
            }
            else {
                this.matrix[x] = {};
                this.matrix[x][y] = value;
            }
            return this;
        }
        this.get = function(x,y) {
            if (this.matrix[x] && this.matrix[x][y]) {
                return this.matrix[x][y];
            }
            else {
                return 0;
            }
        }
        this.forEach = function(callback) {
            for (let x in this.matrix) {
                for (let y in this.matrix[x]) {
                    return callback(this.get(x,y));    
                }
            }    
        }
        this.updateAll = function(callback) {
            for (let x in this.matrix) {
                for (let y in this.matrix[x]) {
                    this.set(x,y,callback(x,y));    
                }
            }
        }
        this.clone = function() {
            let newMatrix = new module.exports.roomMatrix(this.roomName);
            newMatrix.matrix = JSON.parse(JSON.stringify(this.matrix));
            return newMatrix;
        }
        this.add = function(x,y,value) {
            if (this.matrix[x]) {
                if (this.matrix[x][y]) {
                    this.matrix[x][y] += value;
                }
                else {
                    this.matrix[x][y] = value;
                }
            }
            else {
                this.matrix[x] = {};
                this.matrix[x][y] = value;
            }
        }
        this.combine = function(other) {
            let newMatrix = this.clone();
            for (let x in other.matrix) {
                for (let y in other.matrix[x]) {
                    newMatrix.add(x,y,other.get(x,y))
                }
            }
            return newMatrix;
        }
        this.merge = function(other) {
            for (let x in other.matrix) {
                for (let y in other.matrix[x]) {
                    this.add(x,y,other.get(x,y));
                }
            }
            //returns this so calls can be chained
            return this;
        }
        this.max = function() {
            let _max = 0; 
            for (let x in this.matrix) {
                for (let y in this.matrix[x]) {
                    _max = (this.get(x,y) > _max ? this.get(x,y) : _max);
                }
            }
            return _max;
        }
        this.min = function() {
            let _min = 0;
            for (let x in this.matrix) {
                for (let y in this.matrix[x]) {
                    _min = (this.get(x,y) < _min ? this.get(x,y) : _min)
                }
            }
            return _min;
        }
        this.serialize = function() {
            return JSON.stringify(this);
        }
        this.visualize = function() {
            for (let x in this.matrix) {
                for (let y in this.matrix[x]) {
                    let opac = (this.max() > 0 ? this.get(x,y)/this.max() : 0);
                    let color_strength = Math.ceil(0xff0000 * opac);
                    //console.log(color_strength);
                    if (opac > 0) {
                        Game.rooms[this.roomName].visual.rect(x-.5,y-.5,1,1,{fill:'#ff0000',opacity:opac});    
                    }
                }
            }
        }
    },
    matrixDeserialize: function(val) {
        let data = JSON.parse(val);
        //console.log(val);
        let newMatrix = new module.exports.roomMatrix(data.roomName);
        newMatrix.matrix = data.matrix;
        return newMatrix;
    },
    /*
    class normalizedMatrix {
        constructor(roomMatrix,lower = 1,upper = 255,startFromZero=true) {
            this.lower = lower;
            this.upper = upper;
            this.offset = startFromZero ? 0 : roomMatrix.min();
            this.matrix = startFromZero ? {
                let max = roomMatrix.max();    
            } : {
                
            }
        }
    }, */
    towerRangeImpactFactor: function(distance) {
        if(distance <= TOWER_OPTIMAL_RANGE) {
            return 1
        }
        if(distance >= TOWER_FALLOFF_RANGE) {
            return 1 - TOWER_FALLOFF
        }
        var towerFalloffPerTile = TOWER_FALLOFF / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE)
        return 1 - (distance - TOWER_OPTIMAL_RANGE) * towerFalloffPerTile
    }
}