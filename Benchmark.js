module.exports = {
    cpu: function(elaborate = true) {
        this.elaborate = false || elaborate;
        this.entries = [{label: 'start', val: Game.cpu.getUsed()}];
        
        Object.defineProperty(this, 'final', {
            get: function() {
                let final = this.entries[this.entries.length - 1].val;
                return ((typeof final == 'number') ? 
                final : final.final);
            }    
        });
        
        Object.defineProperty(this, 'total', {
            get: function() {
                let final = (this.entries[this.entries.length - 1].val)
                return this.final - this.entries[0].val;
            } 
        });
        this.log = function(_label, _val = Game.cpu.getUsed()) {
            this.entries.push({label: _label, val: _val});
        }
        this.report = function(indent = 0) {
            let str = '';
            str = str.concat(`${this.total.toFixed(5)} cpu total`);
            this.entries.forEach(function(entry,index,array) {
                if (index == 0) {
                    return;
                }
                let prev = (typeof array[index - 1].val == 'number') ?
                    array[index - 1].val : array[index - 1].val.final;
                str = str.concat(`\n${'    '.repeat(indent + 1)}${entry.label} `);
                //str.concat('\n').concat('  '.repeat(indent + 1)).concat(`${entry.label}` );
                if (typeof entry.val == 'number') {
                    str = str.concat(`${(entry.val - prev).toFixed(5)} cpu`);    
                } else if (entry) {
                    if (entry.val.elaborate) {
                        str = str.concat(entry.val.report(indent + 1));
                    } else {
                        str = str.concat(entry.val.total.toFixed(5));
                    }
                }
            });
            return str;
        }
        
    }

};