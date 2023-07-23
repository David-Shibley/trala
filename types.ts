export interface Round {
  attempted_shots: Shot[];
  made_bonus_shots?: Shot[];
  made_shots: Shot[];
}

export interface ProcessedRound extends Round {
  goat: boolean;
  minusPoints: number;
  missedShots: Shot[];
}

export type Court = {
  [key in Shot]: number;
};

export type Shot =
  | "blue1"
  | "blue2"
  | "gray1"
  | "gray2"
  | "green1"
  | "red1"
  | "red2"
  | "yellow1";
