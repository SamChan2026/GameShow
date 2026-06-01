System.register("chunks:///_virtual/BotAI.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './GameConfig.ts', './GameMath.ts', './GameTypes.ts'], function (exports) {
  var _createForOfIteratorHelperLoose, cclegacy, CONFIG, randomRange, distanceSq, angleOf, dot, normalize, directionFromAngle, FoodKind;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      CONFIG = module.CONFIG;
    }, function (module) {
      randomRange = module.randomRange;
      distanceSq = module.distanceSq;
      angleOf = module.angleOf;
      dot = module.dot;
      normalize = module.normalize;
      directionFromAngle = module.directionFromAngle;
    }, function (module) {
      FoodKind = module.FoodKind;
    }],
    execute: function () {
      cclegacy._RF.push({}, "625775fIwFNiIDlDrBtpYwS", "BotAI", undefined);
      var BotAI = exports('BotAI', /*#__PURE__*/function () {
        function BotAI() {}
        var _proto = BotAI.prototype;
        _proto.updateDecision = function updateDecision(snake, dt, context) {
          snake.aiDecisionIn -= dt;
          if (snake.aiDecisionIn > 0 && !this.isWallDangerAhead(snake, snake.direction, 320)) {
            return;
          }
          var obstacles = this.collectObstaclePoints(snake, context);
          var dangerAhead = this.isDangerAhead(snake, snake.direction, 360, obstacles);
          if (dangerAhead && Math.random() > CONFIG.aiAvoidDangerChance) {
            snake.aiDecisionIn = randomRange(0.12, 0.24);
            return;
          }
          var foods = dangerAhead ? [] : this.collectFoodCandidates(snake, context.foods);
          snake.targetDirection = this.pickBestDirection(snake, dangerAhead, obstacles, foods);
          snake.aiDecisionIn = dangerAhead ? randomRange(0.12, 0.28) : randomRange(0.28, 0.68);
        };
        _proto.isDangerAhead = function isDangerAhead(snake, direction, lookAhead, obstacles) {
          if (this.isWallDangerAhead(snake, direction, lookAhead)) {
            return true;
          }
          var future = {
            x: snake.head.x + direction.x * lookAhead,
            y: snake.head.y + direction.y * lookAhead
          };
          for (var _iterator = _createForOfIteratorHelperLoose(obstacles), _step; !(_step = _iterator()).done;) {
            var obstacle = _step.value;
            var dangerRange = snake.radius + obstacle.radius + 46;
            if (distanceSq(future, obstacle) < dangerRange * dangerRange) {
              return true;
            }
          }
          return this.scoreDirectionSafety(snake, direction, obstacles) < 95;
        };
        _proto.isWallDangerAhead = function isWallDangerAhead(snake, direction, lookAhead) {
          var future = {
            x: snake.head.x + direction.x * lookAhead,
            y: snake.head.y + direction.y * lookAhead
          };
          var halfWidth = CONFIG.worldWidth * 0.5;
          var halfHeight = CONFIG.worldHeight * 0.5;
          return future.x < -halfWidth + 90 || future.x > halfWidth - 90 || future.y < -halfHeight + 90 || future.y > halfHeight - 90;
        };
        _proto.pickBestDirection = function pickBestDirection(snake, urgent, obstacles, foods) {
          var best = snake.direction;
          var bestScore = -Infinity;
          var baseAngle = angleOf(snake.direction);
          var maxOffset = urgent ? Math.PI * 0.95 : Math.PI * 0.62;
          var samples = urgent ? 24 : 18;
          for (var i = -samples; i <= samples; i++) {
            var dir = directionFromAngle(baseAngle + i / samples * maxOffset);
            var safety = this.scoreDirectionSafety(snake, dir, obstacles);
            var food = urgent ? 0 : this.scoreDirectionFood(snake, dir, foods);
            var smoothness = dot(dir, snake.direction) * 90 + dot(dir, snake.targetDirection) * 36;
            var reversePenalty = dot(dir, snake.direction) < -0.15 ? 260 : 0;
            var score = safety * 2.7 + food + smoothness - reversePenalty + Math.random() * 22;
            if (score > bestScore) {
              bestScore = score;
              best = dir;
            }
          }
          return best;
        };
        _proto.scoreDirectionSafety = function scoreDirectionSafety(snake, direction, obstacles) {
          var probeDistances = [130, 300, 540];
          var score = 520;
          for (var _i = 0, _probeDistances = probeDistances; _i < _probeDistances.length; _i++) {
            var probeDistance = _probeDistances[_i];
            var future = {
              x: snake.head.x + direction.x * probeDistance,
              y: snake.head.y + direction.y * probeDistance
            };
            var wallDistance = Math.min(CONFIG.worldWidth * 0.5 - Math.abs(future.x), CONFIG.worldHeight * 0.5 - Math.abs(future.y)) - snake.radius;
            score = Math.min(score, wallDistance + probeDistance * 0.16);
            for (var _iterator2 = _createForOfIteratorHelperLoose(obstacles), _step2; !(_step2 = _iterator2()).done;) {
              var obstacle = _step2.value;
              var dangerRange = snake.radius + obstacle.radius + 36;
              var dSq = distanceSq(future, obstacle);
              if (dSq > (dangerRange + 260) * (dangerRange + 260)) {
                continue;
              }
              var clearance = Math.sqrt(dSq) - dangerRange;
              score = Math.min(score, clearance + probeDistance * 0.1);
            }
          }
          return score;
        };
        _proto.collectObstaclePoints = function collectObstaclePoints(snake, context) {
          var obstacles = [];
          var detectRange = Math.max(CONFIG.aiDetectRange + 360, 1180);
          var detectSq = detectRange * detectRange;
          for (var _iterator3 = _createForOfIteratorHelperLoose(context.snakes), _step3; !(_step3 = _iterator3()).done;) {
            var other = _step3.value;
            if (other.dead || other === snake || other.invincibleTime > 0) {
              continue;
            }
            var otherBody = context.getSnakeBodySample(other);
            var step = other.targetLength > 300 ? 12 : other.targetLength > 180 ? 9 : other.targetLength > 80 ? 6 : 3;
            for (var i = 0; i < otherBody.length; i += step) {
              if (distanceSq(snake.head, otherBody[i]) > detectSq) {
                continue;
              }
              obstacles.push({
                x: otherBody[i].x,
                y: otherBody[i].y,
                radius: other.radius
              });
              if (obstacles.length >= 420) {
                return obstacles;
              }
            }
          }
          return obstacles;
        };
        _proto.collectFoodCandidates = function collectFoodCandidates(snake, foods) {
          var candidates = [];
          var detectSq = CONFIG.aiDetectRange * CONFIG.aiDetectRange;
          for (var _iterator4 = _createForOfIteratorHelperLoose(foods), _step4; !(_step4 = _iterator4()).done;) {
            var food = _step4.value;
            var dSq = distanceSq(snake.head, food.position);
            if (dSq > detectSq) {
              continue;
            }
            var distanceValue = Math.sqrt(dSq);
            candidates.push({
              food: food,
              value: this.getFoodValue(food) / (1 + distanceValue * 0.006)
            });
          }
          candidates.sort(function (a, b) {
            return b.value - a.value;
          });
          candidates.length = Math.min(candidates.length, 28);
          return candidates;
        };
        _proto.scoreDirectionFood = function scoreDirectionFood(snake, direction, foods) {
          var score = 0;
          for (var _iterator5 = _createForOfIteratorHelperLoose(foods), _step5; !(_step5 = _iterator5()).done;) {
            var candidate = _step5.value;
            var food = candidate.food;
            var towardFood = normalize({
              x: food.position.x - snake.head.x,
              y: food.position.y - snake.head.y
            });
            var alignment = dot(direction, towardFood);
            if (alignment < -0.15) {
              continue;
            }
            var laneBonus = Math.max(0, alignment);
            var sideReach = Math.max(0, 1 - Math.abs(alignment) * 0.22);
            score += candidate.value * (0.18 + laneBonus * laneBonus * 1.2) * sideReach;
          }
          return score;
        };
        _proto.getFoodValue = function getFoodValue(food) {
          if (food.kind === FoodKind.Meat) {
            return food.score * 150 + 1100;
          }
          if (food.kind === FoodKind.Magnet) {
            return food.score * 110 + 620;
          }
          if (food.kind === FoodKind.Big) {
            return food.score * 130 + 360;
          }
          return food.score * 120;
        };
        return BotAI;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/CollisionSystem.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './GameConfig.ts', './GameMath.ts'], function (exports) {
  var _createForOfIteratorHelperLoose, cclegacy, CONFIG, distanceSq, distance;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      CONFIG = module.CONFIG;
    }, function (module) {
      distanceSq = module.distanceSq;
      distance = module.distance;
    }],
    execute: function () {
      cclegacy._RF.push({}, "ce961VxeAFB84k+icqdhfDO", "CollisionSystem", undefined);
      var CollisionSystem = exports('CollisionSystem', /*#__PURE__*/function () {
        function CollisionSystem() {}
        var _proto = CollisionSystem.prototype;
        _proto.hasCollision = function hasCollision(snake, snakes, getSnakeBodySample) {
          if (snake.dead || snake.invincibleTime > 0) {
            return false;
          }
          var head = snake.head;
          var halfWidth = CONFIG.worldWidth * 0.5;
          var halfHeight = CONFIG.worldHeight * 0.5;
          if (head.x < -halfWidth + snake.radius || head.x > halfWidth - snake.radius || head.y < -halfHeight + snake.radius || head.y > halfHeight - snake.radius) {
            return true;
          }
          for (var _iterator = _createForOfIteratorHelperLoose(snakes), _step; !(_step = _iterator()).done;) {
            var other = _step.value;
            if (other.dead || other === snake || other.invincibleTime > 0) {
              continue;
            }
            var otherBody = getSnakeBodySample(other);
            var step = other.targetLength > 120 ? 3 : other.targetLength > 60 ? 2 : 1;
            var hitRange = snake.radius + other.radius * 0.82;
            var hitRangeSq = hitRange * hitRange;
            for (var i = 1; i < otherBody.length; i += step) {
              if (distanceSq(head, otherBody[i]) <= hitRangeSq) {
                return true;
              }
            }
          }
          return false;
        };
        _proto.isSpawnPointSafe = function isSpawnPointSafe(candidate, player, snakes, minDistanceFromPlayer, getSnakeBodySample) {
          if (player.segments.length && distance(candidate, player.head) < minDistanceFromPlayer) {
            return false;
          }
          var clearanceSq = CONFIG.spawnBodyClearance * CONFIG.spawnBodyClearance;
          for (var _iterator2 = _createForOfIteratorHelperLoose(snakes), _step2; !(_step2 = _iterator2()).done;) {
            var _snake = _step2.value;
            if (_snake.dead) {
              continue;
            }
            var body = getSnakeBodySample(_snake);
            var step = _snake.targetLength > 120 ? 5 : _snake.targetLength > 60 ? 3 : 2;
            for (var i = 0; i < body.length; i += step) {
              if (distanceSq(candidate, body[i]) < clearanceSq) {
                return false;
              }
            }
          }
          return true;
        };
        return CollisionSystem;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/FoodSystem.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './GameConfig.ts', './GameMath.ts', './GameTypes.ts'], function (exports) {
  var _createForOfIteratorHelperLoose, cclegacy, CONFIG, getMeatScore, color, getGrowthCost, FOOD_COLORS, distanceSq, randomRange, clamp, randomInt, directionFromAngle, FoodKind;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      CONFIG = module.CONFIG;
      getMeatScore = module.getMeatScore;
      color = module.color;
      getGrowthCost = module.getGrowthCost;
      FOOD_COLORS = module.FOOD_COLORS;
    }, function (module) {
      distanceSq = module.distanceSq;
      randomRange = module.randomRange;
      clamp = module.clamp;
      randomInt = module.randomInt;
      directionFromAngle = module.directionFromAngle;
    }, function (module) {
      FoodKind = module.FoodKind;
    }],
    execute: function () {
      cclegacy._RF.push({}, "1c179+EmFRELpPIzmaOMgvx", "FoodSystem", undefined);
      var FoodSystem = exports('FoodSystem', /*#__PURE__*/function () {
        function FoodSystem() {
          this.magnetSpawnIn = 0;
        }
        var _proto = FoodSystem.prototype;
        _proto.reset = function reset() {
          this.magnetSpawnIn = 0;
        };
        _proto.update = function update(foods, dt, randomWorldPoint, protectedCenter, protectedHalfWidth, protectedHalfHeight) {
          this.updateMagnetMotion(foods, dt);
          this.maintainFoodCount(foods, randomWorldPoint);
          this.maintainMagnetCount(foods, dt, randomWorldPoint);
          this.pruneFoodOverflow(foods, protectedCenter, protectedHalfWidth, protectedHalfHeight);
        };
        _proto.maintainFoodCount = function maintainFoodCount(foods, randomWorldPoint) {
          var normal = 0;
          var big = 0;
          for (var _iterator = _createForOfIteratorHelperLoose(foods), _step; !(_step = _iterator()).done;) {
            var food = _step.value;
            if (food.kind === FoodKind.Normal) {
              normal += 1;
            } else if (food.kind === FoodKind.Big) {
              big += 1;
            }
          }
          while (normal < CONFIG.normalFoodTarget) {
            foods.push(this.createFood(FoodKind.Normal, randomWorldPoint));
            normal += 1;
          }
          while (big < CONFIG.bigFoodTarget) {
            foods.push(this.createFood(FoodKind.Big, randomWorldPoint));
            big += 1;
          }
        };
        _proto.absorbFood = function absorbFood(foods, snake, dt) {
          var head = snake.head;
          var baseAbsorbRange = snake.isPlayer ? CONFIG.playerAbsorbRange : CONFIG.botAbsorbRange;
          var absorbRange = snake.magnetTime > 0 ? baseAbsorbRange * CONFIG.magnetAbsorbMultiplier : baseAbsorbRange;
          var lengthChanged = false;
          for (var i = foods.length - 1; i >= 0; i--) {
            var food = foods[i];
            var eatRange = snake.radius + food.radius + 4;
            var dSq = distanceSq(head, food.position);
            var eatRangeSq = eatRange * eatRange;
            var snapRange = absorbRange * 0.35;
            if (dSq <= eatRangeSq || dSq <= snapRange * snapRange) {
              lengthChanged = this.applyFood(snake, food) || lengthChanged;
              foods.splice(i, 1);
              continue;
            }
            if (dSq <= absorbRange * absorbRange && dSq > 0.0001) {
              var d = Math.sqrt(dSq);
              var pull = Math.min(1, dt * (snake.isPlayer ? 7 : 3));
              food.position.x += (head.x - food.position.x) / d * absorbRange * pull;
              food.position.y += (head.y - food.position.y) / d * absorbRange * pull;
            }
          }
          return lengthChanged;
        };
        _proto.dropMeat = function dropMeat(foods, snake, body) {
          var meatScore = getMeatScore(snake.targetLength);
          var maxDrops = Math.min(snake.targetLength, CONFIG.maxMeatDropsPerSnake);
          var stride = Math.max(1, Math.floor(body.length / maxDrops));
          for (var i = 0; i < body.length; i += stride) {
            var segment = body[i];
            foods.push({
              kind: FoodKind.Meat,
              position: {
                x: segment.x + randomRange(-12, 12),
                y: segment.y + randomRange(-12, 12)
              },
              score: meatScore,
              radius: randomRange(7, 11),
              color: color(clamp(snake.color.r + randomInt(-35, 45), 0, 255), clamp(snake.color.g + randomInt(-35, 45), 0, 255), clamp(snake.color.b + randomInt(-35, 45), 0, 255))
            });
          }
        };
        _proto.createFood = function createFood(kind, randomWorldPoint) {
          var baseColor = FOOD_COLORS[randomInt(0, FOOD_COLORS.length - 1)];
          if (kind === FoodKind.Magnet) {
            return {
              kind: kind,
              position: randomWorldPoint(120),
              score: 0,
              radius: 15,
              color: color(255, 82, 82)
            };
          }
          if (kind === FoodKind.Big) {
            return {
              kind: kind,
              position: randomWorldPoint(90),
              score: randomInt(3, 5),
              radius: randomRange(11, 15),
              color: baseColor
            };
          }
          return {
            kind: kind,
            position: randomWorldPoint(70),
            score: 1,
            radius: randomRange(5, 8),
            color: baseColor
          };
        };
        _proto.applyFood = function applyFood(snake, food) {
          if (food.kind === FoodKind.Magnet) {
            snake.magnetTime = CONFIG.magnetDurationSeconds;
            return false;
          }
          snake.score += food.score;
          snake.growthBank += food.score;
          var previousLength = snake.targetLength;
          while (snake.targetLength < CONFIG.maxLength) {
            var cost = getGrowthCost(snake.targetLength);
            if (snake.growthBank < cost) {
              break;
            }
            snake.growthBank -= cost;
            snake.targetLength += 1;
          }
          return snake.targetLength !== previousLength;
        };
        _proto.pruneFoodOverflow = function pruneFoodOverflow(foods, protectedCenter, protectedHalfWidth, protectedHalfHeight) {
          if (protectedHalfWidth === void 0) {
            protectedHalfWidth = 0;
          }
          if (protectedHalfHeight === void 0) {
            protectedHalfHeight = 0;
          }
          var meatCount = this.countFoodKind(foods, FoodKind.Meat);
          while (meatCount > CONFIG.maxMeatFoodCount) {
            if (!this.removeOldestFoodKind(foods, FoodKind.Meat, protectedCenter, protectedHalfWidth, protectedHalfHeight)) {
              break;
            }
            meatCount -= 1;
          }
          while (foods.length > CONFIG.maxFoodCount) {
            if (this.removeOldestFoodKind(foods, FoodKind.Meat, protectedCenter, protectedHalfWidth, protectedHalfHeight)) {
              continue;
            }
            if (!this.removeOldestNonProtectedFood(foods, protectedCenter, protectedHalfWidth, protectedHalfHeight)) {
              break;
            }
          }
        };
        _proto.countFoodKind = function countFoodKind(foods, kind) {
          var count = 0;
          for (var _iterator2 = _createForOfIteratorHelperLoose(foods), _step2; !(_step2 = _iterator2()).done;) {
            var food = _step2.value;
            if (food.kind === kind) {
              count += 1;
            }
          }
          return count;
        };
        _proto.removeOldestFoodKind = function removeOldestFoodKind(foods, kind, protectedCenter, protectedHalfWidth, protectedHalfHeight) {
          var _this = this;
          if (protectedHalfWidth === void 0) {
            protectedHalfWidth = 0;
          }
          if (protectedHalfHeight === void 0) {
            protectedHalfHeight = 0;
          }
          var index = foods.findIndex(function (food) {
            return food.kind === kind && !_this.isProtectedFood(food, protectedCenter, protectedHalfWidth, protectedHalfHeight);
          });
          if (index < 0) {
            return false;
          }
          foods.splice(index, 1);
          return true;
        };
        _proto.removeOldestNonProtectedFood = function removeOldestNonProtectedFood(foods, protectedCenter, protectedHalfWidth, protectedHalfHeight) {
          var _this2 = this;
          if (protectedHalfWidth === void 0) {
            protectedHalfWidth = 0;
          }
          if (protectedHalfHeight === void 0) {
            protectedHalfHeight = 0;
          }
          var index = foods.findIndex(function (food) {
            return !_this2.isProtectedFood(food, protectedCenter, protectedHalfWidth, protectedHalfHeight);
          });
          if (index < 0) {
            return false;
          }
          foods.splice(index, 1);
          return true;
        };
        _proto.isProtectedFood = function isProtectedFood(food, protectedCenter, protectedHalfWidth, protectedHalfHeight) {
          if (protectedHalfWidth === void 0) {
            protectedHalfWidth = 0;
          }
          if (protectedHalfHeight === void 0) {
            protectedHalfHeight = 0;
          }
          if (!protectedCenter) {
            return false;
          }
          return Math.abs(food.position.x - protectedCenter.x) <= protectedHalfWidth && Math.abs(food.position.y - protectedCenter.y) <= protectedHalfHeight;
        };
        _proto.maintainMagnetCount = function maintainMagnetCount(foods, dt, randomWorldPoint) {
          this.magnetSpawnIn = Math.max(0, this.magnetSpawnIn - dt);
          if (this.magnetSpawnIn > 0) {
            return;
          }
          var magnetCount = this.countFoodKind(foods, FoodKind.Magnet);
          while (magnetCount < CONFIG.magnetTargetCount) {
            foods.push(this.createFood(FoodKind.Magnet, randomWorldPoint));
            magnetCount += 1;
          }
          this.magnetSpawnIn = CONFIG.magnetSpawnInterval;
        };
        _proto.updateMagnetMotion = function updateMagnetMotion(foods, dt) {
          var halfWidth = CONFIG.worldWidth * 0.5 - 120;
          var halfHeight = CONFIG.worldHeight * 0.5 - 120;
          for (var _iterator3 = _createForOfIteratorHelperLoose(foods), _step3; !(_step3 = _iterator3()).done;) {
            var _food$wanderTime;
            var food = _step3.value;
            if (food.kind !== FoodKind.Magnet) {
              continue;
            }
            food.wanderTime = ((_food$wanderTime = food.wanderTime) != null ? _food$wanderTime : 0) - dt;
            if (!food.velocity || food.wanderTime <= 0) {
              var direction = directionFromAngle(randomRange(0, Math.PI * 2));
              var speed = randomRange(CONFIG.magnetDriftSpeedMin, CONFIG.magnetDriftSpeedMax);
              food.velocity = {
                x: direction.x * speed,
                y: direction.y * speed
              };
              food.wanderTime = randomRange(1.6, 3.8);
            }
            food.position.x += food.velocity.x * dt;
            food.position.y += food.velocity.y * dt;
            if (Math.abs(food.position.x) > halfWidth) {
              food.position.x = clamp(food.position.x, -halfWidth, halfWidth);
              food.velocity.x *= -1;
            }
            if (Math.abs(food.position.y) > halfHeight) {
              food.position.y = clamp(food.position.y, -halfHeight, halfHeight);
              food.velocity.y *= -1;
            }
          }
        };
        return FoodSystem;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/GameBootstrap.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './BotAI.ts', './CollisionSystem.ts', './GameConfig.ts', './FoodSystem.ts', './GameMath.ts', './GameRenderer.ts', './GameUI.ts', './GhostKingSystem.ts', './GameTypes.ts', './SnakeActor.ts', './SnakeMovement.ts', './SpawnSystem.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _createForOfIteratorHelperLoose, _initializerDefineProperty, _assertThisInitialized, _asyncToGenerator, _regeneratorRuntime, cclegacy, _decorator, Prefab, Node, UITransform, Graphics, view, input, Input, KeyCode, sys, Component, BotAI, CollisionSystem, SNAKE_COLORS, CONFIG, loadGameConfig, FoodSystem, point, copyPoint, dot, normalize, clamp, GameRenderer, GameUI, GhostKingSystem, GameState, SnakeActor, SnakeMovement, SpawnSystem;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Prefab = module.Prefab;
      Node = module.Node;
      UITransform = module.UITransform;
      Graphics = module.Graphics;
      view = module.view;
      input = module.input;
      Input = module.Input;
      KeyCode = module.KeyCode;
      sys = module.sys;
      Component = module.Component;
    }, function (module) {
      BotAI = module.BotAI;
    }, function (module) {
      CollisionSystem = module.CollisionSystem;
    }, function (module) {
      SNAKE_COLORS = module.SNAKE_COLORS;
      CONFIG = module.CONFIG;
      loadGameConfig = module.loadGameConfig;
    }, function (module) {
      FoodSystem = module.FoodSystem;
    }, function (module) {
      point = module.point;
      copyPoint = module.copyPoint;
      dot = module.dot;
      normalize = module.normalize;
      clamp = module.clamp;
    }, function (module) {
      GameRenderer = module.GameRenderer;
    }, function (module) {
      GameUI = module.GameUI;
    }, function (module) {
      GhostKingSystem = module.GhostKingSystem;
    }, function (module) {
      GameState = module.GameState;
    }, function (module) {
      SnakeActor = module.SnakeActor;
    }, function (module) {
      SnakeMovement = module.SnakeMovement;
    }, function (module) {
      SpawnSystem = module.SpawnSystem;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;
      cclegacy._RF.push({}, "9bb2eP8OL5OXYYR0WuBa5Za", "GameBootstrap", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var PREFERENCES_KEY = 'tv-snake-preferences';
      var GameBootstrap = exports('GameBootstrap', (_dec = ccclass('GameBootstrap'), _dec2 = property(Prefab), _dec3 = property(Prefab), _dec4 = property(Prefab), _dec5 = property(Prefab), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(GameBootstrap, _Component);
        function GameBootstrap() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "gameUiPrefab", _descriptor, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "startMenuPrefab", _descriptor2, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "skinSelectPrefab", _descriptor3, _assertThisInitialized(_this));
          _initializerDefineProperty(_this, "reviveDialogPrefab", _descriptor4, _assertThisInitialized(_this));
          _this.runtimeRoot = void 0;
          _this.worldRoot = void 0;
          _this.worldTransform = void 0;
          _this.graphics = void 0;
          _this.renderer = void 0;
          _this.ui = void 0;
          _this.botAI = new BotAI();
          _this.collisionSystem = new CollisionSystem();
          _this.foodSystem = new FoodSystem();
          _this.ghostKingSystem = new GhostKingSystem();
          _this.snakeMovement = new SnakeMovement();
          _this.spawnSystem = new SpawnSystem();
          _this.state = GameState.Menu;
          _this.foods = [];
          _this.snakes = [];
          _this.player = new SnakeActor(0, '玩家', true, SNAKE_COLORS[0]);
          _this.camera = point();
          _this.zoom = 1;
          _this.deathCountdown = 0;
          _this.savedScore = 0;
          _this.savedLength = CONFIG.initialLength;
          _this.menuFocusIndex = 0;
          _this.skinFocusIndex = 0;
          _this.selectedSkinIndex = 0;
          _this.deathFocusIndex = 0;
          _this.volumeEnabled = true;
          _this.unlockedSkins = SNAKE_COLORS.map(function (_value, index) {
            return index < 3;
          });
          _this.initialized = false;
          _this.disposed = false;
          _this.bodySampleCache = new Map();
          _this.getSnakeBodySampleForSystems = function (snake) {
            return _this.getSnakeBodySample(snake);
          };
          _this.resetSnakeForSystems = function (snake, head, direction, length) {
            _this.resetSnake(snake, head, direction, length);
          };
          _this.randomWorldPointForSystems = function (margin) {
            return _this.spawnSystem.randomWorldPoint(margin);
          };
          _this.isSpawnPointSafeForSystems = function (candidate, minDistanceFromPlayer) {
            return _this.collisionSystem.isSpawnPointSafe(candidate, _this.player, _this.snakes, minDistanceFromPlayer, _this.getSnakeBodySampleForSystems);
          };
          _this.findSpawnPointForSystems = function (minDistanceFromPlayer) {
            return _this.spawnSystem.findSpawnPoint(minDistanceFromPlayer, _this.isSpawnPointSafeForSystems);
          };
          _this.isBotSpawnPointSafeForSystems = function (candidate, minDistanceFromPlayer) {
            return _this.isSpawnPointSafeForSystems(candidate, minDistanceFromPlayer) && _this.isOutsidePlayerView(candidate);
          };
          _this.findBotSpawnPointForSystems = function (minDistanceFromPlayer) {
            return _this.spawnSystem.findSpawnPoint(minDistanceFromPlayer, _this.isBotSpawnPointSafeForSystems, _this.isSpawnPointSafeForSystems);
          };
          _this.getBotSpawnDirectionForSystems = function (spawn) {
            return normalize({
              x: _this.camera.x - spawn.x,
              y: _this.camera.y - spawn.y
            });
          };
          return _this;
        }
        var _proto = GameBootstrap.prototype;
        _proto.start = function start() {
          void this.bootstrap();
        };
        _proto.bootstrap = /*#__PURE__*/function () {
          var _bootstrap = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return loadGameConfig();
                case 2:
                  if (!this.disposed) {
                    _context.next = 4;
                    break;
                  }
                  return _context.abrupt("return");
                case 4:
                  this.savedLength = CONFIG.initialLength;
                  this.unlockedSkins = this.createDefaultUnlockedSkins();
                  this.player.color = SNAKE_COLORS[0];
                  this.loadPreferences();
                  this.createRuntimeNodes();
                  if (CONFIG.autoStartOnLaunch) {
                    this.startGame();
                  } else {
                    this.enterMenu();
                  }
                  this.initialized = true;
                  this.registerKeyboardInput();
                case 12:
                case "end":
                  return _context.stop();
              }
            }, _callee, this);
          }));
          function bootstrap() {
            return _bootstrap.apply(this, arguments);
          }
          return bootstrap;
        }();
        _proto.onDestroy = function onDestroy() {
          this.disposed = true;
          this.unregisterKeyboardInput();
        };
        _proto.update = function update(deltaTime) {
          if (!this.initialized) {
            return;
          }
          var dt = clamp(deltaTime, 0, 0.05);
          this.bodySampleCache.clear();
          this.layoutUi();
          if (this.state === GameState.Menu || this.state === GameState.SkinSelect) {
            this.render();
            return;
          }
          this.updateInvincibility(dt);
          this.updateMagnetEffects(dt);
          this.updateGhostKing(dt);
          if (this.state === GameState.Playing && !this.player.dead) {
            this.updatePlayer(dt);
          }
          this.updateBots(dt);
          this.maintainBotCount();
          this.updateFoodSystem(dt);
          if (this.state === GameState.Dead) {
            this.deathCountdown = Math.max(0, this.deathCountdown - dt);
          }
          this.updateCamera(dt);
          this.updateLabels();
          this.render();
        };
        _proto.createRuntimeNodes = function createRuntimeNodes() {
          var existing = this.node.getChildByName('RuntimeRoot');
          if (existing) {
            existing.destroy();
          }
          this.runtimeRoot = new Node('RuntimeRoot');
          this.runtimeRoot.layer = this.node.layer;
          this.node.addChild(this.runtimeRoot);
          this.worldRoot = new Node('WorldLayer');
          this.worldRoot.layer = this.node.layer;
          this.runtimeRoot.addChild(this.worldRoot);
          this.worldTransform = this.worldRoot.addComponent(UITransform);
          this.graphics = this.worldRoot.addComponent(Graphics);
          this.renderer = new GameRenderer(this.graphics);
          this.ui = new GameUI(this.runtimeRoot, this.node.layer, this.gameUiPrefab, this.startMenuPrefab, this.skinSelectPrefab, this.reviveDialogPrefab);
        };
        _proto.layoutUi = function layoutUi() {
          var size = view.getVisibleSize();
          this.ui.layout();
          if (this.state === GameState.Menu || this.state === GameState.SkinSelect) {
            this.attachWorldRoot(this.runtimeRoot);
            this.worldRoot.setSiblingIndex(0);
            this.worldTransform.setContentSize(size.width, size.height);
            this.worldRoot.setPosition(0, 0);
            return;
          }
          var gameContent = this.ui.getGameContentNode();
          if (gameContent) {
            this.attachWorldRoot(gameContent);
            this.worldRoot.setSiblingIndex(0);
            var viewport = this.ui.getGameViewportSize();
            this.worldTransform.setContentSize(viewport.width, viewport.height);
            this.worldRoot.setPosition(0, 0);
          } else {
            this.attachWorldRoot(this.runtimeRoot);
            this.worldTransform.setContentSize(size.width, size.height);
            this.worldRoot.setPosition(0, 0);
          }
        };
        _proto.attachWorldRoot = function attachWorldRoot(parent) {
          if (this.worldRoot.parent === parent) {
            return;
          }
          this.worldRoot.removeFromParent();
          parent.addChild(this.worldRoot);
        };
        _proto.getWorldViewportSize = function getWorldViewportSize() {
          var contentSize = this.worldTransform.contentSize;
          return {
            width: contentSize.width,
            height: contentSize.height
          };
        };
        _proto.enterMenu = function enterMenu() {
          this.state = GameState.Menu;
          this.foods.length = 0;
          this.snakes.length = 0;
          this.bodySampleCache.clear();
          this.camera = point();
          this.zoom = 1;
          this.ui.showMenu(this.selectedSkinIndex, this.menuFocusIndex, this.volumeEnabled);
        };
        _proto.enterSkinSelect = function enterSkinSelect() {
          this.state = GameState.SkinSelect;
          this.foods.length = 0;
          this.snakes.length = 0;
          this.bodySampleCache.clear();
          this.camera = point();
          this.zoom = 1;
          this.skinFocusIndex = this.selectedSkinIndex;
          this.ui.showSkinSelect(this.skinFocusIndex, this.selectedSkinIndex, this.unlockedSkins);
        };
        _proto.startGame = function startGame() {
          this.state = GameState.Playing;
          this.foods.length = 0;
          this.bodySampleCache.clear();
          this.snakes = [this.player];
          this.spawnSystem.reset();
          this.foodSystem.reset();
          this.ghostKingSystem.reset();
          this.player.color = SNAKE_COLORS[this.selectedSkinIndex];
          this.resetSnake(this.player, point(0, 0), point(1, 0), CONFIG.initialLength);
          this.player.score = 0;
          this.player.growthBank = 0;
          this.player.speed = CONFIG.baseSpeed;
          this.camera = copyPoint(this.player.head);
          this.ui.showPlaying();
          this.layoutUi();
          this.maintainBotCount();
          this.updateFoodSystem(0);
          this.updateLabels();
        };
        _proto.revivePlayer = function revivePlayer() {
          var spawn = this.findSpawnPointForSystems(900);
          var dir = this.spawnSystem.randomDirection();
          this.resetSnake(this.player, spawn, dir, this.savedLength);
          this.player.score = this.savedScore;
          this.player.growthBank = 0;
          this.player.speed = CONFIG.baseSpeed;
          this.state = GameState.Playing;
          this.ui.showPlaying();
          this.layoutUi();
        };
        _proto.onKeyDown = function onKeyDown(event) {
          var action = this.actionFromKeyCode(event.keyCode);
          if (action) {
            this.dispatchKeyAction(action);
          }
        };
        _proto.dispatchKeyAction = function dispatchKeyAction(action) {
          if (!this.initialized) {
            return;
          }
          this.handleKeyAction(action);
        };
        _proto.handleKeyAction = function handleKeyAction(action) {
          if (this.state === GameState.Menu) {
            if (action === 'up') {
              this.moveMenuFocus(-1);
            } else if (action === 'down') {
              this.moveMenuFocus(1);
            } else if (action === 'confirm') {
              this.activateMenuItem();
            }
            return;
          }
          if (this.state === GameState.SkinSelect) {
            var skinVerticalStep = this.ui.getSkinSelectNavigationStep();
            if (action === 'left') {
              this.moveSkinFocus(-1);
            } else if (action === 'right') {
              this.moveSkinFocus(1);
            } else if (action === 'up') {
              this.moveSkinFocus(-skinVerticalStep);
            } else if (action === 'down') {
              this.moveSkinFocus(skinVerticalStep);
            } else if (action === 'confirm') {
              this.activateFocusedSkin();
            } else if (action === 'escape') {
              this.enterMenu();
            }
            return;
          }
          if (this.state === GameState.Dead) {
            if (action === 'left' || action === 'right' || action === 'up' || action === 'down') {
              this.deathFocusIndex = this.deathFocusIndex === 0 ? 1 : 0;
              this.ui.showDead(this.deathFocusIndex, this.deathCountdown);
            } else if (action === 'confirm') {
              if (this.deathFocusIndex === 0 && this.deathCountdown > 0) {
                this.revivePlayer();
              } else {
                this.enterMenu();
              }
            } else if (action === 'escape') {
              this.enterMenu();
            }
            return;
          }
          if (action === 'escape') {
            this.enterMenu();
            return;
          }
          if (action === 'up') {
            this.setPlayerDirection(point(0, 1));
          } else if (action === 'down') {
            this.setPlayerDirection(point(0, -1));
          } else if (action === 'left') {
            this.setPlayerDirection(point(-1, 0));
          } else if (action === 'right') {
            this.setPlayerDirection(point(1, 0));
          }
        };
        _proto.registerKeyboardInput = function registerKeyboardInput() {
          input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        };
        _proto.unregisterKeyboardInput = function unregisterKeyboardInput() {
          input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        };
        _proto.actionFromKeyCode = function actionFromKeyCode(code) {
          if (code === KeyCode.ARROW_UP || code === KeyCode.KEY_W) {
            return 'up';
          }
          if (code === KeyCode.ARROW_DOWN || code === KeyCode.KEY_S) {
            return 'down';
          }
          if (code === KeyCode.ARROW_LEFT || code === KeyCode.KEY_A) {
            return 'left';
          }
          if (code === KeyCode.ARROW_RIGHT || code === KeyCode.KEY_D) {
            return 'right';
          }
          if (code === KeyCode.ENTER || code === KeyCode.SPACE || code === KeyCode.NUM_ENTER) {
            return 'confirm';
          }
          if (code === KeyCode.ESCAPE) {
            return 'escape';
          }
          return null;
        };
        _proto.moveMenuFocus = function moveMenuFocus(delta) {
          this.menuFocusIndex = (this.menuFocusIndex + delta + 3) % 3;
          this.ui.showMenu(this.selectedSkinIndex, this.menuFocusIndex, this.volumeEnabled);
        };
        _proto.activateMenuItem = function activateMenuItem() {
          if (this.menuFocusIndex === 0) {
            this.startGame();
          } else if (this.menuFocusIndex === 1) {
            this.enterSkinSelect();
          } else {
            this.volumeEnabled = !this.volumeEnabled;
            this.savePreferences();
            this.ui.showMenu(this.selectedSkinIndex, this.menuFocusIndex, this.volumeEnabled);
          }
        };
        _proto.moveSkinFocus = function moveSkinFocus(delta) {
          var length = SNAKE_COLORS.length;
          this.skinFocusIndex = (this.skinFocusIndex + delta + length * 2) % length;
          this.ui.showSkinSelect(this.skinFocusIndex, this.selectedSkinIndex, this.unlockedSkins);
        };
        _proto.activateFocusedSkin = function activateFocusedSkin() {
          if (!this.unlockedSkins[this.skinFocusIndex]) {
            this.unlockedSkins[this.skinFocusIndex] = true;
          }
          this.selectedSkinIndex = this.skinFocusIndex;
          this.savePreferences();
          this.ui.showSkinSelect(this.skinFocusIndex, this.selectedSkinIndex, this.unlockedSkins);
        };
        _proto.setPlayerDirection = function setPlayerDirection(dir) {
          if (dot(dir, this.player.direction) > -0.72) {
            this.player.targetDirection = normalize(dir);
          }
        };
        _proto.resetSnake = function resetSnake(snake, head, direction, length) {
          this.snakeMovement.resetSnake(snake, head, direction, length);
          snake.invincibleTime = CONFIG.invincibleSeconds;
          snake.magnetTime = 0;
          this.bodySampleCache["delete"](snake);
        };
        _proto.updateInvincibility = function updateInvincibility(dt) {
          for (var _iterator = _createForOfIteratorHelperLoose(this.snakes), _step; !(_step = _iterator()).done;) {
            var snake = _step.value;
            if (!snake.dead && snake.invincibleTime > 0) {
              snake.invincibleTime = Math.max(0, snake.invincibleTime - dt);
            }
          }
        };
        _proto.updateMagnetEffects = function updateMagnetEffects(dt) {
          for (var _iterator2 = _createForOfIteratorHelperLoose(this.snakes), _step2; !(_step2 = _iterator2()).done;) {
            var snake = _step2.value;
            if (!snake.dead && snake.magnetTime > 0) {
              snake.magnetTime = Math.max(0, snake.magnetTime - dt);
            }
          }
        };
        _proto.updatePlayer = function updatePlayer(dt) {
          this.steerSnake(this.player, dt, 9);
          this.moveSnake(this.player, dt);
          this.absorbFood(this.player, dt);
          this.checkCollision(this.player);
          this.checkGhostKingCollision(this.player);
        };
        _proto.updateBots = function updateBots(dt) {
          for (var _iterator3 = _createForOfIteratorHelperLoose(this.snakes), _step3; !(_step3 = _iterator3()).done;) {
            var snake = _step3.value;
            if (snake.isPlayer) {
              continue;
            }
            if (snake.dead) {
              snake.respawnIn -= dt;
              if (snake.respawnIn <= 0) {
                this.spawnSystem.respawnBot(snake, this.findBotSpawnPointForSystems, this.resetSnakeForSystems, this.getBotSpawnDirectionForSystems);
              }
              continue;
            }
            this.updateBotDecision(snake, dt);
            this.steerSnake(snake, dt, CONFIG.aiBotTurnRate);
            this.moveSnake(snake, dt);
            this.absorbFood(snake, dt);
            this.checkCollision(snake);
            this.checkGhostKingCollision(snake);
          }
        };
        _proto.steerSnake = function steerSnake(snake, dt, turnRate) {
          this.snakeMovement.steerSnake(snake, dt, turnRate);
        };
        _proto.moveSnake = function moveSnake(snake, dt) {
          this.snakeMovement.moveSnake(snake, dt);
          this.bodySampleCache["delete"](snake);
        };
        _proto.getSnakeBodySample = function getSnakeBodySample(snake) {
          var body = this.bodySampleCache.get(snake);
          if (!body) {
            body = this.snakeMovement.sampleSnakeBody(snake);
            this.bodySampleCache.set(snake, body);
          }
          return body;
        };
        _proto.updateBotDecision = function updateBotDecision(snake, dt) {
          this.botAI.updateDecision(snake, dt, {
            foods: this.foods,
            snakes: this.snakes,
            getSnakeBodySample: this.getSnakeBodySampleForSystems
          });
        };
        _proto.absorbFood = function absorbFood(snake, dt) {
          if (this.foodSystem.absorbFood(this.foods, snake, dt)) {
            this.bodySampleCache["delete"](snake);
          }
        };
        _proto.checkCollision = function checkCollision(snake) {
          if (this.collisionSystem.hasCollision(snake, this.snakes, this.getSnakeBodySampleForSystems)) {
            this.killSnake(snake);
          }
        };
        _proto.checkGhostKingCollision = function checkGhostKingCollision(snake) {
          if (snake.dead || snake.invincibleTime > 0) {
            return;
          }
          if (this.ghostKingSystem.hasHeadCollision(snake.head, snake.radius)) {
            this.killSnake(snake);
          }
        };
        _proto.killSnake = function killSnake(snake) {
          if (snake.dead) {
            return;
          }
          this.foodSystem.dropMeat(this.foods, snake, this.getSnakeBodySample(snake));
          snake.dead = true;
          snake.invincibleTime = 0;
          snake.magnetTime = 0;
          if (snake.isPlayer) {
            this.savedScore = snake.score;
            this.savedLength = snake.targetLength;
            this.deathCountdown = CONFIG.deathReviveSeconds;
            this.deathFocusIndex = 0;
            this.state = GameState.Dead;
            this.ui.showDead(this.deathFocusIndex, this.deathCountdown);
          } else {
            snake.respawnIn = CONFIG.botRespawnSeconds;
          }
          this.bodySampleCache["delete"](snake);
        };
        _proto.updateFoodSystem = function updateFoodSystem(dt) {
          var size = this.getWorldViewportSize();
          var zoom = Math.max(0.001, this.zoom);
          this.foodSystem.update(this.foods, dt, this.randomWorldPointForSystems, this.camera, size.width * 0.5 / zoom + CONFIG.foodPruneViewportPadding, size.height * 0.5 / zoom + CONFIG.foodPruneViewportPadding);
        };
        _proto.updateGhostKing = function updateGhostKing(dt) {
          this.ghostKingSystem.update(dt, this.player.head, this.state === GameState.Playing && !this.player.dead);
        };
        _proto.maintainBotCount = function maintainBotCount() {
          this.spawnSystem.maintainBotCount(this.snakes, this.findBotSpawnPointForSystems, this.resetSnakeForSystems, this.getBotSpawnDirectionForSystems);
        };
        _proto.isOutsidePlayerView = function isOutsidePlayerView(candidate) {
          var size = this.getWorldViewportSize();
          var zoom = Math.max(0.001, this.zoom);
          var halfWidth = size.width * 0.5 / zoom + CONFIG.spawnViewportPadding;
          var halfHeight = size.height * 0.5 / zoom + CONFIG.spawnViewportPadding;
          return Math.abs(candidate.x - this.camera.x) > halfWidth || Math.abs(candidate.y - this.camera.y) > halfHeight;
        };
        _proto.updateCamera = function updateCamera(dt) {
          if (this.state === GameState.Menu || this.player.dead) {
            return;
          }
          var head = this.player.head;
          var follow = clamp(dt * 7, 0, 1);
          this.camera.x += (head.x - this.camera.x) * follow;
          this.camera.y += (head.y - this.camera.y) * follow;
          var radiusScale = Math.max(1, this.player.radius / CONFIG.baseRadius);
          var radiusWeight = Math.max(0.01, CONFIG.cameraZoomRadiusWeight);
          var targetZoom = clamp(CONFIG.cameraZoomMax / (radiusScale * radiusWeight) - this.player.targetLength * CONFIG.cameraZoomLengthWeight, CONFIG.cameraZoomMin, CONFIG.cameraZoomMax);
          this.zoom += (targetZoom - this.zoom) * clamp(dt * 2.2, 0, 1);
        };
        _proto.updateLabels = function updateLabels() {
          this.ui.updateLabels(this.state, this.player, this.snakes, this.savedScore, this.savedLength, this.deathCountdown, this.deathFocusIndex, this.ghostKingSystem.getState());
        };
        _proto.render = function render() {
          var _this2 = this;
          var size = this.getWorldViewportSize();
          this.renderer.render({
            width: size.width,
            height: size.height,
            state: this.state,
            camera: this.camera,
            zoom: this.zoom,
            foods: this.foods,
            snakes: this.snakes,
            ghostKing: this.ghostKingSystem.getState(),
            getSnakeBodySample: function getSnakeBodySample(snake) {
              return _this2.getSnakeBodySample(snake);
            }
          });
        };
        _proto.loadPreferences = function loadPreferences() {
          try {
            var raw = sys.localStorage.getItem(PREFERENCES_KEY);
            if (!raw) {
              return;
            }
            var data = JSON.parse(raw);
            if (typeof data.volumeEnabled === 'boolean') {
              this.volumeEnabled = data.volumeEnabled;
            }
            if (Array.isArray(data.unlockedSkins)) {
              this.unlockedSkins = SNAKE_COLORS.map(function (_value, index) {
                var _data$unlockedSkins;
                return index < 3 || ((_data$unlockedSkins = data.unlockedSkins) == null ? void 0 : _data$unlockedSkins[index]) === true;
              });
            }
            if (typeof data.selectedSkinIndex === 'number' && data.selectedSkinIndex >= 0 && data.selectedSkinIndex < SNAKE_COLORS.length) {
              this.selectedSkinIndex = data.selectedSkinIndex;
            }
            this.unlockedSkins[this.selectedSkinIndex] = true;
          } catch (_error) {
            this.unlockedSkins = this.createDefaultUnlockedSkins();
            this.selectedSkinIndex = 0;
            this.volumeEnabled = true;
          }
        };
        _proto.savePreferences = function savePreferences() {
          try {
            sys.localStorage.setItem(PREFERENCES_KEY, JSON.stringify({
              selectedSkinIndex: this.selectedSkinIndex,
              volumeEnabled: this.volumeEnabled,
              unlockedSkins: this.unlockedSkins
            }));
          } catch (_error) {
            // Local storage can be unavailable on some embedded TV preview targets.
          }
        };
        _proto.createDefaultUnlockedSkins = function createDefaultUnlockedSkins() {
          return SNAKE_COLORS.map(function (_value, index) {
            return index < 3;
          });
        };
        return GameBootstrap;
      }(Component), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "gameUiPrefab", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "startMenuPrefab", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "skinSelectPrefab", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "reviveDialogPrefab", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/GameConfig.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _extends, _createForOfIteratorHelperLoose, cclegacy, Color, resources, JsonAsset;
  return {
    setters: [function (module) {
      _extends = module.extends;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      Color = module.Color;
      resources = module.resources;
      JsonAsset = module.JsonAsset;
    }],
    execute: function () {
      exports({
        color: color,
        getGrowthCost: getGrowthCost,
        getMeatScore: getMeatScore,
        getSnakeRadius: getSnakeRadius,
        loadGameConfig: loadGameConfig,
        pickBotLength: pickBotLength
      });
      cclegacy._RF.push({}, "5a5accIWpNC3bEgxC8i6Zcf", "GameConfig", undefined);
      var CONFIG_RESOURCE_PATH = 'config/game_config';
      var DEFAULT_CONFIG = {
        autoStartOnLaunch: false,
        worldWidth: 1920 * 3,
        worldHeight: 1080 * 3,
        baseSpeed: 220,
        botSpeedMin: 135,
        botSpeedMax: 185,
        baseRadius: 13,
        maxLength: 300,
        initialLength: 5,
        playerAbsorbRange: 82,
        botAbsorbRange: 34,
        botTargetCount: 18,
        botRespawnSeconds: 10,
        invincibleSeconds: 3,
        deathReviveSeconds: 5,
        normalFoodTarget: 300,
        bigFoodTarget: 90,
        maxFoodCount: 560,
        maxMeatFoodCount: 300,
        maxMeatDropsPerSnake: 110,
        magnetSpawnInterval: 30,
        magnetTargetCount: 5,
        magnetDurationSeconds: 15,
        magnetAbsorbMultiplier: 2,
        magnetDriftSpeedMin: 18,
        magnetDriftSpeedMax: 42,
        ghostKingSpawnDelayMin: 30,
        ghostKingSpawnDelayMax: 60,
        ghostKingDurationSeconds: 30,
        ghostKingSpeed: 150,
        ghostKingRadius: 68,
        ghostKingHitRadius: 58,
        ghostKingSpawnDistanceMin: 520,
        ghostKingSpawnDistanceMax: 920,
        aiDetectRange: 760,
        aiAvoidDangerChance: 0.98,
        aiBotTurnRate: 6.4,
        spawnBodyClearance: 170,
        spawnViewportPadding: 420,
        spawnOffscreenAttempts: 120,
        foodPruneViewportPadding: 260,
        cameraZoomMin: 0.24,
        cameraZoomMax: 1.02,
        cameraZoomRadiusWeight: 1,
        cameraZoomLengthWeight: 0.0006,
        gridSize: 240
      };
      var DEFAULT_SNAKE_COLOR_VALUES = [{
        r: 68,
        g: 229,
        b: 135
      }, {
        r: 74,
        g: 161,
        b: 255
      }, {
        r: 255,
        g: 203,
        b: 76
      }, {
        r: 255,
        g: 111,
        b: 145
      }, {
        r: 130,
        g: 222,
        b: 255
      }, {
        r: 180,
        g: 146,
        b: 255
      }, {
        r: 255,
        g: 154,
        b: 84
      }, {
        r: 104,
        g: 212,
        b: 190
      }];
      var DEFAULT_FOOD_COLOR_VALUES = [{
        r: 255,
        g: 106,
        b: 106
      }, {
        r: 97,
        g: 214,
        b: 128
      }, {
        r: 93,
        g: 177,
        b: 255
      }, {
        r: 255,
        g: 221,
        b: 91
      }, {
        r: 233,
        g: 119,
        b: 255
      }];
      var DEFAULT_GROWTH_RULES = [{
        minLength: 0,
        cost: 10,
        radiusScale: 1
      }, {
        minLength: 60,
        cost: 50,
        radiusScale: 1.1
      }, {
        minLength: 100,
        cost: 100,
        radiusScale: 1.2
      }];
      var DEFAULT_MEAT_DROP_RULES = [{
        minLength: 0,
        score: 1
      }, {
        minLength: 51,
        score: 2
      }, {
        minLength: 101,
        score: 10
      }];
      var DEFAULT_BOT_LENGTH_WEIGHTS = [{
        minLength: 18,
        maxLength: 50,
        weight: 5000
      }, {
        minLength: 50,
        maxLength: 100,
        weight: 3000
      }, {
        minLength: 100,
        maxLength: 200,
        weight: 2000
      }];
      var CONFIG = exports('CONFIG', _extends({}, DEFAULT_CONFIG));
      var SNAKE_COLORS = exports('SNAKE_COLORS', []);
      var FOOD_COLORS = exports('FOOD_COLORS', []);
      var GROWTH_RULES = exports('GROWTH_RULES', []);
      var MEAT_DROP_RULES = exports('MEAT_DROP_RULES', []);
      var BOT_LENGTH_WEIGHTS = exports('BOT_LENGTH_WEIGHTS', []);
      function color(r, g, b, a) {
        if (a === void 0) {
          a = 255;
        }
        return new Color(r, g, b, a);
      }
      function loadGameConfig() {
        return new Promise(function (resolve) {
          resetToDefaults();
          resources.load(CONFIG_RESOURCE_PATH, JsonAsset, function (error, asset) {
            if (!error && asset != null && asset.json) {
              applyGameConfig(asset.json);
            }
            resolve();
          });
        });
      }
      function getGrowthCost(length) {
        return getRuleForLength(GROWTH_RULES, length).cost;
      }
      function getSnakeRadius(length) {
        return CONFIG.baseRadius * getRuleForLength(GROWTH_RULES, length).radiusScale;
      }
      function getMeatScore(length) {
        return getRuleForLength(MEAT_DROP_RULES, length).score;
      }
      function pickBotLength() {
        var validRules = BOT_LENGTH_WEIGHTS.filter(function (rule) {
          return rule.weight > 0 && rule.maxLength >= rule.minLength;
        });
        var rules = validRules.length ? validRules : DEFAULT_BOT_LENGTH_WEIGHTS;
        var totalWeight = rules.reduce(function (total, rule) {
          return total + rule.weight;
        }, 0);
        var roll = Math.random() * totalWeight;
        for (var _iterator = _createForOfIteratorHelperLoose(rules), _step; !(_step = _iterator()).done;) {
          var _rule = _step.value;
          roll -= _rule.weight;
          if (roll <= 0) {
            return randomIntInclusive(_rule.minLength, _rule.maxLength);
          }
        }
        var fallback = rules[rules.length - 1];
        return randomIntInclusive(fallback.minLength, fallback.maxLength);
      }
      function resetToDefaults() {
        Object.assign(CONFIG, DEFAULT_CONFIG);
        replaceColors(SNAKE_COLORS, DEFAULT_SNAKE_COLOR_VALUES);
        replaceColors(FOOD_COLORS, DEFAULT_FOOD_COLOR_VALUES);
        replaceRules(GROWTH_RULES, DEFAULT_GROWTH_RULES, normalizeGrowthRule);
        replaceRules(MEAT_DROP_RULES, DEFAULT_MEAT_DROP_RULES, normalizeMeatDropRule);
        replaceRules(BOT_LENGTH_WEIGHTS, DEFAULT_BOT_LENGTH_WEIGHTS, normalizeBotLengthWeight);
      }
      function applyGameConfig(data) {
        var _data$runtime, _data$world, _data$snake, _data$bot, _data$food, _data$magnet, _data$ghostKing, _data$ai, _data$spawn, _data$camera, _data$snakeColors, _data$foodColors, _data$growthRules, _data$meatDropRules, _data$botLengthWeight;
        var runtime = (_data$runtime = data.runtime) != null ? _data$runtime : {};
        var world = (_data$world = data.world) != null ? _data$world : {};
        var snake = (_data$snake = data.snake) != null ? _data$snake : {};
        var bot = (_data$bot = data.bot) != null ? _data$bot : {};
        var food = (_data$food = data.food) != null ? _data$food : {};
        var magnet = (_data$magnet = data.magnet) != null ? _data$magnet : {};
        var ghostKing = (_data$ghostKing = data.ghostKing) != null ? _data$ghostKing : {};
        var ai = (_data$ai = data.ai) != null ? _data$ai : {};
        var spawn = (_data$spawn = data.spawn) != null ? _data$spawn : {};
        var camera = (_data$camera = data.camera) != null ? _data$camera : {};
        CONFIG.autoStartOnLaunch = readBoolean(runtime.autoStartOnLaunch, CONFIG.autoStartOnLaunch);
        CONFIG.worldWidth = readNumber(world.width, CONFIG.worldWidth);
        CONFIG.worldHeight = readNumber(world.height, CONFIG.worldHeight);
        CONFIG.gridSize = readNumber(world.gridSize, CONFIG.gridSize);
        CONFIG.baseSpeed = readNumber(snake.baseSpeed, CONFIG.baseSpeed);
        CONFIG.baseRadius = readNumber(snake.baseRadius, CONFIG.baseRadius);
        CONFIG.initialLength = readNumber(snake.initialLength, CONFIG.initialLength);
        CONFIG.maxLength = readNumber(snake.maxLength, CONFIG.maxLength);
        CONFIG.playerAbsorbRange = readNumber(snake.playerAbsorbRange, CONFIG.playerAbsorbRange);
        CONFIG.botAbsorbRange = readNumber(snake.botAbsorbRange, CONFIG.botAbsorbRange);
        CONFIG.invincibleSeconds = readNumber(snake.invincibleSeconds, CONFIG.invincibleSeconds);
        CONFIG.deathReviveSeconds = readNumber(snake.deathReviveSeconds, CONFIG.deathReviveSeconds);
        CONFIG.botTargetCount = readNumber(bot.targetCount, CONFIG.botTargetCount);
        CONFIG.botSpeedMin = readNumber(bot.speedMin, CONFIG.botSpeedMin);
        CONFIG.botSpeedMax = readNumber(bot.speedMax, CONFIG.botSpeedMax);
        CONFIG.botRespawnSeconds = readNumber(bot.respawnSeconds, CONFIG.botRespawnSeconds);
        CONFIG.normalFoodTarget = readNumber(food.normalTarget, CONFIG.normalFoodTarget);
        CONFIG.bigFoodTarget = readNumber(food.bigTarget, CONFIG.bigFoodTarget);
        CONFIG.maxFoodCount = readNumber(food.maxCount, CONFIG.maxFoodCount);
        CONFIG.maxMeatFoodCount = readNumber(food.maxMeatCount, CONFIG.maxMeatFoodCount);
        CONFIG.maxMeatDropsPerSnake = readNumber(food.maxMeatDropsPerSnake, CONFIG.maxMeatDropsPerSnake);
        CONFIG.magnetSpawnInterval = readNumber(magnet.spawnInterval, CONFIG.magnetSpawnInterval);
        CONFIG.magnetTargetCount = readNumber(magnet.targetCount, CONFIG.magnetTargetCount);
        CONFIG.magnetDurationSeconds = readNumber(magnet.durationSeconds, CONFIG.magnetDurationSeconds);
        CONFIG.magnetAbsorbMultiplier = readNumber(magnet.absorbMultiplier, CONFIG.magnetAbsorbMultiplier);
        CONFIG.magnetDriftSpeedMin = readNumber(magnet.driftSpeedMin, CONFIG.magnetDriftSpeedMin);
        CONFIG.magnetDriftSpeedMax = readNumber(magnet.driftSpeedMax, CONFIG.magnetDriftSpeedMax);
        CONFIG.ghostKingSpawnDelayMin = readNumber(ghostKing.spawnDelayMin, CONFIG.ghostKingSpawnDelayMin);
        CONFIG.ghostKingSpawnDelayMax = readNumber(ghostKing.spawnDelayMax, CONFIG.ghostKingSpawnDelayMax);
        CONFIG.ghostKingDurationSeconds = readNumber(ghostKing.durationSeconds, CONFIG.ghostKingDurationSeconds);
        CONFIG.ghostKingSpeed = readNumber(ghostKing.speed, CONFIG.ghostKingSpeed);
        CONFIG.ghostKingRadius = readNumber(ghostKing.radius, CONFIG.ghostKingRadius);
        CONFIG.ghostKingHitRadius = readNumber(ghostKing.hitRadius, CONFIG.ghostKingHitRadius);
        CONFIG.ghostKingSpawnDistanceMin = readNumber(ghostKing.spawnDistanceMin, CONFIG.ghostKingSpawnDistanceMin);
        CONFIG.ghostKingSpawnDistanceMax = readNumber(ghostKing.spawnDistanceMax, CONFIG.ghostKingSpawnDistanceMax);
        CONFIG.aiDetectRange = readNumber(ai.detectRange, CONFIG.aiDetectRange);
        CONFIG.aiAvoidDangerChance = clamp01(readNumber(ai.avoidDangerChance, CONFIG.aiAvoidDangerChance));
        CONFIG.aiBotTurnRate = readNumber(ai.botTurnRate, CONFIG.aiBotTurnRate);
        CONFIG.spawnBodyClearance = readNumber(spawn.bodyClearance, CONFIG.spawnBodyClearance);
        CONFIG.spawnViewportPadding = readNumber(spawn.viewportPadding, CONFIG.spawnViewportPadding);
        CONFIG.spawnOffscreenAttempts = readNumber(spawn.offscreenSpawnAttempts, CONFIG.spawnOffscreenAttempts);
        CONFIG.foodPruneViewportPadding = readNumber(spawn.foodPruneViewportPadding, CONFIG.foodPruneViewportPadding);
        CONFIG.cameraZoomMin = readNumber(camera.zoomMin, CONFIG.cameraZoomMin);
        CONFIG.cameraZoomMax = readNumber(camera.zoomMax, CONFIG.cameraZoomMax);
        CONFIG.cameraZoomRadiusWeight = readNumber(camera.zoomRadiusWeight, CONFIG.cameraZoomRadiusWeight);
        CONFIG.cameraZoomLengthWeight = readNumber(camera.zoomLengthWeight, CONFIG.cameraZoomLengthWeight);
        if ((_data$snakeColors = data.snakeColors) != null && _data$snakeColors.length) {
          replaceColors(SNAKE_COLORS, data.snakeColors);
        }
        if ((_data$foodColors = data.foodColors) != null && _data$foodColors.length) {
          replaceColors(FOOD_COLORS, data.foodColors);
        }
        if ((_data$growthRules = data.growthRules) != null && _data$growthRules.length) {
          replaceRules(GROWTH_RULES, data.growthRules, normalizeGrowthRule);
        }
        if ((_data$meatDropRules = data.meatDropRules) != null && _data$meatDropRules.length) {
          replaceRules(MEAT_DROP_RULES, data.meatDropRules, normalizeMeatDropRule);
        }
        if ((_data$botLengthWeight = data.botLengthWeights) != null && _data$botLengthWeight.length) {
          replaceRules(BOT_LENGTH_WEIGHTS, data.botLengthWeights, normalizeBotLengthWeight);
        }
      }
      function replaceColors(target, source) {
        target.length = 0;
        for (var _iterator2 = _createForOfIteratorHelperLoose(source), _step2; !(_step2 = _iterator2()).done;) {
          var entry = _step2.value;
          target.push(color(readNumber(entry.r, 255), readNumber(entry.g, 255), readNumber(entry.b, 255), readNumber(entry.a, 255)));
        }
      }
      function replaceRules(target, source, normalize) {
        var normalized = source.map(function (rule) {
          return normalize(rule);
        }).filter(function (rule) {
          return rule !== null;
        }).sort(function (a, b) {
          return a.minLength - b.minLength;
        });
        if (!normalized.length) {
          return;
        }
        target.length = 0;
        target.push.apply(target, normalized);
      }
      function normalizeGrowthRule(rule) {
        var minLength = readNumber(rule.minLength, Number.NaN);
        var cost = readNumber(rule.cost, Number.NaN);
        var radiusScale = readNumber(rule.radiusScale, Number.NaN);
        if (!Number.isFinite(minLength) || !Number.isFinite(cost) || !Number.isFinite(radiusScale)) {
          return null;
        }
        return {
          minLength: minLength,
          cost: cost,
          radiusScale: radiusScale
        };
      }
      function normalizeMeatDropRule(rule) {
        var minLength = readNumber(rule.minLength, Number.NaN);
        var score = readNumber(rule.score, Number.NaN);
        if (!Number.isFinite(minLength) || !Number.isFinite(score)) {
          return null;
        }
        return {
          minLength: minLength,
          score: score
        };
      }
      function normalizeBotLengthWeight(rule) {
        var minLength = readNumber(rule.minLength, Number.NaN);
        var maxLength = readNumber(rule.maxLength, Number.NaN);
        var weight = readNumber(rule.weight, Number.NaN);
        if (!Number.isFinite(minLength) || !Number.isFinite(maxLength) || !Number.isFinite(weight)) {
          return null;
        }
        return {
          minLength: minLength,
          maxLength: maxLength,
          weight: weight
        };
      }
      function getRuleForLength(rules, length) {
        var selected = rules[0];
        for (var _iterator3 = _createForOfIteratorHelperLoose(rules), _step3; !(_step3 = _iterator3()).done;) {
          var _rule2 = _step3.value;
          if (length < _rule2.minLength) {
            break;
          }
          selected = _rule2;
        }
        return selected;
      }
      function readNumber(value, fallback) {
        return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
      }
      function readBoolean(value, fallback) {
        return typeof value === 'boolean' ? value : fallback;
      }
      function clamp01(value) {
        return Math.max(0, Math.min(1, value));
      }
      function randomIntInclusive(min, max) {
        return Math.floor(min + Math.random() * (max - min + 1));
      }
      resetToDefaults();
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/GameMath.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports({
        angleOf: angleOf,
        clamp: clamp,
        copyPoint: copyPoint,
        directionFromAngle: directionFromAngle,
        distance: distance,
        distanceSq: distanceSq,
        dot: dot,
        lerpPoint: lerpPoint,
        normalize: normalize,
        point: point,
        randomInt: randomInt,
        randomRange: randomRange,
        rotateTowards: rotateTowards
      });
      cclegacy._RF.push({}, "3f3cbCagfdMGpGMVekfzbZU", "GameMath", undefined);
      function point(x, y) {
        if (x === void 0) {
          x = 0;
        }
        if (y === void 0) {
          y = 0;
        }
        return {
          x: x,
          y: y
        };
      }
      function copyPoint(value) {
        return {
          x: value.x,
          y: value.y
        };
      }
      function lerpPoint(a, b, t) {
        return {
          x: a.x + (b.x - a.x) * t,
          y: a.y + (b.y - a.y) * t
        };
      }
      function distance(a, b) {
        return Math.hypot(a.x - b.x, a.y - b.y);
      }
      function distanceSq(a, b) {
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        return dx * dx + dy * dy;
      }
      function normalize(value) {
        var len = Math.hypot(value.x, value.y);
        if (len <= 0.0001) {
          return {
            x: 1,
            y: 0
          };
        }
        return {
          x: value.x / len,
          y: value.y / len
        };
      }
      function dot(a, b) {
        return a.x * b.x + a.y * b.y;
      }
      function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
      }
      function randomRange(min, max) {
        return min + Math.random() * (max - min);
      }
      function randomInt(min, max) {
        return Math.floor(randomRange(min, max + 1));
      }
      function directionFromAngle(angle) {
        return {
          x: Math.cos(angle),
          y: Math.sin(angle)
        };
      }
      function angleOf(value) {
        return Math.atan2(value.y, value.x);
      }
      function angleDelta(from, to) {
        var delta = to - from;
        while (delta > Math.PI) {
          delta -= Math.PI * 2;
        }
        while (delta < -Math.PI) {
          delta += Math.PI * 2;
        }
        return delta;
      }
      function rotateTowards(current, target, maxRadians) {
        var from = angleOf(current);
        var to = angleOf(target);
        var next = from + clamp(angleDelta(from, to), -maxRadians, maxRadians);
        return directionFromAngle(next);
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/GameRenderer.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './GameConfig.ts', './GameMath.ts', './GameTypes.ts'], function (exports) {
  var _createForOfIteratorHelperLoose, cclegacy, color, CONFIG, clamp, GameState, FoodKind;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      color = module.color;
      CONFIG = module.CONFIG;
    }, function (module) {
      clamp = module.clamp;
    }, function (module) {
      GameState = module.GameState;
      FoodKind = module.FoodKind;
    }],
    execute: function () {
      cclegacy._RF.push({}, "08773VR2GhDBqVjZ6oKiLRj", "GameRenderer", undefined);
      var GameRenderer = exports('GameRenderer', /*#__PURE__*/function () {
        function GameRenderer(graphics) {
          this.graphics = graphics;
        }
        var _proto = GameRenderer.prototype;
        _proto.render = function render(context) {
          var g = this.graphics;
          g.clear();
          g.fillColor = context.state === GameState.Playing || context.state === GameState.Dead ? color(37, 61, 52) : color(11, 21, 24);
          g.fillRect(-context.width * 0.5, -context.height * 0.5, context.width, context.height);
          if (context.state === GameState.Menu || context.state === GameState.SkinSelect) {
            this.drawMenuPattern(context.width, context.height);
            return;
          }
          this.drawWorldBounds(context);
          this.drawFoods(context);
          this.drawGhostKing(context);
          this.drawSnakes(context);
        };
        _proto.drawMenuPattern = function drawMenuPattern(width, height) {
          var g = this.graphics;
          g.strokeColor = color(32, 82, 73, 120);
          g.lineWidth = 2;
          for (var y = -height * 0.5; y <= height * 0.5; y += 48) {
            g.moveTo(-width * 0.5, y);
            g.lineTo(width * 0.5, y + 28);
          }
          g.stroke();
          g.fillColor = color(55, 220, 133, 180);
          for (var i = 0; i < 9; i++) {
            var x = -260 + i * 65;
            var _y = -170 + Math.sin(i * 0.8) * 22;
            g.circle(x, _y, 18 + Math.sin(i) * 2);
            g.fill();
          }
          g.fillColor = color(244, 255, 252);
          g.circle(275, -158, 5);
          g.fill();
        };
        _proto.drawGrid = function drawGrid(context) {
          var g = this.graphics;
          var halfW = context.width * 0.5;
          var halfH = context.height * 0.5;
          var left = context.camera.x - halfW / context.zoom;
          var right = context.camera.x + halfW / context.zoom;
          var bottom = context.camera.y - halfH / context.zoom;
          var top = context.camera.y + halfH / context.zoom;
          g.strokeColor = color(26, 60, 66, 110);
          g.lineWidth = 1;
          var startX = Math.floor(left / CONFIG.gridSize) * CONFIG.gridSize;
          for (var x = startX; x <= right; x += CONFIG.gridSize) {
            var sx = (x - context.camera.x) * context.zoom;
            g.moveTo(sx, -halfH);
            g.lineTo(sx, halfH);
          }
          var startY = Math.floor(bottom / CONFIG.gridSize) * CONFIG.gridSize;
          for (var y = startY; y <= top; y += CONFIG.gridSize) {
            var sy = (y - context.camera.y) * context.zoom;
            g.moveTo(-halfW, sy);
            g.lineTo(halfW, sy);
          }
          g.stroke();
        };
        _proto.drawWorldBounds = function drawWorldBounds(context) {
          var g = this.graphics;
          var left = (-CONFIG.worldWidth * 0.5 - context.camera.x) * context.zoom;
          var bottom = (-CONFIG.worldHeight * 0.5 - context.camera.y) * context.zoom;
          g.strokeColor = color(230, 92, 84, 210);
          g.lineWidth = 5;
          g.rect(left, bottom, CONFIG.worldWidth * context.zoom, CONFIG.worldHeight * context.zoom);
          g.stroke();
        };
        _proto.drawFoods = function drawFoods(context) {
          var g = this.graphics;
          var margin = 90;
          var halfW = context.width * 0.5 + margin;
          var halfH = context.height * 0.5 + margin;
          for (var _iterator = _createForOfIteratorHelperLoose(context.foods), _step; !(_step = _iterator()).done;) {
            var food = _step.value;
            var screen = this.worldToScreen(food.position, context.camera, context.zoom);
            if (Math.abs(screen.x) > halfW || Math.abs(screen.y) > halfH) {
              continue;
            }
            var radius = Math.max(2.5, food.radius * context.zoom);
            g.fillColor = food.color;
            if (food.kind === FoodKind.Big) {
              this.drawStar(screen.x, screen.y, radius * 1.45, radius * 0.72);
            } else if (food.kind === FoodKind.Magnet) {
              this.drawMagnet(screen.x, screen.y, radius);
            } else {
              g.circle(screen.x, screen.y, radius);
              g.fill();
            }
          }
        };
        _proto.drawStar = function drawStar(x, y, outer, inner) {
          var g = this.graphics;
          for (var i = 0; i < 10; i++) {
            var radius = i % 2 === 0 ? outer : inner;
            var angle = -Math.PI * 0.5 + Math.PI * 2 * i / 10;
            var px = x + Math.cos(angle) * radius;
            var py = y + Math.sin(angle) * radius;
            if (i === 0) {
              g.moveTo(px, py);
            } else {
              g.lineTo(px, py);
            }
          }
          g.close();
          g.fill();
        };
        _proto.drawMagnet = function drawMagnet(x, y, radius) {
          var g = this.graphics;
          g.fillColor = color(255, 255, 255, 42);
          g.circle(x, y, radius * 1.36);
          g.fill();
          var barWidth = radius * 0.46;
          var barHeight = radius * 1.22;
          var bridgeHeight = radius * 0.44;
          g.fillColor = color(232, 66, 78);
          g.fillRect(x - radius * 0.78, y - radius * 0.44, barWidth, barHeight);
          g.fillColor = color(74, 161, 255);
          g.fillRect(x + radius * 0.32, y - radius * 0.44, barWidth, barHeight);
          g.fillColor = color(236, 246, 244);
          g.fillRect(x - radius * 0.78, y + radius * 0.36, radius * 1.56, bridgeHeight);
        };
        _proto.drawGhostKing = function drawGhostKing(context) {
          var ghost = context.ghostKing;
          if (!ghost.active) {
            return;
          }
          var screen = this.worldToScreen(ghost.position, context.camera, context.zoom);
          var margin = ghost.radius * context.zoom + 80;
          if (Math.abs(screen.x) > context.width * 0.5 + margin || Math.abs(screen.y) > context.height * 0.5 + margin) {
            return;
          }
          var g = this.graphics;
          var radius = Math.max(24, ghost.radius * context.zoom);
          var pulse = 0.5 + Math.sin(ghost.activeTime * 9) * 0.5;
          g.fillColor = color(112, 56, 176, 54);
          g.circle(screen.x, screen.y, radius * (1.35 + pulse * 0.12));
          g.fill();
          g.fillColor = color(117, 72, 196, 238);
          g.circle(screen.x, screen.y + radius * 0.08, radius);
          g.fill();
          g.fillRect(screen.x - radius, screen.y - radius * 0.1, radius * 2, radius * 0.74);
          g.fillColor = color(174, 122, 255, 245);
          g.circle(screen.x - radius * 0.42, screen.y - radius * 0.48, radius * 0.38);
          g.circle(screen.x + radius * 0.42, screen.y - radius * 0.48, radius * 0.38);
          g.fill();
          g.fillColor = color(255, 231, 112);
          g.moveTo(screen.x - radius * 0.58, screen.y + radius * 0.82);
          g.lineTo(screen.x - radius * 0.22, screen.y + radius * 1.42);
          g.lineTo(screen.x - radius * 0.04, screen.y + radius * 0.76);
          g.close();
          g.moveTo(screen.x + radius * 0.58, screen.y + radius * 0.82);
          g.lineTo(screen.x + radius * 0.22, screen.y + radius * 1.42);
          g.lineTo(screen.x + radius * 0.04, screen.y + radius * 0.76);
          g.close();
          g.fill();
          g.fillColor = color(245, 252, 250);
          g.circle(screen.x - radius * 0.32, screen.y + radius * 0.18, radius * 0.18);
          g.circle(screen.x + radius * 0.32, screen.y + radius * 0.18, radius * 0.18);
          g.fill();
          g.fillColor = color(18, 22, 28);
          g.circle(screen.x - radius * 0.32, screen.y + radius * 0.14, radius * 0.09);
          g.circle(screen.x + radius * 0.32, screen.y + radius * 0.14, radius * 0.09);
          g.fill();
          g.strokeColor = color(35, 21, 52, 210);
          g.lineWidth = Math.max(2, 3 * context.zoom);
          g.moveTo(screen.x - radius * 0.22, screen.y - radius * 0.26);
          g.lineTo(screen.x - radius * 0.04, screen.y - radius * 0.36);
          g.lineTo(screen.x + radius * 0.14, screen.y - radius * 0.26);
          g.stroke();
        };
        _proto.drawSnakes = function drawSnakes(context) {
          var margin = 180;
          var halfW = context.width * 0.5 + margin;
          var halfH = context.height * 0.5 + margin;
          for (var _iterator2 = _createForOfIteratorHelperLoose(context.snakes), _step2; !(_step2 = _iterator2()).done;) {
            var _snake = _step2.value;
            if (!_snake.isPlayer) {
              this.drawSnake(_snake, context, halfW, halfH);
            }
          }
          for (var _iterator3 = _createForOfIteratorHelperLoose(context.snakes), _step3; !(_step3 = _iterator3()).done;) {
            var _snake2 = _step3.value;
            if (_snake2.isPlayer) {
              this.drawSnake(_snake2, context, halfW, halfH);
            }
          }
        };
        _proto.drawSnake = function drawSnake(snake, context, halfW, halfH) {
          var g = this.graphics;
          if (snake.dead) {
            return;
          }
          var headScreen = this.worldToScreen(snake.head, context.camera, context.zoom);
          var approximateExtent = Math.min(1500, snake.targetLength * snake.radius * context.zoom * 0.72);
          if (Math.abs(headScreen.x) > halfW + approximateExtent || Math.abs(headScreen.y) > halfH + approximateExtent) {
            return;
          }
          var body = context.getSnakeBodySample(snake);
          var radius = Math.max(4, snake.radius * context.zoom);
          var bodyStep = this.getBodyRenderStep(snake);
          var shouldDrawHeadAfterLoop = bodyStep > 1 && body.length > 0 && (body.length - 1) % bodyStep !== 0;
          for (var i = body.length - 1; i >= 0; i -= bodyStep) {
            var screen = this.worldToScreen(body[i], context.camera, context.zoom);
            if (Math.abs(screen.x) > halfW || Math.abs(screen.y) > halfH) {
              continue;
            }
            var shade = i === 0 ? 1 : clamp(0.68 + (body.length - i) / body.length * 0.28, 0.55, 1);
            g.fillColor = color(Math.floor(snake.color.r * shade), Math.floor(snake.color.g * shade), Math.floor(snake.color.b * shade), snake.isPlayer ? 250 : 220);
            g.circle(screen.x, screen.y, radius * (i === 0 ? 1.12 : 1));
            g.fill();
          }
          if (shouldDrawHeadAfterLoop && Math.abs(headScreen.x) <= halfW && Math.abs(headScreen.y) <= halfH) {
            g.fillColor = color(snake.color.r, snake.color.g, snake.color.b, snake.isPlayer ? 250 : 220);
            g.circle(headScreen.x, headScreen.y, radius * 1.12);
            g.fill();
          }
          if (Math.abs(headScreen.x) > halfW || Math.abs(headScreen.y) > halfH) {
            return;
          }
          if (snake.invincibleTime > 0) {
            this.drawInvincibleRing(snake, radius, context);
          }
          this.drawSnakeEyes(snake, radius, context);
        };
        _proto.getBodyRenderStep = function getBodyRenderStep(snake) {
          if (snake.isPlayer) {
            if (snake.targetLength > 360) {
              return 4;
            }
            if (snake.targetLength > 220) {
              return 3;
            }
            if (snake.targetLength > 120) {
              return 2;
            }
            return 1;
          }
          if (snake.targetLength > 360) {
            return 8;
          }
          if (snake.targetLength > 240) {
            return 6;
          }
          if (snake.targetLength > 120) {
            return 4;
          }
          if (snake.targetLength > 60) {
            return 2;
          }
          return 1;
        };
        _proto.drawInvincibleRing = function drawInvincibleRing(snake, radius, context) {
          var g = this.graphics;
          var head = this.worldToScreen(snake.head, context.camera, context.zoom);
          var pulse = 0.5 + Math.sin(snake.invincibleTime * 12) * 0.5;
          g.lineWidth = Math.max(2, 3 * context.zoom);
          g.strokeColor = color(255, 231, 112, Math.floor(170 + pulse * 55));
          g.circle(head.x, head.y, radius * (1.62 + pulse * 0.16));
          g.stroke();
        };
        _proto.drawSnakeEyes = function drawSnakeEyes(snake, radius, context) {
          var g = this.graphics;
          var head = this.worldToScreen(snake.head, context.camera, context.zoom);
          var dir = snake.direction;
          var normal = {
            x: -dir.y,
            y: dir.x
          };
          var eyeForward = radius * 0.46;
          var eyeSide = radius * 0.42;
          var leftEye = {
            x: head.x + dir.x * eyeForward + normal.x * eyeSide,
            y: head.y + dir.y * eyeForward + normal.y * eyeSide
          };
          var rightEye = {
            x: head.x + dir.x * eyeForward - normal.x * eyeSide,
            y: head.y + dir.y * eyeForward - normal.y * eyeSide
          };
          g.fillColor = color(250, 255, 255);
          g.circle(leftEye.x, leftEye.y, Math.max(2, radius * 0.22));
          g.circle(rightEye.x, rightEye.y, Math.max(2, radius * 0.22));
          g.fill();
          g.fillColor = color(15, 25, 28);
          g.circle(leftEye.x + dir.x * radius * 0.06, leftEye.y + dir.y * radius * 0.06, Math.max(1.2, radius * 0.1));
          g.circle(rightEye.x + dir.x * radius * 0.06, rightEye.y + dir.y * radius * 0.06, Math.max(1.2, radius * 0.1));
          g.fill();
        };
        _proto.worldToScreen = function worldToScreen(world, camera, zoom) {
          return {
            x: (world.x - camera.x) * zoom,
            y: (world.y - camera.y) * zoom
          };
        };
        return GameRenderer;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/GameTypes.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "1d7bd5tBgdPDpG50dTzLT1A", "GameTypes", undefined);
      var GameState = exports('GameState', /*#__PURE__*/function (GameState) {
        GameState[GameState["Menu"] = 0] = "Menu";
        GameState[GameState["SkinSelect"] = 1] = "SkinSelect";
        GameState[GameState["Playing"] = 2] = "Playing";
        GameState[GameState["Dead"] = 3] = "Dead";
        return GameState;
      }({}));
      var FoodKind = exports('FoodKind', /*#__PURE__*/function (FoodKind) {
        FoodKind[FoodKind["Normal"] = 0] = "Normal";
        FoodKind[FoodKind["Big"] = 1] = "Big";
        FoodKind[FoodKind["Meat"] = 2] = "Meat";
        FoodKind[FoodKind["Magnet"] = 3] = "Magnet";
        return FoodKind;
      }({}));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/GameUI.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './GameConfig.ts', './GameTypes.ts'], function (exports) {
  var _createForOfIteratorHelperLoose, cclegacy, view, UITransform, instantiate, Mask, Sprite, Label, Node, Graphics, resources, SpriteFrame, SNAKE_COLORS, color, GameState;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      view = module.view;
      UITransform = module.UITransform;
      instantiate = module.instantiate;
      Mask = module.Mask;
      Sprite = module.Sprite;
      Label = module.Label;
      Node = module.Node;
      Graphics = module.Graphics;
      resources = module.resources;
      SpriteFrame = module.SpriteFrame;
    }, function (module) {
      SNAKE_COLORS = module.SNAKE_COLORS;
      color = module.color;
    }, function (module) {
      GameState = module.GameState;
    }],
    execute: function () {
      cclegacy._RF.push({}, "bb45dcy7E9LRZzEBSNwmdF9", "GameUI", undefined);
      var UI_KIT_RESOURCE_ROOT = 'ui_kit';
      var SNAKE_SKIN_NAMES = ['snake_01_classic_green', 'snake_02_blue_drop', 'snake_03_pink_strawberry', 'snake_04_yellow_sun', 'snake_05_purple_dream', 'snake_06_mushroom_forest', 'snake_07_flower', 'snake_08_star', 'snake_09_candy', 'snake_10_honey', 'snake_11_watermelon', 'snake_12_rainbow', 'snake_13_icecream', 'snake_14_cloud', 'snake_15_crown', 'snake_16_cape', 'snake_17_leaf', 'snake_18_apple', 'snake_19_cream', 'snake_20_soft_night'];
      var UI_FRAME_NAMES = ['ui_background_forest_1920x1080', 'ui_board_grass_grid', 'button_start', 'button_pause', 'button_continue', 'button_restart', 'button_settings', 'button_sound_on', 'button_sound_off', 'button_back', 'button_confirm', 'button_character_left', 'button_character_right', 'panel_score', 'panel_high_score', 'panel_game_status', 'panel_current_player', 'panel_character_select', 'popup_start_game', 'popup_game_over_retry'].concat(SNAKE_SKIN_NAMES.map(function (name) {
        return name + "_avatar";
      }));
      var GameUI = exports('GameUI', /*#__PURE__*/function () {
        function GameUI(parent, layer, gameUiPrefab, startMenuPrefab, skinSelectPrefab, reviveDialogPrefab) {
          this.root = void 0;
          this.transform = void 0;
          this.backgroundNode = void 0;
          this.backgroundTransform = void 0;
          this.backgroundSprite = void 0;
          this.decorNode = void 0;
          this.decorTransform = void 0;
          this.decorGraphics = void 0;
          this.scoreLabel = void 0;
          this.rankLabel = void 0;
          this.rankItemLabels = [];
          this.titleLabel = void 0;
          this.hintLabel = void 0;
          this.menuButtons = [];
          this.skinCards = [];
          this.deathButtons = [];
          this.hudRoot = null;
          this.gameContentNode = null;
          this.gameContentTransform = null;
          this.startMenuRoot = null;
          this.startMenuButtons = [];
          this.startMenuVolumeStateLabel = null;
          this.startMenuVolumeStateOnNode = null;
          this.startMenuVolumeStateOffNode = null;
          this.skinSelectRoot = null;
          this.skinSelectCards = [];
          this.skinSelectSelectedFrame = null;
          this.skinSelectAvailableFrame = null;
          this.skinSelectLockedFrame = null;
          this.skinSelectCardSelectedFrame = null;
          this.reviveDialogRoot = null;
          this.reviveCountdownLabel = null;
          this.reviveButtonSprite = null;
          this.reviveButtonLabel = null;
          this.reviveButtonNormalFrame = null;
          this.backButtonSprite = null;
          this.backButtonLabel = null;
          this.backButtonNormalFrame = null;
          this.reviveFocusedFrame = null;
          this.backFocusedFrame = null;
          this.screen = 'menu';
          this.menuFocusIndex = 0;
          this.focusSkinIndex = 0;
          this.selectedSkinIndex = 0;
          this.unlockedSkins = [];
          this.volumeEnabled = true;
          this.deathFocusIndex = 0;
          this.skinGridCols = 4;
          this.skinSelectFirstVisibleRow = 0;
          this.skinSelectVisibleRows = 3;
          this.frames = new Map();
          this.spriteBindings = [];
          this.root = new Node('UILayer');
          this.root.layer = layer;
          parent.addChild(this.root);
          this.transform = this.root.addComponent(UITransform);
          this.backgroundNode = new Node('StorybookBackground');
          this.backgroundNode.layer = layer;
          this.root.addChild(this.backgroundNode);
          this.backgroundTransform = this.backgroundNode.addComponent(UITransform);
          this.backgroundSprite = this.backgroundNode.addComponent(Sprite);
          this.bindSpriteFrame(this.backgroundSprite, 'ui_background_forest_1920x1080');
          this.decorNode = new Node('UiDecorLayer');
          this.decorNode.layer = layer;
          this.root.addChild(this.decorNode);
          this.decorTransform = this.decorNode.addComponent(UITransform);
          this.decorGraphics = this.decorNode.addComponent(Graphics);
          this.loadUiKitFrames();
          var hud = gameUiPrefab ? this.instantiateHudPrefab(gameUiPrefab, layer) : null;
          if (hud) {
            var _this$rankItemLabels;
            this.hudRoot = hud.root;
            this.scoreLabel = hud.scoreLabel;
            (_this$rankItemLabels = this.rankItemLabels).push.apply(_this$rankItemLabels, hud.rankItemLabels);
            this.gameContentNode = hud.gameContentNode;
            this.gameContentTransform = hud.gameContentTransform;
            this.rankLabel = null;
          } else {
            this.scoreLabel = this.createLabel('ScoreLabel', 42, color(82, 70, 43), layer);
            this.scoreLabel.horizontalAlign = Label.HorizontalAlign.LEFT;
            this.rankLabel = this.createLabel('RankLabel', 24, color(82, 70, 43), layer);
            this.rankLabel.horizontalAlign = Label.HorizontalAlign.LEFT;
          }
          var menu = startMenuPrefab ? this.instantiateStartMenuPrefab(startMenuPrefab, layer) : null;
          if (menu) {
            this.startMenuRoot = menu.root;
            this.startMenuButtons = menu.buttons;
            this.startMenuVolumeStateLabel = menu.volumeStateLabel;
            this.startMenuVolumeStateOnNode = menu.volumeStateOnNode;
            this.startMenuVolumeStateOffNode = menu.volumeStateOffNode;
          }
          var skinSelect = skinSelectPrefab ? this.instantiateSkinSelectPrefab(skinSelectPrefab, layer) : null;
          if (skinSelect) {
            this.skinSelectRoot = skinSelect.root;
            this.skinSelectCards = skinSelect.cards;
            this.skinSelectSelectedFrame = skinSelect.selectedFrame;
            this.skinSelectAvailableFrame = skinSelect.availableFrame;
            this.skinSelectLockedFrame = skinSelect.lockedFrame;
            this.skinSelectCardSelectedFrame = skinSelect.cardSelectedFrame;
            this.skinSelectRoot.active = false;
          }
          var reviveDialog = reviveDialogPrefab ? this.instantiateReviveDialogPrefab(reviveDialogPrefab, layer) : null;
          if (reviveDialog) {
            this.reviveDialogRoot = reviveDialog.root;
            this.reviveCountdownLabel = reviveDialog.countdownLabel;
            this.reviveButtonSprite = reviveDialog.reviveButtonSprite;
            this.reviveButtonLabel = reviveDialog.reviveButtonLabel;
            this.reviveButtonNormalFrame = reviveDialog.reviveNormalFrame;
            this.backButtonSprite = reviveDialog.backButtonSprite;
            this.backButtonLabel = reviveDialog.backButtonLabel;
            this.backButtonNormalFrame = reviveDialog.backNormalFrame;
            this.reviveFocusedFrame = reviveDialog.reviveFocusedFrame;
            this.backFocusedFrame = reviveDialog.backFocusedFrame;
            this.reviveDialogRoot.active = false;
          }
          this.titleLabel = this.createLabel('TitleLabel', 72, color(92, 75, 51), layer);
          this.hintLabel = this.createLabel('HintLabel', 24, color(98, 113, 73), layer);
          for (var i = 0; i < 3; i++) {
            this.menuButtons.push(this.createButton("MenuButton" + i, layer));
          }
          for (var _i = 0; _i < SNAKE_COLORS.length; _i++) {
            this.skinCards.push(this.createButton("SkinCard" + _i, layer));
          }
          for (var _i2 = 0; _i2 < 2; _i2++) {
            this.deathButtons.push(this.createButton("DeathButton" + _i2, layer));
          }
        }
        var _proto = GameUI.prototype;
        _proto.layout = function layout() {
          var size = view.getVisibleSize();
          this.transform.setContentSize(size.width, size.height);
          this.backgroundTransform.setContentSize(size.width, size.height);
          this.backgroundNode.setPosition(0, 0);
          this.decorTransform.setContentSize(size.width, size.height);
          this.decorNode.setPosition(0, 0);
          if (this.hudRoot) {
            var _this$gameContentTran, _this$gameContentNode;
            this.hudRoot.setPosition(0, 0);
            (_this$gameContentTran = this.gameContentTransform) == null || _this$gameContentTran.setContentSize(size.width, size.height);
            (_this$gameContentNode = this.gameContentNode) == null || _this$gameContentNode.setPosition(0, 0);
          } else {
            this.scoreLabel.node.getComponent(UITransform).setContentSize(460, 88);
            this.scoreLabel.node.setPosition(-size.width * 0.5 + 294, size.height * 0.5 - 84);
            if (this.rankLabel) {
              this.rankLabel.node.getComponent(UITransform).setContentSize(280, 276);
              this.rankLabel.node.setPosition(size.width * 0.5 - 194, size.height * 0.5 - 184);
            }
          }
          this.titleLabel.node.getComponent(UITransform).setContentSize(Math.min(size.width - 80, 920), 120);
          this.titleLabel.node.setPosition(0, size.height * 0.5 - 150);
          this.hintLabel.node.getComponent(UITransform).setContentSize(Math.min(size.width - 64, 820), 88);
          this.hintLabel.node.setPosition(0, -size.height * 0.5 + 80);
          this.layoutStartMenu(size.width, size.height);
          this.layoutSkinSelectPrefab(size.width, size.height);
          this.layoutReviveDialog(size.width, size.height);
          this.layoutMenu(size.width, size.height);
          this.layoutSkinSelect(size.width, size.height);
          this.layoutDeath(size.width, size.height);
          this.redraw();
        };
        _proto.getGameContentNode = function getGameContentNode() {
          return this.gameContentNode;
        };
        _proto.getGameViewportSize = function getGameViewportSize() {
          var _this$gameContentTran2;
          var contentSize = (_this$gameContentTran2 = this.gameContentTransform) == null ? void 0 : _this$gameContentTran2.contentSize;
          if (contentSize) {
            return {
              width: contentSize.width,
              height: contentSize.height
            };
          }
          var size = view.getVisibleSize();
          return {
            width: size.width,
            height: size.height
          };
        };
        _proto.showMenu = function showMenu(selectedSkinIndex, focusIndex, volumeEnabled) {
          this.screen = 'menu';
          this.selectedSkinIndex = selectedSkinIndex;
          this.menuFocusIndex = focusIndex;
          this.volumeEnabled = volumeEnabled;
          this.setHudActive(false);
          var usingStartMenuPrefab = this.startMenuRoot !== null;
          this.titleLabel.node.active = !usingStartMenuPrefab;
          this.hintLabel.node.active = !usingStartMenuPrefab;
          if (!usingStartMenuPrefab) {
            this.titleLabel.string = 'TV贪吃蛇';
            this.hintLabel.string = '森林里的小蛇冒险准备好了';
          }
          this.setMenuPrefabActive(true);
          this.setSkinSelectPrefabActive(false);
          this.setReviveDialogActive(false);
          this.setGroupActive(this.menuButtons, !usingStartMenuPrefab);
          this.setGroupActive(this.skinCards, false);
          this.setGroupActive(this.deathButtons, false);
          this.redraw();
        };
        _proto.showSkinSelect = function showSkinSelect(focusSkinIndex, selectedSkinIndex, unlockedSkins) {
          this.screen = 'skin';
          this.focusSkinIndex = focusSkinIndex;
          this.selectedSkinIndex = selectedSkinIndex;
          this.unlockedSkins = unlockedSkins;
          this.setHudActive(false);
          this.setMenuPrefabActive(false);
          var usingSkinSelectPrefab = this.skinSelectRoot !== null;
          this.titleLabel.node.active = !usingSkinSelectPrefab;
          this.hintLabel.node.active = !usingSkinSelectPrefab;
          if (!usingSkinSelectPrefab) {
            this.titleLabel.string = '皮肤选择';
            this.hintLabel.string = '选择你喜欢的小蛇伙伴';
          }
          this.setSkinSelectPrefabActive(usingSkinSelectPrefab);
          this.setGroupActive(this.menuButtons, false);
          this.setGroupActive(this.skinCards, !usingSkinSelectPrefab);
          this.setGroupActive(this.deathButtons, false);
          this.setReviveDialogActive(false);
          if (usingSkinSelectPrefab) {
            var size = view.getVisibleSize();
            this.layoutSkinSelectPrefab(size.width, size.height);
          }
          this.redraw();
        };
        _proto.getSkinSelectNavigationStep = function getSkinSelectNavigationStep() {
          return this.skinGridCols;
        };
        _proto.showPlaying = function showPlaying() {
          this.screen = 'playing';
          this.setHudActive(true);
          this.setMenuPrefabActive(false);
          this.setSkinSelectPrefabActive(false);
          this.setReviveDialogActive(false);
          this.titleLabel.node.active = false;
          this.hintLabel.node.active = false;
          this.setGroupActive(this.menuButtons, false);
          this.setGroupActive(this.skinCards, false);
          this.setGroupActive(this.deathButtons, false);
        };
        _proto.showDead = function showDead(focusIndex, deathCountdown) {
          if (deathCountdown === void 0) {
            deathCountdown = 0;
          }
          this.screen = 'dead';
          this.deathFocusIndex = focusIndex;
          this.setHudActive(true);
          this.setMenuPrefabActive(false);
          this.setSkinSelectPrefabActive(false);
          var usingReviveDialog = this.reviveDialogRoot !== null;
          this.setReviveDialogActive(usingReviveDialog);
          this.titleLabel.node.active = !usingReviveDialog;
          this.hintLabel.node.active = !usingReviveDialog;
          if (!usingReviveDialog) {
            this.titleLabel.string = '再来一次';
          }
          this.setGroupActive(this.menuButtons, false);
          this.setGroupActive(this.skinCards, false);
          this.setGroupActive(this.deathButtons, !usingReviveDialog);
          this.redrawDeathButtons(deathCountdown);
        };
        _proto.updateLabels = function updateLabels(state, player, snakes, savedScore, _savedLength, deathCountdown, deathFocusIndex, _ghostKing) {
          if (state === GameState.Playing) {
            this.scoreLabel.string = this.hudRoot ? "\u79EF\u5206 " + Math.floor(player.score) : "\u79EF\u5206\uFF1A" + Math.floor(player.score);
          } else if (state === GameState.Dead) {
            this.deathFocusIndex = deathFocusIndex;
            this.scoreLabel.string = this.hudRoot ? "\u79EF\u5206 " + Math.floor(savedScore) : "\u79EF\u5206\uFF1A" + Math.floor(savedScore);
            if (this.reviveDialogRoot) {
              this.updateReviveDialogCountdown(deathCountdown);
            } else {
              this.titleLabel.string = '再来一次';
              this.hintLabel.string = deathCountdown > 0 ? "\u590D\u6D3B\u5012\u8BA1\u65F6 " + deathCountdown.toFixed(1) + "\u79D2" : '复活已过期';
            }
            this.redrawDeathButtons(deathCountdown);
          }
          if (state !== GameState.Menu && state !== GameState.SkinSelect) {
            this.updateRankLabels(state, snakes, savedScore);
          }
        };
        _proto.instantiateHudPrefab = function instantiateHudPrefab(prefab, layer) {
          var _gameContentNode$getC;
          var hudRoot = instantiate(prefab);
          hudRoot.name = 'GameUI';
          this.applyLayerRecursive(hudRoot, layer);
          this.root.addChild(hudRoot);
          var scoreLabel = this.findLabel(hudRoot, 'ScoreLabel');
          if (!scoreLabel) {
            hudRoot.destroy();
            return null;
          }
          var rankItemLabels = [];
          for (var i = 1; i <= 10; i++) {
            var label = this.findLabel(hudRoot, "RankItem_" + i);
            if (label) {
              rankItemLabels.push(label);
            }
          }
          var gameContentNode = this.findNode(hudRoot, 'GameContent');
          var gameContentTransform = (_gameContentNode$getC = gameContentNode == null ? void 0 : gameContentNode.getComponent(UITransform)) != null ? _gameContentNode$getC : null;
          if (gameContentNode && gameContentTransform && !gameContentNode.getComponent(Mask)) {
            gameContentNode.addComponent(Mask);
          }
          return {
            root: hudRoot,
            scoreLabel: scoreLabel,
            rankItemLabels: rankItemLabels,
            gameContentNode: gameContentNode,
            gameContentTransform: gameContentTransform
          };
        };
        _proto.instantiateStartMenuPrefab = function instantiateStartMenuPrefab(prefab, layer) {
          var _this$findLabel;
          var root = instantiate(prefab);
          root.name = 'StartMenu';
          this.applyLayerRecursive(root, layer);
          this.root.addChild(root);
          var buttonNames = ['BtnEndless', 'BtnSkin', 'BtnVolume'];
          var buttons = [];
          for (var _i3 = 0, _buttonNames = buttonNames; _i3 < _buttonNames.length; _i3++) {
            var _node$getComponent, _this$findNode$getCom, _this$findNode;
            var name = _buttonNames[_i3];
            var node = this.findNode(root, name);
            var sprite = (_node$getComponent = node == null ? void 0 : node.getComponent(Sprite)) != null ? _node$getComponent : null;
            if (!node || !sprite) {
              root.destroy();
              return null;
            }
            var selectedFrame = (_this$findNode$getCom = (_this$findNode = this.findNode(root, name + "SelectedFrame")) == null || (_this$findNode = _this$findNode.getComponent(Sprite)) == null ? void 0 : _this$findNode.spriteFrame) != null ? _this$findNode$getCom : null;
            buttons.push({
              node: node,
              sprite: sprite,
              normalFrame: sprite.spriteFrame,
              selectedFrame: selectedFrame
            });
          }
          var volumeStateOnNode = this.findNode(root, 'VolumeStateOn');
          var volumeStateOffNode = this.findNode(root, 'VolumeStateOff');
          var volumeStateLabel = volumeStateOnNode && volumeStateOffNode ? null : (_this$findLabel = this.findLabel(root, 'VolumeStateLabel')) != null ? _this$findLabel : this.createVolumeStateLabel(buttons[2].node, layer);
          return {
            root: root,
            buttons: buttons,
            volumeStateLabel: volumeStateLabel,
            volumeStateOnNode: volumeStateOnNode,
            volumeStateOffNode: volumeStateOffNode
          };
        };
        _proto.instantiateSkinSelectPrefab = function instantiateSkinSelectPrefab(prefab, layer) {
          var _cards$0$stateButtonS, _cards$, _cards$1$stateButtonS, _cards$2, _cards$2$stateButtonS, _cards$3, _this$findNode$getCom4, _this$findNode4;
          var root = instantiate(prefab);
          root.name = 'SkinSelect';
          this.applyLayerRecursive(root, layer);
          this.root.addChild(root);
          var cards = [];
          for (var i = 1;; i++) {
            var _this$findNode$getCom2, _this$findNode2, _rootSprite$spriteFra, _this$findNode$getCom3, _this$findNode3;
            var cardRoot = this.findNode(root, "SkinCard_" + i);
            if (!cardRoot) {
              break;
            }
            var stateButton = (_this$findNode$getCom2 = (_this$findNode2 = this.findNode(root, "StateButton_" + i)) == null ? void 0 : _this$findNode2.getComponent(Sprite)) != null ? _this$findNode$getCom2 : null;
            var stateLabel = this.findLabel(root, "StateLabel_" + i);
            if (!stateButton || !stateLabel) {
              root.destroy();
              return null;
            }
            var rootSprite = cardRoot.getComponent(Sprite);
            cards.push({
              root: cardRoot,
              rootTransform: cardRoot.getComponent(UITransform),
              rootSprite: rootSprite,
              normalFrame: (_rootSprite$spriteFra = rootSprite == null ? void 0 : rootSprite.spriteFrame) != null ? _rootSprite$spriteFra : null,
              avatarTransform: (_this$findNode$getCom3 = (_this$findNode3 = this.findNode(root, "Avatar_" + i)) == null ? void 0 : _this$findNode3.getComponent(UITransform)) != null ? _this$findNode$getCom3 : null,
              stateButtonSprite: stateButton,
              stateButtonTransform: stateButton.node.getComponent(UITransform),
              stateLabel: stateLabel,
              stateLabelTransform: stateLabel.node.getComponent(UITransform),
              portraitLabel: this.findLabel(root, "PortraitLabel_" + i)
            });
          }
          if (cards.length === 0 || cards.length !== SNAKE_COLORS.length) {
            root.destroy();
            return null;
          }
          return {
            root: root,
            cards: cards,
            selectedFrame: (_cards$0$stateButtonS = (_cards$ = cards[0]) == null ? void 0 : _cards$.stateButtonSprite.spriteFrame) != null ? _cards$0$stateButtonS : null,
            availableFrame: (_cards$1$stateButtonS = (_cards$2 = cards[1]) == null ? void 0 : _cards$2.stateButtonSprite.spriteFrame) != null ? _cards$1$stateButtonS : null,
            lockedFrame: (_cards$2$stateButtonS = (_cards$3 = cards[2]) == null ? void 0 : _cards$3.stateButtonSprite.spriteFrame) != null ? _cards$2$stateButtonS : null,
            cardSelectedFrame: (_this$findNode$getCom4 = (_this$findNode4 = this.findNode(root, 'SkinCardSelectedFrame')) == null || (_this$findNode4 = _this$findNode4.getComponent(Sprite)) == null ? void 0 : _this$findNode4.spriteFrame) != null ? _this$findNode$getCom4 : null
          };
        };
        _proto.instantiateReviveDialogPrefab = function instantiateReviveDialogPrefab(prefab, layer) {
          var _this$findNode$getCom5, _this$findNode5, _this$findNode$getCom6, _this$findNode6, _this$findNode$getCom7, _this$findNode7, _this$findNode$getCom8, _this$findNode8;
          var root = instantiate(prefab);
          root.name = 'ReviveDialog';
          this.applyLayerRecursive(root, layer);
          this.root.addChild(root);
          var countdownLabel = this.findLabel(root, 'CountdownValue');
          var reviveButtonSprite = (_this$findNode$getCom5 = (_this$findNode5 = this.findNode(root, 'BtnRevive')) == null ? void 0 : _this$findNode5.getComponent(Sprite)) != null ? _this$findNode$getCom5 : null;
          var reviveButtonLabel = this.findLabel(root, 'BtnReviveLabel');
          var backButtonSprite = (_this$findNode$getCom6 = (_this$findNode6 = this.findNode(root, 'BtnBack')) == null ? void 0 : _this$findNode6.getComponent(Sprite)) != null ? _this$findNode$getCom6 : null;
          var backButtonLabel = this.findLabel(root, 'BtnBackLabel');
          if (!countdownLabel || !reviveButtonSprite || !reviveButtonLabel || !backButtonSprite || !backButtonLabel) {
            root.destroy();
            return null;
          }
          return {
            root: root,
            countdownLabel: countdownLabel,
            reviveButtonSprite: reviveButtonSprite,
            reviveButtonLabel: reviveButtonLabel,
            reviveNormalFrame: reviveButtonSprite.spriteFrame,
            backButtonSprite: backButtonSprite,
            backButtonLabel: backButtonLabel,
            backNormalFrame: backButtonSprite.spriteFrame,
            reviveFocusedFrame: (_this$findNode$getCom7 = (_this$findNode7 = this.findNode(root, 'BtnReviveSelectedFrame')) == null || (_this$findNode7 = _this$findNode7.getComponent(Sprite)) == null ? void 0 : _this$findNode7.spriteFrame) != null ? _this$findNode$getCom7 : reviveButtonSprite.spriteFrame,
            backFocusedFrame: (_this$findNode$getCom8 = (_this$findNode8 = this.findNode(root, 'BtnBackSelectedFrame')) == null || (_this$findNode8 = _this$findNode8.getComponent(Sprite)) == null ? void 0 : _this$findNode8.spriteFrame) != null ? _this$findNode$getCom8 : backButtonSprite.spriteFrame
          };
        };
        _proto.loadUiKitFrames = function loadUiKitFrames() {
          var _this = this;
          var _loop = function _loop() {
            var name = _step.value;
            resources.load(UI_KIT_RESOURCE_ROOT + "/" + name + "/spriteFrame", SpriteFrame, function (error, frame) {
              if (error || !frame) {
                return;
              }
              _this.frames.set(name, frame);
              for (var _iterator2 = _createForOfIteratorHelperLoose(_this.spriteBindings), _step2; !(_step2 = _iterator2()).done;) {
                var binding = _step2.value;
                if (binding.name === name) {
                  binding.sprite.spriteFrame = frame;
                }
              }
              _this.redraw();
            });
          };
          for (var _iterator = _createForOfIteratorHelperLoose(UI_FRAME_NAMES), _step; !(_step = _iterator()).done;) {
            _loop();
          }
        };
        _proto.bindSpriteFrame = function bindSpriteFrame(sprite, name) {
          this.spriteBindings.push({
            name: name,
            sprite: sprite
          });
          this.applySpriteFrame(sprite, name);
        };
        _proto.applySpriteFrame = function applySpriteFrame(sprite, name) {
          var frame = this.frames.get(name);
          if (frame) {
            sprite.spriteFrame = frame;
          }
        };
        _proto.getSkinAssetName = function getSkinAssetName(index) {
          return SNAKE_SKIN_NAMES[index % SNAKE_SKIN_NAMES.length];
        };
        _proto.applyLayerRecursive = function applyLayerRecursive(node, layer) {
          node.layer = layer;
          for (var _iterator3 = _createForOfIteratorHelperLoose(node.children), _step3; !(_step3 = _iterator3()).done;) {
            var child = _step3.value;
            this.applyLayerRecursive(child, layer);
          }
        };
        _proto.findNode = function findNode(root, name) {
          if (root.name === name) {
            return root;
          }
          for (var _iterator4 = _createForOfIteratorHelperLoose(root.children), _step4; !(_step4 = _iterator4()).done;) {
            var child = _step4.value;
            var found = this.findNode(child, name);
            if (found) {
              return found;
            }
          }
          return null;
        };
        _proto.findLabel = function findLabel(root, name) {
          var _this$findNode$getCom9, _this$findNode9;
          return (_this$findNode$getCom9 = (_this$findNode9 = this.findNode(root, name)) == null ? void 0 : _this$findNode9.getComponent(Label)) != null ? _this$findNode$getCom9 : null;
        };
        _proto.createLabel = function createLabel(name, fontSize, labelColor, layer) {
          var node = new Node(name);
          node.layer = layer;
          this.root.addChild(node);
          var transform = node.addComponent(UITransform);
          transform.setContentSize(640, 80);
          var label = node.addComponent(Label);
          label.fontSize = fontSize;
          label.lineHeight = Math.round(fontSize * 1.25);
          label.color = labelColor;
          label.horizontalAlign = Label.HorizontalAlign.CENTER;
          label.verticalAlign = Label.VerticalAlign.CENTER;
          label.overflow = Label.Overflow.SHRINK;
          return label;
        };
        _proto.createButton = function createButton(name, layer) {
          var node = new Node(name);
          node.layer = layer;
          this.root.addChild(node);
          var transform = node.addComponent(UITransform);
          var graphics = node.addComponent(Graphics);
          var spriteNode = new Node(name + "Sprite");
          spriteNode.layer = layer;
          node.addChild(spriteNode);
          var spriteTransform = spriteNode.addComponent(UITransform);
          var sprite = spriteNode.addComponent(Sprite);
          var labelNode = new Node(name + "Label");
          labelNode.layer = layer;
          node.addChild(labelNode);
          var labelTransform = labelNode.addComponent(UITransform);
          var label = labelNode.addComponent(Label);
          label.fontSize = 24;
          label.lineHeight = 30;
          label.color = color(242, 255, 252);
          label.horizontalAlign = Label.HorizontalAlign.CENTER;
          label.verticalAlign = Label.VerticalAlign.CENTER;
          label.overflow = Label.Overflow.SHRINK;
          var iconNode = new Node(name + "Icon");
          iconNode.layer = layer;
          node.addChild(iconNode);
          var iconTransform = iconNode.addComponent(UITransform);
          var iconSprite = iconNode.addComponent(Sprite);
          iconNode.active = false;
          return {
            node: node,
            transform: transform,
            graphics: graphics,
            spriteTransform: spriteTransform,
            sprite: sprite,
            iconNode: iconNode,
            iconTransform: iconTransform,
            iconSprite: iconSprite,
            labelTransform: labelTransform,
            label: label,
            width: 0,
            height: 0,
            spriteFrameName: '',
            iconFrameName: ''
          };
        };
        _proto.layoutMenu = function layoutMenu(width, height) {
          if (this.startMenuRoot) {
            return;
          }
          var buttonWidth = Math.min(520, width - 220);
          var buttonHeight = 120;
          for (var i = 0; i < this.menuButtons.length; i++) {
            var button = this.menuButtons[i];
            this.setButtonSize(button, buttonWidth, buttonHeight);
            button.node.setPosition(0, height * 0.08 - i * 128);
          }
        };
        _proto.layoutStartMenu = function layoutStartMenu(width, height) {
          if (!this.startMenuRoot) {
            return;
          }
          var scale = Math.min(width / 1920, height / 1080);
          this.startMenuRoot.setPosition(0, 0);
          this.startMenuRoot.setScale(scale, scale, 1);
        };
        _proto.layoutSkinSelectPrefab = function layoutSkinSelectPrefab(width, height) {
          if (!this.skinSelectRoot) {
            return;
          }
          var scale = Math.min(width / 1920, height / 1080);
          this.skinSelectRoot.setPosition(0, 0);
          this.skinSelectRoot.setScale(scale, scale, 1);
          var cols = 4;
          this.skinGridCols = cols;
          this.skinSelectVisibleRows = 3;
          this.skinSelectFirstVisibleRow = this.getSkinSelectFirstVisibleRow();
          var cardWidth = 320;
          var cardHeight = 220;
          var gapX = 48;
          var gapY = 42;
          var rowPitch = cardHeight + gapY;
          var totalWidth = cols * cardWidth + (cols - 1) * gapX;
          var startX = -totalWidth * 0.5 + cardWidth * 0.5;
          var startY = 260;
          var scrollOffsetY = this.skinSelectFirstVisibleRow * rowPitch;
          for (var i = 0; i < this.skinSelectCards.length; i++) {
            var _card$rootTransform, _card$avatarTransform, _card$avatarTransform2, _card$stateButtonTran, _card$stateLabelTrans;
            var row = Math.floor(i / cols);
            var col = i % cols;
            var card = this.skinSelectCards[i];
            card.root.setPosition(startX + col * (cardWidth + gapX), startY - row * rowPitch + scrollOffsetY, 0);
            (_card$rootTransform = card.rootTransform) == null || _card$rootTransform.setContentSize(cardWidth, cardHeight);
            (_card$avatarTransform = card.avatarTransform) == null || _card$avatarTransform.setContentSize(178, 142);
            (_card$avatarTransform2 = card.avatarTransform) == null || _card$avatarTransform2.node.setPosition(0, 42, 0);
            (_card$stateButtonTran = card.stateButtonTransform) == null || _card$stateButtonTran.setContentSize(270, 72);
            card.stateButtonSprite.node.setPosition(0, -64, 0);
            (_card$stateLabelTrans = card.stateLabelTransform) == null || _card$stateLabelTrans.setContentSize(218, 52);
            card.stateLabel.node.setPosition(0, -64, 0);
          }
        };
        _proto.layoutReviveDialog = function layoutReviveDialog(width, height) {
          if (!this.reviveDialogRoot) {
            return;
          }
          var scale = Math.min(width / 1920, height / 1080);
          this.reviveDialogRoot.setPosition(0, 0);
          this.reviveDialogRoot.setScale(scale, scale, 1);
        };
        _proto.layoutSkinSelect = function layoutSkinSelect(width, height) {
          if (this.skinSelectRoot) {
            return;
          }
          var cols = width < 760 ? 2 : 4;
          this.skinGridCols = cols;
          var cardWidth = Math.min(300, (width - 220) / cols);
          var cardHeight = Math.min(220, height * 0.24);
          var gapX = 34;
          var gapY = 34;
          var totalWidth = cols * cardWidth + (cols - 1) * gapX;
          var startX = -totalWidth * 0.5 + cardWidth * 0.5;
          var startY = height * 0.24;
          for (var i = 0; i < this.skinCards.length; i++) {
            var row = Math.floor(i / cols);
            var col = i % cols;
            var button = this.skinCards[i];
            this.setButtonSize(button, cardWidth, cardHeight);
            button.node.setPosition(startX + col * (cardWidth + gapX), startY - row * (cardHeight + gapY));
            button.iconTransform.setContentSize(cardHeight * 0.68, cardHeight * 0.68);
            button.iconNode.setPosition(0, cardHeight * 0.14, 0);
            button.labelTransform.setContentSize(cardWidth - 22, 44);
            button.label.node.setPosition(0, -cardHeight * 0.32, 0);
          }
        };
        _proto.layoutDeath = function layoutDeath(width, _height) {
          var buttonWidth = Math.min(300, (width - 140) * 0.45);
          for (var i = 0; i < this.deathButtons.length; i++) {
            var button = this.deathButtons[i];
            this.setButtonSize(button, buttonWidth, 96);
            button.node.setPosition((i - 0.5) * (buttonWidth + 36), -120);
          }
        };
        _proto.redraw = function redraw() {
          this.redrawDecor();
          if (this.screen === 'menu') {
            this.redrawMenuButtons();
          } else if (this.screen === 'skin') {
            if (this.skinSelectRoot && this.skinSelectCards.length > 0) {
              this.redrawSkinSelectPrefab();
            } else {
              this.redrawSkinCards();
            }
          } else if (this.screen === 'dead') {
            this.redrawDeathButtons(0);
          }
        };
        _proto.redrawMenuButtons = function redrawMenuButtons() {
          if (this.startMenuRoot && this.startMenuButtons.length === 3) {
            this.redrawStartMenuButtons();
            return;
          }
          var labels = ['无尽模式', "\u76AE\u80A4  " + (this.selectedSkinIndex + 1) + "/" + SNAKE_COLORS.length, "\u97F3\u91CF  " + (this.volumeEnabled ? '开' : '关')];
          var frames = ['button_start', 'button_confirm', this.volumeEnabled ? 'button_sound_on' : 'button_sound_off'];
          for (var i = 0; i < this.menuButtons.length; i++) {
            this.menuButtons[i].label.string = labels[i];
            this.menuButtons[i].label.fontSize = 38;
            this.menuButtons[i].label.lineHeight = 44;
            this.menuButtons[i].spriteFrameName = frames[i];
            this.menuButtons[i].iconNode.active = false;
            this.drawButton(this.menuButtons[i], i === this.menuFocusIndex, color(21, 50, 54, 230));
          }
        };
        _proto.redrawStartMenuButtons = function redrawStartMenuButtons() {
          for (var i = 0; i < this.startMenuButtons.length; i++) {
            var focused = i === this.menuFocusIndex;
            var button = this.startMenuButtons[i];
            button.sprite.spriteFrame = focused && button.selectedFrame ? button.selectedFrame : button.normalFrame;
            button.sprite.color = focused ? color(255, 255, 255, 255) : color(220, 226, 234, 235);
            button.node.setScale(focused ? 1.055 : 1, focused ? 1.055 : 1, 1);
          }
          if (this.startMenuVolumeStateOnNode && this.startMenuVolumeStateOffNode) {
            this.startMenuVolumeStateOnNode.active = this.volumeEnabled;
            this.startMenuVolumeStateOffNode.active = !this.volumeEnabled;
          } else if (this.startMenuVolumeStateLabel) {
            this.startMenuVolumeStateLabel.string = this.volumeEnabled ? '开' : '关';
            this.startMenuVolumeStateLabel.color = this.volumeEnabled ? color(63, 108, 194, 255) : color(120, 134, 163, 255);
          }
        };
        _proto.redrawSkinCards = function redrawSkinCards() {
          for (var i = 0; i < this.skinCards.length; i++) {
            var _this$unlockedSkins$i;
            var unlocked = (_this$unlockedSkins$i = this.unlockedSkins[i]) != null ? _this$unlockedSkins$i : false;
            var selected = i === this.selectedSkinIndex;
            var focused = i === this.focusSkinIndex;
            var status = selected ? '已出场' : unlocked ? '出场' : '解锁';
            var card = this.skinCards[i];
            card.spriteFrameName = selected ? 'button_sound_on' : unlocked ? 'button_confirm' : 'button_back';
            card.iconFrameName = this.getSkinAssetName(i) + "_avatar";
            card.iconNode.active = true;
            this.applySpriteFrame(card.iconSprite, card.iconFrameName);
            card.label.string = status;
            card.label.fontSize = 25;
            card.label.lineHeight = 30;
            this.drawButton(card, focused, this.mixColor(SNAKE_COLORS[i], color(255, 250, 242, 255), 0.38), unlocked ? 235 : 120);
          }
        };
        _proto.redrawSkinSelectPrefab = function redrawSkinSelectPrefab() {
          var maxCards = this.skinSelectCards.length;
          var totalSkins = SNAKE_COLORS.length;
          if (maxCards === 0 || totalSkins === 0) {
            return;
          }
          var safeFocusIndex = Math.max(0, Math.min(this.focusSkinIndex, totalSkins - 1));
          this.skinSelectFirstVisibleRow = this.getSkinSelectFirstVisibleRow();
          var pageStart = Math.floor(safeFocusIndex / maxCards) * maxCards;
          for (var i = 0; i < maxCards; i++) {
            var _this$unlockedSkins$s;
            var card = this.skinSelectCards[i];
            var skinIndex = pageStart + i;
            var hasSkin = skinIndex < totalSkins;
            card.root.active = hasSkin;
            if (!hasSkin) {
              continue;
            }
            var row = Math.floor(skinIndex / this.skinGridCols);
            var visible = row >= this.skinSelectFirstVisibleRow && row < this.skinSelectFirstVisibleRow + this.skinSelectVisibleRows;
            card.root.active = visible;
            if (!visible) {
              continue;
            }
            var unlocked = (_this$unlockedSkins$s = this.unlockedSkins[skinIndex]) != null ? _this$unlockedSkins$s : false;
            var selected = skinIndex === this.selectedSkinIndex;
            var focused = skinIndex === safeFocusIndex;
            if (card.rootSprite) {
              card.rootSprite.spriteFrame = focused && this.skinSelectCardSelectedFrame ? this.skinSelectCardSelectedFrame : card.normalFrame;
            }
            card.root.setScale(focused ? 1.04 : 1, focused ? 1.04 : 1, 1);
            card.stateLabel.string = selected ? '已出场' : unlocked ? '出场' : '解锁';
            card.stateLabel.fontSize = 42;
            card.stateLabel.lineHeight = 48;
            if (card.portraitLabel) {
              card.portraitLabel.string = "\u76AE\u80A4\u5F62\u8C61" + (skinIndex + 1);
              card.portraitLabel.color = focused ? color(90, 109, 156, 255) : color(108, 126, 167, 240);
            }
            if (selected && this.skinSelectSelectedFrame) {
              card.stateButtonSprite.spriteFrame = this.skinSelectSelectedFrame;
              card.stateLabel.color = color(116, 84, 24, 255);
              card.stateLabel.isBold = true;
            } else if (unlocked && this.skinSelectAvailableFrame) {
              card.stateButtonSprite.spriteFrame = this.skinSelectAvailableFrame;
              card.stateLabel.color = color(107, 87, 36, 255);
              card.stateLabel.isBold = true;
            } else if (this.skinSelectLockedFrame) {
              card.stateButtonSprite.spriteFrame = this.skinSelectLockedFrame;
              card.stateLabel.color = color(120, 137, 174, 255);
              card.stateLabel.isBold = false;
            }
            card.stateButtonSprite.color = focused ? color(255, 255, 255, 255) : color(224, 230, 238, 235);
          }
        };
        _proto.getSkinSelectFirstVisibleRow = function getSkinSelectFirstVisibleRow() {
          var totalRows = Math.ceil(SNAKE_COLORS.length / Math.max(1, this.skinGridCols));
          var maxFirstRow = Math.max(0, totalRows - this.skinSelectVisibleRows);
          var focusedRow = Math.floor(this.focusSkinIndex / Math.max(1, this.skinGridCols));
          return Math.max(0, Math.min(maxFirstRow, focusedRow - 1));
        };
        _proto.redrawDeathButtons = function redrawDeathButtons(deathCountdown) {
          if (this.reviveDialogRoot) {
            this.redrawReviveDialog(deathCountdown);
            return;
          }
          var reviveEnabled = deathCountdown > 0;
          var labels = [reviveEnabled ? '免费复活' : '复活已过期', '返回'];
          var frames = ['button_continue', 'button_back'];
          for (var i = 0; i < this.deathButtons.length; i++) {
            var button = this.deathButtons[i];
            button.label.string = labels[i];
            button.label.fontSize = 30;
            button.label.lineHeight = 36;
            button.spriteFrameName = frames[i];
            button.iconNode.active = false;
            this.drawButton(button, i === this.deathFocusIndex, color(35, 53, 58, i === 0 && !reviveEnabled ? 125 : 230));
          }
        };
        _proto.redrawReviveDialog = function redrawReviveDialog(deathCountdown) {
          var reviveEnabled = deathCountdown > 0;
          this.updateReviveDialogCountdown(deathCountdown);
          if (!this.reviveButtonLabel || !this.backButtonLabel || !this.reviveButtonSprite || !this.backButtonSprite) {
            return;
          }
          this.reviveButtonLabel.string = reviveEnabled ? '免费复活' : '复活已过期';
          this.reviveButtonLabel.color = reviveEnabled ? color(204, 244, 255, 255) : color(152, 172, 196, 255);
          this.backButtonLabel.string = '返回';
          var reviveFocused = this.deathFocusIndex === 0;
          var backFocused = this.deathFocusIndex === 1;
          this.reviveButtonSprite.color = reviveEnabled ? reviveFocused ? color(255, 255, 255, 255) : color(218, 235, 255, 255) : color(168, 181, 204, 255);
          this.backButtonSprite.color = backFocused ? color(255, 255, 255, 255) : color(218, 235, 255, 255);
          this.reviveButtonSprite.spriteFrame = reviveFocused && this.reviveFocusedFrame ? this.reviveFocusedFrame : this.reviveButtonNormalFrame;
          this.backButtonSprite.spriteFrame = backFocused && this.backFocusedFrame ? this.backFocusedFrame : this.backButtonNormalFrame;
          this.reviveButtonSprite.node.setScale(reviveFocused ? 1.055 : 1, reviveFocused ? 1.055 : 1, 1);
          this.backButtonSprite.node.setScale(backFocused ? 1.055 : 1, backFocused ? 1.055 : 1, 1);
        };
        _proto.updateReviveDialogCountdown = function updateReviveDialogCountdown(deathCountdown) {
          if (!this.reviveCountdownLabel) {
            return;
          }
          var displayValue = Math.max(0, Math.ceil(deathCountdown));
          this.reviveCountdownLabel.string = "" + displayValue;
        };
        _proto.drawButton = function drawButton(button, focused, fillColor, alpha) {
          var _this$frames$get;
          if (alpha === void 0) {
            alpha = fillColor.a;
          }
          var g = button.graphics;
          var w = button.width;
          var h = button.height;
          var frameName = button.spriteFrameName;
          var frame = frameName ? (_this$frames$get = this.frames.get(frameName)) != null ? _this$frames$get : null : null;
          if (frame) {
            button.sprite.enabled = true;
            button.sprite.spriteFrame = frame;
            button.sprite.color = color(255, 255, 255, alpha);
            button.node.setScale(focused ? 1.055 : 1, focused ? 1.055 : 1, 1);
            g.clear();
            button.label.color = focused ? color(84, 58, 34, 255) : color(92, 75, 51, 255);
            button.label.isBold = focused;
            return;
          }
          button.sprite.enabled = false;
          button.node.setScale(focused ? 1.07 : 1, focused ? 1.07 : 1, 1);
          var radius = Math.max(8, Math.min(22, Math.floor(Math.min(w, h) * 0.2)));
          var base = color(fillColor.r, fillColor.g, fillColor.b, alpha);
          var top = this.mixColor(base, color(255, 255, 255, alpha), 0.26);
          var shadow = color(28, 35, 66, focused ? 92 : 62);
          g.clear();
          g.fillColor = shadow;
          g.roundRect(-w * 0.5 + 1, -h * 0.5 - 6, w, h, radius);
          g.fill();
          g.fillColor = base;
          g.roundRect(-w * 0.5, -h * 0.5, w, h, radius);
          g.fill();
          g.fillColor = top;
          g.roundRect(-w * 0.5 + 4, h * 0.02, w - 8, h * 0.4, Math.max(4, radius - 6));
          g.fill();
          g.lineWidth = focused ? 7 : 3;
          g.strokeColor = focused ? color(255, 242, 154, 255) : color(255, 255, 255, 170);
          g.roundRect(-w * 0.5, -h * 0.5, w, h, radius);
          g.stroke();
          button.label.color = focused ? color(48, 61, 88, 255) : color(62, 74, 97, 245);
          button.label.isBold = focused;
        };
        _proto.setButtonSize = function setButtonSize(button, width, height) {
          button.width = width;
          button.height = height;
          button.transform.setContentSize(width, height);
          button.spriteTransform.setContentSize(width, height);
          button.sprite.node.setPosition(0, 0, 0);
          button.labelTransform.setContentSize(Math.max(24, width - 24), Math.max(24, height - 10));
          button.label.node.setPosition(0, 0, 0);
          button.iconTransform.setContentSize(Math.min(width * 0.72, height * 0.58), Math.min(width * 0.72, height * 0.58));
          button.iconNode.setPosition(0, height * 0.12, 0);
        };
        _proto.setGroupActive = function setGroupActive(buttons, active) {
          for (var _iterator5 = _createForOfIteratorHelperLoose(buttons), _step5; !(_step5 = _iterator5()).done;) {
            var button = _step5.value;
            button.node.active = active;
          }
        };
        _proto.setMenuPrefabActive = function setMenuPrefabActive(active) {
          if (this.startMenuRoot) {
            this.startMenuRoot.active = active;
          }
        };
        _proto.setSkinSelectPrefabActive = function setSkinSelectPrefabActive(active) {
          if (this.skinSelectRoot) {
            this.skinSelectRoot.active = active;
          }
        };
        _proto.setReviveDialogActive = function setReviveDialogActive(active) {
          if (this.reviveDialogRoot) {
            this.reviveDialogRoot.active = active;
          }
        };
        _proto.createVolumeStateLabel = function createVolumeStateLabel(volumeButtonNode, layer) {
          var labelNode = new Node('VolumeStateLabel');
          labelNode.layer = layer;
          volumeButtonNode.addChild(labelNode);
          labelNode.setPosition(90, 0, 0);
          var transform = labelNode.addComponent(UITransform);
          transform.setContentSize(54, 44);
          var label = labelNode.addComponent(Label);
          label.fontSize = 28;
          label.lineHeight = 30;
          label.color = color(78, 104, 171, 255);
          label.horizontalAlign = Label.HorizontalAlign.CENTER;
          label.verticalAlign = Label.VerticalAlign.CENTER;
          label.overflow = Label.Overflow.SHRINK;
          label.string = '开';
          return label;
        };
        _proto.setHudActive = function setHudActive(active) {
          if (this.hudRoot) {
            this.hudRoot.active = active;
            return;
          }
          this.scoreLabel.node.active = active;
          if (this.rankLabel) {
            this.rankLabel.node.active = active;
          }
        };
        _proto.updateRankLabels = function updateRankLabels(state, snakes, savedScore) {
          var entries = this.createRankEntries(state, snakes, savedScore);
          if (this.rankItemLabels.length > 0) {
            for (var i = 0; i < this.rankItemLabels.length; i++) {
              var entry = entries[i];
              this.rankItemLabels[i].string = entry ? entry.name + ":" + entry.score : '';
            }
            return;
          }
          if (this.rankLabel) {
            this.rankLabel.string = ['排行榜'].concat(entries.map(function (entry, index) {
              return index + 1 + ". " + entry.name + "  " + entry.score;
            })).join('\n');
          }
        };
        _proto.createRankEntries = function createRankEntries(state, snakes, savedScore) {
          return snakes.filter(function (snake) {
            return !snake.dead || snake.isPlayer;
          }).map(function (snake) {
            return {
              name: snake.isPlayer ? '玩家' : snake.name,
              score: Math.floor(snake.isPlayer && state === GameState.Dead ? savedScore : snake.score)
            };
          }).sort(function (a, b) {
            return b.score - a.score;
          }).slice(0, 10);
        };
        _proto.redrawDecor = function redrawDecor() {
          var g = this.decorGraphics;
          g.clear();
          var size = view.getVisibleSize();
          var w = size.width;
          var h = size.height;
          if (this.screen === 'playing') {
            if (!this.hudRoot) {
              this.drawSoftPanel(g, -w * 0.5 + 34, h * 0.5 - 146, 520, 122, 34, color(255, 243, 197, 218));
              this.drawSoftPanel(g, w * 0.5 - 354, h * 0.5 - 338, 320, 314, 30, color(255, 248, 223, 220));
              this.drawSoftPanel(g, -w * 0.5 + 34, -h * 0.5 + 34, 430, 86, 28, color(230, 248, 255, 185));
            }
            return;
          }
          g.fillColor = color(255, 248, 218, 44);
          g.fillRect(-w * 0.5, -h * 0.5, w, h);
          var panelWidth = this.screen === 'skin' ? Math.min(w - 120, 1500) : Math.min(w - 160, 960);
          var panelHeight = this.screen === 'skin' ? Math.min(h - 128, 880) : Math.min(h - 180, 640);
          var px = -panelWidth * 0.5;
          var py = this.screen === 'skin' ? -panelHeight * 0.5 - 6 : -panelHeight * 0.5 - 34;
          this.drawSoftPanel(g, px, py, panelWidth, panelHeight, 42, color(255, 248, 223, 232));
          this.drawDecorBubble(g, -w * 0.36, h * 0.31, 28, color(255, 204, 223, 124));
          this.drawDecorBubble(g, -w * 0.29, h * 0.26, 14, color(255, 236, 188, 132));
          this.drawDecorBubble(g, w * 0.34, h * 0.22, 21, color(198, 232, 255, 128));
          this.drawDecorBubble(g, w * 0.28, -h * 0.22, 16, color(228, 214, 255, 124));
          this.drawDecorBubble(g, -w * 0.33, -h * 0.26, 18, color(198, 255, 218, 118));
        };
        _proto.drawSoftPanel = function drawSoftPanel(g, x, y, width, height, radius, fill) {
          g.fillColor = color(89, 111, 72, 46);
          g.roundRect(x + 8, y - 10, width, height, radius);
          g.fill();
          g.fillColor = fill;
          g.roundRect(x, y, width, height, radius);
          g.fill();
          g.lineWidth = 5;
          g.strokeColor = color(255, 255, 255, 218);
          g.roundRect(x, y, width, height, radius);
          g.stroke();
        };
        _proto.drawDecorBubble = function drawDecorBubble(g, x, y, radius, c) {
          g.fillColor = c;
          g.circle(x, y, radius);
          g.fill();
          g.fillColor = color(255, 255, 255, Math.min(220, c.a + 24));
          g.circle(x - radius * 0.26, y + radius * 0.24, Math.max(2, radius * 0.25));
          g.fill();
        };
        _proto.mixColor = function mixColor(a, b, t) {
          var clamped = Math.max(0, Math.min(1, t));
          return color(Math.round(a.r + (b.r - a.r) * clamped), Math.round(a.g + (b.g - a.g) * clamped), Math.round(a.b + (b.b - a.b) * clamped), Math.round(a.a + (b.a - a.a) * clamped));
        };
        return GameUI;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/GhostKingSystem.ts", ['cc', './GameConfig.ts', './GameMath.ts'], function (exports) {
  var cclegacy, CONFIG, normalize, distance, randomRange, clamp, directionFromAngle;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      CONFIG = module.CONFIG;
    }, function (module) {
      normalize = module.normalize;
      distance = module.distance;
      randomRange = module.randomRange;
      clamp = module.clamp;
      directionFromAngle = module.directionFromAngle;
    }],
    execute: function () {
      cclegacy._RF.push({}, "8d2e7ybn0JNLp7K/cHQKkEO", "GhostKingSystem", undefined);
      var GhostKingSystem = exports('GhostKingSystem', /*#__PURE__*/function () {
        function GhostKingSystem() {
          this.state = {
            active: false,
            position: {
              x: 0,
              y: 0
            },
            radius: CONFIG.ghostKingRadius,
            spawnIn: 0,
            activeTime: 0
          };
        }
        var _proto = GhostKingSystem.prototype;
        _proto.reset = function reset() {
          this.state.active = false;
          this.state.activeTime = 0;
          this.state.radius = CONFIG.ghostKingRadius;
          this.scheduleNextSpawn();
        };
        _proto.update = function update(dt, playerHead, canSpawn) {
          if (this.state.active) {
            this.state.activeTime = Math.max(0, this.state.activeTime - dt);
            if (this.state.activeTime <= 0) {
              this.state.active = false;
              this.scheduleNextSpawn();
              return;
            }
            var towardPlayer = normalize({
              x: playerHead.x - this.state.position.x,
              y: playerHead.y - this.state.position.y
            });
            this.state.position.x += towardPlayer.x * CONFIG.ghostKingSpeed * dt;
            this.state.position.y += towardPlayer.y * CONFIG.ghostKingSpeed * dt;
            this.keepInsideWorld();
            return;
          }
          if (!canSpawn) {
            return;
          }
          this.state.spawnIn = Math.max(0, this.state.spawnIn - dt);
          if (this.state.spawnIn <= 0) {
            this.spawnNearPlayer(playerHead);
          }
        };
        _proto.getState = function getState() {
          return this.state;
        };
        _proto.hasHeadCollision = function hasHeadCollision(head, headRadius) {
          return this.state.active && distance(head, this.state.position) <= headRadius + CONFIG.ghostKingHitRadius;
        };
        _proto.spawnNearPlayer = function spawnNearPlayer(playerHead) {
          var direction = directionFromAngle(randomRange(0, Math.PI * 2));
          var distanceFromPlayer = randomRange(CONFIG.ghostKingSpawnDistanceMin, CONFIG.ghostKingSpawnDistanceMax);
          this.state.position.x = playerHead.x + direction.x * distanceFromPlayer;
          this.state.position.y = playerHead.y + direction.y * distanceFromPlayer;
          this.state.active = true;
          this.state.activeTime = CONFIG.ghostKingDurationSeconds;
          this.keepInsideWorld();
        };
        _proto.scheduleNextSpawn = function scheduleNextSpawn() {
          this.state.spawnIn = randomRange(CONFIG.ghostKingSpawnDelayMin, CONFIG.ghostKingSpawnDelayMax);
        };
        _proto.keepInsideWorld = function keepInsideWorld() {
          var margin = CONFIG.ghostKingRadius + 72;
          var halfWidth = CONFIG.worldWidth * 0.5 - margin;
          var halfHeight = CONFIG.worldHeight * 0.5 - margin;
          this.state.position.x = clamp(this.state.position.x, -halfWidth, halfWidth);
          this.state.position.y = clamp(this.state.position.y, -halfHeight, halfHeight);
        };
        return GhostKingSystem;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/main", ['./BotAI.ts', './CollisionSystem.ts', './FoodSystem.ts', './GameBootstrap.ts', './GameConfig.ts', './GameMath.ts', './GameRenderer.ts', './GameTypes.ts', './GameUI.ts', './GhostKingSystem.ts', './SnakeActor.ts', './SnakeMovement.ts', './SpawnSystem.ts'], function () {
  return {
    setters: [null, null, null, null, null, null, null, null, null, null, null, null, null],
    execute: function () {}
  };
});

System.register("chunks:///_virtual/SnakeActor.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './GameConfig.ts'], function (exports) {
  var _createClass, cclegacy, CONFIG;
  return {
    setters: [function (module) {
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      CONFIG = module.CONFIG;
    }],
    execute: function () {
      cclegacy._RF.push({}, "75fddiNHCpE0oiw/QR90iIF", "SnakeActor", undefined);
      var SnakeActor = exports('SnakeActor', /*#__PURE__*/function () {
        function SnakeActor(id, name, isPlayer, color) {
          this.segments = [];
          this.direction = {
            x: 1,
            y: 0
          };
          this.targetDirection = {
            x: 1,
            y: 0
          };
          this.targetLength = CONFIG.initialLength;
          this.score = 0;
          this.growthBank = 0;
          this.radius = CONFIG.baseRadius;
          this.speed = CONFIG.baseSpeed;
          this.dead = false;
          this.invincibleTime = 0;
          this.magnetTime = 0;
          this.respawnIn = 0;
          this.aiDecisionIn = 0;
          this.id = id;
          this.name = name;
          this.isPlayer = isPlayer;
          this.color = color;
        }
        _createClass(SnakeActor, [{
          key: "head",
          get: function get() {
            var _this$segments$;
            return (_this$segments$ = this.segments[0]) != null ? _this$segments$ : {
              x: 0,
              y: 0
            };
          }
        }]);
        return SnakeActor;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/SnakeMovement.ts", ['cc', './GameConfig.ts', './GameMath.ts'], function (exports) {
  var cclegacy, CONFIG, getSnakeRadius, normalize, clamp, randomRange, rotateTowards, distance, copyPoint, lerpPoint;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      CONFIG = module.CONFIG;
      getSnakeRadius = module.getSnakeRadius;
    }, function (module) {
      normalize = module.normalize;
      clamp = module.clamp;
      randomRange = module.randomRange;
      rotateTowards = module.rotateTowards;
      distance = module.distance;
      copyPoint = module.copyPoint;
      lerpPoint = module.lerpPoint;
    }],
    execute: function () {
      cclegacy._RF.push({}, "6bd78L0WllNFZkmKh/f1TrG", "SnakeMovement", undefined);
      var SnakeMovement = exports('SnakeMovement', /*#__PURE__*/function () {
        function SnakeMovement() {}
        var _proto = SnakeMovement.prototype;
        _proto.resetSnake = function resetSnake(snake, head, direction, length) {
          snake.direction = normalize(direction);
          snake.targetDirection = normalize(direction);
          snake.targetLength = clamp(Math.round(length), CONFIG.initialLength, CONFIG.maxLength);
          snake.radius = getSnakeRadius(snake.targetLength);
          snake.dead = false;
          snake.respawnIn = 0;
          snake.aiDecisionIn = randomRange(0.2, 1.2);
          snake.segments.length = 0;
          var spacing = this.getSegmentSpacing(snake);
          for (var i = 0; i < snake.targetLength; i++) {
            snake.segments.push({
              x: head.x - snake.direction.x * spacing * i,
              y: head.y - snake.direction.y * spacing * i
            });
          }
        };
        _proto.steerSnake = function steerSnake(snake, dt, turnRate) {
          snake.direction = rotateTowards(snake.direction, snake.targetDirection, turnRate * dt);
        };
        _proto.moveSnake = function moveSnake(snake, dt) {
          var head = snake.head;
          var nextHead = {
            x: head.x + snake.direction.x * snake.speed * dt,
            y: head.y + snake.direction.y * snake.speed * dt
          };
          snake.radius = getSnakeRadius(snake.targetLength);
          var minTrailPointDistance = Math.max(4, snake.radius * 0.35);
          if (snake.segments.length > 1 && distance(nextHead, snake.segments[1]) < minTrailPointDistance) {
            snake.segments[0] = nextHead;
          } else {
            snake.segments.unshift(nextHead);
          }
          this.trimSnakeTrail(snake);
        };
        _proto.sampleSnakeBody = function sampleSnakeBody(snake) {
          var body = [];
          if (snake.segments.length === 0) {
            return body;
          }
          var spacing = this.getSegmentSpacing(snake);
          body.push(copyPoint(snake.segments[0]));
          var trailIndex = 1;
          var travelled = 0;
          for (var bodyIndex = 1; bodyIndex < snake.targetLength; bodyIndex++) {
            var targetDistance = spacing * bodyIndex;
            while (trailIndex < snake.segments.length) {
              var prev = snake.segments[trailIndex - 1];
              var current = snake.segments[trailIndex];
              var segmentLength = distance(prev, current);
              if (segmentLength <= 0.001) {
                trailIndex += 1;
                continue;
              }
              if (travelled + segmentLength >= targetDistance) {
                var ratio = (targetDistance - travelled) / segmentLength;
                body.push(lerpPoint(prev, current, clamp(ratio, 0, 1)));
                break;
              }
              travelled += segmentLength;
              trailIndex += 1;
            }
            if (body.length <= bodyIndex) {
              body.push(copyPoint(snake.segments[snake.segments.length - 1]));
            }
          }
          return body;
        };
        _proto.trimSnakeTrail = function trimSnakeTrail(snake) {
          var targetTrailLength = this.getSegmentSpacing(snake) * Math.max(0, snake.targetLength - 1);
          var travelled = 0;
          for (var i = 1; i < snake.segments.length; i++) {
            var prev = snake.segments[i - 1];
            var current = snake.segments[i];
            var segmentLength = distance(prev, current);
            if (segmentLength <= 0.001) {
              continue;
            }
            if (travelled + segmentLength >= targetTrailLength) {
              var ratio = (targetTrailLength - travelled) / segmentLength;
              snake.segments[i] = lerpPoint(prev, current, clamp(ratio, 0, 1));
              snake.segments.length = i + 1;
              return;
            }
            travelled += segmentLength;
          }
          var missingLength = targetTrailLength - travelled;
          if (missingLength <= 0.001 || snake.segments.length === 0) {
            return;
          }
          var tail = snake.segments[snake.segments.length - 1];
          var beforeTail = snake.segments[snake.segments.length - 2];
          var tailDirection = beforeTail ? normalize({
            x: tail.x - beforeTail.x,
            y: tail.y - beforeTail.y
          }) : normalize({
            x: -snake.direction.x,
            y: -snake.direction.y
          });
          snake.segments.push({
            x: tail.x + tailDirection.x * missingLength,
            y: tail.y + tailDirection.y * missingLength
          });
        };
        _proto.getSegmentSpacing = function getSegmentSpacing(snake) {
          return snake.radius * 0.96;
        };
        return SnakeMovement;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/SpawnSystem.ts", ['cc', './GameConfig.ts', './GameMath.ts', './SnakeActor.ts'], function (exports) {
  var cclegacy, CONFIG, SNAKE_COLORS, pickBotLength, randomRange, directionFromAngle, SnakeActor;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      CONFIG = module.CONFIG;
      SNAKE_COLORS = module.SNAKE_COLORS;
      pickBotLength = module.pickBotLength;
    }, function (module) {
      randomRange = module.randomRange;
      directionFromAngle = module.directionFromAngle;
    }, function (module) {
      SnakeActor = module.SnakeActor;
    }],
    execute: function () {
      cclegacy._RF.push({}, "722deWUZgNHG5nsohscAahZ", "SpawnSystem", undefined);
      var SpawnSystem = exports('SpawnSystem', /*#__PURE__*/function () {
        function SpawnSystem() {
          this.nextBotId = 1;
        }
        var _proto = SpawnSystem.prototype;
        _proto.reset = function reset() {
          this.nextBotId = 1;
        };
        _proto.maintainBotCount = function maintainBotCount(snakes, findSpawnPoint, resetSnake, getSpawnDirection) {
          var botCount = snakes.filter(function (snake) {
            return !snake.isPlayer;
          }).length;
          for (var i = botCount; i < CONFIG.botTargetCount; i++) {
            this.createBot(snakes, findSpawnPoint, resetSnake, getSpawnDirection);
          }
        };
        _proto.createBot = function createBot(snakes, findSpawnPoint, resetSnake, getSpawnDirection) {
          var colorIndex = this.nextBotId % SNAKE_COLORS.length;
          var bot = new SnakeActor(this.nextBotId, "\u5047\u86C7 " + this.nextBotId, false, SNAKE_COLORS[colorIndex]);
          this.nextBotId += 1;
          bot.speed = randomRange(CONFIG.botSpeedMin, CONFIG.botSpeedMax);
          this.respawnBot(bot, findSpawnPoint, resetSnake, getSpawnDirection);
          snakes.push(bot);
        };
        _proto.respawnBot = function respawnBot(bot, findSpawnPoint, resetSnake, getSpawnDirection) {
          var length = this.randomBotLength();
          var spawn = findSpawnPoint(650);
          var dir = getSpawnDirection ? getSpawnDirection(spawn) : this.randomDirection();
          resetSnake(bot, spawn, dir, length);
          bot.score = Math.max(0, Math.floor((length - CONFIG.initialLength) * randomRange(18, 75)));
          bot.growthBank = 0;
          bot.speed = randomRange(CONFIG.botSpeedMin, CONFIG.botSpeedMax);
        };
        _proto.findSpawnPoint = function findSpawnPoint(minDistanceFromPlayer, isSpawnPointSafe, isFallbackSafe) {
          var _fallback;
          var fallback = null;
          for (var i = 0; i < CONFIG.spawnOffscreenAttempts; i++) {
            var _candidate = this.randomWorldPoint(180);
            if (isSpawnPointSafe(_candidate, minDistanceFromPlayer)) {
              return _candidate;
            }
            if (!fallback && isFallbackSafe != null && isFallbackSafe(_candidate, minDistanceFromPlayer)) {
              fallback = _candidate;
            }
          }
          return (_fallback = fallback) != null ? _fallback : this.randomWorldPoint(180);
        };
        _proto.randomWorldPoint = function randomWorldPoint(margin) {
          return {
            x: randomRange(-CONFIG.worldWidth * 0.5 + margin, CONFIG.worldWidth * 0.5 - margin),
            y: randomRange(-CONFIG.worldHeight * 0.5 + margin, CONFIG.worldHeight * 0.5 - margin)
          };
        };
        _proto.randomDirection = function randomDirection() {
          return directionFromAngle(randomRange(0, Math.PI * 2));
        };
        _proto.randomBotLength = function randomBotLength() {
          return pickBotLength();
        };
        return SpawnSystem;
      }());
      cclegacy._RF.pop();
    }
  };
});

(function(r) {
  r('virtual:///prerequisite-imports/main', 'chunks:///_virtual/main'); 
})(function(mid, cid) {
    System.register(mid, [cid], function (_export, _context) {
    return {
        setters: [function(_m) {
            var _exportObj = {};

            for (var _key in _m) {
              if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _m[_key];
            }
      
            _export(_exportObj);
        }],
        execute: function () { }
    };
    });
});