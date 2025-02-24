interface Game {
    id: string;
    players: Player[];
    finished: boolean;
    round: number;
    wordsFilled: boolean;
    isPrivate: boolean;
    isFull: boolean;
}

interface Player {
    name: string;
    currentWord?: string;
    history?: string[]
}