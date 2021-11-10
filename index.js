import * as fs from 'fs';


const fistStrengthFarmDelay = 1;
const bodyToughnessFarmDelay = 1.25;
const psychicPowerFarmDelay = 1.5;
const tokensFarmDelay = 60;
const defaultTokensMultiplier = 5;

const statNameVariants = {
    fistStrength: [ 'fs', 'fist', 'fist strength', 'fiststrength' ],
    bodyToughness: [ 'health', 'hp', 'bt', 'body', 'body toughness', 'bodytoughness' ],
    psychicPower: [ 'pp', 'psy', 'psychic', 'psychic power', 'psychicpower' ],
    tokens: [ 'skull', 'skulls', 'tokens', 'tokensamount', 'tokens amount', 'tokenscount', 'tokens count' ]
};


/**
 * Number limiting function.
 * @param {number} min 
 * @param {number} x 
 * @param {number} max 
 * @returns number;
 */
const lim = (min, x, max) => x < min ? min : (x > max ? max : x);

/**
 * Tries to define the true stat from given name.
 * @param {string} name 
 * @returns string
 */
function defineStat(name) {
    name = /^[a-zA-Z]+$/gi.exec(name)[0];
    for (let [ stat, variants ] of Object.entries(statNameVariants)) {
        if (variants.includes(name)) return stat;
    }
    throw `Unknown stat "${name}".`;
}

/**
 * Parses the simplified string representation of number.
 * @param {string} number 
 * @returns number
 */
export function parseNumber(number) {
    if (+number || typeof number == 'number') return number;
    let multiplier = (/[a-zA-Z]+$/gi).exec(number)?.[0];
    let quantity = number.slice(0, number.length - multiplier.length || 0) || 1;
    switch(multiplier) {
        case 'k':
        case 'K':
            return quantity * 10 ** 3;
        case 'm':
        case 'M':
            return quantity * 10 ** 6;
        case 'b':
        case 'B':
            return quantity * 10 ** 9;
        case 't':
        case 'T':
            return quantity * 10 ** 12;
        case 'qa':
        case 'Qa':
            return quantity * 10 ** 15;
        case 'qi':
        case 'Qi':
            return quantity * 10 ** 18;
        default:
            throw `Can't parse the representation of number "${number}"`;
    }
}

/**
 * Converts the number to simplified string representation.
 * @param {number} number 
 * @returns string
 */
export function convertNumber(number) {
    if (number < 1000) return number + '';
    if (number > 10 ** 21 - 1) throw 'Are you seriously so strong?';
    let multiplier =
        number >= 10 ** 18 && 'Qi' ||
        number >= 10 ** 15 && 'Qa' ||
        number >= 10 ** 12 && 'T' ||
        number >= 10 ** 9 && 'B' ||
        number >= 10 ** 6 && 'M' ||
        number >= 10 ** 3 && 'K';
    let quantity =
        multiplier == 'Qi' && number / (10 ** 18) ||
        multiplier == 'Qa' && number / (10 ** 15) ||
        multiplier == 'T' && number / (10 ** 12) ||
        multiplier == 'B' && number / (10 ** 9) ||
        multiplier == 'M' && number / (10 ** 6) ||
        multiplier == 'K' && number / (10 ** 3);
    return `${quantity.toFixed(4 - (quantity + '').split(/\./)[0].length)}${multiplier}`;
}

/**
 * Parses readable time to number of seconds.
 * @param {string} time 
 * @returns number
 */
export function parseTime(time) {
    if (typeof time != 'string' || +time || !time) return +time;
    let quantities = time.split(/\s/g);
    let seconds = 0;
    for (let q of quantities) {
        let interval = q.slice(q.length - 1);
        let quantity = +q.slice(0, q.length - 1) || 1;
        if (!+quantity) throw `Invalid timestamp "${time}".`;
        switch(interval) {
            case 'd':
                seconds += quantity * 60 * 60 * 24;
                break;
            case 'h':
                seconds += quantity * 60 * 60;
                break;
            case 'm':
                seconds += quantity * 60;
                break;
            case 's':
                seconds += quantity;
                break;
            default:
                throw `Invalid timestamp "${time}".`;
        }
    }
    return seconds;
}

/**
 * Converts number of seconds to readable time.
 * @param {number} seconds 
 * @returns string
 */
export function convertTime(seconds) {
    let days = Math.floor(seconds / (60 * 60 * 24));
    seconds -= days * 60 * 60 * 24;
    let hours = Math.floor(seconds / (60 * 60));
    seconds -= hours * 60 * 60;
    let minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    let quantities = [];
    if (days) quantities.push(`${days}d`);
    if (hours) quantities.push(`${hours}h`);
    if (minutes) quantities.push(`${minutes}m`);
    if (seconds) quantities.push(`${seconds}s`);
    return quantities.join(' ');
}


/**
 * Placeholder class for farm zones.
 */
export class FarmZone {
    static fistStrength = {
        rock: new FarmZone('fistStrength', 0, 10),
        crystal: new FarmZone('fistStrength', 0, 100),
        blueStar: new FarmZone('fistStrength', 10 ** 9, 2000),
        greenStar: new FarmZone('fistStrength', 10 ** 11, 40000),
        redStar: new FarmZone('fistStrength', 10 ** 13, 8 * 10 ** 5)
    };
    static bodyToughness = {
        iceBath: new FarmZone('bodyToughness', 100, 5),
        fireBath: new FarmZone('bodyToughness', 10000, 10),
        iceberg: new FarmZone('bodyToughness', 10 ** 5, 20),
        tornado: new FarmZone('bodyToughness', 10 ** 6, 50),
        volcano: new FarmZone('bodyToughness', 10 ** 7, 100),
        hellFirePit: new FarmZone('bodyToughness', 10 ** 9, 2000),
        greenAcidPool: new FarmZone('bodyToughness', 10 ** 11, 40000),
        redAcidPool: new FarmZone('bodyToughness', 10 ** 13, 8 * 10 ** 5)
    };
    static psychicPower = {
        fly: new FarmZone('psychicPower', 0, 10),
        firstGrassLawn: new FarmZone('psychicPower', 10 ** 6, 100),
        secondGrassLawn: new FarmZone('psychicPower', 10 ** 9, 10000),
        bridge: new FarmZone('psychicPower', 10 ** 12, 10 ** 6),
        waterfall: new FarmZone('psychicPower', 10 ** 15, 10 ** 8)
    };

    constructor(stat, requires, multiplier) {
        this.stat = stat;
        this.requires = requires;
        this.multiplier = multiplier;
    }
}

/**
 * Functional class for each statistic.
 */
export class Stat {
    /**
     * Creates new stat instance.
     * @param {string} name
     * @param {number} amount 
     * @param {number} multiplier 
     * @param {number} delay 
     */
    constructor(name, amount, multiplier, delay) {
        this.name = name;
        this.amount = amount;
        this.statMultiplier = multiplier;
        this.delay = delay;
    }
    
    get multiplier() {
        return this.statMultiplier * (this.farmZoneMultiplier || 1);
    }

    get aps() {
        return this.multiplier / this.delay;
    }

    setAmount(newAmount) {
        this.amount = parseNumber(newAmount);
    }

    setMultiplier(newMultiplier) {
        this.statMultiplier = newMultiplier;
    }

    setDelay(newDelay) {
        this.delay = newDelay;
    }

    /**
     * Sets up a farm zone multiplier.
     * @param {FarmZone} farmZone
     */
    farmAt(farmZone) {
        if (farmZone.stat != this.name) return;
        this.farmZoneMultiplier = farmZone.multiplier;
    }

    /**
     * Removes farm zone multiplier.
     */
    leaveFarmZone() {
        this.farmZoneMultiplier = null;
    }

    /**
     * Calculates the amount, farmed over a certain period of time 
     * @param {number | string} time 
     * @param {boolean} repr Represent the number in simplified form.
     * @returns number
     */
    amount(time, repr=false) {
        let amount = parseTime(time) * this.aps;
        return repr ? convertNumber(amount) : amount;
    }

    /**
     * Calculates the required amount to the target.
     * @param {number | string} nextAmount 
     * @param {boolean} repr Represent the number in simplified form.
     * @returns number
     */
    amountTo(nextAmount, repr=false) {
        let amount = Math.abs(parseNumber(nextAmount) - this.amount);
        return repr ? convertNumber(amount) : amount;
    }

    /**
     * Calculates the total amount, which will be over a certain period of time.
     * @param {number | string} time 
     * @param {boolean} repr Represent the number in simplified form.
     * @returns number
     */
    amountAfter(time, repr=false) {
        let amount = this.amount + parseTime(time) * this.aps;
        return repr ? convertNumber(amount) : amount;
    }

    /**
     * Calculates the time, required to farm certain amount.
     * @param {number | string} amount  
     * @returns string
     */
    time(amount, repr=false) {
        return convertTime(parseNumber(amount) / this.aps);
    }

    /**
     * Calculates the required farm time to the target in seconds.
     * @param {number | string} nextAmount 
     * @returns string
     */
    timeTo(nextAmount) {
        let amountLeft = this.amountTo(parseNumber(nextAmount));
        return this.time(amountLeft);
    }
}

/**
 * The calculator.
 */
export default class Statistics {
    /**
     * Loads player data from JSON.
     * @param {string} path
     * @returns Statistics
     */
    static fromJSON(path) {
        let data = JSON.parse(fs.readFileSync(path));
        let stats = {};
        for (let statName in data) {
            let definedStat = defineStat(statName);
            stats[definedStat] = {
                amount: parseNumber(data[statName].amount || 0)
            };
            if (definedStat != 'tokens') {
                stats[definedStat].multiplier = parseNumber(data[statName].multiplier || 1);
            } else {
                stats[definedStat].multiplier = defaultTokensMultiplier;
            }
        }
        return new Statistics(stats.fistStrength, stats.bodyToughness, stats.psychicPower, stats.tokens);
    }
    
    /**
     * Creates new statistics.
     * @param {{ amount: number, multiplier: number }} fistStrength 
     * @param {{ amount: number, multiplier: number }} bodyToughness 
     * @param {{ amount: number, multiplier: number }} psychicPower 
     * @param {{ amount: number, multiplier: number }} tokens
     */
    constructor(
        fistStrength,
        bodyToughness,
        psychicPower,
        tokens
    ) {
        this.fistStrength = new Stat(
            'fistStrength',
            fistStrength.amount,
            fistStrength.multiplier,
            fistStrengthFarmDelay
        );
        this.bodyToughness = new Stat(
            'bodyToughness',
            bodyToughness.amount,
            bodyToughness.multiplier,
            bodyToughnessFarmDelay
        );
        this.psychicPower = new Stat(
            'psychicPower',
            psychicPower.amount,
            psychicPower.multiplier,
            psychicPowerFarmDelay
        );
        this.tokens = new Stat(
            'tokens',
            tokens.amount,
            tokens.multiplier,
            tokensFarmDelay
        );
    }

    /**
     * Sets up a farm zone multiplier.
     * @param {FarmZone} farmZone 
     */
    farmAt(farmZone) {
        [ this.fistStrength, this.bodyToughness, this.psychicPower ]
        .forEach(stat => stat.farmAt(farmZone));
    }

    /**
     * Removes farm zone multiplier.
     */
    leaveFarmZone() {
        [ this.fistStrength, this.bodyToughness, this.psychicPower ]
        .forEach(stat => stat.leaveFarmZone());
    }

    /**
     * Calculates stats balance coefficient.
     * Balance coefficient means the range from perfect equal stats.
     * @returns number
     */
    calculateBalanceCoefficient() {
        return [  
            this.fistStrength / this.bodyToughness,
            this.fistStrength / this.psychicPower,
            this.bodyToughness / this.fistStrength,
            this.bodyToughness / this.psychicPower,
            this.psychicPower / this.fistStrength,
            this.psychicPower / this.bodyToughness
        ].reduce((a, b) => a + b) / 6;
    }

    /**
     * Predicts the normalized damage from soul attacking.
     * @param {number | string} opponentPsychicPower 
     * @param {number} approxMinDmg Approximate minimal damage.
     * @returns number
     */
    predictSoulAttackDamage(opponentPsychicPower, approxMinDmg=0.2) {
        opponentPsychicPower = parseNumber(opponentPsychicPower);
        let x = this.psychicPower.amount / opponentPsychicPower;
        return x < 10 && x > 0.1 ? 0 :
            x >= 10 ?
                approxMinDmg + (1 - approxMinDmg) * lim(0, (x - 10) / 90, 1)
            :
                -approxMinDmg - (1 - approxMinDmg) * lim(0, -((x - 0.1) / 0.09), 1);
    }
}