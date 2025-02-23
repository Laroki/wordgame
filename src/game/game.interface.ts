interface Game {
    id: string;
    players: Player[];
    finished: boolean;
    round: number;
    wordsFilled: boolean;
}

interface Player {
    name: string;
    currentWord?: string;
    history?: string[]
}