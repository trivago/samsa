export interface Message {
    key: string | Buffer;
    value: any;
    commit?: () => void;
}

export interface TopicConfig {
    topic: string;
    fromBeginning?: boolean;
    resumeAfter?: number;
    autoCommit?: boolean;
}
