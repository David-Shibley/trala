import { Court, ProcessedRound, Round, Shot } from "./types";

export default class Scorecard {
  private BONUS_SHOT_MULTIPLIER = 3;
  private FINAL_ROUND_BONUS_SHOT_MULTIPLIER = 2;
  private MAX_RED_SHOTS = 2;
  private scorecard: number[];
  private processedGameData: ProcessedRound[];
  public court: Court = {
    red1: 1,
    red2: 1,
    blue1: 2,
    blue2: 2,
    gray1: 3,
    gray2: 3,
    yellow1: 4,
    green1: 5,
  };
  constructor(gameData: Round[]) {
    this.processedGameData = this.processGameData(gameData);
    this.scorecard = this.generateScoreCard(this.processedGameData);
  }

  getProcessedGameData(): ProcessedRound[] {
    return this, this.processedGameData;
  }

  getScore(): number[] {
    return this.scorecard;
  }

  calculateGoat(shots: Shot[]) {
    const everyPossibleShot = Object.keys(this.court);
    return everyPossibleShot.every((shot) => shots.includes(shot as Shot));
  }

  getBonusScore(shots: Shot[], finalRound: boolean, goat: boolean): number {
    let multiplier = 1;
    if (!goat && finalRound) {
      multiplier = this.FINAL_ROUND_BONUS_SHOT_MULTIPLIER;
    } else if (!goat) {
      multiplier = this.BONUS_SHOT_MULTIPLIER;
    }
    return (
      multiplier *
      shots.reduce((totalScore, shot) => {
        totalScore += this.court[shot];
        return totalScore;
      }, 0)
    );
  }

  getRoundScore(round: ProcessedRound, finalRound: boolean): number {
    let maxRedScores = this.MAX_RED_SHOTS;
    let totalScore = 0;

    round.made_shots.forEach((shot) => {
      if (maxRedScores < 0) {
        totalScore = maxRedScores;
      } else if (shot === "red1" || shot === "red2") {
        maxRedScores--;
        totalScore++;
        if (maxRedScores < 0) totalScore = 0;
      } else {
        const score = this.court[shot];
        totalScore += score;
      }
    });

    if (finalRound) {
      const averageRoundScore =
        totalScore / (this.processedGameData.length - 1);
      if ((averageRoundScore >= 30 || round.goat) && round.made_bonus_shots) {
        totalScore += this.getBonusScore(
          round.made_bonus_shots,
          finalRound,
          round.goat
        );
      }
    } else {
      if ((totalScore >= 45 || round.goat) && round.made_bonus_shots) {
        totalScore += this.getBonusScore(
          round.made_bonus_shots,
          finalRound,
          round.goat
        );
      }
    }

    return totalScore - round.minusPoints;
  }

  generateScoreCard(gameData: ProcessedRound[]): number[] {
    let totalScore = 0;

    return gameData.map((round, index) => {
      totalScore += this.getRoundScore(round, !(index < gameData.length - 1));
      return totalScore;
    });
  }

  processGameData(gameData: Round[]): ProcessedRound[] {
    return gameData.map((round) => {
      let minusPoints = 0;
      const missedShots = round.attempted_shots.filter(
        (attemptedShot, index) => {
          const missedShot = round.made_shots.indexOf(attemptedShot) < 0;
          const finalRound = index >= round.attempted_shots.length;
          if (
            !finalRound &&
            missedShot &&
            ["red1", "red2"].includes(attemptedShot)
          )
            minusPoints += 2;
          return missedShot;
        }
      );
      const goat = this.calculateGoat(round.made_shots);

      return { ...round, goat, minusPoints, missedShots };
    });
  }
}
