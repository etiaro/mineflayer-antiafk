# mineflayer-antiafk

A mineflayer plugin made to overcome antiafk plugins

## Running

You can test it up by writing

```
npm install
npm start -- <ip> <port> <username> <password(nothing for offline)>
```

## Usage

Firstly, install with

```
npm i https://github.com/Etiaro/mineflayer-antiafk

```

Then, here's example js code:

```js
const mineflayer = require("mineflayer");
const bot = mineflayer.createBot();
const antiafk = require("mineflayer-antiafk");

bot.loadPlugin(antiafk);

bot.on("spawn", () => {
  bot.afk.setOptions({ fishing: false }); //disables fishing
  bot.afk.start();
});

bot.on("health", () => {
  if (bot.health < 5) bot.afk.stop();
});
```

## Behaviour

When called bot.afk.start(), bot starts to perform allowed actions sequentially, with randomized order, time and details(such as walking and looking direction, block choosing)
If fishing is enabled, bot checks if it can start fishing(eg. if a fishing rod is available in eq) between all performed actions, and decides whether start to fish or stay in normal mode.

## Options

### actions

- **default** ['rotate', 'walk', 'jump', 'jumpWalk', 'swingArm', 'placeBlock', 'breakBlock']
- Array, allowed bot actions during normal mode(not fishing)

### fishing

- **default** true
- Boolean, defining if bot can fish(it will start only when standing in water and having a fishing rod in equipment

### minWalkingTime

- **default** 2000
- Integer, defines minimum time of action 'walk' in ms

### maxWalkingTime

- **default** 4000
- Integer, defines maximum time of action 'walk' in ms

### minActionsInterval

- **default** 0
- Integer, defines minimum time between actions in ms

### maxActionsInterval

- **default** 500
- Integer, defines maximum time between actions in ms

### breaking

- **default** [2, 3, 5, 12, 13, 17]
- Array, block IDs allowed to break

### placing

- **default** [3, 5, 12, 13, 17]
- Array, block IDs allowed to place(if available in equipment)

### chatting

- **default** true
- Boolean, defining if bot has to send chat messages,

### chatMessages

- **default** ['!que', '!queue']
- Array, messages to be sent by bot

### chatInterval

- **default** 300000
- Integer, interval between sent messages in ms

### killauraEnabled

- **default** true
- Integer, defines if killaura should be enabled(only hostile mobs)

### autoEatEnabled

- **default** true
- Integer, defines if [mineflayer-auto-eat](https://github.com/LINKdiscordd/mineflayer-auto-eat) should be enabled

### autoEatConfig

- **default** { priority: "foodPoints", startAt: 14, bannedFood: [] }
- Object mineflayer-auto-eat configurations(look [here](https://github.com/LINKdiscordd/mineflayer-auto-eat#botautoeatoptions))
