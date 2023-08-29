var utils = require('utilities');
module.exports = function() {
    
    Object.defineProperty(Room.prototype, 'sources', {
        get: function() {
                // If we dont have the value stored locally
            if (!this._sources) {
                    // If we dont have the value stored in memory
                if (!this.memory.sourceIds) {
                        // Find the sources and store their id's in memory, 
                        // NOT the full objects
                    this.memory.sourceIds = this.find(FIND_SOURCES)
                                            .map(source => source.id);
                }
                // Get the source objects from the id's in memory and store them locally
                this._sources = this.memory.sourceIds.map(id => Game.getObjectById(id));
            }
            // return the locally stored value
            return this._sources;
        },
        set: function(newValue) {
            // when storing in memory you will want to change the setter
            // to set the memory value as well as the local value
            this.memory.sourceIds = newValue.map(source => source.id);
            this._sources = newValue;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Room.prototype, 'openSources', {
        get: function() {
            //if value is not stored locally
            if (!this._openSources) {
                this._openSources = _.filter(this.sources, (s) => 
                    s.creeps.length == 0);
            }
            //return [Game.getObjectById('5bbcaaf39099fc012e6327ed')];
            return this._openSources;
        },
        set: function() {},
        enumerable: false,
        configurable: true
    });
    
    Object.defineProperty(Room.prototype, 'minedSources', {
        get: function() {
            //if value is not stored locally
            if (!this._minedSources) {
                this._minedSources = _.filter(this.sources, (s) =>
                    s.creeps.length > 0);
            }
            return this._minedSources;
        },
        set: function() {},
        enumerable: false,
        configurable: true
    });
    
    Object.defineProperty(Room.prototype, 'mineral', {
        get: function() {
                // If we dont have the value stored locally
            if (!this._mineral) {
                    // If we dont have the value stored in memory
                if (!this.memory.mineralId) {
                        // Find the sources and store their id's in memory, 
                        // NOT the full objects
                    this.memory.mineralId = this.find(FIND_MINERALS)[0].id;
                }
                // Get the source objects from the id's in memory and store them locally
                this._mineral = Game.getObjectById(this.memory.mineralId);
            }
            // return the locally stored value
            return this._mineral;
        },
        set: function(newValue) {
            // when storing in memory you will want to change the setter
            // to set the memory value as well as the local value
            this.memory.mineralId = newValue;
            this._sources = newValue;
        },
        enumerable: false,
        configurable: true
    });

    
    Object.defineProperty(Room.prototype, 'spawns', {
        get: function() {
            if (!this._spawns) {
                this._spawns = this.find(FIND_STRUCTURES, {filter: {
                    structureType: STRUCTURE_SPAWN
                }});
            }
            return this._spawns;
        },
        set: function() {},
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Room.prototype, 'labs', {
        get: function() {
            if (!this._labs) {
                this._labs = this.find(FIND_STRUCTURES, {filter: {
                    structureType: STRUCTURE_LAB
                }});
            }
            return this._labs;
        },
        set: function() {},
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Room.prototype, 'energyStructures', {
        get: function() {
            if (!this._energyStructures) {
                if (!this.memory.energyStructures || !this.memory.energyStructures.length || !this.memory.cacheTick || (Game.time - this.memory.cacheTick > 20)) {
                    this.memory.energyStructures = this.find(FIND_MY_STRUCTURES, {filter: (s) => {
                        return s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION;
                    }}).sort((a,b) => {
                        return a.pos.getRangeTo(this.storage) - b.pos.getRangeTo(this.storage);
                    }).map(s => s.id);
                    this.memory.cacheTick = Game.time;
                }
                this._energyStructures = this.memory.energyStructures.map(id => Game.getObjectById(id));
            }
            return this._energyStructures;
        },
        enumerable: false,
        configurable: true
    });
    
    Object.defineProperty(Room.prototype, 'factory', {
        get: function() {
            if (!this._factory) {
                this._factory = this.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_FACTORY}})[0] || undefined;
            }
            return this._factory;
        },
        enumerable: true,
        configurable: true
    });
    
    Object.defineProperty(Room.prototype, 'observer', {
        get: function() {
            if (!this._observer) {
                this._observer = this.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_OBSERVER}})[0] || undefined;
            }
            return this._observer;
        },
        enumerable: true,
        configurable: true
    });
    
    Object.defineProperty(Room.prototype, 'extractor', {
        get: function() {
            if (!this._extractor) {
                this._extractor = this.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_EXTRACTOR}})[0] || undefined;
            }
            return this._extractor;
        },
        enumerable: true,
        configurable: true
    });
    
    Object.defineProperty(Room.prototype, 'invaders', {
        get: function() {
            if (!this._invaders) {
                this._invaders = this.find(FIND_HOSTILE_CREEPS,{filter: (c) =>
                        (c.body.map((b)=>b.type).includes(ATTACK) ||
                        c.body.map((b)=>b.type).includes(HEAL) ||
                        c.body.map((b)=>b.type).includes(RANGED_ATTACK) ||
                        c.body.map((b)=>b.type).includes(WORK))  &&
                        !Memory.users.peace.includes(c.owner.username)
                    });
            }
            return this._invaders;
        },
        enumerable: true,
        configurable: true
    });
    
    Object.defineProperty(Room.prototype, 'assailants', {
        get: function() {
            if (!this._assailants) {
                this._assailants = this.find(FIND_HOSTILE_CREEPS,{filter: (c) =>
                        (c.body.map((b)=>b.type).includes(ATTACK) ||
                        c.body.map((b)=>b.type).includes(RANGED_ATTACK) ||
                        c.body.map((b)=>b.type).includes(WORK))  &&
                        !Memory.users.peace.includes(c.owner.username)
                    });
            }
            return this._assailants;
        },
        enumerable: true,
        configurable: true
    });
    
    Object.defineProperties(Room.prototype, {
        invaderCore: {
            get: function() {
                if (!this._invaderCore) {
                    this._invaderCore = this.find(FIND_STRUCTURES, {filter: 
                    (s) => s.structureType == STRUCTURE_INVADER_CORE});
                }
                return this._invaderCore;
            },
        },
        hostileClaim: {
            get: function() {
                if (!this._hostileClaim) {
                    this._hostileClaim = (this.controller && this.controller.reservation && 
                    this.controller.reservation.username != MY_USERNAME) ?
                    true : false
                }
                return this._hostileClaim;
            }
        },
        constructionSites: {
            get: function() {
                if (!this._constructionSites) {
                    this._constructionSites = this.find(FIND_CONSTRUCTION_SITES);
                }
                return this._constructionSites;
            }
        },
        mine: {
            get: function() {
                if (!this._mine) {
                    this._mine = this.controller && this.controller.my ||
                    (this.controller && this.controller.reservation && this.controller.reservation.username == MY_USERNAME);
                }
                return this._mine;
            }
        },
        reservationTimer: {
            get: function() {
                if (!this._reservationTimer) {
                    this._reservationTimer = (this.controller && this.controller.reservation) ?
                    this.controller.reservation.ticksToEnd : false;
                }
                return this._reservationTimer;
            }
        },
        mineral: {
            get: function() {
                if (!this._mineral) {
                    this._mineral = this.find(FIND_MINERALS)[0];
                }  
                return this._mineral;
            }
        },   
        storageAmount: {
            get: function() {
                if (!this._storageAmount) {
                    this._storageAmount = (this.storage) ?
                    this.storage.store.getUsedCapacity(RESOURCE_ENERGY) : false;
                }
                return this._storageAmount;
            }
        },   
        controllerLevel: {
            get: function() {
                if (!this._controllerLevel) {
                    this._controllerLevel = this.controller ? this.controller.level : false;
                }
                return this._controllerLevel;
            }
        },
                
        towers: {
            get: function() { 
                if (!this._towers) {
                    this._towers = this.find(FIND_MY_STRUCTURES, {filter:
                    (s) => s.structureType == STRUCTURE_TOWER});
                }
                return this._towers;
            }
        },   
                
        miners: {
            get: function() {
                if (!this._miners) {
                    this._miners = this.find(FIND_MY_CREEPS, {filter:
                    (c) => c.memory.role == 'remote_miner'});
                }
                return this._miners;
            }
        }   
    });
    
    
    Object.defineProperty(Room.prototype, 'evaluate', {
        get: function() {
            if (!this.result) {
                this.result = {
                    sources: this.sources,
                    openSources: this.openSources,
                    minedSources: this.minedSources,
                    spawns: this.spawns,
                    invaders: this.find(FIND_HOSTILE_CREEPS,{filter: (c) =>
                        (c.body.map((b)=>b.type).includes(ATTACK) ||
                        c.body.map((b)=>b.type).includes(HEAL) ||
                        c.body.map((b)=>b.type).includes(RANGED_ATTACK) ||
                        c.body.map((b)=>b.type).includes(WORK))  &&
                        !Memory.users.peace.includes(c.owner.username)
                    }), 
                    assailants: this.find(FIND_HOSTILE_CREEPS,{filter: (c) =>
                        (c.body.map((b)=>b.type).includes(ATTACK) ||
                        c.body.map((b)=>b.type).includes(RANGED_ATTACK) ||
                        c.body.map((b)=>b.type).includes(WORK))  &&
                        !Memory.users.peace.includes(c.owner.username)
                    }), 
                    invaderCore: this.find(FIND_STRUCTURES, {filter: 
                        (s) => s.structureType == STRUCTURE_INVADER_CORE
                    }),
                    hostileClaim: (this.controller && this.controller.reservation && 
                    this.controller.reservation.username != MY_USERNAME) ?
                        true : false,
                    constructionSites: this.find(FIND_CONSTRUCTION_SITES),
                    mine: this.controller && this.controller.my ||
                        (this.controller && this.controller.reservation && this.controller.reservation.username == MY_USERNAME),
                    reservationTimer: (this.controller && this.controller.reservation) ?
                    this.controller.reservation.ticksToEnd : false,
                    mineral: this.find(FIND_MINERALS),
                    storageAmount: (this.storage) ?
                        this.storage.store.getUsedCapacity(RESOURCE_ENERGY) : false,
                    controllerLevel: this.controller ? this.controller.level : false,
                    towers: this.find(FIND_MY_STRUCTURES, {filter:
                        (s) => s.structureType == STRUCTURE_TOWER
                    }),
                    miners: this.find(FIND_MY_CREEPS, {filter:
                    (c) => c.memory.role == 'remote_miner'
                    }),
                    
                };
            }
           
           return this.result;
        },
        enumerable: true,
        configurable: true
       
        
    });
    
    Object.defineProperty(Room.prototype, 'TransitAuthority', {
        get: function() {
            this._TransitAuthority = this._TransitAuthority || new Navigation.TransitAuthority(this.name);
            return this._TransitAuthority;
        },
        enumerable: true,
        configurable: true
    });
    /*
    Object.defineProperty(Room.prototype, 'damageMap', {
        get: function() {
            if (!this._map) {
                this._map = new utils.roomMatrix(this.name);
            }
        },
        enumerable: true,
        configurable: true
    })
    */
    
    Object.defineProperty(Room.prototype, 'openSpawns', {
        get: function() {
            return _.filter(this.spawns, (s) => !s.spawning);
            
        },
        enumerable: true,
        configurable: true
    });
    
    Room.prototype._freeCreeps = {};
    Object.defineProperty(Room.prototype, 'freeCreeps', {
        get: function() {
            if (!lastAccess) {
                var lastAccess = Game.time;
            }
            if (lastAccess != Game.time) {
                this._freeCreeps == {};
                lastAccess = Game.time;
            }
            return this._freeCreeps;
        },
        enumerable: true,
        configurable: true
    });
    
    Object.defineProperty(Room.prototype, 'Regions', {
        get: function() {
            if (!_Regions) {
                var _Regions = new Regions.Regions(this.name);
            }
            return _Regions;
        },
        enumerable: true,
        configurable: true
    });
    
    Room.prototype.spawn = function(energy,name,spawnInfo,adtlMemory) {
        var result;
        spawnLoop:
        for (_spawn of this.spawns) {
            if (this.energyAvailable >=
            _spawn.findBodyCost(_spawn.buildBody(energy,spawnInfo))) {
                result = _spawn.createCustomCreep(energy,name,spawnInfo,adtlMemory,{energyStructures: this.energyStructures});
                if (result != ERR_BUSY) {
                    if (!(result < 0)) {
                        Memory.creepNum++;
                    }
                    break spawnLoop;
                }
            }
            else {result = ERR_NOT_ENOUGH_ENERGY;}
        }
        return result;
    }
    
    Room.prototype.damageMap = function(hostile,countEmpty = false) {
        if (!this._map) {
            this._map = {};
        }
        if (this._map[hostile]) {
            return this._map[hostile];
        }
        else {
            this._map[hostile] = new utils.roomMatrix(this.name);
            for (let x = 0; x<=49; x++) {
                for (let y = 0; y<=49; y++) {
                    for (let tower of this.find(FIND_STRUCTURES,
                    {filter: (s) => {
                        return s.structureType == STRUCTURE_TOWER &&
                        (s.store.getUsedCapacity(RESOURCE_ENERGY) >= 10 || countEmpty);
                    }})) {
                        var damage = TOWER_POWER_ATTACK * utils.towerRangeImpactFactor(
                            tower.pos.getRangeTo(x,y)    
                        );
                        this._map[hostile].add(x,y,damage);
                    }
                }
            }
        }
        return this._map[hostile];
    }
    
    Room.prototype._storage = Room.prototype.storage;
    Object.defineProperty(Room.prototype, 'storage', {
        get: function() {
            let storage = this.find(FIND_STRUCTURES, {filter: {structureType: STRUCTURE_STORAGE}})[0] || undefined;
            if (!storage) {
                storage = this.find(FIND_STRUCTURES, {filter: {structureType:STRUCTURE_CONTAINER}})[0] || undefined;
            }
            return storage
        },
        enumerable: false,
        configurable: true
    });
    

};