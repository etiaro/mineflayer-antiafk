import { Bot } from "mineflayer";

/**
 * Mineflayer AntiAfk plugin
 * @example
 * const antiAfk = require('mineflayer-anti-afk');
 * bot.loadPlugin(antiAfk);
 */
declare const antiafk: (bot: Bot) => void;

interface afk {
  /**
   * bot starts to perform allowed actions sequentially, with randomized order, time and details(such as walking and looking direction, block choosing) If fishing is enabled, bot checks if it can start fishing(eg. if a fishing rod is available in eq) between all performed actions, and decides whether start to fish or stay in normal mode.
   * @example
   * bot.afk.start();
   */
  start: () => Promise<void>;
  /**
   * disables anti afk
   */
  stop: () => Promise<void>;
  setOptions: (options?: afkOptions) => void;

  // Internal Functions
  fish: () => Promise<void>;
  rotate: () => Promise<void>;
  walk: (dir: "forward" | "back" | "left" | "right") => Promise<void>;
  jump: () => Promise<void>;
  jumpWalk: () => Promise<void>;
  swingArm: () => Promise<void>;
  placeBlock: () => Promise<void>;
  breakBlock: () => Promise<void>;
  chat: () => Promise<void>;

  // Internal Variables
  isFishing: boolean;
  config: afkOptions;
  enabled: boolean;
  killaura: {
    enabled: boolean;
    interval: any;
  };
}
interface afkOptions {
  /**
   * Array, allowed bot actions during normal mode(not fishing)
   * @default
   * ['rotate', 'walk', 'jump', 'jumpWalk', 'swingArm', 'placeBlock', 'breakBlock']
   */
  actions?: afkAction[];

  /**
   * Boolean, defining if bot can fish(it will start only when standing in water and having a fishing rod in equipment
   * @default true
   */
  fishing?: boolean;

  /**
   * Integer, defines minimum time of action 'walk' in ms
   * @default 2000
   */
  minWalkingTime?: number;

  /**
   * Integer, defines maximum time of action 'walk' in ms
   * @default 4000
   */
  maxWalkingTime?: number;

  /**
   * Integer, defines minimum time between actions in ms
   * @default 0
   */
  minActionsInterval?: number;

  /**
   * Integer, defines maximum time between actions in ms
   * @default 500
   */
  maxActionsInterval?: number;

  /**
   * Array, block IDs allowed to break
   * @default
   * [2, 3, 5, 12, 13, 17]
   */
  breaking?: number[];

  /**
   * Array, block IDs allowed to place(if available in equipment)
   * @default
   * [3, 5, 12, 13, 17]
   */
  placing?: number[];

  /**
   * Boolean, defining if bot has to send chat messages
   * @default true
   */
  chatting?: boolean;

  /**
   * Array, messages to be sent by bot
   * @default
   * ['!que', '!queue']
   */
  chatMessages?: string[];

  /**
   * Integer, interval between sent messages in ms
   * @default 300000
   */
  chatInterval?: number;

  /**
   * Integer, defines if killaura should be enabled(only hostile mobs)
   * @default true
   */
  killauraEnabled?: boolean;

  /**
   * Integer, defines if mineflayer-auto-eat should be enabled
   * @default true
   */
  autoEatEnabled?: boolean;

  // mineflayer-auto-eat has no type definition
  /**
   * Object mineflayer-auto-eat configurations(look [here](https://github.com/LINKdiscordd/mineflayer-auto-eat#botautoeatoptions))
   * @default
   * {
   *   priority: "foodPoints",
   *   startAt: 14,
   *   bannedFood: [],
   * }
   */
  autoEatConfig?: any;
}
type afkAction =
  | "rotate"
  | "walk"
  | "jump"
  | "jumpWalk"
  | "swingArm"
  | "placeBlock"
  | "breakBlock";

declare module "mineflayer" {
  interface Bot {
    afk: afk;
  }
}

export = antiafk;
