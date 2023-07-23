import {
  gameData,
  gameData20,
  gameWithHeatCheckFinalRound,
  gameWithHeatCheckNotFinalRound,
} from "./gameData";
import Scorecard from "./scoreboard";
import { Shot } from "./types";

describe("Scorecard", () => {
  describe("defaultData", () => {
    const scorecard = new Scorecard(gameData) as any;
    const expectedScore = [9, 21, 56, 68, 75, 75, 90, 100, 114, 129];
    const sampleRound = gameData[0];

    test("getScore", () => {
      expect(scorecard.getScore()).toEqual(expectedScore);
    });

    test("calculateGoat", () => {
      const failedGoat = scorecard.calculateGoat(sampleRound.made_shots);
      const successfulGoat = scorecard.calculateGoat(
        Object.keys((Scorecard as any).COURT) as Shot[]
      );
      expect(failedGoat).toBe(false);
      expect(successfulGoat).toBe(true);
    });

    test("getRoundScore", () => {
      const score = scorecard.getRoundScore(
        scorecard.processGameData([gameData[2]])[0],
        false
      );
      expect(score).toBe(35);
    });

    test("getRoundScore", () => {
      const score = scorecard.getRoundScore(
        scorecard.processGameData([gameData[2]])[0],
        true
      );
      expect(score).toBe(35);
    });

    test("getBonusScore", () => {
      const roundWithBonusShots = gameData[2];
      if (roundWithBonusShots.made_bonus_shots) {
        const bonusScore = scorecard.getBonusScore(
          roundWithBonusShots.made_bonus_shots,
          false,
          false
        );
        expect(bonusScore).toBe(36);
      }
    });

    test("getBonusScore", () => {
      const roundWithBonusShots = gameData[2];
      if (roundWithBonusShots.made_bonus_shots) {
        const bonusScore = scorecard.getBonusScore(
          roundWithBonusShots.made_bonus_shots,
          true,
          false
        );
        expect(bonusScore).toBe(24);
      }
    });

    test("getBonusScore", () => {
      const roundWithBonusShots = gameData[2];
      if (roundWithBonusShots.made_bonus_shots) {
        const bonusScore = scorecard.getBonusScore(
          roundWithBonusShots.made_bonus_shots,
          true,
          true
        );
        expect(bonusScore).toBe(12);
      }
    });
  });

  describe("game with 20 rounds", () => {
    const scorecard = new Scorecard(gameData20) as any;
    const expectedScore = [
      9, 21, 56, 68, 75, 75, 90, 100, 114, 129, 138, 150, 185, 197, 204, 204,
      219, 229, 243, 258,
    ];

    test("getScore", () => {
      expect(scorecard.getScore()).toEqual(expectedScore);
    });
  });

  describe("game with heat check final round", () => {
    const scorecard = new Scorecard(gameWithHeatCheckFinalRound) as any;
    const expectedScore = [9, 89];

    test("getScore", () => {
      expect(scorecard.getScore()).toEqual(expectedScore);
    });
  });

  describe("game with heat check final round", () => {
    const scorecard = new Scorecard(gameWithHeatCheckNotFinalRound) as any;
    const expectedScore = [9, 104, 113];

    test("getScore", () => {
      expect(scorecard.getScore()).toEqual(expectedScore);
    });
  });
});
