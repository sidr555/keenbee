const GPU = require("./gpu")

class NvidiaGPU extends GPU {

    temp = {
        good: 49,
        max: 50,
        critical: 55
    }
    
    power = {
        max: 85,
        min: 55,
        step: {
            up: 2,
            down: 4
        }
    }

    oc_keys = ["power_limit"]

    getOverclockParams() {
        const oc = {}
        const power_limit = this.oc.nvidia.power_limit[this.index];
        if (this.isOverheated()) {
            console.log(`GPU (n) w:${this.worker} #${this.index} is overheated ${this.stat.temp} (oc pl: ${power_limit}, stat pl: ${this.stat.power})`);
            if (power_limit > this.power.min) {
                const power = power_limit - this.power.step.down;
                oc.power_limit = power >= this.power.min ? power : this.power.min;  
            } else {
                // console.log("Cannot power down nvidia GPU", this.info);
                return false;
            }
        } else if (this.isGood()) {
            return false;
        } else {
            // return false;
            if (power_limit < this.power.max) {
                const power = power_limit + this.power.step.up;
                oc.power_limit = power <= this.power.max ? power : this.power.max;  
            } else {
                // console.log("Cannot power up nvidia GPU", this.info);
                return false;
            }
        }
        return oc;
    }
}
 
module.exports = NvidiaGPU;