import { Court, ProcessedRound, Round, Shot } from "./types";

/**
 * Immutable Class
 * */
export default class Scorecard {
  private static readonly BONUS_SHOT_MULTIPLIER = 3;
  private static readonly COURT: Court = {
    red1: 1,
    red2: 1,
    blue1: 2,
    blue2: 2,
    gray1: 3,
    gray2: 3,
    yellow1: 4,
    green1: 5,
  };
  private static readonly FINAL_ROUND_BONUS_SHOT_MULTIPLIER = 2;
  private static readonly FINAL_ROUND_AVERAGE_SCORE_LIMIT = 30;
  private static readonly MAX_RED_SHOTS = 2;
  private static readonly POSSIBLE_RED_SHOTS: Shot[] = ["red1", "red2"];
  private static readonly REGULAR_ROUND_AVERAGE_SCORE_LIMIT = 45;
  private readonly scorecard: number[];
  private readonly processedGameData: ProcessedRound[];

  constructor(gameData: Round[]) {
    this.processedGameData = this.processGameData(gameData);
    this.scorecard = this.generateScoreCard(this.processedGameData);
  }

  private getProcessedGameData(): ProcessedRound[] {
    return this.processedGameData;
  }

  private getScore(): number[] {
    return this.scorecard;
  }

  private calculateGoat(shots: Shot[]): boolean {
    const everyPossibleShot = Object.keys(Scorecard.COURT) as Shot[];
    return everyPossibleShot.every((shot: Shot) =>
      shots.includes(shot as Shot)
    );
  }

  private calculateBonusScore(
    shots: Shot[],
    finalRound: boolean,
    goat: boolean
  ): number {
    let multiplier = 1;
    if (!goat && finalRound) {
      multiplier = Scorecard.FINAL_ROUND_BONUS_SHOT_MULTIPLIER;
    } else if (!goat) {
      multiplier = Scorecard.BONUS_SHOT_MULTIPLIER;
    }
    return (
      multiplier *
      shots.reduce((totalScore: number, shot: Shot) => {
        totalScore += Scorecard.COURT[shot];
        return totalScore;
      }, 0)
    );
  }

  private calculateRoundScore(
    round: ProcessedRound,
    finalRound: boolean
  ): number {
    let maxRedScores = Scorecard.MAX_RED_SHOTS;
    let totalScore = 0;

    round.made_shots.forEach((shot: Shot) => {
      if (maxRedScores < 0) {
        totalScore = maxRedScores;
      } else if (Scorecard.POSSIBLE_RED_SHOTS.includes(shot)) {
        maxRedScores--;
        totalScore++;
        if (maxRedScores < 0) totalScore = 0;
      } else {
        const score = Scorecard.COURT[shot];
        totalScore += score;
      }
    });

    if (finalRound) {
      const averageRoundScore =
        totalScore / (this.processedGameData.length - 1);
      if (
        (averageRoundScore >= Scorecard.FINAL_ROUND_AVERAGE_SCORE_LIMIT ||
          round.goat) &&
        round.made_bonus_shots
      ) {
        totalScore += this.calculateBonusScore(
          round.made_bonus_shots,
          finalRound,
          round.goat
        );
      }
    } else {
      if (
        (totalScore >= Scorecard.REGULAR_ROUND_AVERAGE_SCORE_LIMIT ||
          round.goat) &&
        round.made_bonus_shots
      ) {
        totalScore += this.calculateBonusScore(
          round.made_bonus_shots,
          finalRound,
          round.goat
        );
      }
    }

    return totalScore - round.minusPoints;
  }

  private generateScoreCard(gameData: ProcessedRound[]): number[] {
    let totalScore = 0;

    return gameData.map((round: ProcessedRound, index: number) => {
      totalScore += this.calculateRoundScore(
        round,
        !(index < gameData.length - 1)
      );
      return totalScore;
    });
  }

  private processGameData(gameData: Round[]): ProcessedRound[] {
    return gameData.map((round: Round) => {
      let minusPoints = 0;
      const missedShots = round.attempted_shots.filter(
        (attemptedShot: Shot, index: number) => {
          const missedShot = round.made_shots.indexOf(attemptedShot) < 0;
          const finalRound = index >= round.attempted_shots.length;
          if (
            !finalRound &&
            missedShot &&
            Scorecard.POSSIBLE_RED_SHOTS.includes(attemptedShot)
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
