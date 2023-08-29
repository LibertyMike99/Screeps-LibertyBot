//var utilities = require('utilities');

module.exports.CombatNav = function(roomName) {
    this.bm = new BM.cpu();
    this.roomName = roomName;
    this.room = Game.rooms[this.roomName];
    this.bm.log('get room data');
    Memory.rooms[this.roomName] = Memory.rooms[this.roomName] || {};
    if (!Memory.rooms[this.roomName].combatNav) {Memory.rooms[this.roomName].combatNav = {};}
    this.memory = Memory.rooms[this.roomName].combatNav;
    this.bm.log('allocate memory');
    this.towers = (this.memory.towers) ? this.memory.towers :
        this.room.find(FIND_STRUCTURES, {filter: (s) => {
            return s.structureType == STRUCTURE_TOWER && s.my == false &&
            s.store.getUsedCapacity(RESOURCE_ENERGY) >= 10;
        }}).map(t => t.id);
        this.bm.log('get this.towers');
    this.towerMap = function(countEmpty = false) {
        this.bm.log('towerMap()');
        if (this._towerMap) {
            this.bm.log('return cached _towerMap');
            //console.log(this.bm.report());
            if (bm.total > 10) {
                Game.notify(bm.report());
            }
            return this._towerMap;
        }
        let _map;
        if (this.memory.towerMap) {
            let towerIDs = this.room.find(FIND_STRUCTURES, {filter: (s) => {
                return s.structureType == STRUCTURE_TOWER &&
                (s.store.getUsedCapacity(RESOURCE_ENERGY) >= 10 || countEmpty);
            }}).map(t=>t.id);
            this.bm.log('get towerIds');
            if (this.towers.every(
                    t=>towerIDs.includes(t)) &&
                towerIDs.every(
                    t=>this.towers.includes(t))) 
            {
                this.bm.log('towers match');
                _map = utilities.matrixDeserialize(this.memory.towerMap);
                this._towerMap = _map;
                this.bm.log('return _towerMap');
                //console.log(this.bm.report());
                if (bm.total > 10) {
                    Game.notify(bm.report());
                }
                return _map;
            }
            
        }
        _map = this.room.damageMap(true,countEmpty);
        this.bm.log('get new damageMap');
        delete this.memory.towers;
        this.bm.log('delete tower memory');
        this.memory.towers = this.room.find(FIND_STRUCTURES, {filter: (s) => {
            return s.structureType == STRUCTURE_TOWER && s.my == false &&
            (s.store.getUsedCapacity(RESOURCE_ENERGY) >= 10 || countEmpty);
        }}).map(t => t.id);
        this.bm.log('memorize towers');
        this.memory.towerMap = _map.serialize();
        this._towerMap = _map;
        this.bm.log('cache _towerMap and return');
        //console.log(this.bm.report());
        if (bm.total > 10) {
            Game.notify(bm.report());
        }
        return _map;
    }
    this.creepMap = function() {
        if (this._creepMap) {
            return this._creepMap;
        }
        let _map = new utilities.roomMatrix(this.roomName);
        let hostiles = this.room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length) {
            //console.log(hostiles);
            for (let hostile of hostiles) {
                console.log(hostile);
                let meleeBase = 0;
                let rangedBase = 0;
                //console.log(JSON.stringify(hostile.body));
                hostile.body;
                hostile.body.forEach((part) => {
                    //console.log(part.type);
                    if (!part) {}
                    else if (part.hits == 0) {}
                    else if (part.type == ATTACK) {
                        meleeBase += (ATTACK_POWER *
                        ((part.boost) ? BOOSTS.attack[part.boost] : 1));
                        //console.log(meleeBase);
                    }
                    else if (part.type == RANGED_ATTACK) {
                        rangedBase += (RANGED_ATTACK_POWER *
                        ((part.boost) ? BOOSTS.ranged_attack[part.boost].rangedAttack : 1));
                    }
                });
                for (let x = -4; x <= 4; x++) {
                    for (let y = -4; y <= 4; y++) {
                        let xPOS = hostile.pos.x + x;
                        let yPOS = hostile.pos.y + y;
                        if ((x == 0 && y == 0) ||
                            (xPOS < 0 || xPOS > 49) ||
                            (yPOS < 0 || yPOS > 49)) {   
                        }
                        else if ((x >= -2 && x <= 2) && (y >= -2 && y <= 2)) {
                            let damage = rangedBase + meleeBase;
                            //console.log(`Damage: ${damage}`);
                            if (damage > 0) {
                                _map.add(xPOS,yPOS,damage)
                                //console.log(xPOS,yPOS,_map.get(xPOS,yPOS));
                            }
                        }
                        else if (rangedBase > 0) {
                            _map.add(xPOS,yPOS,rangedBase);
                        }
                    }    
                }
            }
        }
        this._creepMap = _map;
        return _map;
        
    }
    this.creepsMap = function() {
        if (this._creepsMap) {
            return this._creepsMap;
        }
        let _map = new utilities.roomMatrix(this.roomName);
        let hostiles = this.room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length) {
            //console.log(hostiles);
            for (let hostile of hostiles) {
                //console.log(hostile);
                let meleeBase = 0;
                let rangedBase = 0;
                //console.log(JSON.stringify(hostile.body));
                hostile.body;
                hostile.body.forEach((part) => {
                    //console.log(part.type);
                    if (!part) {}
                    else if (part.hits == 0) {}
                    else if (part.type == ATTACK) {
                        meleeBase += (ATTACK_POWER *
                        ((part.boost) ? BOOSTS.attack[part.boost] : 1));
                        //console.log(meleeBase);
                    }
                    else if (part.type == RANGED_ATTACK) {
                        rangedBase += (RANGED_ATTACK_POWER *
                        ((part.boost) ? BOOSTS.ranged_attack[part.boost].rangedAttack : 1));
                    }
                });
                for (let x = -4; x <= 4; x++) {
                    for (let y = -4; y <= 4; y++) {
                        let xPOS = hostile.pos.x + x;
                        let yPOS = hostile.pos.y + y;
                        if ((x == 0 && y == 0) ||
                            (xPOS < 0 || xPOS > 49) ||
                            (yPOS < 0 || yPOS > 49)) {   
                        }
                        else if ((x >= -2 && x <= 2) && (y >= -2 && y <= 2)) {
                            let damage = rangedBase + meleeBase;
                            //console.log(`Damage: ${damage}`);
                            if (damage > 0) {
                                _map.add(xPOS,yPOS,damage)
                                //console.log(xPOS,yPOS,_map.get(xPOS,yPOS));
                            }
                        }
                        else if (rangedBase > 0) {
                            _map.add(xPOS,yPOS,rangedBase);
                        }
                    }    
                }
            }
        }
        this._creepsMap = _map;
        return _map;
            
    }
    this.damageMap = function() {
        if (this._damageMap) {
            return this._damageMap;
        }
        let _map = this.towerMap().combine(this.creepMap());
        this._damageMap = _map;
        return _map;
    }
    this.generateCostMatrix = function(heal,moveFreq) {
        this.CostMatrix = new PathFinder.CostMatrix;
        let _map = this.damageMap().clone();
        let terrain = new Room.Terrain(this.roomName);
        _map.updateAll((x,y) => {
            let t = terrain.get(x,y);
            let tCost = t == TERRAIN_MASK_SWAMP ? 5 : 1;
            let val = (Math.max(0, _map.get(x,y) - heal)) * 
            Math.max(1,(moveFreq * tCost));
            return val;
        });
        this.factor = _map.max() / 254;
        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
                this.CostMatrix.set(x,y,Math.ceil(_map.get(x,y) / this.factor));
            }
        }
        return this;
    }
    this.navigate = function(x,y,goals,heal,moveFreq,maxDamage = false,roomLock = false,opts = {}) {
        let origin = new RoomPosition(x,y,this.roomName);
        let matrix = this.generateCostMatrix(heal,moveFreq);
        opts.maxCost = maxDamage ? maxDamage / matrix.factor : Infinity;
        let ret = PathFinder.search(
            origin, goals,
            {
                roomCallback: function(roomName) {
                    
                    let room = Game.rooms[roomName];
                    if (roomLock && roomName != roomLock) return false;
                    if (!room) return;
                    let costs = matrix.CostMatrix;
                    
                    room.find(FIND_STRUCTURES).forEach((s) => {
                        if (s.structureType !== STRUCTURE_ROAD) {
                            costs.set(s.pos.x,s.pos.y,255);
                        }
                    });
                    
                    return costs;
                },
                maxCost: opts.maxCost,
                maxOps: 100000,
            }
        );
        return (matrix,ret);
    }
    console.log(this.bm.report());
    if (this.bm.total > 10) {
        Game.notify(this.bm.report());
    }
};

module.exports.TransitAuthorities = [];

module.exports.TransitAuthority = function(roomName) {
    
    this.roomName = roomName;
    this.room = Game.rooms[roomName];
    this.creepRequests = {};
    this.creepYields = {};
    this.creepSpots = {};
    this.processedRequests = [];
    
    module.exports.TransitAuthorities.push(this);
    
    // creeps request one specific move, if available
    this.request = function(creepID, xCoord, yCoord, priority = 0) {
        this.creepRequests[creepID] = {x: xCoord, y: yCoord, priority: priority};
        return OK;
    }
    
    // optional yields which become requests if creep is displaced, or if request is denied.
    this.yield = function(creepID, xCoord, yCoord) {
        this.creepYields[creepID] = this.creepYields[creepID] || [];
        this.creepYields[creepID].push(xCoord * 50 + yCoord);
        return OK;
    }
    
    this.process = function() {
        for (let n = 0; n < 50 ** 2; n++) {
            this.processedRequests[n] = [];
        }
        for (let creep of this.room.find(FIND_MY_CREEPS)) {
            if (!this.creepRequests[creep.id]) {
                this.request(creep.id, creep.pos.x, creep.pos.y, -1)
            }// else {
            //    this.yield(creep.id, creep.pos.x, creep.pos.y)
            //}
            this.creepSpots[creep.pos.x * 50 + creep.pos.y] = creep.id;
            this.creepSpots[creep.id] = creep.pos.x * 50 + creep.pos.y;
            this.creepYields[creep.id] = this.creepYields[creep.id] || [];
        }
        for (let id in this.creepRequests) {
            let req = this.creepRequests[id];
            let idx = req.x * 50 + req.y;
            
            //console.log(Game.getObjectById(id).name);
            //console.log(req.x,req.y,this.roomName,idx);
            
            if (true || req.x < 50 && req.x >= 0 && req.y < 50 && req.y >= 0 ) {
                this.processedRequests[idx].push([id,req.priority]);
            }
        }
    }
    
    this.resolve = function() {
        //create array of unresolved request conflicts
        let unresolved = [];
        let displaced = {};
        for (let n = 0; n < 50 ** 2; n++) {
            if (this.processedRequests[n].length > 1) {
                unresolved.push(n);
            }
        }
        //while there are still unresolved
        let start = Game.cpu.getUsed()
        while (unresolved.length && Game.cpu.getUsed() - start < 1) {
            let idx = unresolved.shift();
            //console.log(idx / 50, idx % 50);
            let reqs = this.processedRequests[idx];
            //set this request to value returned by reduce
            //console.log(`${(idx - idx % 50)/50}, ${idx % 50}, ${this.roomName} ${JSON.stringify(this.processedRequests[idx])}`);
            this.processedRequests[idx] = [reqs.reduce((best, candidate) => {
                let winner;
                let loser;
                if (best[1] >= candidate[1]) {
                    if (best[1] == candidate[1] && displaced[candidate[0]] == true) {
                        winner = candidate;
                        loser = best;
                    } else {
                        winner = best;
                        loser = candidate;
                    }
                } else {
                    winner = candidate;
                    loser = best;
                }
                //console.log(`Winner: ${winner[0]} Loser: ${loser[0]}`);
                
                let yields = this.creepYields[loser[0]] || [];
                if (yields.length) {
                    //console.log('Loser Yields');
                    let yield = yields.shift();
                    if (loser[0] == this.creepSpots[idx]) {
                        //console.log('Loser Forced Out To Yield');
                        if (this.processedRequests[yield].push([loser[0],winner[1]]) > 1) {
                            //console.log('Other Requests Exist Here');
                            unresolved.unshift(yield);
                        }
                    } else {
                        //console.log('Loser Denied');
                        if (this.processedRequests[yield].push([loser[0],loser[1]]) > 1) {
                            //console.log('Other Requests Exist Here');
                            unresolved.unshift(yield);
                        }
                    }
                } else {
                    //console.log('Loser Does Not Yield');
                    if (loser[0] == this.creepSpots[idx]) {
                        //console.log('Loser Displaced');
                        if (this.processedRequests[this.creepSpots[winner[0]]].push([loser[0],winner[1]]) > 1) {
                            //console.log('Winner Spot Contested For Swap.');
                            unresolved.unshift(this.creepSpots[winner[0]]);
                            displaced[loser[0]] = true;
                        }
                    } else {
                        //console.log('Loser Denied');
                        if (displaced[loser[0]]) {
                            //console.log('Loser Displace Request Denied');
                            if (this.processedRequests[this.creepSpots[loser[0]]].push([loser[0],winner[1]]) > 1) {
                                //console.log('Loser Stay Demand Contested');
                                unresolved.unshift(this.creepSpots[loser[0]]);
                                //console.log(unresolved / 50, unresolved % 50);
                            }
                        } else {
                            //console.log('Loser Stay Request');
                            if (this.processedRequests[this.creepSpots[loser[0]]].push([loser[0],loser[1]]) > 1) {
                                //console.log('Loser Stay Request Contested');
                                unresolved.unshift(this.creepSpots[loser[0]]);
                                //console.log(unresolved / 50, unresolved % 50);
                            }
                        }
                    }
                }
                return winner;
                /*
                // if the best so far is higher or equal priority
                if (best[1] >= candidate[1]) { 
                    let yields = this.creepYields[candidate[0]] || [];
                    // if candidate declared a yield
                    if (yields.length) { 
                        let yield = yields.shift();
                        // if candidate is being displaced
                        if (candidate[0] == this.creepSpots[idx]) {
                            if (this.processedRequests[yield].push([candidate[0],best[1]]) > 1) {
                                unresolved.unshift(yield);
                            }
                        } else {
                            if (this.processedRequests[yield].push([candidate[0],candidate[1]]) > 1) {
                                unresolved.unshift(yield);
                            }
                        }
                    } else {
                        if (candidate[0] == this.creepSpots[idx]) {
                            if (this.processedRequests[this.creepSpots[best[0]]].push([candidate[0],best[1]]) > 1) {
                                unresolved.unshift(this.creepSpots[best[0]]);
                                displaced[candidate[0]] = true;
                            }
                        } else {
                            if (displaced[candidate[0]]) {
                                if (this.processedRequests[this.creepSpots[candidate[0]]].push([candidate[0],best[1]]) > 1) {
                                    unresolved.unshift(this.creepSpots[candidate[0]]);
                                }
                            } else {
                                if (this.processedRequests[this.creepSpots[candidate[0]]].push([candidate[0],candidate[1]]) > 1) {
                                    unresolved.unshift(this.creepSpots[candidate[0]]);
                                }
                            }
                        }
                    }
                    return best;
                } else {
                    let yields = this.creepYields[best[0]] || [];
                    if (yields.length) { 
                        let yield = yields.shift();
                        if (best[0] == this.creepSpots[idx]) {
                            if (this.processedRequests[yield].push([best[0],candidate[1]]) > 1) {
                                unresolved.unshift(yield);
                            }
                        } else {
                            if (this.processedRequests[yield].push([best[0],best[1]]) > 1) {
                                unresolved.unshift(yield);
                            }
                        }
                    } else {
                        if (best[0] == this.creepSpots[idx]) {
                            if (this.processedRequests[this.creepSpots[candidate[0]]].push([best[0],candidate[1]]) > 1) {
                                unresolved.unshift(this.creepSpots[candidate[0]]);
                            }
                        } else {
                            if (displaced[best[0]]) {
                                if (this.processedRequests[this.creepSpots[best[0]]].push([best[0],candidate[1]]) > 1) {
                                    unresolved.unshift(this.creepSpots[best[0]]);
                                }
                            } else {
                                if (this.processedRequests[this.creepSpots[best[0]]].push([best[0],best[1]]) > 1) {
                                    unresolved.unshift(this.creepSpots[best[0]]);
                                }
                            }
                        }
                    }
                    return candidate;
                }
                */
            })];
            //console.log(JSON.stringify(this.processedRequests[1179]));
        }
        return this.processedRequests;
    }
    this.execute = function() {
        let offsetMap = {
            0: 0,
            2: TOP,             // -1, Negative Keys Not Allowed
            49: TOP_RIGHT,
            50: RIGHT,
            51: BOTTOM_RIGHT,
            1: BOTTOM,
            98: BOTTOM_LEFT,    // -49
            100: LEFT,          // -50
            102: TOP_LEFT       // -51
        };
        for (let idx in this.processedRequests) {
            //let y = idx % 50;
            //let x = (idx - y) / 50;
            if (!this.processedRequests[idx].length) {
                continue;
            }
            let req = this.processedRequests[idx][0];
            let c_idx = this.creepSpots[req[0]];
            let offset = idx - c_idx;
            // object keys can't be negative so set it to 2 times absolute value
            offset = (offset < 0) ? offset * -2 : offset;
            let dir = offsetMap[offset];
            let creep = Game.getObjectById(req[0]);
            if (dir == 0) {
                continue;
            } else {
                creep._move(dir);
            }
            //creep.moveTo(x,y);
        }
    }
}