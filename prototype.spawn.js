module.exports = function () {
    StructureSpawn.prototype.createCustomCreep = 
        function(energy,name,spawnInfo,adtlMemory,opts) {
            
            
            var [body,partBoosts] = this.buildBody(energy,spawnInfo,true);
            var boosts = {boosts: partBoosts};
            
            var memory = spawnInfo['memory'];
            if (adtlMemory != undefined) {
                if (Object.keys(boosts).length > 0) {
                    memory = {...memory,...adtlMemory,...boosts};
                } else {
                    memory = {...memory,...adtlMemory};
                }
            }
            var opts = {memory: memory, ...opts};
            
            //return this.createCreep(body,name,memory);
            return this.spawnCreep(body,name.replace('.','_'),opts);
        };   
    StructureSpawn.prototype.buildBody = function(energy,spawnInfo,boostsAllowed = false) {
        
            if (spawnInfo['preBuilt']) {
                return spawnInfo['preBuild'];
            }
        
            var head = spawnInfo['head'];
            var torso = spawnInfo['torso'];
            var tail = spawnInfo['tail'];
            var toughCount = spawnInfo['numberOfToughs'] || 0;
            var headCount = (spawnInfo['numberOfHeads'] != undefined) ? spawnInfo['numberOfHeads'] : 1;
            var tailCount = (spawnInfo['numberOfTails'] != undefined) ? spawnInfo['numberOfTails'] : 1;
            var maxEnergy = (spawnInfo['maxEnergy']) ? spawnInfo['maxEnergy'] : Infinity;
            var maxTorsos = (spawnInfo['maxTorsos']) ? spawnInfo['maxTorsos'] : Infinity;
            var maxBodyParts = (spawnInfo['maxBodyParts']) ? spawnInfo['maxBodyParts'] : 50;
            var boosts = (spawnInfo['boosts']) ? spawnInfo['boosts'] : {};
            var adtlBoosts = spawnInfo['adtlBoosts'];
            
            
            let body = [];
            
            var remainingEnergy = (Math.min(energy,maxEnergy) -
            (this.findBodyCost(head) * headCount) -
            (this.findBodyCost(tail) * tailCount) -
            (this.findBodyCost([TOUGH]) * toughCount)
            );
            var remainingBodyParts = (maxBodyParts -
            (head.length * headCount) -
            (tail.length * tailCount) - 
            toughCount
            );
            
            var torsoCost = this.findBodyCost(torso);
            var torsoCount = Math.min(
                Math.floor(
                    remainingBodyParts / this.bodyLength(torso)),
                Math.min(
                    (torsoCost > 0) ? Math.floor(remainingEnergy / torsoCost) : 0,
                    maxTorsos));
            //console.log('torsos: ' + torsoCount);
            if (toughCount) {
                for (let i = 0; i < toughCount; i++) {
                    body = body.concat([TOUGH]);
                }
            }
            
            if (head) {
                //for (let i = 0; i < headCount; i++) {
                //    body = body.concat(head);
                //}
                body = body.concat(this.buildBodyArray(head,headCount));
            }
            
            //for (let i = 1; i <= torsoCount; i++) {
            //    body = body.concat(torso);
            //}
            body = body.concat(this.buildBodyArray(torso,torsoCount));
            
            
            if (tail) {
                //for (let i = 0; i < tailCount; i++) {
                //    body = body.concat(tail);
                //}
                body = body.concat(this.buildBodyArray(tail,tailCount));
            } 
            
            if (boostsAllowed) {
                let partBoosts = {};
                if (maxTorsos < Infinity && torsoCount < maxTorsos) {
                    let diff = maxTorsos - torsoCount;
                    console.log('Torso Diff:',diff);
                    let partDiff = {};
                    let partCount = {};
                    for (let part of this.buildBodyArray(torso,1)) {
                        if (partDiff[part] != undefined) {
                            partDiff[part] += diff;
                            partCount[part] += torsoCount;
                        } else {
                            partDiff[part] = diff;
                            partCount[part] = torsoCount;
                        }
                    }
                    for (let part in partDiff) {
                        let allowed = boosts[part];
                        if (allowed && allowed.length) {
                            let _diff = partDiff[part];
                            let prev = 0;
                            for (let i in allowed) {
                                let boost = allowed[i];
                                let effect = this.boostEffect(part,boost) - prev;
                                let needed = Math.min(partCount[part],
                                    Math.ceil(_diff / effect));
                                partBoosts[boost] = needed;
                                if (i > 0) {
                                    partBoosts[allowed[i-1]] -= needed;
                                }
                                _diff -= needed * effect;
                                console.log(`boost: ${boost}, effect: ${effect}, needed: ${needed}, prev: ${prev}, diff: ${_diff}`);
                                if (_diff <= 0) {
                                    break;
                                } else {
                                    prev += effect;
                                }
                            }
                        }
                    }
                    if (boosts[TOUGH]) {
                        partBoosts[boosts['tough'][0]] = toughCount;
                    }
                    if (adtlBoosts) {
                        for (let boost in adtlBoosts) {
                            partBoosts[boost] = partBoosts[boost] || 0;
                            partBoosts[boost] += adtlBoosts[boost];
                        }
                    }
                }
                //console.log(body.length,body);
                return [body,partBoosts];
            }
            //console.log(body);
            return body;
    };
    
    StructureSpawn.prototype.boostEffect = function(part,boost) {
        let modifier = Object.values(BOOSTS[part][boost])[0];
        let effect = ((part != TOUGH) ? modifier : 1 / modifier) - 1;
        return effect;
    }
    
    StructureSpawn.prototype.findBodyCost = function(body) {
        var cost = 0;
        if (body) {
            for (let part of body) {
                if (Array.isArray(part)) {
                    cost += this.findBodyCost(part);
                } else {
                    cost += BODYPART_COST[part];
                }
            }
            return cost;
        }
    };
    
    StructureSpawn.prototype.bodyLength = function(body) {
        var length = 0;
        if (body.length) {
            for (let part of body) {
                if (Array.isArray(part)) {
                    length += this.bodyLength(part);
                } else {
                    length += 1;
                }
            }
        }
        return length;
    };
    
    StructureSpawn.prototype.buildBodyArray = function(bodyArray,quantity) {
        let body = [];
        for (let part of bodyArray) {
            if (Array.isArray(part)) {
                for (let i = 1; i <= quantity; i++) body = body.concat(part);
            } else {
                for (let i = 1; i <= quantity; i++) body.push(part);
            }
        }
        return body;
    }
};
