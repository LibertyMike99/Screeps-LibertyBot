module.exports = function () {
    //Creep.prototype._memory = Creep.prototype.memory;
    Object.defineProperty(Creep.prototype, 'testMemory', {
        get: function() {
            return this.memory;
        },
        set: function(newValue) {
            console.log('Weird right?');
            console.log(JSON.stringify(newValue));
        },
        enumerable: false,
        configurable: true
    });
    
    Object.defineProperty(Creep.prototype, 'isFull', {
        get: function() {
            if (!this._isFull) {
                this._isFull = _.sum(this.carry) === this.carryCapacity;
            }
            return this._isFull;
        },
        enumerable: false,
        configurable: true
    });
    
    Object.defineProperty(Creep.prototype, 'isEmpty', {
        get: function() {
            if (!this._isEmpty) {
                this._isEmpty = _.sum(this.carry) === 0;
            }
            return this._isEmpty;
        },
        enumerable: false,
        configurable: true
    });
    
    Object.defineProperty(Creep.prototype, 'buildRoute', {
        get: function() {
            let bbm = new BM.cpu();
            let status = ERR_INVALID_ARGS;
            if (this.pos.x == 0 || this.pos.x == 49 ||
                this.pos.y == 0 || this.pos.y == 49
                ) {
                    return ERR_NAME_EXISTS;
            }
            bbm.log('Check If Border Tile');
            var road = this.room.find(FIND_STRUCTURES, {filter: 
                (s) => s.pos.isEqualTo(this.pos) &&
                s.structureType == STRUCTURE_ROAD
            });
            bbm.log('Room Find Road');
            var roadConstruction = this.room.find(FIND_CONSTRUCTION_SITES, {filter:
                (s) => s.pos.isEqualTo(this.pos) &&
                s.structureType == STRUCTURE_ROAD
            });
            bbm.log('Room Find Road Costruction');
            var spot = this.pos.look();
            bbm.log('Room Look At Spot');
            let bm1 = new BM.cpu();
            var buildings = this.pos.lookFor(LOOK_STRUCTURES);
            bm1.log('Room LookFor Structures');
            var constructions = this.pos.lookFor(LOOK_CONSTRUCTION_SITES);
            bm1.log('Room LookFor Constructions');
            bbm.log('Room LookFor',bm1);
            //console.log(bbm.report());
            if (road.length) {
                if (road[0].hits < road[0].hitsMax) {
                    this.repair(road[0]);
                }
                status = ERR_NAME_EXISTS;
            }
            else if (roadConstruction.length) {
                this.build(roadConstruction[0]);
                status = OK;
            }
            else if (this.room.name != this.memory.homeRoom || true) {
                road = this.room.createConstructionSite(this.pos,STRUCTURE_ROAD);
                this.build(road);
                status = OK;
            }
            return status;
            
        },
        configurable: true
    });
    
    Creep.prototype.collect = function(target) {
        if (!target) return ERR_INVALID_TARGET;
        var container = this.room.find(FIND_STRUCTURES, {filter:
            (s) => s.pos.isEqualTo(target.pos) &&
            s.structureType == STRUCTURE_CONTAINER
        });
        var construction = this.room.find(FIND_CONSTRUCTION_SITES, {filter:
            (s) => s.pos.isEqualTo(target.pos) &&
            false
            //s.structureType == STRUCTURE_CONTAINER
        });
        var result;
        if (container.length) {
            result = this.withdraw(target,RESOURCE_ENERGY);
            this.repair(container[0]);
            return result;
        }
        else if (construction.length) {
            result = this.pickup(target);
            this.build(construction[0]);
            return result;
        }
        else for (let source of this.room.sources) {
            if (target.pos.isNearTo(source.pos)) {
                //container = this.room.createConstructionSite(target.pos,STRUCTURE_CONTAINER);
                result = this.pickup(target)
                //this.build(container);;
                return result;
            }
        }
    }
  
    Creep.prototype.clearExit = function() {
        if (this.pos.x == 0) this.move(RIGHT);
        if (this.pos.x == 49) this.move(LEFT);
        if (this.pos.y == 0) this.move(BOTTOM);
        if (this.pos.y == 49) this.move(TOP);
    }
  
    Creep.prototype.getActionStrength = function(action) {
        let actionDict = {
            carry: CARRY_CAPACITY,
            harvest: HARVEST_POWER,
            repair: REPAIR_POWER,
            dismantle: DISMANTLE_POWER,
            build: BUILD_POWER,
            attack: ATTACK_POWER,
            upgradeController: UPGRADE_CONTROLLER_POWER,
            rangedAttack: RANGED_ATTACK_POWER,
            heal: HEAL_POWER,
            rangedHeal: RANGED_HEAL_POWER,
            reserveController: CONTROLLER_RESERVE,
            attackController: CONTROLLER_CLAIM_DOWNGRADE
        }
        let actionToPart = {
            carry: CARRY,
            harvest: WORK,
            repair: WORK,
            dismantle: WORK,
            build: WORK,
            attack: ATTACK,
            upgradeController: WORK,
            rangedAttack: RANGED_ATTACK,
            heal: HEAL,
            rangedHeal: HEAL,
            reserveController: CLAIM,
            attackController: CLAIM
        }
        return this.body.reduce((sum,part) => {
            if (part.hits == 0) return sum;
            if (part.type != actionToPart[action]) return sum;
            if (!part.boost) return sum + actionDict[action];
            return sum + actionDict[action] * BOOSTS[actionToPart[action]][part.boost][action];
        },0);
    }
    
    Creep.prototype._move = Creep.prototype.move;
    
    Creep.prototype._attack = Creep.prototype.attack;
    
    Creep.prototype.attack = function(target) {
        this.stay(this.memory.priority);
        return this._attack(target);
    }
    if (true) {
        Creep.prototype.move = function(dir, pri) {
            //console.log(`${this.name} going ${dir} with ${pri} priority.`);
            let bm = new BM.cpu();
            let dirMap = [
                undefined, // 0 is not direction
                [0, -1],   // TOP
                [1, -1],   // TOP_RIGHT
                [1, 0],    // RIGHT
                [1, 1],    // BOTTOM_RIGHT
                [0, 1],    // BOTTOM
                [-1, 1],   // BOTTOM_LEFT
                [-1, 0],   // LEFT
                [-1, -1]   // TOP_LEFT
            ];
            bm.log('Declare dirMap');
            if (!this.my) {
                return ERR_NOT_OWNER;
            }
            if (this.spawning) {
                return ERR_BUSY;
            }
            if (this.fatigue > 0) {
                return ERR_TIRED;
            }
            if (this.getActiveBodyparts(MOVE) == 0) {
                return ERR_NO_BODYPART;
            }
            bm.log('Catch Errors');
            let diff = dirMap[dir];
            let req_spot = [this.pos.x + diff[0], this.pos.y + diff[1]];
            req_spot = req_spot.map((axis) => {
                return Math.min(49,Math.max(0,axis));
            })
            bm.log('Get Move Offsets');
            let priority = pri || this.memory.priority || pri;
            bm.log('Set priority');
            this.room.TransitAuthority.request(this.id, req_spot[0], req_spot[1], priority);
            bm.log('Request Move');
            return OK;
            
            //temporary so move doesn't break
            //this._move(dir);
            
            //bm.log('Make Move');
            //console.log(bm.report(3));
            
        };
    }
    
    Creep.prototype.stay = function(priority) {
        this.room.TransitAuthority.request(this.id, this.pos.x, this.pos.y, priority);
    };
    
    Creep.prototype.yield = function(x, y) {
        this.room.TransitAuthority.yield(this.id, x, y);
    };
    
    Creep.prototype.getBoosted = function(creep = this) {
        if (!Game.creeps[creep.name]) {
            return false;
        }
        if (creep.memory.boosts) {
            if (creep.ticksToLive <= 1200) {
                return false;
            }
            let creepBoosts = Object.assign({},creep.memory.boosts);
            creep.body.forEach((part) => {
                if (part.boost) {
                    creepBoosts[part.boost] = creepBoosts[part.boost] || 0;
                    creepBoosts[part.boost]--;
                }
            });
            for (let boost in creepBoosts) {
                //console.log(boost, creepBoosts[boost]);
                if (creepBoosts[boost] > 0) {
                    let labs = this.room.find(FIND_MY_STRUCTURES, {filter: (s) => {
                        return s.structureType == STRUCTURE_LAB &&
                        s.mineralType == boost && s.store.getUsedCapacity(boost) >= 30 &&
                        s.store.getUsedCapacity(RESOURCE_ENERGY) >= 20;
                    }});
                    if (labs.length) {
                        let lab = this.pos.findClosestByPath(labs);
                        if (lab.boostCreep(creep,creepBoosts[boost]) == ERR_NOT_IN_RANGE) {
                            if (this.pos.isNearTo(lab)) {
                                this.moveTo(creep,{ignoreCreeps:true});
                                this.pull(creep);
                                creep.move(this);
                            } else {
                                this.moveTo(lab, {ignoreCreeps: true});
                                this.pull(creep);
                                creep._move(this);
                            }
                        }
                        console.log(`${creep} getting boosted!`);
                        return true;
                    }
                }
            }
        }
    };
    
    Creep.prototype.getUnboosted = function(creep = this) {
        if (!Game.creeps[creep.name]) {
            return false;
        }
        let isBoosted = creep.body.some((p) => p.boost);
        creep.say(isBoosted);
        if (isBoosted) {
            let labs = this.room.find(FIND_MY_STRUCTURES, {filter: (s) => {
                return s.structureType == STRUCTURE_LAB && s.cooldown == 0;
            }});
            if (labs.length) {
                let lab = this.pos.findClosestByPath(labs);
                if (lab.unboostCreep(creep) == ERR_NOT_IN_RANGE) {
                    this.say('not in range');
                    if (this.pos.isNearTo(lab)) {
                        this.moveTo(creep);
                        this.pull(creep);
                        creep._move(this);
                    } else {
                        this.moveTo(lab, {ignoreCreeps: true});
                        if (creep != this) {
                            this.pull(creep);
                            creep._move(this);
                        }
                    }
                }
                console.log(`${creep} getting unboosted!`);
                return true;
            }
        }
    };
    
    Creep.prototype.damagePotential = function(damage, preDamage = 0) {
        let actualDamage = 0;
        this.body.forEach((part) => {
            let partDamage = part.hits;
            let damageFactor = 1
            
            if (part.type == TOUGH && part.boost) {
                damageFactor = BOOSTS.tough[part.boost].damage;
            }
            partDamage = part.hits;
            
            if (preDamage > 0) {
                let diff = Math.min(preDamage * damageFactor, partDamage);
                preDamage -= diff / damageFactor;
                partDamage -= diff;
            }
            
            if (partDamage > 0) {
                let diff = Math.min(damage * damageFactor, partDamage);
                //console.log('damage diff', diff);
                damage -= diff / damageFactor;
                partDamage -= diff;
                actualDamage += diff;
            }
        });
        return actualDamage;
    }
};
