import util from "util";

/**
 * Provides utilities for working with many Discord structures
 * @prop {String} id A Discord snowflake identifying the object
 * @prop {Number} createdAt Timestamp of structure creation
 */
export default class Base {
    readonly id?: string;
    constructor(id: string) {
        if(id) {
            this.id = id;
        }
    }

    get createdAt(): number {
        return Base.getCreatedAt(this.id);
    }

    /**
     * Calculates the timestamp in milliseconds associated with a Discord ID/snowflake
     */
    static getCreatedAt(structureId?: string): number {
        return Base.getDiscordEpoch(structureId) + 1420070400000;
    }

    /**
     * Gets the number of milliseconds since epoch represented by an ID/snowflake
     */
    static getDiscordEpoch(structureId?: string): number {
        if (structureId === undefined) {
            return Number.NaN;
        }

        const parsedStructureId = Number.parseInt(structureId, 10);
        const result = Math.floor(parsedStructureId / 4194304);
        if (Number.isNaN(result)) {
            return Number.NaN;
        }
        return result;
    }

    [util.inspect.custom]() {
        // http://stackoverflow.com/questions/5905492/dynamic-function-name-in-javascript
        const copy: { [K in keyof this]?: this[K] } = new {[this.constructor.name]: class {}}[this.constructor.name]();
        for(const key in this) {
            if(this.hasOwnProperty(key) && !key.startsWith("_") && this[key] !== undefined) {
                copy[key] = this[key];
            }
        }
        return copy;
    }

    toString(): string {
        return `[${this.constructor.name} ${this.id}]`;
    }

    toJSON(props: (keyof this)[] = []): Partial<Record<keyof this, unknown>> {
        const json: Partial<Record<keyof this, unknown>> = {};
        if(this.id) {
            json.id = this.id;
            json.createdAt = this.createdAt;
        }
        for(const prop of props) {
            const value: unknown = this[prop];
            if(value === undefined) {
                continue;
            }

            switch (typeof value) {
                case "bigint":
                        json[prop] = value.toString();
                        break;

                case "object":
                case "function":
                    if((value as any).toJSON === "function") {
                        json[prop] = (value as any).toJSON();
                        break;
                    }

                    if((value as any).values === "function") {
                        json[prop] = [...(value as any).values()];
                        break;
                    }

                    if(typeof value === "object") {
                        json[prop] = value;
                        break;
                    }
                    break;
                default:
                    json[prop] = value;
                    break;
            }
        }
        return json;
    }
}
